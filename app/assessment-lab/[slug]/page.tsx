import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AssessmentMonitorRunner from '@/components/assessment-monitor-runner';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { assessmentSlugs, buildMonitorQuestions, getAssessmentMonitor, getMonitorReadingTime, getRelatedMonitors, getSourceInstrument } from '@/lib/assessment-lab/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from '../assessment-lab.module.css';

type Params = Promise<{ slug: string }>;
export const dynamicParams = false;
export function generateStaticParams() { return assessmentSlugs.map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const monitor = getAssessmentMonitor(slug);
  const instrument = getSourceInstrument(slug);
  if (!monitor && !instrument) return {};
  const title = monitor?.title ?? instrument?.title ?? 'اختبر نفسك';
  const description = monitor
    ? `${title}: متابعة ذاتية عربية غير تشخيصية من ${buildMonitorQuestions(monitor).length} بندًا موزعة على ${monitor.axes.length} محاور، دون حفظ الإجابات أو احتساب درجة زائفة.`
    : `${title}: صفحة موثقة بالمصدر الرسمي وحالة النسخة العربية وحقوق الاستخدام، دون نسخ البنود أو احتساب نتيجة قبل التحقق.`;
  return buildSeoMetadata({
    title,
    description,
    path: `/assessment-lab/${slug}`,
    index: true,
    follow: true,
    keywords: monitor ? [title, 'اختبر نفسك', 'متابعة ذاتية', ...monitor.axes] : [title, instrument!.source],
  });
}

