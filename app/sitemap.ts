import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'true') return [];

  const supabase = await createClient();
  const now = new Date().toISOString();
  const [
    { data: sectors }, { data: categories }, { data: content }, { data: specialists }, { data: centers }, { data: community },
  ] = await Promise.all([
    supabase.from('sectors').select('slug,updated_at').eq('is_active', true).eq('visibility', 'public').order('sort_order'),
    supabase.from('categories').select('slug,updated_at').eq('is_active', true).eq('visibility', 'public').order('sort_order'),
    supabase.from('content').select('slug,updated_at,canonical_url').eq('status', 'published').lte('published_at', now).eq('robots_index', true).order('updated_at', { ascending: false }),
    supabase.from('specialists').select('slug,updated_at').eq('verification', 'verified').eq('is_active', true).order('updated_at', { ascending: false }),
    supabase.from('centers').select('slug,updated_at').eq('verification', 'verified').eq('is_active', true).order('updated_at', { ascending: false }),
    supabase.from('community_profiles').select('slug,updated_at').eq('verification', 'verified').eq('is_active', true).order('updated_at', { ascending: false }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), priority: 1 },
    { url: `${SITE_URL}/specialists`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/centers`, lastModified: new Date(), priority: 0.8 },
    { url: `${SITE_URL}/community`, lastModified: new Date(), priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), priority: 0.6 },
    { url: `${SITE_URL}/medical-review-policy`, lastModified: new Date(), priority: 0.5 },
    { url: `${SITE_URL}/editorial-policy`, lastModified: new Date(), priority: 0.5 },
    { url: `${SITE_URL}/disclaimer`, lastModified: new Date(), priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), priority: 0.4 },
  ];

  return [
    ...staticPages,
    ...(sectors ?? []).map((sector) => ({ url: `${SITE_URL}/sectors/${sector.slug}`, lastModified: sector.updated_at ? new Date(sector.updated_at) : new Date(), priority: 0.8 })),
    ...(categories ?? []).map((category) => ({ url: `${SITE_URL}/sections/${category.slug}`, lastModified: category.updated_at ? new Date(category.updated_at) : new Date(), priority: 0.7 })),
    ...(content ?? []).map((item) => ({ url: item.canonical_url ? (item.canonical_url.startsWith('https://') ? item.canonical_url : `${SITE_URL}${item.canonical_url}`) : `${SITE_URL}/content/${item.slug}`, lastModified: item.updated_at ? new Date(item.updated_at) : new Date(), priority: 0.7 })),
    ...(specialists ?? []).map((specialist) => ({ url: `${SITE_URL}/specialists/${specialist.slug}`, lastModified: specialist.updated_at ? new Date(specialist.updated_at) : new Date(), priority: 0.7 })),
    ...(centers ?? []).map((center) => ({ url: `${SITE_URL}/centers/${center.slug}`, lastModified: center.updated_at ? new Date(center.updated_at) : new Date(), priority: 0.7 })),
    ...(community ?? []).map((member) => ({ url: `${SITE_URL}/community/${member.slug}`, lastModified: member.updated_at ? new Date(member.updated_at) : new Date(), priority: 0.6 })),
  ];
}
