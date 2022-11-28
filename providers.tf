terraform {
  required_version = ">= 1.2.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.50.0"
    }
    uptycscspm = {
      source = "uptycslabs/uptycscspm"
      version = ">= 0.0.5"
    }
  }
}