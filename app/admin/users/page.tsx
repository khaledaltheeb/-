import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { assignSpecialistDirect, setUserAccess } from './actions';

export const dynamic = 'force-dynamic';
type SearchParams = Promise<{ role?: string; ok?: string; error?: string }>;

type ProfileRow = {
  id: string;
  display_name: string | null;
  phone: string | null;
  locale: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const ROLE_LABELS: Record<string, string> = {
  owner: 'المالك', admin: 'مدير', editor: 'محرر', scientific_reviewer: 'مراجع علمي', seo_manager: 'مدير SEO',
  specialist: 'مختص', center_manager: 'مدير مركز', user: 'مستخدم',
};

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const currentUserId = claimsData?.claims?.sub;
  if (!currentUserId) redirect('/login');
  const { data: currentProfile } = await supabase.from('profiles').select('role,is_active').eq('id', currentUserId).single();
  if (!currentProfile?.is_active || !['owner','admin'].includes(currentProfile.role)) redirect('/account');

  const params = await searchParams;
  const requestedRole = String(params.role ?? '');
  let query = supabase.from('profiles').select('id,display_name,phone,locale,role,is_active,created_at,updated_at').order('updated_at', { ascending: false }).limit(500);
  if (ROLE_LABELS[requestedRole]) query = query.eq('role', requestedRole);
  const { data, error } = await query;
  const rows: ProfileRow[] = Array.isArray(data) ? data as ProfileRow[] : [];

  const counts = new Map<string, number>();
  const { data: allRoles } = await supabase.from('profiles').select('role');
  for (const row of allRoles ?? []) counts.set(row.role, (counts.get(row.role) ?? 0) + 1);

  return (
    <main className="dashboard-shell users-admin-shell">
      <section className="dashboard-card users-admin-card">
        <div className="admin-heading">
          <div><span className="eyebrow">Identity & Access</span><h1>المستخدمون والصلاحيات</h1><p>يمكن إدارة الأدوار العامة من هنا. المالك وحده يستطيع كذلك اعتماد مستخدم مباشرةً كمختص موثق دون الحاجة إلى طلب انضمام مسبق.</p></div>
          <Link className="button" href="/admin">لوحة الإدارة</Link>
        </div>

        {params.ok === 'specialist-direct' && <p className="system-message success">تم تعيين المستخدم مباشرةً كمختص موثق وتفعيل بوابة المختص وإشعاره.</p>}
        {params.ok && params.ok !== 'specialist-direct' && <p className="system-message success">تم تحديث صلاحية المستخدم وتسجيل العملية.</p>}
        {params.error === 'owner-required' && <p className="system-message error">التعيين المباشر لمختص موثق متاح للمالك فقط.</p>}
        {params.error === 'direct-specialist-failed' && <p className="system-message error">تعذر التعيين المباشر. تأكد أن الحساب مستخدم عادي أو مختص، وليس مديرًا أو مالكًا أو مدير مركز.</p>}
        {((params.error && !['owner-required','direct-specialist-failed'].includes(params.error)) || error) && <p className="system-message error">تعذر تحميل أو تحديث المستخدمين.</p>}

        <nav className="verification-filters" aria-label="تصفية حسب الدور">
          <Link className={!requestedRole ? 'active' : ''} href="/admin/users">الكل <span>{allRoles?.length ?? 0}</span></Link>
          {Object.entries(ROLE_LABELS).map(([key,label]) => <Link className={requestedRole === key ? 'active' : ''} href={`/admin/users?role=${key}`} key={key}>{label}<span>{counts.get(key) ?? 0}</span></Link>)}
        </nav>

        <div className="user-list">
          {rows.map((user) => (
            <article className={`user-access-card ${user.id === currentUserId ? 'current-user' : ''}`} key={user.id}>
              <div className="user-access-copy">
                <div><span className="status-badge">{ROLE_LABELS[user.role] ?? user.role}</span>{user.id === currentUserId && <span className="self-label">حسابك الحالي</span>}</div>
                <h2>{user.display_name || 'مستخدم بدون اسم معروض'}</h2>
                <div className="review-facts"><span><strong>الحالة:</strong> {user.is_active ? 'نشط' : 'غير نشط'}</span><span><strong>اللغة:</strong> {user.locale}</span><span><strong>الهاتف:</strong> {user.phone || '—'}</span><span><strong>آخر تعديل:</strong> {new Intl.DateTimeFormat('ar',{dateStyle:'medium',timeStyle:'short'}).format(new Date(user.updated_at))}</span></div>
                <small dir="ltr" className="user-id">{user.id}</small>
              </div>
              <div className="user-access-controls-stack">
                <form action={setUserAccess} className="verification-controls user-access-controls">
                  <input type="hidden" name="user_id" value={user.id} />
                  <label>الدور<select name="role" defaultValue={user.role}>{Object.entries(ROLE_LABELS).map(([key,label]) => <option value={key} key={key}>{label}</option>)}</select></label>
                  <label className="check-field"><input name="is_active" type="checkbox" defaultChecked={user.is_active} /> الحساب نشط</label>
                  <button className="primary-action" type="submit">حفظ الصلاحية</button>
                </form>
                {currentProfile.role === 'owner' && user.id !== currentUserId && ['user','specialist'].includes(user.role) && (
                  <details className="direct-specialist-assignment">
                    <summary>{user.role === 'specialist' ? 'إعادة اعتماد المختص مباشرة' : 'تعيين كمختص موثّق مباشرة'}</summary>
                    <form action={assignSpecialistDirect} className="verification-controls direct-specialist-form">
                      <input type="hidden" name="user_id" value={user.id} />
                      <p>هذا المسار لا يحتاج طلبًا من المستخدم. إذا كان لديه طلب سابق فسيتم اعتماده مباشرة، وإن لم يكن لديه ملف فسيُنشأ له ملف مختص موثق ويستطيع إكماله من بوابة المختص.</p>
                      <label>المسمى المهني — اختياري<input name="professional_title" maxLength={240} placeholder="مثال: أخصائي نفسي سريري" /></label>
                      <label>التخصصات — اختياري<input name="specialties" maxLength={1800} placeholder="علم النفس السريري، التوحد، التربية الخاصة" /></label>
                      <label>رقم الترخيص / الاعتماد — اختياري<input name="license_number" maxLength={160} /></label>
                      <label>سنوات الخبرة — اختياري<input name="years_experience" type="number" min={0} max={80} /></label>
                      <button className="primary-action" type="submit">اعتماد وتعيين كمختص</button>
                    </form>
                  </details>
                )}
              </div>
            </article>
          ))}
          {!rows.length && <div className="search-state"><h2>لا يوجد مستخدمون في هذه الفئة</h2></div>}
        </div>
      </section>
    </main>
  );
}
