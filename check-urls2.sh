#!/bin/bash
# Check for the keycloak and gateway config in the built JS
docker exec frontend sh -c 'grep -oE "http://localhost:[0-9]+" /usr/share/nginx/html/chunk-UBZAYPKD.js' 2>&1
echo "---UBZAYPKD done---"
docker exec frontend sh -c 'grep -oE "http://localhost:[0-9]+" /usr/share/nginx/html/chunk-KIDBFGOQ.js' 2>&1
echo "---KIDBFGOQ done---"
# Search all JS files for the keycloak URL
for f in $(docker exec frontend sh -c 'ls /usr/share/nginx/html/*.js'); do
  result=$(docker exec frontend sh -c "grep -c '9090' $f" 2>/dev/null)
  if [ "$result" != "0" ] && [ -n "$result" ]; then
    echo "Found 9090 in: $f ($result matches)"
  fi
done
echo "---9090 search done---"
# Also check main bundle
docker exec frontend sh -c 'grep -oE "http://localhost:[0-9]+" /usr/share/nginx/html/main-36UHIGWG.js' 2>&1
echo "---main done---"
