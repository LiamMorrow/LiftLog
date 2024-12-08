variable "liftlog_backup_bucket_name" {
  description = "The name of the S3 bucket to store the backups in"
  type        = string
}

variable "delete_after_days" {
  type        = number
  description = "Number of days after which to delete old files. If not set or null, files are never deleted."
  default     = null
}

variable "region" {
  description = "The AWS region where resources will be created"
  type        = string
}

variable "profile" {
  description = "The AWS profile to use"
  type        = string
}
