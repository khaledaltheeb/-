import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';
import styles from '@/components/institutional-assurance-page.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'إطار روافد للتقييم المؤسسي للتقنيات الصحية والمساندة',
  description: 'إطار غير ترويجي لتقييم التقنيات الصحية والتأهيلية والتعليمية المساندة: الغرض المقصود، الدليل، حدود الادعاء، سير العمل، العربية وRTL، الوصولية، الخصوصية، القياس، والتنفيذ قبل أي pilot.',
  path: '/institutions/technology-evaluation',
  index: true,
  follow: true,
  keywords: ['assistive technology evaluation', 'rehabilitation technology evaluation', 'Arabic RTL evaluation', 'تقييم التقنيات المساندة', 'تقييم تقنيات التأهيل'],
});

const pillars = [
  ['الغرض المقصود وحدود الاستخدام', 'نحدد من يستخدم التقنية، لأي غرض، وفي أي بيئة، وما الذي لا يجوز استنتاجه منها. نفصل المنتج التعليمي أو المساند عن الجهاز الطبي والتقييم السريري والعلاج.'],
  ['الدليل والادعاءات', 'نربط كل ادعاء مهم بنوع الدليل المناسب، ونفرق بين feasibility وusability وclinical effectiveness وimplementation outcomes. لا نحول دراسة أولية أو وصفًا تسويقيًا إلى إثبات فعالية.'],
  ['السلامة والتنظيم', 'نفحص التنبيهات، موانع الاستخدام، الحاجة إلى إشراف متخصص، مسار التصعيد، الحالة التنظيمية المعلنة، وحدود المسؤولية. لا نفترض اعتمادًا تنظيميًا من وجود المنتج في السوق.'],
  ['سير العمل البشري', 'نرسم أدوار المستخدم والأسرة والمعلم أو المعالج والمشرف، نقاط اتخاذ القرار، التدريب المطلوب، وما يحدث عند تعطل الجهاز أو عدم ملاءمة المخرج.'],
  ['العربية وRTL والوصولية', 'نراجع المصطلحات، اتجاه الواجهة، القيم المختلطة الاتجاه، الإدخال، قارئات الشاشة، التباين، التركيز، أهداف اللمس، بدائل الصوت والبصر، والاختلاف بين ترجمة النص وتعريب التجربة.'],
  ['البيانات والخصوصية', 'نحدد ما يُجمع، أين يخزن، من يستطيع الوصول إليه، مدة الاحتفاظ، النقل إلى أطراف ثالثة، الفصل بين القياس والتحليلات، واحتياجات الأطفال أو البيانات الصحية الحساسة.'],
  ['القياس وقابلية التفسير', 'نحدد outcome قبل القياس، وما إذا كان القياس أداءً أو مشاركة أو خبرة استخدام أو تعلمًا أو وظيفة سريرية. نفصل التغير المرصود عن دلالته السريرية وعن السببية.'],
  ['التنفيذ والاستدامة', 'نفحص التكلفة الفعلية، الأجهزة والاتصال، الدعم الفني، التحديثات، التدريب، قابلية التوسع، العمل في الموارد المحدودة، وما الذي سيبقى بعد انتهاء pilot.'],
] as const;

const tracks = [
  {
    title: 'تقنية تأهيلية أو صحية',
    items: ['intended use وpopulation المقصودة', 'الدليل السريري/الوظيفي وحدوده', 'دور المختص مقابل دور المستخدم', 'السلامة والتصعيد والحالة التنظيمية', 'المخرجات الوظيفية والمشاركة والالتزام', 'الخصوصية والبيانات الصحية والتكامل'],
  },
  {
    title: 'تقنية تعليمية أو مساندة',
    items: ['هدف التعلم أو الوصول الوظيفي', 'ملاءمة المحتوى العربي وطريقة برايل/الصوت/النص', 'دور المتعلم والمعلم والأسرة', 'إتاحة الجهاز والواجهة وRTL', 'قياس التقدم دون تحويله إلى تشخيص', 'العمل في المدارس والمراكز والبيئات منخفضة الاتصال'],
  },
] as const;

const deliverables = [
  ['Evidence map', 'خريطة مختصرة تربط كل ادعاء رئيسي بمصدره ومستوى الدليل والفجوة المتبقية.'],
  ['Risk & boundary register', 'قائمة بالادعاءات المسموحة، الادعاءات التي تحتاج تقييدًا، مخاطر السلامة/الخصوصية، وما يجب ألا تقوله المادة العربية.'],
  ['Arabic/RTL & terminology QA', 'ملاحظات قابلة للتنفيذ على المصطلحات والاتجاه والعناصر المختلطة وقابلية القراءة والوصولية، مع فصل الآلي عن الحكم البشري.'],
  ['Workflow map', 'كيف تدخل التقنية في زيارة، جلسة، صف، مركز أو منزل؛ ومن يتخذ كل قرار وما البديل عند الفشل.'],
  ['Pilot protocol', 'عينة صغيرة، أسئلة محددة، outcomes مسبقة، معايير إيقاف وتصعيد، موافقة وخصوصية، وخطة تحليل قبل توسيع النطاق.'],
  ['Decision note', 'خلاصة مؤسسية: جاهز لـpilot، يحتاج معلومات إضافية، مناسب للتثقيف فقط، أو غير مناسب حاليًا — مع الأسباب لا الانطباعات.'],
] as const;

