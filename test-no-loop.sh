#!/bin/bash
echo "=== Frontend serves HTML ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:4200

echo ""
echo "=== Keycloak login page accessible ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" "http://localhost:9090/realms/orderly/protocol/openid-connect/auth?client_id=orderly-frontend&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2F&response_type=code&scope=openid"

echo ""
echo "=== Get fresh token ==="
TOKEN=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=orderly-frontend&username=admin1&password=admin" | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
echo "Token length: ${#TOKEN}"

echo ""
echo "=== API calls with token ==="
curl -s -o /dev/null -w "GET /api/stores   => HTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores
curl -s -o /dev/null -w "GET /api/products => HTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/products
curl -s -o /dev/null -w "GET /api/orders   => HTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/orders

echo ""
echo "=== Via nginx proxy ==="
curl -s -o /dev/null -w "Proxy /api/stores => HTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:4200/api/stores

echo ""
echo "=== No redirect loop check: frontend index.html loads without chained redirects ==="
REDIRECT_COUNT=$(curl -s -L -o /dev/null -w "%{num_redirects}" http://localhost:4200)
echo "Redirects to load frontend: $REDIRECT_COUNT (should be 0)"
