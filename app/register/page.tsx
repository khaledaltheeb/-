import type { Metadata } from 'next';
import Link from 'next/link';
import { register } from './actions';

export const metadata: Metadata = {
  title: 'إنشاء حساب',
  description: 'إنشاء حساب آمن في منصة روافد للوصول إلى الخدمات والمراسلات والمواعيد ومسارات الانضمام المهني.',
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

type SearchParams = Promise<{ error?: string; status?: string; next?: string }>;
const errors: Record<string, string> = {
  invalid_input: 'تحقق من الاسم والبريد الإلكتروني ثم أعد المحاولة.',
  password_length: 'يجب أن تتكون كلمة المرور من 10 أحرف على الأقل.',
  password_mismatch: 'كلمتا المرور غير متطابقتين.',
};
function safeNext(value?: string) {
  return value && value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/account';
}

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  return (
    <main className="auth-shell">
      <section className="auth-card auth-card-polished" aria-labelledby="register-title">
        <Link href="/" className="brand auth-brand"><span className="brand-mark">ر</span><span><strong>منصة روافد</strong><small>Rawafid Platform</small></span></Link>
        <span className="eyebrow">حساب جديد</span>
        <h1 id="register-title">إنشاء حساب في منصة روافد</h1>
        <p>أنشئ حسابًا شخصيًا أولًا. الصلاحيات المهنية والإدارية لا تُمنح إلا بعد التوثيق أو قرار الإدارة.</p>
        {params.error && errors[params.error] && <div className="system-message error" role="alert">{errors[params.error]}</div>}
        {params.status === 'check_email' && <div className="system-message success" role="status">إذا أمكن إنشاء الحساب بهذه البيانات، ستصلك رسالة لتأكيد البريد. افتح الرابط لإكمال التسجيل ثم ستعود إلى المسار المطلوب.</div>}
        <form className="auth-form" action={register}>
          <input type="hidden" name="next" value={next} />
          <label htmlFor="full_name">الاسم</label>
          <input id="full_name" name="full_name" autoComplete="name" required minLength={2} maxLength={160} />
          <label htmlFor="email">البريد الإلكتروني</label>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required maxLength={254} placeholder="name@example.com" />
          <label htmlFor="password">كلمة المرور</label>
          <input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} aria-describedby="password-help" />
          <small id="password-help" className="auth-note">10 أحرف على الأقل. استخدم كلمة مرور فريدة لا تستخدمها في خدمة أخرى.</small>
          <label htmlFor="confirm_password">تأكيد كلمة المرور</label>
          <input id="confirm_password" name="confirm_password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} />
          <button className="auth-primary" type="submit">إنشاء الحساب وإرسال التحقق</button>
        </form>
        <div className="auth-links"><Link href={`/login?next=${encodeURIComponent(next)}`}>لدي حساب بالفعل</Link><Link href="/join">الانضمام المهني</Link><Link href="/">الرئيسية</Link></div>
      </section>
    </main>
  );
}
