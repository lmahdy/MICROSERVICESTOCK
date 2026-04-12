#!/bin/bash
echo "============================================"
echo "  REAL DIAGNOSTIC: External vs Internal JWK"
echo "============================================"

echo ""
echo "=== 1. Who is listening on port 9090 on HOST? ==="
echo "(Could be Docker OR a local Keycloak)"
ss -tlnp 2>/dev/null | grep 9090 || netstat -tlnp 2>/dev/null | grep 9090 || echo "Could not determine"

echo ""
echo "=== 2. External JWK (what browser's Keycloak uses) ==="
echo "URL: http://localhost:9090/realms/orderly/protocol/openid-connect/certs"
EXT_JWK=$(curl -s http://localhost:9090/realms/orderly/protocol/openid-connect/certs)
echo "$EXT_JWK" | python3 -c "
import sys,json
data = json.load(sys.stdin)
for key in data.get('keys',[]):
    if key.get('use') == 'sig':
        print(f\"  EXTERNAL sig kid: {key.get('kid')}\")
    else:
        print(f\"  EXTERNAL {key.get('use')} kid: {key.get('kid')}\")
" 2>/dev/null

echo ""
echo "=== 3. Internal JWK (what gateway fetches inside Docker) ==="
echo "URL: http://keycloak:8080/realms/orderly/protocol/openid-connect/certs"
INT_JWK=$(docker exec gateway curl -s http://keycloak:8080/realms/orderly/protocol/openid-connect/certs 2>/dev/null)
echo "$INT_JWK" | python3 -c "
import sys,json
data = json.load(sys.stdin)
for key in data.get('keys',[]):
    if key.get('use') == 'sig':
        print(f\"  INTERNAL sig kid: {key.get('kid')}\")
    else:
        print(f\"  INTERNAL {key.get('use')} kid: {key.get('kid')}\")
" 2>/dev/null

echo ""
echo "=== 4. Do external and internal sig keys MATCH? ==="
EXT_SIG=$(echo "$EXT_JWK" | python3 -c "import sys,json; [print(k['kid']) for k in json.load(sys.stdin)['keys'] if k.get('use')=='sig']" 2>/dev/null)
INT_SIG=$(echo "$INT_JWK" | python3 -c "import sys,json; [print(k['kid']) for k in json.load(sys.stdin)['keys'] if k.get('use')=='sig']" 2>/dev/null)
if [ "$EXT_SIG" = "$INT_SIG" ]; then
    echo "  MATCH: Both use kid=$EXT_SIG"
else
    echo "  *** MISMATCH ***"
    echo "  External (browser) sig kid: $EXT_SIG"
    echo "  Internal (gateway) sig kid: $INT_SIG"
    echo "  THIS IS THE ROOT CAUSE!"
fi

echo ""
echo "=== 5. Check if a LOCAL (non-Docker) keycloak is running ==="
# Check if keycloak-26.5.3/bin is running a process
ps aux 2>/dev/null | grep -i keycloak | grep -v grep | head -5 || echo "No local keycloak process found"

echo ""
echo "=== 6. What Docker container owns port 9090? ==="
docker ps --format '{{.Names}} {{.Ports}}' 2>/dev/null | grep 9090

echo ""
echo "=== 7. Keycloak realm issuer URL (from well-known) ==="
curl -s http://localhost:9090/realms/orderly/.well-known/openid-configuration | python3 -c "
import sys,json
data = json.load(sys.stdin)
print(f\"  issuer: {data.get('issuer')}\")
print(f\"  jwks_uri: {data.get('jwks_uri')}\")
print(f\"  token_endpoint: {data.get('token_endpoint')}\")
" 2>/dev/null

echo ""
echo "=== 8. Gateway runtime env vars ==="
docker exec gateway printenv | grep -i 'ISSUER\|JWK\|KEYCLOAK\|SECURITY' 2>/dev/null

echo ""
echo "=== 9. Get a fresh token and decode its kid ==="
RESP=$(curl -s -X POST "http://localhost:9090/realms/orderly/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=orderly-frontend&username=admin1&password=admin")
TOKEN=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null)
if [ -n "$TOKEN" ]; then
    echo "$TOKEN" | cut -d. -f1 | base64 -d 2>/dev/null | python3 -c "
import sys,json
data = json.load(sys.stdin)
print(f\"  Fresh token kid: {data.get('kid')}\")
print(f\"  Fresh token alg: {data.get('alg')}\")
" 2>/dev/null
fi

echo ""
echo "=== 10. Keycloak container internal realm check ==="
docker exec keycloak curl -s http://localhost:8080/realms/orderly/.well-known/openid-configuration 2>/dev/null | python3 -c "
import sys,json
data = json.load(sys.stdin)
print(f\"  Container internal issuer: {data.get('issuer')}\")
print(f\"  Container internal jwks_uri: {data.get('jwks_uri')}\")
" 2>/dev/null

echo ""
echo "============================================"
echo "         DIAGNOSTIC COMPLETE"
echo "============================================"
