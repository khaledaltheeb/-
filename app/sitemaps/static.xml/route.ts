import { sitemapResponse } from '@/lib/sitemap-xml';

export async function GET() {
  return sitemapResponse([
    { path:'/', changeFrequency:'weekly', priority:1 },
    { path:'/about', changeFrequency:'monthly', priority:.6 },
    { path:'/start-here', changeFrequency:'monthly', priority:.75 },
    { path:'/all-pages', changeFrequency:'daily', priority:.7 },
    { path:'/guided-assessment', changeFrequency:'monthly', priority:.65 },
    { path:'/assessment-lab', changeFrequency:'monthly', priority:.65 },
    { path:'/resources', changeFrequency:'weekly', priority:.6 },
    { path:'/sources', changeFrequency:'monthly', priority:.5 },
    { path:'/join', changeFrequency:'monthly', priority:.55 },
    { path:'/join/specialist', changeFrequency:'monthly', priority:.5 },
    { path:'/join/center', changeFrequency:'monthly', priority:.5 },
    { path:'/medical-review-policy', changeFrequency:'monthly', priority:.5 },
    { path:'/editorial-policy', changeFrequency:'monthly', priority:.5 },
    { path:'/disclaimer', changeFrequency:'monthly', priority:.4 },
    { path:'/privacy', changeFrequency:'monthly', priority:.4 },
    { path:'/terms', changeFrequency:'monthly', priority:.4 },
  ]);
}
