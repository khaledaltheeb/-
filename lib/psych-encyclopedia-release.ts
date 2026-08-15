import batch001 from '@/data/encyclopedia/batches/001-anxiety-core.json';
import batch002 from '@/data/encyclopedia/batches/002-ocd-trauma.json';
import batch003 from '@/data/encyclopedia/batches/003-social-anxiety-adhd.json';
import batch004 from '@/data/encyclopedia/batches/004-bipolar-anorexia.json';
import batch005 from '@/data/encyclopedia/batches/005-bulimia-binge-eating.json';
import batch006 from '@/data/encyclopedia/batches/006-schizophrenia-borderline.json';
import batch007 from '@/data/encyclopedia/batches/007-bdd-hoarding.json';
import batch008 from '@/data/encyclopedia/batches/008-trichotillomania-excoriation.json';
import batch009 from '@/data/encyclopedia/batches/009-agoraphobia-specific-phobia.json';
import batch010 from '@/data/encyclopedia/batches/010-separation-anxiety-selective-mutism.json';
import batch011 from '@/data/encyclopedia/batches/011-perinatal-seasonal-depression.json';
import batch012 from '@/data/encyclopedia/batches/012-complex-ptsd-prolonged-grief.json';
import batch013 from '@/data/encyclopedia/batches/013-dissociative-disorders.json';
import batch014 from '@/data/encyclopedia/batches/014-arfid-pica.json';
import batch015 from '@/data/encyclopedia/batches/015-acute-stress-persistent-depression.json';
import batch016 from '@/data/encyclopedia/batches/016-schizoaffective-delusional.json';
import batch017 from '@/data/encyclopedia/batches/017-cyclothymia-adjustment.json';
import batch018 from '@/data/encyclopedia/batches/018-dissociative-amnesia-rumination.json';
import batch019 from '@/data/encyclopedia/batches/019-somatic-symptom-health-anxiety.json';
import batch020 from '@/data/encyclopedia/batches/020-pmdd-intermittent-explosive.json';
import batch021 from '@/data/encyclopedia/batches/021-oppositional-defiant-conduct.json';
import batch022 from '@/data/encyclopedia/batches/022-tourette-persistent-tic.json';
import batch023 from '@/data/encyclopedia/batches/023-dyslexia-developmental-coordination.json';
import batch024 from '@/data/encyclopedia/batches/024-developmental-language-speech-sound.json';
import batch025 from '@/data/encyclopedia/batches/025-stuttering-social-communication.json';

type JsonRecord = Record<string, unknown>;
type Batch = { records?: unknown[] };

export type PsychEncyclopediaReleaseRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  schema_json: unknown;
  content_type: 'condition';
  audience: string[];
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string;
  robots_index: true;
  robots_follow: boolean;
  published_at: string;
  updated_at: string;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[];
  semantic_terms: string[];
  search_intent: string | null;
  author_display_name: string;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: unknown[];
  medical_disclaimer: string;
  search_aliases: string[];
};

export const PSYCH_ENCYCLOPEDIA_RELEASE_ID = 'psych-encyclopedia-public-50-v1';
export const PSYCH_ENCYCLOPEDIA_RELEASED_AT = '2026-08-15T19:20:00.000Z';
export const PSYCH_ENCYCLOPEDIA_RELEASE_EXPECTED_RECORDS = 50;

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
] as const;

const BATCHES: Batch[] = [
  batch001, batch002, batch003, batch004, batch005,
  batch006, batch007, batch008, batch009, batch010,
  batch011, batch012, batch013, batch014, batch015,
  batch016, batch017, batch018, batch019, batch020,
  batch021, batch022, batch023, batch024, batch025,
] as Batch[];

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim().replace(/\s+/gu, ' ') : '';
}

function cleanList(value: unknown) {
  return Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
}

function clipMeta(value: string) {
  const normalized = clean(value);
  if (normalized.length <= 160) return normalized;
  const window = normalized.slice(0, 160);
  const cut = window.lastIndexOf(' ');
  if (cut >= 150) return `${window.slice(0, cut).replace(/[،؛,:\-]+$/u, '').trim()}…`;
  return '';
}

function fitSeoTitle(rawValue: unknown, keywordValue: unknown, titleValue: unknown) {
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
  return (cut >= 20 ? window.slice(0, cut) : window).replace(/[،؛,:\-]+$/u, '').trim();
}

