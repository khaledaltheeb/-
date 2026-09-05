import type { AssessmentMeasure } from '@/lib/assessment-measures';

export type OperationalMaterialKind = 'full-instrument' | 'scoring-form' | 'protocol-sheet' | 'clinical-classification';
export type OperationalFieldType = 'choice' | 'checkbox' | 'number' | 'text' | 'time' | 'distance' | 'task-score';

export type OperationalOption = {
  labelAr: string;
  labelEn?: string;
  value: string;
  score?: number;
};

export type OperationalItem = {
  code: string;
  labelAr: string;
  labelEn?: string;
  type: OperationalFieldType;
  options?: OperationalOption[];
  min?: number;
  max?: number;
  unit?: string;
  noteAr?: string;
};

export type OperationalSection = {
  titleAr: string;
  titleEn?: string;
  instructionsAr?: string;
  items: OperationalItem[];
};

export type OfficialDownload = {
  label: string;
  url: string;
  language: 'ar' | 'en' | 'other';
  publisher: string;
};

export type AssessmentOperationalMaterial = {
  slug: string;
  kind: OperationalMaterialKind;
  completeness: 'exact-public-domain-form' | 'standardized-protocol-sheet' | 'recording-and-scoring-sheet';
  titleAr: string;
  titleEn?: string;
  version: string;
  provenance: string;
  rightsNotice: string;
  intendedUseAr: string;
  respondentFields: string[];
  preflightChecks: string[];
  sections: OperationalSection[];
  scoringSteps: string[];
  interpretationGuardrails: string[];
  stopRules: string[];
  officialDownloads?: OfficialDownload[];
  sourceUrls: string[];
  lastVerifiedOn: string;
};

const freq4: OperationalOption[] = [
  { labelAr: 'أبدًا', labelEn: 'Not at all', value: '0', score: 0 },
  { labelAr: 'عدة أيام', labelEn: 'Several days', value: '1', score: 1 },
  { labelAr: 'أكثر من نصف الأيام', labelEn: 'More than half the days', value: '2', score: 2 },
  { labelAr: 'كل يوم تقريبًا', labelEn: 'Nearly every day', value: '3', score: 3 },
];

const yesNo: OperationalOption[] = [
  { labelAr: 'نعم', labelEn: 'Yes', value: 'yes' },
  { labelAr: 'لا', labelEn: 'No', value: 'no' },
];

const score04: OperationalOption[] = [0, 1, 2, 3, 4].map((score) => ({ labelAr: String(score), value: String(score), score }));

