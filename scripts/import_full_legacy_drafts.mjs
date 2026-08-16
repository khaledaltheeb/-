#!/usr/bin/env node

import fs from 'node:fs/promises';
import process from 'node:process';
import { createClient } from '@supabase/supabase-js';

const CHUNK_SIZE = 50;

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseArgs(argv) {
  const args = { apply: false, input: null, report: 'artifacts/full-legacy-import-report.json' };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--apply') args.apply = true;
    else if (value === '--input') args.input = argv[++i] ?? null;
    else if (value.startsWith('--input=')) args.input = value.slice(8);
    else if (value === '--report') args.report = argv[++i] ?? args.report;
    else if (value.startsWith('--report=')) args.report = value.slice(9);
    else if (value === '--help' || value === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return args;
}

function usage() {
  console.log(`Full legacy draft importer\n\nUsage:\n  node scripts/import_full_legacy_drafts.mjs --input artifacts/full-legacy-publishable.json\n  node scripts/import_full_legacy_drafts.mjs --input artifacts/full-legacy-publishable.json --apply\n\nDefault is dry-run. --apply requires SUPABASE_SECRET_KEY. Imported records are always status=draft and robots_index=false.`);
}

function sourceSlug(record) {
  const publicPath = clean(record.derived_public_path || record.sitemap_url || '');
  const path = publicPath.startsWith('http') ? new URL(publicPath).pathname : publicPath;
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  if (!trimmed) return 'home';
  const last = trimmed.split('/').at(-1) ?? '';
  return last.replace(/\.html?$/i, '').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
}

function inferType(record) {
  const path = clean(record.derived_public_path).toLowerCase();
  if (path.includes('/magazine/')) return 'research';
  if (path.includes('/glossary/') || path.includes('/terminology/') || path.includes('/dictionary/')) return 'glossary_term';
  if (path.includes('/care-guides/') || path.includes('/family-guide/') || path.includes('/quick-info/')) return 'guide';
  if (record.ymyl) return 'article';
  return 'article';
}

function canonicalPath(record, slug) {
  const legacy = clean(record.derived_public_path);
  if (legacy.startsWith('/')) return legacy;
  const canonical = clean(record.canonical);
  if (canonical) {
    try { return new URL(canonical, 'https://healthrenewal.org').pathname; } catch {}
  }
  return `/content/${slug}/`;
}

function referenceRows(record) {
  if (!Array.isArray(record.references)) return [];
  return record.references
    .map((item) => ({
      title: clean(item?.label || item?.title || item?.href),
      url: clean(item?.href || item?.url),
      source: 'legacy-extracted-reference',
    }))
    .filter((item) => item.url.startsWith('http'));
}

function toDraft(record) {
  const slug = sourceSlug(record);
  const title = clean(record.h1 || record.title);
  if (!slug || !title) throw new Error(`${record.source_file}: missing slug/title`);
  const bodyText = clean(record.body_text);
  if (!bodyText) throw new Error(`${record.source_file}: empty body`);
  const bodyJson = isRecord(record.body_json) ? record.body_json : { blocks: [] };
  const refs = referenceRows(record);
  const legacyPath = clean(record.derived_public_path);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    migration: {
      source_repo: clean(record.source_repo) || 'khaledaltheeb/healthrenewal.org',
      source_file: clean(record.source_file),
      source_sha256: clean(record.source_sha256),
      legacy_path: legacyPath,
      sitemap_url: clean(record.sitemap_url) || null,
      legacy_canonical: clean(record.canonical) || null,
      migration_state: clean(record.migration_state),
      source_word_count: Number(record.word_count || 0),
      imported_as_draft: true,
    },
  };
  return {
    content_type: inferType(record),
    slug,
    title,
    excerpt: clean(record.meta_description) || bodyText.slice(0, 240),
    body_json: bodyJson,
    body_text: bodyText,
    audience: [],
    status: 'draft',
    seo_title: clean(record.title) || title,
    seo_description: clean(record.meta_description) || null,
    canonical_url: canonicalPath(record, slug),
    robots_index: false,
    robots_follow: true,
    schema_json: schema,
    primary_keyword: null,
    secondary_keywords: [],
    semantic_terms: [],
    search_intent: 'informational',
    references_json: refs,
    medical_disclaimer: record.ymyl ? 'هذا المحتوى للتثقيف العام ولا يغني عن التقييم أو الاستشارة المهنية المؤهلة.' : null,
    is_featured: false,
    scheduled_at: null,
    published_at: null,
  };
}

function chunks(values, size) {
  const out = [];
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size));
  return out;
}

function client() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are required for --apply');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

async function inspectCollisions(supabase, records) {
  const slugs = [...new Set(records.map((r) => r.slug))];
  const found = [];
  for (const group of chunks(slugs, CHUNK_SIZE)) {
    const { data, error } = await supabase.from('content').select('id,slug,status,canonical_url,title').in('slug', group);
    if (error) throw new Error(`Collision query failed: ${error.message}`);
    if (Array.isArray(data)) found.push(...data);
  }
  return found;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return usage();
  if (!args.input) throw new Error('--input is required');
  const payload = JSON.parse(await fs.readFile(args.input, 'utf8'));
  if (!isRecord(payload) || !Array.isArray(payload.records)) throw new Error('input must contain records[]');

  const candidates = payload.records.filter((row) => row?.migration_state === 'PUBLISHABLE');
  const drafts = [];
  const rejected = [];
  const seen = new Set();
  for (const record of candidates) {
    try {
      const draft = toDraft(record);
      if (seen.has(draft.slug)) {
        rejected.push({ source_file: record.source_file, reason: `duplicate generated slug: ${draft.slug}` });
        continue;
      }
      seen.add(draft.slug);
      drafts.push(draft);
    } catch (error) {
      rejected.push({ source_file: record.source_file, reason: error instanceof Error ? error.message : String(error) });
    }
  }

  const report = {
    mode: args.apply ? 'apply' : 'dry-run',
    candidate_count: candidates.length,
    draft_payload_count: drafts.length,
    transform_rejected_count: rejected.length,
    transform_rejected: rejected,
    existing_collisions: [],
    imported_count: 0,
    skipped_published_count: 0,
    skipped_existing_nonpublished_count: 0,
  };

  if (!args.apply) {
    await fs.mkdir(new URL('../artifacts/', import.meta.url), { recursive: true }).catch(() => {});
    await fs.writeFile(args.report, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report, null, 2));
    console.log('Dry-run complete. No database writes performed.');
    return;
  }

  const supabase = client();
  const collisions = await inspectCollisions(supabase, drafts);
  report.existing_collisions = collisions;
  const bySlug = new Map(collisions.map((row) => [row.slug, row]));
  const insertable = drafts.filter((draft) => {
    const existing = bySlug.get(draft.slug);
    if (!existing) return true;
    if (existing.status === 'published') report.skipped_published_count += 1;
    else report.skipped_existing_nonpublished_count += 1;
    return false;
  });

  for (const group of chunks(insertable, CHUNK_SIZE)) {
    const { error } = await supabase.from('content').insert(group);
    if (error) throw new Error(`Draft insert failed: ${error.message}`);
    report.imported_count += group.length;
  }

  // Verify safety invariants after import.
  if (insertable.length) {
    const verify = await inspectCollisions(supabase, insertable);
    const bad = verify.filter((row) => row.status !== 'draft');
    if (bad.length) throw new Error(`Safety verification failed: ${bad.length} imported rows are not draft`);
  }
  await fs.writeFile(args.report, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(`Full legacy draft import failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
