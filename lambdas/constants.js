'use strict';

const ReadOnlyPolicyName = 'UptycsReadOnlyPolicy';
const ReadOnlyPolicy = `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "aoss:BatchGet*"
              "aoss:Get*",
              "aoss:List*",
              "apigateway:GET",
              "bedrock:Get*",
              "bedrock:List*",
              "ce:GetCostAndUsage",
              "codecommit:GetCommit",
              "codepipeline:ListTagsForResource",
              "ds:ListTagsForResource",
              "docdb-elastic:Get*",
              "docdb-elastic:List*",
              "ec2:SearchTransitGatewayRoutes",
              "eks:DescribeAddon",
              "eks:DescribeFargateProfile",
              "eks:DescribeIdentityProviderConfig",
              "eks:DescribeNodegroup",
              "eks:DescribeUpdate",
              "eks:ListAddons",
              "eks:ListFargateProfiles",
              "eks:ListIdentityProviderConfigs",
              "eks:ListNodegroups",
              "eks:ListTagsForResource",
              "eks:ListUpdates",
              "elasticfilesystem:DescribeFileSystemPolicy",
              "glacier:DescribeJob",
              "glacier:GetDataRetrievalPolicy",
              "glacier:GetJobOutput",
              "glacier:GetVaultNotifications",
              "glacier:ListJobs",
              "glacier:ListTagsForVault",
              "lambda:GetCodeSigningConfig",
              "lambda:GetFunctionCodeSigningConfig",
              "logs:FilterLogEvents",
              "macie2:Describe*",
              "macie2:Get*",
              "macie2:List*",
              "ram:GetResourceShares",
              "ram:ListResources",
              "redshift-serverless:List*",
              "s3:GetIntelligentTieringConfiguration",
              "s3:ListBucketVersions",
              "servicecatalog:DescribePortfolio",
              "servicecatalog:DescribeProductAsAdmin",
              "servicecatalog:DescribeProvisioningArtifact",
              "servicecatalog:DescribeServiceAction",
              "servicecatalog:SearchProductsAsAdmin",
              "sns:GetSubscriptionAttributes",
              "ssm:ListCommandInvocations",
              "ssm:ListCommandInvocations",
              "sso:List*",
              "sso:Describe*",
              "sso:Get*"
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