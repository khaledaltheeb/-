import type { Metadata } from 'next';
import Link from 'next/link';
import { requestPasswordReset } from './actions';

export const metadata: Metadata = {
  title: 'نسيت كلمة المرور',
  description: 'استعادة الوصول إلى حسابك في منصة روافد عبر رابط آمن يُرسل إلى بريدك الإلكتروني.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

type SearchParams = Promise<{ status?: string; error?: string }>;

export default async function ForgotPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const sent = params.status === 'sent';
  const invalid = params.error === 'invalid_email';

  return (
    <main className="auth-shell">
      <section className="auth-card auth-card-polished" aria-labelledby="forgot-title">
        <Link href="/" className="brand auth-brand"><span className="brand-mark">ر</span><span><strong>منصة روافد</strong><small>Rawafid Platform</small></span></Link>
        <span className="eyebrow">استعادة الحساب</span>
        <h1 id="forgot-title">نسيت كلمة المرور؟</h1>
        <p>أدخل بريد الحساب. إذا كان البريد مسجلًا، سيصلك رابط آمن لتعيين كلمة مرور جديدة.</p>

        {sent && <div className="system-message success" role="status">إذا كان البريد مرتبطًا بحساب، فقد أرسلنا تعليمات الاستعادة. افحص صندوق الوارد والرسائل غير المرغوب فيها.</div>}
        {invalid && <div className="system-message error" role="alert">أدخل بريدًا إلكترونيًا صالحًا.</div>}

        <form className="auth-form" action={requestPasswordReset}>
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} placeholder="name@example.com" />
          <button className="auth-primary" type="submit">إرسال رابط الاستعادة</button>
        </form>

        <div className="auth-links"><Link href="/login">العودة إلى تسجيل الدخول</Link><Link href="/">العودة إلى الرئيسية</Link></div>
      </section>
    </main>
  );
}
