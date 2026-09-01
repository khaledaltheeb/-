import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildSeoMetadata } from '@/lib/seo';

const SOURCE_COMMUNICATIONS = 'https://www.sightsavers.org/about-us/accessibility/';
const SOURCE_TESTING = 'https://www.sightsavers.org/organisational-inclusion/2021/09/improving-accessibility-testing/';
const SOURCE_FACILITIES = 'https://www.sightsavers.org/disability-and-inclusion/health/accessibility-standards/';
const SOURCE_HEALTH_RESOURCES = 'https://www.sightsavers.org/disability-and-inclusion/health/resources/';
const SOURCE_STATEMENT = 'https://www.sightsavers.org/website-accessibility-statement/';
const PACK_PERMISSIONS = 'https://www.sightsavers.org/wp-content/uploads/2020/03/Permissions-and-pack-contents.pdf';
const PACK_CITATION = 'Pregel, A., Smith, K. and Bridger, K. (2019). Accessibility standards and audit pack. Haywards Heath: Sightsavers';

type Params = Promise<{ slug?: string[] }>;
type PageDef = { title: string; description: string; slug: string; body: React.ReactNode };

const box = { border: '1px solid #d6e1de', borderRadius: 16, padding: '1rem', background: '#fff', margin: '1rem 0' } as const;
const note = { ...box, background: '#f5faf8', borderInlineStart: '5px solid #0b6655' } as const;

