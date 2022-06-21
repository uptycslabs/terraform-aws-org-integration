# Terraform AWS IAM role module

- This module allows you to create AWS IAM role with required policies and return role ARN which can be used for Uptycs service integration for each account in an organization or the accounts those have uptycs tags.
- This terraform module will create a IAM Role in each account with the following policies attached:
  - policy/job-function/ViewOnlyAccess
  - policy/SecurityAudit
  - Custom read only policy access for required resources

## Create a <file.tf> file, paste below codes and modify as needed in locals.

```
locals {
  # Provide the directory for the creation of modules and providers for all accounts 
  filepath = ""
  # Provide the string to prefix the resources
  resource_prefix = "cloudquery"
  # Copy the AWS Account ID from Uptycs' UI
  # Uptycs' UI : "Cloud"->"AWS"->"Integrations"->"ACCOUNT INTEGRATION"
  upt_account_id = "12345678910"
  # Copy the UUID4 from Uptycs' UI
  # Uptycs' UI : "Cloud"->"AWS"->"Integrations"->"ACCOUNT INTEGRATION"
  # You can generate your own UUID. If you do, make sure Uptycs' UI is updated with it
  external_id = "23ee83c1-e6b7-49f1-852a-698b53003d79"
  # These for master account
  # CloudTrail source: S3 Bucket or Kinesis stream?
  # Set either `cloudtrail_s3_bucket_name` or `kinesis_stream_name` to allow Uptycs to ingest CloudTrail events
  # Provide the S3 bucket name which contains the CloudTrail data
  cloudtrail_s3_bucket_name = ""
  # Name of the Kinesis stream configured to stream CloudTrail data
  kinesis_stream_name = ""
  # Name of the S3 bucket that contains the VPC flow logs
  vpc_flowlogs_bucket_name = ""
}
data "aws_organizations_organization" "listaccounts" {}
data "aws_organizations_resource_tags" "account" {
  count = length(data.aws_organizations_organization.listaccounts.non_master_accounts)
  resource_id = data.aws_organizations_organization.listaccounts.non_master_accounts[count.index].id
}

locals {
  uptycstaglist = [for accounttags in data.aws_organizations_resource_tags.account[*].tags : lookup(accounttags, "uptycs", "noTag")]
  uptycstagmap = {for awsaccount in data.aws_organizations_resource_tags.account[*] : awsaccount.id => lookup(awsaccount.tags, "uptycs", "noTag")}
}

resource "local_file" "providers" {
 filename = "${local.filepath}/providers.tf"
 content = <<EOT
  %{ for ac in data.aws_organizations_organization.listaccounts.non_master_accounts ~}
  %{ if ac.status == "ACTIVE" ~}
  %{ if !contains(local.uptycstaglist, "integration") || local.uptycstagmap["${ac.id}"] == "integration" ~}   

provider "aws" {
  assume_role {
    // Assume the organization access role
    role_arn = "arn:aws:iam::${ac.id}:role/OrganizationAccountAccessRole"
  }
  alias = "uptycs-${ac.id}"
}
%{ endif ~}
%{ endif ~}
%{ endfor ~}
EOT
}

resource "local_file" "modules" {
  filename = "${local.filepath}/modules.tf"
  content = <<EOT
  %{ for ac in data.aws_organizations_organization.listaccounts.non_master_accounts ~}
  %{ if ac.status == "ACTIVE" ~}
  %{ if !contains(local.uptycstaglist, "integration") || local.uptycstagmap["${ac.id}"] == "integration" ~}  

module "iam-config-${ac.id}" {
  source             = "github.com/uptycslabs/terraform-aws-org-integration"
  providers = {
    aws = aws.uptycs-${ac.id}
  }
  upt_account_id = "${local.upt_account_id}"
  aws_account_id = "${ac.id}"
  external_id = "${local.external_id}"
  resource_prefix = "${local.resource_prefix}"
  
  tags = {
    Service = "cloudquery"
  }
}
%{ endif ~}
%{ endif ~}
%{ endfor ~}

module "iam-config-${data.aws_organizations_organization.listaccounts.master_account_id}" {
  source             = "github.com/uptycslabs/terraform-aws-org-integration"
  upt_account_id = "${local.upt_account_id}"
  aws_account_id = "${data.aws_organizations_organization.listaccounts.master_account_id}"
  external_id = "${local.external_id}"
  resource_prefix = "${local.resource_prefix}"
  cloudtrail_s3_bucket_name = "${local.cloudtrail_s3_bucket_name}"
  kinesis_stream_name = "${local.kinesis_stream_name}"
  vpc_flowlogs_bucket_name = "${local.vpc_flowlogs_bucket_name}"
  tags = {
    Service = "cloudquery"
  }
}
EOT
}

resource "local_file" "outputs" {
  filename = "${local.filepath}/outputs.tf"
  content = <<EOT
  %{ for ac in data.aws_organizations_organization.listaccounts.non_master_accounts ~}
  %{ if ac.status == "ACTIVE" ~}
  %{ if !contains(local.uptycstaglist, "integration") || local.uptycstagmap["${ac.id}"] == "integration" ~}

output "aws-iam-role-arn-${ac.id}" {
  value = module.iam-config-${ac.id}.aws_iam_role_arn
}
%{ endif ~}
%{ endif ~}
%{ endfor ~}
EOT
}
```
## 2. Set Region before execute terraform

```sh
export AWS_DEFAULT_REGION="< pass region >"
```

## 3. Execute Terraform script

```sh
$ terraform init
$ terraform plan
$ terraform apply
```
## 4. After running above commands some files will be created in the the given filepath. Change the directory to the given file path and again follow the step3.
After step 4, roles and policies will be created in each account and will get the output of role arn of each account.

## When new account get added in the organization or uptycs tags get added to any account : 
- Follow step3 and step4 to create uptycs role in that new account 

## When you want to remove uptycs tags of any account or you want to remove any account from organization 
- Before removing account from organization or untag any account , change the directory to the given filepath and  destroy the resources created in that account
    ```
    terraform destroy -target "module.iam-config-<accountId of the account to be removed>"
     ```
- Follow step3 and step4
## Inputs

| Name                      | Description                                                                                            | Type     | Default      |  Required |
| ------------------------- | ------------------------------------------------------------------------------------------------------ | -------- | ------------ | ----------|
| resource_prefix           | Prefix to be used for naming new resources                                                             | `string` | `cloudquery` |           |
| upt_account_id            | Uptycs AWS account ID                                                                                  | `string` | `""`         |    Yes    |
| external_id               | Role external ID provided by Uptycs                                                                    | `string` | `""`         |    Yes    |
| vpc_flowlogs_bucket_name  | Name of the S3 bucket that contains the VPC flow logs                                                  | `string` | `""`         |           |
| cloudtrail_s3_bucket_name | Name of the S3 bucket which contains the CloudTrail data                                               | `string` | `""`         |           |
| kinesis_stream_name       | Name of the Kinesis stream configured to stream CloudTrail data                                        | `string` | `""`         |           |
| filepath                  | Directory to keep modules and providers                                                                | `string` | `""`         |    Yes    |

## Outputs

| Name             | Description      |
| ---------------- | ---------------- |
| aws_iam_role_arn | AWS IAM role ARN |

## Notes:-

- The user should have `Administrators` role permission to create resources.
- Every child account in the organization shoud have `OrganizationAccountAccessRole` role
- If the user has multiple aws account profiles then set profile before execute terraform.
  ```sh
    export AWS_PROFILE="< profile name >"
  ```

   
