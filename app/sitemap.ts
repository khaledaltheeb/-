import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const SITE = 'https://healthrenewal.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const [{ data: sectors }, { data: categories }] = await Promise.all([
    supabase.from('sectors').select('slug,updated_at').eq('is_active', true).order('sort_order'),
    supabase.from('categories').select('slug,updated_at').eq('is_active', true).order('sort_order'),
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
  ];
}
