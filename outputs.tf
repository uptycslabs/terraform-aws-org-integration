output "aws_parameters" {
  description = "aws parameters (ExternalId and IntegrationName)"
  value = {
    integrationName = var.integration_name
    ExternalId      = var.external_id
  }
}
