import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const ROOT = '/sections/research-evidence-learning/';
const ORDER = [
  'basics', 'read-paper', 'questions', 'design', 'quality', 'bias', 'critical-checklist', 'analysis',
  'interpret-results', 'certainty', 'common-errors', 'compare', 'example', 'reporting', 'advanced',
  'researcher', 'professional', 'application', 'school', 'family',
] as const;

const LABELS: Record<(typeof ORDER)[number], string> = {
  basics: 'الأساسيات',
  'read-paper': 'كيف تقرأ الدراسة',
  questions: '20 سؤالًا قبل تصديق الادعاء',
  design: 'تصميم دراسة قوية',
  quality: 'الحكم على الجودة',
  bias: 'التحيز ومصادره',
  'critical-checklist': 'قائمة التقييم النقدي',
  analysis: 'التحليل الإحصائي والمنهجي',
  'interpret-results': 'تفسير النتائج',
  certainty: 'درجة الثقة في الاستنتاج',
  'common-errors': 'الأخطاء الشائعة',
  compare: 'المقارنة مع البدائل',
  example: 'مثال تطبيقي مشروح',
  reporting: 'التقرير العلمي والشفافية',
  advanced: 'قراءة متقدمة',
  researcher: 'دليل للباحث',
  professional: 'دليل للمختص',
  application: 'التطبيق في الواقع',
  school: 'التطبيق في المدرسة',
  family: 'ما الذي يعنيه للأسرة',
};

const OBJECTIVES: Record<(typeof ORDER)[number], string> = {
  basics: 'ابنِ نموذجًا ذهنيًا للمفهوم: ما هو، متى يُستخدم، وما السؤال الذي يجيب عنه.',
  'read-paper': 'استخرج من الورقة السؤال والتصميم والعينة والقياس والتحليل والنتيجة قبل قراءة تفسير المؤلفين.',
  questions: 'استخدم أسئلة تحقق قصيرة تكشف بسرعة أين قد يكون الادعاء أقوى من البيانات.',
  design: 'حوّل السؤال إلى بروتوكول يحدد السكان والمتغيرات والمقارنة والزمن وخطة التحليل قبل رؤية النتائج.',
  quality: 'افصل جودة التصميم والتنفيذ والتقرير عن حجم النتيجة أو شهرة المجلة.',
  bias: 'حدّد مسار التحيز والنتيجة المتأثرة واتجاه التشويه المحتمل بدل الاكتفاء بوصف عام.',
  'critical-checklist': 'حوّل القراءة إلى سجل قابل للتدقيق: سؤال، دليل من النص، حكم، وأثر محتمل على الثقة.',
  analysis: 'تحقق أن التحليل يتبع السؤال وبنية البيانات والافتراضات، لا أن السؤال أعيد تشكيله ليناسب نتيجة جذابة.',
  'interpret-results': 'ترجم الرقم إلى حجم أثر وعدم يقين وأهمية عملية، ثم اربطه بقيود التصميم.',
  certainty: 'فرّق بين تقدير الأثر ودرجة الثقة فيه، وحدد ما الذي يمكن أن يخفض أو يرفع اليقين.',
  'common-errors': 'تعرّف على الأخطاء المفاهيمية والتحليلية والتقريرية المتكررة وتعلم صياغة البديل المنضبط.',
  compare: 'قارن البدائل بحسب السؤال الذي تجيب عنه، مصادر التحيز، الموارد، وقابلية التطبيق؛ لا بترتيب مطلق.',
  example: 'طبّق المنهج خطوة بخطوة على حالة عملية، واكتب نسخة متسرعة ثم نسخة منضبطة من الاستنتاج.',
  reporting: 'افحص قابلية تتبع القرار من البروتوكول إلى النشر، وميّز شفافية التقرير عن سلامة المنهج.',
  advanced: 'اختبر حساسية الاستنتاج للافتراضات والاختيارات التحليلية وحدد أين يمكن أن ينكسر الحكم.',
  researcher: 'حوّل مبادئ التقييم النقدي إلى قرارات مسبقة في تصميم الدراسة وجمع البيانات والتحليل والتقرير.',
  professional: 'اربط الدليل بالقرار المهني والبدائل والمخاطر والقيم ومراقبة الاستجابة دون تحويل المتوسط إلى ضمان فردي.',
  application: 'اختبر نقل النتيجة إلى سياق مختلف من حيث السكان والموارد والتنفيذ والقيم والنتائج المهمة.',
  school: 'طبّق الدليل مع الانتباه إلى العناقيد المدرسية والتنفيذ والإنصاف والمشاركة والنتائج الوظيفية.',
  family: 'حوّل النتيجة الجماعية إلى أسئلة مفيدة للأسرة من دون تشخيص أو تنبؤ فردي غير مبرر.',
};

