import { createClient } from '@/lib/supabase/server';

export type MagazineReference = { title?: string; url?: string; publisher?: string; year?: string | number };
export type MagazineRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  published_at: string | null;
  updated_at: string;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  semantic_terms: string[] | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: MagazineReference[] | null;
  medical_disclaimer: string | null;
  schema_json: Record<string, unknown> | null;
};

const FIELDS = 'id,slug,title,excerpt,body_json,body_text,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json';

function isPublishedNow(value: string | null) {
  return !value || new Date(value).getTime() <= Date.now();
}

export function evidenceKind(item: Pick<MagazineRecord, 'schema_json'>) {
  const value = item.schema_json?.evidence_kind;
  return typeof value === 'string' && value.trim() ? value.trim() : 'دراسة بحثية';
}

export function sourceUrl(item: Pick<MagazineRecord, 'references_json' | 'schema_json'>) {
  const ref = item.references_json?.find((entry) => typeof entry?.url === 'string' && /^https:\/\//i.test(entry.url));
  if (ref?.url) return ref.url;
  const value = item.schema_json?.source_url;
  return typeof value === 'string' && /^https:\/\//i.test(value) ? value : null;
}

export async function getMagazineItems(): Promise<MagazineRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .like('canonical_url', '/magazine/%')
    .order('published_at', { ascending: false })
    .limit(500);
  if (error) throw error;
  return ((data ?? []) as unknown as MagazineRecord[]).filter((item) => isPublishedNow(item.published_at));
}

export async function getMagazineRecord(routeSlug: string): Promise<MagazineRecord | null> {
  const safeSlug = decodeURIComponent(routeSlug).replace(/^\/+/, '');
  if (!safeSlug || safeSlug.includes('/') || !safeSlug.endsWith('.html')) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .eq('canonical_url', `/magazine/${safeSlug}`)
    .maybeSingle();
  if (error) throw error;
  const record = data as unknown as MagazineRecord | null;
  return record && isPublishedNow(record.published_at) ? record : null;
}

export async function getPediatricOncologyEvidenceRecord(
  kind: 'studies' | 'theses',
  routeSlug: string,
): Promise<MagazineRecord | null> {
  const safeSlug = decodeURIComponent(routeSlug).trim().toLowerCase();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safeSlug)) return null;
  const canonical = `/magazine/pediatric-oncology/${kind}/${safeSlug}/`;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .eq('canonical_url', canonical)
    .maybeSingle();
  if (error) throw error;
  const record = data as unknown as MagazineRecord | null;
  return record && isPublishedNow(record.published_at) ? record : null;
}

export async function getRelatedMagazine(record: MagazineRecord, limit = 4): Promise<MagazineRecord[]> {
  const items = await getMagazineItems();
  const kind = evidenceKind(record);
  return items
    .filter((item) => item.id !== record.id)
    .sort((a, b) => Number(evidenceKind(b) === kind) - Number(evidenceKind(a) === kind))
    .slice(0, limit);
}
