
# Queue to trigger lambda function
resource "aws_sqs_queue" "request_queue" {
  name                      = "${var.integration_name}-request"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  sqs_managed_sse_enabled   = true
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.request_queue_deadletter.arn
    maxReceiveCount     = 3
  })

  tags = var.tags
}

# Deadletter queue
resource "aws_sqs_queue" "request_queue_deadletter" {
  name = "${var.integration_name}-request-dlq"

  tags = var.tags
}

# Queue to hold feedback/response messages
resource "aws_sqs_queue" "response_queue" {
  name                      = "${var.integration_name}-response"
  delay_seconds             = 90
  max_message_size          = 2048
  message_retention_seconds = 86400
  receive_wait_time_seconds = 10
  sqs_managed_sse_enabled   = true
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.response_queue_deadletter.arn
    maxReceiveCount     = 3
  })

  tags = var.tags
}

# Deadletter queue
resource "aws_sqs_queue" "response_queue_deadletter" {
  name                      = "${var.integration_name}-response-dlq"

  tags = var.tags
}
