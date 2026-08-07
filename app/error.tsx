'use client';

import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Rawafid route error', error);
  }, [error]);

  return <main className="system-error-shell">
    <section className="system-error-card" role="alert">
      <div className="system-error-mark" aria-hidden="true">!</div>
      <span className="system-code">تعذر إكمال الطلب</span>
      <h1>حدث خطأ غير متوقع</h1>
      <p>لم يتم فقدان بياناتك بسبب هذه الشاشة. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية.</p>
      <div className="rawafid-directory-actions"><button className="primary-action" type="button" onClick={() => reset()}>إعادة المحاولة</button><a className="button" href="/">العودة للرئيسية</a></div>
    </section>
  </main>;
}
