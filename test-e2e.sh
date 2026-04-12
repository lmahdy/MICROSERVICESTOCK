#!/bin/bash
set -e
echo "============================================"
echo "   ORDERLY E2E VERIFICATION TEST"
echo "============================================"
echo ""

# 1. Frontend HTML
echo "1. Frontend HTML serves correctly:"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200)
if [ "$STATUS" = "200" ]; then
  echo "   ✅ http://localhost:4200 → HTTP $STATUS"
else
  echo "   ❌ http://localhost:4200 → HTTP $STATUS"
fi
echo ""

# 2. Keycloak realm
echo "2. Keycloak realm accessible:"
KC_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9090/realms/orderly)
if [ "$KC_STATUS" = "200" ]; then
  echo "   ✅ Keycloak orderly realm → HTTP $KC_STATUS"
else
  echo "   ❌ Keycloak orderly realm → HTTP $KC_STATUS"
fi
echo ""

# 3. Get token
echo "3. Token acquisition:"
TOKEN_RESP=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -d "grant_type=password" \
  -d "client_id=orderly-frontend" \
  -d "username=admin1" \
  -d "password=admin")
TOKEN=$(echo "$TOKEN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
if [ -n "$TOKEN" ]; then
  echo "   ✅ Token acquired: ${TOKEN:0:40}..."
else
  echo "   ❌ Token acquisition failed"
  echo "   Response: $TOKEN_RESP"
  exit 1
fi
echo ""

# 4. Eureka
echo "4. Eureka discovery:"
EUREKA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8761/actuator/health)
echo "   Eureka health: HTTP $EUREKA_STATUS"
echo ""

# 5. Gateway with token (stores)
echo "5. Gateway API calls with token:"
STORES_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores)
echo "   GET /api/stores → HTTP $STORES_STATUS"

# 6. CRUD - Create a store
echo ""
echo "6. CRUD operations (stores):"
CREATE_RESP=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Demo Store","address":"123 Test St","phone":"555-0123","description":"Demo store for testing","openingHours":"9-5","rating":4.5}' \
  http://localhost:9016/api/stores)
CREATE_STATUS=$(echo "$CREATE_RESP" | tail -1)
CREATE_BODY=$(echo "$CREATE_RESP" | head -n -1)
echo "   CREATE store → HTTP $CREATE_STATUS"
echo "   Response: $CREATE_BODY"

# Extract store ID
STORE_ID=$(echo "$CREATE_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)

# 7. Read stores
echo ""
STORES_RESP=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:9016/api/stores)
echo "   READ stores → $STORES_RESP"

# 8. Update store
if [ -n "$STORE_ID" ] && [ "$STORE_ID" != "" ]; then
  echo ""
  UPDATE_RESP=$(curl -s -w "\n%{http_code}" -X PUT \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"name":"Updated Demo Store","address":"456 Updated St","phone":"555-9999","description":"Updated demo store","openingHours":"10-6","rating":5.0}' \
    "http://localhost:9016/api/stores/$STORE_ID")
  UPDATE_STATUS=$(echo "$UPDATE_RESP" | tail -1)
  UPDATE_BODY=$(echo "$UPDATE_RESP" | head -n -1)
  echo "   UPDATE store $STORE_ID → HTTP $UPDATE_STATUS"
  echo "   Response: $UPDATE_BODY"
fi

# 9. Gateway without token (should be 401)
echo ""
echo "7. Security check (no token):"
NOAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9016/api/stores)
echo "   GET /api/stores (no token) → HTTP $NOAUTH_STATUS"
echo ""

# 10. CORS check
echo "8. CORS preflight:"
CORS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  http://localhost:9016/api/stores)
echo "   OPTIONS /api/stores → HTTP $CORS_STATUS"
echo ""

# 11. Other services via gateway
echo "9. Other services via gateway:"
for endpoint in orders products users complaints deliveries notifications; do
  RESP=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "http://localhost:9016/api/$endpoint")
  echo "   GET /api/$endpoint → HTTP $RESP"
done
echo ""

# Delete test store
if [ -n "$STORE_ID" ] && [ "$STORE_ID" != "" ]; then
  echo "10. DELETE test store:"
  DEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE \
    -H "Authorization: Bearer $TOKEN" \
    "http://localhost:9016/api/stores/$STORE_ID")
  echo "    DELETE /api/stores/$STORE_ID → HTTP $DEL_STATUS"
  echo ""
fi

echo "============================================"
echo "   TEST COMPLETE"
echo "============================================"
