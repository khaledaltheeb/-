import { createClient } from '@/lib/supabase/server';

type JsonRecord = Record<string, unknown>;

export type QuickInfoReference = {
  title?: string;
  url?: string;
  publisher?: string;
  year?: string | number;
};

export type QuickInfoFaq = { question: string; answer: string };

export type QuickInfoRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  content_type: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  published_at: string | null;
  updated_at: string | null;
  featured_image_url: string | null;
  featured_image_alt: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  semantic_terms: string[] | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: unknown;
  medical_disclaimer: string | null;
  schema_json: unknown;
};

export type QuickInfoItem = {
  id: string;
  routeSlug: string;
  title: string;
  excerpt: string | null;
  canonicalUrl: string;
  featuredImageUrl: string | null;
  updatedAt: string | null;
};

const GENERATED_QUICK_INFO_SECTION_START = 'ما الذي يريد الباحث معرفته فعلًا؟';
const GENERATED_QUICK_INFO_SECTION_END = 'أسئلة شائعة بعد المراجعة';
const GENERATED_QUICK_INFO_PARAGRAPH_PREFIXES = [
  'هذه النقطة مأخوذة من المحتوى الأصلي للصفحة',
  'في هذا المجال، من المفيد ربطها بعدسة إضافية:',
  'عند تطبيق هذه النقطة على حياتك',
  'اربطها كذلك بهذا الاعتبار الخاص بمجال',
] as const;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function safeImageUrl(value: unknown) {
  const raw = asString(value);
  if (!raw) return '';
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return '';
    // Legacy Quick Info cards are first-party assets that will remain on the
    // canonical healthrenewal.org domain after cutover.
    if (url.hostname !== 'healthrenewal.org' && url.hostname !== 'www.healthrenewal.org') return '';
    if (!url.pathname.startsWith('/assets/')) return '';
    return url.toString();
  } catch {
    return '';
  }
}

function schemaImageCandidate(value: unknown): string {
  const root = asRecord(value);
  const legacySchemas = Array.isArray(root?.legacy_schema) ? root.legacy_schema : [];

  for (const schemaValue of legacySchemas) {
    const schema = asRecord(schemaValue);
    if (!schema) continue;
    const graph = Array.isArray(schema['@graph']) ? schema['@graph'] : [schema];
    for (const nodeValue of graph) {
      const node = asRecord(nodeValue);
      if (!node) continue;
      const image = node.image;
      if (Array.isArray(image)) {
        for (const item of image) {
          const direct = safeImageUrl(item);
          if (direct) return direct;
          const objectUrl = safeImageUrl(asRecord(item)?.url ?? asRecord(item)?.contentUrl);
          if (objectUrl) return objectUrl;
        }
      } else {
        const direct = safeImageUrl(image);
        if (direct) return direct;
        const imageObject = asRecord(image);
        const objectUrl = safeImageUrl(imageObject?.url ?? imageObject?.contentUrl);
        if (objectUrl) return objectUrl;
      }
    }
  }
  return '';
}

function effectiveFeaturedImage(featuredImage: unknown, schema: unknown) {
  const explicit = safeImageUrl(featuredImage);
  return explicit || schemaImageCandidate(schema) || null;
}

function publicationApproved(schema: unknown): boolean {
  const record = asRecord(schema);
  return Boolean(
    record
    && asString(record.page_role) === 'quick-info'
    && record.publication_ready === true
    && record.editorial_review_required === false,
  );
}

function blockText(value: unknown) {
  return asString(asRecord(value)?.text);
}

function isHeading(value: unknown, text: string) {
  const block = asRecord(value);
  return Boolean(block && block.type === 'heading' && blockText(value) === text);
}

function isKnownGeneratedParagraph(value: unknown) {
  const block = asRecord(value);
  if (!block || block.type !== 'paragraph') return false;
  const valueText = blockText(value);
  return GENERATED_QUICK_INFO_PARAGRAPH_PREFIXES.some((prefix) => valueText.startsWith(prefix));
}

/**
 * Removes only the legacy generated expansion that was proven to be repetitive.
 * The database remains the source of record; this is a reader-facing safety net
 * until the five already-published wave-001 records are replaced editorially.
 */
