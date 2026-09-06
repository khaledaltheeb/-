import type { Metadata } from 'next';
import Link from 'next/link';
import CognitiveLabBrowser from '@/components/cognitive-lab-browser';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { cognitiveToolCategories, cognitiveTools } from '@/lib/cognitive-lab/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
  title: 'مختبر القدرات والأنشطة المعرفية',
  description: '100 نشاط عربي للانتباه والذاكرة والتعلم والاستدلال واللغة وسرعة المعالجة والمرونة، بخصوصية محلية ونتائج وصفية من دون تشخيص أو مقارنة معيارية.',
  path: '/cognitive-lab',
  index: true,
  follow: true,
});

const facts = [
  { value: '100', label: 'نشاط معرفي وتعليمي يعمل داخل مختبر روافد' },
  { value: '47', label: 'نشاطًا جديدًا أضيف لسد فجوات التغطية المعرفية' },
  { value: '14', label: 'نشاطًا اجتاز عقد التدرج الدلالي من خمس درجات' },
  { value: '0', label: 'إجابات تُرسل إلى الخادم أو Supabase' },
];

const methodologyReferences = [
  {
    label: 'NIH / National Institute on Aging — NIH Toolbox',
    url: 'https://www.nia.nih.gov/research/resource/nih-toolbox',
    note: 'مثال مرجعي على بطارية متعددة المجالات طُورت لتوفير قياس موحد، لا دليل تحقق لأنشطة روافد نفسها.',
  },
  {
    label: 'Weintraub et al. — Cognition assessment using the NIH Toolbox',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23479546/',
    note: 'يوضح أن بناء بطارية معرفية معيارية يتطلب تعريف المجالات، دراسة الثبات، وتأمين الصدق التقاربي والتمييزي والمعايير السكانية.',
  },
  {
    label: 'Zelazo et al. — NIH Toolbox executive-function validation',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24960301/',
    note: 'مثال على التحقق من مهام المرونة والكبح والانتباه مقابل مقاييس مرجعية واختبار إعادة التطبيق.',
  },
  {
    label: 'International Test Commission / ATP — Technology-Based Assessment Guidelines',
    url: 'https://www.intestcom.org/page/27',
    note: 'إطار دولي لمتطلبات العدالة والصدق وجودة التصميم والتقديم والتسجيل في التقييمات الرقمية؛ النسخة الرسمية محدثة في يوليو/تموز 2025.',
  },
  {
    label: 'Calamia et al. — Meta-analysis of practice effects in neuropsychological assessment',
    url: 'https://pubmed.ncbi.nlm.nih.gov/22540222/',
    note: 'يبين أن التحسن عند إعادة الاختبار قد ينتج من التعود وتذكر المهمة والاستراتيجية، لذلك لا نفسر تحسن جلسة لاحقة تلقائيًا كتغير معرفي عام.',
  },
  {
    label: 'Bonnechère et al. — Brain-training systematic review and meta-analysis',
    url: 'https://pubmed.ncbi.nlm.nih.gov/34251578/',
    note: 'تظهر الأدلة أن الانتقال إلى قدرات بعيدة عن المهمة ليس مضمونًا؛ لذا لا تنسب روافد نتائج نشاط قصير إلى تحسن عام في الذاكرة أو الذكاء أو الوقاية من التدهور.',
  },
  {
    label: 'Meta-analysis of computerised working-memory training (2026)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/41820527/',
    note: 'دليل حديث على أن آثار التدريب تعتمد على نوع المهمة والجرعة والالتزام والعمر؛ لا يصلح كتحقق مباشر لأي نشاط بعينه في روافد.',
  },
];

