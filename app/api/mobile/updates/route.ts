import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { publicContentHref } from '@/lib/public-content-routing';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [sectorResult, categoryResult, contentResult] = await Promise.all([
    supabase
      .from('sectors')
      .select('id,slug,name_ar')
      .eq('is_active', true)
      .eq('visibility', 'public')
      .limit(500),
    supabase
      .from('categories')
      .select('id,slug,name_ar,sector_id')
      .eq('is_active', true)
      .eq('visibility', 'public')
      .limit(50000),
    supabase
      .from('content')
      .select('id,slug,title,excerpt,content_type,canonical_url,sector_id,category_id,published_at,updated_at')
      .eq('status', 'published')
      .lte('published_at', now)
      .eq('robots_index', true)
      .order('published_at', { ascending: false })
      .limit(250),
  ]);

  if (sectorResult.error || categoryResult.error || contentResult.error) {
    return NextResponse.json(
      { ok: false, error: 'catalog_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const sectors = sectorResult.data ?? [];
  const categories = categoryResult.data ?? [];
  const content = contentResult.data ?? [];
  const contentIds = content.map((item) => item.id);

  const mappingResult = contentIds.length
    ? await supabase.from('content_categories').select('content_id,category_id').in('content_id', contentIds)
    : { data: [], error: null };

  if (mappingResult.error) {
    return NextResponse.json(
      { ok: false, error: 'taxonomy_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const sectorById = new Map(sectors.map((sector) => [sector.id, sector]));
  const categoryById = new Map(categories.map((category) => [category.id, category]));
  const mappedCategoryIds = new Map<string, string[]>();
  for (const mapping of mappingResult.data ?? []) {
    const list = mappedCategoryIds.get(mapping.content_id) ?? [];
    list.push(mapping.category_id);
    mappedCategoryIds.set(mapping.content_id, list);
  }

  const updates = content.map((item) => {
    const followPaths = new Set<string>();
    const sectorSlugs = new Set<string>();

    const addSector = (sectorId: string | null) => {
      if (!sectorId) return;
      const sector = sectorById.get(sectorId);
      if (!sector) return;
      followPaths.add(`/sectors/${sector.slug}`);
      sectorSlugs.add(sector.slug);
    };

    const addCategory = (categoryId: string | null) => {
      if (!categoryId) return;
      const category = categoryById.get(categoryId);
      if (!category) return;
      followPaths.add(`/sections/${category.slug}`);
      addSector(category.sector_id);
    };

    addSector(item.sector_id);
    addCategory(item.category_id);
    for (const categoryId of mappedCategoryIds.get(item.id) ?? []) addCategory(categoryId);

    if (item.content_type === 'guide') followPaths.add('/care-guides/');
    if (item.content_type === 'research') followPaths.add('/evidence-guides/');
    if (item.canonical_url?.startsWith('/encyclopedia/')) followPaths.add('/encyclopedia/');
    if (item.canonical_url?.startsWith('/daily-tools/')) followPaths.add('/daily-tools/');
    if (item.canonical_url?.startsWith('/cognitive-lab')) followPaths.add('/cognitive-lab');

    return {
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      content_type: item.content_type,
      path: publicContentHref(item),
      published_at: item.published_at,
      updated_at: item.updated_at,
      follow_paths: [...followPaths],
      sector_slugs: [...sectorSlugs],
    };
  });

  return NextResponse.json(
    { ok: true, generated_at: now, updates },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
