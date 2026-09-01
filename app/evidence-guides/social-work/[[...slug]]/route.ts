import { SOCIAL_WORK_PAGES, SOCIAL_WORK_SOURCE_SHA } from '@/lib/social-work-pages.generated';
import { SOCIAL_WORK_TALENTIA_PAGES, enrichSocialWorkPageWithTalentia } from '@/lib/social-work-talentia-pages';
import { enrichTalentiaPageWithInlineLinks } from '@/lib/social-work-talentia-inline-links';
import { hardenTalentiaPageQuality } from '@/lib/social-work-talentia-quality';
import {
  RAWAFID_COMPARATIVE_SOCIAL_WORK_LAYER,
  SOCIAL_WORK_COMPARATIVE_PAGES,
  enrichSocialWorkPageWithComparativeSources,
} from '@/lib/social-work-comparative-pages';

type Params = Promise<{ slug?: string[] }>;

const htmlHeaders = {
  'content-type': 'text/html; charset=utf-8',
  'content-language': 'ar',
  'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  'x-content-type-options': 'nosniff',
  'x-robots-tag': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
  'x-rawafid-source': `healthrenewal.org@${SOCIAL_WORK_SOURCE_SHA};talentia-ethics-20260831;${RAWAFID_COMPARATIVE_SOCIAL_WORK_LAYER}`,
};

export const dynamic = 'force-static';

export async function GET(_request: Request, { params }: { params: Params }) {
  const { slug = [] } = await params;
  if (slug.length > 1) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const key = slug[0] ?? '';
  const comparativeHtml = SOCIAL_WORK_COMPARATIVE_PAGES[key];
  if (comparativeHtml) {
    return new Response(comparativeHtml, { status: 200, headers: htmlHeaders });
  }

  const talentiaHtml = SOCIAL_WORK_TALENTIA_PAGES[key];
  if (talentiaHtml) {
    const withInlineLinks = enrichTalentiaPageWithInlineLinks(talentiaHtml, key);
    const hardened = hardenTalentiaPageQuality(withInlineLinks, key);
    return new Response(enrichSocialWorkPageWithComparativeSources(hardened, key), { status: 200, headers: htmlHeaders });
  }

  const recoveredHtml = SOCIAL_WORK_PAGES[key];
  if (!recoveredHtml) {
    return new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }

  const withTalentia = enrichSocialWorkPageWithTalentia(recoveredHtml, key);
  return new Response(enrichSocialWorkPageWithComparativeSources(withTalentia, key), { status: 200, headers: htmlHeaders });
}
