import type { Metadata } from 'next';
import Link from 'next/link';
import PublicPagination from '@/components/public-pagination';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ q?: string | string[]; specialty?: string | string[]; city?: string | string[]; mode?: string | string[]; page?: string | string[] }>;
type SpecialistRow = {
  id: string; slug: string; full_name: string; professional_title: string | null; bio: string | null;
  country: string | null; region: string | null; city: string | null; specialties: string[]; languages: string[];
  years_experience: number | null; offers_remote: boolean; offers_in_person: boolean;
};

type DirectoryFilters = { q: string; specialty: string; city: string; mode: string };
const PAGE_SIZE = 24;
const one = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] ?? '' : value ?? '';
const pageNo = (value: string) => { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 && parsed < 10000 ? parsed : 1; };
const safeFilter = (value: string) => value.trim().replace(/[%_(),]/g, ' ').replace(/\s+/g, ' ').slice(0, 120);
const pageHref = (page: number, filters: DirectoryFilters) => {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.specialty) params.set('specialty', filters.specialty);
  if (filters.city) params.set('city', filters.city);
  if (filters.mode) params.set('mode', filters.mode);
  if (page > 1) params.set('page', String(page));
  return `/specialists${params.size ? `?${params}` : ''}`;
};
const directoryState = (params: Awaited<SearchParams>) => {
  const q = safeFilter(one(params.q));
  const specialty = safeFilter(one(params.specialty));
  const city = safeFilter(one(params.city));
  const modeValue = one(params.mode);
  const mode = ['remote', 'in_person'].includes(modeValue) ? modeValue : '';
  const page = pageNo(one(params.page));
  const filters = { q, specialty, city, mode };
  return { q, specialty, city, mode, page, filters, hasFilters: Boolean(q || specialty || city || mode) };
};

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const state = directoryState(await searchParams);
  return buildSeoMetadata({
    title: state.hasFilters ? 'نتائج دليل المختصين النفسيين' : state.page > 1 ? `دليل المختصين النفسيين — الصفحة ${state.page}` : 'دليل المختصين النفسيين',
    description: 'دليل المختصين الموثقين في منصة روافد: ابحث حسب الاسم والتخصص والمدينة ونمط الخدمة، واستعرض الملفات المهنية والبيانات العامة التي اجتازت التحقق.',
    path: pageHref(state.page, state.filters),
    index: !state.hasFilters,
    keywords: ['مختص نفسي', 'أخصائي نفسي', 'طبيب نفسي', 'معالج نفسي', 'دليل المختصين', 'منصة روافد'],
  });
}