const TOPIC_FOCUS: Record<string, string> = {
  'randomized-trials': 'العشوائية، إخفاء التخصيص، الانحراف عن التدخل، الفقد، تحليل intention-to-treat، والنتائج المنتقاة.',
  'observational-studies': 'الزمنية، اختيار المشاركين، الالتباس، القياس، والتمييز بين الارتباط والاستدلال السببي.',
  'cohort-studies': 'تعريف التعرض، بدء المتابعة، الفقد، الزمن المعرض للخطر، والخلط بين الخطر والمعدل.',
  'case-control': 'اختيار الحالات والشواهد، تعريف التعرض السابق، تحيز التذكر، وتفسير odds ratio.',
  'cross-sectional': 'الانتشار، القياس في نقطة زمنية واحدة، غموض التسلسل الزمني، والتحيز في الاختيار.',
  'systematic-reviews': 'البروتوكول، معايير الأهلية، البحث الشامل، اختيار الدراسات، خطر التحيز، وتركيب النتائج.',
  'meta-analysis': 'قابلية دمج الدراسات، مقاييس الأثر، عدم التجانس، النماذج الإحصائية، وتحليلات الحساسية.',
  'publication-bias': 'النتائج والدراسات المفقودة، التسجيل المسبق، الانتقائية، وحدود تفسير funnel plots.',
  'risk-of-bias': 'تقييم التهديدات المنهجية على مستوى النتيجة بدل اختزال الجودة في رقم واحد.',
  'effect-size': 'المقاييس المطلقة والنسبية، المعنى العملي، المقاييس المعيارية، والتمييز بين الحجم والدلالة.',
  'confidence-intervals': 'الدقة وعدم اليقين ومدى القيم المتوافقة مع البيانات، لا التعامل مع الفاصل كاختبار ثنائي.',
  'statistical-significance': 'حدود قيمة p، تعدد الاختبارات، القوة الإحصائية، والفصل بين الدلالة والأهمية.',
  'power-sample-size': 'حجم الأثر المستهدف، التباين، الخطأين من النوع الأول والثاني، والفقد المتوقع.',
  'confounding': 'المتغيرات المشتركة، الرسم السببي، التعديل الملائم، وخطر الضبط الزائد أو ضبط الوسطاء.',
  'causal-inference': 'السؤال السببي، البديل الافتراضي، التبادل، الإيجابية، الاتساق، وحساسية الافتراضات.',
  'diagnostic-accuracy': 'المعيار المرجعي، الطيف السريري، الحساسية والنوعية، القيم التنبؤية، والتحقق الخارجي.',
  'reliability': 'الاتساق داخل المقيم وبين المقيمين وعبر الزمن، وفصل الثبات عن الصدق.',
  'validity': 'هل الأداة تقيس البناء المقصود؟ أدلة المحتوى والبنية والعلاقة بمعايير أخرى وقابلية النقل.',
  'qualitative-research': 'ملاءمة العينة، عمق جمع البيانات، الانعكاسية، شفافية التحليل، والتشبع أو كفاية المعلومات.',
  'mixed-methods': 'سبب دمج المنهج الكمي والنوعي، نقطة الدمج، وكيف يغيّر التكامل الاستنتاج.',
  'grade-certainty': 'خطر التحيز وعدم الاتساق وعدم المباشرة وعدم الدقة والتحيز في النشر عند تقدير يقين مجموعة الأدلة.',
  'evidence-based-practice': 'دمج أفضل دليل متاح مع الخبرة المهنية وقيم المستفيد والسياق والموارد.',
  'critical-appraisal': 'سلسلة الحكم من السؤال إلى التصميم والقياس والتحليل والنتيجة والقيود وقابلية التطبيق.',
  'open-science': 'الشفافية، مشاركة البروتوكولات والبيانات والكود، قابلية التكرار، وحدود إعادة الاستخدام.',
  'preregistration': 'تمييز القرارات السابقة للبيانات عن الاستكشاف اللاحق، وتوثيق الانحرافات بوضوح.',
  'research-ethics': 'الموافقة المستنيرة، التناسب بين المخاطر والفائدة، العدالة، الخصوصية، وحماية الفئات الأكثر هشاشة.',
  'implementation-science': 'الفجوة بين الفعالية والتنفيذ، التبني والالتزام والسياق والاستدامة ونتائج التنفيذ.',
  'education-evidence': 'العناقيد المدرسية، التباين بين المدارس، جودة التنفيذ، الإنصاف، والمخرجات التعليمية والوظيفية.',
};

