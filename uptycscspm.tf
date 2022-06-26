
provider "uptycscspm" {
  profile = data.external.env.result["aws_profile"]
}

data "aws_organizations_organization" "my_org" {
}

locals {
  child_accounts_active     = toset([for each in data.aws_organizations_organization.my_org.non_master_accounts : each.id if each.status == "ACTIVE"])
}

resource "uptycscspm_role" "gb" {
  for_each = local.child_accounts_active
  account_id = each.key
  integration_name = var.integration_name
  upt_account_id = var.upt_account_id
  external_id = var.external_id

  lifecycle {
    replace_triggered_by = [
      aws_iam_role.role.name
    ]
  }
}
