#!/usr/bin/env bash
set -euo pipefail

# Deploy the already-built OpenNext artifact using the production Wrangler environment.
npx opennextjs-cloudflare deploy --env production
