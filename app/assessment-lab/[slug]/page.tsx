import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AssessmentMonitorRunner from '@/components/assessment-monitor-runner';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { assessmentSlugs, getAssessmentItemCount, getAssessmentMonitor, getAssessmentReferences, getSourceInstrument } from '@/lib/assessment-lab/catalog';
import { absoluteSiteUrl, breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from '../assessment-lab.module.css';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return assessmentSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const monitor = getAssessmentMonitor(slug);
  const instrument = getSourceInstrument(slug);
  if (!monitor && !instrument) return {};
  const title = monitor?.title ?? instrument!.title;
  return buildSeoMetadata({
    title,
    description: monitor
      ? `${monitor.summary} أداة روافد عربية بملخص وصفي غير تشخيصي، تعمل دون إرسال الإجابات أو حفظها.`
      : `${instrument!.summary} تعرّف إلى الغرض والمصدر وحدود التفسير وحالة النسخة العربية وحقوق الاستخدام.`,
    path: `/assessment-lab/${slug}`,
    index: true,
    follow: true,
    keywords: monitor ? [monitor.title, monitor.category, ...monitor.domains.map((domain) => domain.title), 'اختبر نفسك'] : [instrument!.title, instrument!.source, 'أداة تحرٍ', 'حقوق الاختبارات'],
  });
}