export default function CognitiveLabPage() {
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'مختبر القدرات والأنشطة المعرفية', path: '/cognitive-lab' },
  ]);

  return (
    <>
      <SiteHeader />
      <main className="cognitive-lab-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />

        <section className="cognitive-hero">
          <div className="cognitive-shell cognitive-hero__grid">
            <div className="cognitive-hero__copy">
              <nav className="cognitive-breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span>مختبر القدرات</span></nav>
              <span className="cognitive-kicker">تعلم ذاتي · خصوصية بالتصميم · توسعة بحثية 2026</span>
              <h1>100 نشاط معرفي واضح، يعمل فعلًا، ولا يدّعي قياس ما لا يقيسه</h1>
              <p>مختبر عربي مستقل يغطي الانتباه والذاكرة والتعلم والاستدلال واللغة والمعالجة العددية والبصرية والمكانية والتحكم التنفيذي. يعرض الدقة والزمن الوسيط والمقارنة الذاتية فقط؛ لا درجة ذكاء، ولا تشخيص، ولا ترتيب بين المستخدمين.</p>
              <div className="cognitive-hero__actions">
                <a className="cognitive-primary-link" href="#cognitive-directory-title">استعراض الأنشطة</a>
                <a href="#cognitive-method">كيف بنينا المختبر؟</a>
              </div>
            </div>
            <aside className="cognitive-hero__panel" aria-label="مبادئ المختبر">
              <span>عقد الثقة</span>
              <h2>النتيجة لك، وتبقى على جهازك</h2>
              <ul>
                <li><strong>نتائج وصفية:</strong> عدد صحيح، دقة، وزمن وسيط.</li>
                <li><strong>انتقال بقرارك:</strong> لا سؤال يتقدم تلقائيًا بعد الإجابة.</li>
                <li><strong>إتاحة عملية:</strong> أزرار أصلية، لوحة مفاتيح، قارئ شاشة، وبديل نصي للصوت في الأدوات السمعية.</li>
                <li><strong>حفظ محلي:</strong> سجل اختياري يمكن مسحه من الجهاز نفسه.</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="cognitive-shell cognitive-quick-facts" aria-labelledby="quick-facts-title">
          <div className="cognitive-section-heading cognitive-section-heading--compact">
            <div><span>المعلومة السريعة</span><h2 id="quick-facts-title">ما الذي يميز هذا الإصدار؟</h2></div>
            <p>مرّر أفقيًا لقراءة البطاقات</p>
          </div>
          <div className="cognitive-fact-track" role="list" aria-label="معلومات سريعة قابلة للتمرير الأفقي">
            {facts.map((fact) => <article role="listitem" key={fact.label}><strong>{fact.value}</strong><p>{fact.label}</p></article>)}
          </div>
        </section>

        <div className="cognitive-shell">
          <CognitiveLabBrowser tools={cognitiveTools} categories={cognitiveToolCategories} />
        </div>

        <section className="cognitive-method" id="cognitive-method">
          <div className="cognitive-shell">
            <div className="cognitive-section-heading">
              <div><span>منهج التنفيذ</span><h2>وسعنا التغطية من دون خلط سلامة البرمجية بالصدق السيكومتري</h2></div>
              <p>نجاح البرمجية لا يجعل النشاط مقياسًا سريريًا أو اختبارًا معياريًا؛ لذلك تظل التوسعة الجديدة معلنة بوضوح كأنشطة تعليمية قيد مراجعة التدرج.</p>
            </div>
            <div className="cognitive-method-grid">
              <article><span>01</span><h3>مفتاح إجابة واحد</h3><p>يولد المحرك كل محاولة مع إجابة واحدة موجودة مرة واحدة بين بدائل غير مكررة، ثم يختبر قبولها ورفض كل بديل خاطئ آليًا.</p></article>
              <article><span>02</span><h3>تغطية معرفية أوسع</h3><p>أضيفت مجالات كانت أقل تمثيلًا: الذاكرة العرضية وذاكرة المصدر، التعلم، سرعة المعالجة، الإدراك البصري والمكاني، الاستدلال الكمي والسببي، اللغة، ومراقبة الأداء.</p></article>
              <article><span>03</span><h3>طبقتان معزولتان</h3><p>تبقى الأدوات الـ53 الأصلية على مشغلها الحالي، بينما تعمل الأدوات الـ47 الجديدة عبر محرك ومشغل منفصلين لتقليل مخاطر الانحدار البرمجي.</p></article>
              <article><span>04</span><h3>خصوصية بلا حساب</h3><p>تشغيل النشاط لا يحتاج تسجيل دخول. الإجابات لا تعبر الشبكة، والسجل إن حُفظ يبقى في التخزين المحلي ويمكن حذفه من الجهاز.</p></article>
            </div>
          </div>
        </section>

        <section className="cognitive-shell cognitive-reading" aria-labelledby="cognitive-evidence-title">
          <div className="cognitive-reading__main">
            <span className="cognitive-kicker">الأساس العلمي وحدود الاستدلال</span>
            <h2 id="cognitive-evidence-title">ما الذي نحتاجه قبل أن نسمي نشاطًا رقميًا «اختبارًا معرفيًا مقننًا»؟</h2>
            <p>المهمة الرقمية قد تكون صحيحة برمجيًا ومفيدة للتدريب، لكن ذلك لا يثبت أنها تقيس البناء المعرفي المقصود بدقة، ولا أن نتيجتها قابلة للمقارنة بين الأشخاص أو الأجهزة أو الأعمار. بطاريات معيارية مثل NIH Toolbox مرت بمراحل مستقلة لتعريف البناء، واختيار المهام، ودراسة الثبات وإعادة الاختبار والصدق التقاربي والتمييزي وبناء المعايير. أنشطة روافد لا تدّعي أنها اجتازت هذه المراحل ما لم نوثق ذلك مستقبلًا بدراسة مستقلة.</p>

            <div className="cognitive-method-grid">
              <article><span>01</span><h3>الصحة البرمجية ليست صدقًا سيكومتريًا</h3><p>اختباراتنا الآلية تتحقق من منطق السؤال والإجابة ومستويات الصعوبة، لكنها لا تنتج معامل ثبات أو صدق أو حساسية/نوعية أو معايير سكانية.</p></article>
              <article><span>02</span><h3>أثر الممارسة متوقع</h3><p>إعادة النشاط قد تحسن الأداء بسبب فهم القاعدة والتعود وتذكر الاستراتيجية. لهذا نعرض المقارنة الذاتية كسياق وصفي ولا نسمّي التحسن المتكرر «تحسنًا معرفيًا عامًا».</p></article>
              <article><span>03</span><h3>الانتقال البعيد غير مفترض</h3><p>التدرب على مهمة قد يحسن المهمة نفسها أو مهامًا قريبة منها، لكن انتقال الأثر إلى الذكاء أو الدراسة أو الوظيفة اليومية أو الوقاية من التدهور يحتاج أدلة مستقلة ولا يُستنتج من جلسة داخل المختبر.</p></article>
              <article><span>04</span><h3>الجهاز واللغة جزء من القياس</h3><p>الشاشة واللمس ولوحة المفاتيح والصوت وزمن الاستجابة واللغة والتعليمات قد تغير الأداء. لذلك لا نضع معايير سكانية ولا نقارن أجهزة مختلفة كما لو كانت ظرفًا واحدًا.</p></article>
              <article><span>05</span><h3>التقنين يحتاج عينة وخطة تحليل</h3><p>أي انتقال مستقبلي إلى «اختبار» يتطلب بروتوكولًا منشورًا، عينة مناسبة، ثباتًا، صدقًا، دراسة تحيز وعدالة وإتاحة، ثم قواعد تفسير محددة للفئة والسياق.</p></article>
              <article><span>06</span><h3>اللغة العربية ليست ترجمة لفظية فقط</h3><p>المفردات واتجاه الكتابة والتعليم والخلفية الثقافية قد تؤثر في مهام اللغة والذاكرة والاستدلال. لذلك لا ننقل معايير إنجليزية إلى نشاط عربي، ولا نعتبر صياغة عربية محلية نسخة معيارية تلقائيًا.</p></article>
            </div>

            <h2>مراجع منهجية نستخدمها لضبط الادعاءات</h2>
            <p>هذه المراجع تبرر <strong>حدود المنهج</strong> وطريقة تفسير النتائج؛ وهي ليست «شهادة صلاحية» للأنشطة المئة في روافد.</p>
            <div className="cognitive-faq">
              {methodologyReferences.map((reference) => (
                <details key={reference.url}>
                  <summary>{reference.label}</summary>
                  <p>{reference.note}</p>
                  <a href={reference.url} target="_blank" rel="noreferrer">فتح المصدر</a>
                </details>
              ))}
            </div>
          </div>
          <aside className="cognitive-reading__aside">
            <span>قاعدة التفسير</span>
            <ul>
              <li>لا تشخيص من الدقة أو الزمن.</li>
              <li>لا IQ أو «عمر معرفي» من جلسة قصيرة.</li>
              <li>لا مقارنة سكانية بلا معايير عربية مناسبة.</li>
              <li>لا ادعاء انتقال إلى الحياة اليومية بلا دراسة مستقلة.</li>
              <li>لا تفسير لتحسن الإعادة قبل التفكير بأثر الممارسة.</li>
            </ul>
          </aside>
        </section>

        <section className="cognitive-shell cognitive-boundary" aria-labelledby="cognitive-boundary-title">
          <div>
            <span>حدود مسؤولة</span>
            <h2 id="cognitive-boundary-title">المقاييس الصحية منفصلة عن الأنشطة المعرفية</h2>
          </div>
          <p>لم نضع WHO-5 أو PHQ-9 أو GAD-7 أو AUDIT داخل هذا المختبر. كل مقياس صحي يحتاج مصدر الإصدار، والترخيص، والترجمة الموثقة، وطريقة الحساب، وسؤال الأثر عند وجوده، ومراجعة بشرية قبل إتاحته. وبالمثل، لا تُقدَّم الأنشطة المعرفية الجديدة كاختبارات معيارية ما لم تمر مستقبلًا بدراسة تحقق مستقلة.</p>
          <Link href="/medical-review-policy">قراءة منهجية المراجعة العلمية</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
