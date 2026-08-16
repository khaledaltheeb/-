import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';

type JsonRecord = Record<string, unknown>;

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

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select('slug,title,canonical_url,updated_at,schema_json')
    .like('slug', 'quick-info-%')
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .order('title', { ascending: true })
    .limit(500);

  if (error) {
    throw new Error(`quick-info sitemap query failed: ${error.message}`);
  }
  if (!Array.isArray(data)) {
    throw new Error('quick-info sitemap query returned no data array');
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

  if (items.length === 0) return sitemapResponse([]);

  return sitemapResponse([
    {
      path: '/quick-info/',
      lastModified: items.reduce<string | null>((latest, item) => {
        if (!item.updatedAt) return latest;
        return !latest || item.updatedAt > latest ? item.updatedAt : latest;
      }, null),
      changeFrequency: 'weekly',
      priority: .82,
    },
    ...items.map((item) => ({
      path: item.canonicalUrl,
      lastModified: item.updatedAt,
      changeFrequency: 'monthly',
      priority: .74,
    })),
  ]);
}