const pages: Record<string, PageDef> = {
  '': {
    slug: '',
    title: 'الوصولية العملية: من المحتوى الرقمي إلى المرفق الصحي',
    description: 'مسار عربي عملي مستند إلى موارد Sightsavers لتحسين الاتصالات الرقمية، اختبار الوصول، وتدقيق إمكانية الوصول للمرافق الصحية.',
    body: <>
      <section style={note}><h2>لماذا هذا المسار؟</h2><p>المورد الذي أحالتنا إليه Sightsavers لا يُستخدم كزينة مرجعية. نحوله هنا إلى ثلاث طبقات تشغيلية: تصميم اتصالات مفهومة وقابلة للوصول، بروتوكول اختبار فعلي، ومنهج تدقيق للمرافق الصحية. يبقى المصدر الأصلي هو المرجع الكامل، ولا يعني هذا المسار مراجعة Sightsavers أو اعتمادها لروافد.</p></section>
      <section style={box}><h2>اختر المهمة</h2><ul><li><Link href="/accessibility/sightsavers/inclusive-communications/"><strong>اتصالات ومحتوى رقمي شامل</strong></Link> — بنية العناوين، النص البديل، الروابط، الألوان، القراءة، الوثائق والوسائط.</li><li><Link href="/accessibility/sightsavers/testing-protocol/"><strong>بروتوكول اختبار الوصول</strong></Link> — لوحة مفاتيح، قارئ شاشة، هاتف، تكبير، تباين، PDF/HTML، وفحص بشري.</li><li><Link href="/accessibility/sightsavers/health-facility-audit/"><strong>تدقيق المرافق الصحية</strong></Link> — التخطيط، الفريق، الموافقة، الجولة، التقرير، الأولويات والتكلفة وإعادة الفحص.</li></ul></section>
      <section style={box}><h2>قاعدة «لا شيء عنا بدوننا»</h2><p>التدقيق التقني وحده لا يكفي. Sightsavers تصف تطوير الاختبار بالتعاون مع موظفين ذوي إعاقات وخبرات معيشة مختلفة. لذلك نعامل مشاركة الأشخاص ذوي الإعاقة كجزء من عملية التصميم والاختبار، لا كمرحلة علاقات عامة بعد الانتهاء.</p></section>
      <section style={box}><h2>الأدوات الهندسية المساندة</h2><p>هذه القوائم العملية تكمل ولا تستبدل الاختبارات البرمجية. لدى روافد أداة عربية/RTL مفتوحة المصدر تتضمن فحوص axe-core واختبارات متصفح واتجاهات مختلطة؛ يمكن استخدامها إلى جانب المراجعة اليدوية ومشاركة الأشخاص ذوي الإعاقة.</p><p><Link href="/open-source/arabic-rtl-a11y-toolkit/">فتح أداة روافد للعربية وRTL والوصولية ←</Link></p></section>
    </>,
  },
  'inclusive-communications': {
    slug: 'inclusive-communications',
    title: 'قائمة فحص الاتصالات الرقمية القابلة للوصول',
    description: 'قائمة عربية عملية مستندة إلى إرشادات Sightsavers للمحتوى الشامل: العناوين، النص البديل، الروابط، الألوان، الخطوط، الفيديو والوثائق.',
    body: <>
      <section style={note}><h2>الهدف</h2><p>أن يستطيع المستخدم الوصول إلى المعنى والوظيفة حتى عندما لا يرى الصورة، أو لا يستخدم الفأرة، أو يكبر الشاشة، أو يعتمد على قارئ شاشة، أو يحتاج لغة وتنظيمًا أبسط.</p></section>
      <section style={box}><h2>1. البنية والدلالة</h2><ul><li>استخدم تسلسل عناوين منطقيًا، ولا تستخدم حجم الخط بدل عناصر العناوين الدلالية.</li><li>اجعل ترتيب القراءة في DOM مطابقًا للترتيب المفهوم بصريًا.</li><li>سمِّ الأزرار والحقول والروابط باسم يصف الوظيفة.</li><li>لا تجعل اللون أو الموضع وحدهما يحملان معنى ضروريًا.</li></ul></section>
      <section style={box}><h2>2. الصور والرسوم والجداول</h2><ul><li>أضف نصًا بديلًا عندما تنقل الصورة معلومة.</li><li>اجعل الزخارف غير الضرورية صامتة لقارئ الشاشة.</li><li>صف خلاصة الرسم البياني في النص، لا تعتمد على الصورة وحدها.</li><li>استخدم عناوين أعمدة وصفوف واضحة في الجداول وتجنب الجداول للتخطيط البصري.</li></ul></section>
      <section style={box}><h2>3. النص والتباين</h2><ul><li>اختر خطًا واضحًا وحجمًا مريحًا مع مسافات مناسبة بين السطور.</li><li>تجنب الكتل الطويلة والجمل المرهقة، وقسّم المحتوى إلى وحدات ذات عناوين.</li><li>تحقق من التباين، ولا تختبر اللون بصريًا فقط.</li><li>تجنب الإفراط في المائل والتسطير كوسيلة تأكيد؛ حافظ على شكل الروابط مميزًا.</li></ul></section>
      <section style={box}><h2>4. الفيديو والصوت والحركة</h2><ul><li>وفر تسميات توضيحية للفيديو ومحتوى نصيًا بديلًا للمعلومات الصوتية المهمة.</li><li>أضف وصفًا للمعلومة البصرية المهمة عندما لا يمكن فهمها من الصوت.</li><li>تجنب التشغيل التلقائي والحركة غير الضرورية، واحترم تفضيل تقليل الحركة.</li><li>لا تستخدم وميضًا أو انتقالات قد تسبب خطرًا أو إزعاجًا.</li></ul></section>
      <section style={box}><h2>5. Word وPDF والملفات القابلة للتنزيل</h2><ul><li>استخدم أنماط العناوين الحقيقية والعلامات الدلالية داخل المستند.</li><li>أضف alt text للصور والرسوم.</li><li>تحقق من ترتيب القراءة والعلامات tags قبل النشر.</li><li>عندما يكون PDF عائقًا، وفر بديل HTML مناسبًا بدل افتراض أن PDF قابل للوصول.</li></ul></section>
    </>,
  },
  'testing-protocol': {
    slug: 'testing-protocol',
    title: 'بروتوكول اختبار الوصول للموقع والمحتوى',
    description: 'بروتوكول عربي عملي يجمع فحص لوحة المفاتيح وقارئ الشاشة والتكبير والتباين والهواتف والوثائق والمراجعة البشرية.',
    body: <>
      <section style={note}><h2>الأداة الآلية ليست حكمًا نهائيًا</h2><p>يمكن للماسح الآلي اكتشاف أنماط من الأخطاء، لكنه لا يعرف إن كان النص البديل مفيدًا، أو ترتيب القراءة منطقيًا، أو التعليمات مفهومة. لذلك نستخدم طبقات اختبار متعددة.</p></section>
      <section style={box}><h2>جولة 1 — لوحة المفاتيح</h2><ol><li>ابدأ من شريط العنوان ولا تستخدم الفأرة.</li><li>مر على كل عنصر تفاعلي بـ Tab وShift+Tab.</li><li>تحقق من ظهور focus بوضوح وعدم احتجازه.</li><li>نفذ القوائم والنوافذ والأزرار والحقول بلوحة المفاتيح فقط.</li></ol></section>
      <section style={box}><h2>جولة 2 — قارئ الشاشة</h2><ol><li>استعرض العناوين وحدها أولًا: هل تصف الصفحة؟</li><li>استعرض الروابط وحدها: هل تُفهم خارج سياق الجملة؟</li><li>اختبر أسماء الحقول ورسائل الخطأ والتغييرات الديناميكية.</li><li>راجع الصور والرسوم والجداول وما إذا كانت المعلومات الأساسية تصل سمعيًا.</li></ol></section>
      <section style={box}><h2>جولة 3 — الرؤية والتكبير</h2><ol><li>كبّر النص/الصفحة حتى 200% على الأقل وافحص فقد المحتوى أو التداخل.</li><li>افحص التباين وحالات hover/focus/error.</li><li>اختبر الصفحة على شاشة هاتف ضيقة واتجاه RTL.</li><li>تحقق من أن الأزرار ومساحات اللمس ليست صغيرة أو متقاربة بشكل يسبب أخطاء.</li></ol></section>
      <section style={box}><h2>جولة 4 — المحتوى والوثائق</h2><ol><li>اقرأ الصفحة كمستخدم جديد: هل المهمة واضحة قبل التفاصيل؟</li><li>اختبر PDF/Word بقارئ الشاشة وأداة فحص الوصول.</li><li>وفّر HTML عندما يكون المستند هو الوسيلة الوحيدة للوصول إلى معلومة أساسية.</li><li>اختبر الفيديو: captions، transcript، ومعلومة بصرية غير منطوقة.</li></ol></section>
      <section style={box}><h2>جولة 5 — اختبار مع أشخاص ذوي إعاقة</h2><p>اجمع ملاحظات الاستخدام الحقيقي من أكثر من نمط احتياج، وسجّل المشكلة، أثرها، من يتأثر بها، أولوية الإصلاح، ونتيجة إعادة الاختبار. لا تستبدل هذا بمراجعة داخلية من المطور وحده.</p></section>
    </>,
  },
  'health-facility-audit': {
    slug: 'health-facility-audit',
    title: 'كيف تنفذ تدقيق إمكانية الوصول لمرفق صحي؟',
    description: 'مسار عربي مستند إلى منهج Sightsavers لتخطيط وتنفيذ وتوثيق تدقيق الوصول في المرافق الصحية مع تحديد التحسينات والأولوية والتكلفة.',
    body: <>
      <section style={note}><h2>هذا ليس فحص موقع ويب</h2><p>حزمة Sightsavers للمرافق الصحية صُممت لمساعدة الحكومات ومقدمي الرعاية والمنظمات على تقييم البنية الصحية وتحسينها، خصوصًا في البيئات منخفضة ومتوسطة الدخل. لا نحولها هنا إلى معيار هندسي محلي ملزم؛ التشريعات والأكواد الوطنية تظل المرجع القانوني.</p></section>
      <section style={box}><h2>1. قبل الزيارة</h2><ul><li>حدد نطاق المنشأة ومسار المريض الذي ستدققه.</li><li>كوّن فريقًا يشمل أشخاصًا ذوي إعاقة أو منظمات تمثلهم، لا فريقًا تقنيًا فقط.</li><li>اتفق مع إدارة المنشأة واحصل على الموافقات المطلوبة.</li><li>درب الفريق على طريقة القياس والتوثيق لتقليل اختلاف التقدير بين المدققين.</li></ul></section>
      <section style={box}><h2>2. أثناء التدقيق</h2><ul><li>تتبع رحلة المستخدم من الوصول والنقل والمدخل حتى التسجيل والانتظار والخدمة ودورات المياه والخروج.</li><li>وثق العوائق بالأرقام والصور المسموح بها والموقع الدقيق، لا بعبارة «غير مناسب» فقط.</li><li>اختبر المعلومات واللافتات والتواصل إلى جانب البيئة المبنية.</li><li>سجل الحلول الممكنة السريعة والحلول التي تحتاج تصميمًا أو تمويلًا.</li></ul></section>
      <section style={box}><h2>3. التقرير والأولوية</h2><ul><li>افصل بين خطر السلامة، عائق يمنع الخدمة، عائق يسبب صعوبة، وتحسين مرغوب.</li><li>عيّن مالكًا لكل إجراء وموعد مراجعة.</li><li>اطلب تقدير تكلفة بدل ترك التوصية بلا قابلية تنفيذ.</li><li>احتفظ بالنقاط الإيجابية أيضًا حتى يعرف الفريق ما يجب الحفاظ عليه.</li></ul></section>
      <section style={box}><h2>4. بعد التحسين</h2><p>أعد الاختبار بعد التعديل. «تم تركيب منحدر» ليست نتيجة كافية؛ النتيجة هي أن المسار أصبح قابلًا للاستخدام بأمان واستقلالية معقولة، وأن التعديل لم ينشئ عائقًا جديدًا.</p></section>
    </>,
  },
};

