import { sitemapResponse } from '@/lib/sitemap-xml';
import { ALS_MND_HEALTH_LITERACY_SLUGS } from '@/lib/als-mnd-health-literacy-pages';

const RELEASE='2026-08-31T15:28:00.000Z';
export async function GET(){return sitemapResponse(ALS_MND_HEALTH_LITERACY_SLUGS.map((slug)=>({path:slug?`/evidence-guides/als-mnd-health-literacy/${slug}/`:'/evidence-guides/als-mnd-health-literacy/',lastModified:RELEASE,changeFrequency:'monthly' as const,priority:slug?0.76:0.82})));}
