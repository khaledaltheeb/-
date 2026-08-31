import { SOCIAL_WORK_PAGES, SOCIAL_WORK_SOURCE_SHA } from '@/lib/social-work-pages.generated';

type Params = Promise<{ slug?: string[] }>;

const htmlHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'content-language': 'ar',
  'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  'x-rawafid-source': `healthrenewal.org@${SOCIAL_WORK_SOURCE_SHA}`,
};

export const dynamic = 'force-static';

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug = [] } = await params;
  if (slug.length > 1) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const key = slug[0] ?? '';
  const html = SOCIAL_WORK_PAGES[key];
  if (!html) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  return new Response(html, { status: 200, headers: htmlHeaders });
}