export default async function AssessmentLabDetail({ params }: { params: Params }) {
  const { slug } = await params;
  const monitor = getAssessmentMonitor(slug);
  const instrument = getSourceInstrument(slug);
  if (!monitor && !instrument) notFound();
  const title = monitor?.title ?? instrument!.title;
  const breadcrumbs = breadcrumbJsonLd([{ name: 'الرئيسية', path: '/' }, { name: 'اختبر نفسك', path: '/assessment-lab' }, { name: title, path: `/assessment-lab/${slug}` }]);
  const applicationJsonLd = monitor ? {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: monitor.title,
    url: absoluteSiteUrl(`/assessment-lab/${monitor.slug}`),
    description: monitor.summary,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Any',
    inLanguage: 'ar',
    isAccessibleForFree: true,
    audience: { '@type': 'Audience', audienceType: monitor.audience },
    offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD' },
  } : null;

  return <><SiteHeader /><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }} />
    {applicationJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationJsonLd).replace(/</g, '\\u003c') }} />}
    <section className={styles.detailHero}><div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-lab">اختبر نفسك</Link><span>/</span><span aria-current="page">{title}</span></nav>
      {monitor ? <div className={styles.detailHeroLayout}><div><span className={styles.eyebrow}>أداة روافد الأصلية · إصدار تطويري {monitor.version}</span><h1>{monitor.title}</h1><p>{monitor.summary}</p><div className={styles.detailBadges}><span>{monitor.category}</span><span>{monitor.recallPeriod}</span><span>{getAssessmentItemCount(monitor)} بندًا</span><span>{monitor.estimatedMinutes} دقائق</span></div></div><aside><strong>ليست أداة تشخيص</strong><p>تعطي ملخصًا وصفيًا لإجاباتك في هذه الجلسة. لم تُقنن بعد على عينة عربية، ولا توجد لها حدود سريرية أو معيار للمقارنة.</p></aside></div> : <div className={styles.detailHeroLayout}><div><span className={styles.eyebrow}>دليل مصدر وحقوق · لا توجد بنود أو درجة</span><h1>{instrument!.title}</h1><p>{instrument!.summary}</p><div className={styles.detailBadges}><span>{instrument!.statusLabel}</span><span>{instrument!.period}</span></div></div><aside><strong>لماذا هذه ليست نسخة من الاختبار؟</strong><p>الاسم والغرض لا يكفيان لإعادة النشر. النص العربي وطريقة الحساب والسياق والحقوق يجب أن تكون مثبتة من مصدر يمكن تتبعه.</p></aside></div>}
    </div></section>

    {monitor ? <>
      <section className={`${styles.shell} ${styles.toolOverview}`} aria-labelledby="overview-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>خريطة الأداة</span><h2 id="overview-title">أربعة مجالات منفصلة، بلا مجموع كلي</h2><p>تتضمن كل منطقة بنودًا تصف صعوبات محتملة وبندًا يصف موردًا داعمًا. بعد الإكمال تُعرض إجاباتك كما اخترتها داخل كل مجال، من دون نسبة أو ترتيب أو فئة شدة أو مقارنة معيارية.</p></div><div className={styles.domainGrid}>{monitor.domains.map((domain, index) => <article key={domain.id}><span>{String(index + 1).padStart(2, '0')}</span><h3>{domain.title}</h3><p>{domain.action}</p></article>)}</div></section>
      <div className={styles.shell}><AssessmentMonitorRunner monitor={monitor} /></div>
      <section className={`${styles.shell} ${styles.evidence}`} aria-labelledby="evidence-title"><div className={styles.sectionHeading}><span className={styles.eyebrow}>مصادر البناء والسياق</span><h2 id="evidence-title">ماذا تثبت هذه المراجع؟</h2><p>ساعدت المراجع في تحديد المفاهيم وحدود السلامة وطريق التطوير. لا تجعل البنود مقننة ولا تثبت صدق نتيجتها؛ ذلك يحتاج دراسات مباشرة على الأداة نفسها.</p></div><div className={styles.referenceGrid}>{getAssessmentReferences(monitor.referenceIds).map((reference) => <article key={reference.id}><span>{reference.organization}</span><h3><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></h3><p>{reference.role}</p></article>)}</div></section>
    </> : <>
      <section className={`${styles.shell} ${styles.instrumentGuide}`} aria-labelledby="guide-title">
        <div className={styles.statusPanel}><span className={styles.eyebrow}>حالة النشر في روافد</span><h2 id="guide-title">{instrument!.statusLabel}</h2><p>{instrument!.note}</p><a className={styles.officialLink} href={instrument!.sourceUrl} target="_blank" rel="noreferrer">فتح المصدر الرسمي في نافذة جديدة ↗</a></div>
        <div className={styles.guideGrid}>
          <article><span>01</span><h3>الغرض المقصود</h3><p>{instrument!.intendedUse}</p></article>
          <article><span>02</span><h3>لماذا لا نعرض البنود؟</h3><p>{instrument!.whyNoItems}</p></article>
          <article><span>03</span><h3>الحقوق والنسبة</h3><p>{instrument!.rightsNote}</p></article>
          <article><span>04</span><h3>ما الخطوة الصحيحة؟</h3><p>للاستخدام المهني أو البحثي، ارجع إلى المصدر الرسمي ووثائق النسخة اللغوية وطريقة الحساب وشروط الاستخدام. للاستكشاف الشخصي، اختر أداة روافد الأصلية ذات الحدود الواضحة.</p></article>
        </div>
      </section>
      <section className={`${styles.shell} ${styles.sourceBoundary}`}><h2>التحرّي لا يساوي التشخيص</h2><p>حتى النسخة الصحيحة من أداة منشورة لا تستبدل التاريخ الصحي أو المقابلة أو فحص الأسباب الطبية أو تقدير السلامة. تفسيرها مسؤولية مستخدم مؤهل ضمن الغرض الذي طُورت له.</p><div><Link href="/assessment-lab">استكشف أدوات روافد الأصلية</Link><Link href="/medical-review-policy">منهجية المراجعة العلمية</Link></div></section>
    </>}

    <section className={`${styles.shell} ${styles.safety}`}><div><span className={styles.eyebrow}>حدود السلامة</span><h2>لا تنتظر أداة عند الخطر</h2></div><p>التغير الشديد أو السريع، تعطّل الاحتياجات الأساسية، العنف، فقدان الاتصال بالواقع، أو أي خطر فوري على النفس أو الآخرين يحتاج مساعدة مناسبة بدل الاعتماد على نتيجة إلكترونية. استخدم خدمات الطوارئ المحلية في الحالات العاجلة.</p><p><Link href="/specialists">العثور على مختص</Link> · <Link href="/centers">العثور على مركز</Link> · <Link href="/guided-assessment">التحضير لموعد</Link></p></section>
  </main><SiteFooter /></>;
}
