import { createClient } from '@/lib/supabase/server';

export type SpecialNeedsReference = { title?: string; url?: string; publisher?: string; year?: string | number };
export type SpecialNeedsRelatedItem = { id: string; title: string; excerpt: string | null; href: string; contentType: string };
export type SpecialNeedsRecord = {
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

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export function specialNeedsCanonical(segments: string[] = []) {
  const safe = segments.map((segment) => segment.trim().toLowerCase()).filter((segment) => /^[a-z0-9][a-z0-9-]*$/.test(segment));
  if (safe.length !== segments.length) return null;
  return safe.length ? `/special-needs/${safe.join('/')}/` : '/special-needs/';
}

export async function getSpecialNeedsRecord(segments: string[] = []): Promise<SpecialNeedsRecord | null> {
  const canonical = specialNeedsCanonical(segments);
  if (!canonical) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json')
    .eq('canonical_url', canonical)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  return (data as SpecialNeedsRecord | null) ?? null;
}

export async function getSpecialNeedsRelated(contentId: string): Promise<SpecialNeedsRelatedItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('related_public_content', { p_content_id: contentId, p_limit: 6 });
  const rows = Array.isArray(data) ? data : [];
  return rows.flatMap((item): SpecialNeedsRelatedItem[] => {
    const row = asRecord(item);
    if (!row) return [];
    const slug = asString(row.slug);
    const canonical = asString(row.canonical_url);
    const title = asString(row.title);
    if (!title) return [];
    return [{
      id: asString(row.id) || `${slug}:${title}`,
      title,
      excerpt: typeof row.excerpt === 'string' ? row.excerpt : null,
      href: canonical || `/content/${slug}`,
      contentType: asString(row.content_type) || 'محتوى',
    }];
  });
}

export function safeSpecialNeedsReferences(value: unknown): SpecialNeedsReference[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 80).flatMap((item): SpecialNeedsReference[] => {
    const row = asRecord(item);
    if (!row) return [];
    const title = asString(row.title);
    const url = asString(row.url);
    const publisher = asString(row.publisher);
    const year = typeof row.year === 'string' || typeof row.year === 'number' ? row.year : undefined;
    if (!title && !/^https:\/\//i.test(url)) return [];
    return [{ title: title || undefined, url: /^https:\/\//i.test(url) ? url : undefined, publisher: publisher || undefined, year }];
  });
}
