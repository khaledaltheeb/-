import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata } from '@/lib/seo';

const CANONICAL = '/resources/open-books-discovery/';
const TITLE = 'الكتب المفتوحة: دليل اكتشاف الكتاب والتحقق من الرخصة والبيانات الوصفية';
const DESCRIPTION = 'دليل عربي متقدم لاكتشاف الكتب المفتوحة والوصول المفتوح عبر Thoth والناشرين، والتحقق من ISBN وDOI والرخصة والإصدار والبيانات الوصفية قبل القراءة أو التنزيل أو إعادة الاستخدام.';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata: Metadata = buildSeoMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: CANONICAL,
  index: true,
  follow: true,
  type: 'article',
  keywords: [
    'كتب مفتوحة',
    'كتب الوصول المفتوح',
    'Thoth Open Metadata',
    'البيانات الوصفية للكتب',
    'ONIX 3.0',
    'ISBN',
    'DOI',
    'ORCID',
    'ROR',
    'التراخيص المفتوحة',
    'CC0',
  ],
});

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': 'https://healthrenewal.org/resources/open-books-discovery/#webpage',
      url: 'https://healthrenewal.org/resources/open-books-discovery/',
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: 'ar',
      datePublished: '2026-08-05',
      dateModified: '2026-09-11',
      isPartOf: { '@id': 'https://healthrenewal.org/#website' },
      about: ['الكتب المفتوحة', 'الوصول المفتوح', 'البيانات الوصفية', 'Thoth Open Metadata', 'ONIX 3.0', 'ISBN', 'DOI', 'ORCID', 'ROR', 'التراخيص المفتوحة'],
    },
    {
      '@type': 'Article',
      '@id': 'https://healthrenewal.org/resources/open-books-discovery/#article',
      headline: TITLE,
      description: DESCRIPTION,
      inLanguage: 'ar',
      datePublished: '2026-08-05',
      dateModified: '2026-09-11',
      mainEntityOfPage: { '@id': 'https://healthrenewal.org/resources/open-books-discovery/#webpage' },
      publisher: { '@id': 'https://healthrenewal.org/#organization' },
    },
    {
      '@type': 'HowTo',
      '@id': 'https://healthrenewal.org/resources/open-books-discovery/#howto',
      name: 'كيف تتحقق من كتاب مفتوح قبل استخدامه؟',
      inLanguage: 'ar',
      step: [
        { '@type': 'HowToStep', name: 'ثبّت هوية العمل', text: 'طابق العنوان والمؤلف والناشر والإصدار والمعرفات الدائمة.' },
        { '@type': 'HowToStep', name: 'ارجع إلى المصدر القانوني', text: 'افتح صفحة الناشر أو صفحة الكتاب الأصلية، ولا تعتمد على نتيجة بحث وسيطة وحدها.' },
        { '@type': 'HowToStep', name: 'تحقق من الرخصة', text: 'تأكد من أن الرخصة تخص الإصدار والملف اللذين ستستخدمهما.' },
        { '@type': 'HowToStep', name: 'افصل بين الحقوق', text: 'لا تستنتج حقوق النص أو الغلاف من رخصة البيانات الوصفية.' },
        { '@type': 'HowToStep', name: 'قيّم الجودة', text: 'افحص المؤلف والناشر والمنهجية والمراجع وحداثة المحتوى وملاءمته.' },
        { '@type': 'HowToStep', name: 'تحقق من البيانات الوصفية', text: 'راجع ISBN وDOI واللغة وتاريخ النشر وروابط الوصول والمعرفات المرتبطة.' },
        { '@type': 'HowToStep', name: 'سجل التحقق', text: 'احتفظ بالمصدر والتاريخ والرخصة وحالة الوصول وأي ملاحظة تحتاج مراجعة لاحقة.' },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://healthrenewal.org/resources/open-books-discovery/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'هل وجود كتاب في Thoth يعني أن نصه مفتوح لإعادة الاستخدام؟',
          acceptedAnswer: { '@type': 'Answer', text: 'لا. إتاحة البيانات الوصفية تحت CC0 لا تعني تلقائيًا أن نص الكتاب أو غلافه أو ملفات PDF وEPUB تحمل الرخصة نفسها. يجب التحقق من رخصة الإصدار والمكوّن المراد استخدامه.' },
        },
        {
          '@type': 'Question',
          name: 'ما أهم البيانات التي يجب التحقق منها قبل إضافة كتاب مفتوح إلى فهرس؟',
          acceptedAnswer: { '@type': 'Answer', text: 'العنوان والإصدار والمؤلفون والناشر وISBN أو DOI وتاريخ النشر واللغة وصفحة الهبوط الرسمية ورابط الرخصة وحالة الوصول ومصدر البيانات وتاريخ التحقق.' },
        },
        {
          '@type': 'Question',
          name: 'هل الكتاب المفتوح موثوق علميًا بالضرورة؟',
          acceptedAnswer: { '@type': 'Answer', text: 'لا. الانفتاح والترخيص يصفان الوصول والحقوق، لا الجودة العلمية. يجب تقييم المؤلف والناشر والمنهجية والمراجع وحداثة المادة وتضارب المصالح وملاءمة المحتوى للسياق.' },
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://healthrenewal.org/' },
        { '@type': 'ListItem', position: 2, name: 'الموارد', item: 'https://healthrenewal.org/resources' },
        { '@type': 'ListItem', position: 3, name: 'دليل الكتب المفتوحة', item: 'https://healthrenewal.org/resources/open-books-discovery/' },
      ],
    },
  ],
};

