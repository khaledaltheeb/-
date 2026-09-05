import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import styles from '@/components/assessment-measures.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'منهجية المقاييس وأدوات التقييم — الأدلة والحقوق والترجمات',
  description: 'كيف تتحقق روافد من المقاييس قبل نشرها: المصدر، الملكية، حق إعادة الاستخدام، النسخة العربية، الخصائص القياسية وحدود التفسير.',
  path: '/assessment-measures/methodology/',
  index: true,
  follow: true,
  type: 'article',
  keywords: ['حقوق المقاييس', 'ترجمة المقاييس', 'COSMIN', 'RMD', 'ePROVIDE', 'CDISC QRS', 'التحقق من المقاييس'],
});

const schema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${SITE_URL}/assessment-measures/methodology/#page`,
  url: `${SITE_URL}/assessment-measures/methodology/`,
  name: 'منهجية المقاييس وأدوات التقييم — الأدلة والحقوق والترجمات',
  inLanguage: 'ar',
  isPartOf: { '@id': `${SITE_URL}/assessment-measures/#page` },
  publisher: { '@id': `${SITE_URL}/#organization` },
};

export default function AssessmentMeasuresMethodologyPage() {
  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-measures/">المقاييس وأدوات التقييم</Link><span>/</span><span aria-current="page">المنهجية</span></nav>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>منهجية قابلة للتدقيق</span>
          <h1>كيف نقرر ما الذي يمكن نشره واستخدامه؟</h1>
          <p>نتعامل مع كل مقياس كملف علمي وحقوقي مستقل. «مجاني» لا تساوي «Public Domain»، ووجود ترجمة عربية لا يساوي حق إعادة نشرها، ووجود درجة لا يجعل الأداة تشخيصًا.</p>
          <div className={styles.heroActions}><Link className={styles.primaryAction} href="/assessment-measures/">العودة إلى المكتبة</Link></div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><div><h2>مسار التحقق قبل النشر</h2><p>كل خطوة تغلق نوعًا مختلفًا من المخاطر العلمية أو القانونية.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>1. تثبيت هوية الأداة</h3><p>نحدد الاسم الكامل، الاختصار، الإصدار، عدد البنود/المهام، صاحب الأداة أو الجهة الحافظة لها والمصدر الأصلي. لا نخلط بين النسخة الأصلية والنسخ القصيرة أو المعدلة.</p></article>
            <article className={styles.methodCard}><h3>2. مراجعة RMD والأدلة</h3><p>نستخدم Rehabilitation Measures Database لتحديد الاستخدامات، المجتمعات والخصائص القياسية والمراجع. RMD مصدر تجميع للأدلة، وليس افتراضًا لملكية حقوق الأداة.</p></article>
            <article className={styles.methodCard}><h3>3. فحص حقوق الأصل</h3><p>نبحث عن نص صريح من صاحب الحقوق أو سجل موثوق مثل Mapi Research Trust/ePROVIDE أو CDISC QRS أو المصدر الرسمي. عبارة Free/No cost وحدها لا تكفي لإعادة النشر.</p></article>
            <article className={styles.methodCard}><h3>4. فحص حقوق العربية منفصلًا</h3><p>قد يكون الأصل Public Domain بينما ترجمة عربية محددة لها مترجمون وناشر وشروط أخرى. لا ننقل الترجمة إلا بعد تثبيت النسخة والحقوق.</p></article>
            <article className={styles.methodCard}><h3>5. فحص الملاءمة القياسية</h3><p>نراجع الصدق والثبات والاستجابة للتغير وأخطاء القياس وحدود MCID/MDC وفق المجتمع والسياق. COSMIN مرجع منهجي مهم، وليس ختم اعتماد للأداة.</p></article>
            <article className={styles.methodCard}><h3>6. بناء صفحة استخدام مسؤولة</h3><p>ننشر الغرض، السكان، البروتوكول، التسجيل، الحدود، السلامة، المصادر وتاريخ تحقق الحقوق. لا نبتكر Cut-offs ولا ننسب اعتمادًا أو دقة غير مثبتة.</p></article>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><div><h2>كيف نقرأ حالات الحقوق؟</h2></div></div>
          <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>الحالة</th><th>ما الذي تعنيه؟</th><th>ما الذي لا تعنيه؟</th></tr></thead><tbody>
            <tr><td><strong>Public Domain</strong></td><td>وجدنا أساسًا موثقًا بأن الأصل في المجال العام ويمكن إعادة استخدامه.</td><td>لا يعني تلقائيًا أن كل ترجمة أو ملف PDF أو مادة تدريبية عنه في المجال العام.</td></tr>
            <tr><td><strong>إعادة استخدام مجانية موثقة</strong></td><td>المالك أو المصدر الرسمي يسمح بالاستخدام/إعادة الإنتاج دون رسوم وفق الشروط المنشورة.</td><td>لا يعني تجاهل شروط النسبة أو حدود التعديل أو متطلبات النسخة.</td></tr>
            <tr><td><strong>مجاني للاستخدام</strong></td><td>قد يستطيع المختص أو الباحث تطبيق الأداة بلا رسوم.</td><td>ليس تصريحًا تلقائيًا لنا بنسخ النموذج كاملًا على موقع عام.</td></tr>
            <tr><td><strong>إذن مطلوب</strong></td><td>نكتفي بالشرح والرابط والمصادر حتى نحصل على إذن مناسب.</td><td>لا نعيد صياغة البنود بهدف الالتفاف على حقوق صاحبها.</td></tr>
          </tbody></table></div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><div><h2>قاعدة النسخة العربية</h2><p>هذه القاعدة تمنع أحد أكثر الأخطاء شيوعًا في مواقع المقاييس.</p></div></div>
          <div className={styles.callout}><strong>لا نساوي بين «ترجمة موجودة» و«ترجمة محققة ومسموح نشرها».</strong> حتى تُعرض نسخة عربية كاملة، نحدد نص النسخة بعينه، مرجع الترجمة/التكييف الثقافي، المجتمع الذي دُرست عليه، حالة الخصائص القياسية، والحقوق أو الترخيص. إذا لم تكتمل هذه السلسلة تبقى الصفحة دليلًا للمقياس ولا تعرض بنوده العربية.</div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHead}><div><h2>ماذا لا تفعل روافد؟</h2></div></div>
          <div className={styles.panel}><ul>
            <li>لا تصف جميع المقاييس بأنها «معتمدة عالميًا»؛ العبارة الأدق هي «مستخدمة عالميًا» مع توضيح دليل كل أداة.</li>
            <li>لا تنسخ مقياسًا لأنه ظهر في قاعدة RMD أو لأن خانة التكلفة تقول Free.</li>
            <li>لا تولد ترجمة آلية ثم تسميها النسخة العربية الرسمية أو المحققة.</li>
            <li>لا تحول أداة فحص إلى تشخيص ولا تنشئ درجات شدة أو Cut-offs من دون دليل.</li>
            <li>لا تعمم خصائص قياسية أو MCID/MDC من مجتمع مرضي إلى مجتمع آخر دون سند.</li>
            <li>لا تعتبر وجود الصفحة أو مراجعة فريق روافد اعتمادًا من Shirley Ryan AbilityLab أو RMD أو صاحب المقياس.</li>
          </ul></div>
        </section>

        <section className={styles.section}>
          <div className={styles.panel}><h2>المصادر المرجعية المستخدمة في التحقق</h2><div className={styles.sourceList}>
            <a href="https://www.sralab.org/rehabilitation-measures" target="_blank" rel="noreferrer">Rehabilitation Measures Database (RMD) ↗</a>
            <a href="https://eprovide.mapi-trust.org/advanced-search" target="_blank" rel="noreferrer">Mapi Research Trust / ePROVIDE ↗</a>
            <a href="https://www.cdisc.org/standards/foundational/qrs" target="_blank" rel="noreferrer">CDISC Questionnaires, Ratings and Scales (QRS) ↗</a>
            <a href="https://www.cosmin.nl/" target="_blank" rel="noreferrer">COSMIN methodology ↗</a>
          </div></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
