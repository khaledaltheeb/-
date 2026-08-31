import { ALS_MND_HEALTH_LITERACY_PAGES } from '@/lib/als-mnd-health-literacy-pages';

type Params=Promise<{slug?:string[]}>;
export const dynamic='force-dynamic';
export async function GET(_request:Request,{params}:{params:Params}){
  const {slug}=await params;
  const key=(slug??[]).join('/');
  const html=ALS_MND_HEALTH_LITERACY_PAGES[key];
  if(!html) return new Response('Not found',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  return new Response(html,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800'}});
}
