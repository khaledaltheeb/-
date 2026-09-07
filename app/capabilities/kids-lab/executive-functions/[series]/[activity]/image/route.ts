import { notFound } from 'next/navigation';
import { executiveActivities, getExecutiveActivity } from '@/lib/capabilities/executive-functions-lab';
import { renderExecutiveWorksheet } from '@/lib/capabilities/executive-functions-svg-final';

type Params=Promise<{series:string;activity:string}>;
export function generateStaticParams(){return executiveActivities.map((item)=>({series:item.seriesSlug,activity:item.slug}));}
export async function GET(_:Request,{params}:{params:Params}){const {series,activity}=await params;const item=getExecutiveActivity(series,activity);if(!item)notFound();return new Response(renderExecutiveWorksheet(item),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=31536000, immutable','Content-Disposition':`inline; filename="${series}-${activity}.svg"`}});}
