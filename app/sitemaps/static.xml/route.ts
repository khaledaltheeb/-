import { sitemapResponse } from '@/lib/sitemap-xml';

export async function GET() {
  return sitemapResponse([
    { path:'/', changeFrequency:'weekly', priority:1 },
    { path:'/about', changeFrequency:'monthly', priority:.6 },
    { path:'/medical-review-policy', changeFrequency:'monthly', priority:.5 },
    { path:'/editorial-policy', changeFrequency:'monthly', priority:.5 },
    { path:'/disclaimer', changeFrequency:'monthly', priority:.4 },
    { path:'/privacy', changeFrequency:'monthly', priority:.4 },
    { path:'/terms', changeFrequency:'monthly', priority:.4 },
  ]);
}
