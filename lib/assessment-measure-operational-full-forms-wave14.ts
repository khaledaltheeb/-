import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const yesNoUnknown: OperationalOption[] = [
  { labelAr: 'نعم', value: 'yes' },
  { labelAr: 'لا', value: 'no' },
  { labelAr: 'غير معروف / غير موثق', value: 'unknown' },
];

const score03: OperationalOption[] = [0, 1, 2, 3].map((score) => ({ labelAr: String(score), value: String(score), score }));
const score04: OperationalOption[] = [0, 1, 2, 3, 4].map((score) => ({ labelAr: String(score), value: String(score), score }));

const SES_CD_CDICS = 'https://www.cdisc.org/standards/foundational/qrs/simple-endoscopic-score-crohns-disease-version-1';
const SES_CD_ORIGINAL = 'https://pubmed.ncbi.nlm.nih.gov/15472670/';
const CDAI_CDISC = 'https://www.cdisc.org/standards/foundational/qrs/crohns-disease-activity-index-version-1';
const CDAI_ORIGINAL = 'https://pubmed.ncbi.nlm.nih.gov/1248701/';
const IPAQ_HOME = 'https://sites.google.com/view/ipaq/home';
const IPAQ_SCORE = 'https://sites.google.com/view/ipaq/score';
const IPAQ_CDISC = 'https://www.cdisc.org/standards/foundational/qrs/international-physical-activity-questionnaire-october-2002-long-last-7';
const IPAQ_ARABIC = 'https://pubmed.ncbi.nlm.nih.gov/28738790/';
const VFQ_NEI = 'https://www.nei.nih.gov/about/education-and-outreach/outreach-materials/visual-function-questionnaire-25';
const VFQ_MANUAL = 'https://www.nei.nih.gov/sites/default/files/2019-06/manual_cm2000.pdf';
const VFQ_ARABIC = 'https://pubmed.ncbi.nlm.nih.gov/25349812/';
const MPAI_CDISC = 'https://www.cdisc.org/standards/foundational/qrs/mayo-portland-adaptability-inventory';
const MPAI_OFFICIAL = 'https://tbims.org/mpai/index.html';
const MPAI_RMD = 'https://www.sralab.org/rehabilitation-measures/mayo-portland-adaptability-inventory';

const sesSegments = [
  ['ILEUM', 'اللفائفي النهائي'],
  ['RIGHT', 'القولون الأيمن'],
  ['TRANSVERSE', 'القولون المستعرض'],
  ['LEFT', 'القولون الأيسر/السيني'],
  ['RECTUM', 'المستقيم'],
] as const;

const sesSections = sesSegments.map(([code, titleAr]) => ({
  titleAr,
  instructionsAr: 'قيّم فقط ما أمكن فحصه فعليًا وسجّل عدم إمكانية العبور/التقييم بدل اختلاق قيمة للقطاعات غير المرئية.',
  items: [
    {
      code: `SES-${code}-ULCER-SIZE`,
      labelAr: 'حجم أكبر قرحة في القطاع',
      type: 'choice' as const,
      options: [
        { labelAr: '0 — لا قرحات', value: '0', score: 0 },
        { labelAr: '1 — قرحات قلاعية 0.1–0.5 سم', value: '1', score: 1 },
        { labelAr: '2 — قرحات كبيرة >0.5 وحتى 2 سم', value: '2', score: 2 },
        { labelAr: '3 — قرحات كبيرة جدًا >2 سم', value: '3', score: 3 },
      ],
    },
    {
      code: `SES-${code}-ULCERATED-SURFACE`,
      labelAr: 'نسبة السطح المتقرّح',
      type: 'choice' as const,
      options: [
        { labelAr: '0 — لا يوجد', value: '0', score: 0 },
        { labelAr: '1 — أقل من 10%', value: '1', score: 1 },
        { labelAr: '2 — 10–30%', value: '2', score: 2 },
        { labelAr: '3 — أكثر من 30%', value: '3', score: 3 },
      ],
    },
    {
      code: `SES-${code}-AFFECTED-SURFACE`,
      labelAr: 'نسبة السطح المتأثر بالمرض',
      type: 'choice' as const,
      options: [
        { labelAr: '0 — قطاع غير متأثر', value: '0', score: 0 },
        { labelAr: '1 — أقل من 50%', value: '1', score: 1 },
        { labelAr: '2 — 50–75%', value: '2', score: 2 },
        { labelAr: '3 — أكثر من 75%', value: '3', score: 3 },
      ],
    },
    {
      code: `SES-${code}-NARROWING`,
      labelAr: 'التضيّق',
      type: 'choice' as const,
      options: [
        { labelAr: '0 — لا يوجد', value: '0', score: 0 },
        { labelAr: '1 — تضيق واحد ويمكن عبوره', value: '1', score: 1 },
        { labelAr: '2 — تضيق متعدد ويمكن عبوره', value: '2', score: 2 },
        { labelAr: '3 — تضيق لا يمكن عبوره', value: '3', score: 3 },
      ],
    },
  ],
}));