const RELATED_TOPICS: Record<string, string[]> = {
  'randomized-trials': ['risk-of-bias', 'systematic-reviews', 'meta-analysis', 'grade-certainty'],
  'systematic-reviews': ['meta-analysis', 'risk-of-bias', 'publication-bias', 'grade-certainty'],
  'meta-analysis': ['systematic-reviews', 'effect-size', 'confidence-intervals', 'publication-bias'],
  'risk-of-bias': ['randomized-trials', 'observational-studies', 'systematic-reviews', 'grade-certainty'],
  'effect-size': ['confidence-intervals', 'statistical-significance', 'meta-analysis', 'power-sample-size'],
  'confidence-intervals': ['effect-size', 'statistical-significance', 'power-sample-size', 'meta-analysis'],
  'statistical-significance': ['effect-size', 'confidence-intervals', 'power-sample-size', 'preregistration'],
  'power-sample-size': ['effect-size', 'confidence-intervals', 'statistical-significance', 'randomized-trials'],
  'observational-studies': ['cohort-studies', 'case-control', 'cross-sectional', 'confounding', 'causal-inference'],
  'cohort-studies': ['observational-studies', 'confounding', 'causal-inference', 'risk-of-bias'],
  'case-control': ['observational-studies', 'confounding', 'causal-inference', 'risk-of-bias'],
  'cross-sectional': ['observational-studies', 'validity', 'risk-of-bias', 'statistical-significance'],
  'confounding': ['causal-inference', 'observational-studies', 'risk-of-bias', 'cohort-studies'],
  'causal-inference': ['confounding', 'observational-studies', 'randomized-trials', 'risk-of-bias'],
  'publication-bias': ['systematic-reviews', 'meta-analysis', 'preregistration', 'open-science'],
  'grade-certainty': ['systematic-reviews', 'risk-of-bias', 'confidence-intervals', 'evidence-based-practice'],
  'diagnostic-accuracy': ['validity', 'reliability', 'risk-of-bias', 'systematic-reviews'],
  'reliability': ['validity', 'diagnostic-accuracy', 'effect-size', 'education-evidence'],
  'validity': ['reliability', 'diagnostic-accuracy', 'critical-appraisal', 'education-evidence'],
  'qualitative-research': ['mixed-methods', 'critical-appraisal', 'research-ethics', 'implementation-science'],
  'mixed-methods': ['qualitative-research', 'critical-appraisal', 'implementation-science', 'education-evidence'],
  'evidence-based-practice': ['grade-certainty', 'systematic-reviews', 'critical-appraisal', 'implementation-science'],
  'critical-appraisal': ['risk-of-bias', 'evidence-based-practice', 'systematic-reviews', 'validity'],
  'open-science': ['preregistration', 'publication-bias', 'research-ethics', 'critical-appraisal'],
  'preregistration': ['open-science', 'publication-bias', 'research-ethics', 'randomized-trials'],
  'research-ethics': ['open-science', 'preregistration', 'qualitative-research', 'randomized-trials'],
  'implementation-science': ['evidence-based-practice', 'education-evidence', 'mixed-methods', 'systematic-reviews'],
  'education-evidence': ['implementation-science', 'randomized-trials', 'systematic-reviews', 'validity'],
};

type Suffix = (typeof ORDER)[number];
type Row = { title: string; canonical_url: string | null };

function routeParts(route: string) {
  if (!route.startsWith(ROOT)) return null;
  const leaf = route.slice(ROOT.length).replace(/^\/+|\/+$/g, '');
  if (!leaf) return null;
  for (const suffix of ORDER) {
    const marker = `-${suffix}`;
    if (leaf.endsWith(marker)) {
      const topic = leaf.slice(0, -marker.length);
      if (topic) return { topic, suffix };
    }
  }
  return null;
}

