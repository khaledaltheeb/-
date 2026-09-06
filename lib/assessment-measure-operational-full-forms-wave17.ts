import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const scoreChoices = (max: number): OperationalOption[] =>
  Array.from({ length: max + 1 }, (_, score) => ({ labelAr: String(score), value: String(score), score }));

const severity17: OperationalOption[] = [
  { labelAr: '1 — غير موجود', value: '1', score: 1 },
  { labelAr: '2 — خفيف جدًا', value: '2', score: 2 },
  { labelAr: '3 — خفيف', value: '3', score: 3 },
  { labelAr: '4 — متوسط', value: '4', score: 4 },
  { labelAr: '5 — متوسط إلى شديد', value: '5', score: 5 },
  { labelAr: '6 — شديد', value: '6', score: 6 },
  { labelAr: '7 — شديد جدًا', value: '7', score: 7 },
];

const CDISC_ALL = 'https://www.cdisc.org/qrs/all';
const EDSS_CDISC = 'https://www.cdisc.org/standards/foundational/qrs/kurtzke-expanded-disability-status-scale';
const EDSS_ORIGINAL = 'https://pubmed.ncbi.nlm.nih.gov/6685237/';
const EDSS_NINDS = 'https://cde.nlm.nih.gov/deView?tinyId=k1NWK1ktpWu';
const EDSS_RMD = 'https://www.sralab.org/rehabilitation-measures/expanded-disability-status-scale-kurtzke-functional-systems-score';
const KFSS_EDMUS = 'https://www.edmus.org/en/proj/ms_fs.html';
const CRSR_CDISC = 'https://www.cdisc.org/standards/foundational/qrs/jfk-coma-recovery-scale-revised';
const CRSR_RMD = 'https://www.sralab.org/rehabilitation-measures/coma-recovery-scale-revised';
const CRSR_NINDS = 'https://cde-fe.ninds.nih.gov/ninds/noc-report/F2871/JFK%20Coma%20Recovery%20Scale-Revised';
const BPRS_CDISC = 'https://www.cdisc.org/qrs/all';
const BPRS_PHENX = 'https://www.phenxtoolkit.org/protocols/view/122102';
const BPRS_MAPITRUST = 'https://eprovide.mapi-trust.org/instruments/brief-psychiatric-rating-scale';
const RAVLT_CDISC = 'https://www.cdisc.org/standards/foundational/qrs/rey-auditory-verbal-learning-test';
const RAVLT_APA = 'https://dictionary.apa.org/rey-auditory-verbal-learning-test';
const RAVLT_FITBIR = 'https://fitbir.nih.gov/dictionary/publicData/dataElementAction%21view.action?dataElementName=RAVLTWordListTyp&publicArea=true&style.key=fitbir-style';

const edssOptions: OperationalOption[] = [
  { labelAr: '0 — فحص عصبي طبيعي', value: '0', score: 0 },
  { labelAr: '1.0 — لا عجز؛ علامات طفيفة في جهاز وظيفي واحد', value: '1', score: 1 },
  { labelAr: '1.5 — لا عجز؛ علامات طفيفة في أكثر من جهاز وظيفي', value: '1.5', score: 1.5 },
  { labelAr: '2.0 — عجز طفيف في جهاز وظيفي واحد', value: '2', score: 2 },
  { labelAr: '2.5 — عجز طفيف في جهازين وظيفيين', value: '2.5', score: 2.5 },
  { labelAr: '3.0 — عجز متوسط في جهاز واحد أو خفيف في 3–4 أجهزة مع مشي كامل', value: '3', score: 3 },
  { labelAr: '3.5 — مشي كامل مع عجز متوسط متعدد الأجهزة حسب قواعد EDSS', value: '3.5', score: 3.5 },
  { labelAr: '4.0 — يمشي دون مساعدة قرابة 500 م مع عجز واضح', value: '4', score: 4 },
  { labelAr: '4.5 — يمشي دون مساعدة قرابة 300 م مع تقييد النشاط', value: '4.5', score: 4.5 },
  { labelAr: '5.0 — يمشي دون مساعدة قرابة 200 م', value: '5', score: 5 },
  { labelAr: '5.5 — يمشي دون مساعدة قرابة 100 م', value: '5.5', score: 5.5 },
  { labelAr: '6.0 — يحتاج مساعدة أحادية/متقطعة للمشي قرابة 100 م', value: '6', score: 6 },
  { labelAr: '6.5 — يحتاج مساعدة ثنائية ثابتة للمشي قرابة 20 م', value: '6.5', score: 6.5 },
  { labelAr: '7.0 — لا يمشي أبعد من نحو 5 م حتى مع المساعدة؛ يعتمد أساسًا على الكرسي المتحرك', value: '7', score: 7 },
  { labelAr: '7.5 — خطوات قليلة فقط؛ كرسي متحرك وقد يحتاج مساعدة في الانتقال', value: '7.5', score: 7.5 },
  { labelAr: '8.0 — غير قادر على المشي؛ مقيد غالبًا بالسرير/الكرسي مع بقاء كثير من العناية الذاتية', value: '8', score: 8 },
  { labelAr: '8.5 — مقيد بالسرير معظم اليوم مع بعض استخدام الذراع/العناية الذاتية', value: '8.5', score: 8.5 },
  { labelAr: '9.0 — ملازم للسرير؛ يستطيع التواصل والأكل', value: '9', score: 9 },
  { labelAr: '9.5 — ملازم للسرير وعاجز كليًا عن التواصل الفعال أو الأكل/البلع', value: '9.5', score: 9.5 },
  { labelAr: '10 — وفاة بسبب التصلب المتعدد', value: '10', score: 10 },
];

