import type { Metadata } from 'next';
import Link from 'next/link';
import AssessmentLabDirectory from '@/components/assessment-lab-directory';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { assessmentCategories, assessmentMonitors, assessmentReferences, getAssessmentItemCount, sourceInstruments } from '@/lib/assessment-lab/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from './assessment-lab.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'اختبر نفسك: أدوات وصف ذاتي آمنة',
  description: '36 أداة عربية أصلية من روافد لتنظيم الملاحظة الذاتية بملخصات وصفية غير تشخيصية، بلا حفظ للإجابات، مع أدلة مستقلة للمقاييس المعروفة ومنهج تطوير شفاف.',
  path: '/assessment-lab',
  index: true,
  follow: true,
  keywords: ['اختبر نفسك', 'اختبارات نفسية عربية', 'متابعة ذاتية', 'الصحة النفسية', 'جودة النوم', 'الضغط النفسي', 'دعم الأسرة'],
});

const developmentStages = [
  ['01', 'تعريف المفهوم والسياق', 'تحديد ما تصفه الأداة، ولمن، وفي أي فترة، وما الذي لا تدعي قياسه.'],
  ['02', 'بنك بنود أصلي', 'صياغة عربية مباشرة مرتبطة بمجال واحد، مع فصل مؤشرات الصعوبة عن الموارد الداعمة.'],
  ['03', 'صلاحية المحتوى', 'مراجعة الملاءمة والشمول وسهولة الفهم مع خبراء ومستخدمين من الجمهور المقصود.'],
  ['04', 'المقابلات المعرفية', 'اختبار كيفية فهم كل بند وخيار إجابة، ثم تعديل الصياغة قبل الدراسة الميدانية.'],
  ['05', 'الدراسة السيكومترية', 'فحص البنية العاملية والثبات والصدق والإنصاف بين الفئات على عينة مناسبة.'],
  ['06', 'قرار النشر المعياري', 'لا توضع حدود أو تصنيفات سريرية إلا إذا دعمتها البيانات ومراجعة مستقلة واستخدام محدد.'],
] as const;

