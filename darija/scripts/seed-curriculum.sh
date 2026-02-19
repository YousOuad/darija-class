#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

CURRICULUM_DIR="${PROJECT_ROOT}/curriculum"
BACKEND_URL="http://localhost:8000"

echo "==> Seeding curriculum data into DarijaLingo..."

# Verify backend is reachable
if ! curl -sf "${BACKEND_URL}/docs" > /dev/null 2>&1; then
  echo "==> ERROR: Backend is not reachable at ${BACKEND_URL}."
  echo "    Start the stack first with: ./scripts/start.sh"
  exit 1
fi

# Verify curriculum directory exists
if [ ! -d "$CURRICULUM_DIR" ]; then
  echo "==> ERROR: Curriculum directory not found at ${CURRICULUM_DIR}."
  exit 1
fi

# Iterate through CEFR level directories (a2, b1, b2)
for level_dir in "${CURRICULUM_DIR}"/a2 "${CURRICULUM_DIR}"/b1 "${CURRICULUM_DIR}"/b2; do
  level=$(basename "$level_dir")

  if [ ! -d "$level_dir" ]; then
    echo "    Skipping ${level} - directory not found."
    continue
  fi

  echo "==> Processing level: ${level}"

  # Find and upload all JSON files in this level directory
  for json_file in "${level_dir}"/*.json; do
    if [ ! -f "$json_file" ]; then
      echo "    No JSON files found in ${level_dir}."
      break
    fi

    filename=$(basename "$json_file")
    echo "    Uploading ${level}/${filename}..."

    response=$(curl -sf -X POST \
      "${BACKEND_URL}/api/curriculum/load" \
      -H "Content-Type: application/json" \
      -d @"${json_file}" 2>&1) || {
      echo "    WARNING: Failed to upload ${level}/${filename}."
      echo "    Response: ${response}"
      continue
    }

    echo "    OK: ${level}/${filename}"
  done
done

echo ""
echo "==> Curriculum seeding complete."