const sourceLinks = [
  ['Thoth — Terms and Conditions for Metadata Management', 'https://thoth.pub/docs/policies/terms-thoth-metadata', 'شروط إدارة البيانات الوصفية، مسؤوليات الحساب، وإتاحة Metadata العامة.'],
  ['Thoth — Metadata Management', 'https://thoth.pub/services/metadata', 'المعايير والصيغ والمعرّفات وممارسات إدارة Metadata.'],
  ['Thoth — Books Catalogue', 'https://thoth.pub/books', 'استكشاف الكتب وسجلاتها الوصفية.'],
  ['Thoth — Metadata by Publisher', 'https://thoth.pub/publishers', 'استكشاف البيانات على مستوى الناشر.'],
  ['Thoth — About', 'https://thoth.pub/about', 'البنية المفتوحة، التوزيع، وواجهات الوصول إلى البيانات.'],
  ['Thoth — International Metadata Recommendations (2026)', 'https://thoth.pub/thoth-report', 'تقرير التوصيات الدولية للبيانات الوصفية للكتب والفصول المفتوحة.'],
  ['Steiner et al. (2026) — Zenodo', 'https://doi.org/10.5281/zenodo.18173982', 'الإصدار الكامل للتقرير والمواد الداعمة عبر DOI.'],
  ['Creative Commons — CC0 1.0', 'https://creativecommons.org/publicdomain/zero/1.0/', 'النص الرسمي لأداة CC0.'],
] as const;

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="institutional-sector-card"><h3>{title}</h3><div>{children}</div></article>;
}

