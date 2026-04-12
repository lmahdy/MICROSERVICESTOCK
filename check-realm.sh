#!/bin/bash
cd /mnt/d/0asfaromaima
python3 -c "
import json
r = json.load(open('orderly-realm.json'))
users = r.get('users', [])
for u in users:
    print(f\"username: {u.get('username')}, enabled: {u.get('enabled')}\")
    for c in u.get('credentials', []):
        print(f\"  credential value: {c.get('value','?')}, type: {c.get('type','?')}\")

# Check client config
clients = r.get('clients', [])
for c in clients:
    cid = c.get('clientId','')
    if 'orderly' in cid.lower():
        print(f\"\\nclient: {cid}, directAccessGrants: {c.get('directAccessGrantsEnabled')}, publicClient: {c.get('publicClient')}\")
"
