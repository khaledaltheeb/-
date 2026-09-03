import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import LegacyPreservedRoute, { preservedRouteMetadata } from '@/components/legacy-preserved-route';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import registry from '@/data/cochrane/resources-v1.json';

type Params = Promise<{ slug?: string[] }>;
type OfficialResource = (typeof registry.official_resources)[number];
type MsReview = (typeof registry.ms_reviews)[number];

export const dynamic = 'force-dynamic';

const nativePages: Record<string, { title: string; description: string; keywords: string[] }> = {
  '': {
    title: 'موارد كوكرين وقراءة الدليل بالعربية',
    description: 'بوابة عربية مستقلة في منصة روافد لتنظيم الوصول إلى موارد كوكرين، فهم المراجعات المنهجية ودرجة اليقين، وتتبع مراجعات التصلب المتعدد المستخدمة في المسار التجريبي.',
    keywords: ['كوكرين بالعربية', 'Cochrane Arabic', 'المراجعات المنهجية', 'درجة اليقين', 'GRADE', 'التصلب المتعدد'],
  },
  resources: {
    title: 'خريطة موارد كوكرين الرسمية',
    description: 'خريطة عربية منظمة لموارد كوكرين الرسمية: البحث في الأدلة، أساسيات المراجعات المنهجية، التدريب المجاني، GRADE، المجموعات والاستراتيجية العلمية.',
    keywords: ['موارد كوكرين', 'Cochrane resources', 'Evidence Essentials', 'Cochrane Handbook', 'Cochrane Groups'],
  },
  'read-review': {
    title: 'كيف تقرأ مراجعة منهجية من كوكرين؟',
    description: 'منهج عملي عربي لقراءة سؤال المراجعة، حداثة البحث، الدراسات المشمولة، الفائدة والضرر، اليقين، النتائج المفقودة وقابلية نقل الدليل.',
    keywords: ['قراءة مراجعة منهجية', 'Cochrane review', 'تفسير الدليل', 'البحث المنهجي', 'النتائج الصحية'],
  },
  certainty: {
    title: 'درجة اليقين في الدليل: GRADE بالعربية',
    description: 'شرح عربي دقيق لمستويات GRADE الأربعة وعوامل خفض اليقين وكيفية صياغة الاستنتاجات دون تضخيم قوة الدليل.',
    keywords: ['GRADE بالعربية', 'يقين الدليل', 'جودة الدليل', 'Cochrane Handbook', 'risk of bias'],
  },
  ms: {
    title: 'دليل كوكرين والتصلب المتعدد: ثلاث مراجعات مترابطة',
    description: 'قراءة عربية مستقلة لثلاث مراجعات كوكرين حول الآزاثيوبرين، أضرار العلاجات المناعية والتدخلات الغذائية في التصلب المتعدد، مع اليقين والحدود والروابط الأصلية.',
    keywords: ['كوكرين التصلب المتعدد', 'multiple sclerosis Cochrane', 'آزاثيوبرين', 'العلاجات المناعية', 'الغذاء والتصلب المتعدد'],
  },
  'arabic-pilot': {
    title: 'حالة المسار التجريبي لترجمة مواد كوكرين إلى العربية',
    description: 'سجل شفاف لحالة مسار ترجمة ثلاث مواد كوكرين عن التصلب المتعدد إلى العربية، وما أُنجز وما لم يُنجز بعد، ومعايير الجودة المطلوبة قبل النشر.',
    keywords: ['ترجمة كوكرين العربية', 'Arabic translation pilot', 'RTL', 'back translation', 'ضبط جودة الترجمة'],
  },
};

function route(slug: string[] = []) {
  return `/${['cochrane', ...slug].join('/')}/`;
}

function nativeKey(slug: string[] = []) {
  return slug.join('/');
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const key = nativeKey(slug);
  const native = nativePages[key];
  if (!native) return preservedRouteMetadata(route(slug));
  return buildSeoMetadata({
    title: native.title,
    description: native.description,
    path: route(slug),
    index: true,
    follow: true,
    type: key === '' || key === 'resources' ? 'website' : 'article',
    keywords: native.keywords,
    relatedTerms: ['Cochrane', 'المراجعة المنهجية', 'الطب المبني على الدليل', 'منصة روافد'],
  });
}

function SourceBoundary() {
  return <aside className="rawafid-empty" aria-label="حدود النسب والاعتماد">
    <h2>حدود النسب والاعتماد</h2>
    <p>{registry.scope_ar}</p>
    <p><strong>حالة الترجمة الحالية:</strong> {registry.arabic_pilot.public_status_ar}</p>
  </aside>;
}

