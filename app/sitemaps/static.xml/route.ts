import { sitemapResponse } from '@/lib/sitemap-xml';

export async function GET() {
  return sitemapResponse([
    { path:'/', changeFrequency:'weekly', priority:1 },
    { path:'/sectors', changeFrequency:'weekly', priority:.92 },
    { path:'/sections', changeFrequency:'weekly', priority:.9 },
    { path:'/quick-info/', changeFrequency:'weekly', priority:.84 },
    { path:'/encyclopedia/', changeFrequency:'weekly', priority:.88 },
    { path:'/magazine/', changeFrequency:'daily', priority:.84 },
    { path:'/care-guides/', changeFrequency:'weekly', priority:.86 },
    { path:'/evidence-guides/', changeFrequency:'weekly', priority:.86 },
    { path:'/specialists', changeFrequency:'weekly', priority:.78 },
    { path:'/centers', changeFrequency:'weekly', priority:.78 },
    { path:'/cognitive-lab', changeFrequency:'monthly', priority:.8 },
    { path:'/community', changeFrequency:'weekly', priority:.65 },
    { path:'/about', changeFrequency:'monthly', priority:.7 },
    { path:'/start-here', changeFrequency:'monthly', priority:.78 },
    { path:'/guided-assessment', changeFrequency:'monthly', priority:.68 },
    { path:'/assessment-lab', changeFrequency:'monthly', priority:.68 },
    { path:'/resources', changeFrequency:'weekly', priority:.68 },
    { path:'/sources', changeFrequency:'monthly', priority:.62 },
    { path:'/join', changeFrequency:'monthly', priority:.55 },
    { path:'/join/specialist', changeFrequency:'monthly', priority:.5 },
    { path:'/join/center', changeFrequency:'monthly', priority:.5 },
    { path:'/medical-review-policy', changeFrequency:'monthly', priority:.6 },
    { path:'/editorial-policy', changeFrequency:'monthly', priority:.6 },
    { path:'/disclaimer', changeFrequency:'monthly', priority:.45 },
    { path:'/privacy', changeFrequency:'monthly', priority:.4 },
    { path:'/terms', changeFrequency:'monthly', priority:.4 },
  ]);
}
