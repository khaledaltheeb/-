import type { Metadata } from 'next';
import Link from 'next/link';
import ContentRenderer from '@/components/content-renderer';
import PublicPagination from '@/components/public-pagination';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { publicContentHref, publicContentTypeLabel } from '@/lib/public-content-routing';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ page?: string | string[]; q?: string | string[] }>;
type Item = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_type: string;
  published_at: string | null;
  canonical_url: string | null;
};
type EditorialContent = {
  id: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
};

type Category = {
  id: string;
  name_ar: string;
  description: string | null;
  editorial_content_id: string | null;
};

const SLUG = 'research-evidence-learning';
const SECTION_PATH = `/sections/${SLUG}`;
const DESCENDANT_PATTERN = `${SECTION_PATH}/%/`;
const PAGE_SIZE = 24;

const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? '' : value ?? '';
const pageNo = (value: string) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n < 10000 ? n : 1;
};
const qSafe = (value: string) => value.trim().replace(/[%_(),]/g, ' ').replace(/\s+/g, ' ').slice(0, 100);
const indexPagePath = (page: number) => `${SECTION_PATH}${page > 1 ? `?page=${page}` : ''}`;
const pageHref = (page: number, q: string) => {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q) params.set('q', q);
  return `${SECTION_PATH}${params.size ? `?${params}` : ''}`;
};

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const raw = await searchParams;
  const page = pageNo(one(raw.page));
  const query = qSafe(one(raw.q));
  const title = 'البحث والأدلة والتعلم: قراءة الدراسات وتقييم الدليل';
  const description = 'أكاديمية عربية لتعلم قراءة البحث العلمي وتقييم جودة الدليل: تصميم الدراسات، القياس، الإحصاء، التحيز، المراجعات المنهجية والتطبيق المبني على الدليل.';

  return buildSeoMetadata({
    title: query ? 'نتائج البحث داخل أكاديمية البحث والدليل' : page > 1 ? `${title} - الصفحة ${page}` : title,
    description: query ? 'نتائج البحث الداخلي داخل أكاديمية البحث والدليل. انتقل إلى الصفحة الرئيسية للقسم للوصول إلى جميع المسارات التعليمية المنشورة.' : page > 1 ? `${description} الصفحة ${page}.` : description,
    path: query ? SECTION_PATH : indexPagePath(page),
    index: !query,
    follow: true,
    keywords: ['قراءة البحث العلمي', 'تقييم الأدلة', 'البحث العلمي', 'المراجعات المنهجية', 'خطر التحيز', 'GRADE', 'الطب المبني على الدليل'],
  });
}

export default async function ResearchEvidenceLearningPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = await searchParams;
  const page = pageNo(one(raw.page));
  const query = qSafe(one(raw.q));
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: categoryData, error: categoryError } = await supabase
    .from('categories')
    .select('id,name_ar,description,editorial_content_id')
    .eq('slug', SLUG)
    .eq('is_active', true)
    .eq('visibility', 'public')
    .maybeSingle();
  if (categoryError) throw new Error(`research evidence category query failed: ${categoryError.message}`);
  const category = categoryData as Category | null;

  let editorialContent: EditorialContent | null = null;
  if (category?.editorial_content_id) {
    const { data, error } = await supabase
      .from('content')
      .select('id,title,excerpt,body_json,body_text')
      .eq('id', category.editorial_content_id)
      .eq('status', 'published')
      .eq('robots_index', true)
      .lte('published_at', now)
      .maybeSingle();
    if (error) throw new Error(`research evidence editorial query failed: ${error.message}`);
    editorialContent = data as EditorialContent | null;
  }

  let contentQuery = supabase
    .from('content')
    .select('id,slug,title,excerpt,content_type,published_at,canonical_url', { count: 'exact' })
    .like('canonical_url', DESCENDANT_PATTERN)
    .eq('status', 'published')
    .eq('robots_index', true)
    .eq('robots_follow', true)
    .lte('published_at', now)
    .order('title');
  if (query) contentQuery = contentQuery.ilike('title', `%${query}%`);

  const { data, count, error } = await contentQuery.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (error) throw new Error(`research evidence content query failed: ${error.message}`);

  const rows = (data ?? []) as Item[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const canonicalPath = query ? SECTION_PATH : indexPagePath(safePage);
  const canonical = `${SITE_URL}${canonicalPath}`;
  const sectionName = category?.name_ar || 'البحث والأدلة والتعلم';
  const sectionDescription = category?.description || 'مسارات تعليمية منهجية لفهم البحث العلمي وقراءة النتائج وتقييم جودة الدليل وتطبيقه.';

  const schemas = [
    breadcrumbJsonLd([
      { name: 'الرئيسية', path: '/' },
      { name: 'الأقسام', path: '/sections' },
      { name: 'المعرفة والموسوعة', path: '/sectors/knowledge' },
      { name: sectionName, path: SECTION_PATH },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      '@id': `${canonical}#collection`,
      url: canonical,
      name: query ? `نتائج البحث داخل ${sectionName}` : safePage > 1 ? `${sectionName} - الصفحة ${safePage}` : sectionName,
      description: sectionDescription,
      inLanguage: 'ar',
      isAccessibleForFree: true,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: total,
        itemListElement: rows.map((item, index) => ({
          '@type': 'ListItem',
          position: (safePage - 1) * PAGE_SIZE + index + 1,
          name: item.title,
          url: `${SITE_URL}${publicContentHref(item)}`,
        })),
      },
    },
  ];

  return <>
    <SiteHeader />
    <main className="site-shell sector-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link><span>/</span><Link href="/sections">الأقسام</Link><span>/</span><Link href="/sectors/knowledge">المعرفة والموسوعة</Link><span>/</span><span aria-current="page">{sectionName}</span>
      </nav>

      <section className="sector-hero compact-hero">
        <span className="eyebrow">أكاديمية البحث والدليل</span>
        <h1>{sectionName}</h1>
        <p>{sectionDescription}</p>
        <div className="public-stat-strip"><span>{total.toLocaleString('ar')} دليلًا تعليميًا منشورًا وقابلًا للفهرسة</span></div>
        <form className="sector-search" action={SECTION_PATH} method="get">
          <label className="sr-only" htmlFor="research-evidence-search">البحث داخل أكاديمية البحث والدليل</label>
          <input id="research-evidence-search" name="q" defaultValue={query} placeholder="ابحث عن تصميم دراسة، تحيز، إحصاء أو مراجعة منهجية" maxLength={100} />
          <button type="submit">بحث</button>
        </form>
      </section>

      <nav className="sector-quick-nav" aria-label="وصول سريع داخل أكاديمية البحث والدليل">
        <a href="#learning-guide">ابدأ من هنا</a>
        <a href="#section-content">كل الأدلة التعليمية</a>
        <Link href="/evidence-guides/">الأدلة العلمية</Link>
        <Link href="/assessment-lab">مختبر التقييم</Link>
      </nav>

      {editorialContent && <section className="section category-editorial-content" id="learning-guide" aria-labelledby="category-editorial-title">
        <div className="section-heading">
          <span>ابدأ من هنا</span>
          <h2 id="category-editorial-title">{editorialContent.title}</h2>
          {editorialContent.excerpt && <p>{editorialContent.excerpt}</p>}
        </div>
        <div className="article-body"><ContentRenderer bodyJson={editorialContent.body_json} bodyText={editorialContent.body_text} recordId={editorialContent.id} /></div>
      </section>}

      <section className="section related-content-section" id="section-content">
        <div className="section-heading">
          <span>المكتبة التعليمية</span>
          <h2>{query ? `نتائج البحث عن «${query}»` : safePage > 1 ? `أدلة البحث والدليل - الصفحة ${safePage}` : 'جميع أدلة البحث والدليل'}</h2>
          <p>هذه القائمة مبنية مباشرة على المسار القانوني لهذا القسم؛ لذلك تعرض صفحات الأكاديمية نفسها فقط، مع الحفاظ على التصنيف العلمي الأصلي لكل صفحة ومنع خلطها بموارد من أقسام أخرى.</p>
        </div>
        {rows.length ? <>
          <div className="related-content-grid">{rows.map((item) => {
            const href = publicContentHref(item);
            return <article key={item.id}>
              <span className="content-type-pill">{publicContentTypeLabel(item.content_type)}</span>
              <h3><Link href={href}>{item.title}</Link></h3>
              {item.excerpt && <p>{item.excerpt}</p>}
              <Link href={href}>قراءة الدليل ←</Link>
            </article>;
          })}</div>
          <PublicPagination currentPage={safePage} totalPages={pages} hrefForPage={(targetPage) => pageHref(targetPage, query)} ariaLabel="صفحات أدلة البحث والدليل" />
        </> : <div className="empty-state"><strong>لا توجد نتيجة مطابقة.</strong><span>جرّب مصطلحًا أقصر مثل «التحيز» أو «المراجعة المنهجية» أو «حجم الأثر».</span></div>}
      </section>
    </main>
    <SiteFooter />
  </>;
}
