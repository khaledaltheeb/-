import { createClient } from '@/lib/supabase/server';

type JsonRecord = Record<string, unknown>;

export type FamilyGuideReference = { title?: string; url?: string; publisher?: string; year?: string | number };
export type FamilyGuideFaq = { question: string; answer: string };
export type FamilyGuideItem = {
  rank: number;
  slug: string;
  title: string;
  titleEn: string;
  category: string;
  href: string;
};
export type FamilyGuideRecord = {
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
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}
function asString(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }

export function familyGuideContentSlug(segments: string[] = []) {
  if (!segments.length) return 'family-guide-hub';
  if (segments[0] === 'conditions' && segments[1]) return `family-guide-${segments[1]}`;
  if (segments[0] === 'tools' && segments[1]) return `family-guide-tool-${segments[1]}`;
  if (segments.length === 1) return `family-guide-${segments[0]}`;
  return `family-guide-${segments.join('-')}`;
}

export async function getFamilyGuideRecord(segments: string[] = []): Promise<FamilyGuideRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json')
    .eq('slug', familyGuideContentSlug(segments))
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  return (data as FamilyGuideRecord | null) ?? null;
}

export async function getFamilyGuideItems(): Promise<FamilyGuideItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('slug,title,canonical_url,schema_json,published_at')
    .like('slug', 'family-guide-%')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .limit(120);
  const rows = Array.isArray(data) ? data : [];
  return rows.flatMap((row) => {
    const schema = asRecord(row.schema_json);
    if (asString(schema?.page_role) !== 'family_condition') return [];
    const rank = Number(schema?.family_rank);
    if (!Number.isInteger(rank) || rank < 1 || rank > 100) return [];
    const slug = asString(row.slug).replace(/^family-guide-/, '');
    return [{
      rank,
      slug,
      title: asString(row.title),
      titleEn: asString(schema?.title_en),
      category: asString(schema?.family_category) || 'حالة نمائية أو صحية',
      href: asString(row.canonical_url) || `/family-guide/conditions/${slug}/`,
    }];
  }).sort((a, b) => a.rank - b.rank);
}

export function familyGuidePageRole(value: unknown) {
  const root = asRecord(value);
  return asString(root?.page_role);
}

export function safeFamilyGuideReferences(value: unknown): FamilyGuideReference[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 120).flatMap((item) => {
    const row = asRecord(item); if (!row) return [];
    const url = asString(row.url); const title = asString(row.title); const publisher = asString(row.publisher);
    const year = typeof row.year === 'string' || typeof row.year === 'number' ? row.year : undefined;
    if (!title && !/^https:\/\//i.test(url)) return [];
    return [{ title: title || undefined, url: /^https:\/\//i.test(url) ? url : undefined, publisher: publisher || undefined, year }];
  });
}

export function visibleFamilyGuideFaq(value: unknown): FamilyGuideFaq[] {
  const root = asRecord(value); const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  return blocks.flatMap((block) => {
    const row = asRecord(block); if (!row || row.type !== 'faq' || !Array.isArray(row.items)) return [];
    return row.items.flatMap((item) => {
      const faq = asRecord(item); const question = asString(faq?.question).slice(0, 500); const answer = asString(faq?.answer).slice(0, 6000);
      return question.length >= 3 && answer.length >= 3 ? [{ question, answer }] : [];
    });
  }).slice(0, 40);
}
