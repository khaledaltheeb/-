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

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
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
  return record;
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
      featuredImageUrl: typeof row.featured_image_url === 'string' ? row.featured_image_url : null,
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
