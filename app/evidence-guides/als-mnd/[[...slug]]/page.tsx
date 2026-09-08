import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { absoluteSiteUrl, buildSeoMetadata } from '@/lib/seo';

const MAP = 'https://www.als-mnd.org/about-us/als-mnd-health-literacy-map/';
const DIRECTORY = 'https://www.als-mnd.org/find-als-mnd-association/';
const PALLIATIVE = '/content/palliative-care-als-motor-neuron-disease';
const CAPABILITIES = '/capabilities/amyotrophic-lateral-sclerosis/';

type Params = Promise<{ slug?: string[] }>;
type Section = { title: string; paragraphs?: string[]; bullets?: string[]; ordered?: string[] };
type PageDef = { slug: string; title: string; description: string; sections: Section[] };

const pages: Record<string, PageDef> = {
  '': {
    slug: '',
    title: 'ALS/MND: مسار عربي لمحو الأمية الصحية واتخاذ القرار',
    description: 'مسار عربي منظم وفق محاور ALS/MND Health Literacy Map: فهم المرض، العيش معه، العلاج والرعاية، واتخاذ إجراء، مع إحالات موثوقة وحدود واضحة.',
    sections: [
      {
        title: 'لماذا مسار وليس تعريفًا للمرض فقط؟',
        paragraphs: ['بعد تشخيص ALS/MND لا يحتاج الشخص تعريف المرض وحده؛ يحتاج إلى معرفة ما الذي يجب فهمه الآن، وما الذي قد يتغير لاحقًا، ومن يشارك في الرعاية، وكيف يحافظ على التواصل والوظيفة، وأين يجد دعمًا موثوقًا. لذلك نستخدم Health Literacy Map التي تنشرها International Alliance of ALS/MND Associations كإطار تنظيم، مع إعداد عربي مستقل من روافد.'],
      },
      {
        title: 'المحاور الأربعة',
        bullets: ['فهم ALS/MND: التشخيص، التباين بين الأشخاص، الأسئلة التي تحتاج توضيحًا، وكيفية تقييم المعلومة.', 'العيش مع ALS/MND: التواصل، الحركة، التغذية، التنفس، الأسرة، التقنية المساعدة والتخطيط اليومي.', 'العلاج والرعاية: أهداف التدخلات، الفريق متعدد التخصصات، المراقبة، الرعاية التلطيفية والسلامة.', 'اتخاذ إجراء: تجهيز الزيارة، العثور على جمعية أو شبكة، المشاركة في القرار وفهم اختلاف الخدمات بين البلدان.'],
      },
      {
        title: 'لا نكرر ما هو موجود في روافد',
        paragraphs: ['هذا المسار يعمل كطبقة توجيه وربط. عندما تكون لدينا صفحة أكثر تخصصًا عن الرعاية التلطيفية أو القدرات والوصول، نحيل إليها بدل إنشاء نسخة منافسة أو مختصرة منها.'],
      },
    ],
  },
  understanding: {
    slug: 'understanding',
    title: 'فهم ALS/MND بعد التشخيص: خريطة أسئلة لا توقعات جامدة',
    description: 'دليل عربي لتنظيم فهم ALS/MND بعد التشخيص: ما الذي نعرفه، ما الذي يختلف بين الأشخاص، وكيف نتحقق من المعلومات ونجهز الأسئلة.',
    sections: [
      { title: 'ابدأ بما تحتاج معرفته الآن', paragraphs: ['محو الأمية الصحية لا يعني حفظ كل التفاصيل دفعة واحدة. الهدف هو بناء معرفة مرحلية تسمح للشخص والأسرة بفهم الخيارات والمشاركة في القرار دون تحويل المعلومات العامة إلى توقع فردي جامد.'] },
      { title: 'ستة أسئلة تأسيسية', ordered: ['ما المصطلح الذي يستخدمه فريقي: ALS أم MND، وما المقصود به في حالتي؟', 'ما الذي يدعم التشخيص، وما البدائل التي جرى استبعادها؟', 'ما الوظائف المتأثرة الآن، وما الذي نراقبه مع الوقت؟', 'من أعضاء الفريق الذين قد أحتاجهم، ومتى؟', 'ما العلامات التي تستدعي تواصلًا سريعًا أو عاجلًا؟', 'ما المعلومات التي تخص بلدي أو نظامي الصحي ولا يجوز نقلها مباشرة من مصدر أجنبي؟'] },
      { title: 'فلتر المعلومة', bullets: ['افصل بين وصف المرض وبين توصية علاجية فردية.', 'تحقق من الجهة الناشرة وتاريخ المعلومة وسياقها الجغرافي.', 'لا تعامل تجربة شخص واحد كتوقع لمسارك.', 'إذا تعارضت معلومة عامة مع تعليمات فريقك، اطلب تفسير الاختلاف بدل تعديل العلاج ذاتيًا.'] },
    ],
  },
  living: {
    slug: 'living',
    title: 'العيش مع ALS/MND: الوظيفة والتواصل والأسرة والتقنية المساعدة',
    description: 'خريطة عربية للاحتياجات اليومية في ALS/MND: الحركة، التواصل، التغذية، التنفس، الأسرة، التقنية المساعدة والتخطيط المبكر.',
    sections: [
      { title: 'الجودة اليومية جزء من المعرفة الصحية', paragraphs: ['الوظيفة والمشاركة وما يهم الشخص لا تقل أهمية عن أسماء التخصصات. التخطيط المبكر قد يقلل القرارات المتأخرة تحت ضغط، خصوصًا في التواصل والوصول والدعم المنزلي.'] },
      { title: 'مجالات يجب ألا تضيع', bullets: ['التواصل: ناقش البدائل ووسائل التواصل المعزز أو البديل مبكرًا عندما تظهر الحاجة.', 'الحركة والوصول: راقب التعب والسقوط وصعوبة الانتقال والعوائق في المنزل والعمل.', 'البلع والتغذية: أبلغ الفريق عن تغيرات المضغ أو البلع أو الوزن بدل تجربة حلول قد تكون غير آمنة.', 'التنفس: ناقش الأعراض والمراقبة وخطة التواصل عند التغير مع الفريق المختص.', 'الأسرة ومقدم الرعاية: وزع المسؤوليات وابحث عن الدعم قبل الوصول إلى الإنهاك.', 'التقنية المساعدة: قيّم ما يحافظ على الاستقلال والتواصل، لا ما هو أحدث تقنيًا فقط.'] },
    ],
  },
  treatment: {
    slug: 'treatment',
    title: 'علاج ورعاية ALS/MND: كيف تنظّم الحوار مع الفريق متعدد التخصصات؟',
    description: 'دليل عربي لتنظيم فهم العلاج والرعاية في ALS/MND دون وصفات فردية: الأهداف، الفريق متعدد التخصصات، المراقبة، الرعاية التلطيفية والسلامة.',
    sections: [
      { title: 'العلاج ليس قائمة أدوية', paragraphs: ['في ALS/MND تتداخل إدارة المرض والأعراض والوظيفة والتغذية والتنفس والتواصل والدعم النفسي والاجتماعي. قيمة المعرفة الصحية هنا هي فهم هدف كل تدخل، ومن يتابعه، وكيف تُراجع فائدته وعبئه.'] },
      { title: 'لكل تدخل اسأل', ordered: ['ما الهدف المحدد منه؟', 'ما الفائدة المتوقعة، وما الذي لا يستطيع تحقيقه؟', 'ما المخاطر أو الأعباء التي نراقبها؟', 'كيف سنقيس النتيجة ومتى نعيد التقييم؟', 'هل يؤثر في أجهزة أو أدوية أو خطط أخرى؟', 'من أتصل به إذا ظهرت مشكلة؟'] },
      { title: 'الرعاية التلطيفية ليست إيقاف العلاج', paragraphs: ['يمكن أن تعمل الرعاية التلطيفية بالتوازي مع الرعاية العصبية لتخفيف المعاناة، دعم القرارات، مساندة الأسرة، والتعامل مع أعراض واحتياجات معقدة.'], bullets: ['لا تستخدم هذه الصفحة لتغيير دواء أو جهاز تنفسي أو تغذية أو جرعة أو خطة فردية. القرارات تعتمد على التقييم السريري والسياق المحلي وتوفر الخدمات.'] },
    ],
  },
  action: {
    slug: 'action',
    title: 'ALS/MND: اتخاذ إجراء والعثور على دعم موثوق',
    description: 'مسار عربي عملي للاستعداد للزيارة، توثيق الأولويات، العثور على جمعية ALS/MND عبر الدليل الدولي، وفهم حدود نقل الخدمات بين البلدان.',
    sections: [
      { title: 'المعلومة تصبح مفيدة عندما تتحول إلى خطوة', paragraphs: ['اتخاذ الإجراء يشمل معرفة من نسأل، كيف نوثق التغيرات، وكيف نصل إلى دعم مناسب دون افتراض أن خدمة أو تمويلًا أو جهازًا متاحًا في بلد آخر سيكون متاحًا محليًا.'] },
      { title: 'قبل الموعد', bullets: ['دوّن أهم ثلاثة تغيرات منذ الزيارة السابقة.', 'اكتب سؤالين أو ثلاثة تحتاج قرارًا أو تفسيرًا بشأنها.', 'احمل قائمة الأدوية والأجهزة والمكملات كما تُستخدم فعليًا.', 'حدد ما الذي أصبح أصعب في المنزل أو العمل أو التواصل.', 'اطلب وسيلة تواصل أو حضور شخص داعم إذا احتجت.'] },
      { title: 'عند استخدام دليل الجمعيات الدولي', bullets: ['استخدمه كنقطة اكتشاف، ثم تحقق من البلد والتغطية واللغة وحداثة بيانات الاتصال.', 'وجود منظمة في الدليل لا يعني أن خدماتها أو تمويلها أو أجهزتها متاحة لك.', 'لا تعتبر دليل الجمعيات بديلًا عن نظام الرعاية المحلي أو خطة الطوارئ المحلية.'] },
    ],
  },
};

