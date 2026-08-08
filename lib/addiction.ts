import { createClient } from '@/lib/supabase/server';

type JsonRecord = Record<string, unknown>;

export type AddictionReference = { title?: string; url?: string; publisher?: string; year?: string | number };
export type AddictionFaq = { question: string; answer: string };
export type AddictionItem = { rank: number; slug: string; title: string; titleEn: string; category: string; href: string };
export type AddictionRecord = {
  id: string; slug: string; title: string; excerpt: string | null; body_json: unknown; body_text: string | null;
  content_type: string; audience: string[] | null; seo_title: string | null; seo_description: string | null;
  canonical_url: string | null; robots_index: boolean; robots_follow: boolean; published_at: string | null;
  updated_at: string | null; featured_image_url: string | null; featured_image_alt: string | null;
  primary_keyword: string | null; secondary_keywords: string[] | null; semantic_terms: string[] | null;
  author_display_name: string | null; reviewer_display_name: string | null; reviewer_credentials: string | null;
  last_reviewed_at: string | null; references_json: unknown; medical_disclaimer: string | null; schema_json: unknown;
};

function asRecord(value: unknown): JsonRecord | null { return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null; }
function asString(value: unknown) { return typeof value === 'string' ? value.trim() : ''; }

export function addictionContentSlug(segments: string[] = []) {
  if (!segments.length) return 'addiction-hub';
  return `addiction-${segments.join('-')}`;
}

export async function getAddictionRecord(segments: string[] = []): Promise<AddictionRecord | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('content')
    .select('id,slug,title,excerpt,body_json,body_text,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json')
    .eq('slug', addictionContentSlug(segments)).eq('status', 'published').lte('published_at', new Date().toISOString()).maybeSingle();
  return (data as AddictionRecord | null) ?? null;
}

export async function getMigratedAddictionCondition(legacySlug: string): Promise<Pick<AddictionRecord, 'slug' | 'canonical_url'> | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('content')
    .select('slug,canonical_url,schema_json')
    .eq('slug', legacySlug).eq('content_type', 'condition').eq('status', 'published')
    .lte('published_at', new Date().toISOString()).maybeSingle();
  const schema = asRecord(data?.schema_json);
  if (!data || asString(schema?.page_role) !== 'addiction-condition') return null;
  return { slug: asString(data.slug), canonical_url: asString(data.canonical_url) || `/content/${asString(data.slug)}` };
}

export async function getAddictionItems(): Promise<AddictionItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('content')
    .select('slug,title,canonical_url,schema_json,published_at')
    .eq('content_type', 'condition').eq('status', 'published').lte('published_at', new Date().toISOString())
    .contains('schema_json', { page_role: 'addiction-condition' }).limit(100);
  const rows = Array.isArray(data) ? data : [];
  return rows.flatMap((row, index) => {
    const schema = asRecord(row.schema_json);
    const rankRaw = Number(schema?.addiction_rank ?? schema?.legacy_rank ?? index + 1);
    const rank = Number.isInteger(rankRaw) && rankRaw > 0 ? rankRaw : index + 1;
    const slug = asString(row.slug);
    if (!slug) return [];
    return [{
      rank,
      slug,
      title: asString(row.title),
      titleEn: asString(schema?.title_en),
      category: asString(schema?.addiction_category) || 'اضطرابات الإدمان والتعافي',
      href: asString(row.canonical_url) || `/content/${slug}`,
    }];
  }).sort((a, b) => a.rank - b.rank || a.title.localeCompare(b.title, 'ar'));
}

export function addictionPageRole(value: unknown) { return asString(asRecord(value)?.page_role); }

export function safeAddictionReferences(value: unknown): AddictionReference[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 150).flatMap((item) => {
    const row = asRecord(item); if (!row) return [];
    const url = asString(row.url); const title = asString(row.title); const publisher = asString(row.publisher);
    const year = typeof row.year === 'string' || typeof row.year === 'number' ? row.year : undefined;
    if (!title && !/^https:\/\//i.test(url)) return [];
    return [{ title: title || undefined, url: /^https:\/\//i.test(url) ? url : undefined, publisher: publisher || undefined, year }];
  });
}

export function visibleAddictionFaq(value: unknown): AddictionFaq[] {
  const root = asRecord(value); const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  return blocks.flatMap((block) => {
    const row = asRecord(block); if (!row || row.type !== 'faq' || !Array.isArray(row.items)) return [];
    return row.items.flatMap((item) => {
      const faq = asRecord(item); const question = asString(faq?.question).slice(0, 500); const answer = asString(faq?.answer).slice(0, 6000);
      return question.length >= 3 && answer.length >= 3 ? [{ question, answer }] : [];
    });
  }).slice(0, 40);
}
