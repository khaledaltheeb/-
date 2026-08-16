/* eslint-disable @next/next/no-img-element */
'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type TotpFactor = { id: string; friendly_name?: string; status?: string; created_at?: string };
type Enrollment = { factorId: string; qrCode: string; secret: string };

export function MfaSettings() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [verified, setVerified] = useState<TotpFactor[]>([]);
  const [unverified, setUnverified] = useState<TotpFactor[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadFactors() {
    const result = await supabase.auth.mfa.listFactors();
    if (result.error) {
      setError('تعذر تحميل إعدادات التحقق بخطوتين.');
      return;
    }
    const factors = result.data.totp ?? [];
    setVerified(factors.filter((factor) => factor.status === 'verified'));
    setUnverified(factors.filter((factor) => factor.status !== 'verified'));
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await supabase.auth.mfa.listFactors();
      if (!active) return;
      if (result.error) setError('تعذر تحميل إعدادات التحقق بخطوتين.');
      else {
        const factors = result.data.totp ?? [];
        setVerified(factors.filter((factor) => factor.status === 'verified'));
        setUnverified(factors.filter((factor) => factor.status !== 'verified'));
      }
      setLoading(false);
    })();
    return () => { active = false; };
  }, [supabase]);

  async function beginEnrollment() {
    setError('');
    setMessage('');
    if (unverified.length > 0) {
      setError('يوجد إعداد غير مكتمل. احذفه أولًا ثم ابدأ إعدادًا جديدًا.');
      return;
    }
    setBusy(true);
    const result = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `تطبيق المصادقة ${new Date().toLocaleDateString('ar')}`,
    });
    if (result.error) {
      setError('تعذر بدء إعداد تطبيق المصادقة. حاول مرة أخرى.');
      setBusy(false);
      return;
    }
    setEnrollment({ factorId: result.data.id, qrCode: result.data.totp.qr_code, secret: result.data.totp.secret });
    setCode('');
    setBusy(false);
  }

  async function verifyEnrollment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment) return;
    setError('');
    setMessage('');
    const normalized = code.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(normalized)) {
      setError('أدخل رمز التحقق المكوّن من 6 أرقام.');
      return;
    }
    setBusy(true);
    const result = await supabase.auth.mfa.challengeAndVerify({ factorId: enrollment.factorId, code: normalized });
    if (result.error) {
      setError('لم يتم التحقق من الرمز. استخدم الرمز الحالي من تطبيق المصادقة.');
      setBusy(false);
      return;
    }
    setEnrollment(null);
    setCode('');
    await loadFactors();
    setMessage('تم تفعيل التحقق بخطوتين. ستُطلب منك خطوة التحقق الإضافية عند تسجيل الدخول إلى المسارات المحمية.');
    setBusy(false);
    router.refresh();
  }

  async function cancelEnrollment() {
    if (!enrollment) return;
    setBusy(true);
    await supabase.auth.mfa.unenroll({ factorId: enrollment.factorId });
    setEnrollment(null);
    setCode('');
    await loadFactors();
    setBusy(false);
  }

  async function removeFactor(factorId: string) {
    setError('');
    setMessage('');
    setBusy(true);
    const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assurance.error || assurance.data.currentLevel !== 'aal2') {
      window.location.assign('/mfa?next=%2Faccount%2Fsecurity');
      return;
    }
    const result = await supabase.auth.mfa.unenroll({ factorId });
    if (result.error) {
      setError('تعذر إزالة عامل التحقق. أعد التحقق ثم حاول مرة أخرى.');
      setBusy(false);
      return;
    }
    await supabase.auth.refreshSession();
    await loadFactors();
    setMessage('تمت إزالة تطبيق المصادقة من الحساب.');
    setBusy(false);
    router.refresh();
  }

  async function removeIncompleteFactor(factorId: string) {
    setError('');
    setMessage('');
    setBusy(true);
    const result = await supabase.auth.mfa.unenroll({ factorId });
    if (result.error) setError('تعذر حذف الإعداد غير المكتمل.');
    else {
      await loadFactors();
      setMessage('تم حذف الإعداد غير المكتمل.');
    }
    setBusy(false);
  }

  return (
    <section className="account-section" aria-labelledby="mfa-settings-title">
      <div className="section-mini-heading">
        <h2 id="mfa-settings-title">التحقق بخطوتين</h2>
        <span>باستخدام تطبيق مصادقة TOTP</span>
      </div>
      <p>يمكنك إضافة تطبيق مصادقة لحماية المسارات والبيانات الحساسة. بعد التفعيل، لا تكفي كلمة المرور وحدها للوصول إلى تلك الموارد.</p>
      {message && <div className="system-message success" role="status">{message}</div>}
      {error && <div className="system-message error" role="alert">{error}</div>}
      {loading ? <p role="status">جاري تحميل إعدادات التحقق…</p> : <>
        {verified.length > 0 && <div>
          <h3>عوامل التحقق المفعّلة</h3>
          <ul>
            {verified.map((factor, index) => <li key={factor.id}>
              <span>{factor.friendly_name || `تطبيق المصادقة ${index + 1}`}</span>{' '}
              <button className="button" type="button" disabled={busy} onClick={() => void removeFactor(factor.id)}>إزالة</button>
            </li>)}
          </ul>
        </div>}
        {unverified.length > 0 && <div className="system-message" role="status">
          <p>يوجد إعداد تطبيق مصادقة لم يكتمل التحقق منه.</p>
          {unverified.map((factor) => <button key={factor.id} className="button" type="button" disabled={busy} onClick={() => void removeIncompleteFactor(factor.id)}>حذف الإعداد غير المكتمل</button>)}
        </div>}
        {!enrollment && <button className="primary-action" type="button" disabled={busy || unverified.length > 0} onClick={() => void beginEnrollment()}>{verified.length > 0 ? 'إضافة تطبيق مصادقة آخر' : 'تفعيل التحقق بخطوتين'}</button>}
      </>}

      {enrollment && <div className="account-section">
        <h3>اربط تطبيق المصادقة</h3>
        <ol>
          <li>امسح رمز QR باستخدام تطبيق مصادقة متوافق.</li>
          <li>إذا تعذر المسح، أدخل المفتاح يدويًا في التطبيق.</li>
          <li>أدخل الرمز الحالي المكوّن من 6 أرقام لإكمال التفعيل.</li>
        </ol>
        <img src={enrollment.qrCode} alt="رمز QR لإضافة حساب روافد إلى تطبيق المصادقة" width={220} height={220} />
        <p>المفتاح اليدوي:</p>
        <code dir="ltr">{enrollment.secret}</code>
        <form className="auth-form account-security-form" onSubmit={verifyEnrollment}>
          <label htmlFor="mfa_enroll_code">رمز التحقق</label>
          <input id="mfa_enroll_code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} dir="ltr" required />
          <div className="dashboard-actions">
            <button className="primary-action" type="submit" disabled={busy}>تأكيد التفعيل</button>
            <button className="button" type="button" disabled={busy} onClick={() => void cancelEnrollment()}>إلغاء</button>
          </div>
        </form>
      </div>}
    </section>
  );
}
