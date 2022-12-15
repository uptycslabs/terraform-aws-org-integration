
# Policy for the Lambda Function
resource "aws_iam_role" "iam_for_lambda" {
  count = var.defer_role_creation == true ? 1 : 0
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
  count             = var.defer_role_creation == true ? 1 : 0
  name              = "/aws/lambda/${aws_lambda_function.uptycs_role_function[0].function_name}"
  retention_in_days = 14
  lifecycle {
    prevent_destroy = false
  }
  tags = var.tags
}

# Function policy
resource "aws_iam_policy" "function_policy" {
  count = var.defer_role_creation == true ? 1 : 0
  name  = "${var.integration_name}-function-policy"

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
        Resource : aws_sqs_queue.request_queue[0].arn
      },
      {
        Action : [
          "sqs:SendMessage",
          "sqs:GetQueueAttributes"
        ],
        Effect : "Allow",
        Resource : aws_sqs_queue.response_queue[0].arn
      },
      {
        Action : [
          "kms:Decrypt",
          "kms:GenerateDataKey"
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
resource "aws_iam_role_policy_attachment" "function_policy_attachment" {
  count = var.defer_role_creation == true ? 1 : 0
  role = aws_iam_role.iam_for_lambda[0].id
  policy_arn = aws_iam_policy.function_policy[0].arn
}

resource "aws_lambda_function" "uptycs_role_function" {
  count         = var.defer_role_creation == true ? 1 : 0
  filename      = "${path.module}/lambdas/function.zip"
  function_name = "${var.integration_name}-roleManager"
  role          = aws_iam_role.iam_for_lambda[0].arn
  handler       = "roleManager.handler"
  timeout       = 10

  source_code_hash = filebase64sha256("${path.module}/lambdas/function.zip")

  runtime = "nodejs16.x"
  tags = var.tags
}

# Set the input trigger
resource "aws_lambda_event_source_mapping" "source_trigger" {
  count            = var.defer_role_creation == true ? 1 : 0
  event_source_arn = aws_sqs_queue.request_queue[0].arn
  function_name = aws_lambda_function.uptycs_role_function[0].arn
  batch_size    = 5
}
