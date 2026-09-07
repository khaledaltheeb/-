import Link from 'next/link';
import ContentRenderer from '@/components/content-renderer';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { getLegacyPreservedPage } from '@/lib/legacy-preserved-page';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = buildSeoMetadata({
  title: 'دليل فهم التقييم والاختبارات والمقاييس النفسية والتربوية',
  description: 'دليل عربي منهجي لفهم الفرق بين الفحص والتقييم والتشخيص، واختيار أدوات القياس، وقراءة الصدق والثبات والمعايير والتكييف العربي والنتائج دون إساءة تفسير الدرجات.',
  path: '/assessments',
  index: true,
  follow: true,
  keywords: ['التقييم النفسي', 'المقاييس النفسية', 'الاختبارات النفسية', 'الصدق والثبات', 'التكييف العربي للمقاييس'],
});

const gateways = [
  {
    title: 'المتابعة الذاتية',
    body: 'أدوات روافد المحلية لملاحظة التغير عبر الزمن دون تشخيص أو مجموع زائف.',
    href: '/assessment-lab',
    cta: 'فتح Assessment Lab',
  },
  {
    title: 'المقاييس والأدوات المهنية',
    body: 'سجل الحقوق والمصادر وطريقة الإدارة والتفسير للأدوات المستخدمة عالميًا.',
    href: '/assessment-measures',
    cta: 'فتح مكتبة المقاييس',
  },
  {
    title: 'ما النتائج التي ينبغي قياسها؟',
    body: 'Core Outcome Sets تحدد ماذا ينبغي قياسه في سياق معين؛ وهي ليست أداة قياس بحد ذاتها.',
    href: '/core-outcome-sets',
    cta: 'فتح Core Outcome Sets',
  },
  {
    title: 'التحضير لموعد التقييم',
    body: 'أسئلة استرشادية لتنظيم الأمثلة والسياق والأسئلة قبل مقابلة المختص، دون درجة أو تشخيص آلي.',
    href: '/guided-assessment',
    cta: 'فتح الأسئلة الاسترشادية',
  },
] as const;

const legacyMeasures = [
  { name: 'GAD-7', href: '/assessment-lab/gad-7-plus', note: 'صفحة المصدر والحقوق والنسخة العربية الموثقة قبل أي استخدام.' },
  { name: 'PHQ-9', href: '/assessment-lab/phq-9-plus', note: 'صفحة المصدر والحقوق وحدود الاستخدام مع تنبيه السلامة.' },
  { name: 'WHO-5', href: '/assessment-lab/who-5-plus', note: 'صفحة المصدر الحالية وحدود النسخ اللغوية والحقوق دون ادعاء نسخة عربية رسمية غير متحققة.' },
] as const;

