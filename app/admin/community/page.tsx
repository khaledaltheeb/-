import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createCommunityMember, setCommunityStatus } from './actions';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<{ status?: string; ok?: string; error?: string }>;
type CommunityRow = {
  id: string; user_id: string | null; slug: string; member_type: 'trainee'|'volunteer'; full_name: string;
  headline: string | null; bio: string | null; country: string | null; region: string | null; city: string | null;
  training_institution: string | null; supervisor_name: string | null; organization: string | null;
  skills: string[]; interests: string[]; availability: string | null; verification: string; is_active: boolean; updated_at: string;
};

const statusOptions = ['unverified','pending','verified','rejected','suspended'];
const statusAr: Record<string,string> = { unverified:'غير موثق', pending:'بانتظار المراجعة', verified:'معتمد', rejected:'مرفوض', suspended:'معلق' };
const typeAr = { trainee:'متدرب', volunteer:'متطوع' } as const;

export default async function AdminCommunityPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner','admin'].includes(profile.role)) redirect('/account');

  const filter = statusOptions.includes(String(params.status)) ? String(params.status) : '';
  let query = supabase.from('community_profiles').select('*').order('updated_at', { ascending: false }).limit(300);
  if (filter) query = query.eq('verification', filter);
  const { data, error } = await query;
  const rows = (Array.isArray(data) ? data : []) as CommunityRow[];

  const counts = Object.fromEntries(statusOptions.map((status) => [status, rows.filter((row) => row.verification === status).length]));

  return (
    <main className="dashboard-shell">
      <section className="dashboard-card specialist-admin-card">
        <div className="admin-heading"><div><span className="eyebrow">Community Governance</span><h1>إدارة المتدربين والمتطوعين</h1><p>إضافة ملفات، مراجعتها واعتمادها أو تعليقها. هذه الملفات مستقلة تمامًا عن دليل المختصين المرخصين.</p></div><div className="dashboard-actions"><Link className="button" href="/admin">لوحة المدير</Link><Link className="button" href="/community">الدليل العام</Link></div></div>

        {params.ok && <div className="system-message success">تم تنفيذ العملية بنجاح.</div>}
        {params.error && <div className="system-message error">تعذر تنفيذ العملية ({params.error}).</div>}
        {error && <div className="system-message error">تعذر تحميل ملفات المجتمع.</div>}

        <section className="portal-section admin-create-section">
          <div className="section-mini-heading"><div><span className="eyebrow">إضافة مباشرة من المدير</span><h2>إضافة متدرب أو متطوع</h2></div><span>يُنشأ الملف بحالة Pending حتى يراجعه المدير ويعتمده صراحةً.</span></div>
          <form className="admin-form" action={createCommunityMember}>
            <div className="admin-form-grid">
              <label>الصفة<select name="member_type" defaultValue="trainee"><option value="trainee">متدرب</option><option value="volunteer">متطوع</option></select></label>
              <label>الاسم<input name="full_name" required maxLength={200} /></label>
              <label>Slug<input name="slug" required maxLength={140} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" dir="ltr" /></label>
              <label>معرّف حساب مرتبط - اختياري<input name="user_id" maxLength={60} dir="ltr" placeholder="UUID" /></label>
              <label>الوصف المختصر<input name="headline" maxLength={220} /></label>
              <label>الدولة<input name="country" maxLength={120} /></label>
              <label>المنطقة<input name="region" maxLength={120} /></label>
              <label>المدينة<input name="city" maxLength={120} /></label>
              <label>جهة التدريب<input name="training_institution" maxLength={240} /></label>
              <label>المشرف<input name="supervisor_name" maxLength={200} /></label>
              <label>الجهة/المبادرة<input name="organization" maxLength={240} /></label>
              <label>التوفر<input name="availability" maxLength={300} /></label>
              <label className="wide-field">المهارات<input name="skills" maxLength={1200} placeholder="افصل بفاصلة" /></label>
              <label className="wide-field">مجالات الاهتمام<input name="interests" maxLength={1200} placeholder="افصل بفاصلة" /></label>
              <label className="wide-field">نبذة<textarea name="bio" maxLength={3000} rows={5} /></label>
            </div>
            <button className="primary-action" type="submit">إضافة الملف للمراجعة</button>
          </form>
        </section>

        <nav className="verification-filters" aria-label="تصفية حالة الملفات">
          <Link className={!filter ? 'active' : ''} href="/admin/community">الكل <span>{rows.length}</span></Link>
          {statusOptions.map((status) => <Link className={filter === status ? 'active' : ''} href={`/admin/community?status=${status}`} key={status}>{statusAr[status]} <span>{counts[status] ?? 0}</span></Link>)}
        </nav>

        <section className="verification-list">
          {rows.length === 0 && <div className="empty-state">لا توجد ملفات مطابقة.</div>}
          {rows.map((member) => (
            <article className="verification-card" key={member.id}>
              <div className="verification-main">
                <div className="verification-title"><div><span className={`community-badge ${member.member_type}`}>{typeAr[member.member_type]}</span><h2>{member.full_name}</h2><p>{member.headline || [member.city,member.country].filter(Boolean).join('، ') || 'لا يوجد وصف مختصر'}</p></div>{member.verification === 'verified' && <Link href={`/community/${member.slug}`}>معاينة عامة</Link>}</div>
                <div className="review-facts"><span>{statusAr[member.verification] || member.verification}</span>{member.training_institution && <span>التدريب: {member.training_institution}</span>}{member.supervisor_name && <span>المشرف: {member.supervisor_name}</span>}{member.organization && <span>{member.organization}</span>}</div>
                {member.bio && <p className="review-bio">{member.bio}</p>}
                <details className="review-details"><summary>بيانات المراجعة</summary><div className="review-details-grid">
                  <div><strong>Slug</strong><span dir="ltr">{member.slug}</span></div><div><strong>User ID</strong><span dir="ltr">{member.user_id || 'غير مرتبط'}</span></div>
                  <div><strong>الموقع</strong><span>{[member.city,member.region,member.country].filter(Boolean).join('، ') || '—'}</span></div><div><strong>التوفر</strong><span>{member.availability || '—'}</span></div>
                  <div className="review-wide"><strong>المهارات</strong><span>{(member.skills || []).join('، ') || '—'}</span></div><div className="review-wide"><strong>الاهتمامات</strong><span>{(member.interests || []).join('، ') || '—'}</span></div>
                </div></details>
              </div>
              <form className="verification-controls" action={setCommunityStatus}>
                <input type="hidden" name="id" value={member.id} /><input type="hidden" name="slug" value={member.slug} />
                <label>حالة الاعتماد<select name="status" defaultValue={member.verification}>{statusOptions.map((status) => <option key={status} value={status}>{statusAr[status]}</option>)}</select></label>
                <label className="check-field"><input type="checkbox" name="is_active" defaultChecked={member.is_active} /> نشط</label>
                <button className="primary-action" type="submit">حفظ الحالة</button>
              </form>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
