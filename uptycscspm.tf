
data "aws_organizations_organization" "my_org" {
}

data "aws_organizations_resource_tags" "cloudtrail_account" {
  count       = (!var.cloudtrail_s3_bucket_in_master && var.cloudtrail_s3_bucket_name != "") ? 1 : 0
  resource_id = var.cloudtrail_s3_bucket_account
}

locals {
  child_accounts_active = var.defer_role_creation ? [] : toset([for each in data.aws_organizations_organization.my_org.non_master_accounts : each.id if each.status == "ACTIVE"])
  cloudtrail_account    = (!var.cloudtrail_s3_bucket_in_master && var.cloudtrail_s3_bucket_name != "") ? data.aws_organizations_resource_tags.cloudtrail_account[0].id : ""
}

resource "uptycscspm_role" "child_account_role" {
  for_each         = local.child_accounts_active
  account_id       = each.key
  integration_name = var.integration_name
  upt_account_id   = var.upt_account_id
  external_id      = var.external_id
  profile_name     = data.external.env.result["aws_profile"]
  policy_document  = local.child_policy_document
  bucket_name      = (!var.cloudtrail_s3_bucket_in_master && each.key == local.cloudtrail_account) ? var.cloudtrail_s3_bucket_name : ""
  bucket_region    = (!var.cloudtrail_s3_bucket_in_master && each.key == local.cloudtrail_account) ? var.cloudtrail_s3_bucket_region : ""

  lifecycle {
    replace_triggered_by = [
      aws_iam_role.role.name,
      aws_iam_role.role.assume_role_policy
    ]
  }
}
