import { notFound } from 'next/navigation';
import { getLanguageReadingActivity, languageReadingActivities } from '@/lib/capabilities/language-reading-lab';
import { renderLanguageReadingWorksheet } from '@/lib/capabilities/language-reading-svg-final';

type Params=Promise<{series:string;activity:string}>;
export function generateStaticParams(){return languageReadingActivities.map((item)=>({series:item.seriesSlug,activity:item.slug}));}
export async function GET(_:Request,{params}:{params:Params}){const {series,activity}=await params;const item=getLanguageReadingActivity(series,activity);if(!item)notFound();return new Response(renderLanguageReadingWorksheet(item),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=31536000, immutable','Content-Disposition':`inline; filename="${series}-${activity}.svg"`}});}
