import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getPsychEncyclopediaReleaseIndex } from '@/lib/psych-encyclopedia-release';
import { getPediatricOncologyReleasePreviewByToken } from '@/lib/pediatric-oncology-release-preview';
import { IS_TEMPORARY_HOST, SITE_URL } from '@/lib/seo';
import { sitemapIndexResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const QUICK_INFO_PAGE_SIZE = 5000;
const ENCYCLOPEDIA_PAGE_SIZE = 5000;

const ATLAS_OWNED_CANONICALS = [
  '/addiction/substances/',
  '/addiction/compare/',
  '/addiction/interactions/',
  '/addiction/prevalence/',
  '/addiction/mortality/',
  '/addiction/methodology/',
] as const;

function inFilter(values: string[]) {
  return `(${values.join(',')})`;
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function releasePreviewSitemap(path?: string | null, lastModified?: string | null) {
  const url = path ? `${SITE_URL}${path}` : null;
  const row = url
    ? `<url><loc>${escapeXml(url)}</loc>${lastModified ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>` : ''}</url>`
    : '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${row}</urlset>`;
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
    },
  });
}

function applyDedicatedSitemapExclusions<T extends {
  not: (column: string, operator: string, value: string) => T;
  neq: (column: string, value: string) => T;
}>(query: T): T {
  let owned = query
    .not('canonical_url', 'like', '/encyclopedia/%')
    .not('canonical_url', 'like', '/quick-info/%')
    .not('canonical_url', 'like', '/daily-tools/%')
    .not('canonical_url', 'like', '/addiction/substances/%')
    .not('canonical_url', 'like', '/addiction/compare/%');
  for (const canonical of ATLAS_OWNED_CANONICALS) {
    owned = owned.neq('canonical_url', canonical);
  }
  return owned;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const releaseVerify = IS_TEMPORARY_HOST ? requestUrl.searchParams.get('release_verify') : null;
  if (releaseVerify) {
    const preview = await getPediatricOncologyReleasePreviewByToken(releaseVerify);
    return releasePreviewSitemap(preview?.canonical_url, preview?.updated_at);
  }

  const supabase = await createClient();
  const now = new Date().toISOString();
  const encyclopediaRelease = await getPsychEncyclopediaReleaseIndex();
  const releasedSlugs = encyclopediaRelease.map((item) => item.slug);

  let encyclopediaQuery = supabase
    .from('content')
    .select('id', { count: 'exact', head: true })
    .in('content_type', ['glossary_term', 'condition'])
    .like('canonical_url', '/encyclopedia/%')
    .eq('status', 'published')
    .lte('published_at', now)
    .eq('robots_index', true);

  if (releasedSlugs.length > 0) {
    encyclopediaQuery = encyclopediaQuery.not('slug', 'in', inFilter(releasedSlugs));
  }

  let contentQuery = supabase
    .from('content')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published')
    .lte('published_at', now)
    .eq('robots_index', true);
  contentQuery = applyDedicatedSitemapExclusions(contentQuery);

  const [contentResult, quickInfoResult, encyclopediaResult] = await Promise.all([
    contentQuery,
    supabase
      .from('content')
      .select('id', { count: 'exact', head: true })
      .like('canonical_url', '/quick-info/%')
      .eq('status', 'published')
      .lte('published_at', now)
      .eq('robots_index', true),
    encyclopediaQuery,
  ]);

  if (contentResult.error) throw new Error(`sitemap content count failed: ${contentResult.error.message}`);
  if (quickInfoResult.error) throw new Error(`sitemap quick-info count failed: ${quickInfoResult.error.message}`);
  if (encyclopediaResult.error) throw new Error(`sitemap encyclopedia count failed: ${encyclopediaResult.error.message}`);

  const contentPages = Math.max(1, Math.ceil((contentResult.count ?? 0) / PAGE_SIZE));
  const quickInfoPages = Math.max(1, Math.ceil((quickInfoResult.count ?? 0) / QUICK_INFO_PAGE_SIZE));
  const encyclopediaTotal = (encyclopediaResult.count ?? 0) + releasedSlugs.length;
  const encyclopediaPages = Math.max(1, Math.ceil(encyclopediaTotal / ENCYCLOPEDIA_PAGE_SIZE));
  const paths = [
    '/sitemaps/static.xml',
    '/sitemaps/daily-tools.xml',
    '/sitemaps/taxonomy.xml',
    '/sitemaps/cognitive-lab.xml',
    '/sitemaps/addiction-atlas.xml',
    '/sitemaps/social-work.xml',
    '/sitemaps/palliative-care.xml',
    '/sitemaps/rare-disease.xml',
    '/sitemaps/als-mnd.xml',
    '/sitemaps/specialists.xml',
    '/sitemaps/centers.xml',
    '/sitemaps/community.xml',
    ...Array.from({ length: quickInfoPages }, (_, page) => `/sitemaps/quick-info.xml?page=${page}`),
    ...Array.from({ length: encyclopediaPages }, (_, page) => `/sitemaps/encyclopedia.xml?page=${page}`),
    ...Array.from({ length: contentPages }, (_, page) => `/sitemaps/content.xml?page=${page}`),
  ];
  return sitemapIndexResponse(paths);
}