function keyFromSlug(slug?: string[]) { return (slug ?? []).join('/'); }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const key = keyFromSlug(slug);
  const page = pages[key];
  if (!page) return {};
  const path = page.slug ? `/accessibility/sightsavers/${page.slug}/` : '/accessibility/sightsavers/';
  return buildSeoMetadata({
    title: page.title,
    description: page.description,
    path,
    index: true,
    follow: true,
    type: 'website',
    keywords: ['الوصولية', 'Sightsavers', 'اختبار الوصول', 'المحتوى الرقمي الشامل', 'تدقيق المرافق الصحية', 'RTL accessibility'],
  });
}

export default async function SightsaversAccessibilityPage({ params }: { params: Params }) {
  const { slug } = await params;
  const key = keyFromSlug(slug);
  const page = pages[key];
  if (!page) notFound();
  return <main dir="rtl" style={{maxWidth:1050,margin:'0 auto',padding:'2rem 1rem',lineHeight:1.95,color:'#14251f'}}>
    <nav aria-label="مسار الصفحة"><Link href="/accessibility-statement/">بيان الوصول</Link> · <Link href="/accessibility/sightsavers/">موارد عملية مستندة إلى Sightsavers</Link></nav>
    <header style={{margin:'1rem 0 1.5rem'}}><p style={{color:'#0b6655',fontWeight:700}}>Sightsavers — تطبيق مستقل مع الإسناد للمصدر</p><h1>{page.title}</h1><p>{page.description}</p></header>
    {page.body}
    <section style={box}><h2>المصادر الأصلية</h2><ul><li><a href={SOURCE_COMMUNICATIONS} target="_blank" rel="noopener noreferrer">Sightsavers — Accessibility</a></li><li><a href={SOURCE_TESTING} target="_blank" rel="noopener noreferrer">Sightsavers — How in-house accessibility testing has evolved</a></li><li><a href={SOURCE_FACILITIES} target="_blank" rel="noopener noreferrer">Sightsavers — Accessibility standards and audit pack</a></li><li><a href={PACK_PERMISSIONS} target="_blank" rel="noopener noreferrer">Accessibility standards and audit pack — permissions and pack contents</a></li><li><a href={SOURCE_HEALTH_RESOURCES} target="_blank" rel="noopener noreferrer">Sightsavers — Inclusive health resources</a></li><li><a href={SOURCE_STATEMENT} target="_blank" rel="noopener noreferrer">Sightsavers — Website accessibility statement</a></li></ul><p><strong>الإسناد المرجعي:</strong> {PACK_CITATION}.</p><p>توضح وثيقة الصلاحيات أن الحزمة مادة محمية بحقوق النشر، مع إمكان استخدام أو تكييف عناصر محددة في سياقات البحث والتطوير غير الربحية وفق الشروط الواردة في الوثيقة؛ ولا يعني ذلك ترخيصًا عامًا غير مقيد لإعادة نشر النصوص أو الصور أو كامل الحزمة. لذلك تقدم روافد تلخيصًا وتطبيقًا عربيًا مستقلًا وتربط بالمصدر الأصلي بدل نسخ الحزمة بالجملة.</p><p>هذا المحتوى إعداد عربي مستقل من Health Renewal مستفيد من الموارد العامة التي أحالتنا إليها Sightsavers. لا نستخدم اسم أو شعار Sightsavers كاعتماد، ولا نزعم أن هذه الصفحات ترجمة رسمية أو أنها خضعت لمراجعتهم.</p></section>
  </main>;
}