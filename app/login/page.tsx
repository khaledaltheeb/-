import type { Metadata } from 'next';
import Link from 'next/link';
import { login, signup } from './actions';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
  description: 'تسجيل الدخول أو إنشاء حساب في منصة روافد للوصول إلى الخدمات والملفات والمراسلات والمواعيد.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

type SearchParams = Promise<{ error?: string; status?: string }>;

const errorMessages: Record<string, string> = {
  invalid_input: 'تحقق من البريد الإلكتروني وكلمة المرور ثم أعد المحاولة.',
  login_failed: 'تعذر تسجيل الدخول بهذه البيانات.',
  signup_failed: 'تعذر إنشاء الحساب حاليًا. حاول مرة أخرى لاحقًا.',
  missing_auth_code: 'رابط التحقق غير مكتمل. اطلب رابطًا جديدًا.',
  auth_callback_failed: 'تعذر إكمال التحقق من الرابط. قد يكون منتهي الصلاحية.',
};

const statusMessages: Record<string, string> = {
  check_email: 'تم استلام طلب إنشاء الحساب. تحقق من بريدك الإلكتروني لإكمال التفعيل.',
  password_updated: 'تم تحديث كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.',
};

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const errorMessage = params.error ? errorMessages[params.error] : null;
  const statusMessage = params.status ? statusMessages[params.status] : null;

  return (
    <main className="auth-shell">
      <section className="auth-card auth-card-polished" aria-labelledby="login-title">
        <Link href="/" className="brand auth-brand"><span className="brand-mark">ر</span><span><strong>منصة روافد</strong><small>Rawafid Platform</small></span></Link>
        <span className="eyebrow">حسابات منصة روافد</span>
        <h1 id="login-title">تسجيل الدخول أو إنشاء حساب</h1>
        <p>وصول آمن إلى حسابك، المراسلات، المواعيد والبوابات المهنية وفق صلاحيات الحساب.</p>

        {errorMessage && <div className="system-message error" role="alert">{errorMessage}</div>}
        {statusMessage && <div className="system-message success" role="status">{statusMessage}</div>}

        <form className="auth-form">
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} placeholder="name@example.com" />
          <div className="auth-password-label"><label htmlFor="password">كلمة المرور</label><Link href="/forgot-password">نسيت كلمة المرور؟</Link></div>
          <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} />
          <button className="auth-primary" formAction={login}>تسجيل الدخول</button>
          <button className="auth-secondary" formAction={signup}>إنشاء حساب جديد</button>
        </form>
        <small className="auth-note">إنشاء الحساب لا يمنح صلاحيات مهنية أو إدارية ولا يعني اعتماد الملف كمختص أو مركز.</small>
        <div className="auth-links"><Link href="/">الرئيسية</Link><Link href="/specialists">دليل المختصين</Link><Link href="/centers">دليل المراكز</Link></div>
      </section>
    </main>
  );
}
