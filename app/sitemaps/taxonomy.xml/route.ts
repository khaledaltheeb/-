import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';
import { getCognitiveCategories } from '@/lib/cognitive-program';
import { getExpandedEncyclopediaCategories } from '@/lib/expanded-encyclopedia';

export const dynamic = 'force-dynamic';
const RELEASE = '2026-08-14T00:00:00.000Z';
const EXPANDED_RELEASE = '2026-08-22T19:30:00.000Z';

type SitemapRow = {
  path: string;
  lastModified: string | null;
  changeFrequency: string;
  priority: number;
};

export async function GET() {
  const supabase = await createClient();
  const [sectorResult, categoryResult] = await Promise.all([
    supabase
      .from('sectors')
      .select('slug,updated_at')
      .eq('is_active', true)
      .eq('visibility', 'public')
      .order('sort_order')
      .limit(20000),
    supabase
      .from('categories')
      .select('slug,updated_at')
      .eq('is_active', true)
      .eq('visibility', 'public')
      .order('sort_order')
      .limit(50000),
  ]);

  if (sectorResult.error) {
    throw new Error(`taxonomy sectors query failed: ${sectorResult.error.message}`);
  }
  if (categoryResult.error) {
    throw new Error(`taxonomy categories query failed: ${categoryResult.error.message}`);
  }

  const sectors = sectorResult.data ?? [];
  const categories = categoryResult.data ?? [];
  const rows: SitemapRow[] = [
    ...sectors.map((item) => ({
      path: `/sectors/${item.slug}`,
      lastModified: item.updated_at,
      changeFrequency: 'weekly',
      priority: .8,
    })),
    ...categories.map((item) => ({
      path: `/sections/${item.slug}`,
      lastModified: item.updated_at,
      changeFrequency: 'weekly',
      priority: .7,
    })),
    ...getExpandedEncyclopediaCategories().map((item) => ({
      path: `/sections/${item.slug}`,
      lastModified: EXPANDED_RELEASE,
      changeFrequency: 'weekly',
      priority: .74,
    })),
    ...getCognitiveCategories().map((item) => ({
      path: `/sections/${item.slug}`,
      lastModified: RELEASE,
      changeFrequency: 'weekly',
      priority: .72,
    })),
  ];

  const byPath = new Map<string, SitemapRow>();
  for (const item of rows) {
    if (!byPath.has(item.path)) byPath.set(item.path, item);
  }
  return sitemapResponse([...byPath.values()]);
}
