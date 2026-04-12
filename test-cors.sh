#!/bin/bash
# Test CORS preflight from gateway
echo "=== CORS Preflight Test ==="
curl -s -I -X OPTIONS \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  http://localhost:9016/api/stores

echo ""
echo "=== CORS on actual GET (with token) ==="
TOKEN=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -d "grant_type=password" \
  -d "client_id=orderly-frontend" \
  -d "username=admin1" \
  -d "password=admin" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -s -I \
  -H "Origin: http://localhost:4200" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:9016/api/stores
