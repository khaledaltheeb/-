import { SOCIAL_WORK_PAGES, SOCIAL_WORK_SOURCE_SHA } from '@/lib/social-work-pages.generated';

type Params = Promise<{ slug?: string[] }>;

const EMAILED_LJUBLJANA_SOURCE =
  'https://www.fsd.uni-lj.si/mma/Soustvarjanje_podpore_v_skupnosti_-_Angleska_izdaja.pdf/2015081211140160/?m=1439370841';
const CURRENT_LJUBLJANA_SOURCE = 'https://www.fsd.uni-lj.si/mma/-/2016091213042605/';

const htmlHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'content-language': 'ar',
  'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  'x-rawafid-source': `healthrenewal.org@${SOCIAL_WORK_SOURCE_SHA}`,
};

export const dynamic = 'force-static';

function withExactEmailedSource(html: string) {
  if (html.includes('2015081211140160')) return html;

  const currentSourceAnchor = `<p><a href="${CURRENT_LJUBLJANA_SOURCE}"`;
  if (!html.includes(currentSourceAnchor)) {
    throw new Error('Social Work source-audit block is missing the University of Ljubljana anchor.');
  }

  const originalSource = `<p class="source-provenance-original"><a href="${EMAILED_LJUBLJANA_SOURCE}" target="_blank" rel="noopener noreferrer"><strong>الرابط الأصلي الذي شاركته الجهة المهنية معنا</strong> — Families with Multiple Challenges: Co-creating Support in the Community</a></p>`;
  return html.replace(currentSourceAnchor, `${originalSource}${currentSourceAnchor}`);
}

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug = [] } = await params;
  if (slug.length > 1) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const key = slug[0] ?? '';
  const storedHtml = SOCIAL_WORK_PAGES[key];
  if (!storedHtml) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const html = withExactEmailedSource(storedHtml);
  return new Response(html, { status: 200, headers: htmlHeaders });
}
