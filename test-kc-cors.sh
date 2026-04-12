#!/bin/bash
echo "=== Keycloak CORS on token endpoint ==="
curl -sv -X OPTIONS \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  "http://localhost:9090/realms/orderly/protocol/openid-connect/token" 2>&1 | grep -E "HTTP/|Access-Control|Vary"

echo ""
echo "=== Keycloak OIDC discovery (browser check) ==="
curl -sv -H "Origin: http://localhost:4200" \
  "http://localhost:9090/realms/orderly" 2>&1 | grep -E "HTTP/|Access-Control"
