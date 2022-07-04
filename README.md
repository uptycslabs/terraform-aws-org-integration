# Terraform AWS IAM role module

- This module allows you to integrate AWS master account and any child account with Uptycs.
- This module will create an IAM Role in each account. The role has following policies attached:
  - policy/job-function/ViewOnlyAccess
  - policy/SecurityAudit
  - Custom read only policy access for required resources

## 1. Create a <file.tf> file, paste below codes and modify as needed.

```
module "org-config" {
  source           = "github.com/uptycslabs/terraform-aws-org-integration"

  # Modify as you need, this will be used as a prefix to naming the resources
  integration_name = "UptycsIntegration-123"

  # Copy the AWS Account ID from Uptycs' UI
  # Uptycs' UI : "Cloud"->"AWS"->"Integrations"->"Org INTEGRATION"
  upt_account_id = "<upt_account_id>"

  # Account Id of the organizattion's master account
  aws_account_id = "<aws_account_id>"

  # Copy the UUID4 from Uptycs' UI
  # Uptycs' UI : "Cloud"->"AWS"->"Integrations"->"Org INTEGRATION"
  # You can generate your own UUID. If you do, make sure Uptycs' UI is updated with it
  external_id = "465308b9-fadb-449b-8d2d-3b5b3f2457f9"

  # CloudTrail source of master account: S3 Bucket or Kinesis stream?
  # Set either `cloudtrail_s3_bucket_name` or `kinesis_stream_name` to allow Uptycs to ingest CloudTrail events
  # Provide the S3 bucket name which contains the CloudTrail data
  cloudtrail_s3_bucket_name = ""

  # Name of the Kinesis stream configured to stream CloudTrail data
  kinesis_stream_name = ""

  # Name of the S3 bucket in the master account that contains the VPC flow logs
  vpc_flowlogs_bucket_name = ""

}

output "aws_parameters" {
  value = module.org-config.aws_parameters
}

```

## Inputs


| Name                      | Description                                                                       | Type     | Default             | Required |
| --------------------------- | ----------------------------------------------------------------------------------- | ------------- | ------------------ | --------- |
| integration_name          | Prefix to be used for naming new resources                                        | `string` | `UptycsIntegration` |          |
| upt_account_id            | Uptycs AWS account ID                                                             | `string` | `""`                | Yes      |
| aws_account_id            | AWS organization's master account ID                                              | `string` | `""`                | Yes      |
| external_id               | Role external ID provided by Uptycs                                               | `string` | `""`                | Yes      |
| vpc_flowlogs_bucket_name  | Name of the S3 bucket in master account that contains the VPC flow logs           | `string` | `""`                |          |
| cloudtrail_s3_bucket_name | Name of the S3 bucket in master account which contains the CloudTrail data        | `string` | `""`                |          |
| kinesis_stream_name       | Name of the Kinesis stream in master account configured to stream CloudTrail data | `string` | `""`                |          |

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

Notes:-

- The user should have `Administrators`  permission to the master account to create resources.
- Every child account in the organization shoud have `OrganizationAccountAccessRole` role.
- If you want to integrate some specific accounts, set those accounts  with the tag (Key=`uptycs-integration` Value = `Any value`)
- If you see this error you need to add the missing role `OrganizationAccountAccessRole` on the child account. For more information visit: [https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts_access.html]

```
Unable to create uptycscspm role. err=operation error IAM: CreateRole, failed to sign request: failed to retrieve credentials: failed to refresh cached credentials, operation error STS: AssumeRole, https response error StatusCode: 403, RequestID: 262297b8-c6e5-4dec-b1ec-3fcaa7e8e6da, api error AccessDenied: User: arn:aws:iam::<masterAccountId>:user/<user> is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::<childAccountId>:role/OrganizationAccountAccessRole
```

## Outputs


| Name           | Description                                     |
| ---------------- | ------------------------------------------------- |
| aws_parameters | AWS parameters (ExternalId and IntegrationName) |
