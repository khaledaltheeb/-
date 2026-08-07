import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const SITE = 'https://healthrenewal.org';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const [
    { data: sectors },
    { data: categories },
    { data: content },
    { data: specialists },
    { data: centers },
  ] = await Promise.all([
    supabase.from('sectors').select('slug,updated_at').eq('is_active', true).eq('visibility', 'public').order('sort_order'),
    supabase.from('categories').select('slug,updated_at').eq('is_active', true).eq('visibility', 'public').order('sort_order'),
    supabase.from('content').select('slug,updated_at,canonical_url').eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('updated_at', { ascending: false }),
    supabase.from('specialists').select('slug,updated_at').eq('verification', 'verified').eq('is_active', true).order('updated_at', { ascending: false }),
    supabase.from('centers').select('slug,updated_at').eq('verification', 'verified').eq('is_active', true).order('updated_at', { ascending: false }),
  ]);

  return [
    { url: SITE, lastModified: new Date(), priority: 1 },
    { url: `${SITE}/specialists`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE}/centers`, lastModified: new Date(), priority: 0.8 },
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
    ...(specialists ?? []).map((specialist) => ({
      url: `${SITE}/specialists/${specialist.slug}`,
      lastModified: specialist.updated_at ? new Date(specialist.updated_at) : new Date(),
      priority: 0.7,
    })),
    ...(centers ?? []).map((center) => ({
      url: `${SITE}/centers/${center.slug}`,
      lastModified: center.updated_at ? new Date(center.updated_at) : new Date(),
      priority: 0.7,
    })),
  ];
}
