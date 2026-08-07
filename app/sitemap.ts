import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const SITE = 'https://healthrenewal.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [{ data: sectors }, { data: categories }, { data: content }] = await Promise.all([
    supabase.from('sectors').select('slug,updated_at').eq('is_active', true).order('sort_order'),
    supabase.from('categories').select('slug,updated_at').eq('is_active', true).order('sort_order'),
    supabase.from('content').select('slug,updated_at,canonical_url').eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('updated_at', { ascending: false }),
  ]);

  return [
    { url: SITE, lastModified: new Date(), priority: 1 },
    ...(sectors ?? []).map((sector) => ({
      url: `${SITE}/sectors/${sector.slug}`,
      lastModified: sector.updated_at ? new Date(sector.updated_at) : new Date(),
      priority: 0.8,
    })),
    ...(categories ?? []).map((category) => ({
      url: `${SITE}/sections/${category.slug}`,
      lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
      priority: 0.7,
    })),
    ...(content ?? []).map((item) => ({
      url: item.canonical_url
        ? (item.canonical_url.startsWith('https://') ? item.canonical_url : `${SITE}${item.canonical_url}`)
        : `${SITE}/content/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      priority: 0.7,
    })),
  ];
}
