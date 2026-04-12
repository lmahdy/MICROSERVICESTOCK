#!/bin/bash
echo "=== Testing frontend nginx proxy to gateway ==="

# Get token
TOKEN=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -d "grant_type=password" \
  -d "client_id=orderly-frontend" \
  -d "username=admin1" \
  -d "password=admin" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "1. Frontend serves index.html:"
curl -s http://localhost:4200 | grep -c "app-root"
echo "   (should be 1)"

echo ""
echo "2. Frontend nginx proxy /api/stores (with token):"
RESP=$(curl -s -w "\nHTTP: %{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:4200/api/stores)
echo "   $RESP"

echo ""
echo "3. Frontend nginx proxy /api/stores (NO token):"
RESP2=$(curl -s -w "\nHTTP: %{http_code}" http://localhost:4200/api/stores)
echo "   $RESP2"

echo ""
echo "4. Keycloak CORS from localhost:4200 origin:"
curl -sv "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -H "Origin: http://localhost:4200" \
  -d "grant_type=password" \
  -d "client_id=orderly-frontend" \
  -d "username=admin1" \
  -d "password=admin" 2>&1 | grep "Access-Control"
