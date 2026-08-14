import { createClient } from '@/lib/supabase/server';
import { sitemapIndexResponse } from '@/lib/sitemap-xml';

export const dynamic='force-dynamic';
const PAGE_SIZE=50000;
export async function GET(){
 const supabase=await createClient();
 const [{count},{count:encyclopediaCount}]=await Promise.all([
  supabase.from('content').select('id',{count:'exact',head:true}).eq('status','published').lte('published_at',new Date().toISOString()).eq('robots_index',true),
  supabase.from('content').select('id',{count:'exact',head:true}).eq('content_type','condition').eq('status','published').lte('published_at',new Date().toISOString()).eq('robots_index',true),
 ]);
 const pages=Math.max(1,Math.ceil((count??0)/PAGE_SIZE));
 const encyclopediaPages=Math.max(1,Math.ceil((encyclopediaCount??0)/PAGE_SIZE));
 const paths=['/sitemaps/static.xml','/sitemaps/taxonomy.xml','/sitemaps/specialists.xml','/sitemaps/centers.xml','/sitemaps/community.xml',...Array.from({length:encyclopediaPages},(_,page)=>`/sitemaps/encyclopedia.xml?page=${page}`),...Array.from({length:pages},(_,page)=>`/sitemaps/content.xml?page=${page}`)];
 return sitemapIndexResponse(paths);
}
