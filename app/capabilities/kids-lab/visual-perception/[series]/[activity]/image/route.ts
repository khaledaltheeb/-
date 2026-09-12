import { notFound } from 'next/navigation';
import { getVisualPerceptionActivity, visualPerceptionActivities } from '@/lib/capabilities/visual-perception-lab';
import { renderVisualPerceptionWorksheet } from '@/lib/capabilities/visual-perception-svg-final';
import { normalizeKidsLabSvgText } from '@/lib/capabilities/kids-lab-svg-polish';

type Params = Promise<{ series: string; activity: string }>;
export function generateStaticParams(){return visualPerceptionActivities.map((item)=>({series:item.seriesSlug,activity:item.slug}));}
export async function GET(_:Request,{params}:{params:Params}){const {series,activity}=await params;const item=getVisualPerceptionActivity(series,activity);if(!item)notFound();return new Response(normalizeKidsLabSvgText(renderVisualPerceptionWorksheet(item)),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800','Content-Disposition':`inline; filename="visual-perception-${series}-${activity}.svg"`}});}
