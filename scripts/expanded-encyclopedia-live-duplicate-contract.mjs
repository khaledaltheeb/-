#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BATCH_DIR = path.join(ROOT, 'data', 'expanded-encyclopedia', 'batches');
const TERM_LIKE_TYPES = ['condition', 'glossary_term', 'assessment', 'intervention'];
const PAGE_SIZE = 1000;
const FETCH_ATTEMPTS = 5;
const RETRY_BASE_DELAY_MS = 2000;
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

const clean = (value) => typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';
const cleanList = (value) => Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function preserveMeaningfulNotation(value) {
  return value
    .replace(/([\p{L}\p{N}])\+/gu, '$1 plus ')
    .replace(/([\p{L}\p{N}])[-−–](?=$|\s)/gu, '$1 minus ');
}

function normalizeTermIdentity(value) {
  return preserveMeaningfulNotation(clean(value).normalize('NFKC').toLocaleLowerCase('ar'))
    .replace(/[\u064B-\u065F\u0670\u0640]/gu, '')
    .replace(/[أإآٱ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .replace(/[’'"`´]/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

function localIdentityValues(record) {
  return [
    record.canonical_term,
    record.english_name,
    record.primary_keyword,
    ...cleanList(record.aliases),
  ].map(clean).filter(Boolean);
}

function databaseIdentityValues(record) {
  // A legacy/contextual page such as «الاجترار الفكري: في العلاقات» is not
  // the same canonical identity as the general term «الاجترار الفكري».
  // Compare the complete title and its explicit primary keyword; never strip
  // a subtitle because doing so manufactures a duplicate that the source row
  // itself does not claim.
  return [record.primary_keyword, record.title]
    .map(clean)
    .filter(Boolean);
}

async function loadLocalTerms() {
  const files = (await fs.readdir(BATCH_DIR)).filter((name) => name.endsWith('.json')).sort();
  const records = [];
  for (const file of files) {
    const payload = JSON.parse(await fs.readFile(path.join(BATCH_DIR, file), 'utf8'));
    if (!isRecord(payload) || !Array.isArray(payload.records)) {
      throw new Error(`${file}: missing records[]`);
    }
    for (const record of payload.records) {
      if (!isRecord(record)) throw new Error(`${file}: invalid record`);
      const slug = clean(record.slug);
      if (!slug) throw new Error(`${file}: record missing slug`);
      records.push({ file, slug, record });
    }
  }
  return records;
}

async function fetchJsonWithRetry(endpoint, headers) {
  let lastError;
  let lastResponse;
  let lastDetail = '';
  for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(endpoint, { headers });
      lastResponse = response;
      if (response.ok) return { response, payload: await response.json() };
      lastDetail = await response.text().catch(() => '');
      if (!RETRYABLE_STATUSES.has(response.status) || attempt === FETCH_ATTEMPTS) break;
    } catch (error) {
      lastError = error;
      if (attempt === FETCH_ATTEMPTS) break;
    }
    await sleep(RETRY_BASE_DELAY_MS * attempt);
  }
  if (lastResponse) {
    throw new Error(`Supabase canonical-content query failed (${lastResponse.status}): ${lastDetail.slice(0, 500)}`);
  }
  throw lastError ?? new Error('Supabase canonical-content query failed without a response');
}

async function loadPublishedCanonicalContent() {
  const baseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/$/u, '');
  const key = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (!/^https:\/\//u.test(baseUrl) || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required');
  }

  // Do not filter legacy_migration inside PostgreSQL. The schema_json value is
  // TOAST-heavy and the JSON predicate forced a multi-second scan that could
  // exceed PostgREST's statement timeout. Instead, project only that JSON key
  // and exclude legacy rows in Node. This preserves the exact canonical set.
  const params = new URLSearchParams({
    select: 'slug,title,content_type,primary_keyword,legacy_migration:schema_json->legacy_migration',
    status: 'eq.published',
    content_type: `in.(${TERM_LIKE_TYPES.join(',')})`,
    order: 'slug.asc',
  });
  const endpoint = `${baseUrl}/rest/v1/content?${params.toString()}`;
  const rows = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { payload: batch } = await fetchJsonWithRetry(endpoint, {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      'Range-Unit': 'items',
      Range: `${offset}-${offset + PAGE_SIZE - 1}`,
    });
    if (!Array.isArray(batch)) throw new Error('Supabase canonical-content query returned a non-array payload');
    rows.push(...batch.filter((row) => isRecord(row) && row.legacy_migration == null));
    if (batch.length < PAGE_SIZE) break;
  }

  return rows;
}

async function main() {
  const [localTerms, publishedRows] = await Promise.all([
    loadLocalTerms(),
    loadPublishedCanonicalContent(),
  ]);

  const databaseIdentities = new Map();
  for (const row of publishedRows) {
    if (!isRecord(row)) continue;
    const source = `db:${clean(row.content_type) || 'content'}:${clean(row.slug) || 'unknown'}`;
    for (const value of databaseIdentityValues(row)) {
      const normalized = normalizeTermIdentity(value);
      if (!normalized) continue;
      const bucket = databaseIdentities.get(normalized) ?? [];
      bucket.push({ source, value });
      databaseIdentities.set(normalized, bucket);
    }
  }

  const conflicts = [];
  for (const { file, slug, record } of localTerms) {
    for (const value of localIdentityValues(record)) {
      const normalized = normalizeTermIdentity(value);
      if (!normalized) continue;
      const matches = databaseIdentities.get(normalized) ?? [];
      for (const match of matches) {
        conflicts.push({ file, slug, local: value, database: match.value, source: match.source });
      }
    }
  }

  if (conflicts.length > 0) {
    const unique = [...new Map(conflicts.map((item) => [
      `${item.slug}\u0000${normalizeTermIdentity(item.local)}\u0000${item.source}`,
      item,
    ])).values()];
    console.error(`EXPANDED_ENCYCLOPEDIA_LIVE_DEDUP: ${unique.length} conflict(s) detected`);
    for (const item of unique.slice(0, 100)) {
      console.error(`- ${item.slug} (${item.file}): «${item.local}» conflicts with ${item.source} «${item.database}»`);
    }
    if (unique.length > 100) console.error(`... ${unique.length - 100} more conflict(s)`);
    process.exit(1);
  }

  console.log(`EXPANDED_ENCYCLOPEDIA_LIVE_DEDUP: ${localTerms.length} local terms checked against ${publishedRows.length} published canonical-like DB pages; no conflicts`);
}

main().catch((error) => {
  console.error('EXPANDED_ENCYCLOPEDIA_LIVE_DEDUP: failed');
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
