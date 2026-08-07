import Link from 'next/link';
import { login, signup } from './actions';

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <section className="auth-card" aria-labelledby="login-title">
        <Link href="/" className="brand auth-brand"><span className="brand-mark">ر</span><span><strong>روافد</strong><small>Rawafid</small></span></Link>
        <span className="eyebrow">حسابات روافد</span>
        <h1 id="login-title">تسجيل الدخول أو إنشاء حساب</h1>
        <p>نظام الحسابات متصل مباشرة بقاعدة بيانات روافد وسياسات الصلاحيات.</p>
        <form className="auth-form">
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} />
          <label htmlFor="password">كلمة المرور</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} />
          <button className="auth-primary" formAction={login}>تسجيل الدخول</button>
          <button className="auth-secondary" formAction={signup}>إنشاء حساب جديد</button>
        </form>
        <small className="auth-note">لا يمنح إنشاء الحساب أي صلاحيات إدارية أو توثيق تلقائي.</small>
      </section>
    </main>
  );
}
