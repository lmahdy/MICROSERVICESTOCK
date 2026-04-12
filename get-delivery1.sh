#!/bin/bash
ADMIN_TOKEN=$(curl -s -X POST "http://localhost:9090/realms/master/protocol/openid-connect/token" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" \
  -d "username=admin" \
  -d "password=admin" | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "http://localhost:9090/admin/realms/orderly/users?username=delivery1" | python3 -m json.tool
