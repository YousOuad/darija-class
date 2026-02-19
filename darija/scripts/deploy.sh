#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

AWS_REGION="${AWS_REGION:-eu-west-3}"
PROJECT_NAME="${PROJECT_NAME:-darijalingo}"
ENVIRONMENT="${ENVIRONMENT:-production}"
FUNCTION_NAME="${PROJECT_NAME}-${ENVIRONMENT}-backend"

echo "==> Getting AWS account ID..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${PROJECT_NAME}-${ENVIRONMENT}-backend"

echo "==> Logging into ECR..."
aws ecr get-login-password --region "$AWS_REGION" | \
  docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

echo "==> Building Lambda container image..."
docker build -t "${PROJECT_NAME}-backend" \
  -f "${PROJECT_ROOT}/backend/Dockerfile.lambda" \
  "${PROJECT_ROOT}/backend"

echo "==> Pushing to ECR..."
docker tag "${PROJECT_NAME}-backend:latest" "${ECR_REPO}:latest"
docker push "${ECR_REPO}:latest"

echo "==> Updating Lambda function..."
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --image-uri "${ECR_REPO}:latest" \
  --region "$AWS_REGION" \
  --no-cli-pager

echo "==> Waiting for Lambda update to complete..."
aws lambda wait function-updated \
  --function-name "$FUNCTION_NAME" \
  --region "$AWS_REGION"

echo ""
echo "=========================================="
echo "  Deploy complete!"
echo "=========================================="
echo ""
echo "  Lambda:  ${FUNCTION_NAME}"
echo "  Image:   ${ECR_REPO}:latest"
echo "=========================================="
