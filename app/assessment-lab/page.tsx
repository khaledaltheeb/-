import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { assessmentCategories, assessmentMonitors, sourceInstruments } from '@/lib/assessment-lab/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from './assessment-lab.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'مختبر المتابعة الذاتية والأدوات المصدرية',
  description: '36 أداة متابعة غير تشخيصية مستعادة من الموقع القديم بمحرك موحد آمن، مع صفحات مصدر منفصلة للمقاييس المعروفة دون نسخ أو تسجيل درجات قبل تثبيت النسخة العربية وحقوق الاستخدام.',
  path: '/assessment-lab',
  index: true,
  follow: true,
  keywords: ['متابعة ذاتية', 'الصحة النفسية', 'متابعة النوم', 'متابعة الضغط النفسي', 'PHQ-9', 'GAD-7', 'WHO-5', 'AUDIT'],
});

export default function AssessmentLabPage() {
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'مختبر المتابعة', path: '/assessment-lab' }]);
  return <><SiteHeader/><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}/>
    <section className={styles.hero}><div className={styles.shell}><nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">مختبر المتابعة</span></nav><span className={styles.eyebrow}>Assessment Lab · rebuilt safely</span><h1>متابعة منظمة بلا «درجة» مختلقة</h1><p>أعاد الموقع القديم استخدام محرك واحد عبر 36 أداة متابعة محلية، لكنه حوّل الإجابات إلى نسبة عامة رغم أن المحاور تجمع أحيانًا بين الصعوبة وعوامل الحماية. النسخة الجديدة تحفظ المحاور والأسئلة والروابط التاريخية، وتزيل الاستنتاج العددي غير الصالح. أما المقاييس المعروفة فتُفصل عن أدوات روافد المحلية ولا تُنسخ أو تُسجل آليًا قبل تثبيت المصدر العربي ومتطلبات إعادة الاستخدام.</p><div className={styles.facts}><span><strong>36</strong> متابعة محلية</span><span><strong>4</strong> أدوات مصدرية منفصلة</span><span><strong>0</strong> درجات تشخيصية محلية</span><span><strong>0</strong> إجابات مخزنة</span></div></div></section>

    <section className={`${styles.shell} ${styles.method}`} aria-labelledby="method-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>ما الذي أصلحناه؟</span><h2 id="method-title">حفظ الوظيفة المفيدة وإزالة الاستنتاج غير المدعوم</h2></div><div className={styles.methodGrid}><article><h3>المحاور الأصلية محفوظة</h3><p>استُخرجت أسماء الأدوات ومحاورها من مولّد الإنتاج القديم نفسه، لا من صفحات HTML التي تضخمت لاحقًا بنصوص ربط آلي.</p></article><article><h3>لا مجموع موحد</h3><p>تُعرض الإجابات بندًا بندًا ومحورًا بمحور. لا نحول «الأمان» و«الإنهاك» مثلًا إلى اتجاه عددي واحد.</p></article><article><h3>لا تخزين خفي</h3><p>المحرك القديم كان يستخدم Local Storage. النسخة الجديدة لا ترسل ولا تحفظ الإجابات؛ الطباعة اختيار المستخدم.</p></article><article><h3>المقياس ليس متابعة محلية</h3><p>PHQ-9 وGAD-7 وWHO-5 وAUDIT لها مصادر وشروط واستخدامات مختلفة، لذلك لا تُعرض كأنها أدوات أنشأتها روافد.</p></article></div></section>

    <section className={`${styles.shell} ${styles.directory}`} aria-labelledby="monitor-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>أدوات المتابعة غير التشخيصية</span><h2 id="monitor-title">اختر ما تريد متابعته خلال الأسبوع الماضي</h2><p>هذه أدوات تنظيم وملاحظة ذاتية وليست مقاييس نفسية مقننة. استخدمها للمقارنة مع نفسك والسياق، لا للمقارنة مع الآخرين.</p></div>{assessmentCategories.map((category) => <section className={styles.group} key={category}><h3>{category}</h3><div className={styles.grid}>{assessmentMonitors.filter((row) => row.category === category).map((row) => <Link className={styles.card} href={`/assessment-lab/${row.slug}`} key={row.slug}><h4>{row.title}</h4><p>{row.axes.join(' · ')}</p><span>فتح المتابعة ←</span></Link>)}</div></section>)}</section>

    <section className={`${styles.shell} ${styles.instruments}`} aria-labelledby="instrument-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>أدوات ذات مصدر خارجي</span><h2 id="instrument-title">المقاييس الأربعة القديمة محفوظة كصفحات مصدر</h2><p>هذا فصل مقصود للسلامة العلمية والحقوقية. افتح الصفحة لمعرفة المصدر الرسمي وحالة الاستعادة، بدل عرض ترجمة أو نتيجة غير مثبتة.</p></div><div className={styles.grid}>{sourceInstruments.map((row) => <Link className={styles.card} href={`/assessment-lab/${row.slug}`} key={row.slug}><h3>{row.title}</h3><p>{row.period}</p><span>المصدر وحالة الاستعادة ←</span></Link>)}</div></section>

    <section className={`${styles.shell} ${styles.safety}`}><h2>حدود السلامة</h2><p>إذا كان هناك خطر فوري على النفس أو الآخرين، أو عنف، أو فقدان شديد للاتصال بالواقع، أو حالة طبية حادة، فلا تنتظر إكمال أداة متابعة. اطلب مساعدة طارئة محلية مناسبة للموقف. هذه الأدوات لا تقدم تشخيصًا ولا قرار علاج.</p><Link href="/medical-review-policy">منهجية المراجعة العلمية</Link></section>
  </main><SiteFooter/></>;
}