export const assessmentOperationalFullFormsWave14: Record<string, AssessmentOperationalMaterial> = {
  'simple-endoscopic-score-crohns-disease-v1': {
    slug: 'simple-endoscopic-score-crohns-disease-v1',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'SES-CD V1 — ورقة التسجيل والحساب التنظيري لداء كرون',
    titleEn: 'Simple Endoscopic Score for Crohn’s Disease Version 1',
    version: 'Daperno et al. 2004 / CDISC SES-CD V1',
    provenance: 'CDISC يصنف SES-CD V1 ضمن Public Domain. تعتمد هذه الورقة على البناء الأصلي الذي يسجل أربعة متغيرات من 0–3 في خمسة قطاعات ileocolonic: حجم القرحة، السطح المتقرح، السطح المتأثر، والتضيق.',
    rightsNotice: 'الأداة الأصلية Public Domain وفق CDISC. لا تُنسخ هنا صور تنظير أو رسوم ناشرين؛ الورقة تعيد بناء حقول التسجيل الرقمية/الطباعية للمؤشر نفسه مع نسبة المصدر.',
    intendedUseAr: 'توثيق النشاط التنظيري لداء كرون أثناء ileocolonoscopy بواسطة اختصاصي متمرس، ومقارنة النشاط عبر الزمن أو الدراسات باستخدام النسخة نفسها.',
    respondentFields: ['الاسم/الرمز', 'تاريخ التنظير', 'الفاحص/المنظار', 'مدى الوصول التشريحي', 'جودة التحضير', 'سبب الفحص/نقطة الزمن العلاجية'],
    preflightChecks: [
      'ثبت أن المؤشر المطلوب هو SES-CD V1 وليس CDEIS أو modified SES-CD.',
      'قيّم القطاعات الخمسة: اللفائفي، القولون الأيمن، المستعرض، الأيسر/السيني، والمستقيم عندما تكون قابلة للتقييم.',
      'إذا منع تضيق مرور المنظار، سجّل عدم إمكانية تقييم القطاعات التالية؛ لا تسند لها صفراً تلقائيًا.',
      'لا تحوّل عتبات remission/response المنشورة في تجربة بعينها إلى معيار عالمي دون تحديد الدراسة والسياق.',
    ],
    sections: [
      ...sesSections,
      {
        titleAr: 'النتيجة النهائية',
        items: [
          { code: 'SES-CD-TOTAL', labelAr: 'مجموع SES-CD', type: 'number', min: 0, max: 56, unit: '0–56' },
          { code: 'SES-CD-UNEVALUATED', labelAr: 'القطاعات غير القابلة للتقييم وسبب ذلك', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'في كل قطاع، قيّم: حجم القرحة 0–3، نسبة السطح المتقرح 0–3، نسبة السطح المتأثر 0–3، والتضيق 0–3.',
      'اجمع الدرجات وفق بنية SES-CD الأصلية عبر القطاعات القابلة للتقييم. النطاق المرجعي المنشور للمؤشر 0–56؛ الدرجة الأعلى تعكس نشاطًا تنظيريًا أشد.',
      'وجود تضيق غير قابل للعبور يحد من تقييم ما بعده؛ احتفظ بمعلومة القطاعات غير المقيمة بدل تقديم مجموع منخفض زائف.',
      'عند المتابعة استخدم النسخة نفسها، ونفس تعريفات المتغيرات، ويفضل توثيق مدى التنظير وجودة التحضير لتفسير التغير.',
    ],
    interpretationGuardrails: [
      'SES-CD يقيس المظهر التنظيري ولا يساوي الأعراض أو النشاط النسيجي أو الالتهاب الحيوي؛ يمكن أن تتباين هذه المحاور.',
      'لا توجد عتبة واحدة عالمية تصلح لكل تجربة/قرار علاجي؛ اربط أي cut-off ببروتوكوله ومجتمعه.',
      'الدرجة ليست بديلًا عن تقييم الاختلاطات مثل التضيق الناقد أو الناسور أو الخراج أو التدهور السريري.',
    ],
    stopRules: ['إذا كان التنظير غير آمن أو ظهرت مضاعفة حادة، تتقدم السلامة السريرية على استكمال المؤشر.'],
    officialDownloads: [
      { label: 'CDISC QRS — SES-CD V1, Public Domain', url: SES_CD_CDICS, language: 'en', publisher: 'CDISC' },
      { label: 'PubMed — Daperno et al. original development and validation', url: SES_CD_ORIGINAL, language: 'en', publisher: 'PubMed' },
    ],
    sourceUrls: [SES_CD_CDICS, SES_CD_ORIGINAL, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4898086/'],
    lastVerifiedOn: '2026-09-06',
  },

  'crohns-disease-activity-index-v1': {
    slug: 'crohns-disease-activity-index-v1',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'CDAI V1 — ورقة بيانات وحساب مؤشر نشاط داء كرون',
    titleEn: 'Crohn’s Disease Activity Index Version 1',
    version: 'Best et al. 1976 classic 8-variable CDAI / CDISC V1',
    provenance: 'CDISC يصنف CDAI V1 ضمن Public Domain. المؤشر الكلاسيكي اشتُق من ثمانية متغيرات ويجمع بيانات أسبوع كامل مع فحص/مختبر ووزن.',
    rightsNotice: 'CDAI V1 Public Domain وفق CDISC. هذه الورقة تنفذ البنية الرياضية التاريخية مع حواجز تفسير معاصرة، ولا تعيد نشر تصميم ناشر بعينه.',
    intendedUseAr: 'حساب CDAI الكلاسيكي عند الحاجة إلى المؤشر نفسه في بحث أو متابعة موثقة. لا يُستخدم كبديل وحيد لتقييم الالتهاب الموضوعي أو النشاط التنظيري.',
    respondentFields: ['الاسم/الرمز', 'تاريخ بداية نافذة 7 أيام', 'تاريخ نهاية النافذة', 'الفاحص', 'الجنس المستخدم في ثابت الهيماتوكريت التاريخي', 'الوزن المرجعي المستخدم ومصدره'],
    preflightChecks: [
      'تأكد من وجود سجل 7 أيام للبراز والألم والحالة العامة؛ لا تستبدل ذاكرة يوم واحد بنافذة الأسبوع.',
      'ثبت تعريف النسخة الكلاسيكية CDAI V1 قبل المقارنة بنتائج قديمة أو تجارب.',
      'استخدم الهيماتوكريت الفعلي والوزن الحالي والوزن القياسي/المرجعي الموثق مع الوحدات.',
      'لا تجعل CDAI وحده دليلًا على وجود أو غياب التهاب نشط؛ الأعراض والالتهاب قد لا يتطابقان.',
    ],
    sections: [
      {
        titleAr: 'المتغيرات اليومية — مجموع 7 أيام',
        items: [
          { code: 'CDAI-STOOL-7D', labelAr: 'مجموع مرات البراز السائل أو شديد الليونة خلال 7 أيام', type: 'number', min: 0, unit: 'مرات/7 أيام' },
          { code: 'CDAI-PAIN-7D', labelAr: 'مجموع درجات ألم البطن اليومية خلال 7 أيام (0 لا شيء، 1 خفيف، 2 متوسط، 3 شديد)', type: 'number', min: 0, max: 21, unit: '0–21' },
          { code: 'CDAI-WELLBEING-7D', labelAr: 'مجموع تقييم الحالة العامة اليومي خلال 7 أيام (0 جيد، 1 دون المعتاد قليلًا، 2 سيئ، 3 سيئ جدًا، 4 فظيع)', type: 'number', min: 0, max: 28, unit: '0–28' },
        ],
      },
      {
        titleAr: 'الاختلاطات والأدوية والفحص',
        items: [
          { code: 'CDAI-COMPLICATIONS-N', labelAr: 'عدد مجموعات الاختلاطات الموجودة في الأسبوع', type: 'number', min: 0, max: 6, unit: '0–6' },
          { code: 'CDAI-ANTIDIARRHEAL', labelAr: 'استخدام diphenoxylate/loperamide/opiate للإسهال', type: 'choice', options: yesNoUnknown },
          { code: 'CDAI-MASS', labelAr: 'كتلة بطنية', type: 'choice', options: [
            { labelAr: '0 — لا توجد', value: '0', score: 0 },
            { labelAr: '2 — مشكوك/محتملة', value: '2', score: 2 },
            { labelAr: '5 — مؤكدة/واضحة', value: '5', score: 5 },
          ] },
          { code: 'CDAI-COMPLICATIONS-NOTE', labelAr: 'تفصيل الاختلاطات: مفاصل؛ عين؛ جلد/فم؛ شرجية؛ ناسور آخر؛ حرارة >37.8°م', type: 'text' },
        ],
      },
      {
        titleAr: 'المختبر والوزن',
        items: [
          { code: 'CDAI-SEX-CONSTANT', labelAr: 'ثابت الهيماتوكريت التاريخي المستخدم', type: 'choice', options: [
            { labelAr: '47% — صيغة الرجال في المؤشر الأصلي', value: '47' },
            { labelAr: '42% — صيغة النساء في المؤشر الأصلي', value: '42' },
          ] },
          { code: 'CDAI-HCT', labelAr: 'الهيماتوكريت الفعلي', type: 'number', min: 0, max: 70, unit: '%' },
          { code: 'CDAI-WEIGHT-CURRENT', labelAr: 'الوزن الحالي', type: 'number', min: 0, unit: 'kg' },
          { code: 'CDAI-WEIGHT-STANDARD', labelAr: 'الوزن القياسي/المرجعي المستخدم في الصيغة', type: 'number', min: 0, unit: 'kg' },
        ],
      },
      {
        titleAr: 'النتيجة',
        items: [{ code: 'CDAI-TOTAL', labelAr: 'CDAI الكلي', type: 'number', min: 0, unit: 'نقطة' }],
      },
    ],
    scoringSteps: [
      'المكوّن 1 = مجموع مرات البراز السائل/شديد الليونة في 7 أيام × 2.',
      'المكوّن 2 = مجموع درجات ألم البطن اليومية (0–3) خلال 7 أيام × 5.',
      'المكوّن 3 = مجموع درجات الحالة العامة اليومية (0–4) خلال 7 أيام × 7.',
      'المكوّن 4 = عدد مجموعات الاختلاطات الموجودة × 20. المجموعات التاريخية تشمل: arthralgia/arthritis؛ iritis/uveitis؛ erythema nodosum/pyoderma gangrenosum/aphthous stomatitis؛ anal fissure/fistula/abscess؛ other fistula؛ fever >37.8°C في الأسبوع.',
      'المكوّن 5 = استخدام antidiarrheal/opiate للإسهال: نعم × 30، لا × 0.',
      'المكوّن 6 = كتلة بطنية: لا=0، محتملة=2، مؤكدة=5؛ ثم × 10.',
      'المكوّن 7 = (47 − Hct للرجال في الصيغة التاريخية، أو 42 − Hct للنساء في الصيغة التاريخية) × 6.',
      'المكوّن 8 = نسبة الانحراف عن الوزن القياسي = [1 − (الوزن الحالي ÷ الوزن القياسي)] × 100.',
      'CDAI = مجموع المكونات الثمانية. في الورقة الأصلية، ≤150 ارتبط بمرض خامل، >150 بنشاط، و>450 بحالات شديدة جدًا؛ لا تحول هذه الحدود التاريخية إلى قرار علاجي منفرد.',
    ],
    interpretationGuardrails: [
      'CDAI مقياس سريري تاريخي يعتمد بقوة على الأعراض؛ قد توجد فعالية التهابية موضوعية رغم CDAI منخفض أو أعراض مرتفعة دون التهاب مخاطي مماثل.',
      'لا تستبدل به CRP/fecal calprotectin أو التصوير أو التنظير عندما تكون مطلوبة سريريًا.',
      'تعريف الوزن القياسي وطريقة جمع اليوميات يجب أن يبقيا ثابتين في المتابعة والدراسات.',
      'ثوابت الهيماتوكريت المرتبطة بالجنس جزء من الصيغة التاريخية؛ إذا كان التطبيق غير مناسب للشخص/السياق فلا تُعدّل المعادلة محليًا ثم تسمّي الناتج CDAI الأصلي.',
    ],
    stopRules: ['نزف شديد، انسداد، سمية جهازية، خراج/إنتان، ألم حاد متفاقم أو أي طارئ بطني يحتاج تقييمًا عاجلًا مستقلًا عن CDAI.'],
    officialDownloads: [
      { label: 'CDISC QRS — CDAI V1, Public Domain', url: CDAI_CDISC, language: 'en', publisher: 'CDISC' },
      { label: 'PubMed — Best et al. original CDAI development', url: CDAI_ORIGINAL, language: 'en', publisher: 'PubMed' },
    ],
    sourceUrls: [CDAI_CDISC, CDAI_ORIGINAL, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4035027/'],
    lastVerifiedOn: '2026-09-06',
  },

  'international-physical-activity-questionnaire-long-form': {
    slug: 'international-physical-activity-questionnaire-long-form',
    kind: 'protocol-sheet',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'IPAQ-LF — ورقة إدخال وحساب للنموذج الطويل لآخر 7 أيام',
    titleEn: 'International Physical Activity Questionnaire — Long Form, Last 7 Days',
    version: 'October 2002 long last-7-days self-administered format / November 2005 scoring protocol',
    provenance: 'موقع IPAQ الرسمي يصف الأداة بأنها open access ولا تتطلب إذنًا للاستخدام، وCDISC يصنف صيغة Long Last 7 Days Self-Administered كـPublic Domain. هذه الورقة مرافق حساب وتدقيق؛ استخدم نموذج IPAQ الرسمي/الترجمة المحددة لجمع الإجابات.',
    rightsNotice: 'IPAQ متاح علنًا وفق الموقع الرسمي وCDISC. الترجمات في موقع IPAQ قد تكون مقدمة من باحثين مستقلين ولا يضمن الموقع دقتها؛ لذلك لا نعرض ترجمة عربية غير محددة على أنها النسخة الرسمية العالمية.',
    intendedUseAr: 'تسجيل تكرار ومدة النشاط حسب المجال ثم حساب MET-min/week وفق بروتوكول IPAQ Research Committee، مع الاحتفاظ ببيانات الجلوس منفصلة عن مجموع النشاط.',
    respondentFields: ['الاسم/الرمز', 'تاريخ التطبيق', 'صيغة النموذج/اللغة ومصدر التحميل', 'طريقة التطبيق', 'العمر', 'السياق البحثي/المسحي'],
    preflightChecks: [
      'استخدم نسخة IPAQ-LF محددة وثابتة؛ لا تخلط long/short أو last-7-days/usual-week.',
      'حوّل الساعات والدقائق إلى دقائق قبل الحساب.',
      'يلزم وجود عدد الأيام والمدة اليومية معًا لكل نشاط حتى يدخل ملخص MET-min/week.',
      'طبّق قواعد تنظيف IPAQ قبل التصنيف، بما في ذلك التعامل مع القيم غير المعقولة والنشاطات الأقصر من 10 دقائق وفق بروتوكول 2005 عند مقارنة دراسات تستخدم هذا البروتوكول.',
      'الدراسة العربية المنشورة عام 2017 تحققت من نسخة معدلة لدى بالغين لبنانيين؛ لا تعمم صلاحيتها تلقائيًا على كل دولة عربية أو نسخة لغوية أخرى.',
    ],
    sections: [
      {
        titleAr: 'العمل',
        items: [
          { code: 'IPAQ-W-WALK-DAYS', labelAr: 'المشي في العمل — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-W-WALK-MIN', labelAr: 'المشي في العمل — الدقائق في يوم نموذجي', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-W-MOD-DAYS', labelAr: 'نشاط متوسط في العمل — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-W-MOD-MIN', labelAr: 'نشاط متوسط في العمل — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-W-VIG-DAYS', labelAr: 'نشاط شديد في العمل — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-W-VIG-MIN', labelAr: 'نشاط شديد في العمل — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
        ],
      },
      {
        titleAr: 'النقل النشط',
        items: [
          { code: 'IPAQ-T-WALK-DAYS', labelAr: 'المشي للنقل — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-T-WALK-MIN', labelAr: 'المشي للنقل — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-T-CYCLE-DAYS', labelAr: 'الدراجة للنقل — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-T-CYCLE-MIN', labelAr: 'الدراجة للنقل — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-T-MOTOR-MIN', labelAr: 'الجلوس في مركبة للنقل — الدقائق/اليوم (للتوثيق المنفصل)', type: 'number', min: 0, unit: 'دقيقة/يوم' },
        ],
      },
      {
        titleAr: 'الأعمال المنزلية والحديقة',
        items: [
          { code: 'IPAQ-D-VIGYARD-DAYS', labelAr: 'عمل حديقة/ساحة شديد — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-D-VIGYARD-MIN', labelAr: 'عمل حديقة/ساحة شديد — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-D-MODYARD-DAYS', labelAr: 'عمل حديقة/ساحة متوسط — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-D-MODYARD-MIN', labelAr: 'عمل حديقة/ساحة متوسط — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-D-MODHOME-DAYS', labelAr: 'أعمال منزلية داخلية متوسطة — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-D-MODHOME-MIN', labelAr: 'أعمال منزلية داخلية متوسطة — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
        ],
      },
      {
        titleAr: 'وقت الفراغ',
        items: [
          { code: 'IPAQ-L-WALK-DAYS', labelAr: 'المشي في وقت الفراغ — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-L-WALK-MIN', labelAr: 'المشي في وقت الفراغ — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-L-MOD-DAYS', labelAr: 'نشاط متوسط في وقت الفراغ — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-L-MOD-MIN', labelAr: 'نشاط متوسط في وقت الفراغ — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-L-VIG-DAYS', labelAr: 'نشاط شديد في وقت الفراغ — الأيام', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQ-L-VIG-MIN', labelAr: 'نشاط شديد في وقت الفراغ — الدقائق/اليوم', type: 'number', min: 0, unit: 'دقيقة/يوم' },
        ],
      },
      {
        titleAr: 'الجلوس والملخص',
        items: [
          { code: 'IPAQ-SIT-WEEKDAY', labelAr: 'الجلوس في يوم عمل/أسبوع نموذجي — دون نقل إذا اتبعت صيغة IPAQ', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-SIT-WEEKEND', labelAr: 'الجلوس في يوم عطلة نموذجي', type: 'number', min: 0, unit: 'دقيقة/يوم' },
          { code: 'IPAQ-WORK-MET', labelAr: 'مجموع العمل', type: 'number', min: 0, unit: 'MET-min/week' },
          { code: 'IPAQ-TRANSPORT-MET', labelAr: 'مجموع النقل النشط', type: 'number', min: 0, unit: 'MET-min/week' },
          { code: 'IPAQ-DOMESTIC-MET', labelAr: 'مجموع المنزل/الحديقة', type: 'number', min: 0, unit: 'MET-min/week' },
          { code: 'IPAQ-LEISURE-MET', labelAr: 'مجموع وقت الفراغ', type: 'number', min: 0, unit: 'MET-min/week' },
          { code: 'IPAQ-TOTAL-MET', labelAr: 'إجمالي النشاط', type: 'number', min: 0, unit: 'MET-min/week' },
        ],
      },
    ],
    scoringSteps: [
      'العمل: مشي = 3.3 × دقائق × أيام؛ متوسط = 4.0 × دقائق × أيام؛ شديد = 8.0 × دقائق × أيام. مجموع العمل = مجموع الثلاثة.',
      'النقل: مشي = 3.3 × دقائق × أيام؛ دراجة = 6.0 × دقائق × أيام. مجموع النقل = المشي + الدراجة.',
      'المنزل/الحديقة: عمل حديقة شديد = 5.5 × دقائق × أيام؛ حديقة متوسط = 4.0 × دقائق × أيام؛ أعمال داخلية متوسطة = 3.0 × دقائق × أيام. في بروتوكول IPAQ تُحتسب 5.5 MET للحديقة الشديدة ضمن إجمالي النشاط المتوسط عند إنشاء ملخص الشدة.',
      'وقت الفراغ: مشي = 3.3؛ متوسط = 4.0؛ شديد = 8.0، وكل منها × دقائق/اليوم × الأيام/الأسبوع.',
      'الإجمالي = مجموع Work + Transport + Domestic/Garden + Leisure MET-min/week.',
      'التصنيف: Low إذا لم تتحقق Moderate/High. Moderate يتحقق بأحد: ≥3 أيام vigorous ≥20 دقيقة/يوم؛ أو ≥5 أيام moderate/walking ≥30 دقيقة/يوم؛ أو ≥5 أيام من أي مزيج مع ≥600 MET-min/week. High يتحقق بأحد: vigorous ≥3 أيام ومع ≥1500 MET-min/week؛ أو ≥7 أيام من أي مزيج ومع ≥3000 MET-min/week.',
      'الجلوس لا يدخل مجموع النشاط. Sitting minutes/week = weekday minutes×5 + weekend-day minutes×2؛ وإذا أضفت الجلوس في النقل فيجب تسمية المتغير بوضوح كنسخة تشمل transport sitting.',
      'اتبع قواعد تنظيف بروتوكول 2005 قبل التحليل المقارن؛ البروتوكول يوصي باستبعاد مجموعات وقت يومية غير معقولة >960 دقيقة ويعامل النشاط <10 دقائق وفق قواعده التاريخية، مع truncation خاص عند الحاجة للمقارنة المتوافقة مع IPAQ.',
    ],
    interpretationGuardrails: [
      'IPAQ أداة self-report سكانية وليست قياسًا مباشرًا لاستهلاك الطاقة ولا وصفة تمرين فردية.',
      'النسخة الطويلة تعطي تقديرات أعلى غالبًا من القصيرة بسبب التفصيل عبر المجالات؛ لا تقارن long وshort وكأنهما متكافئان.',
      'الـMET-min/week ليس سعرات فردية دقيقة، والتصنيفات Low/Moderate/High هي خوارزمية IPAQ وليست تشخيصًا صحيًا.',
      'النسخة العربية التي تحققت عام 2017 كانت تكييفًا لدى عينة لبنانية؛ اذكر النسخة والسكان عند الاستشهاد بصلاحيتها.',
    ],
    stopRules: ['إذا كانت الأيام أو الدقائق الأساسية مفقودة فلا تنتج مجموعًا دقيقًا؛ وثق missing بدل التعويض غير المعلن.'],
    officialDownloads: [
      { label: 'IPAQ official site — open-access instrument', url: IPAQ_HOME, language: 'en', publisher: 'IPAQ' },
      { label: 'IPAQ official scoring page — November 2005 combined protocol', url: IPAQ_SCORE, language: 'en', publisher: 'IPAQ' },
      { label: 'CDISC QRS — IPAQ Long Last 7 Days Self-Administered, Public Domain', url: IPAQ_CDISC, language: 'en', publisher: 'CDISC' },
      { label: 'PubMed — adapted Arabic IPAQ-LF validation in Lebanese adults', url: IPAQ_ARABIC, language: 'ar', publisher: 'PubMed' },
    ],
    sourceUrls: [IPAQ_HOME, IPAQ_SCORE, IPAQ_CDISC, IPAQ_ARABIC, 'https://pubmed.ncbi.nlm.nih.gov/12900694/'],
    lastVerifiedOn: '2026-09-06',
  },

  'visual-function-questionnaire-25': {
    slug: 'visual-function-questionnaire-25',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'NEI VFQ-25 الإصدار 2000 — ورقة تسجيل وتدقيق الدرجات',
    titleEn: 'National Eye Institute Visual Function Questionnaire-25 — Version 2000',
    version: 'NEI VFQ-25 Version 2000 scoring companion',
    provenance: 'المعهد الوطني للعين يوفر رسميًا VFQ-25 الإصدار 2000 ودليل التسجيل. النص الرسمي يجيز الاستخدام مع نسبة التطوير ويحمّل المستخدم مسؤولية دقة أي ترجمة. توجد دراسة عربية مصرية منشورة للتحقق من ARB-VFQ-25؛ هذه الورقة لا تعيد طباعة نص تلك الترجمة.',
    rightsNotice: 'النموذج الرسمي يتضمن إذن استخدام وشروط نسبة RAND/NEI ومسؤولية الترجمة. استخدم النص الرسمي أو النسخة العربية التي تملكها من مصدرها؛ ورقة روافد هنا مرافق تسجيل وحساب وليست إعادة نشر لترجمة الدراسة.',
    intendedUseAr: 'تسجيل الاستجابات من نموذج VFQ-25 الرسمي، تحويلها إلى 0–100 وفق دليل Version 2000، وحساب المجالات والدرجة المركبة مع الحفاظ على قواعد missing وعدم خلط الإصدارات.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'مصدر النموذج/رابطه', 'اللغة/الترجمة', 'طريقة التطبيق self-admin/interviewer', 'مرض/سياق العين'],
    preflightChecks: [
      'ثبت Version 2000؛ هذا الإصدار يحتوي 26 سؤالًا في الحزمة الأساسية لأن سؤال driving إضافيًا أُدخل، لكن 25 منها vision-targeted وتدخل البنية المستهدفة.',
      'استخدم مفتاح التسجيل الرسمي؛ اتجاه الدرجات يختلف بين مجموعات البنود ولا يجوز جمع الاستجابات الخام.',
      'الدرجة المركبة تستبعد سؤال general health وتلتزم بخوارزمية الدليل.',
      'إذا استخدمت ARB-VFQ-25 المصرية، انسب صلاحية الترجمة إلى الدراسة والسكان ولا تفترض أن كل صياغة عربية مكافئة لها.',
    ],
    sections: [
      {
        titleAr: 'تدقيق الاستجابات الخام من النموذج الرسمي',
        instructionsAr: 'اكتب/انقل رمز الاستجابة الخام فقط من النسخة الرسمية المستخدمة. لا تستخدم هذه الحقول بدل نص السؤال الأصلي.',
        items: Array.from({ length: 26 }, (_, index) => ({
          code: `VFQ-RAW-${index + 1}`,
          labelAr: `الاستجابة الخام للبند/السؤال ${index + 1} من نسخة VFQ-25 المستخدمة`,
          type: 'text' as const,
        })),
      },
      {
        titleAr: 'درجات المجالات — بعد التحويل الرسمي إلى 0–100',
        items: [
          { code: 'VFQ-GENERAL-HEALTH', labelAr: 'General health — منفصل ولا يدخل composite vision-targeted', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-GENERAL-VISION', labelAr: 'General vision', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-OCULAR-PAIN', labelAr: 'Ocular pain', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-NEAR', labelAr: 'Near activities', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-DISTANCE', labelAr: 'Distance activities', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-SOCIAL', labelAr: 'Vision-specific social functioning', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-MENTAL', labelAr: 'Vision-specific mental health', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-ROLE', labelAr: 'Vision-specific role difficulties', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-DEPENDENCY', labelAr: 'Vision-specific dependency', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-DRIVING', labelAr: 'Driving', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-COLOR', labelAr: 'Color vision', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-PERIPHERAL', labelAr: 'Peripheral vision', type: 'number', min: 0, max: 100, unit: '0–100' },
          { code: 'VFQ-COMPOSITE', labelAr: 'Vision-targeted composite score', type: 'number', min: 0, max: 100, unit: '0–100' },
        ],
      },
    ],
    scoringSteps: [
      'أعد ترميز كل استجابة وفق جدول Version 2000 الرسمي إلى مقياس 0–100؛ 100 يمثل أفضل وظيفة/أقل مشكلة بعد الترميز، و0 الأسوأ ضمن البند.',
      'بعض البنود ترمز 1→100 نزولًا إلى 5→0، وبعضها 1→0 صعودًا إلى 5→100؛ لذلك لا تستخدم تحويلًا واحدًا لجميع البنود.',
      'الاستجابة التي تعني أن النشاط لا يُمارس لسبب غير متعلق بالرؤية تُعامل missing حيث يحدد الدليل ذلك، ولا تُحوّل تلقائيًا إلى 0.',
      'درجة كل subscale هي متوسط البنود الصالحة التابعة له وفق mapping الدليل؛ لا تجمع الأرقام الخام.',
      'Version 2000 يستبعد general health من vision-targeted composite. احسب composite وفق الدليل من المقاييس المستهدفة بالرؤية فقط وبقواعد missing نفسها.',
    ],
    interpretationGuardrails: [
      'الفروق في 0–100 ليست تشخيصًا لمرض عيني ولا تقيس حدة البصر مباشرة؛ هي حالة صحية/وظيفية مبلّغ عنها ذاتيًا مرتبطة بالرؤية.',
      'توجد أدبيات Rasch تقترح بدائل سيكومترية لبعض الاستخدامات؛ لا تخلط Rasch scores مع scoring التقليدي Version 2000 في سلسلة زمنية واحدة دون توضيح.',
      'النسخة العربية المصرية أظهرت خصائص موثوقة/صالحة في عينة أمراض عيون مزمنة، لكن الدراسة نفسها أبلغت أن بعض الأسئلة ذات non-response مرتفع؛ حافظ على سياق السكان.',
    ],
    stopRules: ['إذا لم تعرف الإصدار أو مفتاح التسجيل أو كانت الاستجابات لا تطابق نسخة Version 2000، أوقف الحساب بدل فرض mapping تقريبي.'],
    officialDownloads: [
      { label: 'National Eye Institute — official VFQ-25 Version 2000 download', url: VFQ_NEI, language: 'en', publisher: 'National Eye Institute' },
      { label: 'NEI — Version 2000 scoring manual', url: VFQ_MANUAL, language: 'en', publisher: 'National Eye Institute' },
      { label: 'PubMed — development/testing of Arabic VFQ-25 in Egypt', url: VFQ_ARABIC, language: 'ar', publisher: 'PubMed' },
    ],
    sourceUrls: [VFQ_NEI, VFQ_MANUAL, VFQ_ARABIC, 'https://pubmed.ncbi.nlm.nih.gov/11448327/'],
    lastVerifiedOn: '2026-09-06',
  },

  'mayo-portland-adaptability-inventory-4': {
    slug: 'mayo-portland-adaptability-inventory-4',
    kind: 'protocol-sheet',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'MPAI-4 — ورقة تطبيق وتدقيق الدرجات مع النموذج الرسمي',
    titleEn: 'Mayo-Portland Adaptability Inventory-4',
    version: 'MPAI-4 official rating form/manual; scoring companion',
    provenance: 'CDISC يصنف MPAI-4 ضمن Public Domain. موقع TBIMS/COMBI الرسمي يوفر الدليل ونموذج التقدير، ويعرض بيانات مرجعية محدثة للتحويل إلى Rasch-derived T-scores. RMD يصف الأداة كـ35 بندًا: أول 29 ضمن Ability/Adjustment/Participation وستة بنود إضافية غير داخلة في المجموع.',
    rightsNotice: 'MPAI-4 Public Domain وفق CDISC، والنموذج الرسمي متاح من TBIMS. لا توجد ضمن قائمة الترجمات الرسمية المنشورة على صفحة TBIMS التي راجعناها ترجمة عربية؛ لذلك لا تعيد روافد اختراع 35 بندًا عربيًا وتصفه بأنه ترجمة رسمية.',
    intendedUseAr: 'تطبيق MPAI-4 بعد إصابة دماغية مكتسبة باستخدام النموذج الرسمي، ثم توثيق مصدر التقدير والدرجات الخام/المؤشرات والتحويل إلى T-score فقط وفق جداول الدليل المناسبة.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'نوع/تاريخ الإصابة الدماغية المكتسبة', 'مصدر التقدير: فريق/الشخص/آخر مهم', 'إصدار النموذج/الدليل', 'لغة النموذج'],
    preflightChecks: [
      'استخدم نموذج MPAI-4 الرسمي وإصدارًا ثابتًا عبر الزيارات.',
      'للتقييم المهني يفضّل الدليل الرسمي توافق فريق التأهيل على التقديرات بدل المتوسط الحسابي بين مقيمين غير متفقين.',
      'سجّل مصدر التقدير لأن staff / person with ABI / significant other قد يعطون أنماطًا مختلفة؛ لا تدمجها بلا توثيق.',
      'لا تدّع وجود نسخة عربية رسمية لمجرد أن الأداة Public Domain؛ الترجمة تحتاج مسار تكييف وتحقيق مستقل.',
    ],
    sections: [
      {
        titleAr: 'تسجيل البنود من النموذج الرسمي',
        instructionsAr: 'انقل درجة كل بند من MPAI-4 الرسمي. أول 29 بندًا تدخل بنية المؤشرات؛ البنود الستة الإضافية تسجل عوامل مرافقة ولا تدخل الدرجة الكلية.',
        items: [
          ...Array.from({ length: 29 }, (_, index) => ({
            code: `MPAI4-${index + 1}`,
            labelAr: `درجة البند ${index + 1} من النموذج الرسمي`,
            type: 'choice' as const,
            options: score04,
          })),
          ...Array.from({ length: 6 }, (_, index) => ({
            code: `MPAI4-ASSOC-${index + 30}`,
            labelAr: `العامل/البند الإضافي ${index + 30} — لا يدخل الدرجة الكلية`,
            type: 'text' as const,
          })),
        ],
      },
      {
        titleAr: 'المؤشرات والنتيجة',
        items: [
          { code: 'MPAI4-ABILITY', labelAr: 'Ability Index — raw', type: 'number', min: 0, max: 47, unit: '0–47 وفق مرجع RMD/manual' },
          { code: 'MPAI4-ADJUSTMENT', labelAr: 'Adjustment Index — raw', type: 'number', min: 0, max: 46, unit: '0–46' },
          { code: 'MPAI4-PARTICIPATION', labelAr: 'Participation Index — raw', type: 'number', min: 0, max: 30, unit: '0–30' },
          { code: 'MPAI4-TOTAL', labelAr: 'MPAI-4 total raw score', type: 'number', min: 0, max: 111, unit: '0–111 وفق المرجع المستخدم' },
          { code: 'MPAI4-T-SCORE', labelAr: 'T-score إذا حُوّل من جدول الدليل الرسمي', type: 'number', min: 0, unit: 'T-score' },
          { code: 'MPAI4-NORM-SOURCE', labelAr: 'مرجع/جدول التحويل المستخدم', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'بنود MPAI-4 الأساسية تسجل عادة من 0 إلى 4؛ الدرجة الأعلى تعكس قيودًا/مشكلات أكبر. لا تنقل وصف المرساة من ذاكرة أو نسخة أخرى؛ استخدم النموذج/الدليل الرسمي.',
      'الأداة 35 بندًا، لكن أول 29 فقط تدخل الدرجات الرئيسية؛ الستة الإضافية توثق عوامل مرافقة ولا تدخل total.',
      'احسب Ability وAdjustment وParticipation وفق mapping الدليل الرسمي؛ بعض البنود تسهم في أكثر من subscale، لذلك لا تتوقع أن يساوي total مجموع الحدود القصوى للثلاثة.',
      'عند استخدام raw total التقليدي، RMD يورد نطاقًا 0–111 مع انخفاض الدرجة دالًا على تكيف/اندماج أفضل. إذا كان إصدار الدليل/الجدول الذي تستخدمه يعرض نطاقًا مختلفًا فوثق الإصدار ولا تخلط النتائج.',
      'للتحويل إلى Rasch-derived T-score استخدم جداول الدليل الرسمي المحدثة والمجموعة المرجعية المناسبة؛ لا تحسب T-score خطيًا من raw score.',
    ],
    interpretationGuardrails: [
      'T-scores المرجعية مشتقة من عينات ABI وليست معيارًا لعامة السكان.',
      'اختلاف مصدر المقيم مهم سريريًا؛ لا تُخفِ عدم الاتفاق بين الشخص والأسرة والفريق داخل متوسط واحد.',
      'MPAI-4 يقيس عواقب/تكيفًا واسعًا بعد ABI ولا يحدد التشخيص العصبي أو سبب كل عجز.',
      'RMD مصدر مراجعة أدلة مفيد لكنه ليس مالك حقوق الأداة؛ حالة Public Domain هنا موثقة مستقلًا عبر CDISC، والنموذج الرسمي من TBIMS.',
    ],
    stopRules: ['إذا لم تكن نسخة النموذج أو مصدر التقدير أو جدول التحويل معروفًا، احتفظ بالدرجات الخام الموثقة ولا تنتج T-score مجهول المرجع.'],
    officialDownloads: [
      { label: 'TBIMS/COMBI — official MPAI-4 manual and rating forms', url: MPAI_OFFICIAL, language: 'en', publisher: 'Traumatic Brain Injury Model Systems / COMBI' },
      { label: 'CDISC QRS — MPAI-4, Public Domain', url: MPAI_CDISC, language: 'en', publisher: 'CDISC' },
      { label: 'RehabMeasures Database — MPAI-4 evidence summary', url: MPAI_RMD, language: 'en', publisher: 'Shirley Ryan AbilityLab' },
    ],
    sourceUrls: [MPAI_OFFICIAL, MPAI_CDISC, MPAI_RMD],
    lastVerifiedOn: '2026-09-06',
  },
};
