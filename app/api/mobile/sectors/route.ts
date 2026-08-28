import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sectors')
    .select('slug,name_ar,description,accent,sort_order,updated_at')
    .eq('is_active', true)
    .eq('visibility', 'public')
    .order('sort_order')
    .order('name_ar')
    .limit(500);

  if (error) {
    return NextResponse.json(
      { ok: false, sectors: [], error: 'sector_catalog_unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const sectors = (data ?? []).map((sector) => ({
    slug: sector.slug,
    name: sector.name_ar,
    description: sector.description,
    accent: sector.accent,
    path: `/sectors/${sector.slug}`,
    updatedAt: sector.updated_at,
  }));

  return NextResponse.json(
    { ok: true, generatedAt: new Date().toISOString(), sectors },
    {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  );
}
