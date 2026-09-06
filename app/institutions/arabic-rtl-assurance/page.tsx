import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/institutional-assurance-page.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'Arabic & RTL Assurance للمواقع والتطبيقات',
  description: 'تدقيق مؤسسي للعربية وRTL والوصولية: النص ثنائي الاتجاه، النماذج، لوحة المفاتيح، CSS المنطقي، الشاشات الصغيرة، والاختبارات الانحدارية.',
  path: '/institutions/arabic-rtl-assurance',
  index: true,
  follow: true,
  keywords: ['Arabic RTL testing', 'تدقيق RTL', 'Arabic accessibility', 'bidi testing', 'localization QA'],
});

const checks = [
  ['Direction & layout', 'dir/lang، الخصائص المنطقية في CSS، انعكاس الواجهة دون قلب عناصر لا ينبغي قلبها، ومحاذاة المحتوى المختلط.'],
  ['Unicode & bidi', 'عزل النصوص المختلطة، الروابط والأرقام والمعرّفات، والتحذير من محارف التحكم ذات المخاطر العرضية أو الأمنية.'],
  ['Forms', 'اتجاه الحقول، رسائل الخطأ، التسميات، ترتيب القراءة، الأرقام، البريد والعناوين المختلطة في واجهة RTL.'],
  ['Keyboard & focus', 'التنقل بلوحة المفاتيح، ترتيب التركيز، الأسهم في المكونات المركبة، وإبقاء مؤشر التركيز مرئيًا.'],
  ['Responsive Arabic', 'إعادة التدفق، الكلمات الطويلة، النص العربي مع اللاتيني، الجداول والبطاقات في المقاسات الضيقة.'],
  ['Regression evidence', 'تحويل الحالات المهمة إلى اختبارات قابلة للتشغيل في CI بدل الاعتماد على قائمة فحص يدوية فقط.'],
] as const;

export default function ArabicRtlAssurancePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Arabic and RTL Assurance',
    provider: { '@id': `${absoluteSiteUrl('/')}#organization` },
    areaServed: 'Worldwide',
    serviceType: 'Arabic RTL accessibility and localization quality assurance',
    url: absoluteSiteUrl('/institutions/arabic-rtl-assurance'),
  };

  return <div className={styles.page}>
    <SiteHeader />
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow}>Arabic · RTL · Accessibility</span>
            <h1 className={styles.title}>اختبار العربية كما يستخدمها الناس، لا كما تظهر في لقطة شاشة واحدة.</h1>
            <p className={styles.lead}>دعم RTL لا يساوي إضافة <code>dir=&quot;rtl&quot;</code>. المشكلات تظهر عند اختلاط العربية بالإنجليزية والأرقام والروابط، وعند استخدام لوحة المفاتيح، وفي النماذج والشاشات الصغيرة والمكونات التفاعلية. هدفنا تحويل هذه الحالات إلى أدلة واختبارات قابلة للتكرار.</p>
            <div className={styles.actions}>
              <a className={styles.primary} href="mailto:contact@healthrenewal.org?subject=Arabic%20RTL%20Assurance%20Review">طلب عينة تدقيق</a>
              <Link className={styles.secondary} href="/institutions">العودة لبوابة المؤسسات</Link>
            </div>
          </div>
          <aside className={styles.heroCard}>
            <h2>يناسب خصوصًا</h2>
            <ul>
              <li>بوابات الخدمات والإبلاغ.</li>
              <li>المنتجات SaaS متعددة اللغات.</li>
              <li>المنصات الحكومية والإنسانية.</li>
              <li>أنظمة التعليم والصحة الرقمية.</li>
              <li>التطبيقات المفتوحة المصدر التي تضيف العربية.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Audit surface</p><h2>ما الذي نفحصه؟</h2><p>الفحص لا يقتصر على الجمال البصري؛ بل يبحث عن أعطال وظيفية واتجاهية ووصولية يمكن توثيقها وإعادة إنتاجها.</p></div>
        <div className={styles.grid}>{checks.map(([title, description]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.twoColumn}>
          <article className={styles.panel}>
            <h2>مخرجات ممكنة</h2>
            <ul>
              <li>سجل findings مع شدة المشكلة وطريقة إعادة إنتاجها.</li>
              <li>مقترح إصلاح تقني أو لغوي حين يمكن إثباته.</li>
              <li>اختبارات Playwright أو وحدات قابلة للإضافة إلى CI.</li>
              <li>قائمة حالات عربية/RTL خاصة بالمنتج.</li>
              <li>إعادة فحص بعد الإصلاح.</li>
            </ul>
          </article>
          <article className={styles.panel}>
            <h2>ما لا نعد به تلقائيًا</h2>
            <ul>
              <li>نجاح اختبار آلي لا يعني توافق WCAG الكامل.</li>
              <li>أداة RTL لا تعني اعتمادًا لغويًا للمحتوى.</li>
              <li>المراجعة التقنية لا تستبدل اختبار المستخدمين ذوي الإعاقة أو الخبراء المحليين عندما يتطلب المنتج ذلك.</li>
              <li>لا نستخدم بيانات حقيقية حساسة لاختبار نموذج عام دون تفويض مناسب.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.cta}`}>
        <h2>ابدأ بسطح عام واحد</h2>
        <p>يمكن أن تكون البداية صفحة تسجيل، نموذجًا عامًا، أو مكوّنًا تفاعليًا. إذا كانت المشكلة متكررة، نحولها إلى اختبار أو قاعدة هندسية بدل إبقائها ملاحظة يدوية.</p>
        <div className={styles.actions}><a className={styles.primary} href="mailto:contact@healthrenewal.org?subject=Arabic%20RTL%20Public%20Surface%20Sample">إرسال رابط عام للمراجعة</a><a className={styles.secondary} href="https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit" target="_blank" rel="noreferrer">الـToolkit المفتوحة</a></div>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
  </div>;
}
