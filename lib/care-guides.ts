import { createClient } from '@/lib/supabase/server';

type JsonRecord = Record<string, unknown>;

export type CareGuideReference = {
  title?: string;
  url?: string;
  publisher?: string;
  year?: string | number;
};

export type CareGuideFaq = { question: string; answer: string };

export type CareGuideDisclaimer = { url: string; label: string };

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

export type CareGuideRelatedItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  contentType: string;
  href: string;
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

const CARE_GUIDE_DETAIL_FIELDS = 'id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json';
const WAVE_004_BATCH_ID = 'care-guides-rich-wave-004';

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function asStringArray(value: unknown, limit = 50) {
  return Array.isArray(value) ? value.slice(0, limit).map((item) => asString(item)).filter(Boolean) : [];
}

function isTrue(value: unknown) {
  return value === true || value === 'true';
}

function usefulArabicWordCount(value: string | null) {
  return (value ?? '').split(/\s+/).filter((token) => /[ء-ي]/.test(token)).length;
}

function arrayLength(value: unknown) {
  return Array.isArray(value) ? value.length : 0;
}

function normalizePathSegments(segments: string[]) {
  return segments
    .map((segment) => segment.trim().toLowerCase())
    .filter((segment) => /^[a-z0-9][a-z0-9-]*$/.test(segment));
}

/**
 * Runtime counterpart to the database Wave 004 release guard.
 *
 * Wave 004 has an explicit quality hold: database drift must never make an
 * unreleased YMYL-adjacent guide indexable. Pages remain directly accessible
 * and followable, but indexability is granted only after the recorded release
 * evidence required by the repository policy is present.
 */
export function careGuideCanIndex(record: Pick<CareGuideRecord,
  'robots_index' | 'schema_json' | 'body_text' | 'references_json' |
  'author_display_name' | 'reviewer_display_name' | 'reviewer_credentials' | 'last_reviewed_at'
>) {
  if (!record.robots_index) return false;

  const schema = asRecord(record.schema_json);
  if (asString(schema?.batch_id) !== WAVE_004_BATCH_ID) return true;
  if (!isTrue(schema?.publication_ready)) return false;

  const reviewer = asString(record.reviewer_display_name);
  const credentials = asString(record.reviewer_credentials);
  const author = asString(record.author_display_name);
  const reviewedAt = record.last_reviewed_at ? new Date(record.last_reviewed_at) : null;
  if (!reviewer || !credentials || !reviewedAt || Number.isNaN(reviewedAt.getTime()) || reviewedAt.getTime() > Date.now()) return false;
  if (author && author.localeCompare(reviewer, undefined, { sensitivity: 'accent' }) === 0) return false;
  if (usefulArabicWordCount(record.body_text) < 3000) return false;
  if (arrayLength(record.references_json) < 5) return false;
  if (arrayLength(schema?.claim_source_map) < 5) return false;

  return true;
}

function relatedItemFromRow(row: JsonRecord): CareGuideRelatedItem | null {
  const id = asString(row.id);
  const slug = asString(row.slug);
  const title = asString(row.title);
  const canonical = asString(row.canonical_url);
  if (!id || !slug || !title) return null;
  return {
    id,
    slug,
    title,
    excerpt: typeof row.excerpt === 'string' ? row.excerpt : null,
    contentType: asString(row.content_type),
    href: canonical || `/content/${slug}`,
  };
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

export function careGuideDisclaimer(value: unknown): CareGuideDisclaimer | null {
  const row = asRecord(value);
  const url = asString(row?.disclaimer_url);
  const label = asString(row?.disclaimer_label);
  if (!/^\/[a-z0-9][a-z0-9\/-]*$/i.test(url) || !label) return null;
  return { url, label };
}

export async function getCareGuidesHubRecord(): Promise<CareGuideRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(CARE_GUIDE_DETAIL_FIELDS)
    .eq('slug', 'care-guides-hub')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return (data as CareGuideRecord | null) ?? null;
}

export async function getCareGuideRecord(segments: string[]): Promise<CareGuideRecord | null> {
  const canonical = careGuideCanonical(segments);
  if (!canonical) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(CARE_GUIDE_DETAIL_FIELDS)
    .eq('canonical_url', canonical)
    .eq('content_type', 'guide')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return (data as CareGuideRecord | null) ?? null;
}

export async function getCareGuideItems(): Promise<CareGuideItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,canonical_url,audience,updated_at,schema_json')
    .eq('content_type', 'guide')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .like('canonical_url', '/care-guides/%')
    .order('updated_at', { ascending: false })
    .limit(500);

  if (error) throw error;
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

export async function getRelatedCareGuideContent(contentId: string): Promise<CareGuideRelatedItem[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: targetData, error: targetError } = await supabase
    .from('content')
    .select('schema_json')
    .eq('id', contentId)
    .maybeSingle();

  if (targetError) {
    console.error('Care guide editorial-link lookup failed; falling back to semantic recommendations.', {
      contentId,
      code: targetError.code,
      message: targetError.message,
    });
  }

  const targetSchema = asRecord(targetData?.schema_json);
  const editorialPaths = asStringArray(targetSchema?.internal_link_plan, 12)
    .filter((path) => /^\/(care-guides|content)\/[a-z0-9][a-z0-9\/-]*\/?$/.test(path));

  let editorialItems: CareGuideRelatedItem[] = [];
  if (editorialPaths.length) {
    const { data: editorialData, error: editorialError } = await supabase
      .from('content')
      .select('id,slug,title,excerpt,content_type,canonical_url')
      .in('canonical_url', editorialPaths)
      .neq('id', contentId)
      .eq('status', 'published')
      .eq('robots_index', true)
      .lte('published_at', now);

    if (editorialError) {
      console.error('Care guide planned internal links could not be loaded; falling back to semantic recommendations.', {
        contentId,
        code: editorialError.code,
        message: editorialError.message,
      });
    } else {
      const rows = Array.isArray(editorialData) ? editorialData : [];
      const byCanonical = new Map(rows.map((row) => [asString(row.canonical_url), row as JsonRecord]));
      editorialItems = editorialPaths.flatMap((path) => {
        const item = relatedItemFromRow(byCanonical.get(path) ?? {});
        return item ? [item] : [];
      });
    }
  }

  const { data: relatedData, error: relatedError } = await supabase.rpc('related_public_content', { p_content_id: contentId, p_limit: 10 });
  if (relatedError) {
    console.error('Care guide related-content RPC failed; rendering editorial links only.', {
      contentId,
      code: relatedError.code,
      message: relatedError.message,
    });
    return editorialItems.slice(0, 6);
  }

  const relatedRows = Array.isArray(relatedData) ? relatedData : [];
  const orderedIds = relatedRows.map((row) => asString(asRecord(row)?.id)).filter(Boolean);
  if (!orderedIds.length) return editorialItems.slice(0, 6);

  const { data, error } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,content_type,canonical_url')
    .in('id', orderedIds)
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', now);

  if (error) {
    console.error('Care guide related-content lookup failed; rendering editorial links only.', {
      contentId,
      code: error.code,
      message: error.message,
    });
    return editorialItems.slice(0, 6);
  }

  const rows = Array.isArray(data) ? data : [];
  const byId = new Map(rows.map((row) => [asString(row.id), row as JsonRecord]));
  const fallbackItems = orderedIds.flatMap((id) => {
    const item = relatedItemFromRow(byId.get(id) ?? {});
    return item ? [item] : [];
  });

  const seen = new Set(editorialItems.map((item) => item.id));
  return [...editorialItems, ...fallbackItems.filter((item) => !seen.has(item.id))].slice(0, 6);
}
