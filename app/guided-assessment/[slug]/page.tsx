import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GuidedAssessmentChecklist from '@/components/guided-assessment-checklist';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import {
  buildGuidedAssessmentQuestions,
  getLegacyGuidedAssessment,
  guidedAssessmentLegacySlugs,
  guidedAssessmentReferences,
} from '@/lib/guided-assessment/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from '../guided-assessment.module.css';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return guidedAssessmentLegacySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = getLegacyGuidedAssessment(slug);
  if (!item) return {};
  return buildSeoMetadata({
    title: item.legacyTitle,
    description: `أسئلة منظمة للتحضير لمناقشة ${item.topic.label} ${item.audienceLabel} مع مقدم رعاية، من دون تشخيص ذاتي أو مجموع نقاط أو تخزين للإجابات.`,
    path: '/guided-assessment',
    index: false,
    follow: false,
  });
}

export default async function LegacyGuidedAssessmentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = getLegacyGuidedAssessment(slug);
  if (!item) notFound();
  const questions = buildGuidedAssessmentQuestions(item);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الأسئلة الاسترشادية', path: '/guided-assessment' },
    { name: item.topic.label, path: `/guided-assessment/${item.legacySlug}` },
  ]);

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />
        <section className={styles.detailHero}>
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/guided-assessment">الأسئلة الاسترشادية</Link><span>/</span><span>{item.topic.label}</span></nav>
            <span className={styles.eyebrow}>رابط تاريخي محفوظ · {item.audienceLabel}</span>
            <h1>{item.legacyTitle}</h1>
            <p className={styles.lead}>استخدم هذه القائمة لتجهيز أمثلة وأسئلة لموعد مهني. الاسم التاريخي للصفحة لا يثبت تشخيصًا، وبعض الأسماء القديمة مثل «إدمان الإنترنت» أو «النرجسية» تحتاج تقييمًا مهنيًا وسياقًا أدق قبل استخدامها كتشخيص.</p>
            <div className={styles.aliasNotice}>هذه الصفحة واحدة من 100 رابط قديم جرى دمجها في محرك موحد لتقليل التكرار. المرجع الأساسي والقابل للفهرسة هو <Link href="/guided-assessment">بنك الأسئلة الاسترشادية</Link>.</div>
          </div>
        </section>

        <div className={styles.shell}>
          <GuidedAssessmentChecklist title={`تحضير حول ${item.topic.label} ${item.audienceLabel}`} questions={questions} />
        </div>

        <section className={`${styles.shell} ${styles.preparation}`} aria-labelledby="prepare-appointment-title">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>قبل الموعد</span>
            <h2 id="prepare-appointment-title">معلومات عملية قد تستحق التجهيز</h2>
          </div>
          <ul>
            <li>تسلسل زمني مختصر: متى بدأت الملاحظة، وما أهم التغيرات منذ ذلك الوقت.</li>
            <li>قائمة الأدوية الموصوفة وغير الموصوفة والمكملات، مع أي آثار جانبية ملحوظة.</li>
            <li>أمثلة محددة على أثر المشكلة في النوم أو الدراسة أو العمل أو العلاقات أو العناية بالنفس.</li>
            <li>التقييمات أو العلاجات السابقة وما الذي أفاد أو لم يفد، من دون إيقاف دواء أو تغييره بناءً على هذه الصفحة.</li>
            {item.audience === 'child' ? <li>معلومات من المدرسة أو مقدم الرعاية الآخر عند توفرها، مع مراعاة خصوصية الطفل وحقه في التعبير عن تجربته.</li> : null}
          </ul>
        </section>

        <section className={`${styles.shell} ${styles.safety}`} aria-labelledby="safety-first-title">
          <h2 id="safety-first-title">متى لا تنتظر استكمال القائمة؟</h2>
          <p>إذا كان هناك خطر فوري على النفس أو الآخرين، أو فقدان شديد للاتصال بالواقع، أو عنف جارٍ، أو عجز شديد عن تلبية الاحتياجات الأساسية، فالأولوية لطلب مساعدة طارئة محلية مناسبة للموقف. هذه الصفحة ليست خدمة طوارئ.</p>
        </section>

        <section className={`${styles.shell} ${styles.sourcesCompact}`} aria-labelledby="sources-title">
          <h2 id="sources-title">مراجع المنهج</h2>
          <ul>
            {guidedAssessmentReferences.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a></li>)}
          </ul>
          <p><Link href="/medical-review-policy">اقرأ منهجية المراجعة العلمية</Link> أو ارجع إلى <Link href="/guided-assessment">جميع الموضوعات</Link>.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
