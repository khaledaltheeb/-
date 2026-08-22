import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';
import { getCognitivePageIndex } from '@/lib/cognitive-program';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const DB_BATCH_SIZE = 1000;
const RELEASE = '2026-08-14T00:00:00.000Z';

type SitemapRow = {
  path: string;
  lastModified: string | null;
  changeFrequency: string;
  priority: number;
};

type JsonRecord = Record<string, unknown>;

type ContentSitemapRecord = {
  id: string;
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
  const pageStart = page * PAGE_SIZE;
  const pageEndExclusive = pageStart + PAGE_SIZE;
  const now = new Date().toISOString();
  const data: ContentSitemapRecord[] = [];

  for (let batchStart = pageStart; batchStart < pageEndExclusive; batchStart += DB_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + DB_BATCH_SIZE - 1, pageEndExclusive - 1);
    const requestedRows = batchEnd - batchStart + 1;
    const { data: batch, error } = await supabase
      .from('content')
      .select('id,slug,updated_at,canonical_url,schema_json')
      .eq('status', 'published')
      .neq('content_type', 'condition')
      .not('slug', 'like', 'quick-info-%')
      .lte('published_at', now)
      .eq('robots_index', true)
      .order('updated_at', { ascending: false })
      .order('id', { ascending: false })
      .range(batchStart, batchEnd);

    if (error) {
      throw new Error(`content sitemap query failed at rows ${batchStart}-${batchEnd}: ${error.message}`);
    }
    if (!Array.isArray(batch)) {
      throw new Error('content sitemap query returned no data array');
    }

    data.push(...(batch as ContentSitemapRecord[]));
    if (batch.length < requestedRows) break;
  }

  const databaseRows: SitemapRow[] = data
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
