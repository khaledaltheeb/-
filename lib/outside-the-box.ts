import { createClient } from '@/lib/supabase/server';
import type { CapabilityRecord } from '@/lib/capabilities';

type JsonRecord = Record<string, unknown>;

export type OutsideBoxReference = {
  title?: string;
  url?: string;
  publisher?: string;
  year?: string | number;
};

export type OutsideBoxIndexItem = {
  slug: string;
  title: string;
  href: string;
  excerpt: string | null;
  referenceCount: number;
  kind: 'condition' | 'methodology';
};

export type OutsideBoxSibling = {
  title: string;
  href: string;
};

const SCIENTIFIC_METHOD_SLUGS = new Set([
  'evidence-standard',
  'methodology',
  'monitoring-matrix',
  'instruments',
  'review-governance',
]);

const NON_READER_ARTIFACTS = [
  /^الحالة\s+\d+\s+من\s+100\s*[·•]/u,
  /^البوابة\s+(الأولى|الثانية|الثالثة|الرابعة|الخامسة|السادسة|السابعة)$/u,
  /^الطبقة التشغيلية الموسعة\s*[·•]\s*الإصدار\s+\d+$/u,
  /^رمز البروتوكول\s*:/u,
  /^حالة المراجعة\s*:/u,
  /^حالة المراجعة العلمية لهذا المسار$/u,
  /^فتح المرجع المباشر الخاص بالحالة أو قاعدة الحالة/u,
];

const SHARED_LAYER_START = /^الطبقة التشغيلية الموسعة\s*[·•]\s*الإصدار\s+\d+$/u;
const SHARED_LAYER_END = new Set(['البوابة الخامسة', 'ما المتوقع من الحالة؟']);

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function isReaderArtifact(text: string) {
  const normalized = text.trim();
  return NON_READER_ARTIFACTS.some((pattern) => pattern.test(normalized));
}

function blockText(value: unknown) {
  const row = asRecord(value);
  return row ? asString(row.text) : '';
}

/**
 * Legacy condition records contain an expanded "ten plans" layer copied almost
 * verbatim across the condition library. The source stays intact in Supabase for
 * provenance/research, but publishing that layer on every condition page inflates
 * page length without adding condition-specific evidence. Keep the condition's
 * assessment/ideas plus its outcome, monitoring, reassessment and reference gates;
 * publish the shared operating method once through the methodology pages instead.
 */
function pruneSharedTenPlanLayer(blocks: unknown[]) {
  const start = blocks.findIndex((block) => SHARED_LAYER_START.test(blockText(block)));
  if (start < 0) return blocks;

  const end = blocks.findIndex((block, index) => index > start && SHARED_LAYER_END.has(blockText(block)));
  if (end < 0) return blocks;

  return [...blocks.slice(0, start), ...blocks.slice(end)];
}

function pruneSharedTenPlanText(value: string) {
  const lines = value.split('\n');
  const start = lines.findIndex((line) => SHARED_LAYER_START.test(line.trim()));
  if (start < 0) return value;

  const end = lines.findIndex((line, index) => index > start && SHARED_LAYER_END.has(line.trim()));
  if (end < 0) return value;

  return [...lines.slice(0, start), ...lines.slice(end)].join('\n');
}

export function sanitizeOutsideBoxText(value: string) {
  return pruneSharedTenPlanText(value)
    .split('\n')
    .filter((line) => !isReaderArtifact(line))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sanitizeOutsideBoxValue(value: unknown): unknown {
  if (typeof value === 'string') return value.split('\n').filter((line) => !isReaderArtifact(line)).join('\n').replace(/\n{3,}/g, '\n\n').trim();
  if (Array.isArray(value)) {
    return value
      .map(sanitizeOutsideBoxValue)
      .filter((item) => item !== null && !(typeof item === 'string' && item.trim().length === 0));
  }

  const row = asRecord(value);
  if (!row) return value;

  if (typeof row.text === 'string' && isReaderArtifact(row.text)) return null;

  const next: JsonRecord = {};
  for (const [key, item] of Object.entries(row)) {
    if (key === 'legacy_schema' || key === 'legacy_migration' || key === 'migration_program') continue;
    next[key] = sanitizeOutsideBoxValue(item);
  }
  return next;
}

export function sanitizeOutsideBoxBody(value: unknown) {
  const source = asRecord(value);
  if (!source || !Array.isArray(source.blocks)) return sanitizeOutsideBoxValue(value);

  const sourceWithoutSharedLayer = {
    ...source,
    blocks: pruneSharedTenPlanLayer(source.blocks),
  };
  const root = sanitizeOutsideBoxValue(sourceWithoutSharedLayer);
  const row = asRecord(root);
  if (!row || !Array.isArray(row.blocks)) return root;
  return { ...row, blocks: row.blocks.filter(Boolean) };
}

export function safeOutsideBoxReferences(value: unknown): OutsideBoxReference[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 100).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const url = asString(row.url);
    const title = sanitizeOutsideBoxText(asString(row.title));
    if (!url && !title) return [];
    const key = `${url}|${title}`;
    if (seen.has(key)) return [];
    seen.add(key);
    return [{
      title: title || undefined,
      url: url || undefined,
      publisher: sanitizeOutsideBoxText(asString(row.publisher || row.host)) || undefined,
      year: typeof row.year === 'string' || typeof row.year === 'number' ? row.year : undefined,
    }];
  });
}

export function outsideBoxContentSlug(routeSlug: string) {
  return `legacy-outside-box-${routeSlug}`;
}

export async function getOutsideBoxRecord(routeSlug: string): Promise<CapabilityRecord | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json')
    .eq('slug', outsideBoxContentSlug(routeSlug))
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', now)
    .maybeSingle();

  return (data as CapabilityRecord | null) ?? null;
}

export async function getOutsideBoxIndexItems(): Promise<OutsideBoxIndexItem[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('content')
    .select('slug,title,excerpt,canonical_url,references_json')
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', now)
    .like('slug', 'legacy-outside-box-%')
    .like('canonical_url', '/outside-the-box/%')
    .limit(150);

  if (error) throw new Error(`outside-the-box scientific library query failed: ${error.message}`);

  const rows = Array.isArray(data) ? data : [];
  return rows.flatMap((row) => {
    const canonical = asString(row.canonical_url);
    const match = canonical.match(/^\/outside-the-box\/([^/]+)\/?$/u);
    if (!match) return [];
    const slug = match[1];
    const refs = Array.isArray(row.references_json) ? row.references_json.length : 0;
    return [{
      slug,
      title: asString(row.title),
      href: `/outside-the-box/${slug}/`,
      excerpt: asString(row.excerpt) || null,
      referenceCount: refs,
      kind: SCIENTIFIC_METHOD_SLUGS.has(slug) ? 'methodology' as const : 'condition' as const,
    }];
  }).sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'methodology' ? -1 : 1;
    return a.title.localeCompare(b.title, 'ar');
  });
}

export async function getCapabilitySibling(routeSlug: string): Promise<OutsideBoxSibling | null> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('content')
    .select('title,canonical_url')
    .eq('canonical_url', `/capabilities/${routeSlug}/`)
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', now)
    .maybeSingle();
  if (!data) return null;
  return {
    title: asString(data.title),
    href: asString(data.canonical_url) || `/capabilities/${routeSlug}/`,
  };
}

export async function getOutsideBoxSibling(routeSlug: string): Promise<OutsideBoxSibling | null> {
  const record = await getOutsideBoxRecord(routeSlug);
  if (!record) return null;
  return {
    title: record.title,
    href: record.canonical_url || `/outside-the-box/${routeSlug}/`,
  };
}
