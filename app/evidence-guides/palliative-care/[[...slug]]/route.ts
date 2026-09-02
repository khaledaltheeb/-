import { PALLIATIVE_CARE_IAHPC_PAGES } from '@/lib/palliative-care-iahpc-pages';
import { hardenHtmlSeo } from '@/lib/html-seo-hardening';

type Params = Promise<{ slug?: string[] }>;

const headers = {
  'content-type': 'text/html; charset=utf-8',
  'content-language': 'ar',
  'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  'x-rawafid-source': 'iahpc-palliative-care-20260831',
};

export const dynamic = 'force-static';

function canonicalFor(key: string) {
  return key
    ? `https://healthrenewal.org/evidence-guides/palliative-care/${key}/`
    : 'https://healthrenewal.org/evidence-guides/palliative-care/';
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug = [] } = await params;
  if (slug.length > 1) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const key = slug[0] ?? '';
  const html = PALLIATIVE_CARE_IAHPC_PAGES[key];
  if (!html) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  return new Response(hardenHtmlSeo(html, { canonicalUrl: canonicalFor(key) }), { status: 200, headers });
}
