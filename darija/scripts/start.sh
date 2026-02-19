#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "==> Starting DarijaLingo local stack..."

# Start docker-compose services (db + backend)
docker compose up -d --build

echo "==> Waiting for backend to be healthy..."

BACKEND_URL="http://localhost:8000"
MAX_RETRIES=30
RETRY_INTERVAL=2

for i in $(seq 1 $MAX_RETRIES); do
  if curl -sf "${BACKEND_URL}/docs" > /dev/null 2>&1; then
    echo "==> Backend is healthy!"
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo "==> ERROR: Backend failed to become healthy after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
    echo "    Check logs with: docker compose logs backend"
    exit 1
  fi
  echo "    Attempt $i/$MAX_RETRIES - backend not ready yet, retrying in ${RETRY_INTERVAL}s..."
  sleep "$RETRY_INTERVAL"
done

echo ""
echo "=========================================="
echo "  DarijaLingo is running!"
echo "=========================================="
echo ""
echo "  Backend API:   ${BACKEND_URL}"
echo "  API Docs:      ${BACKEND_URL}/docs"
echo "  Frontend:      http://localhost:5173"
echo ""
echo "  To stop:       docker compose down"
echo "  To view logs:  docker compose logs -f"
echo "=========================================="
