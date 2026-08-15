#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BATCH_DIR = path.join(ROOT, 'data', 'encyclopedia', 'batches');
const DEFAULT_MANIFEST = path.join(ROOT, 'data', 'encyclopedia', 'releases', '2026-08-15-clinical-50.json');
const CHUNK_SIZE = 100;
const DEFAULT_DISCLAIMER = 'هذا المحتوى للتثقيف العام ولا يقدم تشخيصًا فرديًا أو وصفة علاجية، ولا يغني عن تقييم مختص مؤهل عند الحاجة.';
const META_SUFFIXES = [
  ' بدقة.',
  ' بوضوح.',
  ' أيضًا.',
  '، عند الحاجة.',
  '، ومتى يلزم التقييم.',
  '، ومتى تطلب المساعدة.',
  '، مع توضيح متى تطلب المساعدة.',
  '، مع توضيح متى يلزم التقييم المتخصص.',
  '، ويعرض متى يلزم طلب المساعدة المتخصصة.',
  '، مع توضيح متى ينبغي طلب المساعدة المتخصصة.',
  '، مع شرح التقييم والعلاج والدعم ومتى ينبغي طلب المساعدة المتخصصة.',
];

function parseArgs(argv) {
  const args = { apply: false, manifest: DEFAULT_MANIFEST };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--apply') args.apply = true;
    else if (value === '--manifest') args.manifest = path.resolve(ROOT, argv[++i] ?? '');
    else if (value.startsWith('--manifest=')) args.manifest = path.resolve(ROOT, value.slice('--manifest='.length));
    else if (value === '--help' || value === '-h') args.help = true;
    else throw new Error(`Unknown argument: ${value}`);
  }
  return args;
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clean(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';
}

function cleanList(value) {
  return Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
}

function fitSeoTitle(rawValue, keywordValue, titleValue) {
  const raw = clean(rawValue);
  const keyword = clean(keywordValue);
  const title = clean(titleValue);
  const candidates = [
    raw,
    keyword ? `${keyword}: الأعراض والتشخيص والعلاج` : '',
    keyword ? `${keyword}: الأعراض والأسباب والعلاج` : '',
    keyword ? `${keyword}: دليل الأعراض والعلاج` : '',
    keyword,
    title,
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (candidate.length <= 47) return candidate;
  }
  const source = keyword || raw || title;
  const window = source.slice(0, 47);
  const cut = window.lastIndexOf(' ');
  const fitted = (cut >= 20 ? window.slice(0, cut) : window).replace(/[،؛,:\-]+$/u, '').trim();
  if (!fitted || fitted.length > 47) throw new Error('Unable to create an SEO title within 47 characters');
  return fitted;
}

function clipMeta(text) {
  const normalized = clean(text);
  if (normalized.length <= 160) return normalized;
  const window = normalized.slice(0, 160);
  const cut = window.lastIndexOf(' ');
  if (cut >= 150) return `${window.slice(0, cut).replace(/[،؛,:\-]+$/u, '').trim()}…`;
  return '';
}

function fitSeoDescription(rawValue, excerptValue) {
  const candidates = [clean(rawValue), clean(excerptValue)].filter(Boolean);
  for (const candidate of candidates) {
    if (candidate.length >= 150 && candidate.length <= 160) return candidate;
    const clipped = clipMeta(candidate);
    if (clipped.length >= 150 && clipped.length <= 160) return clipped;
  }
  for (const candidate of candidates) {
    if (candidate.length >= 150) continue;
    const stem = candidate.replace(/[.!؟،؛:]+$/u, '').trim();
    for (const suffix of META_SUFFIXES) {
      const expanded = `${stem}${suffix}`;
      if (expanded.length >= 150 && expanded.length <= 160) return expanded;
    }
  }
  if (candidates.length >= 2) {
    const stem = candidates[0].replace(/[.!؟،؛:]+$/u, '').trim();
    const merged = `${stem}، ${candidates[1]}`;
    const clipped = clipMeta(merged);
    if (clipped.length >= 150 && clipped.length <= 160) return clipped;
  }
  throw new Error('Unable to create a 150-160 character SEO description from supplied editorial metadata');
}

