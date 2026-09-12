import { emotionalRegulationActivities, getEmotionalRegulationActivity } from '@/lib/capabilities/emotional-regulation-lab';
import { renderEmotionalRegulationSvg } from '@/lib/capabilities/emotional-regulation-svg-final';
import { normalizeKidsLabSvgText } from '@/lib/capabilities/kids-lab-svg-polish';
type Context={params:Promise<{series:string;activity:string}>};
export function generateStaticParams(){return emotionalRegulationActivities.map((item)=>({series:item.seriesSlug,activity:item.slug}));}
export async function GET(_:Request,{params}:Context){const {series,activity}=await params;const a=getEmotionalRegulationActivity(series,activity);if(!a)return new Response('Not found',{status:404});return new Response(normalizeKidsLabSvgText(renderEmotionalRegulationSvg(a)),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800','Content-Disposition':`inline; filename="${series}-${activity}.svg"`}});}
