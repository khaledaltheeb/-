#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { access, readFile, stat } from 'node:fs/promises';
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
    if (!Number.isInteger(manifest?.version) || manifest.version < 10) return false;
    if (!Number.isInteger(manifest?.count) || manifest.count <= 0) return false;
    if (!Array.isArray(manifest?.items) || manifest.items.length !== manifest.count) return false;

    const paths = [];
    for (const item of manifest.items) {
      const slug = String(item?.slug || '');
      if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) return false;
      paths.push(join(OG_DIR, `${slug}.png`), join(DISCOVER_DIR, `${slug}.png`));
    }

    const sizes = await Promise.all(paths.map(async (path) => (await stat(path)).size));
    return sizes.every((size) => size > 0);
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
