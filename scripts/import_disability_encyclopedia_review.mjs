#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEFAULT_DIR = path.join(ROOT, 'data', 'encyclopedia', 'generated', 'review-drafts');
const MAX_ATOMIC_APPLY_RECORDS = 100;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseArgs(argv) {
  const args = { apply: false, dir: DEFAULT_DIR, expectCount: null };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--apply') args.apply = true;
    else if (value === '--dir') {
      args.dir = path.resolve(ROOT, argv[index + 1] ?? '');
      index += 1;
    } else if (value.startsWith('--dir=')) args.dir = path.resolve(ROOT, value.slice('--dir='.length));
    else if (value === '--expect-count') {
      args.expectCount = Number(argv[index + 1]);
      index += 1;
    } else if (value.startsWith('--expect-count=')) args.expectCount = Number(value.slice('--expect-count='.length));
    else if (value === '--help' || value === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  if (args.expectCount !== null && (!Number.isInteger(args.expectCount) || args.expectCount < 1)) {
    throw new Error('--expect-count must be a positive integer');
  }
  return args;
}

function usage() {
  console.log(`Disability and inclusion encyclopedia review importer\n\nUsage:\n  node scripts/import_disability_encyclopedia_review.mjs\n  node scripts/import_disability_encyclopedia_review.mjs --expect-count 5\n  node scripts/import_disability_encyclopedia_review.mjs --apply\n\nDefault mode is an offline dry-run. --apply requires SUPABASE_SECRET_KEY and refuses every existing slug; it never upserts, publishes, schedules, or enables indexing.`);
}

async function collectPayloadFiles(dir) {
  const stat = await fs.stat(dir);
  if (!stat.isDirectory()) throw new Error(`Review payload path is not a directory: ${dir}`);
  const names = (await fs.readdir(dir)).filter((name) => name.endsWith('-v1.json')).sort();
  if (!names.length) throw new Error(`No review payload files found in ${path.relative(ROOT, dir)}`);
  return names.map((name) => path.join(dir, name));
}

function validateRecord(raw, fileLabel) {
  const slug = clean(raw.slug);
  if (!SLUG_RE.test(slug) || slug.startsWith('encyclopedia-')) {
    throw new Error(`${fileLabel}: generated record requires a bare URL-safe encyclopedia slug`);
  }
  if (raw.content_type !== 'condition') throw new Error(`${slug}: content_type must be condition`);
  if (raw.status !== 'scientific_review') throw new Error(`${slug}: status must remain scientific_review`);
  if (raw.robots_index !== false || raw.robots_follow !== false) {
    throw new Error(`${slug}: scientific-review records must remain noindex,nofollow`);
  }
  if (raw.published_at !== null) throw new Error(`${slug}: published_at must remain null`);
  if (clean(raw.canonical_url) !== `/encyclopedia/${slug}/`) {
    throw new Error(`${slug}: canonical URL must be /encyclopedia/${slug}/`);
  }
  if (!clean(raw.title) || !clean(raw.body_text)) throw new Error(`${slug}: title and body_text are required`);
  if (!isRecord(raw.body_json) || !Array.isArray(raw.body_json.blocks) || raw.body_json.blocks.length < 1) {
    throw new Error(`${slug}: body_json.blocks are required`);
  }
  if (!Array.isArray(raw.references_json) || raw.references_json.length < 6) {
    throw new Error(`${slug}: at least six reviewed references are required`);
  }
  const schema = isRecord(raw.schema_json) ? raw.schema_json : {};
  const evidence = isRecord(schema.evidence) ? schema.evidence : {};
  if (schema.publication_ready !== false) throw new Error(`${slug}: schema publication_ready must be false`);
  if (evidence.review_status !== 'scientific-review-required') {
    throw new Error(`${slug}: scientific-review-required evidence flag is missing`);
  }
  if (evidence.external_review_completed !== false) {
    throw new Error(`${slug}: external review must not be claimed complete`);
  }
  if (evidence.materializer_version !== 2) throw new Error(`${slug}: materializer_version must be 2`);
  if (!Array.isArray(evidence.claim_source_map) || evidence.claim_source_map.length < 8) {
    throw new Error(`${slug}: claim-source map is incomplete`);
  }

  return {
    content_type: 'condition',
    slug,
    title: clean(raw.title),
    excerpt: clean(raw.excerpt) || null,
    body_json: raw.body_json,
    body_text: clean(raw.body_text),
    audience: Array.isArray(raw.audience) ? raw.audience.map(clean).filter(Boolean) : [],
    status: 'scientific_review',
    seo_title: clean(raw.seo_title) || null,
    seo_description: clean(raw.seo_description) || null,
    canonical_url: `/encyclopedia/${slug}/`,
    robots_index: false,
    robots_follow: false,
    schema_json: schema,
    primary_keyword: clean(raw.primary_keyword) || null,
    secondary_keywords: Array.isArray(raw.secondary_keywords) ? raw.secondary_keywords.map(clean).filter(Boolean) : [],
    semantic_terms: Array.isArray(raw.semantic_terms) ? raw.semantic_terms.map(clean).filter(Boolean) : [],
    search_intent: clean(raw.search_intent) || 'informational',
    author_display_name: clean(raw.author_display_name) || null,
    reviewer_display_name: null,
    reviewer_credentials: null,
    last_reviewed_at: null,
    references_json: raw.references_json,
    medical_disclaimer: clean(raw.medical_disclaimer) || null,
    featured_image_url: null,
    featured_image_alt: null,
    is_featured: false,
    scheduled_at: null,
    published_at: null,
  };
}

async function loadReviewRecords(files) {
  const records = [];
  const seen = new Set();
  for (const file of files) {
    const fileLabel = path.relative(ROOT, file);
    const payload = JSON.parse(await fs.readFile(file, 'utf8'));
    if (!isRecord(payload) || payload.version !== 2 || payload.publication_ready !== false) {
      throw new Error(`${fileLabel}: expected materialized review payload version 2 with publication_ready=false`);
    }
    if (!Array.isArray(payload.records) || payload.records.length !== 1 || !isRecord(payload.records[0])) {
      throw new Error(`${fileLabel}: expected exactly one records[] item`);
    }
    const record = validateRecord(payload.records[0], fileLabel);
    if (seen.has(record.slug)) throw new Error(`Duplicate review slug across payloads: ${record.slug}`);
    seen.add(record.slug);
    records.push(record);
  }
  return records;
}

function buildClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url) throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required for --apply');
  if (!secretKey) throw new Error('SUPABASE_SECRET_KEY is required for --apply');
  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

