import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = buildSeoMetadata({
  title: 'دليل المختصين النفسيين',
  description: 'دليل المختصين الموثقين في منصة روافد: ابحث حسب الاسم والتخصص والمدينة ونمط الخدمة، واستعرض الملفات المهنية والبيانات العامة التي اجتازت التحقق.',
  path: '/specialists', index: true,
  keywords: ['مختص نفسي', 'أخصائي نفسي', 'طبيب نفسي', 'معالج نفسي', 'دليل المختصين', 'منصة روافد'],
});

type SearchParams = Promise<{ q?: string; specialty?: string; city?: string; mode?: string }>;
type SpecialistRow = {
  id: string; slug: string; full_name: string; professional_title: string | null; bio: string | null;
  country: string | null; region: string | null; city: string | null; specialties: string[]; languages: string[];
  years_experience: number | null; offers_remote: boolean; offers_in_person: boolean;
};

export default async function SpecialistsDirectory({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = String(params.q ?? '').trim().slice(0, 120);
  const specialty = String(params.specialty ?? '').trim().slice(0, 120);
  const city = String(params.city ?? '').trim().slice(0, 120);
  const mode = ['remote', 'in_person'].includes(String(params.mode ?? '')) ? String(params.mode) : '';
  const hasFilters = Boolean(q || specialty || city || mode);

  const supabase = await createClient();
  let query = supabase.from('specialists').select('id,slug,full_name,professional_title,bio,country,region,city,specialties,languages,years_experience,offers_remote,offers_in_person').eq('verification', 'verified').eq('is_active', true).order('full_name').limit(100);
  if (q) query = query.or(`full_name.ilike.%${q.replace(/[%,]/g, '')}%,professional_title.ilike.%${q.replace(/[%,]/g, '')}%`);
  if (specialty) query = query.contains('specialties', [specialty]);
  if (city) query = query.ilike('city', `%${city.replace(/[%_]/g, '')}%`);
  if (mode === 'remote') query = query.eq('offers_remote', true);
  if (mode === 'in_person') query = query.eq('offers_in_person', true);
  const { data, error } = await query;
  const rows = (Array.isArray(data) ? data : []) as SpecialistRow[];

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
          <div className="directory-summary"><strong>{rows.length.toLocaleString('ar')}</strong><span>{hasFilters ? 'مختص موثق مطابق للفلاتر' : 'مختص موثق متاح في الدليل'}</span></div>
          {error && <div className="search-state error"><h2>تعذر تحميل الدليل</h2><p>لم يتم عرض بيانات غير مؤكدة. حاول مرة أخرى لاحقًا.</p></div>}
          {!error && rows.length === 0 && <div className="search-state directory-empty"><h2>لا توجد ملفات مطابقة حاليًا</h2><p>{hasFilters ? 'جرّب توسيع الفلاتر أو مسحها لعرض جميع الملفات الموثقة.' : 'سيظهر المختصون هنا بعد اكتمال التوثيق وإتاحة الملف للنشر.'}</p>{hasFilters && <Link className="button" href="/specialists">عرض جميع المختصين</Link>}</div>}
          <div className="directory-grid">
            {rows.map((specialist) => <article className="directory-card" key={specialist.id}>
              <div className="directory-card-top"><div className="profile-placeholder" aria-hidden="true">{specialist.full_name.slice(0, 1)}</div><div><span className="verified-label">موثق</span><h2><Link href={`/specialists/${specialist.slug}`}>{specialist.full_name}</Link></h2>{specialist.professional_title && <p className="professional-title">{specialist.professional_title}</p>}</div></div>
              {specialist.bio && <p className="directory-bio">{specialist.bio.slice(0, 220)}{specialist.bio.length > 220 ? '…' : ''}</p>}
              {(specialist.specialties ?? []).length > 0 && <div className="directory-tags">{specialist.specialties.slice(0, 5).map((item) => <span key={item}>{item}</span>)}</div>}
              <div className="directory-meta">{(specialist.city || specialist.country) && <span>{[specialist.city, specialist.country].filter(Boolean).join('، ')}</span>}{specialist.years_experience !== null && <span>{specialist.years_experience.toLocaleString('ar')} سنوات خبرة</span>}{specialist.offers_remote && <span>عن بُعد</span>}{specialist.offers_in_person && <span>حضوري</span>}</div>
              <Link className="directory-open" href={`/specialists/${specialist.slug}`}>عرض الملف المهني ←</Link>
            </article>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
