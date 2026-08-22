#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CATEGORY_FILE = path.join(ROOT, 'data', 'expanded-encyclopedia', 'categories.json');
const BATCH_DIR = path.join(ROOT, 'data', 'expanded-encyclopedia', 'batches');
const LEGACY_BATCH_DIR = path.join(ROOT, 'data', 'encyclopedia', 'batches');
const COGNITIVE_PROGRAM_FILE = path.join(ROOT, 'lib', 'cognitive-program.ts');
const OUTPUT_DIR = path.join(ROOT, 'public', 'expanded-encyclopedia-data');
const RECORD_DIR = path.join(OUTPUT_DIR, 'records');
const RELEASE_ID = 'expanded-encyclopedia-wave-001-v1';
const RELEASED_AT = '2026-08-22T19:30:00.000Z';
const MIN_WORDS = 100;
const ALLOWED_TYPES = new Set(['glossary_term', 'intervention', 'assessment', 'condition']);
const DEFAULT_DISCLAIMER = 'هذا المحتوى للتثقيف العام ولا يقدم تشخيصًا فرديًا أو وصفة علاجية، ولا يغني عن تقييم مختص مؤهل عند الحاجة.';

const clean = (value) => typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';
const cleanList = (value) => Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function normalizeTermIdentity(value) {
  return clean(value)
    .normalize('NFKC')
    .toLocaleLowerCase('ar')
    .replace(/[\u064B-\u065F\u0670\u0640]/gu, '')
    .replace(/[أإآٱ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .replace(/[’'"`´]/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

function validSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function words(value) {
  return clean(value).split(/\s+/u).filter(Boolean).length;
}

function refs(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const title = clean(raw.title);
    const publisher = clean(raw.publisher);
    const url = clean(raw.url);
    const year = clean(raw.year);
    if (!title || !publisher || !/^https:\/\//i.test(url)) return [];
    return [{ title, publisher, url, ...(year ? { year } : {}) }];
  });
}

function faq(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!isRecord(raw)) return [];
    const question = clean(raw.question);
    const answer = clean(raw.answer);
    return question && answer ? [{ question, answer }] : [];
  });
}

function identityCandidates(raw) {
  return [raw.canonical_term, raw.english_name, raw.primary_keyword, ...(Array.isArray(raw.aliases) ? raw.aliases : [])]
    .map(clean)
    .filter(Boolean);
}

function reserveIdentity(map, rawValue, source) {
  const key = normalizeTermIdentity(rawValue);
  if (!key) return;
  const previous = map.get(key);
  if (previous && previous !== source) throw new Error(`Duplicate term identity «${rawValue}»: ${source} conflicts with ${previous}`);
  map.set(key, source);
}

async function loadReservedIdentities() {
  const reserved = new Map();
  const legacyFiles = (await fs.readdir(LEGACY_BATCH_DIR)).filter((name) => name.endsWith('.json')).sort();
  for (const file of legacyFiles) {
    const payload = JSON.parse(await fs.readFile(path.join(LEGACY_BATCH_DIR, file), 'utf8'));
    if (!isRecord(payload) || !Array.isArray(payload.records)) continue;
    for (const raw of payload.records) {
      if (!isRecord(raw)) continue;
      const source = `short-encyclopedia:${clean(raw.slug) || file}`;
      const titleHead = clean(raw.title).split(/[:：]/u)[0];
      for (const value of [raw.primary_keyword, titleHead, ...(Array.isArray(raw.search_aliases) ? raw.search_aliases : [])]) {
        if (clean(value)) reserveIdentity(reserved, value, source);
      }
      const slug = clean(raw.slug).replace(/-/g, ' ');
      if (slug) reserveIdentity(reserved, slug, source);
    }
  }

  const cognitiveSource = await fs.readFile(COGNITIVE_PROGRAM_FILE, 'utf8');
  const profilePattern = /P\('([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'/gu;
  for (const match of cognitiveSource.matchAll(profilePattern)) {
    const [, key, slug, name] = match;
    reserveIdentity(reserved, name, `cognitive-profile:${key}`);
    reserveIdentity(reserved, slug.replace(/-/g, ' '), `cognitive-profile:${key}`);
  }
  return reserved;
}

function pageSections(raw) {
  const term = clean(raw.canonical_term);
  const english = clean(raw.english_name);
  const intro = clean(raw.definition);
  const presentation = clean(raw.presentation_or_use);
  const mechanisms = clean(raw.mechanisms_or_context);
  const practice = clean(raw.assessment_or_practice);
  const boundary = clean(raw.boundary);
  const type = clean(raw.content_type);
  const isIntervention = type === 'intervention';
  const isAssessment = type === 'assessment';
  const contextHeading = isIntervention ? 'كيف يعمل وما حدود الدليل؟' : isAssessment ? 'كيف يُستخدم في التقييم؟' : `كيف يظهر ${term} أو يُستخدم سريريًا؟`;
  const mechanismHeading = isIntervention ? 'الاستخدام والممارسة المسؤولة' : isAssessment ? 'ما الذي يؤثر في التفسير؟' : 'الأسباب والآليات والسياق';
  return [
    { type: 'paragraph', text: `${term}${english ? ` (${english})` : ''} مصطلح يحتاج إلى فهم دقيق للسياق وعدم تحويله تلقائيًا إلى تشخيص. ${intro}` },
    { type: 'heading', level: 2, text: `ما هو ${term}؟` },
    { type: 'paragraph', text: intro },
    { type: 'heading', level: 2, text: contextHeading },
    { type: 'paragraph', text: presentation },
    { type: 'heading', level: 3, text: 'حدود المصطلح وما لا يعنيه' },
    { type: 'paragraph', text: boundary },
    { type: 'heading', level: 2, text: mechanismHeading },
    { type: 'paragraph', text: mechanisms },
    { type: 'heading', level: 2, text: isIntervention ? 'متى يحتاج التطبيق إلى مختص؟' : 'كيف يُقيّم أو يُفهم بصورة أدق؟' },
    { type: 'paragraph', text: practice },
    { type: 'heading', level: 2, text: 'أسئلة شائعة' },
    { type: 'faq', items: faq(raw.faq) },
  ];
}

function bodyText(blocks) {
  const parts = [];
  for (const block of blocks) {
    if (block.type === 'paragraph' || block.type === 'heading') parts.push(clean(block.text));
    if (block.type === 'faq') for (const item of block.items) parts.push(clean(item.question), clean(item.answer));
  }
  return parts.filter(Boolean).join('\n\n');
}

function toReleaseRecord(raw, sourceFile, categoryMap) {
  if (!isRecord(raw)) throw new Error(`${sourceFile}: invalid record`);
  const slug = clean(raw.slug).toLowerCase();
  const canonicalTerm = clean(raw.canonical_term);
  const categorySlug = clean(raw.category_slug);
  const contentType = clean(raw.content_type);
  const category = categoryMap.get(categorySlug);
  if (!validSlug(slug)) throw new Error(`${sourceFile}: invalid slug ${slug}`);
  if (!canonicalTerm) throw new Error(`${slug}: canonical_term is required`);
  if (!category) throw new Error(`${slug}: unknown category ${categorySlug}`);
  if (!ALLOWED_TYPES.has(contentType)) throw new Error(`${slug}: unsupported content_type ${contentType}`);
  if (contentType === 'condition' && raw.classification_status !== 'official-diagnosis') throw new Error(`${slug}: condition pages require classification_status=official-diagnosis`);

  const references = refs(raw.references);
  const faqItems = faq(raw.faq);
  if (references.length < 2) throw new Error(`${slug}: at least 2 references are required`);
  if (faqItems.length < 2) throw new Error(`${slug}: at least 2 FAQ items are required`);
  for (const field of ['definition', 'presentation_or_use', 'mechanisms_or_context', 'assessment_or_practice', 'boundary']) {
    if (words(raw[field]) < 12) throw new Error(`${slug}: ${field} must contain at least 12 words`);
  }

  const blocks = pageSections(raw);
  const text = bodyText(blocks);
  if (words(text) < MIN_WORDS) throw new Error(`${slug}: ${words(text)} words is below the ${MIN_WORDS}-word floor`);

  const aliases = cleanList(raw.aliases);
  const englishName = clean(raw.english_name);
  const primaryKeyword = clean(raw.primary_keyword) || canonicalTerm;
  const secondaryKeywords = [...new Set([englishName, ...aliases, ...cleanList(raw.secondary_keywords)].filter(Boolean))];
  const semanticTerms = [...new Set(cleanList(raw.semantic_terms))];
  const excerpt = clean(raw.excerpt);
  if (excerpt.length < 80 || excerpt.length > 220) throw new Error(`${slug}: excerpt must be 80-220 characters`);

  const canonicalUrl = `/content/${slug}`;
  return {
    id: `expanded-encyclopedia:${slug}`,
    slug,
    canonical_term: canonicalTerm,
    english_name: englishName || null,
    aliases,
    title: clean(raw.title) || `${canonicalTerm}: التعريف والدلالات والاستخدام`,
    excerpt,
    body_json: { version: 3, format: 'blocks', blocks },
    body_text: text,
    schema_json: {
      expanded_encyclopedia: {
        release_id: RELEASE_ID,
        released_at: RELEASED_AT,
        canonical_term: canonicalTerm,
        normalized_identity: normalizeTermIdentity(canonicalTerm),
        classification_status: clean(raw.classification_status) || 'clinical-concept',
      },
      curated_related_slugs: cleanList(raw.related_slugs).slice(0, 8),
      search_intent_questions: faqItems.map((item) => item.question),
    },
    content_type: contentType,
    audience: cleanList(raw.audience).length ? cleanList(raw.audience) : ['الجمهور العام', 'الطلاب', 'الممارسون'],
    seo_title: clean(raw.seo_title) || `${canonicalTerm}: معنى المصطلح ودلالته`,
    seo_description: clean(raw.seo_description) || excerpt,
    canonical_url: canonicalUrl,
    robots_index: true,
    robots_follow: true,
    published_at: RELEASED_AT,
    updated_at: RELEASED_AT,
    featured_image_url: null,
    featured_image_alt: null,
    primary_keyword: primaryKeyword,
    secondary_keywords: secondaryKeywords,
    semantic_terms: semanticTerms,
    search_intent: clean(raw.search_intent) || 'informational',
    author_display_name: 'فريق روافد التحريري',
    reviewer_display_name: null,
    reviewer_credentials: null,
    last_reviewed_at: null,
    references_json: references,
    medical_disclaimer: DEFAULT_DISCLAIMER,
    category_slug: categorySlug,
    category_name: category.name,
  };
}

function toIndexRecord(record) {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    excerpt: record.excerpt,
    canonical_url: record.canonical_url,
    content_type: record.content_type,
    category_slug: record.category_slug,
    category_name: record.category_name,
    canonical_term: record.canonical_term,
    english_name: record.english_name,
    aliases: record.aliases,
    primary_keyword: record.primary_keyword,
    secondary_keywords: record.secondary_keywords,
    semantic_terms: record.semantic_terms,
    updated_at: record.updated_at,
  };
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  const categories = JSON.parse(await fs.readFile(CATEGORY_FILE, 'utf8'));
  if (!Array.isArray(categories) || categories.length < 10) throw new Error('Expanded encyclopedia categories are missing or incomplete');
  const categoryMap = new Map(categories.map((item) => [clean(item.slug), item]));
  if (categoryMap.size !== categories.length) throw new Error('Duplicate expanded encyclopedia category slug');

  const sourceFiles = (await fs.readdir(BATCH_DIR)).filter((name) => name.endsWith('.json')).sort();
  if (!sourceFiles.length) throw new Error('No expanded encyclopedia batch files found');

  const reserved = await loadReservedIdentities();
  const ownIdentities = new Map();
  const slugs = new Set();
  const records = [];

  for (const file of sourceFiles) {
    const payload = JSON.parse(await fs.readFile(path.join(BATCH_DIR, file), 'utf8'));
    if (!isRecord(payload) || !Array.isArray(payload.records)) throw new Error(`${file}: missing records[]`);
    for (const raw of payload.records) {
      if (!isRecord(raw)) throw new Error(`${file}: invalid record`);
      const slug = clean(raw.slug).toLowerCase();
      if (slugs.has(slug)) throw new Error(`Duplicate expanded encyclopedia slug: ${slug}`);
      slugs.add(slug);
      const source = `expanded:${slug}`;
      for (const identity of identityCandidates(raw)) {
        const key = normalizeTermIdentity(identity);
        const reservedSource = reserved.get(key);
        if (reservedSource) throw new Error(`Expanded term «${identity}» (${slug}) conflicts with ${reservedSource}`);
        const ownSource = ownIdentities.get(key);
        if (ownSource && ownSource !== source) throw new Error(`Expanded term «${identity}» (${slug}) conflicts with ${ownSource}`);
        ownIdentities.set(key, source);
      }
      records.push(toReleaseRecord(raw, file, categoryMap));
    }
  }

  if (checkOnly) {
    console.log(`Expanded encyclopedia validation passed: ${records.length} unique terms / ${categories.length} categories / ${sourceFiles.length} batches.`);
    return;
  }

  await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
  await fs.mkdir(RECORD_DIR, { recursive: true });
  await Promise.all(records.map((record) => fs.writeFile(path.join(RECORD_DIR, `${record.slug}.json`), JSON.stringify(record), 'utf8')));
  const index = records.map(toIndexRecord).sort((a, b) => a.title.localeCompare(b.title, 'ar'));
  await fs.writeFile(path.join(OUTPUT_DIR, 'index.json'), JSON.stringify(index), 'utf8');
  await fs.writeFile(path.join(OUTPUT_DIR, 'manifest.json'), JSON.stringify({
    release_id: RELEASE_ID,
    released_at: RELEASED_AT,
    records: records.length,
    categories: categories.length,
    batches: sourceFiles.length,
    min_words: MIN_WORDS,
    duplicate_guard: ['canonical_term', 'english_name', 'primary_keyword', 'aliases', 'legacy-short-encyclopedia', 'cognitive-profiles'],
    storage: 'workers-static-assets',
  }), 'utf8');
  console.log(`Expanded encyclopedia static assets built: ${records.length} unique terms.`);
}

main().catch((error) => {
  console.error(`Expanded encyclopedia build failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
