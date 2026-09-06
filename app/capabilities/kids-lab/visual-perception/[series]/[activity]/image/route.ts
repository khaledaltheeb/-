import { notFound } from 'next/navigation';
import { getVisualPerceptionActivity } from '@/lib/capabilities/visual-perception-lab';
import { renderVisualPerceptionWorksheet } from '@/lib/capabilities/visual-perception-svg';

type Params = Promise<{ series: string; activity: string }>;
export async function GET(_:Request,{params}:{params:Params}){const {series,activity}=await params;const item=getVisualPerceptionActivity(series,activity);if(!item)notFound();return new Response(renderVisualPerceptionWorksheet(item),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000','Content-Disposition':`inline; filename="visual-perception-${series}-${activity}.svg"`}});}