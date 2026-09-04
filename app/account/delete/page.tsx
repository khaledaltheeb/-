import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { deleteAccountPermanently, reauthenticateForDeletion } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'حذف حساب روافد والبيانات',
  description: 'المسار الرسمي لحذف حساب روافد والبيانات المرتبطة به نهائيًا.',
  robots: { index: false, follow: true, noarchive: true, nosnippet: true },
};

type SearchParams = Promise<{ step?: string; error?: string; deleted?: string }>;

const errors: Record<string, string> = {
  current_password: 'كلمة المرور الحالية غير صحيحة. لم يبدأ حذف الحساب.',
  reauth_required: 'انتهت نافذة التحقق الآمن. سجّل الدخول بكلمة المرور من جديد ثم أعد التأكيد.',
  confirmation: 'لم تتطابق بيانات التأكيد. لم يُحذف الحساب.',
  managed_account: 'هذا حساب إداري مُدار. يجب نقل الصلاحيات الإدارية قبل حذفه.',
  delete_failed: 'تعذر إكمال حذف الحساب بأمان. يمكنك إعادة المحاولة دون اعتبار العملية ناجحة.',
};

export default async function AccountDeletePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  const signedIn = Boolean(user?.id && user.email);
  const step = params.step === 'confirm' ? 'confirm' : 'reauth';

  return (
    <>
      <SiteHeader />
      <main className="dashboard-shell account-shell">
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/account">حسابي</Link><span>/</span><span aria-current="page">حذف الحساب</span>
        </nav>

        <section className="dashboard-card account-card">
          <div className="admin-heading">
            <div>
              <span className="eyebrow">الخصوصية والتحكم بالبيانات</span>
              <h1>حذف حساب روافد والبيانات</h1>
              <p>هذا هو المسار الرسمي للحذف الذاتي. لا نعتبر الحساب محذوفًا إلا بعد نجاح العملية كاملة وتأكيد الخادم.</p>
            </div>
            <div className="dashboard-actions">
              <Link className="button" href="/privacy-policy">سياسة الخصوصية</Link>
              <Link className="button" href="/account/security">أمان الحساب</Link>
            </div>
          </div>

          {params.deleted === '1' && (
            <div className="system-message success" role="status">
              تم حذف حساب روافد والبيانات المرتبطة به. إذا كانت لديك بيانات محلية فقط داخل تطبيق Android، يمكنك مسح بيانات التطبيق من إعدادات الجهاز أيضًا.
            </div>
          )}
          {params.error && errors[params.error] && <div className="system-message error" role="alert">{errors[params.error]}</div>}

          <section className="account-section">
            <div className="section-mini-heading"><h2>ما الذي يُحذف؟</h2><span>حذف نهائي للحساب السحابي</span></div>
            <ul>
              <li>حساب تسجيل الدخول ومعرّف RFD وروابط «دائرتي» وصلاحياتها ورسائلها المرتبطة بالحساب.</li>
              <li>الملف المهني أو المجتمعي المرتبط بالحساب وملفات التحقق أو الوسائط التي رفعها الحساب حيث تنطبق.</li>
              <li>المواعيد والإشعارات والعلاقات التي تُحذف تبعًا لملف الحساب وفق علاقات قاعدة البيانات.</li>
            </ul>
            <p><strong>لا يشمل ذلك تلقائيًا البيانات التي بقيت محليًا فقط على هاتف Android ولم تُرفع إلى الحساب.</strong> لمسحها أيضًا، امسح بيانات التطبيق أو أزل التطبيق من الجهاز.</p>
          </section>

          {!signedIn && params.deleted !== '1' && (
            <section className="account-section">
              <div className="section-mini-heading"><h2>ابدأ بالحساب الصحيح</h2><span>يلزم تسجيل الدخول</span></div>
              <p>سجّل الدخول بالحساب الذي تريد حذفه. بعد ذلك ستطلب الصفحة كلمة المرور الحالية مرة أخرى، ثم التحقق بخطوتين إذا كان مفعّلًا، ثم تأكيدًا نهائيًا مستقلًا.</p>
              <Link className="primary-action" href="/login?next=%2Faccount%2Fdelete">تسجيل الدخول للمتابعة</Link>
            </section>
          )}

          {signedIn && params.deleted !== '1' && step === 'reauth' && (
            <section className="account-section">
              <div className="section-mini-heading"><h2>1. أعد التحقق من هويتك</h2><span>جلسة حديثة مطلوبة</span></div>
              <p>الحساب: <strong>{user?.email}</strong></p>
              <form className="auth-form account-security-form" action={reauthenticateForDeletion}>
                <label htmlFor="current_password">كلمة المرور الحالية</label>
                <input id="current_password" name="current_password" type="password" autoComplete="current-password" required minLength={8} maxLength={128} />
                <button className="primary-action" type="submit">تحقق وانتقل للخطوة التالية</button>
              </form>
            </section>
          )}

          {signedIn && params.deleted !== '1' && step === 'confirm' && (
            <section className="account-section">
              <div className="section-mini-heading"><h2>2. التأكيد النهائي</h2><span>لا يمكن التراجع</span></div>
              <div className="system-message error" role="note">
                بعد نجاح هذه الخطوة لن تتمكن من استعادة رقم RFD أو شبكة «دائرتي» أو البيانات السحابية التي أزيلت مع الحساب.
              </div>
              <form className="auth-form account-security-form" action={deleteAccountPermanently}>
                <label htmlFor="account_email">اكتب بريد الحساب للتأكيد</label>
                <input id="account_email" name="account_email" type="email" autoComplete="email" required maxLength={254} />
                <label htmlFor="delete_phrase">اكتب العبارة: حذف حسابي نهائيًا</label>
                <input id="delete_phrase" name="delete_phrase" type="text" required maxLength={40} />
                <label className="consent-check" htmlFor="acknowledged">
                  <input id="acknowledged" name="acknowledged" type="checkbox" value="yes" required />
                  <span>أفهم أن حذف الحساب نهائي وأن البيانات السحابية المحذوفة لا يمكن استعادتها.</span>
                </label>
                <button className="primary-action" type="submit">حذف حسابي وبياناته نهائيًا</button>
              </form>
              <p><Link href="/account">إلغاء والعودة إلى الحساب دون حذف</Link></p>
            </section>
          )}

          <section className="account-section">
            <div className="section-mini-heading"><h2>هل تحتاج مساعدة قبل الحذف؟</h2><span>لا يلزم حذف الحساب لحل مشكلة تقنية</span></div>
            <p>إذا كان هدفك تغيير كلمة المرور أو حماية الحساب، استخدم صفحة أمان الحساب بدل الحذف. وإذا تعذر عليك الدخول، استخدم مسار استعادة كلمة المرور.</p>
            <div className="dashboard-actions">
              <Link className="button" href="/account/security">أمان الحساب</Link>
              <Link className="button" href="/forgot-password">استعادة كلمة المرور</Link>
            </div>
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