export function sanitizeQuickInfoBodyJson(value: unknown): unknown {
  const root = asRecord(value);
  const blocks = Array.isArray(root?.blocks) ? root.blocks : null;
  if (!root || !blocks?.length) return value;

  const hasGeneratedParagraph = blocks.some(isKnownGeneratedParagraph);
  if (!hasGeneratedParagraph) return value;

  const startIndex = blocks.findIndex((block) => isHeading(block, GENERATED_QUICK_INFO_SECTION_START));
  const endIndex = startIndex >= 0
    ? blocks.findIndex((block, index) => index > startIndex && isHeading(block, GENERATED_QUICK_INFO_SECTION_END))
    : -1;

  const cleaned = blocks.filter((block, index) => {
    if (isKnownGeneratedParagraph(block)) return false;
    if (startIndex >= 0 && endIndex > startIndex && index >= startIndex && index < endIndex) return false;
    return true;
  });

  return { ...root, blocks: cleaned };
}

export function quickInfoContentSlug(routeSlug: string) {
  return `quick-info-${routeSlug}`;
}

export function quickInfoRouteSlug(contentSlug: string) {
  return contentSlug.startsWith('quick-info-') ? contentSlug.slice('quick-info-'.length) : contentSlug;
}

export async function getQuickInfoRecord(routeSlug: string): Promise<QuickInfoRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_json,body_text,content_type,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json')
    .eq('slug', quickInfoContentSlug(routeSlug))
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  const record = data as QuickInfoRecord | null;
  if (!record) return null;
  if (!publicationApproved(record.schema_json)) return null;
  const expectedCanonical = `/quick-info/${routeSlug}/`;
  if (record.canonical_url && record.canonical_url !== expectedCanonical) return null;
  const featuredImage = effectiveFeaturedImage(record.featured_image_url, record.schema_json);
  return {
    ...record,
    body_json: sanitizeQuickInfoBodyJson(record.body_json),
    featured_image_url: featuredImage,
    featured_image_alt: featuredImage ? (record.featured_image_alt || record.title) : record.featured_image_alt,
  };
}

export async function getQuickInfoItems(limit = 500): Promise<QuickInfoItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,canonical_url,featured_image_url,updated_at,schema_json')
    .like('slug', 'quick-info-%')
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .order('title', { ascending: true })
    .limit(limit);

  return (Array.isArray(data) ? data : []).flatMap((row): QuickInfoItem[] => {
    if (!publicationApproved(row.schema_json)) return [];
    const routeSlug = quickInfoRouteSlug(asString(row.slug));
    if (!routeSlug || !/^[a-z0-9][a-z0-9-]*$/.test(routeSlug)) return [];
    const canonicalUrl = asString(row.canonical_url) || `/quick-info/${routeSlug}/`;
    if (canonicalUrl !== `/quick-info/${routeSlug}/`) return [];
    return [{
      id: asString(row.id),
      routeSlug,
      title: asString(row.title),
      excerpt: typeof row.excerpt === 'string' ? row.excerpt : null,
      canonicalUrl,
      featuredImageUrl: effectiveFeaturedImage(row.featured_image_url, row.schema_json),
      updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
    }];
  });
}

export function safeQuickInfoReferences(value: unknown): QuickInfoReference[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).flatMap((item): QuickInfoReference[] => {
    const row = asRecord(item);
    if (!row) return [];
    const title = asString(row.title);
    const url = asString(row.url);
    const publisher = asString(row.publisher);
    const year = typeof row.year === 'string' || typeof row.year === 'number' ? row.year : undefined;
    if (!title && !/^https:\/\//i.test(url)) return [];
    return [{
      title: title || undefined,
      url: /^https:\/\//i.test(url) ? url : undefined,
      publisher: publisher || undefined,
      year,
    }];
  });
}

export function visibleQuickInfoFaq(value: unknown): QuickInfoFaq[] {
  const root = asRecord(value);
  const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  return blocks.flatMap((block): QuickInfoFaq[] => {
    const row = asRecord(block);
    if (!row || row.type !== 'faq' || !Array.isArray(row.items)) return [];
    return row.items.flatMap((item): QuickInfoFaq[] => {
      const faq = asRecord(item);
      const question = asString(faq?.question).slice(0, 500);
      const answer = asString(faq?.answer).slice(0, 6000);
      return question.length >= 3 && answer.length >= 3 ? [{ question, answer }] : [];
    });
  }).slice(0, 40);
}
