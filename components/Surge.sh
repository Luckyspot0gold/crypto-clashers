# 1. Deploy to Surge.sh
surge ./dist https://cryptoclashers.games --token YOUR_SURGE_TOKEN \
  --env VENICE_API_KEY,COINBASE_API_KEY

# 2. Verify DNS
dig +short cryptoclashers.games | grep "supabase.app"
# Expected: "✓ DNS verified"

# 3. SSL verification
curl -I https://cryptoclashers.games | grep "Strict-Transport-Security"
# Expected: "✓ SSL active"
