import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateMyProfile } from './actions';

export const dynamic = 'force-dynamic';
type SearchParams = Promise<{ ok?: string; error?: string }>;

const ROLE_LABELS: Record<string, string> = {
  owner: 'المالك', admin: 'مدير', editor: 'محرر', scientific_reviewer: 'مراجع علمي', seo_manager: 'مدير SEO',
  specialist: 'مختص', center_manager: 'مدير مركز', user: 'مستخدم',
};

export default async function AccountPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('display_name,phone,locale,role,is_active,created_at,updated_at').eq('id', userId).single();
  if (!profile) redirect('/login');
  const params = await searchParams;

  return (
    <main className="dashboard-shell account-shell">
      <section className="dashboard-card account-card">
        <div className="admin-heading">
          <div>
            <span className="eyebrow">حسابي</span>
            <h1>{profile.display_name || 'حساب روافد'}</h1>
            <p>إعدادات الحساب الأساسية. لا يمكن تغيير الدور أو التفعيل من هذه الشاشة.</p>
          </div>
          <form action="/auth/signout" method="post"><button className="button" type="submit">تسجيل الخروج</button></form>
        </div>

        {params.ok && <p className="system-message success">تم حفظ بيانات الحساب.</p>}
        {params.error && <p className="system-message error">تعذر حفظ البيانات. لم يتم تغيير الصلاحيات.</p>}

        <div className="account-overview">
          <article><span>الدور</span><strong>{ROLE_LABELS[profile.role] ?? profile.role}</strong></article>
          <article><span>الحالة</span><strong>{profile.is_active ? 'نشط' : 'غير نشط'}</strong></article>
          <article><span>اللغة</span><strong>{profile.locale === 'en' ? 'English' : 'العربية'}</strong></article>
          <article><span>معرّف الحساب</span><strong dir="ltr" className="account-id">{userId}</strong></article>
        </div>

        <section className="account-section">
          <div className="section-mini-heading"><h2>الملف الأساسي</h2><span>حقول آمنة للتحديث الذاتي</span></div>
          <form action={updateMyProfile} className="account-form">
            <label>الاسم المعروض<input name="display_name" maxLength={160} defaultValue={profile.display_name ?? ''} /></label>
            <label>الهاتف<input name="phone" maxLength={80} dir="ltr" defaultValue={profile.phone ?? ''} /></label>
            <label>لغة الواجهة<select name="locale" defaultValue={profile.locale ?? 'ar'}><option value="ar">العربية</option><option value="en">English</option></select></label>
            <button className="primary-action" type="submit">حفظ الإعدادات</button>
          </form>
        </section>

        <section className="account-section">
          <div className="section-mini-heading"><h2>مساحات العمل</h2><span>حسب صلاحية الحساب</span></div>
          <div className="account-links">
            {(profile.role === 'owner' || profile.role === 'admin') && <Link href="/admin"><strong>لوحة الإدارة</strong><span>المحتوى، القطاعات، المختصون، المراكز والصلاحيات.</span></Link>}
            {profile.role === 'specialist' && <Link href="/specialist"><strong>بوابة المختص</strong><span>الملف المهني، التوثيق، المحتوى، الرسائل والمواعيد.</span></Link>}
            {profile.role === 'center_manager' && <Link href="/center"><strong>بوابة المركز</strong><span>بيانات المركز والفريق والخدمات والظهور العام.</span></Link>}
            <Link href="/search"><strong>البحث</strong><span>البحث في المحتوى والقطاعات والمختصين والمراكز.</span></Link>
          </div>
        </section>
      </section>
    </main>
  );
}
