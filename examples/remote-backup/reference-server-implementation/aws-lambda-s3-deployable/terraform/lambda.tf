# IAM Role for Lambda Execution
resource "aws_iam_role" "lambda_exec_role" {
  name = "liftlog-lambda-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Attach policy to allow Lambda to log to CloudWatch
resource "aws_iam_policy_attachment" "lambda_exec_policy" {
  name       = "lambda-basic-execution"
  roles      = [aws_iam_role.lambda_exec_role.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Lambda Function
resource "aws_lambda_function" "liftlog_lambda" {
  function_name = "liftlog-lambda"
  role          = aws_iam_role.lambda_exec_role.arn
  runtime       = "nodejs20.x"
  handler       = "index.handler"
  filename      = "${path.module}/lambda.zip" # Zip your Node.js app

  source_code_hash = filebase64sha256("${path.module}/lambda.zip") # Ensures Lambda updates when zip changes

  environment {
    variables = {
      BUCKET_NAME = aws_s3_bucket.backup_bucket.bucket # Pass bucket name from the S3 bucket resource
    }
  }
}

# Lambda permission for API Gateway to invoke the function
resource "aws_lambda_permission" "apigw_invoke_lambda" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.liftlog_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.liftlog_api.execution_arn}/*/*"
}

resource "aws_iam_policy" "lambda_s3_policy" {
  name        = "lambda-s3-policy"
  description = "Policy to allow Lambda function to upload files to S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:PutObject",
          "s3:PutObjectAcl" # Optional, if you want to manage object ACLs
        ]
        Effect   = "Allow"
        Resource = "${aws_s3_bucket.backup_bucket.arn}/*" # Allow access to all objects in the bucket
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_s3_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_s3_policy.arn
}