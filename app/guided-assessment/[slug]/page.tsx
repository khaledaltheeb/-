import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import GuidedAssessmentChecklist from '@/components/guided-assessment-checklist';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import {
  buildGuidedAssessmentQuestions,
  getLegacyGuidedAssessment,
  getTopicGuidance,
  getTopicReferences,
} from '@/lib/guided-assessment/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';
import styles from '../guided-assessment.module.css';

type Params = Promise<{ slug: string }>;

// These 100 preserved aliases are intentionally rendered from local versioned
// data at request time. OpenNext/Cloudflare was returning 500s while serving the
// prerendered SSG aliases even though all 100 pages built successfully. Dynamic
// rendering removes that cache/SSG dependency without introducing a database or
// session dependency; middleware keeps anonymous GET/HEAD requests local.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const item = getLegacyGuidedAssessment(slug);
  if (!item) return {};
  return buildSeoMetadata({
    title: item.legacyTitle,
    description: `أسئلة منظمة للتحضير لمناقشة ${item.topic.label} ${item.audienceLabel} مع مقدم رعاية، من دون تشخيص ذاتي أو مجموع نقاط أو تخزين للإجابات.`,
    path: '/guided-assessment',
    index: true,
    follow: true,
  });
}

export default async function LegacyGuidedAssessmentPage({ params }: { params: Params }) {
  const { slug } = await params;
  const item = getLegacyGuidedAssessment(slug);
  if (!item) notFound();
  const questions = buildGuidedAssessmentQuestions(item);
  const topicGuidance = getTopicGuidance(item.topic.key);
  const topicReferences = getTopicReferences(item.topic.key);
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
            <div className={styles.aliasNotice}>هذه الصفحة واحدة من 100 رابط قديم جرى دمجها في محرك موحد لتقليل التكرار. المرجع الأساسي المعتمد كعنوان canonical هو <Link href="/guided-assessment">بنك الأسئلة الاسترشادية</Link>.</div>
          </div>
        </section>

        <div className={styles.shell}>
          <GuidedAssessmentChecklist title={`تحضير حول ${item.topic.label} ${item.audienceLabel}`} questions={questions} />
        </div>

        {topicGuidance ? (
          <section className={`${styles.shell} ${styles.preparation}`} aria-labelledby="topic-focus-title">
            <div className={styles.sectionHeading}>
              <span className={styles.eyebrow}>تركيز خاص بالموضوع</span>
              <h2 id="topic-focus-title">أسئلة إضافية قد تجعل مناقشة {item.topic.label} أكثر دقة</h2>
              <p>هذه ليست بنود اختبار ولا تُجمع في درجة. اختر منها ما ينطبق واكتب مثالًا أو واقعة محددة تساعد المختص على فهم السياق.</p>
            </div>
            <ul>
              {topicGuidance.focusPrompts.map((prompt) => <li key={prompt}>{prompt}</li>)}
            </ul>
          </section>
        ) : null}

        {topicGuidance ? (
          <section className={`${styles.shell} ${styles.boundary}`} aria-labelledby="topic-boundary-title">
            <div>
              <span className={styles.eyebrow}>حدود التفسير</span>
              <h2 id="topic-boundary-title">ما الذي لا يمكن استنتاجه من هذه الصفحة؟</h2>
            </div>
            <p>{topicGuidance.boundary}</p>
            <Link href="/medical-review-policy">منهجية المراجعة</Link>
          </section>
        ) : null}

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
          <p>{topicGuidance?.safety ?? 'إذا كان هناك خطر فوري على النفس أو الآخرين، أو فقدان شديد للاتصال بالواقع، أو عنف جارٍ، أو عجز شديد عن تلبية الاحتياجات الأساسية، فالأولوية لطلب مساعدة طارئة محلية مناسبة للموقف. هذه الصفحة ليست خدمة طوارئ.'}</p>
          {topicGuidance?.safety ? <p>ويبقى كذلك أن أي خطر فوري على النفس أو الآخرين أو فقدان شديد للاتصال بالواقع أو عجز شديد عن تلبية الاحتياجات الأساسية يتقدم على استكمال هذه القائمة.</p> : null}
        </section>

        <section className={`${styles.shell} ${styles.sourcesCompact}`} aria-labelledby="sources-title">
          <h2 id="sources-title">المراجع المرتبطة بهذا الموضوع والمنهج</h2>
          <ul>
            {topicReferences.map((reference) => (
              <li key={reference.id}>
                <a href={reference.url} target="_blank" rel="noreferrer">{reference.title}</a>
                {' — '}{reference.note}
              </li>
            ))}
          </ul>
          <p>المراجع تدعم طريقة تنظيم الحوار والموضوعات التي تستحق المناقشة؛ وجودها لا يجعل هذه الصفحة أداة تشخيص أو مقياسًا مقننًا. <Link href="/medical-review-policy">اقرأ منهجية المراجعة العلمية</Link> أو ارجع إلى <Link href="/guided-assessment">جميع الموضوعات</Link>.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
