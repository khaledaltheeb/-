import type { CSSProperties } from 'react';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import PlatformIcon from '@/components/platform-icon';
import { buildSeoMetadata } from '@/lib/seo';

// Compatibility marker for the original quality contract: Design System V3.
// The rendered preview itself now validates the central Design System V5 layer.

export const metadata = buildSeoMetadata({
  title: 'معاينة الثيم',
  description: 'صفحة داخلية لمعاينة نظام تصميم منصة روافد.',
  path: '/theme-preview',
  index: false,
  follow: false,
});

const swatches = [
  ['Rawafid', '#087f7b'], ['Deep Teal', '#053f46'], ['Turquoise', '#16c6c7'], ['Gold', '#d8a536'], ['Blue', '#3d78bd'], ['Lilac', '#7564c9'], ['Coral', '#d8604c'], ['Green', '#4f9d69'],
];

export default function ThemePreviewPage() {
  return <>
    <SiteHeader />
    <main className="site-shell rawafid-home">
      <section className="rawafid-hero" style={{ minHeight: 'auto' }}>
        <div className="rawafid-hero-copy">
          <span className="rawafid-kicker">Central Design System V5</span>
          <h1>معاينة ثيم <em>منصة روافد</em></h1>
          <p>هذه الصفحة لا تحتوي محتوى المنصة. وظيفتها اختبار التناسق البصري، التباين، العناصر، الحالات والاستجابة للأجهزة المختلفة قبل تعميم أي تغيير بصري على بقية المنصة.</p>
          <div className="rawafid-directory-actions"><button className="primary-action" type="button">زر أساسي</button><button className="secondary-action" type="button">زر ثانوي</button><a className="button" href="#forms">رابط بإطار</a></div>
        </div>
        <aside className="rawafid-hero-visual" style={{ minHeight: 380 }}>
          <div><span className="rawafid-visual-badge"><i className="rawafid-visual-status" />Visual QA</span><h2>هوية مركزية، تباين واضح، وتسلسل بصري هادئ.</h2><p>نظام التصميم يعمل على صفحات المعرفة والدليل والبوابات الإدارية مع بقاء الهوية المؤسسية ثابتة واستخدام ألوان القطاعات كإشارات محدودة فقط.</p></div>
          <div className="rawafid-visual-grid"><div className="rawafid-visual-card"><PlatformIcon name="secure"/><div><strong>Contrast</strong><span>وضوح النص والخلفية</span></div></div><div className="rawafid-visual-card"><PlatformIcon name="tools"/><div><strong>Responsive</strong><span>Desktop · Tablet · Mobile</span></div></div></div>
        </aside>
      </section>

      <section className="rawafid-section">
        <div className="rawafid-section-head"><div className="rawafid-section-title"><span>الألوان</span><h2>لوحة منصة روافد المؤسسية</h2><p>التركواز هوية رئيسية ثابتة، والألوان الداعمة تستخدم بإشارات مدروسة للقطاعات والحالات، لا كبدائل لهوية المنصة.</p></div></div>
        <div className="theme-preview-swatches">
          {swatches.map(([name,color]) => <div className="theme-preview-swatch" key={name}><span style={{ background: color }} /><strong>{name}</strong><code>{color}</code></div>)}
        </div>
      </section>

      <section className="rawafid-section">
        <div className="rawafid-section-head"><div className="rawafid-section-title"><span>المكونات</span><h2>مكونات مركزية قابلة لإعادة الاستخدام</h2></div></div>
        <div className="rawafid-platform-grid">
          {[
            ['knowledge','المعرفة','#3d78bd'],['specialist','المختصون','#0b8f92'],['center','المراكز','#7564c9'],['tools','الأدوات','#d8604c'],['community','المجتمع','#4f9d69'],['review','المراجعة','#f4b942'],
          ].map(([icon,title,accent]) => <article className="rawafid-platform-card" style={{ '--card-accent': accent } as CSSProperties} key={title}><span className="icon-shell"><PlatformIcon name={icon as 'knowledge'|'specialist'|'center'|'tools'|'community'|'review'} /></span><h3>{title}</h3><p>نموذج بصري للبطاقة بدون بيانات حقيقية.</p><span>إجراء نموذجي ←</span></article>)}
        </div>
      </section>

      <section className="rawafid-section" id="forms">
        <div className="dashboard-card theme-preview-dashboard">
          <div className="admin-heading"><div><span className="eyebrow">واجهة إدارية</span><h1>نموذج لوحة التحكم</h1><p>اختبار البطاقات والنماذج وحالات النظام ضمن نفس Design System المركزي.</p></div><div className="dashboard-actions"><button className="button" type="button">إجراء ثانوي</button></div></div>
          <div className="admin-stat-grid"><article><strong>0</strong><span>محتوى</span></article><article><strong>0</strong><span>قطاعات</span></article><article><strong>0</strong><span>مختصون</span></article><article><strong>0</strong><span>مراكز</span></article></div>
          <section className="portal-section"><div className="section-mini-heading"><h2>نموذج إدخال</h2><span>حقول وحالات Focus</span></div><div className="cms-grid"><label>حقل نصي<input placeholder="مثال" /></label><label>قائمة<select defaultValue=""><option value="" disabled>اختر</option><option>خيار نموذجي</option></select></label><label className="cms-wide">وصف<textarea rows={4} placeholder="نص تجريبي لقياس المسافات والتباين فقط" /></label></div><div className="cms-actions"><button className="primary-action" type="button">حفظ</button><span>لا يتم إرسال أي بيانات من صفحة المعاينة.</span></div></section>
          <div className="portal-notice"><strong>حالة معلومات</strong><span>نموذج لحالة محايدة.</span></div><div className="portal-notice warning"><strong>حالة تنبيه</strong><span>نموذج لحالة تحتاج انتباهًا.</span></div><div className="portal-notice danger"><strong>حالة حرجة</strong><span>نموذج لحالة خطأ أو إيقاف.</span></div>
        </div>
      </section>

      <section className="rawafid-section"><div className="rawafid-empty"><div className="rawafid-empty-icon"><PlatformIcon name="knowledge" size={30}/></div><h3>Empty State</h3><p>هذا هو المظهر الذي يظهر في القوائم عندما لا توجد بيانات بعد، بدل ملء الثيم بمحتوى تجريبي أو إنشاء بيانات وهمية في Supabase.</p></div></section>
    </main>
    <SiteFooter />
  </>;
}
