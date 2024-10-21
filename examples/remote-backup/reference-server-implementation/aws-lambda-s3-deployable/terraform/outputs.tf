output "check_output_file" {
  description = "Outputs have been written to output.txt. Please check the file for details."
  value       = "Outputs have been written to output.txt"
}

resource "local_file" "output_file" {
  content = <<EOT
API URL: ${aws_api_gateway_deployment.api_deployment.invoke_url}/backup
API Key: ${aws_api_gateway_api_key.liftlog_api_key.value}
EOT

  filename = "${path.module}/output.txt"
}