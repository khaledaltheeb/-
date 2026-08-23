#!/usr/bin/env bash
set -euo pipefail

# Public build-time configuration for the canonical production hostname.
export NEXT_PUBLIC_SUPABASE_URL='https://ghljwfwqsyfnthvlzxjy.supabase.co'
export NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='sb_publishable__GMG8aQnofuk_6RLm3UfUg_fIzuSzSs'
export NEXT_PUBLIC_SITE_URL='https://healthrenewal.org'
export NEXT_PUBLIC_ALLOW_INDEXING='true'
export NEXT_PUBLIC_ENABLE_ANALYTICS='false'

node scripts/build_psych_encyclopedia_assets.mjs
node scripts/build_expanded_encyclopedia_assets.mjs
node scripts/materialize-legacy-static-assets.mjs
node scripts/build-daily-tools-sitemap.mjs

npx opennextjs-cloudflare build --env production
