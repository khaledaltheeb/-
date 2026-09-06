import { getEmotionalRegulationActivity } from '@/lib/capabilities/emotional-regulation-lab';
import { renderEmotionalRegulationSvg } from '@/lib/capabilities/emotional-regulation-svg-final';
type Context={params:Promise<{series:string;activity:string}>};
export async function GET(_:Request,{params}:Context){const {series,activity}=await params;const a=getEmotionalRegulationActivity(series,activity);if(!a)return new Response('Not found',{status:404});return new Response(renderEmotionalRegulationSvg(a),{headers:{'content-type':'image/svg+xml; charset=utf-8','cache-control':'public, max-age=86400, s-maxage=604800','content-disposition':`inline; filename="${series}-${activity}.svg"`}});}