const crsrAuditory: OperationalOption[] = [
  { labelAr: '0 — لا استجابة', value: '0', score: 0 },
  { labelAr: '1 — فزع سمعي', value: '1', score: 1 },
  { labelAr: '2 — تحديد مصدر الصوت', value: '2', score: 2 },
  { labelAr: '3 — حركة قابلة للتكرار عند الأمر', value: '3', score: 3 },
  { labelAr: '4 — حركة متسقة عند الأمر', value: '4', score: 4 },
];
const crsrVisual: OperationalOption[] = [
  { labelAr: '0 — لا استجابة', value: '0', score: 0 },
  { labelAr: '1 — فزع بصري', value: '1', score: 1 },
  { labelAr: '2 — تثبيت بصري', value: '2', score: 2 },
  { labelAr: '3 — تتبع بصري', value: '3', score: 3 },
  { labelAr: '4 — تحديد جسم بالوصول إليه', value: '4', score: 4 },
  { labelAr: '5 — تعرف على جسم', value: '5', score: 5 },
];
const crsrMotor: OperationalOption[] = [
  { labelAr: '0 — لا استجابة/رخاوة', value: '0', score: 0 },
  { labelAr: '1 — وضعية غير طبيعية', value: '1', score: 1 },
  { labelAr: '2 — انسحاب بالثني', value: '2', score: 2 },
  { labelAr: '3 — تحديد المنبه المؤلم', value: '3', score: 3 },
  { labelAr: '4 — مناولة جسم', value: '4', score: 4 },
  { labelAr: '5 — استجابة حركية تلقائية', value: '5', score: 5 },
  { labelAr: '6 — استخدام وظيفي للجسم', value: '6', score: 6 },
];
const crsrOromotor: OperationalOption[] = [
  { labelAr: '0 — لا استجابة', value: '0', score: 0 },
  { labelAr: '1 — حركة فموية انعكاسية', value: '1', score: 1 },
  { labelAr: '2 — تصويت/حركة فموية', value: '2', score: 2 },
  { labelAr: '3 — كلام مفهوم', value: '3', score: 3 },
];
const crsrCommunication: OperationalOption[] = [
  { labelAr: '0 — لا تواصل', value: '0', score: 0 },
  { labelAr: '1 — تواصل مقصود لكنه غير وظيفي', value: '1', score: 1 },
  { labelAr: '2 — تواصل وظيفي دقيق', value: '2', score: 2 },
];
const crsrArousal: OperationalOption[] = [
  { labelAr: '0 — غير قابل للإيقاظ', value: '0', score: 0 },
  { labelAr: '1 — فتح العين مع التحفيز', value: '1', score: 1 },
  { labelAr: '2 — فتح العين دون تحفيز', value: '2', score: 2 },
  { labelAr: '3 — انتباه', value: '3', score: 3 },
];

const bprsItems = [
  ['BPRSA-01', 'الانشغال الجسدي / Somatic concern'],
  ['BPRSA-02', 'القلق / Anxiety'],
  ['BPRSA-03', 'الاكتئاب / Depression'],
  ['BPRSA-04', 'الأفكار/السلوك الانتحاري / Suicidality'],
  ['BPRSA-05', 'الشعور بالذنب / Guilt'],
  ['BPRSA-06', 'العدائية / Hostility'],
  ['BPRSA-07', 'ارتفاع المزاج / Elevated mood'],
  ['BPRSA-08', 'العظمة / Grandiosity'],
  ['BPRSA-09', 'الشك / Suspiciousness'],
  ['BPRSA-10', 'الهلوسات / Hallucinations'],
  ['BPRSA-11', 'محتوى فكري غير معتاد / Unusual thought content'],
  ['BPRSA-12', 'سلوك غريب / Bizarre behavior'],
  ['BPRSA-13', 'إهمال الذات / Self-neglect'],
  ['BPRSA-14', 'اختلال التوجه / Disorientation'],
  ['BPRSA-15', 'تفكك/اضطراب المفاهيم / Conceptual disorganization'],
  ['BPRSA-16', 'تسطح الوجدان / Blunted affect'],
  ['BPRSA-17', 'الانسحاب العاطفي / Emotional withdrawal'],
  ['BPRSA-18', 'البطء الحركي / Motor retardation'],
  ['BPRSA-19', 'التوتر / Tension'],
  ['BPRSA-20', 'عدم التعاون / Uncooperativeness'],
  ['BPRSA-21', 'الاستثارة / Excitement'],
  ['BPRSA-22', 'سهولة التشتت / Distractibility'],
  ['BPRSA-23', 'فرط النشاط الحركي / Motor hyperactivity'],
  ['BPRSA-24', 'السلوكيات النمطية والوضعيات / Mannerisms and posturing'],
] as const;

