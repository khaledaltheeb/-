import { createClient } from '@/lib/supabase/server';

type JsonRecord = Record<string, unknown>;

export type CareGuideReference = {
  title?: string;
  url?: string;
  publisher?: string;
  year?: string | number;
};

export type CareGuideFaq = { question: string; answer: string };

export type CareGuideItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  canonicalUrl: string;
  category: string;
  audience: string[];
  updatedAt: string | null;
};

export type CareGuideRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  content_type: string;
  audience: string[] | null;
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

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function asStringArray(value: unknown, limit = 50) {
  return Array.isArray(value) ? value.slice(0, limit).map((item) => asString(item)).filter(Boolean) : [];
}

function normalizePathSegments(segments: string[]) {
  return segments
    .map((segment) => segment.trim().toLowerCase())
    .filter((segment) => /^[a-z0-9][a-z0-9-]*$/.test(segment));
}

export function careGuideCanonical(segments: string[]) {
  const safe = normalizePathSegments(segments);
  if (!safe.length || safe.length !== segments.length) return null;
  return `/care-guides/${safe.join('/')}/`;
}

export function careGuidePageRole(value: unknown) {
  return asString(asRecord(value)?.page_role);
}

export function careGuideCategory(value: unknown) {
  return asString(asRecord(value)?.care_guide_category) || 'أدلة التعامل والرعاية';
}

export async function getCareGuidesHubRecord(): Promise<CareGuideRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json')
    .eq('slug', 'care-guides-hub')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  return (data as CareGuideRecord | null) ?? null;
}

export async function getCareGuideRecord(segments: string[]): Promise<CareGuideRecord | null> {
  const canonical = careGuideCanonical(segments);
  if (!canonical) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json')
    .eq('canonical_url', canonical)
    .eq('content_type', 'guide')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  return (data as CareGuideRecord | null) ?? null;
}

export async function getCareGuideItems(): Promise<CareGuideItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,canonical_url,audience,updated_at,schema_json')
    .eq('content_type', 'guide')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .like('canonical_url', '/care-guides/%')
    .order('updated_at', { ascending: false })
    .limit(500);

  const rows = Array.isArray(data) ? data : [];
  return rows.flatMap((row) => {
    const canonicalUrl = asString(row.canonical_url);
    if (!/^\/care-guides\/[a-z0-9][a-z0-9\/-]*\/$/.test(canonicalUrl)) return [];
    return [{
      id: String(row.id),
      slug: asString(row.slug),
      title: asString(row.title),
      excerpt: typeof row.excerpt === 'string' ? row.excerpt : null,
      canonicalUrl,
      category: careGuideCategory(row.schema_json),
      audience: asStringArray(row.audience),
      updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
    }];
  });
}

export function safeCareGuideReferences(value: unknown): CareGuideReference[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const url = asString(row.url);
    const title = asString(row.title);
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

export function visibleCareGuideFaq(value: unknown): CareGuideFaq[] {
  const root = asRecord(value);
  const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  return blocks
    .flatMap((block) => {
      const row = asRecord(block);
      if (!row || row.type !== 'faq' || !Array.isArray(row.items)) return [];
      return row.items.flatMap((item) => {
        const faq = asRecord(item);
        const question = asString(faq?.question).slice(0, 500);
        const answer = asString(faq?.answer).slice(0, 6000);
        return question.length >= 3 && answer.length >= 3 ? [{ question, answer }] : [];
      });
    })
    .slice(0, 40);
}