async function assertZeroCollisions(supabase, records) {
  const slugs = records.map((record) => record.slug);
  const { data, error } = await supabase
    .from('content')
    .select('slug,status,canonical_url')
    .in('slug', slugs);
  if (error) throw new Error(`Failed to inspect existing content slugs: ${error.message}`);
  const existing = Array.isArray(data) ? data : [];
  if (existing.length) {
    throw new Error(`Refusing all writes because these slugs already exist: ${existing.map((row) => `${row.slug}(${row.status})`).join(', ')}`);
  }
}

async function insertAtomically(supabase, records) {
  if (records.length > MAX_ATOMIC_APPLY_RECORDS) {
    throw new Error(`Apply is limited to ${MAX_ATOMIC_APPLY_RECORDS} new review records per atomic request; split and review the batch before importing.`);
  }
  const { error } = await supabase.from('content').insert(records);
  if (error) throw new Error(`Scientific-review insert failed: ${error.message}`);
}

async function verifyInserted(supabase, records) {
  const expected = new Map(records.map((record) => [record.slug, record]));
  const { data, error } = await supabase
    .from('content')
    .select('slug,status,robots_index,robots_follow,published_at,canonical_url,schema_json')
    .in('slug', [...expected.keys()]);
  if (error) throw new Error(`Post-insert verification failed: ${error.message}`);
  const found = Array.isArray(data) ? data : [];
  const failures = [];
  const bySlug = new Map(found.map((row) => [row.slug, row]));
  for (const [slug, planned] of expected) {
    const row = bySlug.get(slug);
    if (!row) failures.push(`${slug}: missing after insert`);
    else if (row.status !== 'scientific_review') failures.push(`${slug}: status=${row.status}`);
    else if (row.robots_index !== false || row.robots_follow !== false) failures.push(`${slug}: indexing flags changed`);
    else if (row.published_at !== null) failures.push(`${slug}: published_at is not null`);
    else if (row.canonical_url !== planned.canonical_url) failures.push(`${slug}: canonical mismatch`);
    else if (!isRecord(row.schema_json) || row.schema_json.publication_ready !== false) failures.push(`${slug}: publication_ready changed`);
  }
  if (found.length !== records.length) failures.push(`expected ${records.length} rows, found ${found.length}`);
  if (failures.length) throw new Error(`Post-insert verification failed:\n- ${failures.join('\n- ')}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return;
  }
  const files = await collectPayloadFiles(args.dir);
  const records = await loadReviewRecords(files);
  if (args.expectCount !== null && records.length !== args.expectCount) {
    throw new Error(`Expected ${args.expectCount} review records, found ${records.length}`);
  }

  const summary = {
    mode: args.apply ? 'apply' : 'dry-run',
    records: records.length,
    slugs: records.map((record) => record.slug),
    statuses: [...new Set(records.map((record) => record.status))],
    indexable: records.some((record) => record.robots_index !== false || record.robots_follow !== false),
    published: records.some((record) => record.published_at !== null),
    collision_policy: 'fail-all-existing-slugs',
    write_policy: 'insert-only-no-upsert',
  };
  console.log(JSON.stringify(summary, null, 2));

  if (!args.apply) {
    console.log('Offline dry-run passed. No Supabase client was created and no network or database write was attempted.');
    return;
  }

  const supabase = buildClient();
  await assertZeroCollisions(supabase, records);
  await insertAtomically(supabase, records);
  await verifyInserted(supabase, records);
  console.log(`Inserted and verified ${records.length} new encyclopedia records in scientific_review. No record was published or indexed.`);
}

main().catch((error) => {
  console.error(`Disability encyclopedia review import failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
