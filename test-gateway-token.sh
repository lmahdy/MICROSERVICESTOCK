#!/bin/bash
# Get token from Keycloak
TOKEN=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -d "grant_type=password" \
  -d "client_id=orderly-frontend" \
  -d "username=admin1" \
  -d "password=admin" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "Token acquired: ${TOKEN:0:50}..."

# Test gateway with token
echo ""
echo "Testing gateway /api/stores with token:"
curl -s -w "\nHTTP Status: %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores

echo ""
echo "Testing gateway /api/stores WITHOUT token:"
curl -s -w "\nHTTP Status: %{http_code}\n" http://localhost:9016/api/stores

echo ""
echo "Testing CORS preflight:"
curl -s -w "\nHTTP Status: %{http_code}\n" -X OPTIONS \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  http://localhost:9016/api/stores