export default async function AssessmentsLanding() {
  const legacyPage = await getLegacyPreservedPage('/assessments/').catch(() => null);

  return (
    <>
      <SiteHeader />
      <main className="article-shell">
        <article>
          <header className="article-hero">
            <span className="eyebrow">منهجية القياس · لا مكتبة تشخيص ذاتي موازية</span>
            <h1>كيف تختار أداة تقييم وتفهم نتيجتها دون أن تحول الدرجة إلى تشخيص؟</h1>
            <p>هذه الصفحة هي بوابة المنهجية في روافد. مهمتها شرح جودة القياس وحدود التفسير، ثم توجيهك إلى السطح الصحيح: متابعة ذاتية، مقياس مهني، Core Outcome Set، أو تحضير لموعد تقييم.</p>
          </header>

          <section className="section" aria-labelledby="assessment-map-title">
            <div className="section-heading">
              <span>خريطة واضحة</span>
              <h2 id="assessment-map-title">أربع أسئلة مختلفة لا ينبغي خلطها</h2>
              <p>توحيد هذه المسارات يمنع تكرار الأداة نفسها في أكثر من قسم ويجعل المصدر والحقوق والتفسير قابلًا للتتبع.</p>
            </div>
            <div className="related-content-grid">
              {gateways.map((gateway) => (
                <article key={gateway.href}>
                  <h3>{gateway.title}</h3>
                  <p>{gateway.body}</p>
                  <Link href={gateway.href}>{gateway.cta} ←</Link>
                </article>
              ))}
            </div>
          </section>

          <section className="section" aria-labelledby="selection-title">
            <div className="section-heading">
              <span>قبل اختيار أي مقياس</span>
              <h2 id="selection-title">ابدأ بالقرار الذي تريد دعمه، لا باسم الأداة</h2>
            </div>
            <div className="related-content-grid">
              <article><h3>1. ما البناء الذي تريد قياسه؟</h3><p>حدد المفهوم بدقة: أعراض، أداء وظيفي، جودة حياة، قدرة معرفية، خطر سريري، أو نتيجة علاج. تشابه الأسماء لا يعني أن الأدوات قابلة للاستبدال.</p></article>
              <article><h3>2. لمن صُممت الأداة؟</h3><p>العمر، التشخيص، اللغة، الثقافة، الإعداد السريري أو المجتمعي وطريقة الإدارة قد تغيّر صلاحية الاستنتاج.</p></article>
              <article><h3>3. ما خصائص القياس؟</h3><p>راجع الصدق والثبات، خطأ القياس، الحساسية للتغير، بنية العوامل، والمعايير أو القيم المرجعية المناسبة للسكان المستهدفين.</p></article>
              <article><h3>4. هل النص والاستخدام مسموحان؟</h3><p>وجود اسم المقياس في دراسة لا يمنح تلقائيًا حق نسخ بنوده أو ترجمته أو إعادة توزيعه أو استخدام درجة مشتقة منه.</p></article>
              <article><h3>5. هل العربية متحققة فعلًا؟</h3><p>الترجمة وحدها ليست تكييفًا ثقافيًا. يجب تتبع مصدر النسخة العربية، طريقة الترجمة، السكان الذين دُرست عليهم وخصائصها السيكومترية.</p></article>
              <article><h3>6. ماذا ستفعل بالنتيجة؟</h3><p>حدد مسبقًا هل الغرض فرز أولي، متابعة تغير، وصف شدة، قرار إحالة أو بحث. حدود القطع لا تنتقل تلقائيًا بين السكان والسياقات.</p></article>
            </div>
          </section>

          <section className="section" aria-labelledby="psychometrics-title">
            <div className="section-heading">
              <span>قراءة الخصائص السيكومترية</span>
              <h2 id="psychometrics-title">الصدق والثبات ليسا ختمًا عامًا على الأداة</h2>
            </div>
            <p>السؤال الأدق ليس «هل الأداة صادقة؟» بل «ما الدليل الذي يدعم هذا التفسير لهذه الدرجة، عند هؤلاء الأشخاص، ولهذا الاستخدام؟». الثبات العالي لا يثبت أن الأداة تقيس البناء المقصود، والارتباط بدراسة واحدة لا يكفي لتعميم الصلاحية على لغة أو فئة جديدة.</p>
            <ul>
              <li><strong>Content validity:</strong> هل البنود تمثل المجال المقصود وبصياغة مفهومة وذات صلة؟</li>
              <li><strong>Construct validity:</strong> هل نمط العلاقات والاختلافات يتفق مع النظرية والفرضيات المسبقة؟</li>
              <li><strong>Reliability:</strong> ما مقدار عدم اليقين وخطأ القياس عند تكرار القياس أو بين المقيمين؟</li>
              <li><strong>Responsiveness:</strong> هل تستطيع الأداة التقاط تغير ذي معنى عندما يكون الغرض متابعة التحسن أو التدهور؟</li>
              <li><strong>Interpretability:</strong> هل توجد طريقة مسؤولة لفهم معنى الدرجة أو التغير بدل الاكتفاء برقم مجرد؟</li>
            </ul>
          </section>

          <section className="section" aria-labelledby="arabic-adaptation-title">
            <div className="section-heading">
              <span>التكييف العربي</span>
              <h2 id="arabic-adaptation-title">ترجمة الكلمات ليست كافية لنقل القياس</h2>
            </div>
            <p>قد يتغير معنى البند بسبب اللهجة، السياق الأسري أو المدرسي، أمثلة الحياة اليومية، الوصمة، القراءة، أو طريقة الإجابة. لذلك يجب التمييز بين نسخة مترجمة منشورة، ونسخة عربية مرخصة، ودراسة تحقق عربية، ونسخة ثبت تكافؤها عبر مجموعات أو بلدان مختلفة؛ هذه مستويات مختلفة من الدليل.</p>
          </section>

          <section className="section" aria-labelledby="result-title">
            <div className="section-heading">
              <span>تفسير النتيجة</span>
              <h2 id="result-title">درجة واحدة لا تصف الشخص كاملًا</h2>
            </div>
            <p>نتيجة الفحص قد تساعد على تنظيم سؤال أو متابعة تغير، لكنها لا تستبدل التاريخ السريري، الملاحظة، المعلومات من مصادر متعددة، الفحص الطبي عند الحاجة، أو الحكم المهني. كما أن التغير العددي الصغير قد يقع داخل خطأ القياس، بينما تغير وظيفي مهم قد لا ينعكس في مجموع واحد.</p>
          </section>

          <section className="section" aria-labelledby="legacy-measures-title">
            <div className="section-heading">
              <span>المسارات القديمة محفوظة</span>
              <h2 id="legacy-measures-title">GAD-7 وPHQ-9 وWHO-5 لها الآن تمثيل واحد موثّق</h2>
              <p>أوقفنا النسخ التفاعلية الموازية داخل هذا القسم. الروابط القديمة لم تُحذف؛ تحول المستخدم إلى صفحة المصدر والحقوق المقابلة حتى لا تتعارض نسختان من الأداة أو معلومات الترخيص.</p>
            </div>
            <div className="related-content-grid">
              {legacyMeasures.map((measure) => (
                <article key={measure.name}>
                  <h3><Link href={measure.href}>{measure.name}</Link></h3>
                  <p>{measure.note}</p>
                  <Link href={measure.href}>فتح الصفحة المصدرية ←</Link>
                </article>
              ))}
            </div>
          </section>

          {legacyPage ? (
            <section className="section" aria-labelledby="preserved-methodology-title">
              <div className="section-heading">
                <span>المحتوى المنهجي المحفوظ</span>
                <h2 id="preserved-methodology-title">الدليل التعليمي السابق بعد فصل الأدوات المكررة</h2>
              </div>
              <div className="article-body">
                <ContentRenderer bodyJson={legacyPage.body_json} bodyText={legacyPage.body_text} recordId={legacyPage.source_path} />
              </div>
            </section>
          ) : null}

          <section className="section" aria-labelledby="review-policy-title">
            <div className="section-heading">
              <span>حوكمة</span>
              <h2 id="review-policy-title">استخدم سجل المصدر قبل استخدام أي أداة</h2>
            </div>
            <p>إذا كان الاستخدام سريريًا أو بحثيًا أو مؤسسيًا، راجع النص الأصلي، الترخيص، النسخة اللغوية، تعليمات الإدارة والحساب، والدليل السكاني قبل التطبيق.</p>
            <div className="actions">
              <Link className="button" href="/assessment-measures">المقاييس والأدوات المستخدمة عالميًا</Link>
              <Link className="button" href="/medical-review-policy">منهجية المراجعة العلمية</Link>
            </div>
          </section>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
