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

export type MagazineListingRecord = Pick<
  MagazineRecord,
  'id' | 'slug' | 'title' | 'excerpt' | 'canonical_url' | 'published_at' | 'updated_at' | 'schema_json'
>;

export type ResearchCatalogRecord = {
  id: string;
  openalex_id: string;
  doi: string | null;
  source_url: string;
  title: string;
  publication_date: string;
  publication_year: number;
  work_type: 'article' | 'dissertation';
  evidence_kind_ar: string;
  language: string | null;
  authors: string[];
  journal_title: string | null;
  publisher: string | null;
  cited_by_count: number;
  is_open_access: boolean;
  oa_status: string | null;
  primary_topic: string | null;
  rawafid_cluster: string;
  rawafid_cluster_ar: string;
  catalog_rank: number;
  source_api: string;
  last_synced_at: string;
};

export type MagazinePageResult = {
  items: MagazineListingRecord[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ResearchCatalogPageResult = {
  items: ResearchCatalogRecord[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ResearchCatalogStats = {
  total: number;
  articles: number;
  dissertations: number;
  openAccess: number;
  withDoi: number;
  last30Days: number;
  last90Days: number;
  newestDate: string | null;
  oldestDate: string | null;
  lastSyncedAt: string | null;
  clusters: Array<{ key: string; label: string; count: number }>;
};

const FIELDS = 'id,slug,title,excerpt,body_json,body_text,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer,schema_json';
const LISTING_FIELDS = 'id,slug,title,excerpt,canonical_url,published_at,updated_at,schema_json';
const RESEARCH_CATALOG_FIELDS = 'id,openalex_id,doi,source_url,title,publication_date,publication_year,work_type,evidence_kind_ar,language,authors,journal_title,publisher,cited_by_count,is_open_access,oa_status,primary_topic,rawafid_cluster,rawafid_cluster_ar,catalog_rank,source_api,last_synced_at';
const MAGAZINE_CANONICAL_FILTER = 'canonical_url.like./magazine/%,canonical_url.like.https://healthrenewal.org/magazine/%';

function isPublishedNow(value: string | null) {
  return !value || new Date(value).getTime() <= Date.now();
}

function safePage(value: number | undefined) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(Math.trunc(value || 1), 10000));
}

function safePageSize(value: number | undefined, fallback: number, max: number) {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(1, Math.min(Math.trunc(value || fallback), max));
}

function safeSearch(value: string | undefined) {
  return value?.trim().replace(/\s+/g, ' ').slice(0, 140) || '';
}

async function retryRead<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 120));
    }
  }
  throw lastError;
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

export async function getMagazineItems(): Promise<MagazineListingRecord[]> {
  const result = await retryRead(async () => {
    const supabase = await createClient();
    const response = await supabase
      .from('content')
      .select(LISTING_FIELDS)
      .eq('content_type', 'research')
      .eq('status', 'published')
      .or(MAGAZINE_CANONICAL_FILTER)
      .order('published_at', { ascending: false })
      .limit(1000);
    if (response.error) throw response.error;
    return response;
  });
  return ((result.data ?? []) as unknown as MagazineListingRecord[]).filter((item) => isPublishedNow(item.published_at));
}