function extractBodyText(bodyJson) {
  if (!isRecord(bodyJson) || !Array.isArray(bodyJson.blocks)) return '';
  const parts = [];
  const push = (value) => { const text = clean(value); if (text) parts.push(text); };
  for (const block of bodyJson.blocks) {
    if (!isRecord(block)) continue;
    switch (clean(block.type)) {
      case 'paragraph':
      case 'heading': push(block.text); break;
      case 'list': cleanList(block.items).forEach(push); break;
      case 'quote': push(block.text); push(block.cite); break;
      case 'callout': push(block.title); push(block.text); break;
      case 'table':
        push(block.caption);
        cleanList(block.headers).forEach(push);
        if (Array.isArray(block.rows)) for (const row of block.rows) cleanList(row).forEach(push);
        break;
      case 'resource': push(block.label); push(block.description); break;
      case 'image': push(block.alt); push(block.caption); break;
      case 'faq':
        if (Array.isArray(block.items)) {
          for (const item of block.items) if (isRecord(item)) { push(item.question); push(item.answer); }
        }
        break;
      default: break;
    }
  }
  return parts.join('\n\n').slice(0, 250000);
}

function wordCount(text) {
  return clean(text).split(/\s+/u).filter(Boolean).length;
}

function chunks(values, size = CHUNK_SIZE) {
  const result = [];
  for (let i = 0; i < values.length; i += size) result.push(values.slice(i, i + size));
  return result;
}

async function loadManifest(filename) {
  const manifest = JSON.parse(await fs.readFile(filename, 'utf8'));
  if (!isRecord(manifest)) throw new Error('Release manifest must be an object');
  if (!clean(manifest.release_id)) throw new Error('release_id is required');
  if (!Number.isInteger(manifest.expected_records) || manifest.expected_records < 1) throw new Error('expected_records must be a positive integer');
  if (!Number.isInteger(manifest.expected_batch_files) || manifest.expected_batch_files < 1) throw new Error('expected_batch_files must be a positive integer');
  if (!clean(manifest.author_display_name)) throw new Error('author_display_name is required');
  if (manifest.human_reviewer_claimed !== false) throw new Error('human_reviewer_claimed must remain false unless a real named review occurred');
  return manifest;
}

