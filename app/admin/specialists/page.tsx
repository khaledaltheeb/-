import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { setSpecialistStatus } from './actions';

export const dynamic = 'force-dynamic';
type SearchParams = Promise<{ status?: string; ok?: string; error?: string }>;

type SpecialistRow = {
  id: string;
  user_id: string | null;
  slug: string;
  full_name: string;
  professional_title: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  website_url: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  languages: string[];
  specialties: string[];
  qualifications: unknown;
  license_number: string | null;
  years_experience: number | null;
  verification: string;
  verified_at: string | null;
  is_active: boolean;
  updated_at: string;
};

const STATUS_LABELS: Record<string, string> = {
  unverified: 'غير موثق', pending: 'قيد المراجعة', verified: 'موثق', rejected: 'يحتاج تصحيحًا', suspended: 'موقوف',
};

function qualifications(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).map((item) => typeof item === 'string' ? item : JSON.stringify(item));
}

export default async function AdminSpecialistsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner','admin'].includes(profile.role)) redirect('/account');

  const params = await searchParams;
  const requestedStatus = String(params.status ?? '');
  const { data, error } = await supabase.rpc('admin_specialist_queue', { p_limit: 500 });
  const allRows: SpecialistRow[] = Array.isArray(data) ? data as SpecialistRow[] : [];
  const rows = STATUS_LABELS[requestedStatus] ? allRows.filter((row) => row.verification === requestedStatus) : allRows;
  const counts = new Map<string, number>();
  for (const row of allRows) counts.set(row.verification, (counts.get(row.verification) ?? 0) + 1);

  return (
    <main className="dashboard-shell specialist-admin-shell">
      <section className="dashboard-card specialist-admin-card">
        <div className="admin-heading">
          <div><span className="eyebrow">Verification Control</span><h1>إدارة المختصين</h1><p>مراجعة البيانات المهنية وتغيير حالة التوثيق والتفعيل. كل تغيير يُسجل في Audit Log.</p></div>
          <div className="dashboard-actions"><Link className="button" href="/admin">لوحة الإدارة</Link><Link className="button" href="/specialists">الدليل العام</Link></div>
        </div>

        {params.ok && <p className="system-message success">تم تحديث حالة المختص وتسجيل العملية.</p>}
        {(params.error || error) && <p className="system-message error">تعذر تحميل أو تحديث قائمة المختصين.</p>}

        <nav className="verification-filters" aria-label="حالة التوثيق">
          <Link className={!requestedStatus ? 'active' : ''} href="/admin/specialists">الكل <span>{allRows.length}</span></Link>
          {Object.entries(STATUS_LABELS).map(([key,label]) => <Link className={requestedStatus === key ? 'active' : ''} href={`/admin/specialists?status=${key}`} key={key}>{label} <span>{counts.get(key) ?? 0}</span></Link>)}
        </nav>

        <div className="verification-list">
          {rows.map((specialist) => (
            <article className="verification-card" key={specialist.id}>
              <div className="verification-main">
                <div className="verification-title"><div><span className={`status-badge status-${specialist.verification}`}>{STATUS_LABELS[specialist.verification] ?? specialist.verification}</span><h2>{specialist.full_name}</h2><p>{specialist.professional_title || 'لا يوجد مسمى مهني'}</p></div><Link href={`/specialists/${specialist.slug}`}>معاينة الملف العام</Link></div>
                <div className="review-facts">
                  <span><strong>الموقع:</strong> {[specialist.city,specialist.region,specialist.country].filter(Boolean).join('، ') || '—'}</span>
                  <span><strong>الخبرة:</strong> {specialist.years_experience ?? '—'}</span>
                  <span><strong>الترخيص:</strong> {specialist.license_number || '—'}</span>
                  <span><strong>آخر تعديل:</strong> {new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(specialist.updated_at))}</span>
                </div>
                <div className="directory-tags">{(specialist.specialties ?? []).map((item) => <span key={item}>{item}</span>)}</div>
                {specialist.bio && <p className="review-bio">{specialist.bio}</p>}
                <details className="review-details"><summary>البيانات الكاملة للمراجعة</summary><div className="review-details-grid"><div><strong>البريد</strong><span>{specialist.email || '—'}</span></div><div><strong>الهاتف</strong><span>{specialist.phone || '—'}</span></div><div><strong>الموقع الإلكتروني</strong><span dir="ltr">{specialist.website_url || '—'}</span></div><div><strong>اللغات</strong><span>{(specialist.languages ?? []).join('، ') || '—'}</span></div><div className="review-wide"><strong>المؤهلات</strong><ul>{qualifications(specialist.qualifications).map((item) => <li key={item}>{item}</li>)}</ul></div></div></details>
              </div>
              <form action={setSpecialistStatus} className="verification-controls">
                <input type="hidden" name="id" value={specialist.id} />
                <input type="hidden" name="slug" value={specialist.slug} />
                <label>الحالة<select name="status" defaultValue={specialist.verification}>{Object.entries(STATUS_LABELS).map(([key,label]) => <option value={key} key={key}>{label}</option>)}</select></label>
                <label className="check-field"><input type="checkbox" name="is_active" defaultChecked={specialist.is_active} /> الحساب المهني نشط</label>
                <button className="primary-action" type="submit">حفظ القرار</button>
              </form>
            </article>
          ))}
          {!rows.length && <div className="search-state"><h2>لا توجد ملفات في هذه الحالة</h2><p>ستظهر طلبات التوثيق هنا تلقائيًا.</p></div>}
        </div>
      </section>
    </main>
  );
}
