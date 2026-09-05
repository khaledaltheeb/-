import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import OutsideTheBoxArticlePage, { OutsideTheBoxHubPage } from '@/components/outside-the-box-page';
import { getOutsideBoxIndexItems, getOutsideBoxRecord } from '@/lib/outside-the-box';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

type Params = Promise<{ slug?: string[] }>;
export const dynamic = 'force-dynamic';

const ROOT_METADATA = buildSeoMetadata({
  title: 'خارج الصندوق | مسارات علمية للتقييم والتجربة والقياس',
  description: 'مكتبة عربية علمية لمقدمي الخدمة تربط مسارات الحالات بالتقييم متعدد المصادر وخط الأساس والتجارب القابلة للعكس وجودة التنفيذ والقياس وقواعد التوقف وإعادة القرار.',
  path: '/outside-the-box/',
  index: true,
  keywords: ['خارج الصندوق', 'التقييم الوظيفي', 'ICF', 'خط الأساس', 'تصميم الحالة المفردة', 'جودة التنفيذ', 'التربية الخاصة', 'التأهيل'],
});

async function getPublishedCapabilitySibling(routeSlug: string) {
  const supabase = await createClient();
  const canonical = `/capabilities/${routeSlug}/`;
  const { data } = await supabase
    .from('content')
    .select('title,canonical_url')
    .eq('canonical_url', canonical)
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .maybeSingle();

  if (!data) return null;
  return {
    title: typeof data.title === 'string' ? data.title.trim() : '',
    href: typeof data.canonical_url === 'string' && data.canonical_url.trim() ? data.canonical_url.trim() : canonical,
  };
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug = [] } = await params;
  if (slug.length === 0) return ROOT_METADATA;
  if (slug.length !== 1) return { robots: { index: false, follow: false } };

  const record = await getOutsideBoxRecord(slug[0]);
  if (!record) return { robots: { index: false, follow: false } };

  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || `/outside-the-box/${slug[0]}/`,
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'article',
    image: record.featured_image_url,
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[],
    publishedTime: record.published_at,
    modifiedTime: record.updated_at,
    authors: record.author_display_name ? [{ name: record.author_display_name }] : undefined,
  });
}

export default async function OutsideTheBoxRoute({ params }: { params: Params }) {
  const { slug = [] } = await params;

  if (slug.length === 0) {
    const items = await getOutsideBoxIndexItems();
    return <OutsideTheBoxHubPage items={items} />;
  }

  if (slug.length !== 1) notFound();
  const routeSlug = slug[0];
  const record = await getOutsideBoxRecord(routeSlug);
  if (!record) notFound();

  const capabilitySibling = await getPublishedCapabilitySibling(routeSlug);
  return <OutsideTheBoxArticlePage record={record} routeSlug={routeSlug} capabilitySibling={capabilitySibling} />;
}
