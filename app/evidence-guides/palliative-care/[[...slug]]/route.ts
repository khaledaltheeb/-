import { PALLIATIVE_CARE_IAHPC_PAGES } from '@/lib/palliative-care-iahpc-pages';

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

function metaContent(html: string, attribute: 'name' | 'property', value: string) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const direct = html.match(new RegExp(`<meta\\b[^>]*${attribute}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i'));
  if (direct?.[1]) return direct[1];
  const reversed = html.match(new RegExp(`<meta\\b[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${escaped}["'][^>]*>`, 'i'));
  return reversed?.[1] ?? '';
}

function enrichTwitterMetadata(html: string) {
  if (/\bname=["']twitter:card["']/i.test(html)) return html;
  const title = metaContent(html, 'property', 'og:title');
  const description = metaContent(html, 'property', 'og:description');
  const tags = [
    '<meta name="twitter:card" content="summary_large_image">',
    title ? `<meta name="twitter:title" content="${title}">` : '',
    description ? `<meta name="twitter:description" content="${description}">` : '',
  ].filter(Boolean).join('');
  return html.replace(/<\/head>/i, `${tags}</head>`);
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

  return new Response(enrichTwitterMetadata(html), { status: 200, headers });
}