export async function getMagazinePage(options: {
  page?: number;
  pageSize?: number;
  q?: string;
  kind?: string;
} = {}): Promise<MagazinePageResult> {
  const page = safePage(options.page);
  const pageSize = safePageSize(options.pageSize, 18, 48);
  const q = safeSearch(options.q);
  const kind = options.kind?.trim().slice(0, 80) || '';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await retryRead(async () => {
    const supabase = await createClient();
    let query = supabase
      .from('content')
      .select(LISTING_FIELDS, { count: 'exact' })
      .eq('content_type', 'research')
      .eq('status', 'published')
      .or(MAGAZINE_CANONICAL_FILTER);

    if (q) query = query.ilike('title', `%${q}%`);
    if (kind) query = query.contains('schema_json', { evidence_kind: kind });

    const response = await query
      .order('published_at', { ascending: false })
      .range(from, to);
    if (response.error) throw response.error;
    return response;
  });

  const items = ((data ?? []) as unknown as MagazineListingRecord[]).filter((item) => isPublishedNow(item.published_at));
  const total = count ?? items.length;
  return { items, count: total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getMagazineOverview() {
  const { data, count } = await retryRead(async () => {
    const supabase = await createClient();
    const response = await supabase
      .from('content')
      .select('schema_json', { count: 'exact' })
      .eq('content_type', 'research')
      .eq('status', 'published')
      .or(MAGAZINE_CANONICAL_FILTER)
      .limit(1000);
    if (response.error) throw response.error;
    return response;
  });

  const kinds = Array.from(new Set(((data ?? []) as Array<{ schema_json: Record<string, unknown> | null }>).map((item) => {
    const value = item.schema_json?.evidence_kind;
    return typeof value === 'string' && value.trim() ? value.trim() : 'دراسة بحثية';
  }))).sort((a, b) => a.localeCompare(b, 'ar'));

  return { count: count ?? 0, kinds };
}

export async function getResearchCatalogPage(options: {
  page?: number;
  pageSize?: number;
  q?: string;
  cluster?: string;
  workType?: string;
} = {}): Promise<ResearchCatalogPageResult> {
  const page = safePage(options.page);
  const pageSize = safePageSize(options.pageSize, 24, 48);
  const q = safeSearch(options.q);
  const cluster = options.cluster?.trim().slice(0, 80) || '';
  const workType = options.workType === 'article' || options.workType === 'dissertation' ? options.workType : '';
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count } = await retryRead(async () => {
    const supabase = await createClient();
    let query = supabase
      .from('research_catalog')
      .select(RESEARCH_CATALOG_FIELDS, { count: 'exact' })
      .eq('is_active', true);

    if (q) query = query.ilike('title', `%${q}%`);
    if (cluster) query = query.eq('rawafid_cluster', cluster);
    if (workType) query = query.eq('work_type', workType);

    const response = await query
      .order('catalog_rank', { ascending: true })
      .range(from, to);
    if (response.error) throw response.error;
    return response;
  });

  const items = (data ?? []) as unknown as ResearchCatalogRecord[];
  const total = count ?? items.length;
  return { items, count: total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getResearchCatalogStats(): Promise<ResearchCatalogStats> {
  const { data } = await retryRead(async () => {
    const supabase = await createClient();
    const response = await supabase.rpc('get_research_catalog_stats');
    if (response.error) throw response.error;
    return response;
  });

  const raw = (data ?? {}) as Record<string, unknown>;
  const clusters = Array.isArray(raw.clusters)
    ? raw.clusters.map((item) => {
        const value = (item ?? {}) as Record<string, unknown>;
        return {
          key: String(value.key ?? ''),
          label: String(value.label ?? ''),
          count: Number(value.count ?? 0),
        };
      }).filter((item) => item.key && item.label)
    : [];

  return {
    total: Number(raw.total ?? 0),
    articles: Number(raw.articles ?? 0),
    dissertations: Number(raw.dissertations ?? 0),
    openAccess: Number(raw.openAccess ?? 0),
    withDoi: Number(raw.withDoi ?? 0),
    last30Days: Number(raw.last30Days ?? 0),
    last90Days: Number(raw.last90Days ?? 0),
    newestDate: typeof raw.newestDate === 'string' ? raw.newestDate : null,
    oldestDate: typeof raw.oldestDate === 'string' ? raw.oldestDate : null,
    lastSyncedAt: typeof raw.lastSyncedAt === 'string' ? raw.lastSyncedAt : null,
    clusters,
  };
}

export async function getMagazineRecord(routeSlug: string): Promise<MagazineRecord | null> {
  const safeSlug = decodeURIComponent(routeSlug).replace(/^\/+/, '');
  if (!safeSlug || safeSlug.includes('/') || !safeSlug.endsWith('.html')) return null;
  const relativeCanonical = `/magazine/${safeSlug}`;
  const absoluteCanonical = `https://healthrenewal.org${relativeCanonical}`;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .in('canonical_url', [relativeCanonical, absoluteCanonical])
    .limit(2);
  if (error) throw error;
  const rows = (data ?? []) as unknown as MagazineRecord[];
  const record = rows.find((item) => item.canonical_url === relativeCanonical) ?? rows[0] ?? null;
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

export async function getRelatedMagazine(record: MagazineRecord, limit = 4): Promise<MagazineListingRecord[]> {
  const boundedLimit = Math.max(1, Math.min(limit, 12));
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(LISTING_FIELDS)
    .eq('content_type', 'research')
    .eq('status', 'published')
    .or(MAGAZINE_CANONICAL_FILTER)
    .neq('id', record.id)
    .order('published_at', { ascending: false })
    .limit(Math.max(24, boundedLimit * 8));
  if (error) throw error;

  const kind = evidenceKind(record);
  return ((data ?? []) as unknown as MagazineListingRecord[])
    .filter((item) => isPublishedNow(item.published_at))
    .sort((a, b) => Number(evidenceKind(b) === kind) - Number(evidenceKind(a) === kind))
    .slice(0, boundedLimit);
}
