#!/bin/bash

GW="http://localhost:9016"

get_token() {
  local username=$1
  local password=$2
  curl -s -X POST http://localhost:9090/realms/orderly/protocol/openid-connect/token \
    --data-urlencode "grant_type=password" \
    --data-urlencode "client_id=orderly-frontend" \
    --data-urlencode "username=$username" \
    --data-urlencode "password=$password" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token', 'ERROR: ' + d.get('error_description','?')))"
}

call() {
  local method=$1; local url=$2; local token=$3; local body=$4
  if [ -n "$body" ]; then
    curl -s -w "\n[HTTP %{http_code}]\n" -X "$method" -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" -d "$body" "$url"
  else
    curl -s -w "\n[HTTP %{http_code}]\n" -X "$method" -H "Authorization: Bearer $token" "$url"
  fi
}

echo "======================================"
echo " ADMIN TOKEN (admin1 / ADMIN role)"
echo "======================================"
ADMIN_TOKEN=$(get_token admin1 admin)
echo "Token: ${ADMIN_TOKEN:0:50}..."

echo ""
echo "--- GET /api/stores (admin) ---"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:9016/api/stores

echo ""
echo "--- POST /api/stores (admin) ---"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" \
  -X POST -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  -d '{"name":"AdminStore","description":"created by admin","address":"1 Admin St","phone":"0000"}' \
  http://localhost:9016/api/stores

echo ""
echo "======================================"
echo " CLIENT TOKEN (client1 / CLIENT role)"
echo "======================================"
CLIENT_TOKEN=$(get_token client1 client)
echo "Token: ${CLIENT_TOKEN:0:50}..."

echo ""
echo "--- GET /api/stores (client) ---"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -H "Authorization: Bearer $CLIENT_TOKEN" http://localhost:9016/api/stores

echo ""
echo "--- GET /api/products (client) ---"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -H "Authorization: Bearer $CLIENT_TOKEN" http://localhost:9016/api/products

echo ""
echo "--- GET /api/orders (client) ---"
call GET "$GW/api/orders" "$CLIENT_TOKEN"

echo ""
echo "======================================"
echo " ORDER CRUD (admin token)"
echo "======================================"
ADMIN_TOKEN2=$(get_token admin1 admin)

echo ""
echo "--- 1) GET all orders ---"
call GET "$GW/api/orders" "$ADMIN_TOKEN2"

echo ""
echo "--- 2) POST create order ---"
CREATE_RESP=$(curl -s -X POST "$GW/api/orders" \
  -H "Authorization: Bearer $ADMIN_TOKEN2" \
  -H "Content-Type: application/json" \
  -d '{"clientId":"client1","storeId":1,"deliveryAddress":"12 Demo St","items":[{"productId":1,"quantity":2}]}')
echo "$CREATE_RESP"
ORDER_ID=$(echo "$CREATE_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))" 2>/dev/null)
echo "[Order created with ID: $ORDER_ID]"

echo ""
echo "--- 3) GET order by ID ---"
call GET "$GW/api/orders/$ORDER_ID" "$ADMIN_TOKEN2"

echo ""
echo "--- 4) GET orders by client ---"
call GET "$GW/api/orders/client/client1" "$ADMIN_TOKEN2"

echo ""
echo "--- 5) GET order products (Feign: order-service -> product-service) ---"
call GET "$GW/api/orders/$ORDER_ID/products" "$ADMIN_TOKEN2"

echo ""
echo "--- 6) PUT update order ---"
call PUT "$GW/api/orders/$ORDER_ID" "$ADMIN_TOKEN2" \
  '{"clientId":"client1","storeId":1,"deliveryAddress":"99 Updated Ave","items":[{"productId":1,"quantity":3}]}'

echo ""
echo "--- 7) PATCH update status -> CONFIRMED ---"
call PATCH "$GW/api/orders/$ORDER_ID/status/CONFIRMED" "$ADMIN_TOKEN2"

echo ""
echo "--- 8) PATCH update status -> PREPARING ---"
call PATCH "$GW/api/orders/$ORDER_ID/status/PREPARING" "$ADMIN_TOKEN2"

echo ""
echo "--- 9) PATCH update status -> CANCELLED ---"
call PATCH "$GW/api/orders/$ORDER_ID/status/CANCELLED" "$ADMIN_TOKEN2"

echo ""
echo "--- 10) DELETE order ---"
curl -s -o /dev/null -w "[HTTP %{http_code}] DELETE /api/orders/$ORDER_ID\n" \
  -X DELETE -H "Authorization: Bearer $ADMIN_TOKEN2" "$GW/api/orders/$ORDER_ID"

echo ""
echo "--- 11) GET deleted order (expect 404) ---"
call GET "$GW/api/orders/$ORDER_ID" "$ADMIN_TOKEN2"