function ExternalSource({ resource }: { resource: OfficialResource }) {
  return <article className="institutional-sector-card">
    <span className="eyebrow">{resource.kind}</span>
    <h3>{resource.title_ar}</h3>
    <p><span lang="en" dir="ltr">{resource.title_en}</span></p>
    <p>{resource.scope_ar}</p>
    <div className="sector-metrics"><span>{resource.audience_ar.join(' · ')}</span></div>
    <a className="sector-open" href={resource.url} target="_blank" rel="noopener noreferrer">فتح المصدر الرسمي لدى Cochrane ↗</a>
  </article>;
}

function PageFrame({ current, eyebrow, title, intro, children }: { current: string; eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  const path = current ? `/cochrane/${current}/` : '/cochrane/';
  const crumb = current ? [{ name: 'الرئيسية', path: '/' }, { name: 'موارد كوكرين', path: '/cochrane/' }, { name: title, path }] : [{ name: 'الرئيسية', path: '/' }, { name: 'موارد كوكرين', path: '/cochrane/' }];
  const schema = breadcrumbJsonLd(crumb);
  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span>{current ? <><Link href="/cochrane/">موارد كوكرين</Link><span>/</span></> : null}<span aria-current="page">{title}</span></nav>
      <section className="public-index-hero" aria-labelledby="cochrane-page-title">
        <span className="eyebrow">{eyebrow}</span>
        <h1 id="cochrane-page-title">{title}</h1>
        <p>{intro}</p>
        <div className="public-stat-strip"><span>المصدر الأولي قابل للتتبع</span><span>درجة اليقين ظاهرة</span><span>الحدود وعدم اليقين لا تُخفى</span></div>
      </section>
      {children}
    </main>
    <SiteFooter />
  </>;
}

function HubPage() {
  const cards = [
    { href: '/cochrane/resources/', eyebrow: 'Resource map', title: 'خريطة الموارد الرسمية', body: 'مسارات مختارة من مواقع كوكرين الرسمية: الأدلة، التدريب، المنهجية، المجموعات والاستراتيجية والتواصل.' },
    { href: '/cochrane/read-review/', eyebrow: 'Evidence literacy', title: 'كيف تقرأ مراجعة منهجية؟', body: 'ثماني طبقات تمنع القفز من عنوان المراجعة إلى قرار: السؤال، الحداثة، التصميم، الأثر، الضرر، اليقين، الفجوات، والقابلية للنقل.' },
    { href: '/cochrane/certainty/', eyebrow: 'GRADE', title: 'فهم درجة اليقين', body: 'ماذا تعني مرتفعة أو متوسطة أو منخفضة أو منخفضة جداً؟ ولماذا لا تعني درجة اليقين حجم الفائدة؟' },
    { href: '/cochrane/ms/', eyebrow: 'Worked evidence map', title: 'ثلاث مراجعات في التصلب المتعدد', body: 'الآزاثيوبرين، أضرار العلاجات المناعية، والتدخلات الغذائية؛ مع تاريخ البحث، قوة الإشارة، اليقين والحدود.' },
    { href: '/cochrane/arabic-pilot/', eyebrow: 'Transparent status', title: 'حالة المسار التجريبي العربي', body: 'سجل علني دقيق لما استُلم وما لم يُنجز بعد، وخطوات QA والترجمة العكسية والمراجعة قبل أي نشر بوصفه ترجمة كوكرين.' },
    { href: '/cochrane/evidence-academy/', eyebrow: 'Preserved academy', title: 'أكاديمية قراءة الدليل', body: 'المسار التعليمي القائم في روافد لقراءة الفعالية والأضرار والإنصاف ونقل الدليل إلى السياقات العربية.' },
  ];
  return <PageFrame current="" eyebrow="Cochrane evidence navigation · Arabic RTL" title="موارد كوكرين وقراءة الدليل بالعربية" intro="طبقة عربية مستقلة تنظّم الطريق إلى مصادر كوكرين الأصلية وتحوّلها إلى مسارات قراءة قابلة للتتبع. الهدف ليس إعادة نشر مراجعات كوكرين، بل مساعدة القارئ العربي على فهم السؤال والنتيجة ودرجة اليقين والحدود قبل العودة إلى المصدر الأصلي.">
    <section aria-labelledby="hub-map-title"><div className="section-mini-heading"><div><span className="eyebrow">ستة مسارات مترابطة</span><h2 id="hub-map-title">ابدأ من حاجتك، لا من قائمة روابط</h2></div><span>{registry.official_resources.length} موارد رسمية منظمة · {registry.ms_reviews.length} مراجعات تطبيقية · API عام واحد</span></div><div className="institutional-sector-grid">{cards.map((card) => <Link className="institutional-sector-card" href={card.href} key={card.href}><span className="eyebrow">{card.eyebrow}</span><h3>{card.title}</h3><p>{card.body}</p><span className="sector-open">فتح المسار ←</span></Link>)}</div></section>
    <section aria-labelledby="workflow-title"><div className="section-mini-heading"><div><span className="eyebrow">Evidence-to-use pipeline</span><h2 id="workflow-title">كيف تتحول المراجعة إلى معرفة قابلة للاستخدام؟</h2></div><span>دون استبدال الحكم السريري أو النص الأصلي.</span></div><div className="institutional-sector-grid">{['ابدأ بالمصدر الأصلي وDOI أو الصفحة الرسمية.','ثبّت سؤال السكان والتدخل والمقارنة والنتائج.','افحص تاريخ آخر بحث قبل الحكم على حداثة الدليل.','افصل حجم الأثر عن درجة اليقين في الأثر.','اقرأ الضرر والانسحاب والنتائج غير المبلغ عنها مثلما تقرأ الفائدة.','سجّل التباين وعدم الدقة وخطر التحيز وعدم المباشرة.','اختبر قابلية نقل النتائج للسياق المحلي والموارد المتاحة.','ارجع إلى المصدر عند القرار؛ ملخص روافد أداة تنقل لا بديل عن المراجعة.'].map((value, index) => <article className="institutional-sector-card" key={value}><span className="sector-number">{String(index + 1).padStart(2, '0')}</span><h3>{value}</h3></article>)}</div></section>
    <section aria-labelledby="principles-title"><div className="section-mini-heading"><div><span className="eyebrow">قواعد التحرير</span><h2 id="principles-title">حواجز تمنع التضخيم وسوء النسب</h2></div></div><div className="institutional-sector-grid">{registry.principles_ar.map((value) => <article className="institutional-sector-card" key={value}><p>{value}</p></article>)}</div></section>
    <section aria-labelledby="api-title"><div className="section-mini-heading"><div><span className="eyebrow">Machine-readable</span><h2 id="api-title">البيانات نفسها متاحة بصيغة منظمة</h2></div><span>للتدقيق وإعادة الاستخدام داخل أنظمة روافد.</span></div><div className="institutional-sector-grid"><a className="institutional-sector-card" href="/api/v1/cochrane-resource-hub"><span className="eyebrow">JSON · schema versioned</span><h3>واجهة بيانات قسم كوكرين</h3><p>تحتوي سجل الموارد، DOI والمراجعات الثلاث، تواريخ الدليل، الرسائل العربية، درجة اليقين وحالة المسار التجريبي.</p><span className="sector-open">فتح JSON ↗</span></a></div></section>
    <SourceBoundary />
  </PageFrame>;
}

function ResourcesPage() {
  return <PageFrame current="resources" eyebrow="Official-source map" title="خريطة موارد كوكرين الرسمية" intro="اختيار منظم لمصادر كوكرين الأصلية بحسب الوظيفة: العثور على الدليل، تعلم قراءة المراجعات، فهم GRADE، استكشاف الشبكة ومتابعة الاستراتيجية وموارد التواصل. لا ننسخ محتوى المصدر؛ نشرح لماذا قد تحتاجه ونقودك إليه مباشرة.">
    <section aria-labelledby="resource-list-title"><div className="section-mini-heading"><div><span className="eyebrow">Primary sources</span><h2 id="resource-list-title">الموارد حسب الغرض</h2></div><span>كل رابط يقود إلى نطاق Cochrane الرسمي أو منصته التدريبية.</span></div><div className="institutional-sector-grid">{registry.official_resources.map((resource) => <ExternalSource resource={resource} key={resource.id} />)}</div></section>
    <section aria-labelledby="strategy-title"><div className="section-mini-heading"><div><span className="eyebrow">2025–2030</span><h2 id="strategy-title">كيف نقرأ اتجاه كوكرين العلمي؟</h2></div></div><div className="institutional-sector-grid"><article className="institutional-sector-card"><h3>أولويات موضوعية</h3><p>تضع الاستراتيجية العلمية الحالية تركيزاً على صحة الأم والوليد والطفل، والحالات المزمنة المتعددة، والأمراض المعدية، والمناخ والاستدامة. استخدام هذه الخريطة في روافد يعني معرفة أين تتجه منظومة الأدلة، لا افتراض أن المجالات الأخرى غير مهمة.</p></article><article className="institutional-sector-card"><h3>التزامات عابرة للموضوعات</h3><p>الابتكار المنهجي، والإنصاف الصحي، والتعاون وإشراك أصحاب المصلحة، ونزاهة البحث. هذه الالتزامات مفيدة عند تقييم كيف يمكن نقل الدليل إلى العربية وإلى نظم صحية متفاوتة الموارد.</p></article><a className="institutional-sector-card" href="https://www.cochrane.org/about-us/what-we-do/our-scientific-strategy" target="_blank" rel="noopener noreferrer"><span className="eyebrow">Official strategy</span><h3>الاستراتيجية العلمية الأصلية</h3><p>اقرأ الصياغة الكاملة والأولويات من Cochrane مباشرة.</p><span className="sector-open">فتح المصدر ↗</span></a></div></section>
    <SourceBoundary />
  </PageFrame>;
}

function ReadReviewPage() {
  const steps = [
    ['1. حدّد السؤال قبل النتيجة', 'اكتب السكان، التدخل، المقارنة والنتائج المهمة. عنوان واسع مثل «هل يعمل العلاج؟» لا يكفي لفهم ما اختبرته المراجعة فعلاً.'],
    ['2. ثبّت تاريخ آخر بحث', 'تاريخ نشر المراجعة ليس هو تاريخ حداثة الأدلة. قد تنشر مراجعة اليوم لكن يكون آخر بحث فيها أقدم؛ لذلك نسجل الاثنين عندما يكونان متاحين.'],
    ['3. افهم نوع الدراسات', 'التجارب العشوائية تجيب جيداً عن أسئلة فعالية كثيرة، لكنها ليست دائماً المصدر الوحيد أو الأفضل لاكتشاف ضرر نادر أو متأخر.'],
    ['4. لا تقرأ الاتجاه وحده', 'اسأل عن حجم الأثر ومجال الثقة وعدد الأحداث والمشاركين. إشارة نحو الفائدة مع عدم دقة كبيرة ليست نتيجة حاسمة.'],
    ['5. افصل النتيجة عن اليقين', 'قد تكون النتيجة كبيرة لكن اليقين منخفضاً، أو صغيرة واليقين مرتفعاً. GRADE يصف ثقتنا في تقدير الأثر، لا أهميته وحدها.'],
    ['6. اقرأ الأضرار والانسحاب', 'قلة الأحداث الضارة في تجربة قصيرة لا تثبت انعدام الخطر. افحص طريقة جمع الضرر، مدة المتابعة، الانسحاب، والدراسات التي لم تبلغ النتيجة.'],
    ['7. ابحث عما لم يُقَس', 'جودة الحياة، الوظيفة، الإدراك، عبء الأسرة أو النتائج طويلة المدى قد تكون أهم للشخص من مؤشر مخبري لكنها أحياناً غائبة. الغياب نفسه فجوة معرفة.'],
    ['8. اختبر قابلية النقل', 'هل السكان والجرعات والخدمات والمتابعة والتكلفة والبدائل في الدراسات تشبه سياقك؟ لا تنتقل النتيجة تلقائياً بين نظم صحية وثقافات وموارد مختلفة.'],
  ];
  return <PageFrame current="read-review" eyebrow="Critical appraisal pathway" title="كيف تقرأ مراجعة منهجية من كوكرين؟" intro="المراجعة المنهجية تقلل الانتقائية، لكنها لا تعفي القارئ من التفكير. هذا المسار يضع ثماني نقاط فحص بين عنوان المراجعة وبين أي استنتاج عملي، ويستخدم مراجعات التصلب المتعدد الثلاث أمثلة على الحداثة والضرر واليقين والفجوات.">
    <section aria-labelledby="reading-steps"><div className="section-mini-heading"><div><span className="eyebrow">8-point reading protocol</span><h2 id="reading-steps">بروتوكول القراءة</h2></div></div><div className="institutional-sector-grid">{steps.map(([title, body]) => <article className="institutional-sector-card" key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section aria-labelledby="worked-examples"><div className="section-mini-heading"><div><span className="eyebrow">Worked examples</span><h2 id="worked-examples">ثلاثة أخطاء تمنعها هذه الطريقة</h2></div></div><div className="institutional-sector-grid"><article className="institutional-sector-card"><h3>«لم تظهر زيادة واضحة في الضرر» ≠ «العلاج آمن»</h3><p>مراجعة أضرار العلاجات المناعية توضح أن الأحداث الخطيرة قد تكون نادرة وأن الإبلاغ عن الضرر ناقص. عدم القدرة على كشف فرق موثوق قد يكون نتيجة نقص البيانات، لا برهان سلامة.</p><Link className="sector-open" href="/cochrane/ms/">فتح مثال السلامة ←</Link></article><article className="institutional-sector-card"><h3>«قد يقلل الانتكاس» ≠ «ثبت أنه أفضل»</h3><p>في مراجعة الآزاثيوبرين توجد إشارة محتملة إلى خفض الانتكاسات مقارنة بالإنترفيرون بيتا، لكن يقين الدليل منخفض وبعض نتائج الضرر والإعاقة أكثر عدم يقيناً.</p><Link className="sector-open" href="/cochrane/ms/">فتح مثال الفائدة/الضرر ←</Link></article><article className="institutional-sector-card"><h3>«لم يثبت أثر الحمية» ≠ «كل غذاء بلا قيمة صحية»</h3><p>مراجعة التدخلات الغذائية تسأل عن نتائج مرتبطة بمسار التصلب المتعدد، ولا تجيب عن كل سؤال تغذوي عام. كما أن بحثها كان محدثاً حتى مايو 2019، وهو حد يجب إظهاره.</p><Link className="sector-open" href="/cochrane/ms/">فتح مثال الحداثة والنطاق ←</Link></article></div></section>
    <section aria-labelledby="source-reading"><div className="section-mini-heading"><div><span className="eyebrow">ابدأ من المنهج الرسمي</span><h2 id="source-reading">مصدران للانتقال من التبسيط إلى المنهج</h2></div></div><div className="institutional-sector-grid">{registry.official_resources.filter((item) => ['systematic-reviews', 'evidence-essentials', 'grade-chapter-14'].includes(item.id)).map((resource) => <ExternalSource resource={resource} key={resource.id} />)}</div></section>
    <SourceBoundary />
  </PageFrame>;
}

function CertaintyPage() {
  const grades = [
    ['مرتفع', 'ثقتنا كبيرة بأن الأثر الحقيقي قريب من التقدير المعروض.', 'لا يعني أن الأثر كبير أو أن التدخل مناسب لكل شخص.'],
    ['متوسط', 'لدينا ثقة متوسطة؛ الأثر الحقيقي غالباً قريب من التقدير لكنه قد يختلف عنه بصورة مهمة.', 'يستدعي إظهار مصدر عدم اليقين وعدم صياغة النتيجة كحقيقة مطلقة.'],
    ['منخفض', 'ثقتنا محدودة؛ قد يختلف الأثر الحقيقي بصورة مهمة عن التقدير.', 'يفضل استخدام صياغات مثل «قد» مع شرح سبب خفض اليقين.'],
    ['منخفض جداً', 'الثقة في تقدير الأثر ضئيلة جداً وقد يكون الأثر الحقيقي مختلفاً اختلافاً جوهرياً.', 'تجنب «ثبت» و«لا يعمل»؛ قل إن الدليل شديد عدم اليقين.'],
  ];
  const domains = [
    ['خطر التحيز', 'هل تصميم الدراسات وتنفيذها أو فقد المشاركين أو قياس النتائج قد يدفع التقدير بعيداً عن الحقيقة؟'],
    ['عدم الاتساق', 'هل تختلف النتائج بين الدراسات بدرجة لا يفسرها اختلاف معقول في السكان أو التدخل أو القياس؟'],
    ['عدم المباشرة', 'هل الدراسات تقيس سؤالاً يختلف عن السؤال الذي نريد الإجابة عنه في السكان أو التدخل أو المقارنة أو النتيجة؟'],
    ['عدم الدقة', 'هل عدد المشاركين/الأحداث ومجال الثقة يسمحان باستنتاج مفيد أم يشمل التقدير فوائد وأضراراً متعارضة؟'],
    ['تحيز النشر', 'هل من المحتمل أن الدراسات أو النتائج غير الملائمة بقيت غير منشورة أو أقل ظهوراً؟'],
  ];
  return <PageFrame current="certainty" eyebrow="GRADE · certainty of evidence" title="درجة اليقين في الدليل: GRADE بالعربية" intro="درجة اليقين لا تعطي العلاج علامة جودة ولا تخبرك بحجم الفائدة وحدها. هي حكم منظم على مقدار الثقة في تقدير الأثر لنتيجة محددة، وقد تختلف درجة اليقين من نتيجة إلى أخرى داخل المراجعة نفسها.">
    <section aria-labelledby="grade-levels"><div className="section-mini-heading"><div><span className="eyebrow">Four levels</span><h2 id="grade-levels">المستويات الأربعة</h2></div></div><div className="institutional-sector-grid">{grades.map(([level, meaning, guard]) => <article className="institutional-sector-card" key={level}><span className="eyebrow">{level}</span><h3>{meaning}</h3><p><strong>حاجز تفسير:</strong> {guard}</p></article>)}</div></section>
    <section aria-labelledby="grade-domains"><div className="section-mini-heading"><div><span className="eyebrow">Downgrading domains</span><h2 id="grade-domains">خمسة أسباب أساسية قد تخفض اليقين</h2></div></div><div className="institutional-sector-grid">{domains.map(([title, body]) => <article className="institutional-sector-card" key={title}><h3>{title}</h3><p>{body}</p></article>)}</div></section>
    <section aria-labelledby="language-discipline"><div className="section-mini-heading"><div><span className="eyebrow">لغة مرتبطة باليقين</span><h2 id="language-discipline">كيف نمنع اللغة العربية من أن تصبح أقوى من الدليل؟</h2></div></div><div className="institutional-sector-grid"><article className="institutional-sector-card"><h3>اليقين المتوسط/المرتفع</h3><p>يمكن استخدام لغة أكثر ثقة عندما يبررها التقدير ودرجة اليقين، مع بقاء حجم الأثر ومجال الثقة ظاهرين.</p></article><article className="institutional-sector-card"><h3>اليقين المنخفض</h3><p>«قد يزيد»، «قد يقلل»، «قد يكون الفرق محدوداً»؛ ثم نذكر سبب عدم الثقة بدلاً من إخفائه.</p></article><article className="institutional-sector-card"><h3>اليقين المنخفض جداً</h3><p>«الدليل شديد عدم اليقين بشأن…». لا تتحول النتيجة غير الحاسمة إلى نفي أو إثبات.</p></article><article className="institutional-sector-card"><h3>قاعدة ثابتة</h3><p>عبارة «لا يوجد دليل على فرق» ليست مرادفاً لعبارة «يوجد دليل على عدم وجود فرق». الأولى قد تعكس نقص المعلومات.</p></article></div></section>
    <section aria-labelledby="grade-source"><div className="section-mini-heading"><div><span className="eyebrow">Primary methods reference</span><h2 id="grade-source">المرجع المنهجي</h2></div></div><div className="institutional-sector-grid">{registry.official_resources.filter((item) => item.id === 'grade-chapter-14').map((resource) => <ExternalSource resource={resource} key={resource.id} />)}</div></section>
    <SourceBoundary />
  </PageFrame>;
}

function ReviewCard({ review }: { review: MsReview }) {
  return <article className="institutional-sector-card" id={review.id}>
    <span className="eyebrow">{review.id} · DOI {review.doi}</span>
    <h3>{review.title_ar}</h3>
    <p><span lang="en" dir="ltr">{review.title_en}</span></p>
    <div className="sector-metrics"><span>نُشرت: {review.published_on}</span><span>الدليل محدث حتى: {review.evidence_current_to}</span></div>
    <p><strong>السؤال:</strong> {review.question_ar}</p>
    <p><strong>قاعدة الدليل:</strong> {review.evidence_base_ar}</p>
    <h4>الرسائل الرئيسية</h4>
    <ul>{review.key_messages_ar.map((message) => <li key={message}>{message}</li>)}</ul>
    <p><strong>اليقين:</strong> {review.certainty_ar}</p>
    <p><strong>كيف نستخدمها في روافد:</strong> {review.rawafid_use_ar}</p>
    <div className="sector-metrics"><a href={review.cochrane_url} target="_blank" rel="noopener noreferrer">الملخص الرسمي لدى Cochrane ↗</a><a href={review.library_url} target="_blank" rel="noopener noreferrer">Cochrane Library ↗</a></div>
  </article>;
}

function MsPage() {
  return <PageFrame current="ms" eyebrow="Multiple sclerosis · three primary reviews" title="دليل كوكرين والتصلب المتعدد: ثلاث مراجعات مترابطة" intro="هذه الصفحة ليست ترجمة للـBlogshots التي استلمناها. إنها خريطة تفسير عربية مستقلة مبنية على صفحات المراجعات الأصلية الثلاث: سؤال كل مراجعة، تاريخ حداثة الدليل، الرسائل الرئيسية، درجة اليقين، والفجوات التي يجب ألا تختفي عند التبسيط.">
    <section aria-labelledby="ms-context"><div className="section-mini-heading"><div><span className="eyebrow">لماذا هذه الثلاثة معاً؟</span><h2 id="ms-context">الفائدة والضرر ونمط الحياة لا تجيب عن السؤال نفسه</h2></div></div><div className="institutional-sector-grid"><article className="institutional-sector-card"><h3>فعالية/ضرر دواء محدد</h3><p>مراجعة الآزاثيوبرين تقارن منافع ومضار علاج محدد مع علاجات معدلة للمرض أو عدم العلاج وتكشف فجوة بين إشارة الانتكاس وعدم اليقين في الإعاقة والضرر.</p></article><article className="institutional-sector-card"><h3>سلامة فئة علاجية واسعة</h3><p>التحليل الشبكي للعلاجات المناعية يوضح صعوبة ترتيب السلامة عندما تكون الأحداث الخطيرة نادرة والإبلاغ عنها غير مكتمل.</p></article><article className="institutional-sector-card"><h3>تدخلات غذائية متعددة</h3><p>مراجعة الغذاء توضح كيف يمنع التغاير بين الحميات والمكملات أحياناً دمج النتائج، ولماذا يجب الانتباه إلى تاريخ آخر بحث قبل تحويل مراجعة أقدم إلى نصيحة حالية.</p></article></div></section>
    <section aria-labelledby="ms-reviews"><div className="section-mini-heading"><div><span className="eyebrow">Evidence records</span><h2 id="ms-reviews">السجلات الثلاثة</h2></div><span>كل سجل مرتبط بصفحة Cochrane الأصلية وCochrane Library.</span></div><div className="institutional-sector-grid">{registry.ms_reviews.map((review) => <ReviewCard review={review} key={review.id} />)}</div></section>
    <section aria-labelledby="ms-crossread"><div className="section-mini-heading"><div><span className="eyebrow">Cross-review synthesis</span><h2 id="ms-crossread">ما الذي يظهر عند قراءتها معاً؟</h2></div></div><div className="institutional-sector-grid"><article className="institutional-sector-card"><h3>لا توجد «إجابة واحدة» للتصلب المتعدد</h3><p>المراجعات الثلاث تختلف في السؤال، نوع التدخل، زمن المتابعة ونوع النتائج. جمعها في خلاصة علاجية واحدة سيكون خطأ منهجياً.</p></article><article className="institutional-sector-card"><h3>السلامة أضعف من مجرد عدّ الأحداث</h3><p>الأضرار النادرة والمتأخرة قد تحتاج بيانات رصد ومتابعة دوائية إلى جانب التجارب. انخفاض يقين السلامة لا يمنح إذناً لطمأنة قاطعة.</p></article><article className="institutional-sector-card"><h3>الحداثة جزء من الدليل</h3><p>مراجعة الغذاء تعتمد بحثاً حتى 2019، بينما مراجعات أخرى أحدث. لذلك يسجل هذا القسم «الدليل محدث حتى» ولا يكتفي بتاريخ نشر الصفحة.</p></article><article className="institutional-sector-card"><h3>النتائج التي تهم الشخص قد تكون مفقودة</h3><p>مثل جودة الحياة أو الإدراك أو الأثر طويل المدى. غيابها يحد من القرار المشترك حتى إن كانت بعض المؤشرات السريرية متاحة.</p></article></div></section>
    <aside className="rawafid-empty"><h2>حد الاستخدام السريري</h2><p>لا تختار دواءً أو توقفه، ولا تغيّر حمية علاجية، اعتماداً على هذه الصفحة. المراجعة المنهجية جزء من القرار وليست القرار كله؛ يلزم ربطها بحالة الشخص، خيارات العلاج الحالية، السلامة، التفضيلات والإرشادات السريرية المحدثة.</p></aside>
    <SourceBoundary />
  </PageFrame>;
}

function PilotPage() {
  const status = [
    ['تحديد ثلاث مواد للمرحلة الأولى', 'مكتمل'],
    ['استلام ملفات PowerPoint قابلة للتحرير', 'مكتمل'],
    ['استلام إرشادات إنتاج Blogshots', 'مكتمل'],
    ['مسودة عربية كاملة للمواد الثلاث', 'غير مكتمل'],
    ['مراجعة تحريرية عربية/إنجليزية مستقلة', 'غير مكتمل'],
    ['ترجمة عكسية وسجل فروق', 'غير مكتمل'],
    ['مراجعة المحتوى/النسب النهائية مع الجهة المعنية', 'غير مكتمل'],
    ['نشر ترجمة عربية بوصفها ترجمة Cochrane مراجعة', 'غير مكتمل'],
  ];
  return <PageFrame current="arabic-pilot" eyebrow="Status: materials received · translations not complete" title="حالة المسار التجريبي لترجمة مواد كوكرين إلى العربية" intro="هذه الصفحة مقصودة لتكون سجل حالة لا صفحة تسويق. لدينا ثلاث مواد مصدر قابلة للتحرير ومسار جودة متفق على ملامحه، لكن تنفيذ الترجمة والمراجعة والترجمة العكسية لم يكتمل؛ لذلك لا توجد هنا أي مادة نوصفها بأنها ترجمة عربية معتمدة من كوكرين.">
    <section aria-labelledby="pilot-status"><div className="section-mini-heading"><div><span className="eyebrow">Current state</span><h2 id="pilot-status">ما أُنجز وما لم يُنجز</h2></div><span>آخر تحديث: {registry.updated_on}</span></div><div className="institutional-sector-grid">{status.map(([item, state], index) => <article className="institutional-sector-card" key={item}><span className="sector-number">{String(index + 1).padStart(2, '0')}</span><span className="eyebrow">{state}</span><h3>{item}</h3></article>)}</div></section>
    <section aria-labelledby="pilot-inputs"><div className="section-mini-heading"><div><span className="eyebrow">Phase 1 inputs</span><h2 id="pilot-inputs">المواد الثلاث التي ستختبر المسار</h2></div></div><div className="institutional-sector-grid">{registry.ms_reviews.map((review) => <article className="institutional-sector-card" key={review.id}><span className="eyebrow">{review.id}</span><h3>{review.title_ar}</h3><p><span lang="en" dir="ltr">{review.title_en}</span></p><Link className="sector-open" href={`/cochrane/ms/#${review.id}`}>قراءة سجل الدليل ←</Link></article>)}</div></section>
    <section aria-labelledby="pilot-workflow"><div className="section-mini-heading"><div><span className="eyebrow">QA / RTL / back-translation</span><h2 id="pilot-workflow">مسار الجودة قبل النشر</h2></div><span>كل خطوة تترك أثراً قابلاً للمراجعة.</span></div><div className="institutional-sector-grid">{registry.arabic_pilot.workflow_ar.map((step, index) => <article className="institutional-sector-card" key={step}><span className="sector-number">{String(index + 1).padStart(2, '0')}</span><h3>{step}</h3></article>)}</div></section>
    <section aria-labelledby="completion-definition"><div className="section-mini-heading"><div><span className="eyebrow">Definition of done</span><h2 id="completion-definition">متى نعتبر المادة جاهزة؟</h2></div></div><div className="institutional-sector-grid">{['النص العربي يحافظ على اتجاه وحجم عدم اليقين ولا يقوي الاستنتاج الأصلي.','كل رقم أو مدة أو مقارنة أو قيد قابل للمطابقة مع المصدر.','المصطلحات الحساسة مسجلة بالعربية والإنجليزية مع قرار استخدام ثابت.','الترجمة العكسية لا تكشف تغيراً جوهرياً في السؤال أو النتيجة أو اليقين.','RTL مقروء من الهاتف وسطح المكتب ولا يقلب ترتيب المقارنة أو علاقة العنوان بالنتيجة.','المصدر والنسب والروابط والهوية محفوظة وفق التوجيه المتفق عليه.','المراجعة المطلوبة اكتملت ولم تعد هناك ملاحظات جوهرية مفتوحة.'].map((item) => <article className="institutional-sector-card" key={item}><p>{item}</p></article>)}</div></section>
    <aside className="rawafid-empty"><h2>حارس النشر</h2><p>{registry.arabic_pilot.publication_guard_ar}</p></aside>
    <SourceBoundary />
  </PageFrame>;
}

export default async function CochraneLanding({ params }: { params: Params }) {
  const { slug } = await params;
  const key = nativeKey(slug);
  if (key === '') return <HubPage />;
  if (key === 'resources') return <ResourcesPage />;
  if (key === 'read-review') return <ReadReviewPage />;
  if (key === 'certainty') return <CertaintyPage />;
  if (key === 'ms') return <MsPage />;
  if (key === 'arabic-pilot') return <PilotPage />;
  return <LegacyPreservedRoute route={route(slug)} />;
}
