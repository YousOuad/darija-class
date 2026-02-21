#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "==> Resetting DarijaLingo database..."

# Stop all containers
echo "==> Stopping containers..."
docker compose down

# Remove the postgres data volume
echo "==> Removing postgres volume..."
docker volume rm "$(basename "$PROJECT_ROOT")_postgres_data" 2>/dev/null || \
  docker volume rm darija_postgres_data 2>/dev/null || \
  echo "    Volume not found (may already be removed)."

# Restart containers
echo "==> Restarting containers..."
docker compose up -d --build

echo "==> Waiting for database to be ready..."

MAX_RETRIES=15
RETRY_INTERVAL=2

for i in $(seq 1 $MAX_RETRIES); do
  if docker compose exec -T db pg_isready -U darija -d darija_db > /dev/null 2>&1; then
    echo "==> Database is ready!"
    break
  fi
  if [ "$i" -eq "$MAX_RETRIES" ]; then
    echo "==> ERROR: Database failed to become ready after $((MAX_RETRIES * RETRY_INTERVAL)) seconds."
    echo "    Check logs with: docker compose logs db"
    exit 1
  fi
  echo "    Attempt $i/$MAX_RETRIES - database not ready yet, retrying in ${RETRY_INTERVAL}s..."
  sleep "$RETRY_INTERVAL"
done

echo ""
echo "==> Database has been reset successfully."
echo "    Run ./scripts/seed-curriculum.sh to re-seed curriculum data."
