import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('specialists')
    .select('slug,updated_at')
    .eq('verification', 'verified')
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(50000);

  if (error) {
    throw new Error(`specialists sitemap query failed: ${error.message}`);
  }
  if (!Array.isArray(data)) {
    throw new Error('specialists sitemap query returned no data array');
  }

  return sitemapResponse([
    { path: '/specialists', changeFrequency: 'daily', priority: .8 },
    ...data.map((item) => ({
      path: `/specialists/${item.slug}`,
      lastModified: item.updated_at,
      changeFrequency: 'monthly',
      priority: .7,
    })),
  ]);
}
