const pillars = [
  { title: 'المعرفة', body: 'موسوعة وأدلة ومقارنات مبنية على بنية محتوى قابلة للتوسع.', accent: 'teal' },
  { title: 'الصحة النفسية', body: 'مسارات واضحة للفرد والأسرة والمعلم والمختص.', accent: 'lilac' },
  { title: 'الإدمان والتعافي', body: 'معلومات ومسارات مساعدة ودعم وفق احتياج المستخدم.', accent: 'coral' },
  { title: 'الدمج والتمكين', body: 'محتوى وخدمات للأشخاص ذوي الاحتياجات الخاصة ومقدمي الدعم.', accent: 'green' },
  { title: 'المختصون والمراكز', body: 'دليل موثق قابل للبحث والحجز والتواصل.', accent: 'blue' },
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="منصة روافد الرئيسية">
          <span className="brand-mark">ر</span>
          <span><strong>روافد</strong><small>Rawafid</small></span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          <a href="#discover">اكتشف</a><a href="#sectors">القطاعات</a><a href="#specialists">المختصون والمراكز</a><a href="#tools">الأدوات</a><a href="#knowledge">المعرفة</a>
        </nav>
        <a className="button ghost" href="/login">تسجيل الدخول</a>
      </header>

      <section className="hero" id="discover">
        <div className="hero-copy">
          <span className="eyebrow">Rawafid Institutional Platform — V3</span>
          <h1>كيف يمكن لروافد مساعدتك اليوم؟</h1>
          <p>نظام مؤسسي جديد يُبنى من الصفر. هذه النسخة لا تحتوي أي محتوى مرحّل من الموقع القديم حتى تكتمل البنية والاختبارات.</p>
          <form className="search" role="search">
            <input aria-label="البحث" placeholder="ابحث عن حالة، مصطلح، مختص، مركز، أداة أو سؤال..." disabled />
            <button type="button" disabled>بحث</button>
          </form>
          <div className="intent-grid">
            {['أفهم حالة','أساعد شخصًا','أجد مختصًا','أجد مركزًا','أتعامل مع إدمان','أساعد طفلي','أستخدم أداة','أتعلم كمتخصص'].map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="hero-panel" aria-label="حالة بناء المنصة">
          <span className="status-dot" />
          <strong>مرحلة التأسيس</strong>
          <p>الواجهة والبيانات والصلاحيات والـCMS قيد البناء والاختبار قبل إدخال المحتوى.</p>
          <ul><li>RTL وهوية بصرية موحدة</li><li>Supabase + RLS</li><li>SEO وPWA من الأساس</li><li>لوحات مدير ومختص مستقلة</li></ul>
        </div>
      </section>

      <section className="section" id="sectors">
        <div className="section-heading"><span>Core + Modules</span><h2>القطاعات الأساسية</h2><p>ألوان زاهية محسوبة ضمن هوية مؤسسية ثابتة.</p></div>
        <div className="pillar-grid">{pillars.map((pillar) => <article className={`pillar ${pillar.accent}`} key={pillar.title}><div className="icon-dot"/><h3>{pillar.title}</h3><p>{pillar.body}</p><span>جاهز للبناء</span></article>)}</div>
      </section>

      <section className="section split" id="specialists">
        <div><span className="eyebrow">Directory & Portal</span><h2>مختصون ومراكز بصلاحيات حقيقية</h2><p>توثيق، مؤهلات، وسائل تواصل، موقع جغرافي، مواعيد، محتوى، مراجعات ورسائل — مع تحكم المدير في الصلاحيات.</p></div>
        <div className="feature-list"><span>Verification</span><span>Messaging</span><span>Appointments</span><span>Maps</span><span>Audit Trail</span><span>Role Based Access</span></div>
      </section>

      <footer><strong>منصة روافد</strong><span>الثيم الجديد فقط — لا يوجد محتوى قديم في هذه المرحلة.</span></footer>
    </main>
  );
}
