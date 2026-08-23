import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ q?: string; city?: string; country?: string }>;
type CenterRow = { id: string; slug: string; name: string; description: string | null; logo_url: string | null; country: string | null; region: string | null; city: string | null; address: string | null };

function normalizedFilters(params: Awaited<SearchParams>) {
  const q = String(params.q ?? '').trim().slice(0, 120);
  const city = String(params.city ?? '').trim().slice(0, 120);
  const country = String(params.country ?? '').trim().slice(0, 120);
  return { q, city, country, hasFilters: Boolean(q || city || country) };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const filters = normalizedFilters(await searchParams);
  return buildSeoMetadata({
    title: filters.hasFilters ? 'نتائج تصفية دليل المراكز' : 'دليل المراكز النفسية',
    description: filters.hasFilters
      ? 'نتائج تصفية داخل دليل المراكز الموثقة في روافد. ارجع إلى صفحة الدليل الأساسية للوصول إلى الفهرس العام.'
      : 'دليل المراكز الموثقة في منصة روافد: ابحث حسب اسم المركز والمدينة والدولة، واستعرض الملفات العامة للمراكز والفروع التي اجتازت مسار التحقق.',
    path: '/centers',
    index: !filters.hasFilters,
    follow: true,
    keywords: ['مركز نفسي', 'مركز علاج نفسي', 'مراكز التعافي', 'دليل المراكز', 'منصة روافد'],
  });
}

export default async function CentersDirectory({ searchParams }: { searchParams: SearchParams }) {
  const filters = normalizedFilters(await searchParams);
  const { q, city, country, hasFilters } = filters;
  const supabase = await createClient();

  let query = supabase.from('centers').select('id,slug,name,description,logo_url,country,region,city,address').eq('verification', 'verified').eq('is_active', true).order('name').limit(100);
  if (q) query = query.ilike('name', `%${q.replace(/[%_]/g, '')}%`);
  if (city) query = query.ilike('city', `%${city.replace(/[%_]/g, '')}%`);
  if (country) query = query.ilike('country', `%${country.replace(/[%_]/g, '')}%`);
  const { data, error } = await query;
  const rows = (Array.isArray(data) ? data : []) as CenterRow[];

  const directoryUrl = `${SITE_URL}/centers`;
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'دليل المراكز', path: '/centers' }]);
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${directoryUrl}#collection`,
    url: directoryUrl,
    name: hasFilters ? 'نتائج تصفية دليل المراكز' : 'دليل المراكز',
    description: 'دليل عام للمراكز والجهات الموثقة والمنشورة في منصة روافد.',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    isPartOf: { '@id': `${SITE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: rows.length,
      itemListElement: rows.map((center, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: center.name,
        url: `${SITE_URL}/centers/${center.slug}`,
      })),
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="directory-shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, collectionSchema]).replace(/</g, '\\u003c') }} />
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">دليل المراكز</span></nav>
        <section className="directory-hero">
          <span className="eyebrow">دليل جهات موثقة</span>
          <h1>دليل المراكز</h1>
          <p>ابحث في المراكز النشطة التي اجتازت مسار التوثيق، وقارن الموقع والخدمات العامة قبل فتح ملف المركز. لا تظهر بيانات الاتصال أو الموقع المقيدة إلا وفق إعدادات الخصوصية المعتمدة.</p>
          <nav className="directory-local-nav" aria-label="مسارات الدليل المهني">
            <Link href="/specialists">المختصون</Link>
            <Link className="active" href="/centers" aria-current="page">المراكز</Link>
            <Link href="/search">البحث العام</Link>
            <Link href="/care-guides/">أدلة الرعاية</Link>
            <Link href="/join/center">تسجيل مركز</Link>
          </nav>
        </section>

        <form className="directory-filters centers-filters" method="get" aria-label="تصفية دليل المراكز">
          <label>اسم المركز<input name="q" defaultValue={q} placeholder="اسم المركز" maxLength={120} /></label>
          <label>المدينة<input name="city" defaultValue={city} placeholder="المدينة" maxLength={120} /></label>
          <label>الدولة<input name="country" defaultValue={country} placeholder="الدولة" maxLength={120} /></label>
          <button className="primary-action" type="submit">تطبيق الفلاتر</button>{hasFilters && <Link className="directory-clear" href="/centers">مسح الفلاتر</Link>}
        </form>

        <section className="directory-results" aria-live="polite">
          <div className="directory-summary"><strong>{rows.length.toLocaleString('ar')}</strong><span>{hasFilters ? 'مركز موثق مطابق للفلاتر' : 'مركز موثق متاح في الدليل'}</span></div>
          {error && <div className="search-state error"><h2>تعذر تحميل الدليل</h2><p>لم يتم عرض بيانات غير مؤكدة. حاول مرة أخرى لاحقًا.</p></div>}
          {!error && rows.length === 0 && <div className="search-state directory-empty"><h2>لا توجد مراكز مطابقة حاليًا</h2><p>{hasFilters ? 'جرّب توسيع الفلاتر أو مسحها لعرض جميع المراكز الموثقة.' : 'ستظهر المراكز بعد اكتمال التوثيق وتفعيل الملف.'}</p>{hasFilters && <Link className="button" href="/centers">عرض جميع المراكز</Link>}</div>}
          <div className="directory-grid center-grid">
            {rows.map((center) => <article className="directory-card" key={center.id}>
              <div className="directory-card-top"><div className="profile-placeholder center-placeholder" aria-hidden="true">{center.name.slice(0, 1)}</div><div><span className="verified-label">مركز موثق</span><h2><Link href={`/centers/${center.slug}`}>{center.name}</Link></h2><p className="professional-title">{[center.city, center.country].filter(Boolean).join('، ') || 'الموقع غير محدد'}</p></div></div>
              {center.description && <p className="directory-bio">{center.description.slice(0, 240)}{center.description.length > 240 ? '…' : ''}</p>}
              <div className="directory-meta">{center.address && <span>{center.address}</span>}{center.city && <span>{center.city}</span>}{center.country && <span>{center.country}</span>}</div>
              <Link className="directory-open" href={`/centers/${center.slug}`}>عرض ملف المركز ←</Link>
            </article>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