function fitSeoDescription(rawValue: unknown, excerptValue: unknown) {
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

function extractBodyText(bodyJson: unknown) {
  const root = asRecord(bodyJson);
  const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  const parts: string[] = [];
  const push = (value: unknown) => {
    const text = clean(value);
    if (text) parts.push(text);
  };

  for (const block of blocks) {
    const row = asRecord(block);
    if (!row) continue;
    switch (clean(row.type)) {
      case 'paragraph':
      case 'heading':
        push(row.text);
        break;
      case 'list':
        cleanList(row.items).forEach(push);
        break;
      case 'quote':
        push(row.text);
        push(row.cite);
        break;
      case 'callout':
        push(row.title);
        push(row.text);
        break;
      case 'table':
        push(row.caption);
        cleanList(row.headers).forEach(push);
        if (Array.isArray(row.rows)) row.rows.forEach((cells) => cleanList(cells).forEach(push));
        break;
      case 'resource':
        push(row.label);
        push(row.description);
        break;
      case 'image':
        push(row.alt);
        push(row.caption);
        break;
      case 'faq':
        if (Array.isArray(row.items)) {
          for (const item of row.items) {
            const faq = asRecord(item);
            if (!faq) continue;
            push(faq.question);
            push(faq.answer);
          }
        }
        break;
      default:
        break;
    }
  }
  return parts.join('\n\n').slice(0, 250000);
}

function toReleaseRecord(rawValue: unknown, index: number): PsychEncyclopediaReleaseRecord {
  const raw = asRecord(rawValue);
  if (!raw) throw new Error(`Psychological encyclopedia release record ${index + 1} is invalid.`);

  const slug = clean(raw.slug).toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error(`Invalid psychological encyclopedia slug: ${slug}`);
  if (raw.content_type !== 'condition') throw new Error(`${slug}: release source must be content_type=condition.`);
  if (raw.status === 'published' || raw.robots_index !== false) throw new Error(`${slug}: editorial source must remain draft/noindex.`);

  const canonical = `/encyclopedia/${slug}/`;
  if (clean(raw.canonical_url) !== canonical) throw new Error(`${slug}: invalid canonical URL in source batch.`);

  const sourceSchema = asRecord(raw.schema_json) ?? {};
  const sourceReferences = Array.isArray(raw.references_json) ? raw.references_json : [];
  const bodyJson = asRecord(raw.body_json) ?? {};
  const secondaryKeywords = cleanList(raw.secondary_keywords);
  const sourceAliases = cleanList(raw.search_aliases);

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
        id: PSYCH_ENCYCLOPEDIA_RELEASE_ID,
        source: 'code-audited',
        released_at: PSYCH_ENCYCLOPEDIA_RELEASED_AT,
        human_reviewer_claimed: false,
      },
    },
    content_type: 'condition',
    audience: cleanList(raw.audience),
    seo_title: fitSeoTitle(raw.seo_title, raw.primary_keyword, raw.title) || null,
    seo_description: fitSeoDescription(raw.seo_description, raw.excerpt) || null,
    canonical_url: canonical,
    robots_index: true,
    robots_follow: raw.robots_follow !== false,
    published_at: PSYCH_ENCYCLOPEDIA_RELEASED_AT,
    updated_at: PSYCH_ENCYCLOPEDIA_RELEASED_AT,
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
    references_json: sourceReferences,
    medical_disclaimer: clean(raw.medical_disclaimer) || DEFAULT_DISCLAIMER,
    search_aliases: sourceAliases.length ? sourceAliases : secondaryKeywords,
  };
}

const RELEASE_RECORDS = BATCHES.flatMap((batch) => Array.isArray(batch.records) ? batch.records : []).map(toReleaseRecord);

if (RELEASE_RECORDS.length !== PSYCH_ENCYCLOPEDIA_RELEASE_EXPECTED_RECORDS) {
  throw new Error(`Psychological encyclopedia public release expected ${PSYCH_ENCYCLOPEDIA_RELEASE_EXPECTED_RECORDS} records but found ${RELEASE_RECORDS.length}.`);
}

const RELEASE_BY_SLUG = new Map<string, PsychEncyclopediaReleaseRecord>();
for (const record of RELEASE_RECORDS) {
  if (RELEASE_BY_SLUG.has(record.slug)) throw new Error(`Duplicate psychological encyclopedia release slug: ${record.slug}`);
  RELEASE_BY_SLUG.set(record.slug, record);
}

export const PSYCH_ENCYCLOPEDIA_RELEASE_RECORDS = Object.freeze(RELEASE_RECORDS);

export function getPsychEncyclopediaReleaseRecord(slug: string) {
  return RELEASE_BY_SLUG.get(slug.trim().toLowerCase()) ?? null;
}