export const assessmentOperationalFullFormsWave17: Record<string, AssessmentOperationalMaterial> = {
  'kurtzke-functional-systems-score': {
    slug: 'kurtzke-functional-systems-score',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'Kurtzke FSS — ورقة تسجيل الأجهزة الوظيفية الثمانية',
    titleEn: 'Kurtzke Functional Systems Scores recording sheet',
    version: 'Kurtzke 1983 FSS / CDISC KFSS RS v1.0 context',
    provenance: 'KFSS هو الأساس العصبي الذي يُستخدم مع EDSS. CDISC يصنف Kurtzke Functional Systems Scores كـPublic Domain، وتعرض هذه الورقة درجات الأجهزة الثمانية مع حدود النطاق ومعدلات التعديل، دون اختزال الفحص العصبي إلى مجموع بسيط.',
    rightsNotice: 'المقياس Public Domain وفق CDISC. الشروح التدريبية الحديثة والمواد التجارية قد تحمل حقوقًا مستقلة؛ لذلك تعتمد روافد على بنية Kurtzke العامة وتربط بالمراجع بدل نسخ دليل تدريب طرف ثالث.',
    intendedUseAr: 'توحيد تسجيل القصور العصبي في التصلب المتعدد قبل إسناد EDSS، بواسطة فاحص مدرب على الفحص العصبي وتعريفات Kurtzke.',
    respondentFields: ['الاسم/الرمز', 'تاريخ الفحص', 'الفاحص', 'حالة الانتكاس/الاستقرار', 'العلاج/العوامل المؤثرة', 'مرجع النسخة المستخدمة'],
    preflightChecks: [
      'أجرِ فحصًا عصبيًا كاملًا؛ لا تُسند FSS من تقرير ذاتي مختصر فقط.',
      'ثبت نسخة/تعريفات Kurtzke المستخدمة، ولا تخلط نظام Neurostatus أو تعديلات محلية من دون توثيق.',
      'في Cerebellar يمكن استخدام علامة X عندما يعيق الضعف الهرمي تقييم الرنح؛ وفي Visual يمكن تدوين temporal pallor كعلامة وصفية بدل تغيير الدرجة تلقائيًا.',
      'لا تجمع الأجهزة الثمانية إلى “مجموع FSS” على أنه EDSS؛ EDSS له قواعد دمج ومشي مستقلة.',
    ],
    sections: [
      {
        titleAr: 'Functional Systems',
        items: [
          { code: 'KFSS-PYRAMIDAL', labelAr: 'Pyramidal: 0 طبيعي؛ 1 علامات بلا عجز؛ 2 عجز طفيف؛ 3 خزل خفيف/متوسط؛ 4 خزل شديد/شلل طرف؛ 5 شلل نصفي/سفلي أو tetraparesis شديد؛ 6 quadriplegia', type: 'choice', options: scoreChoices(6) },
          { code: 'KFSS-CEREBELLAR', labelAr: 'Cerebellar: 0 طبيعي إلى 5 عجز عن الحركات المنسقة بسبب الرنح', type: 'choice', options: scoreChoices(5) },
          { code: 'KFSS-CEREBELLAR-X', labelAr: 'هل يعيق ضعف Pyramidal (grade ≥3) تقدير المخيخي؟', type: 'checkbox' },
          { code: 'KFSS-BRAINSTEM', labelAr: 'Brainstem: 0 طبيعي إلى 5 عدم القدرة على البلع أو الكلام', type: 'choice', options: scoreChoices(5) },
          { code: 'KFSS-SENSORY', labelAr: 'Sensory: 0 طبيعي إلى 6 فقد إحساس شبه كامل أسفل الرأس', type: 'choice', options: scoreChoices(6) },
          { code: 'KFSS-BOWEL-BLADDER', labelAr: 'Bowel/Bladder: 0 طبيعي إلى 5 فقد وظيفة المثانة وفق مرساة Kurtzke', type: 'choice', options: scoreChoices(5) },
          { code: 'KFSS-VISUAL', labelAr: 'Visual: 0 طبيعي إلى 6 عجز بصري شديد وفق أسوأ/أفضل عين وتعريفات الحدة المصححة', type: 'choice', options: scoreChoices(6) },
          { code: 'KFSS-VISUAL-X', labelAr: 'Temporal pallor موجود؟', type: 'checkbox' },
          { code: 'KFSS-CEREBRAL', labelAr: 'Cerebral/Mental: 0 طبيعي؛ 1 تغير مزاج فقط؛ 2–5 تناقص معرفي متدرج حتى العجز الشديد', type: 'choice', options: scoreChoices(5) },
          { code: 'KFSS-OTHER', labelAr: 'Other: 0 لا شيء؛ 1 علامة عصبية أخرى منسوبة للتصلب المتعدد — يجب تحديدها', type: 'choice', options: scoreChoices(1) },
          { code: 'KFSS-OTHER-NOTE', labelAr: 'وصف Other إن وُجد', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'أسند كل جهاز بصورة مستقلة من 0 إلى الحد الأعلى الخاص به باستخدام تعريفات Kurtzke المرجعية.',
      'لا تحوّل FSS إلى مجموع خطي؛ استخدم نمط الأجهزة مع القدرة على المشي لتعيين EDSS.',
      'وثق X في Cerebellar عندما يحد الضعف من الاختبار، ووثّق الملاحظات البصرية/الأخرى دون تغيير الدرجة بقاعدة غير مرجعية.',
      'للمتابعة، حافظ على نفس النسخة وطريقة الفحص والفاحص قدر الإمكان.',
    ],
    interpretationGuardrails: [
      'FSS يصف ثمانية مجالات عصبية ولا يقيس التعب أو نوعية الحياة أو الإدراك المعقد كاملًا.',
      'الاختلاف بين المقيمين محتمل؛ التدريب والتعريفات الموحدة جزء من صلاحية الاستخدام.',
      'لا تستخدم درجة جهاز واحدة وحدها لاتخاذ قرار علاجي أو إعلان تقدم المرض.',
    ],
    stopRules: ['أي تدهور عصبي حاد/انتكاس محتمل يحتاج تقييمًا سريريًا مستقلًا عن استكمال الورقة.'],
    officialDownloads: [
      { label: 'CDISC QRS — Kurtzke Functional Systems Scores, Public Domain', url: CDISC_ALL, language: 'en', publisher: 'CDISC' },
      { label: 'EDMUS — Functional Systems reference', url: KFSS_EDMUS, language: 'en', publisher: 'EDMUS Coordinating Center' },
    ],
    sourceUrls: [CDISC_ALL, EDSS_ORIGINAL, KFSS_EDMUS, EDSS_RMD],
    lastVerifiedOn: '2026-09-06',
  },

  'expanded-disability-status-scale': {
    slug: 'expanded-disability-status-scale',
    kind: 'clinical-classification',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'EDSS — ورقة دمج FSS والمشي وإسناد الدرجة 0–10',
    titleEn: 'Kurtzke Expanded Disability Status Scale recording/classification sheet',
    version: 'Kurtzke 1983 EDSS; CDISC RS Version 2.0 released 21 Nov 2024',
    provenance: 'EDSS Public Domain وفق CDISC. النسخة الكلاسيكية تقسم 0–10 إلى أنصاف درجات من 1.0 إلى 9.5؛ الدرجات المنخفضة تعتمد نمط FSS، ومن 4.0 فصاعدًا تهيمن قيود المشي والاستقلال تدريجيًا.',
    rightsNotice: 'EDSS Public Domain وفق CDISC. روافد لا تعيد نشر مواد تدريب Neurostatus أو واجهات حاسبات تجارية، وتُبقي مرجع الإسناد النهائي مثبتًا.',
    intendedUseAr: 'تسجيل درجة EDSS لدى مرضى التصلب المتعدد ضمن فحص عصبي موحد، مع حفظ FSS والمسافة والمساعدة المستخدمة بدل كتابة رقم نهائي بلا مسار تدقيق.',
    respondentFields: ['الاسم/الرمز', 'تاريخ الفحص', 'الفاحص', 'الانتكاس الحالي/الحديث', 'وقت اليوم/التعب إن كان مؤثرًا', 'نسخة EDSS/KFSS المستخدمة'],
    preflightChecks: [
      'أكمل KFSS أولًا وسجل الأجهزة الثمانية؛ لا تعيّن EDSS من مسافة المشي وحدها في الدرجات المنخفضة.',
      'سجل مسافة المشي الفعلية دون مساعدة ودون راحة، ثم نوع المساعدة إن استُخدمت.',
      'لا توجد درجة EDSS = 0.5؛ التسلسل هو 0 ثم 1.0 و1.5 … حتى 9.5 ثم 10.',
      'ثبّت القواعد المرجعية عند الحدود المتداخلة؛ EDSS ليس مجرد جمع أرقام FSS.',
    ],
    sections: [
      {
        titleAr: 'FSS ومحددات الحركة',
        items: [
          { code: 'EDSS-FS-PYR', labelAr: 'Pyramidal FSS', type: 'number', min: 0, max: 6 },
          { code: 'EDSS-FS-CER', labelAr: 'Cerebellar FSS', type: 'number', min: 0, max: 5 },
          { code: 'EDSS-FS-BS', labelAr: 'Brainstem FSS', type: 'number', min: 0, max: 5 },
          { code: 'EDSS-FS-SEN', labelAr: 'Sensory FSS', type: 'number', min: 0, max: 6 },
          { code: 'EDSS-FS-BB', labelAr: 'Bowel/Bladder FSS', type: 'number', min: 0, max: 5 },
          { code: 'EDSS-FS-VIS', labelAr: 'Visual FSS', type: 'number', min: 0, max: 6 },
          { code: 'EDSS-FS-MEN', labelAr: 'Cerebral/Mental FSS', type: 'number', min: 0, max: 5 },
          { code: 'EDSS-FS-OTH', labelAr: 'Other FSS', type: 'number', min: 0, max: 1 },
          { code: 'EDSS-WALK-M', labelAr: 'أقصى مسافة مشي دون مساعدة أو راحة', type: 'distance', min: 0, unit: 'm' },
          { code: 'EDSS-AID', labelAr: 'المساعدة اللازمة للمشي/الانتقال', type: 'text' },
          { code: 'EDSS-WHEELCHAIR', labelAr: 'اعتماد الكرسي المتحرك/مدة النشاط عليه', type: 'text' },
          { code: 'EDSS-SELFCARE', labelAr: 'وصف الاستقلال والعناية الذاتية عند الدرجات العالية', type: 'text' },
        ],
      },
      {
        titleAr: 'التصنيف النهائي',
        items: [
          { code: 'EDSS-FINAL', labelAr: 'EDSS النهائي بعد مطابقة FSS والمشي والوظيفة بمرساة النسخة', type: 'choice', options: edssOptions },
          { code: 'EDSS-RATIONALE', labelAr: 'سبب اختيار الدرجة/الحد الفاصل', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      '0–3.5: يعتمد الإسناد أساسًا على نمط وعدد درجات FSS مع بقاء المريض fully ambulatory.',
      '4.0≈500 م؛ 4.5≈300 م؛ 5.0≈200 م؛ 5.5≈100 م دون مساعدة/راحة، مع مراعاة وصف الوظيفة لكل مرساة.',
      '6.0≈100 م بمساعدة أحادية أو متقطعة؛ 6.5≈20 م بمساعدة ثنائية ثابتة؛ 7.0 فما فوق يصف انتقالًا متزايدًا للاعتماد على الكرسي/السرير والوظيفة الذاتية.',
      'حدد الدرجة النهائية من مرساة EDSS الكاملة؛ لا تستنتجها آليًا من المسافة وحدها عندما تتعارض بقية الوظائف.',
    ],
    interpretationGuardrails: [
      'EDSS يرتكز بشدة على المشي في النصف الأعلى وقد يقل تمثيله للإدراك والتعب ووظيفة الطرف العلوي.',
      'الفرق 0.5 ليس بالضرورة مسافة متساوية بيولوجيًا عبر السلم؛ المقياس رتبي.',
      'لا تستخدم تغيرًا صغيرًا منفردًا كدليل قطعي على فشل/نجاح علاج دون تعريف confirmatory protocol والسياق السريري.',
    ],
    stopRules: ['عند انتكاس حاد أو مرض عابر يغيّر الأداء، وثق السياق ولا تفسر الدرجة كخط أساس مستقر.'],
    officialDownloads: [
      { label: 'CDISC QRS — EDSS, Public Domain', url: EDSS_CDISC, language: 'en', publisher: 'CDISC' },
      { label: 'NINDS CDE — EDSS functional scale', url: EDSS_NINDS, language: 'en', publisher: 'NINDS' },
    ],
    sourceUrls: [EDSS_CDISC, EDSS_ORIGINAL, EDSS_NINDS, EDSS_RMD, KFSS_EDMUS],
    lastVerifiedOn: '2026-09-06',
  },

  'jfk-coma-recovery-scale-revised': {
    slug: 'jfk-coma-recovery-scale-revised',
    kind: 'clinical-classification',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'CRS‑R — ورقة التسجيل للمجالات الستة ومسار الحالة السريرية',
    titleEn: 'JFK Coma Recovery Scale-Revised scoring/diagnostic recording sheet',
    version: 'CRS-R 2004 / updated administration manual 2020; CDISC RS v2.0 context',
    provenance: 'CDISC يدرج CRS-R كـPublic Domain، بينما سجل NINDS CDE ينبه أن بعض الاستخدامات قد تتطلب ترخيصًا. لذلك تنشر روافد بنية الدرجات والمجالات والمخرجات التشخيصية الضرورية للتسجيل، ولا تعيد نسخ بروتوكول التحفيز التفصيلي أو مواد التدريب كاملة.',
    rightsNotice: 'توجد إشارات حقوق متباينة بين CDISC وNINDS؛ يُراجع الترخيص المطلوب للاستخدام المؤسسي/البحثي. هذه الورقة ليست بديلًا عن Administration and Scoring Guidelines الرسمية.',
    intendedUseAr: 'تسجيل أعلى استجابة موثقة في كل مجال CRS-R لدى اضطرابات الوعي، ومتابعة المسار على تقييمات متكررة بواسطة فاحص مدرب.',
    respondentFields: ['الاسم/الرمز', 'التشخيص', 'تاريخ البداية', 'تاريخ الدخول', 'تاريخ/وقت التقييم', 'الفاحص', 'الأدوية/العوامل المربكة', 'Test Completion Code لكل مجال عند الحاجة'],
    preflightChecks: [
      'استخدم دليل CRS-R الرسمي للتحفيز وعدد المحاولات ومعايير النجاح؛ لا تستبدله بتقدير انطباعي.',
      'حسّن اليقظة حسب البروتوكول عند الحاجة وسجل المربكات مثل sedation أو aphasia أو إصابات حسية/حركية.',
      'التقييم المتكرر مهم بسبب تذبذب السلوك؛ نتيجة مفردة قد تخطئ مستوى الوعي.',
      'لا تستخدم المجموع الكلي وحده لتحديد التشخيص؛ السلوكيات المفتاحية في المجالات هي التي ترسم MCS/eMCS.',
    ],
    sections: [
      {
        titleAr: 'المجالات الستة',
        items: [
          { code: 'CRSR-AUD', labelAr: 'Auditory function', type: 'choice', options: crsrAuditory },
          { code: 'CRSR-VIS', labelAr: 'Visual function', type: 'choice', options: crsrVisual },
          { code: 'CRSR-MOT', labelAr: 'Motor function', type: 'choice', options: crsrMotor },
          { code: 'CRSR-ORO', labelAr: 'Oromotor/Verbal function', type: 'choice', options: crsrOromotor },
          { code: 'CRSR-COM', labelAr: 'Communication', type: 'choice', options: crsrCommunication },
          { code: 'CRSR-ARO', labelAr: 'Arousal', type: 'choice', options: crsrArousal },
          { code: 'CRSR-TOTAL', labelAr: 'المجموع الخام', type: 'number', min: 0, max: 23, unit: '0–23' },
          { code: 'CRSR-STATE', labelAr: 'الحالة السريرية المستنتجة وفق معايير CRS-R وبقية الفحص', type: 'choice', options: [
            { labelAr: 'Coma / غيبوبة', value: 'coma' },
            { labelAr: 'UWS/VS — يقظة غير مستجيبة/حالة إنباتية', value: 'uws-vs' },
            { labelAr: 'MCS− — حالة وعي أدنى (سلوكيات غير لغوية عالية المستوى)', value: 'mcs-minus' },
            { labelAr: 'MCS+ — حالة وعي أدنى مع سلوكيات لغوية/اتباع أوامر', value: 'mcs-plus' },
            { labelAr: 'eMCS — خروج من حالة الوعي الأدنى', value: 'emcs' },
            { labelAr: 'غير محسوم/يحتاج إعادة تقييم', value: 'indeterminate' },
          ] },
        ],
      },
    ],
    scoringSteps: [
      'سجّل أعلى بند يستوفي المعايير في كل مجال ثم اجمع المجالات الستة؛ النطاق الخام 0–23.',
      'السلوكيات الدالة على MCS تشمل مثلًا auditory ≥3 أو visual ≥2 أو motor ≥3 أو oromotor=3 أو communication=1 وفق خرائط التشخيص المنشورة؛ لا تعتمد على المجموع وحده.',
      'eMCS يتطلب دليلًا مثل functional communication (communication=2) أو functional object use (motor=6) وفق معايير CRS-R.',
      'إذا تعارضت النتيجة مع الملاحظة السريرية أو كانت المربكات كبيرة، أعد التقييم بدل فرض تصنيف.',
    ],
    interpretationGuardrails: [
      'CRS-R أداة تشخيصية/متابعة متخصصة لاضطرابات الوعي؛ تحتاج تدريبًا وتطبيقًا معياريًا.',
      'لا تستخدم CRS-R منفردًا للتنبؤ الحتمي بالمآل أو لتبرير سحب العلاج أو حرمان المريض من التأهيل.',
      'التشخيص قد يتغير عبر الأيام بسبب تقلب اليقظة والقدرة الحركية/اللغوية والعوامل الطبية.',
    ],
    stopRules: ['عدم استقرار طبي، نقص أكسجة، اختلاج، أو تدهور حاد يُعالج أولًا؛ التقييم لا يؤخر الرعاية.'],
    officialDownloads: [
      { label: 'CDISC QRS — CRS-R Public Domain status', url: CRSR_CDISC, language: 'en', publisher: 'CDISC' },
      { label: 'RehabMeasures — CRS-R manual/source access', url: CRSR_RMD, language: 'en', publisher: 'Shirley Ryan AbilityLab' },
      { label: 'NINDS CDE — CRS-R rights/use notice', url: CRSR_NINDS, language: 'en', publisher: 'NINDS' },
    ],
    sourceUrls: [CRSR_CDISC, CRSR_RMD, CRSR_NINDS, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6095641/'],
    lastVerifiedOn: '2026-09-06',
  },

  'brief-psychiatric-rating-scale-anchored': {
    slug: 'brief-psychiatric-rating-scale-anchored',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'BPRS‑A — ورقة تسجيل النسخة الموسعة ذات 24 بندًا',
    titleEn: 'Brief Psychiatric Rating Scale — Anchored / Expanded 24-item recording sheet',
    version: '24-item anchored/expanded structure; CDISC BPRS-A RS Version 2.0 released 27 Feb 2023',
    provenance: 'CDISC يصنف BPRS-A كـPublic Domain. البنية الموسعة تستخدم 24 عرضًا بدرجات 1–7، لكن المراسي التفصيلية والتدريب يجب تثبيتهما على النسخة المرجعية؛ ولا تدعي روافد أن الصياغة العربية هنا ترجمة Mapi/ICON محققة.',
    rightsNotice: 'الأصل BPRS في المجال العام، بينما ترجمات موزعة من Mapi/ICON أو مواد تدريب بعينها لها مسارات استخدام منفصلة. هذه الورقة ترجمة تشغيلية لعناوين البنية وليست نسخة عربية رسمية/محققة من موزع.',
    intendedUseAr: 'تسجيل شدة الأعراض النفسية بصورة موحدة بواسطة مختص مدرب، مع الرجوع إلى المراسي التفصيلية للنسخة المعتمدة قبل إسناد 1–7.',
    respondentFields: ['الاسم/الرمز', 'تاريخ/وقت المقابلة', 'الفاحص', 'مدة المقابلة', 'مصادر المعلومات الجانبية', 'إصدار/دليل المراسي المستخدم'],
    preflightChecks: [
      'ثبت أن النسخة المطلوبة هي BPRS-A/expanded 24-item وليست BPRS التقليدية 18-item.',
      'استخدم مقابلة منظمة/شبه منظمة وتدريب المراسي؛ أسماء البنود وحدها لا تكفي لإسناد الشدة بثبات.',
      'البنود 1–14 تعتمد أساسًا على تقرير المريض، مع ملاحظة أن 7 و12 و13 يمكن أن تستفيد من الملاحظة؛ البنود 15–24 تعتمد أساسًا على السلوك والكلام الملاحظ.',
      'أي بند غير مقيم يُسجل NA في نظام الدراسة ولا يُعامل كدرجة 1 عند حساب المجموع.',
    ],
    sections: [
      {
        titleAr: '24 عرضًا — الدرجة 1 إلى 7 وفق المراسي المرجعية',
        items: bprsItems.map(([code, labelAr]) => ({ code, labelAr, type: 'choice' as const, options: severity17 })),
      },
      {
        titleAr: 'التلخيص',
        items: [
          { code: 'BPRSA-TOTAL', labelAr: 'المجموع الخام إذا كانت البنود الـ24 مكتملة', type: 'number', min: 24, max: 168, unit: '24–168' },
          { code: 'BPRSA-MISSING', labelAr: 'البنود غير المقيمة/NA', type: 'text' },
          { code: 'BPRSA-SAFETY', labelAr: 'إجراء السلامة المتخذ عند suicidality/خطر حاد', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'كل بند يُسند 1–7 من غير موجود إلى شديد جدًا، لكن استخدم تعريفات ومراسي النسخة المرجعية لا الانطباع الحر.',
      'عند اكتمال البنود الـ24 يكون المجموع الحسابي 24–168؛ لا تحسب مجموعًا اعتياديًا إذا كانت هناك بنود NA إلا إذا كان بروتوكول الدراسة يحدد معالجة موثقة للمفقود.',
      'قارن التغير باستخدام النسخة وطريقة المقابلة ومصدر المعلومات نفسها قدر الإمكان.',
      'لا تستبدل الدرجة بتشخيص DSM/ICD أو بتقييم سريري شامل.',
    ],
    interpretationGuardrails: [
      'BPRS-A يقيس شدة طيف أعراض ولا يثبت تشخيصًا بعينه.',
      'المجاميع والأبعاد العاملية تختلف حسب النسخة والسكان؛ لا تستورد cut-off غير محقق.',
      'الصياغة العربية هنا لتنظيم التسجيل؛ المراسي العربية المحققة تحتاج نسخة وترخيص/دليل لغوي مستقل.',
    ],
    stopRules: ['أي استجابة أو ملاحظة تشير إلى انتحار/عنف/هياج شديد أو تدهور طبي تتطلب تقييم سلامة مباشرًا؛ لا تنتظر المجموع.'],
    officialDownloads: [
      { label: 'CDISC QRS — BPRS-A Public Domain, Version 2.0', url: BPRS_CDISC, language: 'en', publisher: 'CDISC' },
      { label: 'PhenX — BPRS expanded protocol', url: BPRS_PHENX, language: 'en', publisher: 'PhenX Toolkit' },
      { label: 'ePROVIDE — BPRS rights/translation context', url: BPRS_MAPITRUST, language: 'en', publisher: 'Mapi Research Trust' },
    ],
    sourceUrls: [BPRS_CDISC, BPRS_PHENX, BPRS_MAPITRUST, 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4059178/'],
    lastVerifiedOn: '2026-09-06',
  },

  'rey-auditory-verbal-learning-test': {
    slug: 'rey-auditory-verbal-learning-test',
    kind: 'protocol-sheet',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'RAVLT — ورقة بروتوكول التعلم اللفظي والتذكر دون قائمة كلمات مصطنعة',
    titleEn: 'Rey Auditory Verbal Learning Test protocol and raw-score sheet',
    version: 'Classic 15-word, five-learning-trial RAVLT structure; CDISC AVLT-REY FT Version 1.0',
    provenance: 'CDISC يصنف RAVLT كـPublic Domain. البنية الكلاسيكية تستخدم قائمة A من 15 كلمة عبر خمس محاولات، قائمة تداخل B، استدعاء A بعد التداخل، استدعاء مؤجل، واختبار تعرف اختياري. قوائم الكلمات والمعايير تعتمد اللغة/الإصدار، لذلك لا تولد روافد قائمة عربية جديدة ثم تستخدم معايير إنجليزية.',
    rightsNotice: 'البنية/الاختبار مصنف Public Domain لدى CDISC، لكن قوائم أو كتيبات معيارية منشورة من جهات بعينها قد تكون منتجات مستقلة. هذه الورقة تسجل البروتوكول والدرجات ولا تعيد نشر قائمة كلمات من كتيب تجاري.',
    intendedUseAr: 'توحيد تسجيل التعلم اللفظي السمعي والاحتفاظ والتداخل والتعرف في التقييم العصبي النفسي باستخدام قائمة/لغة ومعايير مثبتة مسبقًا.',
    respondentFields: ['الاسم/الرمز', 'العمر', 'التعليم', 'اللغة/اللهجة', 'قائمة الكلمات/الإصدار', 'مصدر المعايير', 'الفاحص', 'فترة التأخير الفعلية'],
    preflightChecks: [
      'استخدم قائمة A وB ومعايير معتمدة للغة والسكان؛ لا تستخدم قائمة مترجمة محليًا مع معايير إنجليزية.',
      'ثبت البروتوكول: RAVLT الكلاسيكي خمس محاولات تعلم؛ لا تخلطه مع NIH Toolbox V3 ذي ثلاث محاولات.',
      'اقرأ الكلمات بالترتيب والسرعة المحددين في النسخة المستخدمة وسجل الكلمات الصحيحة والتكرارات والتطفلات.',
      'ثبت مدة التأخير وبروتوكول التعرف؛ الأدبيات تستخدم تأخيرات/قوائم تعرف مختلفة، ما يمنع المقارنة العمياء.',
    ],
    sections: [
      {
        titleAr: 'التجارب الخام',
        items: [
          { code: 'RAVLT-A1', labelAr: 'List A — Trial 1 صحيحة', type: 'number', min: 0, max: 15 },
          { code: 'RAVLT-A2', labelAr: 'List A — Trial 2 صحيحة', type: 'number', min: 0, max: 15 },
          { code: 'RAVLT-A3', labelAr: 'List A — Trial 3 صحيحة', type: 'number', min: 0, max: 15 },
          { code: 'RAVLT-A4', labelAr: 'List A — Trial 4 صحيحة', type: 'number', min: 0, max: 15 },
          { code: 'RAVLT-A5', labelAr: 'List A — Trial 5 صحيحة', type: 'number', min: 0, max: 15 },
          { code: 'RAVLT-B1', labelAr: 'List B interference — صحيحة', type: 'number', min: 0, max: 15 },
          { code: 'RAVLT-A6', labelAr: 'List A immediate post-interference recall', type: 'number', min: 0, max: 15 },
          { code: 'RAVLT-A7', labelAr: 'List A delayed free recall', type: 'number', min: 0, max: 15 },
          { code: 'RAVLT-DELAY-MIN', labelAr: 'مدة التأخير الفعلية', type: 'number', min: 0, max: 120, unit: 'minutes' },
          { code: 'RAVLT-RECOG-HITS', labelAr: 'Recognition hits', type: 'number', min: 0, max: 15 },
          { code: 'RAVLT-RECOG-FP', labelAr: 'Recognition false positives', type: 'number', min: 0 },
          { code: 'RAVLT-INTRUSIONS', labelAr: 'مجموع الكلمات الدخيلة عبر التجارب وفق بروتوكول النسخة', type: 'number', min: 0 },
          { code: 'RAVLT-REPETITIONS', labelAr: 'التكرارات وفق بروتوكول النسخة', type: 'number', min: 0 },
        ],
      },
      {
        titleAr: 'مؤشرات وصفية غير معيارية',
        items: [
          { code: 'RAVLT-SUM-A1-A5', labelAr: 'مجموع التعلم A1–A5', type: 'number', min: 0, max: 75, unit: '0–75' },
          { code: 'RAVLT-LEARNING-GAIN', labelAr: 'فرق A5 − A1 (مؤشر وصفي فقط)', type: 'number', min: -15, max: 15 },
          { code: 'RAVLT-RETENTION-NOTE', labelAr: 'مؤشر الاحتفاظ/النسيان المستخدم وصيغته في البروتوكول', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'في البروتوكول الكلاسيكي: اقرأ List A ثم سجل الاستدعاء الحر خمس مرات A1–A5؛ كل تجربة 0–15.',
      'قدّم List B مرة واحدة وسجل B1، ثم اطلب List A دون إعادة عرضها وسجل A6.',
      'بعد فترة التأخير المحددة مسبقًا (غالبًا نحو 20–40 دقيقة في البنية الكلاسيكية) سجل A7 ثم التعرف إذا كان ضمن النسخة.',
      'احتفظ بالدرجات الخام والتطفلات والتكرارات؛ أي z-score أو percentile أو تشخيص يجب أن يأتي من معايير العمر/التعليم/اللغة والإصدار الصحيح.',
    ],
    interpretationGuardrails: [
      'الأداء يتأثر باللغة والتعليم والسمع والانتباه والجهد والاضطرابات المزاجية والعصبية؛ لا تفسر درجة منفردة بمعزل عن التقييم العصبي النفسي.',
      'القوائم البديلة ليست متكافئة تلقائيًا، وتأثير الممارسة مهم في القياسات المتكررة.',
      'NIH Toolbox RAVLT المعاصر يستخدم بروتوكولًا مختلفًا (ثلاث تجارب في V3)؛ لا تقارن نتائجه مباشرة بالبنية الكلاسيكية ذات خمس تجارب دون تحويل/دليل.',
    ],
    stopRules: ['ضعف سمع غير مصحح، حاجز لغوي، هذيان/تدهور حاد أو عدم فهم التعليمات يجعل النتيجة غير صالحة للتفسير المعياري حتى معالجة السبب.'],
    officialDownloads: [
      { label: 'CDISC QRS — RAVLT Public Domain', url: RAVLT_CDISC, language: 'en', publisher: 'CDISC' },
      { label: 'FITBIR CDE — RAVLT word-list/trial structure', url: RAVLT_FITBIR, language: 'en', publisher: 'NIH FITBIR' },
    ],
    sourceUrls: [RAVLT_CDISC, RAVLT_APA, RAVLT_FITBIR, 'https://www.ncbi.nlm.nih.gov/books/NBK442448/table/appc.t2/'],
    lastVerifiedOn: '2026-09-06',
  },
};
