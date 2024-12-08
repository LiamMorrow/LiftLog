# API Gateway REST API
resource "aws_api_gateway_rest_api" "liftlog_api" {
  name        = "LiftLog API"
  description = "Public API for LiftLog Lambda"

  binary_media_types = [
    "application/x-www-form-urlencoded" # We explicity tell API Gateway the body for this is a binary payload so it will enode the whole thing as a base64 string
  ]
}

# Resource in API Gateway to invoke the Lambda function
resource "aws_api_gateway_resource" "lambda_resource" {
  rest_api_id = aws_api_gateway_rest_api.liftlog_api.id
  parent_id   = aws_api_gateway_rest_api.liftlog_api.root_resource_id
  path_part   = "backup"
}

# API Method: Allow HTTP POST and require an API key
resource "aws_api_gateway_method" "post_method" {
  rest_api_id      = aws_api_gateway_rest_api.liftlog_api.id
  resource_id      = aws_api_gateway_resource.lambda_resource.id
  http_method      = "POST"
  authorization    = "NONE"
  api_key_required = true
}

# Integration: Link API Gateway POST /backup method to the Lambda function
resource "aws_api_gateway_integration" "lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.liftlog_api.id
  resource_id             = aws_api_gateway_resource.lambda_resource.id
  http_method             = aws_api_gateway_method.post_method.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.liftlog_lambda.invoke_arn
}

# Deploy API Gateway and create a stage
resource "aws_api_gateway_deployment" "api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.liftlog_api.id
  stage_name  = "prod"

  depends_on = [
    aws_api_gateway_method.post_method,            # Ensure the POST method is created before deployment
    aws_api_gateway_integration.lambda_integration # Ensure the integration is created before deployment
  ]
}

# Create an API usage plan
resource "aws_api_gateway_usage_plan" "liftlog_plan" {
  name = "LiftLogUsagePlan"
  api_stages {
    api_id = aws_api_gateway_rest_api.liftlog_api.id
    stage  = aws_api_gateway_deployment.api_deployment.stage_name
  }
}

# Create an API Key for accessing the API
resource "aws_api_gateway_api_key" "liftlog_api_key" {
  name    = "LiftLogAPIKey"
  enabled = true
}

# Link API Key to usage plan
resource "aws_api_gateway_usage_plan_key" "liftlog_usage_key" {
  key_id        = aws_api_gateway_api_key.liftlog_api_key.id
  usage_plan_id = aws_api_gateway_usage_plan.liftlog_plan.id
  key_type      = "API_KEY"
}