export const operationalMaterials: Record<string, AssessmentOperationalMaterial> = {
  'patient-health-questionnaire-9': {
    slug: 'patient-health-questionnaire-9',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'استبيان صحة المريض — 9 بنود (PHQ-9)',
    titleEn: 'Patient Health Questionnaire-9',
    version: 'PHQ-9 — two-week self-report',
    provenance: 'صيغة عربية قياسية متاحة ضمن NIH HEAL CDE؛ تؤكد Pfizer إتاحة PHQ/GAD دون قيود حقوق نشر وبلا رسوم.',
    rightsNotice: 'لا يلزم إذن لإعادة إنتاج PHQ-9 أو ترجمته أو عرضه أو توزيعه وفق إعلان Pfizer؛ يجب إبقاء اسم الأداة والإصدار دون تغيير جوهري للبنود.',
    intendedUseAr: 'فحص شدة أعراض الاكتئاب ومتابعتها خلال الأسبوعين الماضيين. النتيجة ليست تشخيصًا مستقلًا.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'مكان/سياق التطبيق', 'اسم الفاحص عند التطبيق بالمقابلة'],
    preflightChecks: ['تأكيد الفترة المرجعية: الأسبوعان الماضيان.', 'توفير خصوصية كافية للإجابة.', 'وجود مسار واضح للتعامل مع أي إجابة إيجابية على بند إيذاء النفس.'],
    sections: [{
      titleAr: 'خلال الأسبوعين الماضيين، كم مرة أزعجتك المشكلات التالية؟',
      items: [
        { code: 'PHQ1', labelAr: 'قلة الاهتمام أو المتعة في القيام بالأشياء.', type: 'choice', options: freq4 },
        { code: 'PHQ2', labelAr: 'الشعور بالإحباط أو الاكتئاب أو اليأس.', type: 'choice', options: freq4 },
        { code: 'PHQ3', labelAr: 'صعوبة في النوم أو الاستمرار في النوم، أو النوم أكثر من المعتاد.', type: 'choice', options: freq4 },
        { code: 'PHQ4', labelAr: 'الشعور بالتعب أو قلة الطاقة.', type: 'choice', options: freq4 },
        { code: 'PHQ5', labelAr: 'ضعف الشهية أو الإفراط في تناول الطعام.', type: 'choice', options: freq4 },
        { code: 'PHQ6', labelAr: 'الشعور بالسوء تجاه نفسك، أو أنك فاشل، أو أنك خذلت نفسك أو عائلتك.', type: 'choice', options: freq4 },
        { code: 'PHQ7', labelAr: 'صعوبة في التركيز على الأشياء، مثل القراءة أو مشاهدة التلفزيون.', type: 'choice', options: freq4 },
        { code: 'PHQ8', labelAr: 'التحرك أو التحدث ببطء شديد لدرجة أن الآخرين قد يلاحظون ذلك، أو العكس: التململ أو الحركة أكثر من المعتاد.', type: 'choice', options: freq4 },
        { code: 'PHQ9', labelAr: 'أفكار بأنه سيكون من الأفضل لك الموت أو إيذاء نفسك بطريقة ما.', type: 'choice', options: freq4, noteAr: 'أي إجابة غير «أبدًا» تستلزم تقييم سلامة مباشرًا وفق السياسة المحلية؛ لا تنتظر المجموع الكلي.' },
      ],
    }, {
      titleAr: 'الأثر الوظيفي',
      items: [{
        code: 'PHQ-FUNCTION',
        labelAr: 'إذا حددت أي مشكلة، فما مدى صعوبة هذه المشكلات في أداء عملك أو الاهتمام بشؤون المنزل أو الانسجام مع الآخرين؟',
        type: 'choice',
        options: [
          { labelAr: 'ليست صعبة على الإطلاق', value: '0' },
          { labelAr: 'صعبة إلى حد ما', value: '1' },
          { labelAr: 'صعبة جدًا', value: '2' },
          { labelAr: 'صعبة للغاية', value: '3' },
        ],
      }],
    }],
    scoringSteps: ['اجمع نقاط البنود PHQ1–PHQ9 فقط: النطاق 0–27.', 'النطاقات الشائعة لوصف شدة الأعراض: 0–4 ضئيلة/حد أدنى، 5–9 خفيفة، 10–14 متوسطة، 15–19 متوسطة الشدة إلى شديدة، 20–27 شديدة.', 'لا تدخل سؤال الأثر الوظيفي ضمن مجموع 0–27.', 'لا تستخدم المجموع منفردًا لإثبات اضطراب اكتئابي؛ راجع السياق السريري والأسباب البديلة والوظيفة والسلامة.'],
    interpretationGuardrails: ['الحدود العددية أدوات وصف/فرز وليست تشخيصًا نهائيًا.', 'بند إيذاء النفس يُراجع مستقلًا عن الدرجة الإجمالية.', 'عند التكرار استخدم اللغة والصيغة نفسيهما للمقارنة.'],
    stopRules: ['وجود خطر فوري على النفس أو الآخرين يستوجب مسار الطوارئ المحلي بدل إكمال نموذج روتيني.', 'الارتباك الحاد أو عدم القدرة على فهم البنود يستلزم تقييمًا مهنيًا وطريقة تطبيق مناسبة.'],
    officialDownloads: [
      { label: 'NIH HEAL CDE — PHQ-9 Arabic CRF', url: 'https://www.nih.gov/node/19946', language: 'ar', publisher: 'NIH' },
      { label: 'Pfizer — PHQ/GAD public access statement', url: 'https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care', language: 'en', publisher: 'Pfizer' },
    ],
    sourceUrls: ['https://www.nih.gov/node/19946', 'https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care'],
    lastVerifiedOn: '2026-09-05',
  },
  'generalized-anxiety-disorder-7': {
    slug: 'generalized-anxiety-disorder-7',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس اضطراب القلق العام — 7 بنود (GAD-7)',
    titleEn: 'Generalized Anxiety Disorder-7',
    version: 'GAD-7 — two-week self-report',
    provenance: 'NIH HEAL CDE يوفر ملف CRF عربي، وPfizer أعلنت PHQ وGAD-7 دون قيود حقوق نشر وبلا رسوم.',
    rightsNotice: 'يمكن إعادة إنتاج GAD-7 وعرضه وتوزيعه دون طلب إذن وفق بيان Pfizer؛ حافظ على بنية البنود والفترة المرجعية.',
    intendedUseAr: 'فحص شدة أعراض القلق العام ومتابعتها خلال الأسبوعين الماضيين؛ ليس تشخيصًا مستقلًا.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'سياق التطبيق'],
    preflightChecks: ['تأكيد الفترة المرجعية: الأسبوعان الماضيان.', 'استخدام ترجمة عربية محددة وثابتة عند المتابعة الطولية.'],
    sections: [{
      titleAr: 'خلال الأسبوعين الماضيين، كم مرة انزعجت من المشكلات التالية؟',
      items: [
        { code: 'GAD1', labelAr: 'الشعور بالعصبية أو القلق أو التوتر.', type: 'choice', options: freq4 },
        { code: 'GAD2', labelAr: 'عدم القدرة على إيقاف القلق أو السيطرة عليه.', type: 'choice', options: freq4 },
        { code: 'GAD3', labelAr: 'القلق المفرط بشأن أشياء مختلفة.', type: 'choice', options: freq4 },
        { code: 'GAD4', labelAr: 'صعوبة الاسترخاء.', type: 'choice', options: freq4 },
        { code: 'GAD5', labelAr: 'التململ لدرجة يصعب معها الجلوس بهدوء.', type: 'choice', options: freq4 },
        { code: 'GAD6', labelAr: 'الانزعاج أو سرعة الغضب بسهولة.', type: 'choice', options: freq4 },
        { code: 'GAD7', labelAr: 'الشعور بالخوف كما لو أن شيئًا فظيعًا قد يحدث.', type: 'choice', options: freq4 },
      ],
    }, {
      titleAr: 'الأثر الوظيفي',
      items: [{ code: 'GAD-FUNCTION', labelAr: 'إذا حددت أي مشكلة، فما مدى صعوبة هذه المشكلات في العمل أو شؤون المنزل أو الانسجام مع الآخرين؟', type: 'choice', options: [
        { labelAr: 'ليست صعبة على الإطلاق', value: '0' }, { labelAr: 'صعبة إلى حد ما', value: '1' }, { labelAr: 'صعبة جدًا', value: '2' }, { labelAr: 'صعبة للغاية', value: '3' },
      ] }],
    }],
    scoringSteps: ['اجمع نقاط البنود السبعة: 0–21.', 'النطاقات الشائعة: 0–4 ضئيل، 5–9 خفيف، 10–14 متوسط، 15–21 شديد.', 'درجة 10 أو أكثر تستخدم كثيرًا كإشارة تستحق تقييمًا إضافيًا، وليست تشخيصًا تلقائيًا.'],
    interpretationGuardrails: ['افحص التداخل مع الاكتئاب، المواد، الأدوية، الحالات الطبية والضغوط.', 'لا تحول الدرجة إلى تشخيص آلي أو وصف دواء.'],
    stopRules: ['الأعراض الحادة أو نوبات الهلع/الاضطراب الطبي المقلق تحتاج تقييمًا مناسبًا بدل الاعتماد على المجموع فقط.'],
    officialDownloads: [
      { label: 'NIH HEAL CDE — GAD-7 Arabic CRF', url: 'https://www.nih.gov/node/19876', language: 'ar', publisher: 'NIH' },
      { label: 'Pfizer — PHQ/GAD public access statement', url: 'https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care', language: 'en', publisher: 'Pfizer' },
    ],
    sourceUrls: ['https://www.nih.gov/node/19876', 'https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care'],
    lastVerifiedOn: '2026-09-05',
  },
  'geriatric-depression-scale': {
    slug: 'geriatric-depression-scale',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس اكتئاب المسنين — النسخة القصيرة 15 بندًا (GDS-15)',
    titleEn: 'Geriatric Depression Scale — Short Form',
    version: '15-item short form',
    provenance: 'المقياس الأصلي في المجال العام؛ SAMHSA/NCBI ينشر نسخة العميل ونسخة التسجيل ضمن مواد Public Domain.',
    rightsNotice: 'صيغة GDS القصيرة منشورة من SAMHSA/NCBI كمادة في المجال العام. الترجمة العربية هنا ترجمة تشغيلية من روافد وليست ادعاءً بأنها نسخة عربية محققة سيكومتريًا بعينها.',
    intendedUseAr: 'فحص أعراض الاكتئاب لدى كبار السن خلال الأسبوع الماضي مع مراعاة الإدراك والحالة الطبية والسياق.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'الفاحص/طريقة التطبيق'],
    preflightChecks: ['تأكيد القدرة على فهم أسئلة نعم/لا.', 'مراعاة اضطراب الإدراك أو الهذيان أو المشكلات السمعية/اللغوية.'],
    sections: [{ titleAr: 'اختر أفضل إجابة تصف شعورك خلال الأسبوع الماضي', items: [
      { code: 'GDS1', labelAr: 'هل أنت راضٍ بصورة أساسية عن حياتك؟', labelEn: 'Are you basically satisfied with your life?', type: 'choice', options: yesNo },
      { code: 'GDS2', labelAr: 'هل تخليت عن كثير من أنشطتك واهتماماتك؟', labelEn: 'Have you dropped many of your activities and interests?', type: 'choice', options: yesNo },
      { code: 'GDS3', labelAr: 'هل تشعر أن حياتك فارغة؟', labelEn: 'Do you feel that your life is empty?', type: 'choice', options: yesNo },
      { code: 'GDS4', labelAr: 'هل تشعر بالملل كثيرًا؟', labelEn: 'Do you often get bored?', type: 'choice', options: yesNo },
      { code: 'GDS5', labelAr: 'هل تكون في حالة معنوية جيدة معظم الوقت؟', labelEn: 'Are you in good spirits most of the time?', type: 'choice', options: yesNo },
      { code: 'GDS6', labelAr: 'هل تخشى أن يحدث لك شيء سيئ؟', labelEn: 'Are you afraid that something bad is going to happen to you?', type: 'choice', options: yesNo },
      { code: 'GDS7', labelAr: 'هل تشعر بالسعادة معظم الوقت؟', labelEn: 'Do you feel happy most of the time?', type: 'choice', options: yesNo },
      { code: 'GDS8', labelAr: 'هل تشعر غالبًا بالعجز؟', labelEn: 'Do you often feel helpless?', type: 'choice', options: yesNo },
      { code: 'GDS9', labelAr: 'هل تفضّل البقاء في المنزل بدل الخروج وتجربة أشياء جديدة؟', labelEn: 'Do you prefer staying at home, rather than going out and doing new things?', type: 'choice', options: yesNo },
      { code: 'GDS10', labelAr: 'هل تشعر أن لديك مشكلات في الذاكرة أكثر من معظم الناس؟', labelEn: 'Do you feel you have more problems with memory than most people?', type: 'choice', options: yesNo },
      { code: 'GDS11', labelAr: 'هل تعتقد أن الحياة رائعة الآن؟', labelEn: 'Do you think it is wonderful to be alive now?', type: 'choice', options: yesNo },
      { code: 'GDS12', labelAr: 'هل تشعر أنك قليل القيمة كما أنت الآن؟', labelEn: 'Do you feel pretty worthless the way you are now?', type: 'choice', options: yesNo },
      { code: 'GDS13', labelAr: 'هل تشعر أنك مفعم بالطاقة؟', labelEn: 'Do you feel full of energy?', type: 'choice', options: yesNo },
      { code: 'GDS14', labelAr: 'هل تشعر أن وضعك ميؤوس منه؟', labelEn: 'Do you feel that your situation is hopeless?', type: 'choice', options: yesNo },
      { code: 'GDS15', labelAr: 'هل تعتقد أن معظم الناس أفضل حالًا منك؟', labelEn: 'Do you think that most people are better off than you are?', type: 'choice', options: yesNo },
    ] }],
    scoringSteps: ['احسب نقطة لكل استجابة اكتئابية: «لا» في البنود 1،5،7،11،13؛ و«نعم» في البنود 2،3،4،6،8،9،10،12،14،15.', 'المجموع 0–15. المصدر المنشور من SAMHSA/NCBI يذكر أن 0–5 ضمن النطاق الطبيعي وأن 6 فأكثر يوحي باكتئاب ويستدعي تقييمًا إضافيًا.', 'لا تستخدم الدرجة لتأكيد تشخيص أو لاستبعاد اكتئاب لدى شخص لديه أعراض مقلقة.'],
    interpretationGuardrails: ['تأثير الأمراض الجسدية، العزلة، الفقد، الأدوية والاختلال المعرفي يجب أن يُراجع سريريًا.', 'استخدم نسخة لغوية محققة عند العمل السريري الرسمي مع متحدثي العربية.'],
    stopRules: ['أي إفصاح عن خطر على النفس يحتاج تقييم سلامة مستقلًا حتى لو كان المجموع منخفضًا.'],
    officialDownloads: [{ label: 'SAMHSA/NCBI — GDS Short Form client and scoring versions', url: 'https://www.ncbi.nlm.nih.gov/books/NBK571039/box/ch3.b4/?report=objectonly', language: 'en', publisher: 'SAMHSA / NCBI' }],
    sourceUrls: ['https://www.ncbi.nlm.nih.gov/books/NBK571039/box/ch3.b4/?report=objectonly', 'https://web.stanford.edu/~yesavage/GDS'],
    lastVerifiedOn: '2026-09-05',
  },
  'modified-rankin-scale': {
    slug: 'modified-rankin-scale',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس رانكن المعدّل (mRS) — ورقة التصنيف',
    titleEn: 'Modified Rankin Scale',
    version: '0–6 global disability scale',
    provenance: 'CDISC QRS يدرج mRS ضمن Public Domain.',
    rightsNotice: 'إعادة الاستخدام للأصل موثقة؛ أي مادة تدريبية أو ترجمة منشورة لطرف ثالث تُراجع بصورة مستقلة.',
    intendedUseAr: 'تصنيف مستوى العجز/الاعتماد العالمي، خصوصًا بعد السكتة الدماغية.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'التشخيص/الحدث المرجعي', 'الفاحص'],
    preflightChecks: ['حدد الفترة الزمنية ونقطة المرجع.', 'ميّز العجز السابق عن التغير الناتج عن الحالة الحالية.'],
    sections: [{ titleAr: 'اختر الفئة الواحدة الأكثر مطابقة', items: [{
      code: 'MRS', labelAr: 'الدرجة', type: 'choice', options: [
        { labelAr: '0 — لا أعراض إطلاقًا', value: '0', score: 0 },
        { labelAr: '1 — لا عجز مهم رغم وجود أعراض؛ قادر على جميع الأنشطة المعتادة', value: '1', score: 1 },
        { labelAr: '2 — عجز طفيف؛ غير قادر على بعض الأنشطة السابقة لكنه يدبر شؤونه دون مساعدة', value: '2', score: 2 },
        { labelAr: '3 — عجز متوسط؛ يحتاج بعض المساعدة لكنه يمشي دون مساعدة شخص آخر', value: '3', score: 3 },
        { labelAr: '4 — عجز متوسط إلى شديد؛ غير قادر على المشي دون مساعدة وغير قادر على تلبية احتياجاته الجسدية دون مساعدة', value: '4', score: 4 },
        { labelAr: '5 — عجز شديد؛ طريح الفراش/بحاجة إلى رعاية وتمريض مستمرين', value: '5', score: 5 },
        { labelAr: '6 — وفاة', value: '6', score: 6 },
      ],
    }] }],
    scoringSteps: ['اختر فئة واحدة فقط تعكس الحالة الوظيفية العالمية.', 'وثق ما إذا كانت الدرجة مستندة إلى مقابلة منظمة أو حكم سريري.', 'عند الدراسات الطولية حافظ على منهج تقييم ثابت.'],
    interpretationGuardrails: ['المقياس رتبي وليس فاصلًا؛ الفرق بين 1 و2 لا يساوي بالضرورة الفرق بين 4 و5.', 'لا يصف الإدراك أو المزاج أو جودة الحياة بالتفصيل.'],
    stopRules: ['لا تستخدم mRS وحده لرفض التأهيل أو تحديد أهداف الرعاية أو قرارات سحب العلاج.'],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn: '2026-09-05',
  },
  'eastern-cooperative-oncology-group-performance-status': {
    slug: 'eastern-cooperative-oncology-group-performance-status',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'حالة الأداء ECOG — ورقة التصنيف',
    titleEn: 'ECOG Performance Status Scale',
    version: 'ECOG 0–5',
    provenance: 'ECOG-ACRIN يصرح رسميًا أن المقياس في المجال العام ومتاح للاستخدام العام.',
    rightsNotice: 'عند إعادة النشر يجب الحفاظ على النسبة المطلوبة إلى ECOG-ACRIN وعدم الإيحاء برعاية أو اعتماد.',
    intendedUseAr: 'وصف القدرة الوظيفية والأداء العام لدى مرضى الأورام.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'الحالة/العلاج الحالي'],
    preflightChecks: ['قيّم الأداء الفعلي الحالي لا الأداء المثالي.', 'راجع العوامل المؤقتة القابلة للعكس التي قد تؤثر في الحركة والنشاط.'],
    sections: [{ titleAr: 'اختر درجة ECOG', items: [{ code: 'ECOG', labelAr: 'حالة الأداء', type: 'choice', options: [
      { labelAr: '0 — نشط بالكامل وقادر على جميع أنشطة ما قبل المرض دون قيود', value: '0', score: 0 },
      { labelAr: '1 — محدود في النشاط البدني المجهد لكنه متحرك وقادر على العمل الخفيف/المكتبي', value: '1', score: 1 },
      { labelAr: '2 — متحرك وقادر على الرعاية الذاتية لكنه غير قادر على العمل؛ مستيقظ وخارج السرير أكثر من 50% من ساعات اليقظة', value: '2', score: 2 },
      { labelAr: '3 — قادر على رعاية ذاتية محدودة؛ في السرير أو الكرسي أكثر من 50% من ساعات اليقظة', value: '3', score: 3 },
      { labelAr: '4 — عاجز تمامًا؛ لا يستطيع أي رعاية ذاتية؛ ملازم للسرير أو الكرسي بالكامل', value: '4', score: 4 },
      { labelAr: '5 — وفاة', value: '5', score: 5 },
    ] }] }],
    scoringSteps: ['اختر الدرجة الأقرب إلى الأداء العام الفعلي.', 'وثق التاريخ لأن حالة الأداء قد تتغير بسرعة مع المرض والعلاج.'],
    interpretationGuardrails: ['لا تستخدم ECOG وحده لاتخاذ قرار علاج سرطاني؛ ادمجه مع التشخيص والمرحلة والأهداف والأمراض المصاحبة وتفضيلات المريض.'],
    stopRules: ['تدهور حاد جديد يستوجب تقييم السبب بدل افتراض أنه تقدم سرطاني دائم.'],
    officialDownloads: [{ label: 'ECOG-ACRIN — official Performance Status Scale', url: 'https://ecog-acrin.org/resources/ecog-performance-status/', language: 'en', publisher: 'ECOG-ACRIN' }],
    sourceUrls: ['https://ecog-acrin.org/resources/ecog-performance-status/'],
    lastVerifiedOn: '2026-09-05',
  },
  'karnofsky-performance-scale': {
    slug: 'karnofsky-performance-scale',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس أداء كارنوفسكي (KPS) — ورقة التسجيل',
    titleEn: 'Karnofsky Performance Status',
    version: '0–100 in 10-point increments',
    provenance: 'CDISC يسجل KPS Public Domain؛ NIH/NLM Common Data Elements يعرض بنية السلم.',
    rightsNotice: 'المقياس الأصلي متاح ضمن Public Domain؛ لا تشمل الإتاحة تلقائيًا مواد تدريبية أو ترجمات لطرف ثالث.',
    intendedUseAr: 'توصيف القدرة الوظيفية والحاجة إلى المساعدة لدى المرضى، خصوصًا في الأورام والرعاية التلطيفية.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'السياق السريري'],
    preflightChecks: ['قيّم الوظيفة الواقعية الحالية.', 'وثق إن كان التدهور مؤقتًا بسبب حدث حاد.'],
    sections: [{ titleAr: 'اختر درجة واحدة', items: [{ code: 'KPS', labelAr: 'درجة KPS', type: 'choice', options: [
      { labelAr: '100 — طبيعي، لا شكاوى ولا دليل على المرض', value: '100', score: 100 },
      { labelAr: '90 — قادر على النشاط الطبيعي؛ أعراض أو علامات بسيطة', value: '90', score: 90 },
      { labelAr: '80 — نشاط طبيعي مع جهد؛ بعض الأعراض أو العلامات', value: '80', score: 80 },
      { labelAr: '70 — يعتني بنفسه؛ غير قادر على النشاط الطبيعي أو العمل النشط', value: '70', score: 70 },
      { labelAr: '60 — يحتاج مساعدة أحيانًا لكنه قادر على معظم الاحتياجات الشخصية', value: '60', score: 60 },
      { labelAr: '50 — يحتاج مساعدة كبيرة ورعاية طبية متكررة', value: '50', score: 50 },
      { labelAr: '40 — عاجز؛ يحتاج رعاية ومساعدة خاصة', value: '40', score: 40 },
      { labelAr: '30 — شديد العجز؛ الاستشفاء مطلوب غالبًا مع أن الوفاة ليست وشيكة', value: '30', score: 30 },
      { labelAr: '20 — مريض جدًا؛ الاستشفاء والعلاج الداعم النشط ضروريان', value: '20', score: 20 },
      { labelAr: '10 — يحتضر؛ العمليات القاتلة تتقدم بسرعة', value: '10', score: 10 },
      { labelAr: '0 — وفاة', value: '0', score: 0 },
    ] }] }],
    scoringSteps: ['اختر مستوى واحدًا يمثل الوظيفة العامة.', 'لا تستحدث درجات بينية غير معرّفة إذا كان البروتوكول البحثي يتطلب مضاعفات العشرة.'],
    interpretationGuardrails: ['KPS مقياس عالمي خشن نسبيًا ولا يصف جودة الحياة أو الأعراض منفردة.', 'لا يحل محل تقييم الأهلية العلاجية المتخصص.'],
    stopRules: ['أي تدهور حاد جديد يحتاج تقييمًا مستقلًا.'],
    officialDownloads: [{ label: 'NIH/NLM CDE — Karnofsky performance scale', url: 'https://cde.nlm.nih.gov/deView?tinyId=XJwxoFT6L', language: 'en', publisher: 'NIH / NLM' }],
    sourceUrls: ['https://cde.nlm.nih.gov/deView?tinyId=XJwxoFT6L', 'https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn: '2026-09-05',
  },
  'glasgow-coma-scale-ninds': {
    slug: 'glasgow-coma-scale-ninds',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس غلاسكو للغيبوبة (GCS) — ورقة التسجيل',
    titleEn: 'Glasgow Coma Scale — NINDS Version',
    version: 'Eye + Verbal + Motor; total 3–15',
    provenance: 'نسخة NINDS مدرجة لدى CDISC QRS كـPublic Domain.',
    rightsNotice: 'المقياس نفسه Public Domain؛ سجّل المكونات الثلاثة منفصلة إضافة إلى المجموع.',
    intendedUseAr: 'وصف مستوى الاستجابة العينية واللفظية والحركية في سياق عصبي/رضحي مناسب.',
    respondentFields: ['الاسم/الرمز', 'التاريخ والوقت', 'الفاحص', 'سبب التقييم', 'وجود أنبوب/عائق لغوي/تهدئة'],
    preflightChecks: ['تأكد من عدم وجود عائق يمنع التقييم وأشر إليه صراحة.', 'استخدم أفضل استجابة قابلة للملاحظة وفق البروتوكول.', 'سجل E/V/M منفصلة ولا تكتفِ بالمجموع.'],
    sections: [
      { titleAr: 'فتح العينين (E)', items: [{ code: 'GCS-E', labelAr: 'أفضل استجابة عينية', type: 'choice', options: [
        { labelAr: '4 — تلقائيًا', value: '4', score: 4 }, { labelAr: '3 — للصوت', value: '3', score: 3 }, { labelAr: '2 — للضغط/الألم', value: '2', score: 2 }, { labelAr: '1 — لا استجابة', value: '1', score: 1 },
      ] }] },
      { titleAr: 'الاستجابة اللفظية (V)', items: [{ code: 'GCS-V', labelAr: 'أفضل استجابة لفظية', type: 'choice', options: [
        { labelAr: '5 — موجّه/مدرك للزمان والمكان والشخص', value: '5', score: 5 }, { labelAr: '4 — مرتبك لكنه يتحدث', value: '4', score: 4 }, { labelAr: '3 — كلمات غير مناسبة', value: '3', score: 3 }, { labelAr: '2 — أصوات غير مفهومة', value: '2', score: 2 }, { labelAr: '1 — لا استجابة لفظية', value: '1', score: 1 },
      ] }] },
      { titleAr: 'الاستجابة الحركية (M)', items: [{ code: 'GCS-M', labelAr: 'أفضل استجابة حركية', type: 'choice', options: [
        { labelAr: '6 — يطيع الأوامر', value: '6', score: 6 }, { labelAr: '5 — يحدد موضع المنبه المؤلم', value: '5', score: 5 }, { labelAr: '4 — ينسحب من المنبه', value: '4', score: 4 }, { labelAr: '3 — انثناء غير طبيعي', value: '3', score: 3 }, { labelAr: '2 — بسط غير طبيعي', value: '2', score: 2 }, { labelAr: '1 — لا استجابة حركية', value: '1', score: 1 },
      ] }] },
    ],
    scoringSteps: ['اجمع E + V + M عندما تكون جميع المكونات قابلة للتقييم: المجموع 3–15.', 'اكتب النتيجة بصيغة مثل E3 V4 M6 = 13، مع توثيق أي مكون غير قابل للاختبار.', 'الأهم سريريًا هو الاتجاه والمكونات والسياق، لا الرقم المجرد.'],
    interpretationGuardrails: ['لا تستخدم GCS وحده للتنبؤ الفردي بالمآل أو لسحب العلاج.', 'التخدير، التنبيب، فقد السمع/اللغة، إصابات الأطراف والمواد قد تغير الأداء.'],
    stopRules: ['تدهور الوعي الحاد حالة طارئة ويحتاج تقييمًا فوريًا؛ لا تؤخر الرعاية لإكمال الورقة.'],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn: '2026-09-05',
  },
  'berg-balance-scale': {
    slug: 'berg-balance-scale',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'مقياس بيرغ للتوازن (BBS) — ورقة تطبيق وتسجيل',
    titleEn: 'Berg Balance Scale',
    version: '14 tasks; 0–4 each; total 0–56',
    provenance: 'الأصل Public Domain بحسب RMD؛ ورقة روافد تحفظ المهام وتسجل الدرجة مع ربط تعليمات/مراسي المصدر.',
    rightsNotice: 'الأصل متاح؛ عند استخدام نسخة عربية محققة بعينها يجب الحفاظ على نصها وشروطها. هذه الورقة لا تدّعي أنها ترجمة عربية معيارية بديلة.',
    intendedUseAr: 'تسجيل أداء 14 مهمة توازن وظيفي بطريقة موحدة.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'وسيلة المساعدة المعتادة', 'ملاحظات السلامة'],
    preflightChecks: ['تأمين الحراسة القريبة ومنع السقوط.', 'تجهيز الكرسي/المؤقت/المسطرة/الدرجة المطلوبة.', 'توقف عن أي مهمة غير آمنة.'],
    sections: [{ titleAr: 'مهام BBS — سجّل 0–4 لكل مهمة وفق المراسي الرسمية للنسخة المستخدمة', items: [
      { code: 'BBS1', labelAr: 'الانتقال من الجلوس إلى الوقوف', type: 'task-score', options: score04 },
      { code: 'BBS2', labelAr: 'الوقوف دون دعم', type: 'task-score', options: score04 },
      { code: 'BBS3', labelAr: 'الجلوس دون دعم مع وضع القدمين على الأرض', type: 'task-score', options: score04 },
      { code: 'BBS4', labelAr: 'الانتقال من الوقوف إلى الجلوس', type: 'task-score', options: score04 },
      { code: 'BBS5', labelAr: 'الانتقالات بين الكراسي/الأسطح', type: 'task-score', options: score04 },
      { code: 'BBS6', labelAr: 'الوقوف والعينان مغمضتان', type: 'task-score', options: score04 },
      { code: 'BBS7', labelAr: 'الوقوف والقدمان متلاصقتان', type: 'task-score', options: score04 },
      { code: 'BBS8', labelAr: 'الوصول للأمام بذراع ممدودة أثناء الوقوف', type: 'task-score', options: score04 },
      { code: 'BBS9', labelAr: 'التقاط جسم من الأرض أثناء الوقوف', type: 'task-score', options: score04 },
      { code: 'BBS10', labelAr: 'الالتفات للنظر خلف الكتفين أثناء الوقوف', type: 'task-score', options: score04 },
      { code: 'BBS11', labelAr: 'الدوران 360 درجة', type: 'task-score', options: score04 },
      { code: 'BBS12', labelAr: 'وضع القدمين بالتبادل على درجة/مسند أثناء الوقوف دون دعم', type: 'task-score', options: score04 },
      { code: 'BBS13', labelAr: 'الوقوف قدمًا أمام قدم (tandem)', type: 'task-score', options: score04 },
      { code: 'BBS14', labelAr: 'الوقوف على ساق واحدة', type: 'task-score', options: score04 },
    ] }],
    scoringSteps: ['سجّل 0–4 لكل مهمة وفق وصف المراسي الرسمي للنسخة المعتمدة.', 'اجمع البنود الأربعة عشر للحصول على 0–56.', 'لا تخمّن المراسي من اسم المهمة؛ افتح المصدر الرسمي عند التدريب أو التطبيق السريري.'],
    interpretationGuardrails: ['لا تستخدم حد سقوط عالميًا لكل السكان.', 'MDC وMCID تختلفان حسب الحالة والسكان والسياق.'],
    stopRules: ['أي فقد توازن لا يمكن حمايته بأمان، دوار شديد، ألم حاد، ضيق نفس أو علامة طبية مقلقة يوقف المهمة.'],
    officialDownloads: [{ label: 'RMD — Berg Balance Scale evidence and instrument access', url: 'https://www.sralab.org/rehabilitation-measures/berg-balance-scale', language: 'en', publisher: 'Shirley Ryan AbilityLab / RMD' }],
    sourceUrls: ['https://www.sralab.org/rehabilitation-measures/berg-balance-scale'],
    lastVerifiedOn: '2026-09-05',
  },
  'timed-up-and-go': {
    slug: 'timed-up-and-go', kind: 'protocol-sheet', completeness: 'standardized-protocol-sheet',
    titleAr: 'اختبار النهوض والمشي الموقّت (TUG) — ورقة التطبيق', titleEn: 'Timed Up and Go', version: 'standard timed functional protocol',
    provenance: 'اختبار إجرائي مجاني؛ ورقة روافد توحّد الظروف والقياس دون اختراع cut-off جديد.', rightsNotice: 'البروتوكول الإجرائي قابل للتطبيق؛ وثق النسخة والمسافة والكرسي ووسيلة المساعدة.',
    intendedUseAr: 'قياس زمن سلسلة وظيفية: النهوض من الكرسي، المشي، الدوران، العودة والجلوس.', respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'وسيلة المساعدة', 'الحذاء', 'ارتفاع الكرسي'],
    preflightChecks: ['مسار آمن بطول 3 أمتار وفق البروتوكول القياسي.', 'كرسي ثابت مناسب.', 'حراسة عند خطر السقوط.', 'تسجيل وسيلة المساعدة وعدم تغييرها بين الجولات دون توثيق.'],
    sections: [{ titleAr: 'التسجيل', items: [
      { code: 'TUG-TRIAL1', labelAr: 'المحاولة 1 — الزمن', type: 'time', unit: 'ثانية' },
      { code: 'TUG-TRIAL2', labelAr: 'المحاولة 2 — الزمن (إن كان البروتوكول يستخدم تكرارًا)', type: 'time', unit: 'ثانية' },
      { code: 'TUG-AID', labelAr: 'وسيلة المساعدة/الملاحظات', type: 'text' },
      { code: 'TUG-OBS', labelAr: 'ملاحظات: النهوض/الثبات/الدوران/الجلوس', type: 'text' },
    ] }],
    scoringSteps: ['ابدأ التوقيت عند إشارة البدء وفق البروتوكول، وأوقفه عند العودة للجلوس.', 'سجّل الزمن بالثواني والظروف الدقيقة.', 'لا تقارن نتائج من مسافات/كراسٍ/وسائل مساعدة مختلفة دون توثيق.'],
    interpretationGuardrails: ['الزمن وحده لا يساوي تشخيص خطر سقوط.', 'استخدم مراجع خاصة بالسكان عند الحاجة.'], stopRules: ['توقف عند عدم الأمان أو دوار/ألم/ضيق نفس مقلق.'],
    sourceUrls: ['https://www.sralab.org/rehabilitation-measures/timed-and-go'], lastVerifiedOn: '2026-09-05',
  },
  '10-meter-walk-test': {
    slug: '10-meter-walk-test', kind: 'protocol-sheet', completeness: 'standardized-protocol-sheet', titleAr: 'اختبار المشي 10 أمتار (10MWT) — ورقة التطبيق', titleEn: '10 Meter Walk Test', version: '10-meter gait-speed protocol',
    provenance: 'مقياس أداء إجرائي Public Domain/مجاني وفق مصادر RMD/CDISC.', rightsNotice: 'استخدم بروتوكولًا ثابتًا ووثّق منطقة التسارع/التباطؤ وطول الجزء الموقّت.', intendedUseAr: 'قياس سرعة المشي في ظروف موحدة.', respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'وسيلة المساعدة', 'الحذاء', 'تعليمات السرعة: مريحة/قصوى'],
    preflightChecks: ['مسار مستقيم آمن ومحدد الأطوال.', 'تحديد نقطة بدء/نهاية الجزء الموقّت.', 'حراسة مناسبة.'],
    sections: [{ titleAr: 'التجارب', items: [
      { code: '10MWT-T1', labelAr: 'المحاولة 1 — زمن الجزء الموقّت', type: 'time', unit: 'ثانية' }, { code: '10MWT-T2', labelAr: 'المحاولة 2 — الزمن', type: 'time', unit: 'ثانية' }, { code: '10MWT-D', labelAr: 'المسافة الموقّتة الفعلية', type: 'distance', unit: 'متر' }, { code: '10MWT-NOTES', labelAr: 'الملاحظات/المساعدة', type: 'text' },
    ] }], scoringSteps: ['سرعة المشي = المسافة الموقّتة ÷ الزمن.', 'إذا أخذت أكثر من تجربة، اتبع قاعدة المتوسط/أفضل محاولة المحددة في البروتوكول وسجلها.', 'لا تخلط سرعة مريحة بسرعة قصوى.'], interpretationGuardrails: ['استخدم MDC/MCID خاصة بالسكان والبروتوكول.', 'السرعة لا تفسر سبب محدودية المشي.'], stopRules: ['توقف عند عدم الأمان أو عرض طبي مقلق.'], sourceUrls: ['https://www.sralab.org/rehabilitation-measures/10-meter-walk-test'], lastVerifiedOn: '2026-09-05',
  },
  '6-minute-walk-test': {
    slug: '6-minute-walk-test', kind: 'protocol-sheet', completeness: 'standardized-protocol-sheet', titleAr: 'اختبار المشي ست دقائق (6MWT) — ورقة التطبيق والتسجيل', titleEn: 'Six-Minute Walk Test', version: 'six-minute field walking protocol',
    provenance: 'اختبار إجرائي واسع الاستخدام؛ RMD يوثق الإجراء والأدلة. نصوص إرشادات الجمعيات لا تُنسخ حرفيًا.', rightsNotice: 'ورقة روافد هي ورقة تسجيل بروتوكولية أصلية، وليست إعادة طبع لدليل جمعية محمي.', intendedUseAr: 'قياس مسافة المشي الوظيفية خلال ست دقائق في بيئة مضبوطة.', respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'وسيلة المساعدة', 'الأكسجين/التدفق إن وجد', 'المسار وطوله'],
    preflightChecks: ['تأكيد أن الشخص مناسب للاختبار وفق السياسة السريرية.', 'مسار آمن معروف الطول.', 'تسجيل العلامات الحيوية/الأعراض عندما يطلب البروتوكول.', 'تثبيت الأكسجين ووسيلة المساعدة بين المقارنات قدر الإمكان.'],
    sections: [{ titleAr: 'قبل الاختبار', items: [{ code: '6MWT-HR0', labelAr: 'النبض قبل الاختبار', type: 'number', unit: '/دقيقة' }, { code: '6MWT-SPO20', labelAr: 'SpO₂ قبل الاختبار', type: 'number', unit: '%' }, { code: '6MWT-DYSP0', labelAr: 'درجة ضيق النفس قبل الاختبار وفق المقياس المستخدم', type: 'number' }] }, { titleAr: 'النتيجة', items: [{ code: '6MWT-LAPS', labelAr: 'عدد الدورات/الأطوال', type: 'number' }, { code: '6MWT-DIST', labelAr: 'المسافة الكلية', type: 'distance', unit: 'متر' }, { code: '6MWT-STOPS', labelAr: 'التوقفات وسببها ومدتها', type: 'text' }] }, { titleAr: 'بعد الاختبار', items: [{ code: '6MWT-HR1', labelAr: 'النبض بعد الاختبار', type: 'number', unit: '/دقيقة' }, { code: '6MWT-SPO21', labelAr: 'SpO₂ بعد الاختبار', type: 'number', unit: '%' }, { code: '6MWT-DYSP1', labelAr: 'ضيق النفس بعد الاختبار', type: 'number' }, { code: '6MWT-NOTES', labelAr: 'الأعراض/الملاحظات', type: 'text' }] }],
    scoringSteps: ['النتيجة الأساسية هي المسافة الإجمالية بالمتر خلال ست دقائق.', 'وثق المسار والتوقفات والأكسجين ووسيلة المساعدة والتشجيع وفق البروتوكول.', 'المقارنة الطولية تتطلب ظروفًا متقاربة.'], interpretationGuardrails: ['لا تنقل معادلات مرجعية أو MCID بين مجموعات غير مطابقة.', 'الاختبار ليس اختبار جهد قلبي رئويًا أقصى.'], stopRules: ['أوقف الاختبار عند ألم صدري، ضيق نفس غير محتمل، دوار/إغماء، عدم استقرار واضح أو معيار إيقاف تحدده السياسة السريرية.'], sourceUrls: ['https://www.sralab.org/rehabilitation-measures/6-minute-walk-test'], lastVerifiedOn: '2026-09-05',
  },
};

