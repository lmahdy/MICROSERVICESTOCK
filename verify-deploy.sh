#!/bin/bash
echo "=== 1. Frontend serves homepage ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:4200

echo "=== 2. Diagnostic page serves ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:4200/diag.html

echo "=== 3. New interceptor deployed (check for lastLoginRedirect) ==="
docker exec frontend sh -c 'grep -l "lastLoginRedirect" /usr/share/nginx/html/main-*.js' 2>/dev/null
docker exec frontend sh -c 'grep -c "30000\|30_000" /usr/share/nginx/html/main-*.js' 2>/dev/null

echo "=== 4. No redirect loop check ==="
REDIR=$(curl -s -L -o /dev/null -w "%{num_redirects}" http://localhost:4200)
echo "Redirects: $REDIR (should be 0)"

echo "=== 5. API with fresh token ==="
TOKEN=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=orderly-frontend&username=admin1&password=admin" | \
  python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
curl -s -o /dev/null -w "GET /api/stores => HTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores
curl -s -o /dev/null -w "Via nginx proxy => HTTP %{http_code}\n" -H "Authorization: Bearer $TOKEN" http://localhost:4200/api/stores
