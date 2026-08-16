import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MfaChallenge } from '@/components/mfa-challenge';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'التحقق بخطوتين', robots: { index: false, follow: false, noarchive: true, nosnippet: true } };
type SearchParams = Promise<{ next?: string; error?: string }>;

function safeNext(value?: string) {
  const next = String(value ?? '').trim().slice(0, 500);
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\') || next === '/mfa' || next.startsWith('/mfa?')) return '/account';
  return next;
}

export default async function MfaPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims?.sub) redirect(`/login?next=${encodeURIComponent(next)}`);

  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.error) {
    return (
      <main className="dashboard-shell account-shell"><section className="dashboard-card account-card">
        <div className="admin-heading"><div><span className="eyebrow">أمان الحساب</span><h1>تعذر التحقق من مستوى الجلسة</h1><p>لم نتمكن من التأكد من حالة التحقق بخطوتين لهذه الجلسة. لم يتم فتح المسار المطلوب حفاظًا على أمان الحساب.</p></div></div>
        <div className="system-message error" role="alert">أعد تسجيل الدخول ثم حاول مرة أخرى.</div>
        <div className="dashboard-actions"><Link className="button" href="/auth/signout">تسجيل الخروج</Link></div>
      </section></main>
    );
  }

  if (assurance.data.currentLevel === 'aal2' || assurance.data.nextLevel !== 'aal2') redirect(next);

  return (
    <main className="dashboard-shell account-shell"><section className="dashboard-card account-card">
      <div className="admin-heading"><div><span className="eyebrow">أمان الحساب</span><h1>أكمل التحقق</h1><p>الحساب محمي بعامل تحقق إضافي. أكمل هذه الخطوة قبل فتح المسار المطلوب.</p></div></div>
      {params.error === 'assurance_check' && <div className="system-message error" role="alert">تعذر فحص مستوى الجلسة في المحاولة السابقة. حاول التحقق مرة أخرى.</div>}
      <MfaChallenge nextPath={next} />
    </section></main>
  );
}
