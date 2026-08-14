import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 50000;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const raw = Number(url.searchParams.get('page') ?? '0');
  const page = Number.isInteger(raw) && raw >= 0 && raw < 1000 ? raw : 0;
  const supabase = await createClient();
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE - 1;
  const { data } = await supabase
    .from('content')
    .select('slug,updated_at')
    .eq('content_type', 'condition')
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .order('updated_at', { ascending: false })
    .range(start, end);

  const rows = (data ?? []).flatMap((item) => {
    const slug = typeof item.slug === 'string' ? item.slug.trim().toLowerCase() : '';
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return [];
    return [{ path: `/encyclopedia/${slug}/`, lastModified: item.updated_at, changeFrequency: 'monthly' as const, priority: .8 }];
  });

  return sitemapResponse([{ path: '/encyclopedia/', changeFrequency: 'weekly', priority: .9 }, ...rows]);
}
