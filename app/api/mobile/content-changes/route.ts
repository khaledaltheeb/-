import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { publicContentHref } from '@/lib/public-content-routing';

export const dynamic = 'force-dynamic';

function parseSince(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('since');
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function parseLimit(request: NextRequest) {
  const value = Number.parseInt(request.nextUrl.searchParams.get('limit') ?? '100', 10);
  if (!Number.isFinite(value)) return 100;
  return Math.max(1, Math.min(value, 250));
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const since = parseSince(request);
  const limit = parseLimit(request);

  let query = supabase
    .from('mobile_content_changes')
    .select('id,content_id,event_type,changed_fields,changed_at,content_updated_at')
    .order('changed_at', { ascending: false })
    .limit(limit);

  if (since) query = query.gt('changed_at', since);

  const changeResult = await query;
  if (changeResult.error) {
    return NextResponse.json(
      { ok: false, error: 'content_changes_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const changes = changeResult.data ?? [];
  const contentIds = [...new Set(changes.map((change) => change.content_id))];
  if (contentIds.length === 0) {
    return NextResponse.json(
      { ok: true, generatedAt: new Date().toISOString(), changes: [] },
      { headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60', 'X-Content-Type-Options': 'nosniff' } },
    );
  }

  const [contentResult, sectorResult, categoryResult] = await Promise.all([
    supabase
      .from('content')
      .select('id,slug,title,excerpt,content_type,canonical_url,sector_id,category_id,published_at,updated_at,last_reviewed_at')
      .in('id', contentIds)
      .eq('status', 'published')
      .eq('robots_index', true),
    supabase
      .from('sectors')
      .select('id,slug,name_ar')
      .eq('is_active', true)
      .eq('visibility', 'public'),
    supabase
      .from('categories')
      .select('id,slug,name_ar,sector_id')
      .eq('is_active', true)
      .eq('visibility', 'public'),
  ]);

  if (contentResult.error || sectorResult.error || categoryResult.error) {
    return NextResponse.json(
      { ok: false, error: 'content_change_catalog_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const contentById = new Map((contentResult.data ?? []).map((item) => [item.id, item]));
  const sectorById = new Map((sectorResult.data ?? []).map((item) => [item.id, item]));
  const categoryById = new Map((categoryResult.data ?? []).map((item) => [item.id, item]));

  const output = changes.flatMap((change) => {
    const item = contentById.get(change.content_id);
    if (!item) return [];

    const sector = item.sector_id ? sectorById.get(item.sector_id) : null;
    const category = item.category_id ? categoryById.get(item.category_id) : null;
    const followPaths: string[] = [];
    if (sector?.slug) followPaths.push(`/sectors/${sector.slug}`);
    if (category?.slug) followPaths.push(`/sections/${category.slug}`);
    if (item.content_type === 'guide') followPaths.push('/care-guides/');
    if (item.content_type === 'research') followPaths.push('/evidence-guides/');
    if (item.canonical_url?.startsWith('/encyclopedia/')) followPaths.push('/encyclopedia/');
    if (item.canonical_url?.startsWith('/daily-tools/')) followPaths.push('/daily-tools/');
    if (item.canonical_url?.startsWith('/cognitive-lab')) followPaths.push('/cognitive-lab');

    return [{
      id: change.id,
      eventType: change.event_type,
      changedFields: change.changed_fields ?? [],
      changedAt: change.changed_at,
      contentUpdatedAt: change.content_updated_at,
      content: {
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        contentType: item.content_type,
        path: publicContentHref(item),
        publishedAt: item.published_at,
        updatedAt: item.updated_at,
        lastReviewedAt: item.last_reviewed_at,
        sector: sector ? { slug: sector.slug, name: sector.name_ar } : null,
        category: category ? { slug: category.slug, name: category.name_ar } : null,
        followPaths: [...new Set(followPaths)],
      },
    }];
  });

  return NextResponse.json(
    { ok: true, generatedAt: new Date().toISOString(), since, changes: output },
    {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
