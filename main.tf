data "aws_s3_bucket" "vpc_log_bucket_arn" {
  count  = var.vpc_flowlogs_bucket_name != "" ? 1 : 0
  bucket = var.vpc_flowlogs_bucket_name
}

data "aws_s3_bucket" "cloudtrail_log_bucket_arn" {
  count  = var.cloudtrail_s3_bucket_name != "" ? 1 : 0
  bucket = var.cloudtrail_s3_bucket_name
}

data "aws_kinesis_stream" "kinesis_stream_arn" {
  count = var.kinesis_stream_name != "" ? 1 : 0
  name  = var.kinesis_stream_name
}

locals {
  cloudtrail_log_bucket_arn = var.cloudtrail_s3_bucket_name != "" ? data.aws_s3_bucket.cloudtrail_log_bucket_arn[0].arn : null
  vpc_log_bucket_arn        = var.vpc_flowlogs_bucket_name != ""  ? data.aws_s3_bucket.vpc_log_bucket_arn[0].arn : null
  kinesis_stream_arn        = var.kinesis_stream_name != "" ? data.aws_kinesis_stream.kinesis_stream_arn[0].arn : null
}
resource "aws_iam_role" "role" {
  name = var.integration_name
  
  path = "/"
  inline_policy {
    name = "UptycsReadOnlyPolicy"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action   = [
              "apigateway:GET",
              "codebuild:ListProjects",
              "codecommit:GetBranch",
              "codecommit:GetCommit",
              "codecommit:GetRepository",
              "codepipeline:GetPipeline",
              "codepipeline:ListTagsForResource",
              "ds:ListTagsForResource",
              "ec2:DescribeAccountAttributes",
              "ec2:GetEbsEncryptionByDefault",
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
          ]
          Effect   = "Allow"
          Resource = "*"
        },
      ]
    })
  }
  assume_role_policy = <<EOF
{
	"Version": "2012-10-17",
	"Statement": [{
		"Action": "sts:AssumeRole",
		"Principal": {
			"AWS": "${var.upt_account_id}"
		},
		"Condition": {
			"StringEquals": {
				"sts:ExternalId": "${var.external_id}"
			}
		},
		"Effect": "Allow",
		"Sid": ""
	}]
}
EOF

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "viewaccesspolicy_attach" {
  policy_arn = "arn:aws:iam::aws:policy/job-function/ViewOnlyAccess"
  role       = aws_iam_role.role.name

}

resource "aws_iam_role_policy_attachment" "securityauditpolicy_attach" {
  policy_arn = "arn:aws:iam::aws:policy/SecurityAudit"
  role       = aws_iam_role.role.name

}

resource "aws_iam_role_policy_attachment" "cloudtrail_bucket_policy_attach" {
  # Only required when customer wants to  attach the bucket for cloudtrail logs
  count      = local.cloudtrail_log_bucket_arn != null ? 1 : 0
  role       = aws_iam_role.role.name
  policy_arn = aws_iam_policy.cloud_trail_bucketPolicy[0].arn

}

resource "aws_iam_policy" "cloud_trail_bucketPolicy" {
  #  Only required when customer wants to  attach the bucket for cloudtrail logs
  count       = local.cloudtrail_log_bucket_arn != null ? 1 : 0
  name        = "${var.integration_name}-CloudtrailBucketPolicy"
  description = "Cloudtrail Bucket Policy "
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [ "s3:GetObject" ],
            "Resource": [ "${local.cloudtrail_log_bucket_arn}/*" ]
        }
    ]
}
EOF

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "VpcFlowLogBucketPolicy_attach" {
  # Only required when customer wants to  attach the bucket for vpc flow logs
  count      = local.vpc_log_bucket_arn != null ? 1 : 0
  role       = aws_iam_role.role.name
  policy_arn = aws_iam_policy.VpcFlowLogBucketPolicy[0].arn

}

resource "aws_iam_policy" "VpcFlowLogBucketPolicy" {
  # Only required when customer wants to  attach the bucket for vpc flow logs
  count       = local.vpc_log_bucket_arn != null ? 1 : 0
  name        = "${var.integration_name}-VpcFlowLogBucketPolicy"
  description = "Vpc Flow Log Bucket Policy "
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [ "s3:GetObject" ],
            "Resource": [ "${local.vpc_log_bucket_arn}/*" ]
        }
    ]
}
EOF

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "kinesis_stream_policy_attach" {
  # Only required when customer wants to  attach the kinesis stream for cloudtrail logs
  count      = local.kinesis_stream_arn != null ? 1 : 0
  role       = aws_iam_role.role.name
  policy_arn = aws_iam_policy.kinesis_stream_policy[0].arn

}

resource "aws_iam_policy" "kinesis_stream_policy" {
  # Only required when customer wants to  attach the kinesis stream for cloudtrail logs
  count       = local.kinesis_stream_arn != null ? 1 : 0
  name        = "${var.integration_name}-KinesisDataStreamPolicy"
  description = "Kinesis Stream Policy "
  policy      = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [ 
              "kinesis:GetShardIterator", 
              "kinesis:GetRecords"
            ],
            "Resource": [ "${local.kinesis_stream_arn}" ]
        }
    ]
}
EOF

  tags = var.tags
}