import { notFound } from 'next/navigation';
import { getLanguageReadingActivity, languageReadingActivities } from '@/lib/capabilities/language-reading-lab';
import { renderLanguageReadingWorksheet } from '@/lib/capabilities/language-reading-svg-final';
import { normalizeKidsLabSvgText } from '@/lib/capabilities/kids-lab-svg-polish';

type Params=Promise<{series:string;activity:string}>;
export function generateStaticParams(){return languageReadingActivities.map((item)=>({series:item.seriesSlug,activity:item.slug}));}
export async function GET(_:Request,{params}:{params:Params}){const {series,activity}=await params;const item=getLanguageReadingActivity(series,activity);if(!item)notFound();return new Response(normalizeKidsLabSvgText(renderLanguageReadingWorksheet(item)),{headers:{'Content-Type':'image/svg+xml; charset=utf-8','Cache-Control':'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800','Content-Disposition':`inline; filename="${series}-${activity}.svg"`}});}
