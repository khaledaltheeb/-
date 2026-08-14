#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_BATCH_DIR = path.join(ROOT, 'data', 'encyclopedia', 'batches');
const BATCH_GLOB_SUFFIX = '.json';
const CHUNK_SIZE = 100;

function parseArgs(argv) {
  const args = { apply: false, batch: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--apply') args.apply = true;
    else if (value === '--batch') {
      args.batch = argv[index + 1] ?? null;
      index += 1;
    } else if (value.startsWith('--batch=')) args.batch = value.slice('--batch='.length);
    else if (value === '--help' || value === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return args;
}

function usage() {
  console.log(`Psychological encyclopedia importer\n\nUsage:\n  node scripts/import_psych_encyclopedia.mjs\n  node scripts/import_psych_encyclopedia.mjs --batch data/encyclopedia/batches/001-anxiety-core.json\n  node scripts/import_psych_encyclopedia.mjs --apply\n\nDefault mode is dry-run. --apply requires SUPABASE_SECRET_KEY and imports only drafts.`);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function collectBatchFiles(batchArg) {
  if (batchArg) {
    const candidate = path.resolve(ROOT, batchArg);
    const stat = await fs.stat(candidate);
    if (!stat.isFile()) throw new Error(`Batch path is not a file: ${batchArg}`);
    return [candidate];
  }

  const names = await fs.readdir(DEFAULT_BATCH_DIR);
  return names
    .filter((name) => name.endsWith(BATCH_GLOB_SUFFIX))
    .sort()
    .map((name) => path.join(DEFAULT_BATCH_DIR, name));
}

async function loadRecords(files) {
  const records = [];
  const seen = new Set();

  for (const file of files) {
    const payload = JSON.parse(await fs.readFile(file, 'utf8'));
    if (!isRecord(payload) || !Array.isArray(payload.records)) {
      throw new Error(`${path.relative(ROOT, file)}: expected object with records[]`);
    }

    for (const [index, raw] of payload.records.entries()) {
      if (!isRecord(raw)) throw new Error(`${path.relative(ROOT, file)} records[${index}]: expected object`);
      const slug = cleanString(raw.slug);
      if (!slug) throw new Error(`${path.relative(ROOT, file)} records[${index}]: missing slug`);
      if (seen.has(slug)) throw new Error(`Duplicate encyclopedia slug across batches: ${slug}`);
      seen.add(slug);

      if (raw.content_type !== 'condition') throw new Error(`${slug}: content_type must be condition`);
      if (raw.status === 'published') throw new Error(`${slug}: batch importer refuses published records`);
      if (raw.robots_index !== false) throw new Error(`${slug}: imported drafts must use robots_index=false`);
      if (cleanString(raw.canonical_url) !== `/encyclopedia/${slug}/`) {
        throw new Error(`${slug}: canonical_url must be /encyclopedia/${slug}/`);
      }

      records.push({
        content_type: 'condition',
        slug,
        title: cleanString(raw.title),
        excerpt: cleanString(raw.excerpt) || null,
        body_json: isRecord(raw.body_json) ? raw.body_json : {},
        body_text: null,
        audience: Array.isArray(raw.audience) ? raw.audience.map(cleanString).filter(Boolean) : [],
        status: 'draft',
        seo_title: cleanString(raw.seo_title) || null,
        seo_description: cleanString(raw.seo_description) || null,
        canonical_url: `/encyclopedia/${slug}/`,
        robots_index: false,
        robots_follow: raw.robots_follow !== false,
        schema_json: isRecord(raw.schema_json) ? raw.schema_json : {},
        primary_keyword: cleanString(raw.primary_keyword) || null,
        secondary_keywords: Array.isArray(raw.secondary_keywords) ? raw.secondary_keywords.map(cleanString).filter(Boolean) : [],
        semantic_terms: Array.isArray(raw.semantic_terms) ? raw.semantic_terms.map(cleanString).filter(Boolean) : [],
        search_intent: cleanString(raw.search_intent) || 'informational',
        author_display_name: cleanString(raw.author_display_name) || null,
        reviewer_display_name: null,
        reviewer_credentials: null,
        last_reviewed_at: null,
        references_json: Array.isArray(raw.references_json) ? raw.references_json : [],
        medical_disclaimer: cleanString(raw.medical_disclaimer) || null,
        featured_image_url: null,
        featured_image_alt: null,
        is_featured: false,
        scheduled_at: null,
        published_at: null,
      });
    }
  }

  return records;
}

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size));
  return result;
}

function buildClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url) throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required for --apply');
  if (!secretKey) throw new Error('SUPABASE_SECRET_KEY is required for --apply');

  return createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function ensureNoPublishedCollision(supabase, records) {
  const slugs = records.map((record) => record.slug);
  const existing = [];

  for (const slugChunk of chunks(slugs, CHUNK_SIZE)) {
    const { data, error } = await supabase
      .from('content')
      .select('slug,status,canonical_url')
      .in('slug', slugChunk);
    if (error) throw new Error(`Failed to inspect existing encyclopedia slugs: ${error.message}`);
    if (Array.isArray(data)) existing.push(...data);
  }

  const published = existing.filter((row) => row?.status === 'published');
  if (published.length) {
    throw new Error(
      `Refusing to overwrite published content: ${published.map((row) => row.slug).join(', ')}`,
    );
  }

  return existing;
}

async function applyRecords(supabase, records) {
  for (const chunk of chunks(records, CHUNK_SIZE)) {
    const { error } = await supabase.from('content').upsert(chunk, { onConflict: 'slug' });
    if (error) throw new Error(`Draft upsert failed: ${error.message}`);
  }
}

async function verifyImportedDrafts(supabase, records) {
  const expected = new Set(records.map((record) => record.slug));
  const found = [];

  for (const slugChunk of chunks([...expected], CHUNK_SIZE)) {
    const { data, error } = await supabase
      .from('content')
      .select('slug,status,robots_index,canonical_url')
      .in('slug', slugChunk);
    if (error) throw new Error(`Post-import verification failed: ${error.message}`);
    if (Array.isArray(data)) found.push(...data);
  }

  const failures = [];
  const bySlug = new Map(found.map((row) => [row.slug, row]));
  for (const record of records) {
    const row = bySlug.get(record.slug);
    if (!row) failures.push(`${record.slug}: not found after import`);
    else if (row.status !== 'draft') failures.push(`${record.slug}: status=${row.status}`);
    else if (row.robots_index !== false) failures.push(`${record.slug}: robots_index must be false`);
    else if (row.canonical_url !== record.canonical_url) failures.push(`${record.slug}: canonical mismatch`);
  }
  if (failures.length) throw new Error(`Post-import verification failed:\n- ${failures.join('\n- ')}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }

  const files = await collectBatchFiles(args.batch);
  if (!files.length) throw new Error('No encyclopedia batch files found');
  const records = await loadRecords(files);

  console.log(`Encyclopedia import plan: ${records.length} draft records from ${files.length} batch file(s).`);
  console.log(`Slugs: ${records.map((record) => record.slug).join(', ')}`);

  if (!args.apply) {
    console.log('Dry-run complete. No database writes were performed.');
    return;
  }

  const supabase = buildClient();
  const existing = await ensureNoPublishedCollision(supabase, records);
  console.log(`Existing non-published records that may be refreshed: ${existing.length}.`);
  await applyRecords(supabase, records);
  await verifyImportedDrafts(supabase, records);
  console.log(`Imported and verified ${records.length} encyclopedia draft records. No record was published or indexed.`);
}

main().catch((error) => {
  console.error(`Psychological encyclopedia import failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