function suffixForCanonical(canonical: string, topic: string): Suffix | null {
  const leaf = canonical.replace(/^.*\/research-evidence-learning\//, '').replace(/^\/+|\/+$/g, '');
  const prefix = `${topic}-`;
  if (!leaf.startsWith(prefix)) return null;
  const suffix = leaf.slice(prefix.length) as Suffix;
  return ORDER.includes(suffix) ? suffix : null;
}

export default async function ResearchEvidenceLearningNav({ route }: { route: string }) {
  const parsed = routeParts(route);
  if (!parsed) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select('title,canonical_url')
    .like('canonical_url', `${ROOT}${parsed.topic}-%/`)
    .eq('status', 'published')
    .eq('robots_index', true)
    .eq('robots_follow', true)
    .lte('published_at', new Date().toISOString());
  if (error || !data?.length) return null;

  const bySuffix = new Map<Suffix, Row>();
  for (const row of data as Row[]) {
    if (!row.canonical_url) continue;
    const suffix = suffixForCanonical(row.canonical_url, parsed.topic);
    if (suffix && !bySuffix.has(suffix)) bySuffix.set(suffix, row);
  }

  const relatedTopics = RELATED_TOPICS[parsed.topic] || [];
  const relatedPaths = relatedTopics.map((topic) => `${ROOT}${topic}-basics/`);
  let relatedRows: Row[] = [];
  if (relatedPaths.length) {
    const { data: relatedData } = await supabase
      .from('content')
      .select('title,canonical_url')
      .in('canonical_url', relatedPaths)
      .eq('status', 'published')
      .eq('robots_index', true)
      .eq('robots_follow', true)
      .lte('published_at', new Date().toISOString());
    relatedRows = (relatedData ?? []) as Row[];
  }
  const relatedByPath = new Map(relatedRows.filter((row) => row.canonical_url).map((row) => [row.canonical_url as string, row]));
  const orderedRelated = relatedTopics
    .map((topic) => relatedByPath.get(`${ROOT}${topic}-basics/`))
    .filter((row): row is Row => Boolean(row?.canonical_url));

  const currentIndex = ORDER.indexOf(parsed.suffix);
  const previous = currentIndex > 0 ? bySuffix.get(ORDER[currentIndex - 1]) : null;
  const next = currentIndex >= 0 && currentIndex < ORDER.length - 1 ? bySuffix.get(ORDER[currentIndex + 1]) : null;
  const currentRow = bySuffix.get(parsed.suffix);
  const topicLabel = currentRow?.title.includes(':') ? currentRow.title.split(':').slice(1).join(':').trim() : currentRow?.title || parsed.topic.replace(/-/g, ' ');
  const topicFocus = TOPIC_FOCUS[parsed.topic] || 'اربط السؤال بالتصميم والقياس والتحليل وحدود الاستنتاج وقابلية التطبيق.';

  return <section className="article-related research-learning-path" aria-labelledby="research-learning-path-title">
    <div className="section-heading">
      <span>مسار تعلم مترابط</span>
      <h2 id="research-learning-path-title">مسار: {topicLabel}</h2>
      <p>هذه الصفحة جزء من مسار من 20 خطوة؛ كل خطوة لها وظيفة مختلفة، وليس المقصود قراءة الصفحات كنسخ متكررة من دليل واحد.</p>
    </div>

    <aside className="content-callout info" aria-label="جوهر الموضوع">
      <strong>جوهر هذا الموضوع</strong>
      <p>{topicFocus}</p>
    </aside>
    <aside className="content-callout success" aria-label="هدف هذه الصفحة">
      <strong>هدف هذه الخطوة: {LABELS[parsed.suffix]}</strong>
      <p>{OBJECTIVES[parsed.suffix]}</p>
    </aside>

    <div className="public-stat-strip">
      <span>الخطوة {(currentIndex + 1).toLocaleString('ar')} من {ORDER.length.toLocaleString('ar')}</span>
      <span>{bySuffix.size.toLocaleString('ar')} صفحة متاحة في هذا المسار</span>
    </div>

    <nav className="sector-quick-nav" aria-label={`خطوات تعلم ${topicLabel}`}>
      {ORDER.map((suffix, index) => {
        const row = bySuffix.get(suffix);
        if (!row?.canonical_url) return null;
        const current = suffix === parsed.suffix;
        return <Link key={suffix} href={row.canonical_url} aria-current={current ? 'page' : undefined}>
          {`${(index + 1).toLocaleString('ar')}. ${LABELS[suffix]}${current ? ' — أنت هنا' : ''}`}
        </Link>;
      })}
    </nav>

    {(previous || next) ? <div className="article-related">
      <h3>تابع المسار</h3>
      <ul>
        {previous?.canonical_url ? <li><Link href={previous.canonical_url}>السابق: {previous.title}</Link></li> : null}
        {next?.canonical_url ? <li><Link href={next.canonical_url}>التالي: {next.title}</Link></li> : null}
      </ul>
    </div> : null}

    {orderedRelated.length ? <div className="article-related">
      <h3>مسارات مرتبطة لتوسيع الفهم</h3>
      <p>بعد إتقان هذا الموضوع، انتقل إلى المسارات التالية بحسب العلاقة المنهجية بينها بدل اختيار موضوع جديد عشوائيًا.</p>
      <ul>{orderedRelated.map((row) => <li key={row.canonical_url as string}><Link href={row.canonical_url as string}>{row.title}</Link></li>)}</ul>
    </div> : null}
  </section>;
}
