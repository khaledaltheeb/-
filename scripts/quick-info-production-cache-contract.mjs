#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(path, 'utf8');
const [workflow, config, fingerprint, cached, generator] = await Promise.all([
  read('.github/workflows/deploy-production.yml'),
  read('.github/open-next-production-cache.config.ts'),
  read('scripts/quick-info-social-cache-key.mjs'),
  read('scripts/build-quick-info-cards-cached.mjs'),
  read('scripts/build-quick-info-cards.mjs'),
]);

const failures = [];
const requireText = (source, needle, message) => {
  if (!source.includes(needle)) failures.push(message);
};
const forbidText = (source, needle, message) => {
  if (source.includes(needle)) failures.push(message);
};

requireText(workflow, 'node scripts/quick-info-social-cache-key.mjs', 'production must fingerprint published Quick Info before image-cache restore');
requireText(workflow, 'quick-info-social-${{ runner.os }}-${{ steps.quick-info-fingerprint.outputs.fingerprint }}', 'production Quick Info cache must use the exact content fingerprint');
requireText(workflow, "if: steps.quick-info-cache.outputs.cache-hit != 'true'", 'image runtime packages must install only on an exact cache miss');
requireText(workflow, "QUICK_INFO_SOCIAL_IMAGES_REQUIRED: 'true'", 'production must fail closed if approved Quick Info cannot be materialized');
requireText(workflow, 'QUICK_INFO_SOCIAL_CACHE_HIT: ${{ steps.quick-info-cache.outputs.cache-hit }}', 'the OpenNext build must receive the exact cache-hit state');
requireText(workflow, '--openNextConfigPath .github/open-next-production-cache.config.ts', 'production OpenNext must use the cached image build command');
requireText(workflow, '/quick-info/og/${quick_info_slug}.png', 'live verification must probe a Quick Info OG image');
requireText(workflow, '/quick-info/discover/${quick_info_slug}.png', 'live verification must probe a Quick Info Discover image');
forbidText(workflow, 'quick-info-social-${{ runner.os }}-\n', 'Quick Info image cache must not use a stale prefix restore key');

requireText(config, 'node scripts/build-quick-info-cards-cached.mjs', 'production OpenNext config must invoke the cache-aware image builder');
requireText(config, 'npx next build', 'production OpenNext config must still perform the full Next production build');
requireText(fingerprint, "'scripts/build-quick-info-cards-cached.mjs'", 'cache validator changes must invalidate the image fingerprint');
requireText(fingerprint, "url.searchParams.set('limit', '1000')", 'Quick Info fingerprint must cover the current publication scale beyond 500 pages');
requireText(generator, "url.searchParams.set('limit', '1000')", 'Quick Info image generation must cover the current publication scale beyond 500 pages');
requireText(cached, "stat(path)).size", 'restored Quick Info cache must verify every image file is non-empty');
requireText(cached, 'manifest.items.length !== manifest.count', 'restored Quick Info cache must validate manifest cardinality');

if (failures.length) {
  for (const failure of failures) console.error(`QUICK_INFO_PRODUCTION_CACHE_CONTRACT: ${failure}`);
  process.exit(1);
}

console.log('Quick Info production cache contract passed: 1000-page coverage, exact fingerprinting, fail-closed generation, deep cache validation, conditional image runtime, cached OpenNext build, and live OG/Discover probes are wired.');
