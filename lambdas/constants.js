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
              "codepipeline:ListTagsForResource",
              "ds:ListTagsForResource",
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
              "glacier:DescribeJob",
              "glacier:GetDataRetrievalPolicy",
              "glacier:GetJobOutput",
              "glacier:GetVaultNotifications",
              "glacier:ListJobs",
              "glacier:ListTagsForVault",
              "logs:FilterLogEvents",
              "ram:GetResourceShares",
              "ram:ListResources",
              "s3:GetIntelligentTieringConfiguration",
              "servicecatalog:DescribePortfolio",
              "servicecatalog:DescribeProductAsAdmin",
              "servicecatalog:DescribeProvisioningArtifact",
              "servicecatalog:DescribeServiceAction",
              "servicecatalog:SearchProductsAsAdmin",
              "sns:GetSubscriptionAttributes",
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