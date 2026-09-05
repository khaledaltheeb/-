import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const yesNoUnknown: OperationalOption[] = [
  { labelAr: 'نعم', value: 'yes' },
  { labelAr: 'لا', value: 'no' },
  { labelAr: 'غير معروف / غير موثق', value: 'unknown' },
];

const brookeGrades: OperationalOption[] = [
  {
    labelAr: '1 — يبدأ والذراعان بجانب الجسم، ويستطيع تبعيد الذراعين في دائرة كاملة حتى تتلامس اليدان فوق الرأس.',
    labelEn: '1 — Starting with arms at the sides, can abduct arms in a full circle until they touch above the head.',
    value: '1',
    score: 1,
  },
  {
    labelAr: '2 — يستطيع رفع الذراعين فوق الرأس فقط بثني المرفق أو تقصير محيط الحركة أو استخدام عضلات/حركات تعويضية.',
    labelEn: '2 — Can raise arms above the head only by flexing the elbow, shortening the movement circumference, or using accessory muscles.',
    value: '2',
    score: 2,
  },
  {
    labelAr: '3 — لا يستطيع رفع اليدين فوق الرأس، لكنه يستطيع رفع كوب ماء بوزن 8 أونصات تقريبًا إلى الفم، باستخدام اليدين معًا عند الحاجة.',
    labelEn: '3 — Cannot raise hands above head but can raise an 8-oz glass of water to the mouth, using both hands if necessary.',
    value: '3',
    score: 3,
  },
  {
    labelAr: '4 — يستطيع رفع اليدين إلى الفم، لكنه لا يستطيع رفع كوب ماء بوزن 8 أونصات إلى الفم.',
    labelEn: '4 — Can raise hands to mouth but cannot raise an 8-oz glass of water to the mouth.',
    value: '4',
    score: 4,
  },
  {
    labelAr: '5 — لا يستطيع رفع اليد إلى الفم، لكنه يستطيع استخدام اليدين للإمساك بقلم أو التقاط قطع نقدية من الطاولة.',
    labelEn: '5 — Cannot raise hand to mouth but can use hands to hold a pen or pick up pennies from the table.',
    value: '5',
    score: 5,
  },
  {
    labelAr: '6 — لا يستطيع رفع اليدين إلى الفم ولا توجد وظيفة عملية مفيدة لليدين.',
    labelEn: '6 — Cannot raise hands to mouth and has no useful function of hands.',
    value: '6',
    score: 6,
  },
];

const hivStageOptions: OperationalOption[] = [
  { labelAr: '0 — عدوى مبكرة وفق تسلسل الاختبارات المحدد', value: '0', score: 0 },
  { labelAr: '1', value: '1', score: 1 },
  { labelAr: '2', value: '2', score: 2 },
  { labelAr: '3 — مرحلة 3 للمراقبة الوبائية', value: '3', score: 3 },
  { labelAr: 'غير معروفة', value: 'unknown' },
];

const ageBandOptions: OperationalOption[] = [
  { labelAr: 'أقل من سنة', value: 'lt1' },
  { labelAr: '1–5 سنوات', value: '1to5' },
  { labelAr: '6 سنوات فأكثر', value: 'gte6' },
];

const sexOptions: OperationalOption[] = [
  { labelAr: 'أنثى — كما صيغ نموذج PCE الأصلي', value: 'female' },
  { labelAr: 'ذكر — كما صيغ نموذج PCE الأصلي', value: 'male' },
];

const pceRaceOptions: OperationalOption[] = [
  { labelAr: 'Black / African-American — فئة النموذج التاريخي الأصلي', value: 'black' },
  { labelAr: 'White — فئة النموذج التاريخي الأصلي', value: 'white' },
  { labelAr: 'فئة أخرى — لا توجد معادلة PCE مشتقة خصيصًا لها', value: 'other' },
];

