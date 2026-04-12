#!/bin/bash
# Get token
RESPONSE=$(curl -s http://localhost:9090/realms/orderly/protocol/openid-connect/token \
  -d 'client_id=orderly-frontend' \
  -d 'grant_type=password' \
  -d 'username=admin1' \
  -d 'password=admin')

TOKEN=$(echo "$RESPONSE" | python3 -c 'import json,sys;print(json.load(sys.stdin)["access_token"])')

echo "TOKEN_LENGTH: ${#TOKEN}"
echo "---"

# Test GET /api/stores with token
echo "Testing GET /api/stores..."
curl -s -w "\nHTTP_STATUS: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores

echo "---"

# Test POST /api/stores with token
echo "Testing POST /api/stores..."
curl -s -w "\nHTTP_STATUS: %{http_code}\n" \
  -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Store","description":"Test","address":"123 Main St"}' \
  http://localhost:9016/api/stores