export default async function AssessmentLabDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const monitor = getAssessmentMonitor(slug);
  const instrument = getSourceInstrument(slug);
  if (!monitor && !instrument) notFound();
  const title = monitor?.title ?? instrument!.title;
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'اختبر نفسك', path: '/assessment-lab' }, { name: title, path: `/assessment-lab/${slug}` }]);
  const related = monitor ? getRelatedMonitors(monitor) : [];
  const questions = monitor ? buildMonitorQuestions(monitor) : [];

  return <><SiteHeader/><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}/>
    <section className={styles.detailHero}><div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-lab">اختبر نفسك</Link><span>/</span><span aria-current="page">{title}</span></nav>
      <span className={styles.eyebrow}>{monitor ? 'متابعة ذاتية · لا تشخيص' : 'أداة مصدرية · توثيق قبل الاستخدام'}</span>
      <h1>{title}</h1>
      {monitor ? <>
        <p>ورقة متابعة عملية تساعدك على ملاحظة نمطك خلال الأسبوع الماضي عبر أربعة محاور محددة. لا تحاول هذه الصفحة تحويل التجربة الإنسانية إلى تشخيص أو نسبة عامة؛ هدفها أن تجعلك ترى أمثلة وسياقات قد تمر دون ملاحظة.</p>
        <div className={styles.detailFacts}><span><strong>{questions.length}</strong> بندًا</span><span><strong>{monitor.axes.length}</strong> محاور</span><span><strong>≈ {getMonitorReadingTime(monitor)}</strong> دقائق</span><span><strong>0</strong> بيانات محفوظة</span></div>
      </> : <p>صفحة توثيق تحفظ الأداة المعروفة في مكانها الصحيح، وتوضح المصدر وحالة الاستعادة، من دون تقديم ترجمة أو نتيجة غير مثبتة أو تجاوز حقوق الاستخدام.</p>}
    </div></section>

    {monitor ? <>
      <section className={`${styles.shell} ${styles.beforeYouStart}`} aria-labelledby="before-title">
        <div><span className={styles.eyebrow}>قبل أن تبدأ</span><h2 id="before-title">ما الذي تستطيع هذه الأداة فعله وما الذي لا تستطيع فعله؟</h2></div>
        <div className={styles.methodGrid}>
          <article><h3>تساعد على الملاحظة</h3><p>تربط الإجابة بمحور وسياق ووقت، حتى يكون لديك وصف أكثر دقة لما يحدث بدل الانطباع العام فقط.</p></article>
          <article><h3>لا تشخّص اضطرابًا</h3><p>لا توجد عتبة تشخيصية أو درجة معيارية أو مقارنة بأفراد آخرين. ارتفاع اختيار معين لا يساوي تشخيصًا.</p></article>
          <article><h3>لا تحفظ بياناتك</h3><p>الإجابات لا تُرسل إلى الخادم ولا تُحفظ في الحساب أو المتصفح. يمكنك الطباعة محليًا إذا أردت الاحتفاظ بنسخة.</p></article>
          <article><h3>تساعد على طلب دعم أدق</h3><p>إذا كان شيء يؤثر في حياتك، خذ أمثلة محددة من ملاحظاتك إلى مختص مؤهل بدل الاعتماد على نتيجة آلية.</p></article>
        </div>
      </section>
      <div className={styles.shell}><AssessmentMonitorRunner title={monitor.title} questions={questions}/></div>
      <section className={`${styles.shell} ${styles.afterAssessment}`} aria-labelledby="after-title">
        <span className={styles.eyebrow}>بعد المتابعة</span><h2 id="after-title">حوّل الإجابات إلى أسئلة مفيدة</h2>
        <div className={styles.methodGrid}>
          <article><h3>ما الذي يتكرر؟</h3><p>ابحث عن موقف أو وقت أو نشاط يظهر معه النمط أكثر من غيره.</p></article>
          <article><h3>ما الذي يغيره؟</h3><p>دوّن ما يخفف الصعوبة أو يزيد القدرة: نوم، بيئة، شخص داعم، استراحة، تنظيم أو تعديل محدد.</p></article>
          <article><h3>ما أثره على الوظيفة؟</h3><p>لاحظ إن كان يؤثر في الدراسة أو العمل أو العلاقات أو العناية بالنفس أو السلامة.</p></article>
          <article><h3>ماذا تريد أن تسأل المختص؟</h3><p>حوّل الملاحظة إلى سؤال مباشر: ما الاحتمالات؟ ما الذي يحتاج تقييمًا؟ وما الخطوات العملية التالية؟</p></article>
        </div>
        <div className={styles.specialistCta}><div><strong>تحتاج تقييمًا فرديًا؟</strong><p>استخدم دليل المختصين في روافد للوصول إلى مختص مناسب، أو خذ هذه الورقة إلى مقدم الرعاية الذي تراجعه بالفعل.</p></div><Link href="/specialists">الانتقال إلى المختصين</Link></div>
      </section>
      {related.length > 0 && <section className={`${styles.shell} ${styles.related}`} aria-labelledby="related-title"><h2 id="related-title">متابعات مرتبطة</h2><div className={styles.grid}>{related.map((row) => <Link className={styles.card} href={`/assessment-lab/${row.slug}`} key={row.slug}><h3>{row.title}</h3><p>{row.axes.join(' · ')}</p><span>فتح المتابعة ←</span></Link>)}</div></section>}
    </> : <section className={`${styles.shell} ${styles.sourceCard}`}>
      <span className={styles.eyebrow}>صفحة مصدر لا أداة تسجيل درجات</span><h2>{instrument!.source}</h2><p>{instrument!.note}</p>
      <dl><div><dt>الفترة المرجعية</dt><dd>{instrument!.period}</dd></div><div><dt>حالة الاستعادة</dt><dd>{instrument!.status}</dd></div></dl>
      <a href={instrument!.sourceUrl} target="_blank" rel="noreferrer">فتح المصدر الرسمي</a>
      <p className={styles.boundary}>عدم عرض البنود أو الدرجة هنا قرار جودة مقصود. لن تعاد الوظيفة التفاعلية إلا عندما تكون النسخة العربية، طريقة الحساب، حقوق إعادة الاستخدام وحدود التفسير مثبتة بمصدر مناسب.</p>
    </section>}

    <section className={`${styles.shell} ${styles.reviewNote}`}><strong>تمت المراجعة من قبل فريق روافد</strong><p>المراجعة هنا تعني مراجعة البنية التحريرية وحدود الاستخدام والسلامة وعدم الادعاء التشخيصي؛ ولا تعني أن أداة المتابعة المحلية اختبار نفسي مقنن أو بديل عن التقييم المهني.</p></section>
    <section className={`${styles.shell} ${styles.safety}`}><h2>متى تتجاوز الأداة؟</h2><p>إذا ظهر خطر فوري على النفس أو الآخرين، عنف، فقدان شديد للاتصال بالواقع، أعراض طبية حادة، أو تدهور سريع في القدرة على أداء الحياة اليومية، فلا تنتظر إكمال المتابعة. استخدم خدمات الطوارئ المحلية أو اطلب تقييمًا مهنيًا مناسبًا للموقف.</p><p><Link href="/assessment-lab">جميع أدوات اختبر نفسك</Link> · <Link href="/guided-assessment">التحضير لموعد مهني</Link> · <Link href="/medical-review-policy">منهجية المراجعة</Link></p></section>
  </main><SiteFooter/></>;
}
