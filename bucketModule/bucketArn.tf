variable "resource_region" {
  type = string
}

variable "bucket_name" {
  type = string
}

variable "bucket_in_master" {
  type = bool
  default = true
}


provider "aws" {
  region = var.resource_region
}

data "aws_s3_bucket" "bucket_details" {
  count = (var.bucket_in_master && var.bucket_name != "") ? 1:0
  bucket = var.bucket_name
}

output "bucket_arn" {
  value = (var.bucket_in_master && var.bucket_name != "") ? data.aws_s3_bucket.bucket_details[0].arn : null
}