export default function TechnologyEvaluationPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Rawafid Institutional Technology Evaluation Framework',
    provider: { '@id': `${absoluteSiteUrl('/')}#organization` },
    areaServed: 'Worldwide',
    serviceType: 'Independent evidence, Arabic/RTL, accessibility and implementation evaluation of health, rehabilitation and assistive technologies',
    url: absoluteSiteUrl('/institutions/technology-evaluation'),
  };

  return <div className={styles.page}>
    <SiteHeader />
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={`${styles.shell} ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow}>Evidence · Safety · Arabic/RTL · Accessibility · Implementation</span>
            <h1 className={styles.title}>نقيّم التقنية قبل أن نحولها إلى توصية أو pilot.</h1>
            <p className={styles.lead}>عندما تعرض جهة تقنية صحية أو تأهيلية أو تعليمية مساندة، لا يكفي أن تعمل في العرض التوضيحي. إطار روافد يبدأ من الغرض المقصود والدليل وحدود الادعاء، ثم يختبر ملاءمة سير العمل والعربية وRTL والوصولية والخصوصية والقياس والتنفيذ. النتيجة ليست مادة ترويجية؛ بل قرار موثق يحدد ما نعرفه وما لا نعرفه وما الذي يلزم اختباره.</p>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/institutions/terminology-qa">منهجية العربية والمصطلحات</Link>
              <Link className={styles.secondary} href="/institutions/arabic-rtl-assurance">ضمان العربية وRTL</Link>
            </div>
          </div>
          <aside className={styles.heroCard}>
            <h2>قبل أي تقييم</h2>
            <ul>
              <li>نسخة المنتج أو demo واضحة ومعرّفة.</li>
              <li>intended use والفئة والبيئة المقصودة.</li>
              <li>قائمة الادعاءات والمراجع التي تدعمها.</li>
              <li>سياسة البيانات والخصوصية والحالة التنظيمية عند انطباقها.</li>
              <li>اللغات وطرق الوصول والدعم الفني المتاحة.</li>
            </ul>
          </aside>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Evaluation model</p><h2>ثماني طبقات تمنع التقييم السطحي</h2><p>الطبقات مترابطة، لكن لكل واحدة سؤال قرار مستقل. نجاح الواجهة لا يثبت الفعالية، ووجود دراسة لا يثبت ملاءمة العربية أو المدرسة أو المنزل، والترجمة الجيدة لا تعالج مشكلة خصوصية أو سلامة.</p></div>
        <div className={styles.grid}>{pillars.map(([title, description]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Two tracks</p><h2>المعيار يتكيف مع وظيفة المنتج، لا مع اسمه التجاري</h2></div>
        <div className={styles.twoColumn}>
          {tracks.map((track) => <article className={styles.panel} key={track.title}><h2>{track.title}</h2><ul>{track.items.map((item) => <li key={item}>{item}</li>)}</ul></article>)}
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Outputs</p><h2>المخرجات التي يجب أن تبقى بعد التقييم</h2><p>لا نريد اجتماعًا ينتهي بانطباعات. كل تقييم جيد ينتج أثرًا يمكن مراجعته أو تصحيحه أو استخدامه لبناء pilot صغير.</p></div>
        <div className={styles.grid}>{deliverables.map(([title, description]) => <article className={styles.card} key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.twoColumn}>
          <article className={styles.panel}>
            <h2>بوابة الـpilot</h2>
            <ul>
              <li>سؤال أو فرضية محددة مسبقًا؛ ليس «جرّبوا المنتج وأخبرونا».</li>
              <li>أقل عدد من المشاركين والبيانات اللازمة للإجابة.</li>
              <li>لا اختبار على أطفال أو بيانات صحية حساسة دون حوكمة وموافقة مناسبة للنطاق.</li>
              <li>تعريف مسبق لما يعد نجاحًا، وما يستدعي الإيقاف أو التصعيد.</li>
              <li>عدم استخدام نتائج pilot محدود كدليل فعالية عامة أو اعتماد.</li>
            </ul>
          </article>
          <article className={styles.panel}>
            <h2>حدود الاستقلال</h2>
            <p>إدراج منتج أو جهة في تقييم أو مراسلة أو مصدر لا يعني أن روافد توصي بالشراء أو أن الجهة راجعت روافد أو اعتمدتها. إذا وجد تمويل أو إعارة أو وصول مجاني أو أي تضارب محتمل، يسجل قبل نشر الاستنتاجات المتعلقة به.</p>
            <p>وأي تعريب لمادة محمية أو واجهة أو محتوى تدريبي يحتاج تحديد صاحب الحق والإذن المناسب؛ التقييم اللغوي لا ينشئ حقًا في الترجمة أو إعادة النشر.</p>
          </article>
        </div>
      </section>

      <section className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeader}><p className={styles.kicker}>Rawafid context</p><h2>أصول نستخدمها كبيئة فحص — لا كدليل على نتيجة مسبقة</h2></div>
        <div className={styles.grid}>
          <article className={styles.card}><h3><Link href="/sectors/rehabilitation-functioning">التأهيل والوظيفة والمشاركة</Link></h3><p>سياق لفحص الوظيفة والمشاركة والنتائج ومسارات التأهيل، مع عدم مساواة القياس بالتشخيص.</p></article>
          <article className={styles.card}><h3><Link href="/sectors/special-needs-inclusion">الاحتياجات الخاصة والتربية الدامجة</Link></h3><p>سياق للتقنيات التعليمية والمساندة، التيسيرات، مشاركة الأسرة، والوصول في المدرسة والمجتمع.</p></article>
          <article className={styles.card}><h3><a href="https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit" target="_blank" rel="noreferrer">Arabic/RTL Accessibility Toolkit</a></h3><p>أصل هندسي عام مفتوح المصدر لاختبارات العربية والاتجاه ثنائي الاتجاه والوصولية والتفاعل، منفصل عن التقييم السريري أو ادعاءات المنتج.</p></article>
        </div>
      </section>
    </main>
    <SiteFooter />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
  </div>;
}
