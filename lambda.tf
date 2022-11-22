
# Policy for the Lambda Function
resource "aws_iam_role" "iam_for_lambda" {
  name = "${var.integration_name}-lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = var.tags
}

# Log group for the Lambda Function
resource "aws_cloudwatch_log_group" "function_log_group" {
  name              = "/aws/lambda/${aws_lambda_function.uptycs_role_function.function_name}"
  retention_in_days = 14
  lifecycle {
    prevent_destroy = false
  }
  tags = var.tags
}

# Function policy
resource "aws_iam_policy" "function_policy" {
  name   = "${var.integration_name}-function-policy"
  policy = jsonencode({
    "Version" : "2012-10-17",
    "Statement" : [
      {
        Action : [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect : "Allow",
        Resource : "arn:aws:logs:*:*:*"
      },
      {
        Action : [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ],
        Effect : "Allow",
        Resource : aws_sqs_queue.request_queue.arn
      },
      {
        Action : [
          "kms:decrypt"
        ],
        Effect : "Allow",
        Resource : "*"
      },
      {
        Action : [
          "sts:AssumeRole"
        ],
        Effect : "Allow",
        Resource : "*"
      }
    ]
  })
  tags = var.tags
}

# Attach policy to the role
resource "aws_iam_role_policy_attachment" "function_logging_policy_attachment" {
  role = aws_iam_role.iam_for_lambda.id
  policy_arn = aws_iam_policy.function_policy.arn
}

resource "aws_lambda_function" "uptycs_role_function" {
  # If the file is not in the current working directory you will need to include a
  # path.module in the filename.
  filename      = "${path.module}/lambdas/function.zip"
  function_name = "${var.integration_name}-roleManager"
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "roleManager.handler"

  source_code_hash = filebase64sha256("${path.module}/lambdas/function.zip")

  runtime = "nodejs16.x"
  tags = var.tags
}

# Set the input trigger
resource "aws_lambda_event_source_mapping" "source_trigger" {
  event_source_arn = aws_sqs_queue.request_queue.arn
  function_name = aws_lambda_function.uptycs_role_function.arn
}
