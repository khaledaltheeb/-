import { createClient } from '@/lib/supabase/server';
import { getPsychEncyclopediaReleaseIndex } from '@/lib/psych-encyclopedia-release';
import { sitemapIndexResponse } from '@/lib/sitemap-xml';

export const dynamic = 'force-dynamic';
const PAGE_SIZE = 5000;
const QUICK_INFO_PAGE_SIZE = 5000;
const ENCYCLOPEDIA_PAGE_SIZE = 5000;

function inFilter(values: string[]) {
  return `(${values.join(',')})`;
}

export async function GET() {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const encyclopediaRelease = await getPsychEncyclopediaReleaseIndex();
  const releasedSlugs = encyclopediaRelease.map((item) => item.slug);

  let encyclopediaQuery = supabase
    .from('content')
    .select('id', { count: 'exact', head: true })
    .eq('content_type', 'condition')
    .eq('status', 'published')
    .lte('published_at', now)
    .eq('robots_index', true);

  if (releasedSlugs.length > 0) {
    encyclopediaQuery = encyclopediaQuery.not('slug', 'in', inFilter(releasedSlugs));
  }

  const [contentResult, quickInfoResult, encyclopediaResult] = await Promise.all([
    // This is deliberately a no-loss superset. Quick Info URLs may also appear in their
    // dedicated sitemap, but no published/indexable non-condition row may disappear merely
    // because it originated in a migration or has a specialized slug family.
    supabase
      .from('content')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .neq('content_type', 'condition')
      .lte('published_at', now)
      .eq('robots_index', true),
    supabase
      .from('content')
      .select('id', { count: 'exact', head: true })
      .like('slug', 'quick-info-%')
      .eq('status', 'published')
      .lte('published_at', now)
      .eq('robots_index', true),
    encyclopediaQuery,
  ]);

  if (contentResult.error) {
    throw new Error(`sitemap content count failed: ${contentResult.error.message}`);
  }
  if (quickInfoResult.error) {
    throw new Error(`sitemap quick-info count failed: ${quickInfoResult.error.message}`);
  }
  if (encyclopediaResult.error) {
    throw new Error(`sitemap encyclopedia count failed: ${encyclopediaResult.error.message}`);
  }

  const contentPages = Math.max(1, Math.ceil((contentResult.count ?? 0) / PAGE_SIZE));
  const quickInfoPages = Math.max(1, Math.ceil((quickInfoResult.count ?? 0) / QUICK_INFO_PAGE_SIZE));
  const encyclopediaTotal = (encyclopediaResult.count ?? 0) + releasedSlugs.length;
  const encyclopediaPages = Math.max(1, Math.ceil(encyclopediaTotal / ENCYCLOPEDIA_PAGE_SIZE));
  const paths = [
    '/sitemaps/static.xml',
    '/sitemaps/daily-tools.xml',
    '/sitemaps/taxonomy.xml',
    '/sitemaps/cognitive-lab.xml',
    '/sitemaps/specialists.xml',
    '/sitemaps/centers.xml',
    '/sitemaps/community.xml',
    ...Array.from({ length: quickInfoPages }, (_, page) => `/sitemaps/quick-info.xml?page=${page}`),
    ...Array.from({ length: encyclopediaPages }, (_, page) => `/sitemaps/encyclopedia.xml?page=${page}`),
    ...Array.from({ length: contentPages }, (_, page) => `/sitemaps/content.xml?page=${page}`),
  ];
  return sitemapIndexResponse(paths);
}
