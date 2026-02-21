#!/usr/bin/env bash
set -euo pipefail

# Seed test users into DarijaLingo via the API.
# Usage:
#   BACKEND_URL=https://your-api-url ./scripts/seed-test-users.sh
#
# Credentials are documented in LOCAL_TEST_USERS.md

BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
API="${BACKEND_URL}/api"

echo "==> Seeding test users into DarijaLingo at ${BACKEND_URL}..."
echo ""

register_user() {
  local email="$1" password="$2" display_name="$3"

  echo -n "  Registering ${email} (${display_name})... "

  response=$(curl -sf -X POST "${API}/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${email}\",\"password\":\"${password}\",\"display_name\":\"${display_name}\"}" \
    2>&1) && {
    echo "OK"
    echo "$response"
    return 0
  } || {
    # 409 = already exists, that's fine
    echo "already exists or failed (continuing)"
    return 0
  }
}

add_flashcards() {
  local token="$1"
  shift
  # Each remaining arg is "front_latin|back"
  for pair in "$@"; do
    local front_latin="${pair%%|*}"
    local back="${pair##*|}"
    curl -sf -X POST "${API}/flashcards" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${token}" \
      -d "{\"front_latin\":\"${front_latin}\",\"back\":\"${back}\",\"front_arabic\":\"\",\"is_public\":true}" \
      > /dev/null 2>&1 || true
  done
}

# ---------- Test Student ----------
register_user "test@darija.com" "testpass123" "TestLearner"

# ---------- Demo Student (with sample flashcards) ----------
echo -n "  Registering demo@darija.com (DarijaFan)... "
demo_response=$(curl -s -X POST "${API}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@darija.com","password":"demopass123","display_name":"DarijaFan"}' \
  2>&1) || true

demo_token=""
if echo "$demo_response" | grep -q "access_token"; then
  demo_token=$(echo "$demo_response" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || true)
  echo "OK"
else
  echo "already exists or failed, logging in..."
  login_response=$(curl -s -X POST "${API}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@darija.com","password":"demopass123"}' \
    2>&1) || true
  demo_token=$(echo "$login_response" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || true)
fi

if [ -n "$demo_token" ]; then
  echo "  Adding sample flashcards for DarijaFan..."
  add_flashcards "$demo_token" \
    "salam|hello" \
    "kif dayer|how are you doing" \
    "shukran|thank you" \
    "bslama|goodbye" \
    "labas|fine / no problem" \
    "wakha|okay / alright" \
    "bzzaf|a lot / very much" \
    "chwiya|a little" \
    "yallah|let's go" \
    "mr7ba|welcome"
  echo "  Done: 10 sample flashcards added."
else
  echo "  WARNING: Could not get token for demo user. Skipping flashcards."
fi

echo ""
echo "==> Test user seeding complete."
echo ""
echo "  Test Student:  test@darija.com / testpass123"
echo "  Demo Student:  demo@darija.com / demopass123 (with flashcards)"
echo ""
