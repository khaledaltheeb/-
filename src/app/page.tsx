import { BookOpenText, Building2, HeartHandshake, Search, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";

const modules = [
  { title: "المعرفة", icon: BookOpenText, tone: "violet" },
  { title: "الصحة النفسية", icon: Sparkles, tone: "lilac" },
  { title: "الإدمان والتعافي", icon: HeartHandshake, tone: "green" },
  { title: "ذوو الاحتياجات الخاصة والدمج", icon: ShieldCheck, tone: "coral" },
  { title: "المختصون", icon: Stethoscope, tone: "blue" },
  { title: "المراكز", icon: Building2, tone: "gold" },
];

export default function Home() {
  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="منصة روافد - الرئيسية">
          <span className="brand-mark" aria-hidden="true">ر</span>
          <span><strong>روافد</strong><small>Rawafid</small></span>
        </a>
        <nav aria-label="التنقل الرئيسي">
          <a href="#modules">القطاعات</a>
          <a href="#modules">المختصون والمراكز</a>
          <a href="#status">الأدوات</a>
        </nav>
        <div className="top-actions">
          <button className="button button-ghost" type="button">تسجيل الدخول</button>
          <button className="button button-primary" type="button">إنشاء حساب</button>
        </div>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <span className="eyebrow">Rawafid Institutional Platform V3</span>
          <h1 id="hero-title">كيف يمكن لروافد مساعدتك اليوم؟</h1>
          <p>الهيكل المؤسسي الجديد جاهز للبناء والربط والاختبار قبل إدخال أي محتوى من المنصة القديمة.</p>
          <form className="global-search" role="search">
            <Search aria-hidden="true" size={20} />
            <input aria-label="البحث" placeholder="ابحث عن حالة، مختص، مركز، أداة أو معرفة..." disabled />
            <button type="button" disabled>بحث</button>
          </form>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orb orb-a" />
          <div className="orb orb-b" />
          <div className="hero-panel"><span>Core</span><strong>جاهز للتأسيس</strong><small>CMS · Accounts · Search · SEO · PWA</small></div>
        </div>
      </section>

      <section id="modules" className="module-section" aria-labelledby="module-title">
        <div className="section-heading"><div><span className="eyebrow">Core + Modules</span><h2 id="module-title">بنية قابلة للتوسع دون ربطها بالمحتوى القديم</h2></div><span className="status-pill">مرحلة التأسيس</span></div>
        <div className="module-grid">
          {modules.map(({ title, icon: Icon, tone }) => (
            <article className={`module-card tone-${tone}`} key={title}><div className="module-icon"><Icon size={24} /></div><h3>{title}</h3><p>وحدة مستقلة ضمن نظام روافد الموحد.</p></article>
          ))}
        </div>
      </section>

      <section id="status" className="readiness">
        <div><span className="eyebrow">Foundation first</span><h2>لا ترحيل للمحتوى قبل اكتمال النظام</h2><p>سيتم بناء الحسابات والصلاحيات وCMS والمختصين والمراكز والرسائل والمواعيد والبحث وSEO ثم اختبارها قبل بدء الاستيراد.</p></div>
        <div className="checklist"><span>01 — قاعدة البيانات والصلاحيات</span><span>02 — الهوية والواجهات</span><span>03 — وظائف المنصة</span><span>04 — الاختبارات والنشر</span><span>05 — ترحيل المحتوى فقط</span></div>
      </section>
    </main>
  );
}
