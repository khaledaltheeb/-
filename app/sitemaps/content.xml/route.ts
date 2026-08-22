import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';
import { getCognitivePageIndex } from '@/lib/cognitive-program';

export const dynamic = 'force-dynamic';
const PAGE_SIZE=50000;
const RELEASE = '2026-08-14T00:00:00.000Z';

type SitemapRow = {
  path: string;
  lastModified: string | null;
  changeFrequency: string;
  priority: number;
};

type JsonRecord = Record<string, unknown>;

type ContentSitemapRecord = {
  slug: string;
  updated_at: string | null;
  canonical_url: string | null;
  schema_json: JsonRecord | null;
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function sitemapEligible(item: ContentSitemapRecord) {
  const schema = asRecord(item.schema_json);
  if (!schema || !('legacy_migration' in schema)) return true;

  const legacy = asRecord(schema.legacy_migration);
  const originality = asRecord(schema.originality_report);
  return Boolean(
    legacy
    && asNumber(schema.migration_release_contract_version) >= 1
    && schema.publication_ready === true
    && schema.editorial_review_required === false
    && schema.migration_route_verified === true
    && schema.taxonomy_reviewed === true
    && asNumber(schema.classification_confidence) >= .9
    && originality?.passed === true
    && typeof item.canonical_url === 'string'
    && item.canonical_url.startsWith('/'),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get('page') ?? '0');
  const page = Number.isInteger(raw) && raw >= 0 && raw < 10000 ? raw : 0;
  const supabase = await createClient();
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('content')
    .select('slug,updated_at,canonical_url,schema_json')
    .eq('status', 'published')
    .neq('content_type', 'condition')
    .not('slug', 'like', 'quick-info-%')
    .lte('published_at', new Date().toISOString())
    .eq('robots_index', true)
    .order('updated_at', { ascending: false })
    .range(start,end);

  if (error) {
    throw new Error(`content sitemap query failed: ${error.message}`);
  }
  if (!Array.isArray(data)) {
    throw new Error('content sitemap query returned no data array');
  }

  const databaseRows: SitemapRow[] = (data as ContentSitemapRecord[])
    .filter(sitemapEligible)
    .map((item) => ({
      path: item.canonical_url || `/content/${item.slug}`,
      lastModified: item.updated_at,
      changeFrequency: 'monthly',
      priority: .7,
    }));

  const generatedRows: SitemapRow[] = page === 0
    ? getCognitivePageIndex().map((item) => ({
      path: `/content/${item.slug}`,
      lastModified: RELEASE,
      changeFrequency: 'monthly',
      priority: .72,
    }))
    : [];

  const unique = new Map<string, SitemapRow>();
  for (const item of [...databaseRows, ...generatedRows]) {
    if (!unique.has(item.path)) unique.set(item.path, item);
  }

  return sitemapResponse([...unique.values()]);
}
