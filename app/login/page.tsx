import type { Metadata } from 'next';
import Link from 'next/link';
import { login } from './actions';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  description: 'تسجيل الدخول إلى منصة روافد للوصول إلى الخدمات والملفات والمراسلات والمواعيد.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

type SearchParams = Promise<{ error?: string; status?: string; next?: string }>;
const errorMessages: Record<string, string> = {
  invalid_input: 'تحقق من البريد الإلكتروني وكلمة المرور ثم أعد المحاولة.',
  login_failed: 'تعذر تسجيل الدخول بهذه البيانات.',
  missing_auth_code: 'رابط التحقق غير مكتمل. اطلب رابطًا جديدًا.',
  auth_callback_failed: 'تعذر إكمال التحقق من الرابط. قد يكون منتهي الصلاحية.',
};
const statusMessages: Record<string, string> = {
  password_updated: 'تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
};
function safeNext(value?: string) {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/account';
}

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;
  const statusMessage = params.status ? statusMessages[params.status] : null;
  const next = safeNext(params.next);

  return (
    <main className="auth-shell">
      <section className="auth-card auth-card-polished" aria-labelledby="login-title">
        <Link href="/" className="brand auth-brand"><span className="brand-mark">ر</span><span><strong>منصة روافد</strong><small>Rawafid Platform</small></span></Link>
        <span className="eyebrow">حسابات منصة روافد</span>
        <h1 id="login-title">تسجيل الدخول</h1>
        <p>وصول آمن إلى حسابك، المراسلات، المواعيد والبوابات المهنية وفق صلاحيات الحساب.</p>
        {errorMessage && <div className="system-message error" role="alert">{errorMessage}</div>}
        {statusMessage && <div className="system-message success" role="status">{statusMessage}</div>}
        <form className="auth-form" action={login}>
          <input type="hidden" name="next" value={next} />
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} placeholder="name@example.com" />
          <div className="auth-password-label"><label htmlFor="password">كلمة المرور</label><Link href="/forgot-password">نسيت كلمة المرور؟</Link></div>
          <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} />
          <button className="auth-primary" type="submit">تسجيل الدخول</button>
        </form>
        <div className="auth-register-callout"><span>ليس لديك حساب؟</span><Link className="auth-secondary" href={`/register?next=${encodeURIComponent(next)}`}>إنشاء حساب جديد</Link></div>
        <small className="auth-note">إنشاء الحساب لا يمنح صلاحيات مهنية أو إدارية ولا يعني اعتماد الملف كمختص أو مركز.</small>
        <div className="auth-links"><Link href="/">الرئيسية</Link><Link href="/join">الانضمام المهني</Link><Link href="/specialists">دليل المختصين</Link><Link href="/centers">دليل المراكز</Link></div>
      </section>
    </main>
  );
}