export default async function SpecialistsDirectory({ searchParams }: { searchParams: SearchParams }) {
  const { q, specialty, city, mode, page, filters, hasFilters } = directoryState(await searchParams);

  const supabase = await createClient();
  let query = supabase
    .from('specialists')
    .select('id,slug,full_name,professional_title,bio,country,region,city,specialties,languages,years_experience,offers_remote,offers_in_person', { count: 'exact' })
    .eq('verification', 'verified')
    .eq('is_active', true)
    .order('full_name')
    .order('id')
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (q) query = query.or(`full_name.ilike.%${q}%,professional_title.ilike.%${q}%`);
  if (specialty) query = query.contains('specialties', [specialty]);
  if (city) query = query.ilike('city', `%${city}%`);
  if (mode === 'remote') query = query.eq('offers_remote', true);
  if (mode === 'in_person') query = query.eq('offers_in_person', true);
  const { data, count, error } = await query;
  const rows = (Array.isArray(data) ? data : []) as SpecialistRow[];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginationPage = Math.min(page, totalPages);

  return (
    <>
      <SiteHeader />
      <main className="directory-shell">
        <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">دليل المختصين</span></nav>
        <section className="directory-hero">
          <span className="eyebrow">دليل مهني موثق</span>
          <h1>دليل المختصين</h1>
          <p>ابحث في الملفات المهنية التي اجتازت مسار التوثيق، وقارن التخصص ونمط الخدمة والموقع قبل فتح الملف الكامل. لا تظهر بيانات الاتصال إلا وفق إعدادات الخصوصية المعتمدة لصاحب الملف.</p>
          <nav className="directory-local-nav" aria-label="مسارات الدليل المهني">
            <Link className="active" href="/specialists" aria-current="page">المختصون</Link>
            <Link href="/centers">المراكز</Link>
            <Link href="/search">البحث العام</Link>
            <Link href="/care-guides/">أدلة الرعاية</Link>
            <Link href="/join/specialist">الانضمام كمختص</Link>
          </nav>
        </section>

        <form className="directory-filters" method="get" aria-label="تصفية دليل المختصين">
          <label>الاسم أو المسمى<input name="q" defaultValue={q} placeholder="اسم المختص أو المسمى المهني" maxLength={120} /></label>
          <label>التخصص<input name="specialty" defaultValue={specialty} placeholder="مثال: العلاج النفسي" maxLength={120} /></label>
          <label>المدينة<input name="city" defaultValue={city} placeholder="المدينة" maxLength={120} /></label>
          <label>نمط الخدمة<select name="mode" defaultValue={mode}><option value="">الكل</option><option value="remote">عن بُعد</option><option value="in_person">حضوري</option></select></label>
          <button className="primary-action" type="submit">تطبيق الفلاتر</button>{hasFilters && <Link className="directory-clear" href="/specialists">مسح الفلاتر</Link>}
        </form>

        <section className="directory-results" aria-live="polite">
          <div className="directory-summary"><strong>{total.toLocaleString('ar')}</strong><span>{hasFilters ? 'مختص موثق مطابق للفلاتر' : 'مختص موثق متاح في الدليل'}</span></div>
          {error && <div className="search-state error"><h2>تعذر تحميل الدليل</h2><p>لم يتم عرض بيانات غير مؤكدة. حاول مرة أخرى لاحقًا.</p></div>}
          {!error && rows.length === 0 && <div className="search-state directory-empty"><h2>{total > 0 ? 'هذه الصفحة خارج نطاق النتائج' : 'لا توجد ملفات مطابقة حاليًا'}</h2><p>{total > 0 ? 'استخدم أرقام الصفحات للعودة إلى الملفات المتاحة.' : hasFilters ? 'جرّب توسيع الفلاتر أو مسحها لعرض جميع الملفات الموثقة.' : 'سيظهر المختصون هنا بعد اكتمال التوثيق وإتاحة الملف للنشر.'}</p>{hasFilters && total === 0 && <Link className="button" href="/specialists">عرض جميع المختصين</Link>}</div>}
          <div className="directory-grid">
            {rows.map((specialist) => <article className="directory-card" key={specialist.id}>
              <div className="directory-card-top"><div className="profile-placeholder" aria-hidden="true">{specialist.full_name.slice(0, 1)}</div><div><span className="verified-label">موثق</span><h2><Link href={`/specialists/${specialist.slug}`}>{specialist.full_name}</Link></h2>{specialist.professional_title && <p className="professional-title">{specialist.professional_title}</p>}</div></div>
              {specialist.bio && <p className="directory-bio">{specialist.bio.slice(0, 220)}{specialist.bio.length > 220 ? '…' : ''}</p>}
              {(specialist.specialties ?? []).length > 0 && <div className="directory-tags">{specialist.specialties.slice(0, 5).map((item) => <span key={item}>{item}</span>)}</div>}
              <div className="directory-meta">{(specialist.city || specialist.country) && <span>{[specialist.city, specialist.country].filter(Boolean).join('، ')}</span>}{specialist.years_experience !== null && <span>{specialist.years_experience.toLocaleString('ar')} سنوات خبرة</span>}{specialist.offers_remote && <span>عن بُعد</span>}{specialist.offers_in_person && <span>حضوري</span>}</div>
              <Link className="directory-open" href={`/specialists/${specialist.slug}`}>عرض الملف المهني ←</Link>
            </article>)}
          </div>
          {!error && total > PAGE_SIZE && <PublicPagination currentPage={paginationPage} totalPages={totalPages} hrefForPage={(targetPage) => pageHref(targetPage, filters)} ariaLabel="صفحات دليل المختصين" />}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
