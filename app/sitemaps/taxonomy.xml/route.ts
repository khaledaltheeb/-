import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const [{ data: sectors }, { data: categories }] = await Promise.all([
    supabase.from('sectors').select('slug,updated_at').eq('is_active',true).eq('visibility','public').order('sort_order').limit(20000),
    supabase.from('categories').select('slug,updated_at').eq('is_active',true).eq('visibility','public').order('sort_order').limit(50000),
  ]);
  return sitemapResponse([
    ...(sectors ?? []).map((item) => ({ path:`/sectors/${item.slug}`, lastModified:item.updated_at, changeFrequency:'weekly', priority:.8 })),
    ...(categories ?? []).map((item) => ({ path:`/sections/${item.slug}`, lastModified:item.updated_at, changeFrequency:'weekly', priority:.7 })),
  ]);
}
