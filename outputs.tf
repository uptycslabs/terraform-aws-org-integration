output "aws_parameters" {
  description = "aws parameters (ExternalId and IntegrationName)"
  value       =  {
    integrationName = var.integration_name
    ExternalId = var.external_id
  }
}

output "master_role" {
  description = "role in master account"
  value = aws_iam_role.role.arn
}

output "child_roles" {
  description = "roles in child accounts"
  value = uptycscspm_role.gb
}