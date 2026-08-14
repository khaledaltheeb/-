import { createClient } from '@/lib/supabase/server';

type JsonRecord = Record<string, unknown>;

export const ENCYCLOPEDIA_INDEX_PAGE_SIZE = 100;

export type EncyclopediaReference = {
  title?: string;
  url?: string;
  publisher?: string;
  year?: string | number;
};

export type EncyclopediaFaq = { question: string; answer: string };

export type EncyclopediaItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  canonicalUrl: string;
  primaryKeyword: string | null;
  updatedAt: string | null;
};

export type EncyclopediaPage = {
  items: EncyclopediaItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type EncyclopediaRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  schema_json: unknown;
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
  search_intent: string | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: unknown;
  medical_disclaimer: string | null;
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeItem(row: Record<string, unknown>): EncyclopediaItem | null {
  const slug = asString(row.slug);
  const canonicalUrl = encyclopediaCanonical(slug);
  if (!canonicalUrl) return null;
  return {
    id: String(row.id),
    slug,
    title: asString(row.title),
    excerpt: typeof row.excerpt === 'string' ? row.excerpt : null,
    canonicalUrl,
    primaryKeyword: typeof row.primary_keyword === 'string' ? row.primary_keyword : null,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null,
  };
}

export function encyclopediaCanonical(slug: string) {
  const safe = slug.trim().toLowerCase();
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safe) ? `/encyclopedia/${safe}/` : null;
}

export async function getEncyclopediaCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('content')
    .select('id', { count: 'exact', head: true })
    .eq('content_type', 'condition')
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString());
  return Math.max(0, count ?? 0);
}

export async function getEncyclopediaItems(limit = 60): Promise<EncyclopediaItem[]> {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 200);
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,canonical_url,primary_keyword,updated_at')
    .eq('content_type', 'condition')
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .order('title', { ascending: true })
    .limit(safeLimit);

  return (Array.isArray(data) ? data : []).flatMap((row) => {
    const item = normalizeItem(row as Record<string, unknown>);
    return item ? [item] : [];
  });
}

export async function getEncyclopediaIndexPage(rawPage: number, pageSize = ENCYCLOPEDIA_INDEX_PAGE_SIZE): Promise<EncyclopediaPage> {
  const safePageSize = Math.min(Math.max(Math.trunc(pageSize), 20), 200);
  const total = await getEncyclopediaCount();
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const page = Math.min(Math.max(Math.trunc(rawPage) || 1, 1), totalPages);
  const start = (page - 1) * safePageSize;
  const end = start + safePageSize - 1;
  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,canonical_url,primary_keyword,updated_at')
    .eq('content_type', 'condition')
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .order('title', { ascending: true })
    .range(start, end);

  const items = (Array.isArray(data) ? data : []).flatMap((row) => {
    const item = normalizeItem(row as Record<string, unknown>);
    return item ? [item] : [];
  });

  return { items, page, pageSize: safePageSize, total, totalPages };
}

export async function getEncyclopediaRecord(slug: string): Promise<EncyclopediaRecord | null> {
  const canonical = encyclopediaCanonical(slug);
  if (!canonical) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_json,body_text,schema_json,content_type,audience,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,featured_image_url,featured_image_alt,primary_keyword,secondary_keywords,semantic_terms,search_intent,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer')
    .eq('slug', slug)
    .eq('content_type', 'condition')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  return (data as EncyclopediaRecord | null) ?? null;
}

export function safeEncyclopediaReferences(value: unknown): EncyclopediaReference[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((item) => {
    const row = asRecord(item);
    if (!row) return [];
    const title = asString(row.title).slice(0, 500);
    const url = asString(row.url);
    const publisher = asString(row.publisher).slice(0, 300);
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

export function visibleEncyclopediaFaq(value: unknown): EncyclopediaFaq[] {
  const root = asRecord(value);
  const blocks = Array.isArray(root?.blocks) ? root.blocks : [];
  return blocks.flatMap((block) => {
    const row = asRecord(block);
    if (!row || row.type !== 'faq' || !Array.isArray(row.items)) return [];
    return row.items.flatMap((item) => {
      const faq = asRecord(item);
      const question = asString(faq?.question).slice(0, 500);
      const answer = asString(faq?.answer).slice(0, 6000);
      return question.length >= 3 && answer.length >= 3 ? [{ question, answer }] : [];
    });
  }).slice(0, 40);
}
