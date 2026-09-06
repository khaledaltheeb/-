import { sitemapResponse } from '@/lib/sitemap-xml';
const RELEASE='2026-08-31T15:35:00.000Z';
const paths=['/evidence-guides/als-mnd/','/evidence-guides/als-mnd/understanding/','/evidence-guides/als-mnd/living/','/evidence-guides/als-mnd/treatment/','/evidence-guides/als-mnd/action/'];
export async function GET(){return sitemapResponse(paths.map((path)=>({path,lastModified:RELEASE,changeFrequency:'monthly' as const,priority:path.endsWith('/als-mnd/')?.82:.76})));}
