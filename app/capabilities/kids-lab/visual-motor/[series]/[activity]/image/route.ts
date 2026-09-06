import { notFound } from 'next/navigation';
import { getVisualMotorActivity } from '@/lib/capabilities/visual-motor-lab';
import { renderVisualMotorWorksheet } from '@/lib/capabilities/visual-motor-svg-final';

type Params=Promise<{series:string;activity:string}>;
export async function GET(_:Request,{params}:{params:Params}){const {series,activity}=await params;const item=getVisualMotorActivity(series,activity);if(!item)notFound();return new Response(renderVisualMotorWorksheet(item),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000','Content-Disposition':`inline; filename="${series}-${activity}.svg"`}});}
