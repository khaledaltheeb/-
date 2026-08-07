import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'دليل المختصين',
  description: 'دليل المختصين الموثقين في منصة روافد مع البحث حسب الاسم والتخصص والمدينة ونمط تقديم الخدمة.',
};

type SearchParams = Promise<{ q?: string; specialty?: string; city?: string; mode?: string }>;
type SpecialistRow = {
  id: string;
  slug: string;
  full_name: string;
  professional_title: string | null;
  bio: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  specialties: string[];
  languages: string[];
  years_experience: number | null;
  offers_remote: boolean;
  offers_in_person: boolean;
};

export default async function SpecialistsDirectory({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = String(params.q ?? '').trim().slice(0, 120);
  const specialty = String(params.specialty ?? '').trim().slice(0, 120);
  const city = String(params.city ?? '').trim().slice(0, 120);
  const mode = ['remote', 'in_person'].includes(String(params.mode ?? '')) ? String(params.mode) : '';

  const supabase = await createClient();
  let query = supabase
    .from('specialists')
    .select('id,slug,full_name,professional_title,bio,country,region,city,specialties,languages,years_experience,offers_remote,offers_in_person')
    .eq('verification', 'verified')
    .eq('is_active', true)
    .order('full_name')
    .limit(100);

  if (q) query = query.or(`full_name.ilike.%${q.replace(/[%,]/g, '')}%,professional_title.ilike.%${q.replace(/[%,]/g, '')}%`);
  if (specialty) query = query.contains('specialties', [specialty]);
  if (city) query = query.ilike('city', `%${city.replace(/[%_]/g, '')}%`);
  if (mode === 'remote') query = query.eq('offers_remote', true);
  if (mode === 'in_person') query = query.eq('offers_in_person', true);

  const { data, error } = await query;
  const rows: SpecialistRow[] = Array.isArray(data) ? data as SpecialistRow[] : [];

  return (
    <main className="directory-shell">
      <header className="directory-header">
        <Link className="brand" href="/" aria-label="منصة روافد الرئيسية"><span className="brand-mark">ر</span><span><strong>روافد</strong><small>Rawafid</small></span></Link>
        <div className="dashboard-actions"><Link className="button" href="/centers">المراكز</Link><Link className="button" href="/search">البحث</Link></div>
      </header>

      <section className="directory-hero">
        <span className="eyebrow">Verified Directory</span>
        <h1>دليل المختصين</h1>
        <p>لا يظهر في الدليل العام إلا الملف النشط الذي اجتاز حالة التوثيق. بيانات التواصل الخاصة لا تُكشف من قاعدة البيانات إلا وفق إعدادات صاحب الملف.</p>
      </section>

      <form className="directory-filters" method="get">
        <label>الاسم أو المسمى<input name="q" defaultValue={q} placeholder="اسم المختص أو المسمى المهني" /></label>
        <label>التخصص<input name="specialty" defaultValue={specialty} placeholder="مثال: العلاج النفسي" /></label>
        <label>المدينة<input name="city" defaultValue={city} placeholder="المدينة" /></label>
        <label>نمط الخدمة<select name="mode" defaultValue={mode}><option value="">الكل</option><option value="remote">عن بُعد</option><option value="in_person">حضوري</option></select></label>
        <button className="primary-action" type="submit">تصفية</button>
        {(q || specialty || city || mode) && <Link href="/specialists">مسح</Link>}
      </form>

      <section className="directory-results" aria-live="polite">
        <div className="directory-summary"><strong>{rows.length}</strong><span>مختص موثق مطابق</span></div>
        {error && <div className="search-state error"><h2>تعذر تحميل الدليل</h2><p>لم يتم عرض بيانات غير مؤكدة.</p></div>}
        {!error && rows.length === 0 && <div className="search-state"><h2>لا توجد ملفات مطابقة حاليًا</h2><p>سيظهر المختصون هنا بعد اكتمال التوثيق وإتاحة الملف للنشر.</p></div>}
        <div className="directory-grid">
          {rows.map((specialist) => (
            <article className="directory-card" key={specialist.id}>
              <div className="directory-card-top"><div className="profile-placeholder" aria-hidden="true">{specialist.full_name.slice(0, 1)}</div><div><span className="verified-label">موثق</span><h2>{specialist.full_name}</h2>{specialist.professional_title && <p className="professional-title">{specialist.professional_title}</p>}</div></div>
              {specialist.bio && <p className="directory-bio">{specialist.bio.slice(0, 220)}{specialist.bio.length > 220 ? '…' : ''}</p>}
              <div className="directory-tags">{(specialist.specialties ?? []).slice(0, 5).map((item) => <span key={item}>{item}</span>)}</div>
              <div className="directory-meta">
                {(specialist.city || specialist.country) && <span>{[specialist.city, specialist.country].filter(Boolean).join('، ')}</span>}
                {specialist.years_experience !== null && <span>{specialist.years_experience} سنوات خبرة</span>}
                {specialist.offers_remote && <span>عن بُعد</span>}
                {specialist.offers_in_person && <span>حضوري</span>}
              </div>
              <Link className="directory-open" href={`/specialists/${specialist.slug}`}>عرض الملف</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
