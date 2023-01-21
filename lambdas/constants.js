'use strict';

const ReadOnlyPolicyName = 'UptycsReadOnlyPolicy';
const ReadOnlyPolicy = `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "apigateway:GET",
              "codecommit:GetCommit",
              "codecommit:GetRepository",
              "codecommit:GetBranch",
              "codepipeline:ListTagsForResource",
              "codepipeline:GetPipeline",
              "ds:ListTagsForResource",
              "eks:ListNodegroups",
              "eks:DescribeFargateProfile",
              "eks:ListTagsForResource",
              "eks:ListAddons",
              "eks:DescribeAddon",
              "eks:ListFargateProfiles",
              "eks:DescribeNodegroup",
              "eks:DescribeIdentityProviderConfig",
              "eks:ListUpdates",
              "eks:DescribeUpdate",
              "eks:DescribeCluster",
              "eks:ListClusters",
              "eks:ListIdentityProviderConfigs",
              "elasticache:ListTagsForResource",
              "es:ListTags",
              "glacier:GetDataRetrievalPolicy",
              "glacier:ListJobs",
              "glacier:GetVaultAccessPolicy",
              "glacier:ListTagsForVault",
              "glacier:DescribeVault",
              "glacier:GetJobOutput",
              "glacier:GetVaultLock",
              "glacier:ListVaults",
              "glacier:GetVaultNotifications",
              "glacier:DescribeJob",
              "kinesis:DescribeStream",
              "logs:FilterLogEvents",
              "ram:ListResources",
              "ram:GetResourceShares",
              "secretsmanager:DescribeSecret",
              "servicecatalog:SearchProductsAsAdmin",
              "servicecatalog:DescribeProductAsAdmin",
              "servicecatalog:DescribePortfolio",
              "servicecatalog:DescribeServiceAction",
              "servicecatalog:DescribeProvisioningArtifact",
              "sns:ListTagsForResource",
              "sns:ListSubscriptionsByTopic",
              "sns:GetTopicAttributes",
              "sns:ListTopics",
              "sns:GetSubscriptionAttributes",
              "sqs:GetQueueUrl",
              "sqs:ListQueues",
              "sqs:GetQueueAttributes",
              "sqs:ListQueueTags",
              "ssm:ListCommandInvocations"
            ],
            "Resource": "*"
        }
    ]
}`;

const ViewOnlyAccessArn = 'arn:aws:iam::aws:policy/job-function/ViewOnlyAccess';
const SecurityAuditArn = 'arn:aws:iam::aws:policy/SecurityAudit';

module.exports = {
    ReadOnlyPolicyName,
    ReadOnlyPolicy,
    ViewOnlyAccessArn,
    SecurityAuditArn
};