export const assessmentOperationalFullFormsWave3: Record<string, AssessmentOperationalMaterial> = {
  'brooke-upper-extremity-rating-scale': {
    slug: 'brooke-upper-extremity-rating-scale',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس بروك لوظيفة الطرف العلوي — ورقة التصنيف الكاملة',
    titleEn: 'Brooke Upper Extremity Rating Scale (BUERS)',
    version: 'Brooke 1–6 functional grade',
    provenance: 'المراسي الستة مطابقة للبنية المنشورة لمقياس Brooke الأصلي كما أعيد نشرها في أدبيات التأهيل العصبي العضلي، مع توثيق CDISC أن BUERS في المجال العام. الصياغة العربية هنا ترجمة تشغيلية من روافد وليست ادعاءً بأنها ترجمة عربية معيارية محققة مستقلة.',
    rightsNotice: 'CDISC يصنف BUERS كأداة Public Domain. تعريب روافد يشرح المراسي دون نسخ صور أو مواد تدريبية لطرف ثالث، ولا يُنسب إلى جهة أخرى كترجمة رسمية.',
    intendedUseAr: 'تصنيف وظيفي رتبي سريع لقدرة الطرفين العلويين، خصوصًا في الحثل العضلي الدوشيني وبعض السياقات العصبية العضلية. لا يقيس القوة العضلية مباشرة ولا يستبدل مقياسًا متعدد المهام عند الحاجة لحساسية أعلى للتغير.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'التشخيص/السياق', 'اسم الفاحص', 'الطرف المفضل عند الحاجة'],
    preflightChecks: [
      'هيئ مساحة آمنة للحركة وتأكد من عدم وجود ألم حاد أو مانع طبي للحركة المطلوبة.',
      'ثبّت أن المقصود هو Brooke 1–6، ولا تخلطه بسلالم أو تعديلات محلية أخرى.',
      'لدرجات 3–4 استخدم كوبًا/حمولة تقارب 8 أونصات (نحو 227 غرامًا) كما في الوصف المنشور، مع مراعاة السلامة.',
    ],
    sections: [
      {
        titleAr: 'الدرجة الوظيفية',
        instructionsAr: 'اختر فئة واحدة فقط تمثل أعلى وصف يطابق الأداء الفعلي. الدرجات رتبية؛ لا تنشئ درجات نصفية.',
        items: [
          { code: 'BUERS-GRADE', labelAr: 'درجة Brooke', type: 'choice', options: brookeGrades },
        ],
      },
      {
        titleAr: 'قياس اختياري لدرجتي 1–2',
        instructionsAr: 'الوصف المنشور يذكر قياسًا اختياريًا لكمية الوزن التي يستطيع الشخص وضعها بيد واحدة على رف فوق مستوى العينين. استخدمه فقط إذا كان مناسبًا وآمنًا ووثّق الطريقة.',
        items: [
          { code: 'BUERS-WEIGHT', labelAr: 'أكبر وزن وُضع على رف أعلى من مستوى العينين باستخدام يد واحدة', type: 'number', unit: 'kg', min: 0, noteAr: 'اختياري لدرجة Brooke 1 أو 2؛ لا يغير الدرجة الأساسية.' },
          { code: 'BUERS-COMPENSATION', labelAr: 'تعويضات/ملاحظات على الحركة أو الألم أو المساعدة', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'سجّل فئة واحدة من 1 إلى 6؛ الدرجة الأعلى تعكس فقدًا وظيفيًا أكبر للطرفين العلويين.',
      'لا تجمع الفئات ولا تحولها إلى نسبة مئوية، لأنها سلم رتبي وليست فواصل كمية متساوية.',
      'إذا تغيرت طريقة التطبيق أو المساعدة أو الأجهزة بين الزيارات فوثق ذلك قبل تفسير التغير الطولي.',
      'عند الحاجة لالتقاط تغيرات دقيقة استخدم مقياسًا مناسبًا متعدد البنود مثل PUL ضمن سياقه وترخيصه بدل توسيع Brooke محليًا.',
    ],
    interpretationGuardrails: [
      'Brooke يصف وظيفة الطرف العلوي ولا يحدد شدة المرض ككل ولا الوظيفة التنفسية أو الطرف السفلي.',
      'لا تستنتج أهلية علاج أو جهاز مساعد أو خدمة تأهيل من الدرجة وحدها.',
      'التعريب التشغيلي لا يساوي تحققًا سيكومتريًا لنسخة عربية مستقلة.',
    ],
    stopRules: [
      'أوقف محاولة حركة تسبب ألمًا حادًا أو عدم استقرار أو خطرًا طبيًا واضحًا.',
      'لا تُجبر الشخص على حمل وزن فقط لإكمال القياس الاختياري.',
    ],
    officialDownloads: [
      { label: 'CDISC QRS — Brooke Upper Extremity Rating Scale', url: 'https://www.cdisc.org/standards/foundational/qrs/brooke-upper-extremity-rating-scale', language: 'en', publisher: 'CDISC' },
      { label: 'CINRG Duchenne Natural History Study — published Brooke grading criteria', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4147958/', language: 'en', publisher: 'PubMed Central' },
    ],
    sourceUrls: [
      'https://www.cdisc.org/standards/foundational/qrs/brooke-upper-extremity-rating-scale',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC4147958/',
    ],
    lastVerifiedOn: '2026-09-06',
  },

  'cdc-hiv-surveillance-stage-2014': {
    slug: 'cdc-hiv-surveillance-stage-2014',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'تصنيف مرحلة عدوى HIV للمراقبة الوبائية — CDC 2014',
    titleEn: 'CDC Revised Surveillance Case Definition for HIV Infection — 2014 Stage',
    version: 'CDC 2014 surveillance stages 0, 1, 2, 3, unknown',
    provenance: 'مبني مباشرة على تعريف CDC الرسمي لعام 2014، الذي ما يزال مدرجًا لدى CDC كتعريف مراقبة حالي في 2026. أُعيد تنظيم المعايير هنا كورقة عمل عربية للمراقبة دون تغيير الحدود العددية أو ترتيب الأولوية.',
    rightsNotice: 'معظم مواد CDC الاتحادية تقع في المجال العام مع وجوب النسبة وعدم الإيحاء بتأييد CDC. هذه ورقة روافد مشتقة تنظيميًا وليست نموذجًا رسميًا صادرًا عن CDC.',
    intendedUseAr: 'تصنيف مرحلة HIV لأغراض المراقبة الوبائية وتحليل مرحلة المرض عند التشخيص. هذا التعريف مخصص للمراقبة السكانية وليس لاتخاذ قرارات علاج فردية.',
    respondentFields: ['معرف حالة غير مباشر', 'تاريخ التشخيص المؤكد', 'العمر في تاريخ اختبار CD4', 'مصدر البيانات/نظام المراقبة', 'تاريخ التصنيف'],
    preflightChecks: [
      'استخدم الورقة فقط بعد استيفاء تعريف الحالة المؤكدة حسب نظام المراقبة المعتمد.',
      'احمِ خصوصية بيانات HIV؛ استخدم الحد الأدنى الضروري من المعرفات والصلاحيات.',
      'تحقق أولًا من Stage 0 لأنه يتقدم على جميع مراحل CD4 والمرض الانتهازي ضمن تعريف 2014.',
    ],
    sections: [
      {
        titleAr: '1) فحص Stage 0 — العدوى المبكرة',
        instructionsAr: 'Stage 0 يتقدم على المراحل الأخرى. راجع تسلسل الاختبارات كاملًا والاستثناء المحدد في تعريف CDC.',
        items: [
          { code: 'HIV0-RECENT-NEG', labelAr: 'هل توجد نتيجة HIV سلبية أو غير حاسمة خلال 180 يومًا قبل أول نتيجة إيجابية مؤكدة؟', type: 'choice', options: yesNoUnknown },
          { code: 'HIV0-ALGORITHM', labelAr: 'أو هل أظهر خوارزم الاختبار علامات فيروسية نوعية لـHIV (مثل p24 أو NAT) ضمن 0–180 يومًا قبل/بعد اختبار أضداد سلبي أو غير حاسم، بما يطابق تعريف CDC؟', type: 'choice', options: yesNoUnknown },
          { code: 'HIV0-PRIOR-EVIDENCE', labelAr: 'هل سبقت النتيجة السلبية/غير الحاسمة بأكثر من 60 يومًا أدلة موثقة على عدوى HIV سابقة تجعل استثناء Stage 0 منطبقًا؟', type: 'choice', options: yesNoUnknown },
          { code: 'HIV0-NOTE', labelAr: 'تواريخ الاختبارات وتسلسلها/ملاحظات التحقق', type: 'text' },
        ],
      },
      {
        titleAr: '2) المرض المحدد للمرحلة 3',
        instructionsAr: 'إذا لم تتحقق Stage 0، فإن تشخيص مرض انتهازي محدد للمرحلة 3 يجعل المرحلة 3 بصرف النظر عن CD4 وفق تعريف CDC.',
        items: [
          { code: 'HIV3-OI', labelAr: 'مرض/حالة محددة للمرحلة 3 موثقة وفق ملحق CDC', type: 'choice', options: yesNoUnknown },
          { code: 'HIV3-OI-DESC', labelAr: 'الحالة/التاريخ/مصدر التوثيق', type: 'text' },
        ],
      },
      {
        titleAr: '3) CD4 والعمر',
        instructionsAr: 'إذا لم تتحقق Stage 0 ولم توجد حالة محددة للمرحلة 3، استخدم عدد CD4 أولًا؛ النسبة تُستخدم فقط إذا كان العدد مفقودًا.',
        items: [
          { code: 'HIV-AGE-BAND', labelAr: 'الفئة العمرية في تاريخ اختبار CD4', type: 'choice', options: ageBandOptions },
          { code: 'HIV-CD4-COUNT', labelAr: 'عدد CD4', type: 'number', unit: 'cells/µL', min: 0 },
          { code: 'HIV-CD4-PCT', labelAr: 'نسبة CD4 من اللمفاويات الكلية — تُستخدم للتصنيف فقط إذا كان العدد غير متوفر', type: 'number', unit: '%', min: 0, max: 100 },
          { code: 'HIV-CD4-DATE', labelAr: 'تاريخ عينة CD4', type: 'text' },
        ],
      },
      {
        titleAr: '4) المرحلة النهائية المسجلة',
        items: [
          { code: 'HIV-STAGE-FINAL', labelAr: 'مرحلة HIV للمراقبة وفق CDC 2014', type: 'choice', options: hivStageOptions },
          { code: 'HIV-STAGE-BASIS', labelAr: 'أساس التصنيف: Stage 0 / حالة Stage 3 / CD4 count / CD4 % / معلومات غير كافية', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'أولًا: إذا تحققت معايير Stage 0 ولم ينطبق الاستثناء، فسجّل Stage 0 بغض النظر عن CD4 أو الأمراض المحددة للمراحل الأخرى.',
      'إذا لم تتحقق Stage 0 ووجد مرض محدد للمرحلة 3 وفق CDC، فسجّل Stage 3 بغض النظر عن CD4.',
      'إذا لم ينطبق ما سبق، استخدم CD4 count أولًا. استخدم CD4 percentage فقط عندما يكون العدد مفقودًا.',
      'العمر <1 سنة: Stage 1 إذا CD4 ≥1500 أو، عند غياب العدد، ≥34%؛ Stage 2 إذا 750–1499 أو 26–33%؛ Stage 3 إذا <750 أو <26%.',
      'العمر 1–5 سنوات: Stage 1 إذا CD4 ≥1000 أو ≥30%؛ Stage 2 إذا 500–999 أو 22–29%؛ Stage 3 إذا <500 أو <22%.',
      'العمر ≥6 سنوات: Stage 1 إذا CD4 ≥500 أو ≥26%؛ Stage 2 إذا 200–499 أو 14–25%؛ Stage 3 إذا <200 أو <14%.',
      'إذا لم توجد معلومات كافية عن CD4 ولا مرض محدد للمرحلة 3، ولم تتحقق Stage 0، فسجّل Stage unknown.',
    ],
    interpretationGuardrails: [
      'هذا تصنيف مراقبة وبائية؛ CDC ينص على أنه قد لا يكون مناسبًا لرعاية المريض أو القرار السريري الفردي.',
      'المرحلة تصف حالة في نقطة زمنية ويمكن أن تتغير لاحقًا؛ Stage at diagnosis مفهوم زمني محدد.',
      'لا تستخدم المرحلة لتحديد بدء/إيقاف العلاج المضاد للفيروسات القهقرية أو لحرمان شخص من خدمة.',
      'حافظ على سرية بيانات HIV وفق السياسات المحلية ومعايير أمن البيانات.',
    ],
    stopRules: [
      'لا تصنف من معلومات غير مؤكدة إذا لم يستوف تعريف حالة HIV المؤكدة في نظام المراقبة.',
      'عند تضارب تواريخ الاختبارات أو عدم وضوح Stage 0، راجع تعريف CDC الأصلي بدل التخمين.',
    ],
    officialDownloads: [
      { label: 'CDC — Revised Surveillance Case Definition for HIV Infection, United States, 2014', url: 'https://www.cdc.gov/mmwr/preview/mmwrhtml/rr6303a1.htm', language: 'en', publisher: 'CDC' },
      { label: 'CDC — HIV Data Guidelines and Resources (2014 definition status: Current)', url: 'https://www.cdc.gov/hiv-data/resources/index.html', language: 'en', publisher: 'CDC' },
      { label: 'CDC — Use of Agency Materials', url: 'https://www.cdc.gov/other/agencymaterials.html', language: 'en', publisher: 'CDC' },
    ],
    sourceUrls: [
      'https://www.cdc.gov/mmwr/preview/mmwrhtml/rr6303a1.htm',
      'https://www.cdc.gov/hiv-data/resources/index.html',
      'https://www.cdc.gov/other/agencymaterials.html',
    ],
    lastVerifiedOn: '2026-09-06',
  },

  'kdigo-acute-kidney-injury-stage': {
    slug: 'kdigo-acute-kidney-injury-stage',
    kind: 'clinical-classification',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'تصنيف إصابة الكلى الحادة KDIGO — ورقة تحديد المرحلة',
    titleEn: 'KDIGO Acute Kidney Injury Stage',
    version: 'KDIGO 2012 final guideline staging — current final guideline as of 2026-09-06',
    provenance: 'تستخدم الورقة معايير KDIGO 2012 النهائية المنشورة. في سبتمبر 2026، يعرض موقع KDIGO تحديث AKI/AKD لعام 2026 كمسودة مراجعة عامة يجري إعدادها للنشر؛ لذلك لا تُعامل المسودة كأنها إرشاد نهائي في هذه الأداة.',
    rightsNotice: 'CDISC يدرج KDIGO AKI Stage بحالة Public Domain. لا تنسخ هذه الورقة تصميمات أو جداول ناشر محمية؛ هي تنظيم عربي للمعايير مع روابط إلى KDIGO والمصدر العلمي.',
    intendedUseAr: 'توثيق تعريف ومرحلة AKI بصورة موحدة من الكرياتينين وإدرار البول وفق KDIGO 2012. المرحلة أداة توصيف/خطورة وليست قرارًا علاجيًا مستقلًا.',
    respondentFields: ['الاسم/الرمز', 'التاريخ/الوقت', 'العمر', 'الوزن المستخدم لحساب mL/kg/h', 'السياق السريري', 'اسم الفاحص/المراجع'],
    preflightChecks: [
      'ثبّت baseline creatinine بمرجع موثق قدر الإمكان ولا تختلق قيمة أساسية بلا مبرر.',
      'رتب قيم الكرياتينين زمنيًا لأن تعريف AKI يعتمد على 48 ساعة و7 أيام.',
      'تحقق من دقة قياس إدرار البول والوزن والفترة الزمنية قبل استخدام معيار البول.',
      'إذا تحقق أكثر من معيار فمرحلة AKI هي الأعلى المحققة.',
    ],
    sections: [
      {
        titleAr: 'بيانات الكرياتينين',
        items: [
          { code: 'AKI-BASELINE-SCR', labelAr: 'Serum creatinine الأساسي', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'AKI-CURRENT-SCR', labelAr: 'Serum creatinine الحالي/الأعلى في النافذة', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'AKI-SCR-ABS-RISE', labelAr: 'الزيادة المطلقة خلال 48 ساعة', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'AKI-SCR-RATIO', labelAr: 'النسبة إلى baseline ضمن 7 أيام', type: 'number', unit: '× baseline', min: 0 },
        ],
      },
      {
        titleAr: 'إدرار البول وعوامل Stage 3',
        items: [
          { code: 'AKI-UO-RATE', labelAr: 'معدل إدرار البول', type: 'number', unit: 'mL/kg/h', min: 0 },
          { code: 'AKI-UO-DURATION', labelAr: 'مدة استمرار معدل البول المسجل', type: 'number', unit: 'hours', min: 0 },
          { code: 'AKI-ANURIA', labelAr: 'انقطاع البول (anuria) لمدة ≥12 ساعة', type: 'choice', options: yesNoUnknown },
          { code: 'AKI-RRT', labelAr: 'بدء renal replacement therapy', type: 'choice', options: yesNoUnknown },
          { code: 'AKI-PEDS-EGFR', labelAr: 'إذا كان العمر <18 سنة: eGFR الأدنى', type: 'number', unit: 'mL/min/1.73m²', min: 0 },
        ],
      },
      {
        titleAr: 'المرحلة الموثقة',
        items: [
          { code: 'AKI-STAGE', labelAr: 'KDIGO AKI stage', type: 'choice', options: [
            { labelAr: 'لا تستوفي AKI حسب البيانات المتاحة', value: '0' },
            { labelAr: 'Stage 1', value: '1', score: 1 },
            { labelAr: 'Stage 2', value: '2', score: 2 },
            { labelAr: 'Stage 3', value: '3', score: 3 },
            { labelAr: 'غير قابل للتحديد من البيانات الحالية', value: 'unknown' },
          ] },
          { code: 'AKI-STAGE-BASIS', labelAr: 'المعيار الذي حدد أعلى مرحلة (SCr / urine output / RRT / pediatric eGFR)', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'تعريف AKI في KDIGO 2012 يتحقق بأي من: زيادة SCr ≥0.3 mg/dL (≥26.5 µmol/L) خلال 48 ساعة؛ أو SCr ≥1.5× baseline معروف/مفترض خلال 7 أيام؛ أو urine volume <0.5 mL/kg/h لمدة 6 ساعات.',
      'Stage 1: SCr 1.5–1.9× baseline أو زيادة ≥0.3 mg/dL؛ أو urine output <0.5 mL/kg/h لمدة 6–12 ساعة.',
      'Stage 2: SCr 2.0–2.9× baseline؛ أو urine output <0.5 mL/kg/h لمدة ≥12 ساعة.',
      'Stage 3: SCr ≥3.0× baseline؛ أو SCr ≥4.0 mg/dL (≥353.6 µmol/L)؛ أو بدء renal replacement therapy؛ أو، لمن هم <18 سنة، انخفاض eGFR إلى <35 mL/min/1.73m²؛ أو urine output <0.3 mL/kg/h لمدة ≥24 ساعة؛ أو anuria لمدة ≥12 ساعة.',
      'إذا اختلفت مرحلة الكرياتينين عن مرحلة البول، سجّل أعلى مرحلة محققة واحتفظ بسبب التصنيف.',
    ],
    interpretationGuardrails: [
      'مرحلة KDIGO لا تحدد سبب AKI؛ يجب تقييم السبب والسياق السريري بصورة مستقلة.',
      'لا تستخدم المرحلة وحدها لبدء أو إيقاف غسيل الكلى أو لتحديد جرعة دواء أو خطة سوائل.',
      'مسودة KDIGO 2026 AKI/AKD ليست إرشادًا نهائيًا حتى تاريخ التحقق؛ لا تدمج معاييرها المقترحة داخل جدول 2012 وكأنها نسخة واحدة.',
      'أعد التقييم مع وصول بيانات جديدة؛ AKI ديناميكي وليست الدرجة حكمًا ثابتًا.',
    ],
    stopRules: [
      'فرط بوتاسيوم شديد، حماض شديد، وذمة رئوية، تدهور ديناميكي دموي أو قلة بول مع تدهور سريري تحتاج تقييمًا عاجلًا مستقلًا عن رقم المرحلة.',
      'إذا كانت البيانات الزمنية أو baseline أو إدرار البول غير موثوقة، لا تختلق مرحلة دقيقة؛ سجّل عدم اليقين وراجع المصدر.',
    ],
    officialDownloads: [
      { label: 'KDIGO — Acute Kidney Injury guideline hub', url: 'https://kdigo.org/guidelines/acute-kidney-injury/', language: 'en', publisher: 'KDIGO' },
      { label: 'KDIGO summary — staging table and definitions', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4057151/', language: 'en', publisher: 'Kidney International / PubMed Central' },
    ],
    sourceUrls: [
      'https://kdigo.org/guidelines/acute-kidney-injury/',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC4057151/',
    ],
    lastVerifiedOn: '2026-09-06',
  },

  'ascvd-pooled-cohort-equations-10-year-risk': {
    slug: 'ascvd-pooled-cohort-equations-10-year-risk',
    kind: 'protocol-sheet',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'معادلات Pooled Cohort لخطورة ASCVD لعشر سنوات — ورقة توثيق تاريخية/بحثية',
    titleEn: 'ASCVD 10-Year Risk — Pooled Cohort Equations (PCE) documentation worksheet',
    version: '2013 ACC/AHA Pooled Cohort Equations — legacy in 2026 lipid-guideline context',
    provenance: 'يوثق هذا النموذج متغيرات PCE الأصلية وحدود استخدامها من إرشاد ACC/AHA 2013. في إرشاد اضطراب الدهون ACC/AHA لعام 2026، أوصي باستخدام PREVENT-ASCVD بدل PCE لتوجيه خفض الدهون في الوقاية الأولية المناسبة؛ لذلك لا تنشئ روافد هنا حاسبة علاجية معاصرة.',
    rightsNotice: 'CDISC يدرج ASCVD 10-Year Risk Estimator بحالة Public Domain. روابط الإرشاد الأصلي وتوجيه 2026 تبقى مصادر مرجعية، ولا تعني هذه الصفحة تأييد ACC/AHA لأي تنفيذ من روافد.',
    intendedUseAr: 'توثيق/مراجعة حساب PCE تاريخي في الدراسات والسجلات والبحوث، أو فهم متطلبات النموذج القديم. ليست هذه حاسبة لتقرير علاج خفض الدهون في 2026.',
    respondentFields: ['معرف الحالة/السجل', 'تاريخ القياسات', 'سبب استخدام PCE (بحث/تفسير سجل/مقارنة)', 'مصدر أداة الحساب الأصلية أو البرمجية'],
    preflightChecks: [
      'أكد أن الغرض يتطلب PCE التاريخي؛ للقرارات المعاصرة لخافضات الدهون راجع إرشاد 2026 وPREVENT-ASCVD.',
      'النموذج الأصلي اشتُق لتقدير أول hard ASCVD event لدى أشخاص 40–79 سنة بلا ASCVD سابق في المجموعات المحددة.',
      'لا تفترض صلاحية المعايرة للسكان العرب أو أي مجموعة لم تدخل بصورة كافية في الاشتقاق الأصلي.',
    ],
    sections: [
      {
        titleAr: 'متغيرات PCE الأصلية',
        instructionsAr: 'سجّل القيم التي استخدمت فعليًا في الحساب التاريخي. لا تُجرِ حسابًا تقريبيًا أو معادلة محلية بديلة.',
        items: [
          { code: 'PCE-AGE', labelAr: 'العمر', type: 'number', unit: 'years', min: 0 },
          { code: 'PCE-SEX', labelAr: 'الجنس كما عرّفه النموذج الأصلي', type: 'choice', options: sexOptions },
          { code: 'PCE-RACE', labelAr: 'فئة العرق في النموذج التاريخي', type: 'choice', options: pceRaceOptions },
          { code: 'PCE-TC', labelAr: 'Total cholesterol', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'PCE-HDL', labelAr: 'HDL cholesterol', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'PCE-SBP', labelAr: 'Systolic blood pressure', type: 'number', unit: 'mmHg', min: 0 },
          { code: 'PCE-BP-TREATED', labelAr: 'هل كان ضغط الدم تحت علاج خافض للضغط في النموذج؟', type: 'choice', options: yesNoUnknown },
          { code: 'PCE-DIABETES', labelAr: 'Diabetes', type: 'choice', options: yesNoUnknown },
          { code: 'PCE-SMOKING', labelAr: 'Current smoking', type: 'choice', options: yesNoUnknown },
        ],
      },
      {
        titleAr: 'توثيق النتيجة المحسوبة خارج روافد',
        items: [
          { code: 'PCE-RISK', labelAr: '10-year ASCVD risk الناتج من تنفيذ PCE موثق', type: 'number', unit: '%', min: 0, max: 100 },
          { code: 'PCE-CALCULATOR', labelAr: 'اسم/إصدار أداة الحساب أو المرجع البرمجي المستخدم', type: 'text' },
          { code: 'PCE-NOTE', labelAr: 'ملاحظات المعايرة/السكان/سبب استخدام نموذج legacy', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'PCE الأصلي يستخدم نماذج خاصة بالجنس والعرق التاريخي، ومتغيرات العمر وTotal-C وHDL-C وSBP مع حالة علاج الضغط والسكري والتدخين الحالي.',
      'لإعادة إنتاج نتيجة تاريخية، استخدم معاملات/تنفيذ PCE الأصلي الموثق من إرشاد 2013 أو أداة موثوقة تُصرّح بالإصدار؛ لا تنشئ معاملات مختصرة محلية.',
      'وثق النتيجة ومصدر التنفيذ بدل عرض رقم بلا traceability.',
      'لا تنقل عتبات علاج قديمة تلقائيًا إلى قرار سريري في 2026؛ إرشاد ACC/AHA 2026 يوصي PREVENT-ASCVD بدل PCE لتقدير 10/30 سنوات الذي يوجه LLT في الوقاية الأولية للبالغين المناسبين 30–79 سنة.',
    ],
    interpretationGuardrails: [
      'PCE نموذج احتمالي تاريخي وليس تشخيصًا، ولا يفسر أعراضًا قلبية حادة.',
      'العرق في PCE متغير تاريخي من بنية النموذج، وليس افتراضًا بيولوجيًا صالحًا لكل سكان العالم.',
      'لا تدّعِ أن PCE معاير لسكان الشرق الأوسط وشمال أفريقيا من دون تحقق سكاني مستقل.',
      'للقرارات المعاصرة ارجع إلى الإرشاد الحالي وعوامل التخصيص وإعادة التصنيف بدل استخدام هذه الورقة منفردة.',
    ],
    stopRules: [
      'لا تستخدم هذه الورقة لتأخير تقييم ألم صدري أو أعراض قلبية حادة.',
      'إذا كان الهدف قرار خفض دهون حاليًا، توقف عن استخدام PCE كخيار افتراضي وراجع PREVENT والإرشاد الحالي.',
    ],
    officialDownloads: [
      { label: '2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk — PCE development and implementation', url: 'https://www.jacc.org/doi/10.1016/j.jacc.2013.11.005', language: 'en', publisher: 'ACC/AHA' },
      { label: '2026 ACC/AHA Dyslipidemia Guideline — PREVENT replaces older PCE for current LLT risk assessment', url: 'https://professional.heart.org/en/science-news/2026-guideline-on-the-management-of-dyslipidemia/top-things-to-know', language: 'en', publisher: 'American Heart Association' },
    ],
    sourceUrls: [
      'https://www.jacc.org/doi/10.1016/j.jacc.2013.11.005',
      'https://professional.heart.org/en/science-news/2026-guideline-on-the-management-of-dyslipidemia/top-things-to-know',
    ],
    lastVerifiedOn: '2026-09-06',
  },
};
