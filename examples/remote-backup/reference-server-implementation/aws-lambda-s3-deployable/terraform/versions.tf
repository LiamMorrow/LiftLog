terraform {
  required_version = "1.14.2"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0" # Uses the latest major version (v5 at the moment)
    }
  }
}