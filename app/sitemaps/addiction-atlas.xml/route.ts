import { getAddictionAtlas } from '@/lib/addiction-atlas';
import { sitemapResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';

export async function GET() {
  const atlas = await getAddictionAtlas();
  const entries = [
    { path: '/addiction/substances/', lastModified: atlas.updatedOn, changeFrequency: 'monthly', priority: 0.9 },
    { path: '/addiction/compare/', lastModified: atlas.updatedOn, changeFrequency: 'monthly', priority: 0.8 },
    { path: '/addiction/prevalence/', lastModified: atlas.updatedOn, changeFrequency: 'monthly', priority: 0.75 },
    { path: '/addiction/mortality/', lastModified: atlas.updatedOn, changeFrequency: 'monthly', priority: 0.75 },
    { path: '/addiction/methodology/', lastModified: atlas.updatedOn, changeFrequency: 'yearly', priority: 0.6 },
    ...atlas.substances.map((item) => ({ path: `/addiction/substances/${item.slug}/`, lastModified: atlas.updatedOn, changeFrequency: 'monthly', priority: 0.8 })),
    ...atlas.comparisons.filter((item) => item.indexable).map((item) => ({ path: `/addiction/compare/${item.slug}/`, lastModified: atlas.updatedOn, changeFrequency: 'monthly', priority: 0.7 })),
  ];
  return sitemapResponse(entries);
}
