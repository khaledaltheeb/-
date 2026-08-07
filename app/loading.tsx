export default function Loading() {
  return <main className="system-loading-shell" aria-live="polite" aria-busy="true">
    <section className="system-loading-card">
      <div className="system-loading-brand"><span aria-hidden="true">ر</span><div><strong>منصة روافد</strong><small>جاري تجهيز الصفحة</small></div></div>
      <div className="system-loading-line wide" />
      <div className="system-loading-line medium" />
      <div className="system-loading-grid"><span /><span /><span /></div>
    </section>
  </main>;
}
