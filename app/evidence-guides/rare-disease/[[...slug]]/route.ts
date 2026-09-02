import { RARE_DISEASE_GLOBAL_GENES_PAGES } from '@/lib/rare-disease-global-genes-pages';
import { hardenRawHtmlSeo } from '@/lib/raw-html-seo';

type Params = Promise<{ slug?: string[] }>;

const headers = {
  'content-type': 'text/html; charset=utf-8',
  'content-language': 'ar',
  'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  'x-rawafid-source': 'global-genes-rare-disease-20260831',
};

export const dynamic = 'force-static';

export async function GET(request: Request, { params }: { params: Params }) {
  const { slug = [] } = await params;
  if (slug.length > 1) return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  const html = RARE_DISEASE_GLOBAL_GENES_PAGES[slug[0] ?? ''];
  if (!html) return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  const canonicalUrl = `https://healthrenewal.org${new URL(request.url).pathname}`;
  return new Response(hardenRawHtmlSeo(html, { canonicalUrl, type: 'article' }), { status: 200, headers });
}
