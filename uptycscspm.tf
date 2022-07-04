
data "aws_organizations_organization" "my_org" {
}

data "aws_organizations_resource_tags" "child_tags" {
  for_each = local.child_accounts_active
  resource_id = each.key
}
locals {
  child_accounts_active     = toset([for each in data.aws_organizations_organization.my_org.non_master_accounts : each.id if each.status == "ACTIVE"])
  child_accounts_with_upt_tags = toset([for account in data.aws_organizations_resource_tags.child_tags : account.id if lookup(account.tags, "uptycs-integration", "noTag") != "noTag"])
}

resource "uptycscspm_role" "child_account_role" {
  for_each = length(local.child_accounts_with_upt_tags) == 0 ? local.child_accounts_active : local.child_accounts_with_upt_tags
  account_id = each.key
  integration_name = var.integration_name
  upt_account_id = var.upt_account_id
  external_id = var.external_id
  profile_name = data.external.env.result["aws_profile"]

  lifecycle {
    replace_triggered_by = [
      aws_iam_role.role.name,
      aws_iam_role.role.assume_role_policy
    ]
  }
}
