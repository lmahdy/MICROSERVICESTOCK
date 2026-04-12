#!/bin/bash
echo "=== Verify frontend is serving correctly ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4200)
echo "Frontend homepage: HTTP $CODE"

echo ""
echo "=== Verify updated auth interceptor is in the build ==="
docker exec frontend sh -c 'grep -c "force re-login" /usr/share/nginx/html/chunk-*.js /usr/share/nginx/html/main-*.js 2>/dev/null'
# Check for EMPTY import (our change imports EMPTY from rxjs)
docker exec frontend sh -c 'grep -l "EMPTY" /usr/share/nginx/html/main-*.js /usr/share/nginx/html/chunk-*.js 2>/dev/null'

echo ""
echo "=== Verify keycloak login page is accessible ==="
CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:9090/realms/orderly/protocol/openid-connect/auth?client_id=orderly-frontend&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2F&response_type=code&scope=openid")
echo "Keycloak login page: HTTP $CODE"

echo ""
echo "=== Gateway health ==="
curl -s http://localhost:9016/actuator/health | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Gateway status: {d[\"status\"]}')" 2>/dev/null
