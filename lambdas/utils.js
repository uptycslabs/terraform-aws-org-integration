'use strict';

const { IAMClient, CreateRoleCommand, GetRoleCommand, DeleteRoleCommand } = require('@aws-sdk/client-iam');
const { STSClient, AssumeRoleCommand } = require('@aws-sdk/client-sts');
const { PutRolePolicyCommand, DeleteRolePolicyCommand,  } = require('@aws-sdk/client-iam');
const { AttachRolePolicyCommand, DetachRolePolicyCommand, CreatePolicyCommand, DeletePolicyCommand, ListAttachedRolePoliciesCommand} = require('@aws-sdk/client-iam');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const constants = require('./constants');

// AssumeRole policy
function assumeRolePolicy(uptAccountId, externalId) {
  return `{
    "Version": "2012-10-17",
    "Statement": [
        {
          "Effect": "Allow",
          "Principal": {
              "AWS": "arn:aws:iam::${uptAccountId}:root"
          },
          "Action": "sts:AssumeRole",
          "Condition": {
            "StringEquals": {
                "sts:ExternalId": "${externalId}"
            }
          }
        }
    ]
  }`;
}

function bucketPolicy(bucketName) {
  return `{
    "Statement": [
        {
            "Action": [
                "s3:GetObject"
            ],
            "Effect": "Allow",
            "Resource": [
                "arn:aws:s3:::${bucketName}/*"
            ]
        }
    ],
    "Version": "2012-10-17"
}`
}


async function getStsCreds(sts, accountId) {
  const roleToAssume = {
    RoleArn: `arn:aws:iam::${accountId}:role/OrganizationAccountAccessRole`,
    RoleSessionName: 'uptycs',
    DurationSeconds: 3600
  };

  //Assume Role
  try {
    const cred = await sts.send(new AssumeRoleCommand(roleToAssume));
    return {
      accessKeyId: cred.Credentials.AccessKeyId,
      secretAccessKey: cred.Credentials.SecretAccessKey,
      sessionToken: cred.Credentials.SessionToken
    };
  } catch (err) {
    throw err;
  }
}

async function stsCreds(childAccountId) {
  const stsClient = new STSClient();
  const creds = await getStsCreds(stsClient, childAccountId);
  return creds;
}

async function iamClient(stsCreds, region) {
  const iam = new IAMClient({
    region,
    credentials: stsCreds
  });
  return iam;
}

async function sqsClient(region) {
  const sqs = new SQSClient({
    region
  });
  return sqs;
}

async function createIntegrationRole(iamClient, integrationName, uptAccountId, externalId) {
  try {
    // Set the parameters
    const params = {
      AssumeRolePolicyDocument: assumeRolePolicy(uptAccountId, externalId),
      Path: '/',
      RoleName: integrationName
    };
    await iamClient.send(new CreateRoleCommand(params));
  } catch (err) {
    throw err;
  }
}

async function deleteIntegrationRole(iamClient, integrationName) {
  try {
    // Set the parameters
    const params = {
      RoleName: integrationName
    };
    await iamClient.send(new DeleteRoleCommand(params));
    console.log(`Deleted integration role ${integrationName}`);
  } catch (err) {
    console.log(`Failed to delete integration role ${integrationName}`, err);
  }
}

async function integrationRoleExists(iamClient, integrationName) {
  try {
    // Set the parameters
    const params = {
      RoleName: integrationName
    };
    await iamClient.send(new GetRoleCommand(params));
    return true;
  } catch (err) {
    return false;
  }
}

async function attachPoliciesToRole(iamClient, integrationName, AccountId, CloudTrailBucketName) {
  await createReadOnlyInlinePolicy(iamClient, integrationName);
  await attachPolicyToRole(iamClient, integrationName, constants.ViewOnlyAccessArn);
  await attachPolicyToRole(iamClient, integrationName, constants.SecurityAuditArn);
  if (CloudTrailBucketName !== '') {
    await attachBucketPolicy(iamClient, integrationName, AccountId, CloudTrailBucketName,'CloudtrailBucketPolicy')
  }
}

