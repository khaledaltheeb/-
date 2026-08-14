import { createClient } from '@/lib/supabase/server';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
const PAGE_SIZE=50000;
export async function GET(request:Request) {
  const url=new URL(request.url);const raw=Number(url.searchParams.get('page')??'0');const page=Number.isInteger(raw)&&raw>=0&&raw<10000?raw:0;
  const supabase = await createClient();
  const start=page*PAGE_SIZE;const end=start+PAGE_SIZE-1;
  const { data } = await supabase.from('content').select('slug,updated_at,canonical_url').eq('status','published').neq('content_type','condition').lte('published_at',new Date().toISOString()).eq('robots_index',true).order('updated_at',{ascending:false}).range(start,end);
  return sitemapResponse((data ?? []).map((item) => ({ path: item.canonical_url || `/content/${item.slug}`, lastModified: item.updated_at, changeFrequency:'monthly', priority:.7 })));
}
