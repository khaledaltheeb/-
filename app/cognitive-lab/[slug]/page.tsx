import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CognitiveLabRunner from '@/components/cognitive-lab-runner';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { cognitiveTools, getCognitiveTool, getRelatedCognitiveTools } from '@/lib/cognitive-lab/catalog';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';

type Params = Promise<{ slug: string }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return cognitiveTools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getCognitiveTool(slug);
  if (!tool) return {};
  return buildSeoMetadata({
    title: tool.title,
    description: tool.summary,
    path: `/cognitive-lab/${tool.slug}`,
    index: true,
    follow: true,
    type: 'article',
    keywords: [tool.title, tool.category, 'تدريب معرفي', 'مختبر القدرات', 'منصة روافد'],
  });
}

export default async function CognitiveToolPage({ params }: { params: Params }) {
  const { slug } = await params;
  const tool = getCognitiveTool(slug);
  if (!tool) notFound();
  const related = getRelatedCognitiveTools(tool);
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'مختبر القدرات', path: '/cognitive-lab' },
    { name: tool.title, path: `/cognitive-lab/${tool.slug}` },
  ]);
  const learningResourceSchema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    '@id': `${SITE_URL}/cognitive-lab/${tool.slug}#learning-resource`,
    url: `${SITE_URL}/cognitive-lab/${tool.slug}`,
    name: tool.title,
    description: tool.summary,
    inLanguage: 'ar',
    educationalUse: 'practice',
    learningResourceType: 'interactive cognitive training activity',
    isAccessibleForFree: true,
    provider: { '@id': `${SITE_URL}/#organization` },
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };

  return (
    <>
      <SiteHeader />
      <main className="cognitive-lab-page cognitive-tool-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResourceSchema).replace(/</g, '\\u003c') }} />

        <section className="cognitive-tool-hero">
          <div className="cognitive-shell">
            <nav className="cognitive-breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/cognitive-lab">مختبر القدرات</Link><span>/</span><span>{tool.title}</span></nav>
            <div className="cognitive-tool-hero__grid">
              <div>
                <span className="cognitive-kicker">{tool.category}</span>
                <h1>{tool.title}</h1>
                <p>{tool.summary}</p>
                <div className="cognitive-tool-badges">
                  <span>تعليمي غير تشخيصي</span>
                  <span>5 مستويات</span>
                  <span>10 محاولات لكل جلسة</span>
                  <span className={`cognitive-status cognitive-status--${tool.difficultyStatus}`}>{tool.difficultyStatus === 'verified' ? 'تدرج مختبر' : 'التدرج قيد المراجعة'}</span>
                </div>
              </div>
              <aside>
                <span>طريقة الاستخدام</span>
                <p>{tool.instructions}</p>
                <small>هيئ مكانًا هادئًا واستخدم الجهاز وطريقة الإدخال نفسيهما إذا أردت مقارنة جلساتك ببعضها.</small>
              </aside>
            </div>
          </div>
        </section>

        <div className="cognitive-shell cognitive-runner-wrap">
          <CognitiveLabRunner tool={tool} />
        </div>

        <section className="cognitive-shell cognitive-reading" aria-labelledby="cognitive-reading-title">
          <div className="cognitive-reading__main">
            <span className="cognitive-kicker">افهم النتيجة قبل استخدامها</span>
            <h2 id="cognitive-reading-title">ماذا يقدم هذا النشاط، وماذا لا يقدم؟</h2>
            <p>يقدم {tool.title} تدريبًا قصيرًا على اتباع قاعدة محددة داخل بيئة رقمية مضبوطة. النتيجة تلخص ما حدث في عشر محاولات فقط: عدد الإجابات الصحيحة، نسبة الدقة، والزمن الوسيط بعد ظهور السؤال أو الإشارة. هذه الأرقام وصف للجلسة وليست سمة ثابتة للشخص.</p>
            <p>قد تتغير النتيجة مع فهم التعليمات، حجم الشاشة، لوحة المفاتيح أو اللمس، جودة الصوت، الانشغال، النوم، الألم، اللغة، أو التعود على المهمة. لهذا لا يحول المحرك الزمن والدقة إلى «عمر معرفي» أو «معدل ذكاء» أو تشخيص، ولا يقارن نتيجتك بعينة سكانية غير موثقة.</p>

            <h2>كيف تستفيد منه بطريقة منهجية؟</h2>
            <ol>
              <li><strong>ثبّت الظروف:</strong> استخدم الجهاز نفسه وفي وقت متقارب إن كنت تراقب تغيرك الشخصي.</li>
              <li><strong>ابدأ بالدقة:</strong> افهم القاعدة أولًا، ولا تجعل السرعة هدفًا قبل استقرار الإجابة.</li>
              <li><strong>استخدم جلسات قصيرة:</strong> عشر محاولات تكفي للتدريب الأولي وتقلل أثر الإرهاق والتكرار.</li>
              <li><strong>اقرأ التفسير:</strong> بعد كل إجابة يعرض النشاط سبب الاختيار، ثم ينتظر قرارك للانتقال.</li>
              <li><strong>قارن نفسك بنفسك فقط:</strong> إذا كررت النشاط، راقب اتجاهًا عبر عدة جلسات بدل تفسير نتيجة منفردة.</li>
            </ol>

            <h2>كيف صُممت الخصوصية؟</h2>
            <p>تُولد المحاولات داخل المتصفح، ولا ترسل منصة روافد الاختيارات أو أزمنة الاستجابة أو سجل الجلسات إلى Supabase. يمكن للمتصفح حفظ آخر الجلسات محليًا لتسهيل المقارنة الذاتية؛ يظهر زر المسح بجانب السجل، ويظل النشاط صالحًا حتى إذا منع المتصفح التخزين المحلي.</p>

            <h2>أسئلة شائعة</h2>
            <div className="cognitive-faq">
              <details><summary>هل هذه نتيجة تشخيصية؟</summary><p>لا. النشاط تعليمي قصير ولا يحقق شروط التقييم السريري أو النفسي العصبي، ولا يجمع تاريخًا وظيفيًا أو سياقًا فرديًا.</p></details>
              <details><summary>هل المستوى الخامس يعني قدرة أعلى؟</summary><p>لا. المستوى يغير حمل المهمة وقاعدتها داخل هذا النشاط. اختيار مستوى مريح أو صعب هو تفضيل تدريب، وليس تصنيفًا للشخص.</p></details>
              <details><summary>لماذا لا توجد درجة مركبة واحدة؟</summary><p>دمج الدقة والزمن يحتاج نموذجًا موثقًا ومرجعًا صالحًا. لذلك نعرض القياسات الخام المفهومة كلًا على حدة.</p></details>
              <details><summary>هل يمكن استخدام النشاط مع طفل أو متدرب؟</summary><p>يمكن استخدامه للتعلم أو التدريب بإشراف مناسب وفهم للتعليمات، لكن لا ينبغي تحويل النتيجة إلى تقرير تشخيصي أو قرار تعليمي منفرد.</p></details>
            </div>
          </div>
          <aside className="cognitive-reading__aside">
            <span>بروتوكول جلسة جيدة</span>
            <ul>
              <li>اقرأ التعليمات بصوت أوضح عند الحاجة.</li>
              <li>أوقف الجلسة إذا أصبحت الإجابة عشوائية.</li>
              <li>لا تقارن اللمس بلوحة المفاتيح كأنهما ظرف واحد.</li>
              <li>دوّن السياق إذا كانت المقارنة الذاتية مهمة لك.</li>
            </ul>
          </aside>
        </section>

        <section className="cognitive-shell cognitive-related" aria-labelledby="cognitive-related-title">
          <div className="cognitive-section-heading"><div><span>تابع التعلم</span><h2 id="cognitive-related-title">أنشطة مرتبطة</h2></div><Link href="/cognitive-lab">عرض المختبر كاملًا</Link></div>
          <div>
            {related.map((item) => <article key={item.slug}><span>{item.category}</span><h3><Link href={`/cognitive-lab/${item.slug}`}>{item.title}</Link></h3><p>{item.summary}</p></article>)}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
