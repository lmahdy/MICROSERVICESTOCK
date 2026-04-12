#!/bin/bash
# Check all URLs across all built JS files
for f in /usr/share/nginx/html/*.js; do
  urls=$(grep -o 'http://localhost:[0-9]*' "$f" | sort -u)
  if [ -n "$urls" ]; then
    echo "=== $(basename $f) ==="
    echo "$urls"
  fi
done
