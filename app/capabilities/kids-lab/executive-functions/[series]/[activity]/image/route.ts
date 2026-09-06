import { notFound } from 'next/navigation';
import { getExecutiveActivity } from '@/lib/capabilities/executive-functions-lab';
import { renderExecutiveWorksheet } from '@/lib/capabilities/executive-functions-svg-final';

type Params=Promise<{series:string;activity:string}>;
export async function GET(request:Request,{params}:{params:Params}){void request;const {series,activity}=await params;const item=getExecutiveActivity(series,activity);if(!item)notFound();return new Response(renderExecutiveWorksheet(item),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000','Content-Disposition':`inline; filename="${series}-${activity}.svg"`}});}
