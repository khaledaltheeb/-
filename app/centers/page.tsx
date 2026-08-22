import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = buildSeoMetadata({
  title: 'دليل المراكز النفسية',
  description: 'دليل المراكز الموثقة في منصة روافد: ابحث حسب اسم المركز والمدينة والدولة، واستعرض الملفات العامة للمراكز والفروع التي اجتازت مسار التحقق.',
  path: '/centers', index: true,
  keywords: ['مركز نفسي', 'مركز علاج نفسي', 'مراكز التعافي', 'دليل المراكز', 'منصة روافد'],
});

type SearchParams = Promise<{ q?: string; city?: string; country?: string }>;
type CenterRow = { id: string; slug: string; name: string; description: string | null; logo_url: string | null; country: string | null; region: string | null; city: string | null; address: string | null };

export default async function CentersDirectory({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = String(params.q ?? '').trim().slice(0, 120);
  const city = String(params.city ?? '').trim().slice(0, 120);
  const country = String(params.country ?? '').trim().slice(0, 120);
  const hasFilters = Boolean(q || city || country);
  const supabase = await createClient();

  let query = supabase.from('centers').select('id,slug,name,description,logo_url,country,region,city,address').eq('verification', 'verified').eq('is_active', true).order('name').limit(100);
  if (q) query = query.ilike('name', `%${q.replace(/[%_]/g, '')}%`);
  if (city) query = query.ilike('city', `%${city.replace(/[%_]/g, '')}%`);
  if (country) query = query.ilike('country', `%${country.replace(/[%_]/g, '')}%`);
  const { data, error } = await query;
  const rows = (Array.isArray(data) ? data : []) as CenterRow[];

  return (
    <>
      <SiteHeader />
      <main className="directory-shell">
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
