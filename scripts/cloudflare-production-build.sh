#!/usr/bin/env bash
set -euo pipefail

# Public build-time configuration for the canonical production hostname.
export NEXT_PUBLIC_SUPABASE_URL='https://ghljwfwqsyfnthvlzxjy.supabase.co'
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='sb_publishable__GMG8aQnofuk_6RLm3UfUg_fIzuSzSs'
export NEXT_PUBLIC_SITE_URL='https://healthrenewal.org'
export NEXT_PUBLIC_ALLOW_INDEXING='true'

# Production-only analytics. Keep local/staging analytics disabled so test traffic
# does not contaminate the canonical production property.
export NEXT_PUBLIC_ENABLE_ANALYTICS='true'
export NEXT_PUBLIC_GTM_ID='GTM-WBLQVBG4'
export NEXT_PUBLIC_GA_MEASUREMENT_ID='G-VLZMV8Y4JP'
export NEXT_PUBLIC_ENABLE_DIRECT_GA='true'

node scripts/build_psych_encyclopedia_assets.mjs
node scripts/build_expanded_encyclopedia_assets.mjs
node scripts/materialize-legacy-static-assets.mjs

npx opennextjs-cloudflare build --env production
