import { notFound } from 'next/navigation';
import { getLanguageReadingActivity } from '@/lib/capabilities/language-reading-lab';
import { renderLanguageReadingWorksheet } from '@/lib/capabilities/language-reading-svg';

type Params=Promise<{series:string;activity:string}>;
export async function GET(_:Request,{params}:{params:Params}){const {series,activity}=await params;const item=getLanguageReadingActivity(series,activity);if(!item)notFound();return new Response(renderLanguageReadingWorksheet(item),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=86400, s-maxage=604800, stale-while-revalidate=2592000','Content-Disposition':`inline; filename="${series}-${activity}.svg"`}});}
