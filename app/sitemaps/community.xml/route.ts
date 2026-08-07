import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.from('community_profiles').select('slug,updated_at').eq('verification','verified').eq('is_active',true).order('updated_at',{ascending:false}).limit(50000);
  return sitemapResponse([
    { path:'/community', changeFrequency:'weekly', priority:.7 },
    ...(data ?? []).map((item) => ({ path:`/community/${item.slug}`, lastModified:item.updated_at, changeFrequency:'monthly', priority:.6 })),
  ]);
}
