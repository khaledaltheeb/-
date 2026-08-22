import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updatePassword } from './actions';

export const metadata: Metadata = {
  title: 'تعيين كلمة مرور جديدة',
  description: 'تعيين كلمة مرور جديدة لحسابك في منصة روافد بعد التحقق من رابط الاستعادة.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

type SearchParams = Promise<{ error?: string }>;

const errorMessages: Record<string, string> = {
  password_length: 'يجب أن تتكون كلمة المرور من 10 أحرف على الأقل.',
  password_mismatch: 'كلمتا المرور غير متطابقتين.',
  update_failed: 'تعذر تحديث كلمة المرور. اطلب رابط استعادة جديدًا إذا انتهت صلاحية الجلسة.',
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) redirect('/forgot-password?error=session_expired');
  const params = await searchParams;
  const message = params.error ? errorMessages[params.error] : null;

  return (
    <main className="auth-shell">
      <section className="auth-card auth-card-polished" aria-labelledby="reset-title">
        <Link href="/" className="brand auth-brand"><span className="brand-mark">ر</span><span><strong>منصة روافد</strong><small>معرفة · دعم · خدمات موثقة</small></span></Link>
        <span className="eyebrow">حماية الحساب</span>
        <h1 id="reset-title">تعيين كلمة مرور جديدة</h1>
        <p>استخدم كلمة مرور قوية وفريدة لا تستخدمها في خدمة أخرى.</p>
        {message && <div className="system-message error" role="alert">{message}</div>}
        <form className="auth-form" action={updatePassword}>
          <label htmlFor="password">كلمة المرور الجديدة</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
          <label htmlFor="confirm_password">تأكيد كلمة المرور</label>
          <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
          <button className="auth-primary" type="submit">حفظ كلمة المرور الجديدة</button>
        </form>
        <div className="auth-links"><Link href="/forgot-password">طلب رابط جديد</Link><Link href="/login">تسجيل الدخول</Link><Link href="/privacy">الخصوصية</Link></div>
      </section>
    </main>
  );
}
