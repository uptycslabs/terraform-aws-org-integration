variable "integration_name" {
  description = "Prefix to be used for naming new resources"
  type        = string
  default     = "UptycsIntegration"
}

variable "aws_account_id" {
  description = "AWS organization's master account ID"
  type        = string
}

variable "upt_account_id" {
  description = "Uptycs AWS account ID"
  type        = string
}

variable "external_id" {
  description = "Role external ID provided by Uptycs"
  type        = string
}

variable "vpc_flowlogs_bucket_name" {
  type        = string
  description = "S3 bucket where VPC flow logs are saved. Required, if customer wants to attach bucket for VPC flow logs ."
  default     = ""
}

variable "cloudtrail_s3_bucket_name" {
  type        = string
  description = "S3 bucket where CloudTrail is saved. Required, if customer wants to attach cloudtrail bucket for cloudtrail logs."
  default     = ""
}

variable "cloudtrail_s3_bucket_in_master" {
  description = "Specifies whether cloudtrail s3 bucket is in master account or not"
  type        = string
  default     = true
}


variable "kinesis_stream_name" {
  description = "Kinesis stream name for cloudtrail logs. Required, if customer wants to attach kinesis stream for cloudtrail logs."
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags to apply to the resources created by this module"
  type        = map(string)
  default     = {}
}

variable "defer_role_creation" {
  description = "Defer role creation to Lambda function so it can triggered on-demand"
  type        = bool
  default     = true
}
variable "cloudtrail_s3_bucket_region" {
  type        = string
  description = "Region where cloudtrail bucket exists"
  default     = ""
}

variable "vpc_flowlogs_bucket_region" {
  type        = string
  description = "Region where vpc flow log bucket exists"
  default     = ""
}
variable "kinesis_stream_region" {
  description = "Region where the kinesis stream exists"
  type        = string
  default     = ""
}
