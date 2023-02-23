'use strict';

const ReadOnlyPolicyName = 'UptycsReadOnlyPolicy';
const ReadOnlyPolicy = `{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
              "apigateway:GET",
              "codebuild:BatchGetProjects",
              "codebuild:ListProjects",
              "codecommit:GetBranch",
              "codecommit:GetCommit",
              "codecommit:GetRepository",
              "codepipeline:GetPipeline",
              "codepipeline:ListTagsForResource",
              "ds:ListTagsForResource",
              "ec2:DescribeAccountAttributes",
              "ec2:GetEbsEncryptionByDefault",
              "ec2:SearchTransitGatewayRoutes",
              "eks:DescribeAddon",
              "eks:DescribeCluster",
              "eks:DescribeFargateProfile",
              "eks:DescribeIdentityProviderConfig",
              "eks:DescribeNodegroup",
              "eks:DescribeUpdate",
              "eks:ListAddons",
              "eks:ListClusters",
              "eks:ListFargateProfiles",
              "eks:ListIdentityProviderConfigs",
              "eks:ListNodegroups",
              "eks:ListTagsForResource",
              "eks:ListUpdates",
              "elasticache:ListTagsForResource",
              "es:ListTags",
              "glacier:DescribeJob",
              "glacier:DescribeVault",
              "glacier:GetDataRetrievalPolicy",
              "glacier:GetJobOutput",
              "glacier:GetVaultAccessPolicy",
              "glacier:GetVaultLock",
              "glacier:GetVaultNotifications",
              "glacier:ListJobs",
              "glacier:ListTagsForVault",
              "glacier:ListVaults",
              "kinesis:DescribeStream",
              "logs:FilterLogEvents",
              "ram:GetResourceShares",
              "ram:ListResources",
              "s3:GetIntelligentTieringConfiguration",
              "secretsmanager:DescribeSecret",
              "servicecatalog:DescribePortfolio",
              "servicecatalog:DescribeProductAsAdmin",
              "servicecatalog:DescribeProvisioningArtifact",
              "servicecatalog:DescribeServiceAction",
              "servicecatalog:SearchProductsAsAdmin",
              "sns:GetSubscriptionAttributes",
              "sns:GetTopicAttributes",
              "sns:ListSubscriptionsByTopic",
              "sns:ListTagsForResource",
              "sns:ListTopics",
              "sqs:GetQueueAttributes",
              "sqs:ListQueueTags",
              "sqs:ListQueues",
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