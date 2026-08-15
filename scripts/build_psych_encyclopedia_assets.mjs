#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BATCH_DIR = path.join(ROOT, 'data', 'encyclopedia', 'batches');
const OUTPUT_DIR = path.join(ROOT, 'public', 'encyclopedia-data');
const RECORD_DIR = path.join(OUTPUT_DIR, 'records');
const EXPECTED_BATCH_FILES = 25;
const EXPECTED_RECORDS = 50;
const RELEASE_ID = 'psych-encyclopedia-public-50-v1';
const RELEASED_AT = '2026-08-15T19:20:00.000Z';
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
];

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clean(value) {
  return typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';
}

function cleanList(value) {
  return Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
}

function clipMeta(value) {
  const normalized = clean(value);
  if (normalized.length <= 160) return normalized;
  const window = normalized.slice(0, 160);
  const cut = window.lastIndexOf(' ');
  if (cut >= 150) return `${window.slice(0, cut).replace(/[،؛,:\-]+$/u, '').trim()}…`;
  return '';
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
  for (const candidate of candidates) if (candidate.length <= 47) return candidate;
  const source = keyword || raw || title;
  const window = source.slice(0, 47);
  const cut = window.lastIndexOf(' ');
  return (cut >= 20 ? window.slice(0, cut) : window).replace(/[،؛,:\-]+$/u, '').trim();
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
  const fallback = candidates[0] || 'دليل علمي عربي موثق يشرح الحالة النفسية وأعراضها وأسبابها وتقييمها وخيارات العلاج والدعم والأسئلة الشائعة ومتى يلزم طلب مساعدة متخصصة.';
  return clipMeta(fallback) || fallback.slice(0, 160).trim();
}

function extractBodyText(bodyJson) {
  if (!isRecord(bodyJson) || !Array.isArray(bodyJson.blocks)) return '';
  const parts = [];
  const push = (value) => {
    const text = clean(value);
    if (text) parts.push(text);
  };
  for (const block of bodyJson.blocks) {
    if (!isRecord(block)) continue;
    switch (clean(block.type)) {
      case 'paragraph':
      case 'heading':
        push(block.text);
        break;
      case 'list':
        cleanList(block.items).forEach(push);
        break;
      case 'quote':
        push(block.text);
        push(block.cite);
        break;
      case 'callout':
        push(block.title);
        push(block.text);
        break;
      case 'table':
        push(block.caption);
        cleanList(block.headers).forEach(push);
        if (Array.isArray(block.rows)) block.rows.forEach((row) => cleanList(row).forEach(push));
        break;
      case 'resource':
        push(block.label);
        push(block.description);
        break;
      case 'image':
        push(block.alt);
        push(block.caption);
        break;
      case 'faq':
        if (Array.isArray(block.items)) {
          for (const item of block.items) {
            if (!isRecord(item)) continue;
            push(item.question);
            push(item.answer);
          }
        }
        break;
      default:
        break;
    }
  }
  return parts.join('\n\n').slice(0, 250000);
}

