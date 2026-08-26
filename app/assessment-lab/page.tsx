import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { assessmentCategories, assessmentMonitors, sourceInstruments } from '@/lib/assessment-lab/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from './assessment-lab.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'اختبر نفسك — أدوات متابعة ذاتية عربية موثوقة',
  description: 'قطاع اختبر نفسك في روافد: 36 أداة متابعة ذاتية عربية غير تشخيصية و10 صفحات موثقة لمقاييس خارجية وحقوق استخدامها، بلا حفظ بيانات أو نسخ غير مصرح به.',
  path: '/assessment-lab',
  index: true,
  follow: true,
  keywords: ['اختبر نفسك', 'اختبارات نفسية', 'فحص ذاتي', 'متابعة ذاتية', 'الصحة النفسية', 'النوم', 'القلق', 'الضغط النفسي', 'الاحتراق النفسي', 'PHQ-9', 'GAD-7', 'WHO-5', 'AUDIT', 'PSQI', 'MBI', 'PROMIS', 'K10', 'PSS', 'Zarit'],
});

export default function AssessmentLabPage() {
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'اختبر نفسك', path: '/assessment-lab' }]);
  return <><SiteHeader/><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}/>
    <section className={styles.hero}><div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">اختبر نفسك</span></nav>
      <span className={styles.eyebrow}>اختبر نفسك · Self-check & monitoring</span>
      <h1>لاحظ نمطك بوضوح — من دون تشخيص آلي أو حفظ بياناتك</h1>
      <p>هذه المكتبة لا تحاول إقناعك بأن بضع نقرات تستطيع تشخيصك. صُممت أدوات روافد المحلية لتساعدك على ملاحظة ما يحدث، متى يحدث، وما أثره على حياتك، ثم تحويل الانطباع العام إلى أمثلة وأسئلة أوضح. أما المقاييس المعروفة عالميًا فتبقى منفصلة حتى تكون النسخة العربية وحقوق الاستخدام وطريقة الحساب موثقة.</p>
      <div className={styles.facts}><span><strong>36</strong> أداة متابعة محلية</span><span><strong>10</strong> صفحات أدوات مصدرية وحقوق</span><span><strong>16</strong> بندًا لكل متابعة</span><span><strong>0</strong> إجابات محفوظة</span></div>
    </div></section>

    <section className={`${styles.shell} ${styles.method}`} aria-labelledby="method-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>المنهج</span><h2 id="method-title">نبني مكتبة فحص ذاتي مسؤولة، لا مكتبة «نتائج سريعة»</h2><p>الفحص الذاتي قد يكون مفيدًا عندما يساعد الشخص على تنظيم الملاحظة وطلب المساعدة المناسبة، لكنه يصبح مضللًا عندما يقلّد التشخيص أو يضع عتبات ودرجات بلا أساس. لذلك يعتمد هذا القطاع فصلًا واضحًا بين أدوات روافد المحلية والمقاييس المنشورة ذات المصادر والحقوق الخاصة بها.</p></div><div className={styles.methodGrid}>
      <article><h3>أسئلة مرتبطة بالمحور</h3><p>كل متابعة تستخدم أربعة محاور، ولكل محور أربعة أسئلة عن الحضور، الأثر الوظيفي، السياق، والحاجة إلى تعديل أو دعم. لم يعد هناك قالب من ثلاثة أسئلة مكررة لكل شيء.</p></article>
      <article><h3>لا درجة إجمالية مختلقة</h3><p>الإنهاك والأمان والدعم ليست متغيرًا واحدًا. لذلك لا نحول المحاور المختلفة إلى نسبة واحدة تبدو دقيقة وهي ليست كذلك.</p></article>
      <article><h3>الخصوصية افتراضيًا</h3><p>لا يرسل محرك المتابعة الإجابات إلى الخادم، ولا يستخدم Local Storage أو Session Storage. تحديث الصفحة يمسح الإجابات.</p></article>
      <article><h3>المقياس المعروف يبقى مقياسًا معروفًا</h3><p>المقاييس الخارجية مثل PHQ-9 وGAD-7 وWHO-5 وAUDIT وPSQI وMBI وPROMIS وK10/K6 وPSS وZBI لا تُعاد تسميتها كأدوات روافد، ولا تُنسخ بنودها أو درجاتها ما لم تكن النسخة وحقوق الاستخدام والتطبيق التفاعلي مثبتة بوضوح.</p></article>
    </div></section>

    <section className={`${styles.shell} ${styles.directory}`} aria-labelledby="monitor-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>أدوات روافد للمتابعة</span><h2 id="monitor-title">اختر الموضوع الأقرب لما تريد ملاحظته</h2><p>هذه الأدوات ليست اختبارات تشخيصية ولا مقاييس نفسية مقننة. استخدمها للمقارنة مع نفسك عبر الوقت، ولتجهيز أمثلة محددة يمكن مناقشتها مع شخص داعم أو مختص.</p></div>{assessmentCategories.map((category) => <section className={styles.group} key={category}><h3>{category}</h3><div className={styles.grid}>{assessmentMonitors.filter((row) => row.category === category).map((row) => <Link className={styles.card} href={`/assessment-lab/${row.slug}`} key={row.slug}><h4>{row.title}</h4><p>{row.axes.join(' · ')}</p><span>ابدأ المتابعة ←</span></Link>)}</div></section>)}</section>

    <section className={`${styles.shell} ${styles.instruments}`} aria-labelledby="instrument-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>مقاييس وأدوات ذات مصدر خارجي</span><h2 id="instrument-title">10 صفحات تفصل الأداة الأصلية عن أي ترجمة أو إعادة استخدام</h2><p>تحتفظ هذه الصفحات بالمصدر والحالة الحقوقية والمنهجية. لن تعرض روافد بنودًا أو تفسيرًا رقميًا قبل التحقق من النسخة العربية المصرح بها وطريقة الحساب الرسمية وشروط النشر على الويب.</p></div><div className={styles.grid}>{sourceInstruments.map((row) => <Link className={styles.card} href={`/assessment-lab/${row.slug}`} key={row.slug}><h3>{row.title}</h3><p>{row.period}</p><span>المصدر وحالة الاستعادة ←</span></Link>)}</div></section>

    <section className={`${styles.shell} ${styles.evidence}`} aria-labelledby="evidence-title"><span className={styles.eyebrow}>الإطار العلمي</span><h2 id="evidence-title">الفحص الذاتي جزء مساعد، وليس بديلًا عن الرعاية</h2><p>تؤكد منظمة الصحة العالمية في إرشاداتها الحديثة لعام 2026 أن تدخلات المساعدة الذاتية النفسية يمكن أن توسع الوصول إلى دعم قائم على الأدلة عندما تكون منظمة ومطبقة ضمن حدود واضحة، كما تؤكد أن الرعاية الذاتية تكمل النظام الصحي ولا تستبدله.</p><div className={styles.sourceLinks}><a href="https://www.who.int/publications/i/item/9789240120785" target="_blank" rel="noreferrer">WHO 2026: Psychological self-help interventions</a><a href="https://www.who.int/news-room/questions-and-answers/item/self-care-for-health-and-well-being" target="_blank" rel="noreferrer">WHO 2026: Self-care for health and well-being</a><a href="https://www.who.int/en/news-room/questions-and-answers/item/stress" target="_blank" rel="noreferrer">WHO 2026: Stress Q&A</a></div></section>

    <section className={`${styles.shell} ${styles.specialistCta}`}><div><strong>لا تريد نتيجة آلية بل تقييمًا حقيقيًا؟</strong><p>يمكنك استخدام دليل المختصين أو صفحة التحضير للتقييم لتنظيم الأعراض والأسئلة قبل الموعد.</p></div><div className={styles.ctaLinks}><Link href="/specialists">دليل المختصين</Link><Link href="/guided-assessment">التحضير للتقييم</Link></div></section>

    <section className={`${styles.shell} ${styles.reviewNote}`}><strong>تمت المراجعة من قبل فريق روافد</strong><p>تشمل المراجعة الفصل بين المتابعة الذاتية والتشخيص، سلامة الخصوصية، وضوح اللغة، حفظ المصادر، وعدم اختلاق درجات أو صلاحية سيكومترية غير مثبتة.</p></section>
    <section className={`${styles.shell} ${styles.safety}`}><h2>حدود السلامة</h2><p>إذا كان هناك خطر فوري على النفس أو الآخرين، عنف، فقدان شديد للاتصال بالواقع، حالة طبية حادة أو تدهور سريع في الأداء، فلا تنتظر نتيجة أداة. اطلب مساعدة طارئة أو تقييمًا مهنيًا مناسبًا للموقف. هذه الأدوات لا تقدم تشخيصًا ولا قرار علاج.</p><Link href="/medical-review-policy">منهجية المراجعة العلمية</Link></section>
  </main><SiteFooter/></>;
}
