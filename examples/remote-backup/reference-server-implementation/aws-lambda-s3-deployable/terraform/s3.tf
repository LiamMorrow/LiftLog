resource "aws_s3_bucket" "backup_bucket" {
  bucket = var.liftlog_backup_bucket_name

  lifecycle {
    prevent_destroy = true # Prevents bucket deletion
  }

  # Optional lifecycle rule that deletes files after the specified number of days
  dynamic "lifecycle_rule" {
    for_each = var.delete_after_days != null ? [1] : []

    content {
      enabled = true

      expiration {
        days = var.delete_after_days
      }

      noncurrent_version_expiration {
        days = var.delete_after_days
      }
    }
  }
}