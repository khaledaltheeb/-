import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from('content').select('slug,updated_at,canonical_url').eq('status','published').lte('published_at',new Date().toISOString()).eq('robots_index',true).order('updated_at',{ascending:false}).limit(50000);
  return sitemapResponse((data ?? []).map((item) => ({ path: item.canonical_url || `/content/${item.slug}`, lastModified: item.updated_at, changeFrequency:'monthly', priority:.7 })));
}