function toReleaseRecord(raw, sourceFile) {
  if (!isRecord(raw)) throw new Error(`${sourceFile}: invalid record`);
  const slug = clean(raw.slug).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`${sourceFile}: invalid slug ${slug}`);
  if (raw.content_type !== 'condition') throw new Error(`${slug}: source must be content_type=condition`);
  if (raw.status === 'published' || raw.robots_index !== false) throw new Error(`${slug}: editorial source must remain draft/noindex`);
  const canonical = `/encyclopedia/${slug}/`;
  if (clean(raw.canonical_url) !== canonical) throw new Error(`${slug}: canonical must be ${canonical}`);

  const bodyJson = isRecord(raw.body_json) ? raw.body_json : {};
  const sourceSchema = isRecord(raw.schema_json) ? raw.schema_json : {};
  const references = Array.isArray(raw.references_json) ? raw.references_json : [];
  const secondaryKeywords = cleanList(raw.secondary_keywords);
  const sourceAliases = cleanList(raw.search_aliases);
  const seoTitle = fitSeoTitle(raw.seo_title, raw.primary_keyword, raw.title);
  const seoDescription = fitSeoDescription(raw.seo_description, raw.excerpt);
  if (!seoTitle || seoTitle.length > 47) throw new Error(`${slug}: generated SEO title violates the 47-character release contract`);
  if (seoDescription.length < 150 || seoDescription.length > 160) throw new Error(`${slug}: generated SEO description violates the 150-160 character release contract`);

  return {
    id: `psych-release:${slug}`,
    slug,
    title: clean(raw.title),
    excerpt: clean(raw.excerpt) || null,
    body_json: bodyJson,
    body_text: extractBodyText(bodyJson) || null,
    schema_json: {
      ...sourceSchema,
      rawafid_release: {
        id: RELEASE_ID,
        source: 'static-assets-audited',
        released_at: RELEASED_AT,
        human_reviewer_claimed: false,
      },
    },
    content_type: 'condition',
    audience: cleanList(raw.audience),
    seo_title: seoTitle,
    seo_description: seoDescription,
    canonical_url: canonical,
    robots_index: true,
    robots_follow: raw.robots_follow !== false,
    published_at: RELEASED_AT,
    updated_at: RELEASED_AT,
    featured_image_url: clean(raw.featured_image_url) || null,
    featured_image_alt: clean(raw.featured_image_alt) || null,
    primary_keyword: clean(raw.primary_keyword) || null,
    secondary_keywords: secondaryKeywords,
    semantic_terms: cleanList(raw.semantic_terms),
    search_intent: clean(raw.search_intent) || 'informational',
    author_display_name: clean(raw.author_display_name) || 'فريق روافد التحريري',
    reviewer_display_name: clean(raw.reviewer_display_name) || null,
    reviewer_credentials: clean(raw.reviewer_credentials) || null,
    last_reviewed_at: clean(raw.last_reviewed_at) || null,
    references_json: references,
    medical_disclaimer: clean(raw.medical_disclaimer) || DEFAULT_DISCLAIMER,
    search_aliases: sourceAliases.length ? sourceAliases : secondaryKeywords,
  };
}

function toIndexRecord(record) {
  const schema = isRecord(record.schema_json) ? record.schema_json : {};
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    canonical_url: record.canonical_url,
    primary_keyword: record.primary_keyword,
    secondary_keywords: record.secondary_keywords,
    semantic_terms: record.semantic_terms,
    search_aliases: record.search_aliases,
    search_intent: record.search_intent,
    search_intent_questions: cleanList(schema.search_intent_questions),
    updated_at: record.updated_at,
  };
}

async function main() {
  const files = (await fs.readdir(BATCH_DIR)).filter((name) => name.endsWith('.json')).sort();
  if (files.length !== EXPECTED_BATCH_FILES) throw new Error(`Expected ${EXPECTED_BATCH_FILES} encyclopedia batches, found ${files.length}`);

  const records = [];
  const slugs = new Set();
  for (const file of files) {
    const payload = JSON.parse(await fs.readFile(path.join(BATCH_DIR, file), 'utf8'));
    if (!isRecord(payload) || !Array.isArray(payload.records)) throw new Error(`${file}: missing records[]`);
    for (const raw of payload.records) {
      const record = toReleaseRecord(raw, file);
      if (slugs.has(record.slug)) throw new Error(`Duplicate encyclopedia slug: ${record.slug}`);
      slugs.add(record.slug);
      records.push(record);
    }
  }
  if (records.length !== EXPECTED_RECORDS) throw new Error(`Expected ${EXPECTED_RECORDS} encyclopedia records, found ${records.length}`);

  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(RECORD_DIR, { recursive: true });

  const writes = records.map((record) => fs.writeFile(
    path.join(RECORD_DIR, `${record.slug}.json`),
    JSON.stringify(record),
    'utf8',
  ));
  await Promise.all(writes);

  const index = records.map(toIndexRecord).sort((a, b) => a.title.localeCompare(b.title, 'ar'));
  await fs.writeFile(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify({
    release_id: RELEASE_ID,
    released_at: RELEASED_AT,
    records: records.length,
    batch_files: files.length,
    storage: 'workers-static-assets',
  }), 'utf8');

  const indexBytes = Buffer.byteLength(JSON.stringify(index));
  const recordBytes = records.reduce((sum, record) => sum + Buffer.byteLength(JSON.stringify(record)), 0);
  console.log(`Psychological encyclopedia static assets built: ${records.length} records / ${files.length} batches.`);
  console.log(`Static asset payload: index=${indexBytes} bytes, records=${recordBytes} bytes, total=${indexBytes + recordBytes} bytes.`);
}

main().catch((error) => {
  console.error(`Psychological encyclopedia asset build failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
