#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BATCH_DIR = path.join(ROOT, 'data', 'expanded-encyclopedia', 'batches');
const PAGE_SIZE = 1000;

const clean = (value) => typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';

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

async function loadExpandedRecords() {
  const files = (await fs.readdir(BATCH_DIR)).filter((name) => name.endsWith('.json')).sort();
  const records = [];
  for (const file of files) {
    const payload = JSON.parse(await fs.readFile(path.join(BATCH_DIR, file), 'utf8'));
    if (!payload || !Array.isArray(payload.records)) continue;
    for (const record of payload.records) {
      if (!record || typeof record !== 'object') continue;
      records.push({ ...record, __source: file });
    }
  }
  return records;
}

async function loadPublishedContent(supabase) {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('content')
      .select('slug,title,primary_keyword,content_type')
      .eq('status', 'published')
      .order('slug', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`Published content query failed at offset ${from}: ${error.message}`);
    const page = Array.isArray(data) ? data : [];
    rows.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return rows;
}

function addIdentity(map, value, source) {
  const normalized = normalizeTermIdentity(value);
  if (!normalized) return;
  const list = map.get(normalized) ?? [];
  list.push(source);
  map.set(normalized, list);
}

function candidateIdentities(record) {
  return [record.canonical_term, record.english_name, record.primary_keyword, ...(Array.isArray(record.aliases) ? record.aliases : [])]
    .map(clean)
    .filter(Boolean);
}

function liveIdentities(row) {
  const values = [row.primary_keyword];
  if (['glossary_term', 'condition', 'assessment', 'intervention'].includes(clean(row.content_type))) {
    values.push(clean(row.title).split(/[:：]/u)[0]);
  }
  return values.map(clean).filter(Boolean);
}

async function main() {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are required');

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const [expanded, published] = await Promise.all([loadExpandedRecords(), loadPublishedContent(supabase)]);
  const liveSlugMap = new Map();
  const liveIdentityMap = new Map();

  for (const row of published) {
    const slug = clean(row.slug).toLocaleLowerCase('en-US');
    if (slug) {
      const list = liveSlugMap.get(slug) ?? [];
      list.push(`published:${row.content_type}:${row.slug}`);
      liveSlugMap.set(slug, list);
    }
    for (const identity of liveIdentities(row)) addIdentity(liveIdentityMap, identity, `published:${row.content_type}:${row.slug}:${identity}`);
  }

  const collisions = [];
  for (const record of expanded) {
    const slug = clean(record.slug).toLocaleLowerCase('en-US');
    if (slug && liveSlugMap.has(slug)) {
      collisions.push({ type: 'slug', value: record.slug, source: record.__source, conflicts: liveSlugMap.get(slug) });
    }
    for (const identity of candidateIdentities(record)) {
      const normalized = normalizeTermIdentity(identity);
      if (normalized && liveIdentityMap.has(normalized)) {
        collisions.push({ type: 'identity', value: identity, source: record.__source, conflicts: liveIdentityMap.get(normalized) });
      }
    }
  }

  if (collisions.length) {
    console.error(`Expanded encyclopedia live duplicate guard FAILED: ${collisions.length} collision(s).`);
    for (const collision of collisions) console.error(JSON.stringify(collision));
    process.exit(1);
  }

  console.log(`Expanded encyclopedia live duplicate guard passed: ${expanded.length} candidate terms checked against ${published.length} published content rows.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : error);
  process.exit(1);
});