export default function OpenBooksDiscoveryPage() {
  return <>
    <SiteHeader />
    <main className="site-shell sector-page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />

      <nav className="breadcrumbs" aria-label="مسار الصفحة">
        <Link href="/">الرئيسية</Link><span>/</span><Link href="/resources">الموارد</Link><span>/</span><span aria-current="page">الكتب المفتوحة</span>
      </nav>

      <header className="public-index-hero">
        <span className="eyebrow">الوصول المفتوح · Metadata · تحقق حقوقي وعلمي</span>
        <h1>{TITLE}</h1>
        <p>{DESCRIPTION}</p>
        <div className="public-stat-strip">
          <span>آخر مراجعة: 11 سبتمبر 2026</span>
          <span>منهج تحقق من 7 خطوات</span>
          <span>Indexable · Canonical ثابت</span>
        </div>
        <p><strong>تنبيه مؤسسي:</strong> هذه صفحة تعليمية مستقلة أعدتها روافد بالاستناد إلى المصادر الرسمية المشار إليها أدناه. ذكر Thoth أو أي جهة أخرى لا يعني اعتمادًا أو شراكة أو مراجعة منها ما لم يوجد تصريح موثق بذلك.</p>
      </header>

      <nav className="rawafid-subnav" aria-label="محتويات الدليل">
        <a href="#meaning">ما الكتاب المفتوح؟</a>
        <a href="#thoth">كيف يفيد Thoth؟</a>
        <a href="#recommendations">توصيات Metadata 2026</a>
        <a href="#workflow">مسار التحقق</a>
        <a href="#onix">ONIX والمعرّفات</a>
        <a href="#quality">الجودة العلمية</a>
        <a href="#rights">الحقوق</a>
        <a href="#sources">المصادر</a>
      </nav>

      <section id="meaning" aria-labelledby="meaning-title">
        <div className="section-mini-heading"><div><span className="eyebrow">تعريف قبل الاستخدام</span><h2 id="meaning-title">ماذا يعني «كتاب مفتوح» عمليًا؟</h2></div></div>
        <p>مصطلح «كتاب مفتوح» يحتاج إلى تفكيك دقيق. قد يكون سجل الكتاب وبياناته الوصفية مفتوحًا، وقد يكون النص الكامل متاحًا للقراءة مجانًا، وقد يكون العمل منشورًا تحت رخصة تسمح بإعادة الاستخدام بدرجات مختلفة. هذه الحالات ليست مترادفة.</p>
        <div className="institutional-sector-grid">
          <InfoCard title="بيانات وصفية مفتوحة"><p>العنوان، المؤلفون، الناشر، المعرّفات، الموضوعات وروابط الوصول يمكن أن تكون بيانات قابلة لإعادة الاستخدام وفق رخصتها، من دون أن تنتقل الرخصة نفسها إلى النص الكامل أو الغلاف.</p></InfoCard>
          <InfoCard title="وصول مفتوح للنص"><p>إمكانية قراءة أو تنزيل النص لا تكفي وحدها لتحديد ما إذا كان النسخ أو الترجمة أو إعادة النشر أو التعديل مسموحًا. المرجع هو رخصة العمل المحددة.</p></InfoCard>
          <InfoCard title="إعادة استخدام مفتوحة"><p>تتحدد وفق نص الرخصة. يجب توثيق الإصدار والرخصة ورابطها، وعدم افتراض حقوق أوسع من الممنوح صراحة.</p></InfoCard>
        </div>
      </section>

      <section id="thoth" aria-labelledby="thoth-title">
        <div className="section-mini-heading"><div><span className="eyebrow">بنية تحتية للكتب المفتوحة</span><h2 id="thoth-title">أين يدخل Thoth في رحلة الاكتشاف؟</h2></div></div>
        <p>Thoth بنية مفتوحة لإدارة ونشر البيانات الوصفية للكتب الأكاديمية المفتوحة. فائدتها لا تقتصر على «العثور على كتاب»؛ بل تساعد على تثبيت هوية العمل وربط المؤلف والناشر والإصدار والمعرّفات وروابط الوصول بصيغ قابلة للتبادل والتوزيع.</p>
        <div className="institutional-sector-grid">
          <InfoCard title="الاكتشاف"><p>البحث في فهرس الكتب والناشرين يسهّل الوصول إلى سجل موحد بدل الاعتماد على نتائج بحث متفرقة قد تخلط الإصدارات أو الروابط.</p></InfoCard>
          <InfoCard title="التشغيل البيني"><p>البيانات المنظمة والصيغ التصديرية وواجهات API تسمح بتداول Metadata بين الفهارس والمكتبات والخدمات البحثية مع تقليل الإدخال اليدوي.</p></InfoCard>
          <InfoCard title="التتبّع"><p>المعرّفات الدائمة مثل ISBN وDOI وORCID وROR تقلل الالتباس وتدعم المطابقة بين العمل، الشخص، المؤسسة والإصدار.</p></InfoCard>
        </div>
        <p>وفق شروط Thoth المنشورة، تُتاح بيانات Metadata العامة عبر خدماتها تحت CC0 1.0. هذه النقطة تخص <strong>البيانات الوصفية</strong> ولا ينبغي تعميمها تلقائيًا على نص الكتاب أو الغلاف أو ملفات القراءة.</p>
      </section>

      <section id="recommendations" aria-labelledby="recommendations-title">
        <div className="section-mini-heading"><div><span className="eyebrow">توصيات دولية 2026</span><h2 id="recommendations-title">Essential وDesirable: كيف نفكر في جودة Metadata؟</h2></div></div>
        <p>تقرير <em>International Metadata Recommendations for Open Access Books and Chapters</em> الصادر في 2026 يقترح التفكير في الحقول على مستويين عمليين: بيانات أساسية لازمة للاكتشاف والتوزيع، وبيانات مستحسنة ترفع الغنى وقابلية الربط والاستخدام.</p>
        <div className="institutional-sector-grid">
          <InfoCard title="Essential — أساسي"><p>هوية العمل والإصدار، العنوان، المساهمون وأدوارهم، الناشر، تاريخ النشر، اللغة، نوع المنشور، المعرّفات المناسبة، وحالة الوصول/الرخصة وروابط ذات دلالة واضحة.</p></InfoCard>
          <InfoCard title="Desirable — مستحسن"><p>الملخصات والكلمات الموضوعية والمعرّفات المرتبطة بالأشخاص والمؤسسات والسلاسل والتمويل والعلاقات بين الإصدارات والملفات، بما يحسن الاكتشاف والتوافقية.</p></InfoCard>
          <InfoCard title="قاعدة روافد"><p>لا نملأ حقلًا لمجرد اكتمال النموذج. إذا لم يمكن إثبات القيمة من مصدر موثوق، نتركها غير مؤكدة ونوثق مصدر التحقق وتاريخه بدل اختراع بيانات.</p></InfoCard>
        </div>
      </section>

      <section id="workflow" aria-labelledby="workflow-title">
        <div className="section-mini-heading"><div><span className="eyebrow">إجراء قابل للتكرار</span><h2 id="workflow-title">مسار التحقق من كتاب مفتوح قبل استخدامه</h2></div></div>
        <ol>
          <li><strong>ثبّت هوية العمل:</strong> طابق العنوان، المؤلف/المحرر، الناشر، سنة النشر، رقم الطبعة، اللغة وISBN/DOI إن وُجدا.</li>
          <li><strong>ارجع إلى المصدر القانوني:</strong> افتح صفحة الناشر أو صفحة العمل الرسمية، واستخدم فهرسًا وسيطًا للاكتشاف لا كبديل دائم عن المصدر.</li>
          <li><strong>تحقق من الرخصة:</strong> ابحث عن اسم الرخصة ورابطها وتأكد أنها تنطبق على الإصدار والملف المقصودين.</li>
          <li><strong>افصل بين المكونات:</strong> Metadata والنص الكامل والغلاف والصور والجداول والمواد المرفقة قد تحمل حقوقًا مختلفة.</li>
          <li><strong>قيّم جودة المحتوى:</strong> افحص أهلية المؤلفين والناشر، نوع الكتاب، المراجعة العلمية، المنهج، المراجع، تاريخ المحتوى وتضارب المصالح.</li>
          <li><strong>راجع اكتمال Metadata:</strong> افحص المعرّفات والموضوعات واللغة والملخص وروابط الوصول وعلاقات الكتاب بالسلسلة أو المؤسسة.</li>
          <li><strong>وثّق قرارك:</strong> سجّل مصدر Metadata، رابط العمل، الرخصة، تاريخ التحقق، وما الذي يجوز فعله وما يحتاج إذنًا منفصلًا.</li>
        </ol>
      </section>

      <section id="onix" aria-labelledby="onix-title">
        <div className="section-mini-heading"><div><span className="eyebrow">قابلية التبادل</span><h2 id="onix-title">لماذا ONIX 3.0 والمعرّفات الدائمة مهمة؟</h2></div></div>
        <p>ONIX for Books معيار لتبادل معلومات المنتجات الكتابية بين الناشرين والموزعين والفهارس والخدمات. قيمة ONIX ليست في الاسم التقني نفسه، بل في جعل وصف الكتاب منظمًا وقابلاً للتبادل بدل بقاء المعلومات حبيسة صفحة بشرية منفردة.</p>
        <div className="institutional-sector-grid">
          <InfoCard title="ISBN"><p>يساعد على تمييز منتج/إصدار كتابي محدد. لا يكفي وحده لإثبات الرخصة أو الجودة.</p></InfoCard>
          <InfoCard title="DOI"><p>معرّف دائم يمكنه ربط العمل بصفحة هبوط مستقرة وبيانات إحالة قابلة للتحديث.</p></InfoCard>
          <InfoCard title="ORCID"><p>يساعد على تمييز الباحث أو المؤلف عن أشخاص يحملون أسماء متشابهة وربط إنتاجه بهوية بحثية مستمرة.</p></InfoCard>
          <InfoCard title="ROR"><p>يساعد على تحديد المؤسسات البحثية بصورة معيارية عند تسجيل الانتماء المؤسسي.</p></InfoCard>
        </div>
      </section>

      <section id="quality" aria-labelledby="quality-title">
        <div className="section-mini-heading"><div><span className="eyebrow">الوصول ليس تقييمًا علميًا</span><h2 id="quality-title">كيف نقيّم جودة الكتاب قبل التوصية به؟</h2></div></div>
        <p>كون الكتاب مفتوح الوصول ميزة في الإتاحة، لكنه ليس ختم جودة. قبل إدخاله في دليل معرفي أو الاستناد إليه في مادة صحية أو نفسية أو تربوية، يلزم تقييمه وفق غرض الاستخدام.</p>
        <ul>
          <li><strong>السلطة العلمية:</strong> من كتب أو حرر الكتاب؟ وما خبرته وانتماؤه العلمي؟</li>
          <li><strong>الناشر والتحرير:</strong> هل توجد سياسة تحرير ومراجعة واضحة؟ وهل يمكن التحقق من جهة النشر؟</li>
          <li><strong>المنهج والمراجع:</strong> هل الادعاءات قابلة للتتبع إلى أدلة ومصادر مناسبة؟ وهل يميز الكتاب بين الرأي والنتيجة البحثية؟</li>
          <li><strong>الحداثة:</strong> بعض الكتب تبقى مرجعية سنوات، بينما تتقادم مواد سريرية أو تقنية بسرعة؛ يجب ربط الحداثة بنوع الموضوع.</li>
          <li><strong>التضارب والتمويل:</strong> الإفصاح لا يبطل العمل، لكنه عنصر ضروري لفهم سياق إنتاجه.</li>
          <li><strong>الملاءمة:</strong> كتاب ممتاز في سياق قد لا يصلح للتطبيق المباشر في سياق عربي دون تكييف لغوي وثقافي وتنظيمي.</li>
        </ul>
      </section>

      <section id="arabic" aria-labelledby="arabic-title">
        <div className="section-mini-heading"><div><span className="eyebrow">إثراء عربي دون تحريف</span><h2 id="arabic-title">كيف نبني وصفًا عربيًا مسؤولًا للكتاب؟</h2></div></div>
        <p>الوصف العربي المفيد ليس ترجمة آلية للعنوان أو الملخص. الأفضل أن يوضح للقارئ: موضوع الكتاب، الجمهور الذي قد يستفيد منه، نوع الأدلة أو المعالجة التي يقدمها، حدود استخدامه، ثم يحيل إلى صفحة العمل الأصلية.</p>
        <ul>
          <li>احتفظ بالعنوان الأصلي وبيانات الإحالة كما نشرها المصدر.</li>
          <li>ميّز بوضوح بين <strong>ملخص الناشر</strong> وبين <strong>وصف تحريري من روافد</strong>.</li>
          <li>لا تنسب للكتاب نتيجة أو توصية لم ترد فيه.</li>
          <li>لا تترجم المصطلح المتخصص ترجمة حاسمة إذا كان له أكثر من مقابل عربي؛ يمكن إظهار المصطلح الأصلي عند الحاجة.</li>
          <li>أضف تاريخ التحقق والرابط الرسمي، وراجع الوصف عندما تتغير صفحة المصدر أو الرخصة.</li>
        </ul>
      </section>

      <section id="rights" aria-labelledby="rights-title">
        <div className="section-mini-heading"><div><span className="eyebrow">حدود الاستخدام</span><h2 id="rights-title">قواعد حقوقية تمنع أكثر الأخطاء شيوعًا</h2></div></div>
        <div className="institutional-sector-grid">
          <InfoCard title="Metadata ≠ full text"><p>إذا كانت Metadata تحت CC0، فهذا لا يساوي تلقائيًا أن PDF أو EPUB أو الغلاف تحت CC0.</p></InfoCard>
          <InfoCard title="مجاني ≠ مرخّص لإعادة النشر"><p>القراءة المجانية لا تمنح حق النسخ الكامل أو الترجمة أو التوزيع. افحص الرخصة المنشورة للعمل نفسه.</p></InfoCard>
          <InfoCard title="النسبة ليست بديلًا عن الرخصة"><p>ذكر المصدر ممارسة أساسية، لكنه لا يحول استخدامًا غير مسموح إلى استخدام مسموح.</p></InfoCard>
          <InfoCard title="الحسابات والناشرون"><p>إدارة بيانات ناشر أو إنشاء سجلات باسمه تتطلب صلاحية صحيحة. لا ننشئ هوية مؤسسية أو ندّعي تمثيل جهة من دون تفويض.</p></InfoCard>
        </div>
      </section>

      <section id="faq" aria-labelledby="faq-title">
        <div className="section-mini-heading"><div><span className="eyebrow">أسئلة متكررة</span><h2 id="faq-title">أسئلة شائعة</h2></div></div>
        <details><summary><strong>هل وجود كتاب في Thoth يعني أن نصه مفتوح لإعادة الاستخدام؟</strong></summary><p>لا. تحقق من رخصة النص والإصدار المحدد بصورة مستقلة عن رخصة Metadata.</p></details>
        <details><summary><strong>هل الوصول المفتوح يعني أن الكتاب موثوق علميًا؟</strong></summary><p>لا. جودة الوصول والبيانات الوصفية منفصلة عن جودة المنهج والمحتوى. طبّق تقييمًا علميًا مناسبًا للغرض.</p></details>
        <details><summary><strong>هل يكفي ISBN للتأكد من أنني أمام النسخة الصحيحة؟</strong></summary><p>هو معرف مهم للطبعة أو المنتج الكتابي، لكن الأفضل مطابقته مع العنوان والناشر والسنة والصيغة وDOI أو صفحة الهبوط عند توفرها.</p></details>
        <details><summary><strong>ما الحقول التي نبدأ بها عند بناء فهرس عربي؟</strong></summary><p>ابدأ بالهوية الببليوغرافية والرخصة وروابط الوصول والمعرّفات، ثم أضف الوصف والموضوعات والعلاقات التي يمكن توثيقها بثقة.</p></details>
      </section>

      <section id="sources" aria-labelledby="sources-title">
        <div className="section-mini-heading"><div><span className="eyebrow">قابلية التتبع</span><h2 id="sources-title">المصادر الرسمية والمراجع المستخدمة</h2></div><span>تم التحقق الأساسي: 11 سبتمبر 2026</span></div>
        <div className="institutional-sector-grid">
          {sourceLinks.map(([label, href, note]) => <article className="institutional-sector-card" key={href}>
            <h3><a href={href} target="_blank" rel="noopener noreferrer">{label}</a></h3>
            <p>{note}</p>
          </article>)}
        </div>
        <p>عند التعارض، تُقدّم الشروط والسياسات والبيانات المنشورة لدى الجهة الأصلية. هذه الصفحة تشرح طريقة تحقق ولا تمنح ترخيصًا قانونيًا نيابة عن أصحاب الحقوق.</p>
      </section>

      <section aria-labelledby="related-title">
        <div className="section-mini-heading"><div><span className="eyebrow">مسارات مرتبطة</span><h2 id="related-title">تابع داخل روافد</h2></div></div>
        <div className="institutional-sector-grid">
          <Link className="institutional-sector-card" href="/resources"><h3>الموارد العملية</h3><p>مكتبة الموارد والأدوات المنشورة في روافد.</p><span className="sector-open">فتح الموارد ←</span></Link>
          <Link className="institutional-sector-card" href="/sources"><h3>المصادر</h3><p>منهج الوصول إلى المصادر والتعامل معها.</p><span className="sector-open">فتح المصادر ←</span></Link>
          <Link className="institutional-sector-card" href="/citation"><h3>الإحالة والاستشهاد</h3><p>مسار يساعد على حفظ أصل المعلومة وقابلية تتبعها.</p><span className="sector-open">فتح دليل الإحالة ←</span></Link>
          <Link className="institutional-sector-card" href="/editorial-policy"><h3>السياسة التحريرية</h3><p>قواعد النشر والمراجعة والتصحيح في روافد.</p><span className="sector-open">فتح السياسة ←</span></Link>
        </div>
      </section>

      <p><strong>حالة المراجعة:</strong> مراجعة داخلية موثقة بالمصادر الرسمية. آخر تحقق: 11 سبتمبر 2026. تُراجع الصفحة عند تغير شروط Thoth أو نماذج البيانات أو الروابط الرسمية.</p>
    </main>
    <SiteFooter />
  </>;
}
