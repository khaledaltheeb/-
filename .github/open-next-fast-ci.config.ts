import { defineCloudflareConfig } from '@opennextjs/cloudflare';

const config = defineCloudflareConfig();

const fastCiConfig = {
  ...config,
  buildCommand: [
    'node scripts/build_psych_encyclopedia_assets.mjs',
    'node scripts/build-daily-tools-route-manifest.mjs',
    'node scripts/build_expanded_encyclopedia_assets.mjs',
    'node scripts/materialize-legacy-static-assets.mjs',
    'npx next build',
  ].join(' && '),
};

export default fastCiConfig;
