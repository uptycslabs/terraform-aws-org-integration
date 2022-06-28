
data "aws_organizations_organization" "my_org" {
}

locals {
  //child_accounts_active     = toset([for each in data.aws_organizations_organization.my_org.non_master_accounts : each.id if each.status == "ACTIVE"])
  child_accounts_active     = toset(["384945265514", "031681993570", "056771311234", "093136074091", "154183295693", "241033863276", "675326774713"])
  //child_accounts_bad      = toset(["219798373743", "988562915291", "106964015862"])
}

resource "uptycscspm_role" "gb" {
  for_each = local.child_accounts_active
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
