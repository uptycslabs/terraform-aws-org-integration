resource "aws_cloudformation_stack" "integration" {
  name         = "${var.integration_name}-Uptycs-Stack"
  template_url = "https://uptycs-integration.s3.amazonaws.com/aws/org/cf-templates/uptycs-org-cspm-master-147.yml"
  capabilities = ["CAPABILITY_IAM", "CAPABILITY_NAMED_IAM"]
  parameters = {
    ExternalId          = var.external_id
    IntegrationName     = var.integration_name
    UptycsAccountId     = var.upt_account_id
    PermissionsBoundary = var.permissions_boundary
  }
  tags = var.tags

}

locals {
  roleArn        = aws_cloudformation_stack.integration.outputs["RoleName"]
  splittedValues = split("/", local.roleArn)
  roleName       = local.splittedValues[length(local.splittedValues) - 1]
}
