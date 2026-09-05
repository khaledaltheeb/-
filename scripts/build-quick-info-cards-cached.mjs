#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const CACHE_HIT = process.env.QUICK_INFO_SOCIAL_CACHE_HIT === 'true';
const ROOT = process.cwd();
const MANIFEST = join(ROOT, 'public', 'quick-info', 'social-images-manifest.json');
const OG_DIR = join(ROOT, 'public', 'quick-info', 'og');
const DISCOVER_DIR = join(ROOT, 'public', 'quick-info', 'discover');

async function cachedOutputLooksValid() {
  try {
    await Promise.all([access(MANIFEST), access(OG_DIR), access(DISCOVER_DIR)]);
    const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'));
    return Number.isInteger(manifest?.count) && manifest.count > 0 && Array.isArray(manifest?.items) && manifest.items.length === manifest.count;
  } catch {
    return false;
  }
}

if (CACHE_HIT && await cachedOutputLooksValid()) {
  console.log('[quick-info-social] cache hit: reusing fingerprint-matched social images.');
  process.exit(0);
}

const result = spawnSync(process.execPath, [join(ROOT, 'scripts', 'build-quick-info-cards.mjs')], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) throw result.error;
process.exit(result.status ?? 1);
