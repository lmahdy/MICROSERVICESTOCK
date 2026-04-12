#!/bin/bash
# Get token from Keycloak
RESP=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=orderly-frontend&username=admin&password=admin")

echo "=== Token Response ==="
echo "$RESP" | python3 -m json.tool 2>/dev/null || echo "$RESP"

TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
echo ""
echo "TOKEN_LENGTH: ${#TOKEN}"

if [ -z "$TOKEN" ] || [ "$TOKEN" = "" ]; then
  echo "ERROR: Could not get token"
  exit 1
fi

# Decode the token payload to see issuer
echo ""
echo "=== Token Payload (decoded) ==="
echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | python3 -m json.tool 2>/dev/null

echo ""
echo "=== Testing gateway /api/stores ==="
curl -s -w "\nHTTP_CODE: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores

echo ""
echo "=== Response headers ==="
curl -s -D - -o /dev/null -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores
