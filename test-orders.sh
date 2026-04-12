#!/bin/bash

GW="http://localhost:9016"
KC="http://localhost:9090"

# ── helpers ────────────────────────────────────────────────
get_token() {
  curl -s -X POST "$KC/realms/orderly/protocol/openid-connect/token" \
    --data-urlencode "grant_type=password" \
    --data-urlencode "client_id=orderly-frontend" \
    --data-urlencode "username=$1" \
    --data-urlencode "password=$2" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token','ERROR: '+d.get('error_description','?')))"
}

call() {
  local method=$1 url=$2 token=$3 body=$4
  echo -n "  → "
  if [ -n "$body" ]; then
    curl -s -w "[HTTP %{http_code}]\n" -X "$method" \
      -H "Authorization: Bearer $token" \
      -H "Content-Type: application/json" \
      -d "$body" "$url"
  else
    curl -s -w "[HTTP %{http_code}]\n" -X "$method" \
      -H "Authorization: Bearer $token" "$url"
  fi
}

# ── get token ──────────────────────────────────────────────
echo "Getting admin token..."
TOKEN=$(get_token admin1 admin)
echo "  → Token: ${TOKEN:0:60}..."

# ── 1. GET all ─────────────────────────────────────────────
echo ""
echo "[1] GET all orders"
call GET "$GW/api/orders" "$TOKEN"

# ── 2. POST create ─────────────────────────────────────────
echo ""
echo "[2] POST create order"
RESP=$(curl -s -X POST "$GW/api/orders" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client1",
    "storeId": 1,
    "deliveryAddress": "12 Demo Street",
    "items": [
      { "productId": 1, "quantity": 2 }
    ]
  }')
echo "  → $RESP"
ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))" 2>/dev/null)
echo "  → Created order ID: $ID"

# ── 3. GET by ID ───────────────────────────────────────────
echo ""
echo "[3] GET order by ID ($ID)"
call GET "$GW/api/orders/$ID" "$TOKEN"

# ── 4. GET by client ───────────────────────────────────────
echo ""
echo "[4] GET orders by client (client1)"
call GET "$GW/api/orders/client/client1" "$TOKEN"

# ── 5. GET products via Feign ──────────────────────────────
echo ""
echo "[5] GET order products — Feign call to product-service"
call GET "$GW/api/orders/$ID/products" "$TOKEN"

# ── 6. PUT update ──────────────────────────────────────────
echo ""
echo "[6] PUT update order (change address + quantity)"
call PUT "$GW/api/orders/$ID" "$TOKEN" \
  '{"clientId":"client1","storeId":1,"deliveryAddress":"99 Updated Ave","items":[{"productId":1,"quantity":3}]}'

# ── 7-9. PATCH status changes ──────────────────────────────
echo ""
echo "[7] PATCH status → CONFIRMED"
call PATCH "$GW/api/orders/$ID/status/CONFIRMED" "$TOKEN"

echo ""
echo "[8] PATCH status → PREPARING"
call PATCH "$GW/api/orders/$ID/status/PREPARING" "$TOKEN"

echo ""
echo "[9] PATCH status → CANCELLED"
call PATCH "$GW/api/orders/$ID/status/CANCELLED" "$TOKEN"

# ── 10. DELETE ─────────────────────────────────────────────
echo ""
echo "[10] DELETE order ($ID)"
curl -s -o /dev/null -w "  → [HTTP %{http_code}]\n" \
  -X DELETE -H "Authorization: Bearer $TOKEN" "$GW/api/orders/$ID"

# ── 11. GET deleted → expect 404 ──────────────────────────
echo ""
echo "[11] GET deleted order — expect 404"
call GET "$GW/api/orders/$ID" "$TOKEN"

echo ""
echo "Done."