export function getOperationalMaterial(measure: AssessmentMeasure): AssessmentOperationalMaterial {
  const explicit = operationalMaterials[measure.slug];
  if (explicit) return explicit;

  return {
    slug: measure.slug,
    kind: 'protocol-sheet',
    completeness: 'recording-and-scoring-sheet',
    titleAr: `${measure.nameAr} — ورقة تطبيق وتسجيل`,
    titleEn: `${measure.nameEn} — administration worksheet`,
    version: measure.version,
    provenance: 'ورقة تشغيل أصلية من روافد مبنية على سجل المقياس ومصادره الموثقة؛ لا تستبدل نموذجًا رسميًا أو دليل تدريب عندما يتطلب المقياس ذلك.',
    rightsNotice: measure.rightsNote,
    intendedUseAr: measure.purpose,
    respondentFields: ['الاسم/الرمز', 'التاريخ والوقت', 'الفاحص/المقيّم', 'السياق/التشخيص', 'نسخة المقياس ولغته'],
    preflightChecks: [
      `تأكيد الإصدار: ${measure.version}.`,
      `تجهيز: ${measure.equipment.join('، ')}.`,
      'تأكيد ملاءمة اللغة وطريقة التطبيق وقدرة الشخص على المشاركة بأمان.',
    ],
    sections: [{
      titleAr: 'خطوات التطبيق المعيارية',
      instructionsAr: 'ضع علامة بعد إتمام كل خطوة، وسجل أي انحراف عن البروتوكول.',
      items: measure.administrationSteps.map((step, index) => ({ code: `STEP-${index + 1}`, labelAr: step, type: 'checkbox' as const })),
    }, {
      titleAr: 'التسجيل الخام والملاحظات',
      items: [
        { code: 'RAW-1', labelAr: 'الاستجابة/الملاحظة/القيمة الخام 1', type: 'text' },
        { code: 'RAW-2', labelAr: 'الاستجابة/الملاحظة/القيمة الخام 2', type: 'text' },
        { code: 'RAW-3', labelAr: 'الاستجابة/الملاحظة/القيمة الخام 3', type: 'text' },
        { code: 'TOTAL', labelAr: 'الدرجة/النتيجة النهائية وفق قواعد النسخة', type: 'text' },
      ],
    }],
    scoringSteps: [measure.scoring, measure.interpretation],
    interpretationGuardrails: ['لا تستخدم عتبة أو MCID/MDC أو قيمة معيارية من مجتمع مختلف دون تحقق.', ...measure.limitations],
    stopRules: measure.safetyNotes,
    officialDownloads: measure.sources.map((source) => ({ label: source.label, url: source.url, language: 'en' as const, publisher: source.role === 'rights' ? 'Rights source' : 'Evidence/original source' })),
    sourceUrls: measure.sources.map((source) => source.url),
    lastVerifiedOn: measure.rightsVerifiedOn,
  };
}
