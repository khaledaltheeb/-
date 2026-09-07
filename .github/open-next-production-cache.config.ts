import { defineCloudflareConfig } from '@opennextjs/cloudflare';

const config = defineCloudflareConfig();

const productionCacheConfig = {
  ...config,
  buildCommand: [
    'node scripts/build_psych_encyclopedia_assets.mjs',
    'node scripts/build-quick-info-cards-cached.mjs',
    'node scripts/build-daily-tools-route-manifest.mjs',
    'node scripts/build_expanded_encyclopedia_assets.mjs',
    'node scripts/materialize-legacy-static-assets.mjs',
    'node scripts/export-kids-lab-static-svg.mjs',
    'npx next build',
    'node scripts/materialize-kids-lab-static-html.mjs',
    'node scripts/materialize-practical-resources-static-html.mjs',
  ].join(' && '),
};

export default productionCacheConfig;
