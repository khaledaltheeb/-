import { sitemapResponse } from '@/lib/sitemap-xml';
import { FRAGILE_X_FRAXI_SLUGS } from '@/lib/fragile-x-fraxi-pages';

const RELEASE='2026-08-31T15:07:00.000Z';
export async function GET(){return sitemapResponse(FRAGILE_X_FRAXI_SLUGS.map((slug)=>({path:slug?`/evidence-guides/fragile-x-person-centred/${slug}/`:'/evidence-guides/fragile-x-person-centred/',lastModified:RELEASE,changeFrequency:'monthly' as const,priority:slug?.length?0.76:0.82})));}
