variable "liftlog_backup_bucket_name" {
  description = "The name of the S3 bucket to store the backups in"
  type        = string
}

variable "delete_after_days" {
  type        = number
  description = "Number of days after which to delete old files. If not set or null, files are never deleted."
  default     = null
}

variable "enable_rate_limit" {
  description = "Enable rate limiting for the API"
  type        = bool
  default     = true
}

variable "daily_rate_limit" {
  description = "The daily rate limit for the API"
  type        = number
  default     = 20
}

variable "limit_per_second" {
  description = "The rate limit per second for the API"
  type        = number
  default     = 1
}

variable "region" {
  description = "The AWS region where resources will be created"
  type        = string
}

variable "profile" {
  description = "The AWS profile to use"
  type        = string
}