async function attachBucketPolicy(iamClient, IntegrationName, AccountId, BucketName,suffix) {
  await createBucketPolicy(iamClient, IntegrationName, BucketName, suffix)
  const policyArn = `arn:aws:iam::${AccountId}:policy/${IntegrationName}-${suffix}`
  await attachPolicyToRole(iamClient,IntegrationName,policyArn)
}



async function detachPoliciesFromRole(iamClient, integrationName) {
  await deleteReadOnlyInlinePolicy(iamClient, integrationName);
  const policies = await ListRolePolicies(iamClient, integrationName);
  if (policies) {
    for (let i = 0; i < policies.length; i++) {
      const policyArn = policies[i].PolicyArn
      await detachPolicyFromRole(iamClient, integrationName, policyArn);
      if (policyArn.includes(integrationName)) {
        await deletePolicy(iamClient, policyArn)
      }
    }
  }
}

async function ListRolePolicies(iamClient, integrationName) {
  
  try {
    const params = {
      RoleName: integrationName
    }
    const response = await iamClient.send(new ListAttachedRolePoliciesCommand(params));
    return response.AttachedPolicies;
  } catch (err) {
    console.log(`Failed to get policies for the role ${integrationName}`, err);
    return null;
  }
}

async function createReadOnlyInlinePolicy(iamClient, integrationName) {
  try {
    // Set the parameters
    const params = {
      RoleName: integrationName,
      PolicyName: constants.ReadOnlyPolicyName,
      PolicyDocument: constants.ReadOnlyPolicy
    };
    await iamClient.send(new PutRolePolicyCommand(params));
  } catch (err) {
    throw err;
  }
}

async function createBucketPolicy(iamClient, IntegrationName,BucketName,suffix) {
  try {
    const params = {
      PolicyName: IntegrationName + '-'+suffix,
      PolicyDocument: bucketPolicy(BucketName),
    }
    await iamClient.send(new CreatePolicyCommand(params));
  }catch (err) {
    console.log(`Failed to create a bucket policy for bucket ${BucketName}`,err)
  }
}

async function deleteReadOnlyInlinePolicy(iamClient, integrationName) {
  try {
    // Set the parameters
    const params = {
      RoleName: integrationName,
      PolicyName: constants.ReadOnlyPolicyName
    };
    await iamClient.send(new DeleteRolePolicyCommand(params));
  } catch (err) {
    console.log(`Failed to delete inline policy ${constants.ReadOnlyPolicyName} from role ${integrationName}`, err);
  }
}

async function deletePolicy(iamClient, policyArn) {
  try {
    const params = {
      PolicyArn : policyArn,
    }
    await iamClient.send(new DeletePolicyCommand(params));
  } catch (err) {
    console.log(`Failed to delete managed policy ${policyArn}`, err);
  }
}

async function attachPolicyToRole(iamClient, integrationName, policyArn) {
  try {
    // Set the parameters
    const params = {
      RoleName: integrationName,
      PolicyArn: policyArn
    };
    await iamClient.send(new AttachRolePolicyCommand(params));
  } catch (err) {
    throw err;
  }
}

async function detachPolicyFromRole(iamClient, integrationName, policyArn) {
  try {
    // Set the parameters
    const params = {
      RoleName: integrationName,
      PolicyArn: policyArn
    };
    await iamClient.send(new DetachRolePolicyCommand(params));
  } catch (err) {
    console.log(`Failed to detach Policy ${policyArn} from role ${integrationName}`, err);
  }
}

function queueUrlFromArn(arn, integrationName) {
  const splits = arn.split(':');
  if (splits && splits.length === 6 && splits[4].length !== 0) {
    return `https://queue.amazonaws.com/${splits[4]}/${integrationName}-response`;
  }
  // failed to get correct url
  return arn;
}

async function sendResponse(sqsClient, sourceArn, integrationName, msg) {
  const queueUrl = queueUrlFromArn(sourceArn, integrationName);
  try {
    // Set the parameters
    const params = {
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(msg, null, 2)
    };
    await sqsClient.send(new SendMessageCommand(params));
  } catch (err) {
    console.log(`Failed to send respose message to ${queueUrl}`, err);
  }
}

module.exports = {
  stsCreds,
  iamClient,
  sqsClient,
  createIntegrationRole,
  deleteIntegrationRole,
  integrationRoleExists,
  attachPoliciesToRole,
  detachPoliciesFromRole,
  sendResponse
};