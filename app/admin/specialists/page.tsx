import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createSpecialist, setSpecialistStatus } from './actions';

export const dynamic = 'force-dynamic';
type SearchParams = Promise<{ status?: string; ok?: string; error?: string }>;

type SpecialistRow = {
  id: string; user_id: string | null; slug: string; full_name: string; professional_title: string | null; bio: string | null;
  email: string | null; phone: string | null; website_url: string | null; country: string | null; region: string | null; city: string | null;
  languages: string[]; specialties: string[]; qualifications: unknown; license_number: string | null; years_experience: number | null;
  verification: string; verification_note: string | null; verified_at: string | null; is_active: boolean; created_at: string; updated_at: string;
};

const STATUS_LABELS: Record<string, string> = { unverified: 'غير موثق', pending: 'قيد المراجعة', verified: 'موثق', rejected: 'يحتاج تصحيحًا', suspended: 'موقوف' };
function qualifications(value: unknown) { if (!Array.isArray(value)) return []; return value.slice(0, 20).map((item) => typeof item === 'string' ? item : JSON.stringify(item)); }
function date(value:string){return new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}

export default async function AdminSpecialistsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims(); const userId = claimsData?.claims?.sub; if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single(); if (!profile?.is_active || !['owner','admin'].includes(profile.role)) redirect('/account');

  const params = await searchParams; const requestedStatus = String(params.status ?? '');
  const { data, error } = await supabase.rpc('admin_specialist_queue_v2', { p_limit: 500 });
  const allRows: SpecialistRow[] = Array.isArray(data) ? data as SpecialistRow[] : [];
  const rows = STATUS_LABELS[requestedStatus] ? allRows.filter((row) => row.verification === requestedStatus) : allRows;
  const counts = new Map<string, number>(); for (const row of allRows) counts.set(row.verification, (counts.get(row.verification) ?? 0) + 1);

  return <main className="dashboard-shell specialist-admin-shell"><section className="dashboard-card specialist-admin-card">
    <div className="admin-heading"><div><span className="eyebrow">Verification Control</span><h1>إدارة المختصين وطلبات الانضمام</h1><p>مراجعة الطلبات الذاتية والملفات المهنية، ثم الاعتماد أو الإعادة للتصحيح مع ملاحظة تصل لصاحب الطلب. الاعتماد يفعّل دور «مختص» تلقائيًا للحساب المرتبط.</p></div><div className="dashboard-actions"><Link className="button" href="/admin">لوحة الإدارة</Link><Link className="button" href="/specialists">الدليل العام</Link><Link className="button" href="/join/specialist">صفحة التقديم</Link></div></div>
    {params.ok === 'created' && <p className="system-message success">تمت إضافة المختص بحالة «قيد المراجعة».</p>}{params.ok === 'updated' && <p className="system-message success">تم حفظ القرار وإشعار صاحب الملف المرتبط.</p>}{params.error === 'note-required' && <p className="system-message error">اكتب ملاحظة واضحة قبل رفض الطلب أو إيقافه.</p>}{((params.error && params.error !== 'note-required') || error) && <p className="system-message error">تعذر تنفيذ العملية. تحقق من البيانات وعدم تكرار الرابط أو الحساب المرتبط.</p>}

    <section className="portal-section admin-create-section"><div className="section-mini-heading"><div><span className="eyebrow">Admin Create</span><h2>إضافة مختص يدويًا</h2></div><span>للحالات التي تنشئها الإدارة مباشرة. أما المتقدمون فيستخدمون صفحة الانضمام.</span></div><form className="admin-form" action={createSpecialist}><div className="admin-form-grid">
      <label>الاسم الكامل<input name="full_name" required minLength={3} maxLength={200} /></label><label>Slug بالإنجليزية<input name="slug" required maxLength={140} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" /></label><label>المسمى المهني<input name="professional_title" maxLength={220} /></label><label>حساب مرتبط - اختياري<input name="user_id" maxLength={60} dir="ltr" placeholder="UUID" /></label><label>رقم الترخيص<input name="license_number" maxLength={180} /></label><label>سنوات الخبرة<input name="years_experience" type="number" min={0} max={80} /></label><label>الدولة<input name="country" maxLength={120} /></label><label>المنطقة<input name="region" maxLength={120} /></label><label>المدينة<input name="city" maxLength={120} /></label><label>البريد<input name="email" type="email" maxLength={254} /></label><label>الهاتف<input name="phone" maxLength={60} /></label><label>الموقع الإلكتروني<input name="website_url" type="url" maxLength={500} dir="ltr" /></label><label className="wide-field">التخصصات<input name="specialties" maxLength={1800} placeholder="افصل بفاصلة" /></label><label className="wide-field">المؤهلات<input name="qualifications" maxLength={1800} placeholder="افصل بفاصلة" /></label><label className="wide-field">اللغات<input name="languages" maxLength={1800} placeholder="العربية، الإنجليزية" /></label><label className="wide-field">نبذة<textarea name="bio" maxLength={5000} rows={5} /></label><label className="check-field"><input type="checkbox" name="offers_in_person" defaultChecked /> يقدم خدمة حضورية</label><label className="check-field"><input type="checkbox" name="offers_remote" /> يقدم خدمة عن بُعد</label>
    </div><button className="primary-action" type="submit">إضافة المختص للمراجعة</button></form></section>

    <nav className="verification-filters" aria-label="حالة التوثيق"><Link className={!requestedStatus ? 'active' : ''} href="/admin/specialists">الكل <span>{allRows.length}</span></Link>{Object.entries(STATUS_LABELS).map(([key,label]) => <Link className={requestedStatus === key ? 'active' : ''} href={`/admin/specialists?status=${key}`} key={key}>{label} <span>{counts.get(key) ?? 0}</span></Link>)}</nav>

    <div className="verification-list">{rows.map((specialist) => <article className="verification-card" key={specialist.id}><div className="verification-main">
      <div className="verification-title"><div><div className="join-inline-actions"><span className={`status-badge status-${specialist.verification}`}>{STATUS_LABELS[specialist.verification] ?? specialist.verification}</span>{specialist.user_id&&<span className="application-source">طلب ذاتي مرتبط بحساب</span>}</div><h2>{specialist.full_name}</h2><p>{specialist.professional_title || 'لا يوجد مسمى مهني'}</p></div>{specialist.verification === 'verified' && <Link href={`/specialists/${specialist.slug}`}>معاينة الملف العام</Link>}</div>
      <div className="review-facts"><span><strong>الموقع:</strong> {[specialist.city,specialist.region,specialist.country].filter(Boolean).join('، ') || '—'}</span><span><strong>الخبرة:</strong> {specialist.years_experience ?? '—'}</span><span><strong>الترخيص:</strong> {specialist.license_number || '—'}</span><span><strong>تاريخ الطلب:</strong> {date(specialist.created_at)}</span><span><strong>آخر تعديل:</strong> {date(specialist.updated_at)}</span></div>
      <div className="directory-tags">{(specialist.specialties ?? []).map((item) => <span key={item}>{item}</span>)}</div>{specialist.bio && <p className="review-bio">{specialist.bio}</p>}{specialist.verification_note&&<div className="review-note"><strong>آخر ملاحظة مراجعة</strong><p>{specialist.verification_note}</p></div>}
      <details className="review-details"><summary>البيانات الكاملة للمراجعة</summary><div className="review-details-grid"><div><strong>البريد</strong><span>{specialist.email || '—'}</span></div><div><strong>الهاتف</strong><span>{specialist.phone || '—'}</span></div><div><strong>الموقع الإلكتروني</strong><span dir="ltr">{specialist.website_url || '—'}</span></div><div><strong>اللغات</strong><span>{(specialist.languages ?? []).join('، ') || '—'}</span></div><div><strong>الحساب المرتبط</strong><span dir="ltr">{specialist.user_id || 'غير مرتبط'}</span></div><div className="review-wide"><strong>المؤهلات</strong><ul>{qualifications(specialist.qualifications).map((item) => <li key={item}>{item}</li>)}</ul></div></div></details>
    </div><form action={setSpecialistStatus} className="verification-controls"><input type="hidden" name="id" value={specialist.id} /><input type="hidden" name="slug" value={specialist.slug} /><label>القرار<select name="status" defaultValue={specialist.verification}>{Object.entries(STATUS_LABELS).map(([key,label]) => <option value={key} key={key}>{label}</option>)}</select></label><label className="verification-note-field">ملاحظة للمتقدم<textarea name="verification_note" maxLength={2000} rows={4} defaultValue={specialist.verification_note??''} placeholder="سبب الرفض أو المطلوب تصحيحه، أو ملاحظة الاعتماد..."/></label><label className="check-field"><input type="checkbox" name="is_active" defaultChecked={specialist.is_active} /> الحساب المهني نشط</label><button className="primary-action" type="submit">حفظ القرار وإشعار المتقدم</button></form>
    </article>)}{!rows.length && <div className="search-state"><h2>لا توجد ملفات في هذه الحالة</h2><p>ستظهر طلبات الانضمام هنا تلقائيًا.</p></div>}</div>
  </section></main>;
}
