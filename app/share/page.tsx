import Link from 'next/link';

export const metadata = {
  title: 'مشاركة إلى روافد',
  robots: { index: false, follow: false },
};

type Params = Promise<{ title?: string; text?: string; url?: string }>;

export default async function SharePage({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const sharedTitle = String(params.title ?? '').slice(0, 300);
  const sharedText = String(params.text ?? '').slice(0, 2000);
  const sharedUrl = String(params.url ?? '').slice(0, 2000);

  return (
    <main className="status-shell">
      <section className="status-card share-card">
        <span className="eyebrow">مشاركة إلى روافد</span>
        <h1>تم استلام المشاركة</h1>
        <p>استلمت روافد المحتوى الذي شاركته مؤقتًا. لن يتم حفظه في حسابك ما لم تضفه لاحقًا عبر مسار واضح داخل المنصة.</p>
        {(sharedTitle || sharedText || sharedUrl) && (
          <div className="shared-preview">
            {sharedTitle && <strong>{sharedTitle}</strong>}
            {sharedText && <p>{sharedText}</p>}
            {sharedUrl && <p dir="ltr">{sharedUrl}</p>}
          </div>
        )}
        <div className="dashboard-actions">
          <Link className="button" href="/">الرئيسية</Link>
          <Link className="button" href="/account">حسابي</Link>
        </div>
      </section>
    </main>
  );
}
