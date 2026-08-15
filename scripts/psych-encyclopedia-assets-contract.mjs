#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'public', 'encyclopedia-data');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => {
  console.error(`ENCYCLOPEDIA ASSET CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

const release = read('lib/psych-encyclopedia-release.ts');
const encyclopedia = read('lib/encyclopedia.ts');
const search = read('app/search/page.tsx');
const packageJson = JSON.parse(read('package.json'));
const wrangler = read('wrangler.jsonc');
const nextConfig = read('next.config.ts');
const gitignore = read('.gitignore');

if (/data\/encyclopedia\/batches|import\s+batch\d+/u.test(release)) fail('runtime release module must not import editorial JSON batches');
for (const forbidden of ['indexPromise', 'recordPromises']) {
  if (release.includes(forbidden)) fail(`runtime asset I/O must remain request-scoped; found ${forbidden}`);
}
for (const required of ['getCloudflareContext', "const ASSET_ROOT = '/encyclopedia-data'", 'assets.fetch', 'readLocalAsset']) {
  if (!release.includes(required)) fail(`runtime release module missing ${required}`);
}
for (const required of ['getPsychEncyclopediaReleaseIndex', 'await getPsychEncyclopediaReleaseRecord']) {
  if (!encyclopedia.includes(required)) fail(`encyclopedia integration missing ${required}`);
}
if (!search.includes('getPsychEncyclopediaReleaseIndex')) fail('search must use the lightweight static release index');
if (!String(packageJson.scripts?.build ?? '').startsWith('node scripts/build_psych_encyclopedia_assets.mjs && ')) fail('build must generate static encyclopedia assets first');
if (!String(packageJson.scripts?.dev ?? '').startsWith('node scripts/build_psych_encyclopedia_assets.mjs && ')) fail('development must generate static encyclopedia assets first');
if (!wrangler.includes('"binding": "ASSETS"')) fail('Wrangler must expose the Workers Static Assets binding');
if (!nextConfig.includes("if (process.env.NODE_ENV === 'development')")) fail('OpenNext dev initialization must not run during production builds');
if (!gitignore.includes('public/encyclopedia-data/')) fail('generated encyclopedia assets must remain ignored build output');

try {
  const builderOutput = execFileSync(process.execPath, [path.join(root, 'scripts', 'build_psych_encyclopedia_assets.mjs')], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'), 'utf8'));
  const index = JSON.parse(fs.readFileSync(path.join(output, 'index.json'), 'utf8'));
  const recordDir = path.join(output, 'records');
  const recordFiles = fs.readdirSync(recordDir).filter((name) => name.endsWith('.json')).sort();

  if (manifest.storage !== 'workers-static-assets') fail('asset manifest storage contract is invalid');
  if (manifest.records !== 50 || index.length !== 50 || recordFiles.length !== 50) {
    fail(`expected 50 records; manifest=${manifest.records}, index=${index.length}, files=${recordFiles.length}`);
  }
  const slugs = new Set();
  for (const item of index) {
    if (!item || typeof item.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) fail('index contains an invalid slug');
    if (slugs.has(item.slug)) fail(`duplicate index slug ${item.slug}`);
    slugs.add(item.slug);
    if (item.canonical_url !== `/encyclopedia/${item.slug}/`) fail(`invalid canonical for ${item.slug}`);
    if (!recordFiles.includes(`${item.slug}.json`)) fail(`missing record asset for ${item.slug}`);
  }
  if (!builderOutput.includes('50 records / 25 batches')) fail('builder did not report the expected deterministic release');
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}

if (!process.exitCode) console.log('Psychological encyclopedia Workers Static Assets contract passed.');
