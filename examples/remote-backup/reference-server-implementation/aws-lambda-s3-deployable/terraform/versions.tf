terraform {
  required_version = "= 1.9.8"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0" # Uses the latest major version (v5 at the moment)
    }
  }
}