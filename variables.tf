variable "external_id" {
  type        = string
  default     = "f0611dec-83e4-4296-a7a5-92255a733ea3"
  description = "The ExternalId used by Uptycs to Assume this role"
}

variable "integration_name" {
  type        = string
  default     = "uptycs-OrgIntegration"
  description = "The IAM role that will be created with a trust relationship with Uptycs"
}

variable "upt_account_id" {
  type        = string
  default     = "685272795239"
  description = "The Uptycs Account from which the role is assumed"
}

variable "permissions_boundary" {
  type        = string
  default     = null
  description = "The name of the permissions boundary to apply to IAM roles"

}

variable "tags" {
  type    = map(string)
  default = {}
}
