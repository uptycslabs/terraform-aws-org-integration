terraform {
  required_version = ">= 0.12.21"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 3.50.0"
    }
    uptycscspm = {
      source  = "github.com/uptycslabs/uptycscspm"
      version = "0.0.1"
    }
  }
}