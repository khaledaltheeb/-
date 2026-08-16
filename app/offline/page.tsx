import Link from 'next/link';

export const metadata = {
  title: 'غير متصل بالإنترنت',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main className="status-shell">
      <section className="status-card">
        <span className="eyebrow">حالة الاتصال</span>
        <h1>لا يوجد اتصال بالإنترنت</h1>
        <p>تعذر تحميل الصفحة المطلوبة الآن. بعض الصفحات العامة التي زرتها سابقًا قد تبقى متاحة من الذاكرة المؤقتة.</p>
        <Link className="button" href="/">المحاولة من الرئيسية</Link>
      </section>
    </main>
  );
}
