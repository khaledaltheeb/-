import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const DB_BATCH_SIZE = 1000;

type JsonRecord = Record<string, unknown>;

type QuickInfoSitemapRecord = {
  id: string;
  slug: string;
  canonical_url: string | null;
  updated_at: string | null;
  schema_json: JsonRecord | null;
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function publicationApproved(schema: unknown): boolean {
  const record = asRecord(schema);
  return Boolean(
    record
    && asString(record.page_role) === 'quick-info'
    && record.publication_ready === true
    && record.editorial_review_required === false,
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get('page') ?? '0');
  const page = Number.isInteger(raw) && raw >= 0 && raw < 10000 ? raw : 0;
  const supabase = await createClient();
  const now = new Date().toISOString();
  const pageStart = page * PAGE_SIZE;
  const pageEndExclusive = pageStart + PAGE_SIZE;
  const data: QuickInfoSitemapRecord[] = [];

  // Keep page boundaries stable while titles/content are edited. updated_at is used for
  // <lastmod>; it must never decide which sitemap page a canonical URL belongs to.
  for (let batchStart = pageStart; batchStart < pageEndExclusive; batchStart += DB_BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + DB_BATCH_SIZE - 1, pageEndExclusive - 1);
    const requestedRows = batchEnd - batchStart + 1;
    const { data: batch, error } = await supabase
      .from('content')
      .select('id,slug,canonical_url,updated_at,schema_json')
      .like('slug', 'quick-info-%')
      .eq('status', 'published')
      .eq('robots_index', true)
      .lte('published_at', now)
      .order('id', { ascending: true })
      .range(batchStart, batchEnd);

    if (error) {
      throw new Error(`quick-info sitemap query failed at rows ${batchStart}-${batchEnd}: ${error.message}`);
    }
    if (!Array.isArray(batch)) {
      throw new Error('quick-info sitemap query returned no data array');
    }

    data.push(...(batch as QuickInfoSitemapRecord[]));
    if (batch.length < requestedRows) break;
  }

  const items = data.flatMap((row) => {
    if (!publicationApproved(row.schema_json)) return [];
    const contentSlug = asString(row.slug);
    const routeSlug = contentSlug.startsWith('quick-info-') ? contentSlug.slice('quick-info-'.length) : contentSlug;
    if (!routeSlug || !/^[a-z0-9][a-z0-9-]*$/.test(routeSlug)) return [];
    const canonicalUrl = asString(row.canonical_url) || `/quick-info/${routeSlug}/`;
    if (canonicalUrl !== `/quick-info/${routeSlug}/`) return [];
    return [{ canonicalUrl, updatedAt: typeof row.updated_at === 'string' ? row.updated_at : null }];
  });

  const hub = page === 0
    ? [{
        path: '/quick-info/',
        lastModified: items.reduce<string | null>((latest, item) => {
          if (!item.updatedAt) return latest;
          return !latest || item.updatedAt > latest ? item.updatedAt : latest;
        }, null),
        changeFrequency: 'weekly' as const,
        priority: .82,
      }]
    : [];

  return sitemapResponse([
    ...hub,
    ...items.map((item) => ({
      path: item.canonicalUrl,
      lastModified: item.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: .74,
    })),
  ]);
}
