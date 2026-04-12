#!/bin/bash
# Test actual CORS GET request (not HEAD)
TOKEN=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -d "grant_type=password" \
  -d "client_id=orderly-frontend" \
  -d "username=admin1" \
  -d "password=admin" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "=== GET with Origin + Token ==="
curl -sv \
  -H "Origin: http://localhost:4200" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:9016/api/stores 2>&1 | grep -E "^[<>*]|HTTP|Access-Control|Vary|Authorization"

echo ""
echo "=== GET without Origin (control test) ==="
curl -sv \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:9016/api/stores 2>&1 | grep -E "^[<>*]|HTTP|Access-Control"
