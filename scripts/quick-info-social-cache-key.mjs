#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { appendFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase public credentials are required to compute the Quick Info image cache fingerprint.');
}

const localInputs = [
  'scripts/build-quick-info-cards.mjs',
  'scripts/build-quick-info-cards-cached.mjs',
  'data/quick-info-visuals.json',
  'public/assets/brand/logo-mark.svg',
];

const url = new URL(`${SUPABASE_URL}/rest/v1/content`);
url.searchParams.set('select', 'slug,title,excerpt,canonical_url,schema_json,status,robots_index,published_at');
url.searchParams.set('slug', 'like.quick-info-*');
url.searchParams.set('status', 'eq.published');
url.searchParams.set('robots_index', 'eq.true');
url.searchParams.set('published_at', `lte.${new Date().toISOString()}`);
url.searchParams.set('order', 'title.asc');
url.searchParams.set('limit', '500');

const response = await fetch(url, {
  headers: {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Accept: 'application/json',
  },
});

if (!response.ok) {
  throw new Error(`Quick Info fingerprint query failed (${response.status}).`);
}

const rows = await response.json();
if (!Array.isArray(rows)) throw new Error('Quick Info fingerprint query returned a non-array payload.');

const hash = createHash('sha256');
hash.update(JSON.stringify(rows));
for (const relativePath of localInputs) {
  hash.update(`\n--${relativePath}--\n`);
  hash.update(await readFile(join(process.cwd(), relativePath)));
}

const fingerprint = hash.digest('hex');
console.log(fingerprint);

if (process.env.GITHUB_OUTPUT) {
  await appendFile(process.env.GITHUB_OUTPUT, `fingerprint=${fingerprint}\n`, 'utf8');
}