async function loadSourceRecords(manifest) {
  const names = (await fs.readdir(BATCH_DIR)).filter((name) => name.endsWith('.json')).sort();
  if (names.length !== manifest.expected_batch_files) throw new Error(`Expected ${manifest.expected_batch_files} batch files, found ${names.length}`);
  const seen = new Set();
  const rows = [];
  for (const name of names) {
    const payload = JSON.parse(await fs.readFile(path.join(BATCH_DIR, name), 'utf8'));
    if (!isRecord(payload) || !Array.isArray(payload.records)) throw new Error(`${name}: records[] is required`);
    for (const raw of payload.records) {
      if (!isRecord(raw)) throw new Error(`${name}: invalid record`);
      const slug = clean(raw.slug).toLowerCase();
      const canonical = `/encyclopedia/${slug}/`;
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${name}: invalid slug ${slug}`);
      if (seen.has(slug)) throw new Error(`Duplicate slug: ${slug}`);
      seen.add(slug);
      if (raw.content_type !== 'condition') throw new Error(`${slug}: content_type must be condition`);
      if (raw.status === 'published') throw new Error(`${slug}: source batches must not be pre-published`);
      if (raw.robots_index !== false) throw new Error(`${slug}: source batches must remain noindex`);
      if (clean(raw.canonical_url) !== canonical) throw new Error(`${slug}: canonical must be ${canonical}`);

      const bodyJson = isRecord(raw.body_json) ? raw.body_json : {};
      const bodyText = extractBodyText(bodyJson);
      const references = Array.isArray(raw.references_json) ? raw.references_json : [];
      const author = clean(raw.author_display_name) || clean(manifest.author_display_name);
      let seoDescription;
      let seoTitle;
      try {
        seoDescription = fitSeoDescription(raw.seo_description, raw.excerpt);
        seoTitle = fitSeoTitle(raw.seo_title, raw.primary_keyword, raw.title);
      } catch (error) {
        throw new Error(`${slug}: ${error instanceof Error ? error.message : String(error)}`);
      }
      const row = {
        content_type: 'condition',
        slug,
        title: clean(raw.title),
        excerpt: clean(raw.excerpt) || null,
        body_json: bodyJson,
        body_text: bodyText || null,
        audience: cleanList(raw.audience),
        search_aliases: cleanList(raw.search_aliases).length ? cleanList(raw.search_aliases) : cleanList(raw.secondary_keywords),
        seo_title: seoTitle,
        seo_description: seoDescription,
        canonical_url: canonical,
        robots_follow: raw.robots_follow !== false,
        schema_json: isRecord(raw.schema_json) ? raw.schema_json : {},
        primary_keyword: clean(raw.primary_keyword) || null,
        secondary_keywords: cleanList(raw.secondary_keywords),
        semantic_terms: cleanList(raw.semantic_terms),
        search_intent: clean(raw.search_intent) || 'informational',
        author_display_name: author,
        reviewer_display_name: clean(raw.reviewer_display_name) || null,
        reviewer_credentials: clean(raw.reviewer_credentials) || null,
        last_reviewed_at: clean(raw.last_reviewed_at) || null,
        references_json: references,
        medical_disclaimer: clean(raw.medical_disclaimer) || DEFAULT_DISCLAIMER,
        featured_image_url: clean(raw.featured_image_url) || null,
        featured_image_alt: clean(raw.featured_image_alt) || null,
        is_featured: raw.is_featured === true,
        scheduled_at: null,
      };
      validateRow(row, manifest);
      rows.push(row);
    }
  }
  if (rows.length !== manifest.expected_records) throw new Error(`Expected ${manifest.expected_records} records, found ${rows.length}`);
  return rows;
}

function validateRow(row, manifest) {
  if (row.title.length < 3) throw new Error(`${row.slug}: title is required`);
  if (!row.seo_title || row.seo_title.length > 47) throw new Error(`${row.slug}: seo_title must be 1-47 characters`);
  if (!row.seo_description || row.seo_description.length < 150 || row.seo_description.length > 160) throw new Error(`${row.slug}: seo_description must be 150-160 characters`);
  if (!row.primary_keyword) throw new Error(`${row.slug}: primary_keyword is required`);
  if (!row.author_display_name) throw new Error(`${row.slug}: visible institutional author is required`);
  if (!Array.isArray(row.references_json) || row.references_json.length < 1) throw new Error(`${row.slug}: at least one reference is required`);
  if (!row.references_json.some((ref) => isRecord(ref) && /^https:\/\//i.test(clean(ref.url)))) throw new Error(`${row.slug}: at least one HTTPS reference is required`);
  if (wordCount(row.body_text) < Number(manifest.minimum_body_words || 1000)) throw new Error(`${row.slug}: body is below release depth threshold`);
  if (row.featured_image_url && !row.featured_image_alt) throw new Error(`${row.slug}: featured image alt is required`);
}

function buildClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('SUPABASE_URL is required');
  if (!secret) throw new Error('SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY is required');
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

async function fetchExisting(supabase, slugs) {
  const rows = [];
  for (const part of chunks(slugs)) {
    const { data, error } = await supabase.from('content').select('id,slug,status,content_type,canonical_url,robots_index,published_at').in('slug', part);
    if (error) throw new Error(`Existing-row inspection failed: ${error.message}`);
    if (Array.isArray(data)) rows.push(...data);
  }
  return rows;
}

async function recordHistory(supabase, releaseId, slugs) {
  if (!slugs.length) return;
  const { data: rows, error } = await supabase.from('content').select('*').in('slug', slugs);
  if (error || !Array.isArray(rows)) {
    console.warn(`History snapshot skipped: ${error?.message || 'content rows unavailable'}`);
    return;
  }
  for (const row of rows) {
    try {
      const { data: latest } = await supabase.from('content_versions').select('version').eq('content_id', row.id).order('version', { ascending: false }).limit(1).maybeSingle();
      const version = Number(latest?.version || 0) + 1;
      const { error: versionError } = await supabase.from('content_versions').insert({ content_id: row.id, version, snapshot: row, created_by: null });
      if (versionError) console.warn(`${row.slug}: version snapshot warning: ${versionError.message}`);
    } catch (historyError) {
      console.warn(`${row.slug}: version snapshot warning: ${historyError instanceof Error ? historyError.message : String(historyError)}`);
    }
  }
  const audits = rows.map((row) => ({ actor_id: null, entity_type: 'content', entity_id: String(row.id), action: 'encyclopedia_release_publish', after_data: { release_id: releaseId, slug: row.slug, published_at: row.published_at, source_commit: process.env.GITHUB_SHA || null } }));
  const { error: auditError } = await supabase.from('audit_logs').insert(audits);
  if (auditError) console.warn(`Audit-log warning: ${auditError.message}`);
}

async function applyRelease(manifest, rows) {
  const supabase = buildClient();
  const existing = await fetchExisting(supabase, rows.map((row) => row.slug));
  const existingBySlug = new Map(existing.map((row) => [row.slug, row]));
  const alreadyPublished = [];
  const candidates = [];
  for (const row of rows) {
    const current = existingBySlug.get(row.slug);
    if (current?.status === 'published') {
      if (current.content_type !== 'condition' || current.canonical_url !== row.canonical_url || current.robots_index !== true) throw new Error(`${row.slug}: published collision does not match encyclopedia release contract`);
      alreadyPublished.push(row.slug);
    } else {
      candidates.push(row);
    }
  }

  const releaseTime = new Date().toISOString();
  const releaseMeta = { id: manifest.release_id, released_at: releaseTime, source_commit: process.env.GITHUB_SHA || null, human_reviewer_claimed: false };
  const publishedRows = candidates.map((row) => ({ ...row, status: 'published', robots_index: true, published_at: releaseTime, schema_json: { ...row.schema_json, rawafid_release: releaseMeta } }));
  for (const part of chunks(publishedRows)) {
    const { error } = await supabase.from('content').upsert(part, { onConflict: 'slug' });
    if (error) throw new Error(`Production publication failed: ${error.message}`);
  }

  const verified = await fetchExisting(supabase, rows.map((row) => row.slug));
  const bySlug = new Map(verified.map((row) => [row.slug, row]));
  const failures = [];
  for (const row of rows) {
    const live = bySlug.get(row.slug);
    if (!live) failures.push(`${row.slug}: missing`);
    else if (live.status !== 'published') failures.push(`${row.slug}: status=${live.status}`);
    else if (live.robots_index !== true) failures.push(`${row.slug}: robots_index=false`);
    else if (!live.published_at) failures.push(`${row.slug}: published_at missing`);
    else if (live.canonical_url !== row.canonical_url) failures.push(`${row.slug}: canonical mismatch`);
  }
  if (failures.length) throw new Error(`Post-publication verification failed:\n- ${failures.join('\n- ')}`);
  await recordHistory(supabase, manifest.release_id, candidates.map((row) => row.slug));
  console.log(JSON.stringify({ release_id: manifest.release_id, records: rows.length, newly_published: candidates.length, already_published: alreadyPublished.length, verified_published: verified.length }, null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log('Usage: node scripts/publish_psych_encyclopedia.mjs [--apply] [--manifest <path>]');
    return;
  }
  const manifest = await loadManifest(args.manifest);
  const rows = await loadSourceRecords(manifest);
  console.log(`Release plan ${manifest.release_id}: ${rows.length} validated records from ${manifest.expected_batch_files} batches.`);
  console.log(`Body depth: min=${Math.min(...rows.map((row) => wordCount(row.body_text)))} words, max=${Math.max(...rows.map((row) => wordCount(row.body_text)))} words.`);
  console.log(`SEO metadata verified: titles=${rows.filter((row) => row.seo_title.length > 0 && row.seo_title.length <= 47).length}/${rows.length}, descriptions=${rows.filter((row) => row.seo_description.length >= 150 && row.seo_description.length <= 160).length}/${rows.length}.`);
  if (!args.apply) {
    console.log('Dry-run complete. No production writes were performed.');
    return;
  }
  await applyRelease(manifest, rows);
}

main().catch((error) => {
  console.error(`Psychological encyclopedia publication failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
