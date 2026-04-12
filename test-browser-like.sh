#!/bin/bash
# Get a fresh token
RESP=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=orderly-frontend&username=admin1&password=admin")

TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "ERROR: no token"
  exit 1
fi

echo "=== Test 1: Simple curl (already works) ==="
curl -s -o /dev/null -w "HTTP %{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores
echo ""

echo ""
echo "=== Test 2: Browser-like request with Origin header ==="
curl -s -o /dev/null -w "HTTP %{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://localhost:4200" \
  -H "Referer: http://localhost:4200/" \
  -H "Accept: application/json, text/plain, */*" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  http://localhost:9016/api/stores
echo ""

echo ""
echo "=== Test 3: Preflight OPTIONS ==="
curl -s -D - -o /dev/null -X OPTIONS \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  http://localhost:9016/api/stores

echo ""
echo "=== Test 4: Via nginx proxy (how Docker frontend sends requests) ==="
# When frontend is in Docker, browser goes to http://localhost:4200/api/stores 
# BUT the Angular app uses http://localhost:9016 directly, so this test is just for completeness
curl -s -o /dev/null -w "HTTP %{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://localhost:4200" \
  http://localhost:4200/api/stores
echo ""

echo ""
echo "=== Token kid (key ID) ==="
echo "$TOKEN" | cut -d. -f1 | base64 -d 2>/dev/null | python3 -m json.tool 2>/dev/null
