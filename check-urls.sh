#!/bin/bash
docker exec frontend sh -c 'grep -oE "http://localhost[^\"]*" /usr/share/nginx/html/chunk-UBZAYPKD.js'
echo "---"
docker exec frontend sh -c 'grep -oE "http://localhost[^\"]*" /usr/share/nginx/html/chunk-KIDBFGOQ.js'
