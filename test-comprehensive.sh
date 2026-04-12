#!/bin/bash
echo "============================================"
echo "   COMPREHENSIVE JWT + GATEWAY TEST"
echo "============================================"
echo ""

# 1. Get a fresh token from the newly restarted keycloak
echo "=== Step 1: Get fresh token from Keycloak ==="
RESP=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=orderly-frontend&username=admin1&password=admin")

TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)

if [ -z "$TOKEN" ] || [ "$TOKEN" = "" ]; then
  echo "FAIL: Could not get token from Keycloak"
  echo "$RESP"
  exit 1
fi
echo "OK: Got token (length: ${#TOKEN})"

# Decode token header to show kid
echo ""
echo "=== Step 2: Token header (kid) ==="
echo "$TOKEN" | cut -d. -f1 | base64 -d 2>/dev/null | python3 -m json.tool 2>/dev/null

# Decode token payload to show issuer
echo ""
echo "=== Step 3: Token payload (iss) ==="
echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | python3 -c "
import sys,json
data = json.load(sys.stdin)
print(f\"  iss: {data.get('iss')}\")
print(f\"  azp: {data.get('azp')}\")
print(f\"  exp: {data.get('exp')}\")
print(f\"  sub: {data.get('sub')}\")
print(f\"  name: {data.get('name')}\")
" 2>/dev/null

# 2. Verify JWK endpoint has the matching kid
echo ""
echo "=== Step 4: JWK endpoint kid(s) ==="
curl -s http://localhost:9090/realms/orderly/protocol/openid-connect/certs | python3 -c "
import sys,json
data = json.load(sys.stdin)
for key in data.get('keys',[]):
    print(f\"  kid: {key.get('kid')}, use: {key.get('use')}, alg: {key.get('alg')}\")
" 2>/dev/null

# 3. Test gateway endpoints
echo ""
echo "=== Step 5: Gateway endpoint tests ==="

test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  
  if [ -n "$data" ]; then
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "$data" "$url")
  else
    CODE=$(curl -s -o /dev/null -w "%{http_code}" -X $method -H "Authorization: Bearer $TOKEN" "$url")
  fi
  
  if [ "$CODE" = "200" ] || [ "$CODE" = "201" ]; then
    echo "  PASS: $name => HTTP $CODE"
  else
    echo "  FAIL: $name => HTTP $CODE"
  fi
}

test_endpoint "GET /api/stores" GET "http://localhost:9016/api/stores"
test_endpoint "GET /api/products" GET "http://localhost:9016/api/products"
test_endpoint "GET /api/orders" GET "http://localhost:9016/api/orders"
test_endpoint "GET /api/users" GET "http://localhost:9016/api/users"
test_endpoint "GET /api/notifications" GET "http://localhost:9016/api/notifications"
test_endpoint "GET /api/deliveries" GET "http://localhost:9016/api/deliveries"
test_endpoint "GET /api/complaints" GET "http://localhost:9016/api/complaints"
test_endpoint "POST /api/stores (create)" POST "http://localhost:9016/api/stores" '{"name":"CurlTestStore","description":"test","address":"demo"}'

# 4. Test with browser-like headers
echo ""
echo "=== Step 6: Browser-like requests ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Origin: http://localhost:4200" \
  -H "Referer: http://localhost:4200/" \
  http://localhost:9016/api/stores)
echo "  Browser-like GET /api/stores => HTTP $CODE"

# 5. Test via nginx proxy (frontend container)
echo ""
echo "=== Step 7: Via frontend nginx proxy ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:4200/api/stores)
echo "  Nginx proxy GET /api/stores => HTTP $CODE"

echo ""
echo "============================================"
echo "   ALL TESTS COMPLETE"
echo "============================================"
