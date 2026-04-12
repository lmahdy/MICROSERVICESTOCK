#!/bin/bash
# Get token from Keycloak using admin1 user
RESP=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=orderly-frontend&username=admin1&password=admin")

TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
echo "TOKEN_LENGTH: ${#TOKEN}"

if [ -z "$TOKEN" ] || [ "$TOKEN" = "" ]; then
  echo "ERROR: Could not get token"
  echo "$RESP"
  exit 1
fi

# Decode the token payload to see issuer
echo ""
echo "=== Token Payload (decoded) ==="
echo "$TOKEN" | cut -d. -f2 | (base64 -d 2>/dev/null || base64 --decode 2>/dev/null) | python3 -m json.tool 2>/dev/null

echo ""
echo "=== Testing gateway /api/stores ==="
STORE_RESP=$(curl -s -w "\nHTTP_CODE: %{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores)
echo "$STORE_RESP"

echo ""
echo "=== Response headers from gateway ==="
curl -s -D - -o /dev/null -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores
