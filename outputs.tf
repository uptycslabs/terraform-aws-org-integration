output "aws_parameters" {
  description = "aws parameters (ExternalId and IntegrationName)"
  value = {
    integrationName = local.roleName
    ExternalId      = var.external_id
  }
}
