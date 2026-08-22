import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { MfaSettings } from '@/components/mfa-settings';
import { createClient } from '@/lib/supabase/server';
import { changePassword } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'أمان الحساب', robots: { index: false, follow: false, noarchive: true, nosnippet: true } };
type SearchParams = Promise<{ ok?: string; error?: string }>;
const errors: Record<string, string> = {
  current_password: 'كلمة المرور الحالية غير صحيحة.',
  password_length: 'يجب أن تتكون كلمة المرور الجديدة من 10 أحرف على الأقل.',
  password_mismatch: 'كلمتا المرور الجديدتان غير متطابقتين.',
  password_reuse: 'اختر كلمة مرور جديدة مختلفة عن كلمة المرور الحالية.',
  update_failed: 'تعذر تحديث كلمة المرور. يمكنك استخدام مسار الاستعادة عبر البريد إذا استمرت المشكلة.',
};

export default async function AccountSecurityPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect('/login?next=/account/security');
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!assurance.error && assurance.data.nextLevel === 'aal2' && assurance.data.currentLevel !== 'aal2') redirect('/mfa?next=%2Faccount%2Fsecurity');
  const params = await searchParams;
  return (
    <><SiteHeader/><main className="dashboard-shell account-shell"><nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/account">حسابي</Link><span>/</span><span aria-current="page">أمان الحساب</span></nav><nav className="account-local-nav" aria-label="خدمات الحساب"><Link href="/account">حسابي</Link><Link href="/messages">الرسائل</Link><Link href="/appointments">المواعيد</Link><Link href="/notifications">الإشعارات</Link><Link className="active" href="/account/security" aria-current="page">أمان الحساب</Link></nav><section className="dashboard-card account-card">
      <div className="admin-heading"><div><span className="eyebrow">أمان الحساب</span><h1>كلمة المرور والتحقق بخطوتين</h1><p>أدر كلمة المرور وأضف تطبيق مصادقة لحماية الوصول إلى بيانات الحساب والمسارات الحساسة.</p></div><div className="dashboard-actions"><Link className="button" href="/account">حسابي</Link><Link className="button" href="/forgot-password">استعادة عبر البريد</Link></div></div>
      {params.ok === 'password_updated' && <div className="system-message success" role="status">تم تحديث كلمة المرور بنجاح.</div>}
      {params.error && errors[params.error] && <div className="system-message error" role="alert">{errors[params.error]}</div>}
      <section className="account-section"><div className="section-mini-heading"><h2>تغيير كلمة المرور</h2><span>يتطلب التحقق من كلمة المرور الحالية</span></div>
        <form className="auth-form account-security-form" action={changePassword}>
          <label htmlFor="current_password">كلمة المرور الحالية</label><input id="current_password" name="current_password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} />
          <label htmlFor="new_password">كلمة المرور الجديدة</label><input id="new_password" name="new_password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
          <label htmlFor="confirm_password">تأكيد كلمة المرور الجديدة</label><input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
          <button className="primary-action" type="submit">تحديث كلمة المرور</button>
        </form>
      </section>
      <MfaSettings />
      <section className="account-section"><div className="section-mini-heading"><h2>فقدان الوصول</h2><span>مسار مستقل لا يكشف وجود الحساب</span></div><p>إذا نسيت كلمة المرور، استخدم صفحة الاستعادة. ترسل منصة روافد رابطًا محدود الصلاحية إلى البريد المرتبط بالحساب.</p><Link className="button" href="/forgot-password">نسيت كلمة المرور؟</Link></section>
    </section></main><SiteFooter/></>
  );
}
