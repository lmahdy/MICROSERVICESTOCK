#!/bin/bash
# Check environment URLs in the built chunk
docker exec frontend sh -c 'grep -o "http://localhost:[0-9]*" /usr/share/nginx/html/chunk-KIDBFGOQ.js' | sort -u
