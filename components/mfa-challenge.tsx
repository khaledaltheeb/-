'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type TotpFactor = { id: string; friendly_name?: string; status?: string };

export function MfaChallenge({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [factorId, setFactorId] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await supabase.auth.mfa.listFactors();
      if (!active) return;
      if (result.error) {
        setError('تعذر تحميل عوامل التحقق. أعد تسجيل الدخول ثم حاول مرة أخرى.');
        setLoading(false);
        return;
      }
      const verified = (result.data.totp ?? []).filter((factor) => factor.status === 'verified');
      setFactors(verified);
      setFactorId(verified[0]?.id ?? '');
      if (verified.length === 0) setError('لا يوجد تطبيق مصادقة موثّق لهذا الحساب.');
      setLoading(false);
    })();
    return () => { active = false; };
  }, [supabase]);

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const normalized = code.replace(/\s+/g, '');
    if (!factorId || !/^\d{6}$/.test(normalized)) {
      setError('أدخل رمز التحقق المكوّن من 6 أرقام.');
      return;
    }
    setSubmitting(true);
    const result = await supabase.auth.mfa.challengeAndVerify({ factorId, code: normalized });
    if (result.error) {
      setError('رمز التحقق غير صالح أو انتهت صلاحيته. استخدم الرمز الحالي من تطبيق المصادقة.');
      setSubmitting(false);
      return;
    }
    router.replace(nextPath);
    router.refresh();
  }

  return (
    <section className="account-section" aria-labelledby="mfa-challenge-title">
      <div className="section-mini-heading">
        <h2 id="mfa-challenge-title">التحقق بخطوتين</h2>
        <span>طبقة إضافية لحماية الحساب</span>
      </div>
      <p>افتح تطبيق المصادقة المرتبط بحسابك وأدخل الرمز الحالي لإكمال تسجيل الدخول.</p>
      {error && <div className="system-message error" role="alert">{error}</div>}
      {loading ? <p role="status">جاري تحميل عوامل التحقق…</p> : factors.length > 0 && (
        <form className="auth-form account-security-form" onSubmit={verify}>
          {factors.length > 1 && <>
            <label htmlFor="mfa_factor">تطبيق المصادقة</label>
            <select id="mfa_factor" value={factorId} onChange={(event) => setFactorId(event.target.value)}>
              {factors.map((factor, index) => <option key={factor.id} value={factor.id}>{factor.friendly_name || `عامل التحقق ${index + 1}`}</option>)}
            </select>
          </>}
          <label htmlFor="mfa_code">رمز التحقق</label>
          <input id="mfa_code" name="code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} dir="ltr" required autoFocus />
          <button className="primary-action" type="submit" disabled={submitting}>{submitting ? 'جاري التحقق…' : 'إكمال تسجيل الدخول'}</button>
        </form>
      )}
      <div className="dashboard-actions"><Link className="button" href="/auth/signout">تسجيل الخروج</Link></div>
    </section>
  );
}