export default function AssessmentLabPage() {
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'اختبر نفسك', path: '/assessment-lab' }]);
  const directoryItems = assessmentMonitors.map((monitor) => ({
    slug: monitor.slug,
    title: monitor.title,
    category: monitor.category,
    summary: monitor.summary,
    audience: monitor.audience,
    recallPeriod: monitor.recallPeriod,
    estimatedMinutes: monitor.estimatedMinutes,
    domainTitles: monitor.domains.map((domain) => domain.title),
    itemCount: getAssessmentItemCount(monitor),
  }));
  const methodReferences = assessmentReferences.filter((reference) => ['cosmin', 'fda-pro', 'efpa'].includes(reference.id));

  return <><SiteHeader /><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
    <section className={styles.hero}><div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">اختبر نفسك</span></nav>
      <div className={styles.heroLayout}><div><span className={styles.eyebrow}>اختبر نفسك · Self-check</span><h1>افهم النمط، ولا تحوّل النتيجة إلى تشخيص</h1><p>مكتبة عربية أصلية لتنظيم ما تلاحظه في المزاج والنوم والضغط والعلاقات والدراسة والرعاية والقدرات اليومية. كل أداة ترتب إجاباتك في أربعة مجالات، ثم تقترح أسئلة وخطوات يمكن مناقشتها مع مختص عند الحاجة.</p><div className={styles.heroActions}><a href="#library">استكشف الأدوات</a><a href="#method">كيف نطورها؟</a></div></div><aside className={styles.heroBoundary}><strong>اقرأ قبل البدء</strong><p>النتيجة استرشادية وغير تشخيصية. قد تدعوك إلى إعادة النظر في جانب يثير قلقك، لكنها لا تثبت اضطرابًا ولا تنفيه، ولا تقدم قرار علاج.</p><span>لا حفظ · لا تصنيف · لا إرسال للإجابات</span></aside></div>
      <div className={styles.facts}><span><strong>36</strong> أداة روافد أصلية</span><span><strong>432</strong> بندًا عربيًا واضحًا</span><span><strong>4</strong> مجالات في كل أداة</span><span><strong>0</strong> إجابات محفوظة</span></div>
    </div></section>

    <section className={`${styles.shell} ${styles.principles}`} aria-labelledby="principles-title">
      <div className={styles.sectionHeading}><span className={styles.eyebrow}>حدود تحميك</span><h2 id="principles-title">ما الذي تقدمه الأداة وما الذي لا تقدمه؟</h2></div>
      <div className={styles.principleGrid}>
        <article><span>تقدم</span><h3>وصفًا منظمًا</h3><p>تعرض إجاباتك بحسب مجالات واضحة وبالفترة المرجعية المحددة، من دون تحويلها إلى حكم آلي.</p></article>
        <article><span>تقدم</span><h3>خطوة قابلة للنقاش</h3><p>تحول الملاحظة إلى مثال أو سؤال أو تعديل بيئي صغير، مع مسار للوصول إلى مختص أو مركز.</p></article>
        <article><span>لا تقدم</span><h3>تشخيصًا أو شدة سريرية</h3><p>لا توجد درجة كلية أو نسبة شدة أو مقارنة بمعيار سكاني أو حدود فاصلة في الإصدار التطويري.</p></article>
        <article><span>لا تقدم</span><h3>حكمًا على الشخص</h3><p>خاصة في أدوات الأسرة والإعاقة: نراجع ملاءمة الدعم والبيئة، لا قيمة الطفل ولا «شدة» تشخيصه.</p></article>
      </div>
    </section>

    <section id="library" className={`${styles.shell} ${styles.directory}`} aria-labelledby="library-title">
      <div className={styles.sectionHeading}><span className={styles.eyebrow}>مكتبة الأدوات الأصلية</span><h2 id="library-title">اختر سؤالًا واحدًا تريد فهمه الآن</h2><p>جميع الأدوات إصدار تطويري 1.0 غير مقنن. البنود من صياغة روافد وليست نسخًا من اختبار مشهور. استخدم البحث أو الموضوع للوصول إلى الأداة الأقرب لحاجتك.</p></div>
      <AssessmentLabDirectory items={directoryItems} categories={assessmentCategories} />
    </section>

    <section className={styles.sourceSection} aria-labelledby="source-title"><div className={styles.shell}>
      <div className={styles.sectionHeading}><span className={styles.eyebrow}>المقاييس المنشورة خارجيًا</span><h2 id="source-title">نشرح الأداة المعروفة ولا ننسخها</h2><p>لكل مقياس نص محدد وطريقة حساب وسياق استخدام وحقوق. لذلك تبقى المسارات التاريخية الأربعة أدلة إلى المصدر وحالة المراجعة، لا نسخًا عربية غير موثقة.</p></div>
      <div className={styles.sourceGrid}>{sourceInstruments.map((instrument) => <article className={styles.sourceGuideCard} key={instrument.slug}><span>{instrument.statusLabel}</span><h3><Link href={`/assessment-lab/${instrument.slug}`}>{instrument.title}</Link></h3><p>{instrument.summary}</p><Link href={`/assessment-lab/${instrument.slug}`}>اقرأ دليل المصدر والحقوق ←</Link></article>)}</div>
    </div></section>

    <section id="method" className={`${styles.shell} ${styles.method}`} aria-labelledby="method-title">
      <div className={styles.sectionHeading}><span className={styles.eyebrow}>برنامج روافد للتطوير السيكومتري</span><h2 id="method-title">الشفافية قبل الادعاء</h2><p>النشر التقني لبنود جيدة لا يجعلها مقياسًا مقننًا. الإصدار الحالي أداة وصف ذاتي تطويرية؛ الانتقال إلى ادعاءات الصدق والثبات يحتاج عملًا ميدانيًا موثقًا ومراجعة مستقلة.</p></div>
      <ol className={styles.methodSteps}>{developmentStages.map(([number, title, body]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{body}</p></div></li>)}</ol>
      <div className={styles.methodReferences}><h3>الأطر المنهجية التي تضبط الطريق</h3><p>تستخدم هذه المراجع لتحديد متطلبات التطوير والمراجعة، لا كشهادة بأن أدوات روافد اجتازتها.</p><div>{methodReferences.map((reference) => <a href={reference.url} target="_blank" rel="noreferrer" key={reference.id}><strong>{reference.organization}</strong><span>{reference.title}</span></a>)}</div></div>
    </section>

    <section className={`${styles.shell} ${styles.safety}`}><div><span className={styles.eyebrow}>سلامتك أهم من أي نتيجة</span><h2>متى تتجاوز الأداة؟</h2></div><p>إذا كان هناك خطر فوري على النفس أو الآخرين، عنف، فقدان شديد للاتصال بالواقع، تدهور سريع، أو حالة طبية حادة، فلا تنتظر إكمال أداة إلكترونية. اطلب خدمات الطوارئ المحلية المناسبة. وعند استمرار الضيق أو تعطّل الحياة اليومية، استخدم <Link href="/specialists">دليل المختصين</Link> أو <Link href="/centers">دليل المراكز</Link> لبدء تقييم مناسب.</p></section>
  </main><SiteFooter /></>;
}