const pageKey = (slug?: string[]) => (slug ?? []).join('/');
const pagePath = (page: PageDef) => page.slug ? `/evidence-guides/als-mnd/${page.slug}/` : '/evidence-guides/als-mnd/';

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const page = pages[pageKey(slug)];
  if (!page) return {};
  return buildSeoMetadata({
    title: page.title,
    description: page.description,
    path: pagePath(page),
    index: true,
    follow: true,
    type: 'website',
    keywords: ['ALS', 'MND', 'التصلب الجانبي الضموري', 'مرض العصبون الحركي', 'محو الأمية الصحية'],
  });
}

export default async function AlsMndHealthLiteracyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const page = pages[pageKey(slug)];
  if (!page) notFound();
  const path = pagePath(page);
  const url = absoluteSiteUrl(path);
  const schema = {
    '@context': 'https://schema.org',
    '@type': page.slug ? ['MedicalWebPage', 'Article'] : 'CollectionPage',
    '@id': `${url}#page`,
    url,
    name: page.title,
    headline: page.title,
    description: page.description,
    inLanguage: 'ar',
    isPartOf: { '@id': `${absoluteSiteUrl('/')}#website` },
    citation: [MAP, DIRECTORY],
  };

  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/evidence-guides/">الأدلة العلمية</Link><span>/</span><Link href="/evidence-guides/als-mnd/">ALS/MND</Link>{page.slug && <><span>/</span><span aria-current="page">{page.title}</span></>}</nav>

      <section className="public-index-hero" aria-labelledby="als-title">
        <span className="eyebrow">ALS/MND · Health Literacy · إعداد عربي مستقل</span>
        <h1 id="als-title">{page.title}</h1>
        <p>{page.description}</p>
        <div className="public-stat-strip"><span>4 محاور معرفة صحية</span><span>مصدر هيكلي دولي قابل للتتبع</span><span>لا تشخيص ولا وصفة فردية</span></div>
      </section>

      <nav className="sector-quick-nav" aria-label="محاور ALS/MND">
        <Link href="/evidence-guides/als-mnd/understanding/">فهم ALS/MND</Link>
        <Link href="/evidence-guides/als-mnd/living/">العيش مع ALS/MND</Link>
        <Link href="/evidence-guides/als-mnd/treatment/">العلاج والرعاية</Link>
        <Link href="/evidence-guides/als-mnd/action/">اتخاذ إجراء</Link>
      </nav>

      {page.sections.map((section) => <section className="section related-content-section" key={section.title}>
        <div className="section-heading"><h2>{section.title}</h2></div>
        {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
        {section.ordered && <ol>{section.ordered.map((item) => <li key={item}>{item}</li>)}</ol>}
      </section>)}

      <section className="section related-content-section" aria-labelledby="als-related-title">
        <div className="section-heading"><span>لا تكرار للمعرفة</span><h2 id="als-related-title">المسارات المتخصصة الموجودة في روافد</h2></div>
        <ul>
          <li><Link href={PALLIATIVE}>الرعاية التلطيفية في ALS/MND: التنفس والبلع والتواصل والقرارات ←</Link></li>
          <li><Link href={CAPABILITIES}>مسار القدرات والوصول في التصلب الجانبي الضموري ←</Link></li>
        </ul>
      </section>

      <section className="section related-content-section" aria-labelledby="als-source-title">
        <div className="section-heading"><span>المصدر والحدود</span><h2 id="als-source-title">الإطار الأصلي والدليل الدولي</h2></div>
        <p><a href={MAP} target="_blank" rel="noopener noreferrer">ALS/MND Health Literacy Map — International Alliance of ALS/MND Associations ↗</a></p>
        <p><a href={DIRECTORY} target="_blank" rel="noopener noreferrer">دليل جمعيات ALS/MND حول العالم لدى Alliance ↗</a></p>
        <p><strong>حد الادعاء:</strong> المحتوى العربي هنا إعداد مستقل من Health Renewal / روافد. استخدام إطار Alliance والإحالة إلى موارده لا يعني أن Alliance راجعت هذه الصفحات أو اعتمدتها أو أيدت روافد، ولا يعني أن خدمات أي جمعية متاحة في الأردن أو في بلد القارئ.</p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
