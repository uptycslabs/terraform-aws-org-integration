# Terraform AWS IAM role module

- This module allows you to integrate AWS master account and any child account with Uptycs.
- This module will create an IAM Role in each account. The role has following policies attached:
  - policy/job-function/ViewOnlyAccess
  - policy/SecurityAudit
  - Custom read only policy access for required resources

## 1. Create a <file.tf> file, paste below codes and modify as needed.

```
module "iam-config" {
  source           = "github.com/uptycslabs/terraform-aws-org-integration"

  # Modify as you need, this will be used as a prefix to naming the resources
  integration_name = "UptycsIntegration"

  # Copy the AWS Account ID from Uptycs' UI
  # Uptycs' UI : "Cloud"->"AWS"->"Integrations"->"ACCOUNT INTEGRATION"
  upt_account_id = "123456789101"

  # Account Id of the organizattion's master account
  aws_account_id = "987654321098"

  # Copy the UUID4 from Uptycs' UI
  # Uptycs' UI : "Cloud"->"AWS"->"Integrations"->"ACCOUNT INTEGRATION"
  # You can generate your own UUID. If you do, make sure Uptycs' UI is updated with it
  external_id = "465308b9-fadb-449b-8d2d-3b5b3f2457f9"

  # CloudTrail source: S3 Bucket or Kinesis stream?
  # Set either `cloudtrail_s3_bucket_name` or `kinesis_stream_name` to allow Uptycs to ingest CloudTrail events
  # Provide the S3 bucket name which contains the CloudTrail data
  cloudtrail_s3_bucket_name = ""

  # Name of the Kinesis stream configured to stream CloudTrail data
  kinesis_stream_name = ""

  # Name of the S3 bucket that contains the VPC flow logs
  vpc_flowlogs_bucket_name = ""

  tags = {
    Service = "cloudquery"
  }
}

output "aws_parameters" {
  value = module.iam-config.aws_parameters
}

```

## 2. Set Profile and Region before execute terraform

```sh
export AWS_PROFILE="< profile name >"
export AWS_DEFAULT_REGION="< pass region >"
```

## 3. Execute Terraform script

```sh
$ terraform init
$ terraform plan
$ terraform apply
```

## Inputs


| Name                      | Description                                                     | Type     | Default             | Required |
| --------------------------- | ----------------------------------------------------------------- | ---------- | --------------------- | ---------- |
| integration_name          | Prefix to be used for naming new resources                      | `string` | `UptycsIntegration` |          |
| upt_account_id            | Uptycs AWS account ID                                           | `string` | `""`                | Yes      |
| aws_account_id            | AWS organization's master account ID                            | `string` | `""`                | Yes      |
| external_id               | Role external ID provided by Uptycs                             | `string` | `""`                | Yes      |
| vpc_flowlogs_bucket_name  | Name of the S3 bucket that contains the VPC flow logs           | `string` | `""`                |          |
| cloudtrail_s3_bucket_name | Name of the S3 bucket which contains the CloudTrail data        | `string` | `""`                |          |
| kinesis_stream_name       | Name of the Kinesis stream configured to stream CloudTrail data | `string` | `""`                |          |
| tags                      | Tags to apply to the resources created by this module           | `map`    | `{}`                |          |

## Outputs


| Name           | Description                                     |
| ---------------- | ------------------------------------------------- |
| aws_parameters | AWS parameters (ExternalId and IntegrationName) |

## Notes:-

- The user should have `Administrators`  permission to the master account to create resources.
- Every child account in the organization shoud have `OrganizationAccountAccessRole` role.
