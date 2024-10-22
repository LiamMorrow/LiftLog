provider "aws" {
  profile = var.profile
  region  = var.region
}

terraform {
  backend "s3" {
    key     = "liftlog-backups/terraform.tfstate" # Path to store the state file in the bucket
    encrypt = true                                # Encrypt state file
  }
}