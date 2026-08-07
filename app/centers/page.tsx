import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'دليل المراكز',
  description: 'دليل المراكز الموثقة في منصة روافد مع البحث حسب الاسم والمدينة والمنطقة.',
};

type SearchParams = Promise<{ q?: string; city?: string; country?: string }>;
type CenterRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
};

export default async function CentersDirectory({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = String(params.q ?? '').trim().slice(0, 120);
  const city = String(params.city ?? '').trim().slice(0, 120);
  const country = String(params.country ?? '').trim().slice(0, 120);
  const supabase = await createClient();

  let query = supabase
    .from('centers')
    .select('id,slug,name,description,logo_url,country,region,city,address,phone,email,website_url')
    .eq('verification', 'verified')
    .eq('is_active', true)
    .order('name')
    .limit(100);
  if (q) query = query.ilike('name', `%${q.replace(/[%_]/g, '')}%`);
  if (city) query = query.ilike('city', `%${city.replace(/[%_]/g, '')}%`);
  if (country) query = query.ilike('country', `%${country.replace(/[%_]/g, '')}%`);

  const { data, error } = await query;
  const rows: CenterRow[] = Array.isArray(data) ? data as CenterRow[] : [];

  return (
    <main className="directory-shell">
      <header className="directory-header">
        <Link className="brand" href="/" aria-label="منصة روافد الرئيسية"><span className="brand-mark">ر</span><span><strong>روافد</strong><small>Rawafid</small></span></Link>
        <div className="dashboard-actions"><Link className="button" href="/specialists">المختصون</Link><Link className="button" href="/search">البحث</Link></div>
      </header>

      <section className="directory-hero">
        <span className="eyebrow">Verified Centers</span>
        <h1>دليل المراكز</h1>
        <p>المراكز الظاهرة هنا نشطة وموثقة، وتُعرض بياناتها العامة فقط ضمن نظام روافد.</p>
      </section>

      <form className="directory-filters centers-filters" method="get">
        <label>اسم المركز<input name="q" defaultValue={q} placeholder="اسم المركز" /></label>
        <label>المدينة<input name="city" defaultValue={city} placeholder="المدينة" /></label>
        <label>الدولة<input name="country" defaultValue={country} placeholder="الدولة" /></label>
        <button className="primary-action" type="submit">تصفية</button>
        {(q || city || country) && <Link href="/centers">مسح</Link>}
      </form>

      <section className="directory-results" aria-live="polite">
        <div className="directory-summary"><strong>{rows.length}</strong><span>مركز موثق مطابق</span></div>
        {error && <div className="search-state error"><h2>تعذر تحميل الدليل</h2><p>لم يتم عرض بيانات غير مؤكدة.</p></div>}
        {!error && rows.length === 0 && <div className="search-state"><h2>لا توجد مراكز مطابقة حاليًا</h2><p>ستظهر المراكز بعد اكتمال التوثيق وتفعيل الملف.</p></div>}
        <div className="directory-grid center-grid">
          {rows.map((center) => (
            <article className="directory-card" key={center.id}>
              <div className="directory-card-top"><div className="profile-placeholder center-placeholder" aria-hidden="true">{center.name.slice(0, 1)}</div><div><span className="verified-label">مركز موثق</span><h2>{center.name}</h2><p className="professional-title">{[center.city, center.country].filter(Boolean).join('، ')}</p></div></div>
              {center.description && <p className="directory-bio">{center.description.slice(0, 240)}{center.description.length > 240 ? '…' : ''}</p>}
              {center.address && <div className="directory-meta"><span>{center.address}</span></div>}
              <Link className="directory-open" href={`/centers/${center.slug}`}>عرض المركز</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
