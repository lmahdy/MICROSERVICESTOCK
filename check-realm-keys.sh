#!/bin/bash
cd /mnt/d/0asfaromaima
python3 << 'EOF'
import json

with open('orderly-realm.json') as f:
    realm = json.load(f)

# Check for keys
keys = realm.get('keys', [])
print(f"Top-level 'keys' count: {len(keys)}")

# Check for components/keys
components = realm.get('components', {})
print(f"Components keys: {list(components.keys())}")

rsa_keys = components.get('org.keycloak.keys.KeyProvider', [])
print(f"Key providers count: {len(rsa_keys)}")
for kp in rsa_keys:
    print(f"  - name: {kp.get('name')}, providerId: {kp.get('providerId')}")
    config = kp.get('config', {})
    for ck, cv in config.items():
        if 'key' in ck.lower() or 'secret' in ck.lower() or 'cert' in ck.lower():
            val = cv[0] if isinstance(cv, list) and cv else cv
            print(f"    {ck}: {str(val)[:80]}...")

# Check if realm has authentication sessions or session info
print(f"\nRealm name: {realm.get('realm')}")
print(f"Has 'sessions': {'sessions' in realm}")
print(f"Access token lifespan: {realm.get('accessTokenLifespan', 'default')}")
print(f"SSO Session idle timeout: {realm.get('ssoSessionIdleTimeout', 'default')}")
EOF
