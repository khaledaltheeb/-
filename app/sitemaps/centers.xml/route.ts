import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('centers')
    .select('slug,updated_at')
    .eq('verification', 'verified')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(50000);

  if (error) {
    throw new Error(`centers sitemap query failed: ${error.message}`);
  }
  if (!Array.isArray(data)) {
    throw new Error('centers sitemap query returned no data array');
  }

  return sitemapResponse([
    { path: '/centers', changeFrequency: 'daily', priority: .8 },
    ...data.map((item) => ({
      path: `/centers/${item.slug}`,
      lastModified: item.updated_at,
      changeFrequency: 'monthly',
      priority: .7,
    })),
  ]);
}
