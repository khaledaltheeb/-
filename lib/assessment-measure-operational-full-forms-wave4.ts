import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const yesNo: OperationalOption[] = [
  { labelAr: 'لا', value: 'no', score: 0 },
  { labelAr: 'نعم', value: 'yes', score: 1 },
];

const cgiSeverity: OperationalOption[] = [
  { labelAr: '1 — طبيعي؛ غير مريض إطلاقًا', value: '1', score: 1 },
  { labelAr: '2 — على الحد/مرض هامشي', value: '2', score: 2 },
  { labelAr: '3 — مريض بدرجة خفيفة', value: '3', score: 3 },
  { labelAr: '4 — مريض بدرجة متوسطة', value: '4', score: 4 },
  { labelAr: '5 — مريض بدرجة ملحوظة', value: '5', score: 5 },
  { labelAr: '6 — مريض بشدة', value: '6', score: 6 },
  { labelAr: '7 — من بين أشد المرضى مرضًا', value: '7', score: 7 },
  { labelAr: '0 — لم يُقيَّم', value: '0', score: 0 },
];

const cgiImprovement: OperationalOption[] = [
  { labelAr: '1 — تحسن كثيرًا جدًا', value: '1', score: 1 },
  { labelAr: '2 — تحسن كثيرًا', value: '2', score: 2 },
  { labelAr: '3 — تحسن بدرجة طفيفة', value: '3', score: 3 },
  { labelAr: '4 — لا تغيير', value: '4', score: 4 },
  { labelAr: '5 — أسوأ بدرجة طفيفة', value: '5', score: 5 },
  { labelAr: '6 — أسوأ كثيرًا', value: '6', score: 6 },
  { labelAr: '7 — أسوأ كثيرًا جدًا', value: '7', score: 7 },
  { labelAr: '0 — لم يُقيَّم', value: '0', score: 0 },
];

const cgiTherapeuticEffect: OperationalOption[] = [
  { labelAr: '1 — تأثير علاجي ملحوظ: تحسن واسع/هدأة كاملة أو شبه كاملة', value: '1', score: 1 },
  { labelAr: '2 — تأثير متوسط: تحسن واضح/هدأة جزئية', value: '2', score: 2 },
  { labelAr: '3 — تأثير طفيف: تحسن بسيط لا يغير جوهريًا حالة الرعاية', value: '3', score: 3 },
  { labelAr: '4 — دون تغير أو أسوأ', value: '4', score: 4 },
  { labelAr: '0 — لم يُقيَّم', value: '0', score: 0 },
];

const cgiSideEffects: OperationalOption[] = [
  { labelAr: '1 — لا آثار جانبية', value: '1', score: 1 },
  { labelAr: '2 — آثار لا تتداخل بصورة مهمة مع الوظيفة', value: '2', score: 2 },
  { labelAr: '3 — آثار تتداخل بصورة مهمة مع الوظيفة', value: '3', score: 3 },
  { labelAr: '4 — الآثار الجانبية تفوق الأثر العلاجي', value: '4', score: 4 },
  { labelAr: '0 — لم يُقيَّم', value: '0', score: 0 },
];

export const assessmentOperationalFullFormsWave4: Record<string, AssessmentOperationalMaterial> = {
  'child-pugh-classification': {
    slug: 'child-pugh-classification',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'تصنيف تشايلد–بو لشدة مرض الكبد — ورقة الحساب',
    titleEn: 'Child-Pugh Classification',
    version: 'Conventional Child-Pugh — bilirubin/albumin/INR/ascites/encephalopathy',
    provenance: 'CDISC يصنف Child-Pugh ضمن Public Domain. هذه الورقة تستخدم الفئات التقليدية الشائعة: البيليروبين الكلي، الألبومين، INR، الاستسقاء والاعتلال الدماغي الكبدي، كل متغير 1–3 نقاط.',
    rightsNotice: 'Child-Pugh Public Domain وفق CDISC. توجد صيغ تاريخية تستخدم إطالة PT بدل INR أو عتبات بيليروبين مختلفة في بعض الأمراض الركودية؛ لا تخلط النسخ داخل السجل نفسه.',
    intendedUseAr: 'تصنيف شدة القصور الكبدي المزمن إلى Child-Pugh A/B/C كجزء من التقييم السريري والبحثي؛ لا يحدد وحده أهلية الزراعة أو خطة العلاج.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'التشخيص الكبدي', 'توقيت المختبر', 'نسخة/طريقة التخثر المستخدمة'],
    preflightChecks: ['استخدم بيانات سريرية ومخبرية من إطار زمني متقارب ومناسب للسؤال السريري.', 'هذه النسخة تحسب التخثر باستخدام INR؛ إذا كان البروتوكول يستخدم إطالة PT فلا تسجل INR وPT كمتغيرين مستقلين.', 'صنّف الاستسقاء والاعتلال الدماغي وفق حالة المريض والبروتوكول المحدد، مع توثيق العلاج المؤثر.', 'لا تستعمل عتبات البيليروبين التقليدية دون مراجعة إذا كان البروتوكول يحدد نسخة خاصة لمرض ركودي.'],
    sections: [
      {
        titleAr: 'المكونات الخمسة — نقطة واحدة أو نقطتان أو ثلاث لكل مكون',
        items: [
          { code: 'CP-BILI', labelAr: 'البيليروبين الكلي', type: 'choice', options: [
            { labelAr: '1 — أقل من 2 mg/dL', value: '1', score: 1 },
            { labelAr: '2 — من 2 إلى 3 mg/dL', value: '2', score: 2 },
            { labelAr: '3 — أكثر من 3 mg/dL', value: '3', score: 3 },
          ] },
          { code: 'CP-ALB', labelAr: 'ألبومين المصل', type: 'choice', options: [
            { labelAr: '1 — أكثر من 3.5 g/dL', value: '1', score: 1 },
            { labelAr: '2 — من 2.8 إلى 3.5 g/dL', value: '2', score: 2 },
            { labelAr: '3 — أقل من 2.8 g/dL', value: '3', score: 3 },
          ] },
          { code: 'CP-INR', labelAr: 'INR — استخدم هذا أو PT وفق النسخة، لا كليهما', type: 'choice', options: [
            { labelAr: '1 — أقل من 1.7', value: '1', score: 1 },
            { labelAr: '2 — من 1.7 إلى 2.3', value: '2', score: 2 },
            { labelAr: '3 — أكثر من 2.3', value: '3', score: 3 },
          ] },
          { code: 'CP-PT', labelAr: 'بديل تاريخي عند استخدام إطالة زمن البروثرومبين فوق الضبط — لا يُجمع مع INR', type: 'choice', options: [
            { labelAr: '1 — أقل من 4 ثوانٍ', value: '1', score: 1 },
            { labelAr: '2 — من 4 إلى 6 ثوانٍ', value: '2', score: 2 },
            { labelAr: '3 — أكثر من 6 ثوانٍ', value: '3', score: 3 },
          ], noteAr: 'اختر طريقة التخثر المحددة في نسختك: INR أو PT prolongation. احتساب الاثنين معًا خطأ.' },
          { code: 'CP-ASCITES', labelAr: 'الاستسقاء', type: 'choice', options: [
            { labelAr: '1 — لا يوجد', value: '1', score: 1 },
            { labelAr: '2 — خفيف/مضبوط بالعلاج', value: '2', score: 2 },
            { labelAr: '3 — متوسط إلى شديد/مقاوم أو سيئ الضبط', value: '3', score: 3 },
          ] },
          { code: 'CP-HE', labelAr: 'الاعتلال الدماغي الكبدي', type: 'choice', options: [
            { labelAr: '1 — لا يوجد', value: '1', score: 1 },
            { labelAr: '2 — الدرجة I–II أو مضبوط وفق النسخة', value: '2', score: 2 },
            { labelAr: '3 — الدرجة III–IV أو مقاوم وفق النسخة', value: '3', score: 3 },
          ] },
        ],
      },
      { titleAr: 'النتيجة النهائية', items: [
        { code: 'CP-TOTAL', labelAr: 'المجموع — خمسة مكونات فقط', type: 'number', min: 5, max: 15, unit: 'نقطة' },
        { code: 'CP-CLASS', labelAr: 'الفئة', type: 'choice', options: [
          { labelAr: 'A — 5–6 نقاط', value: 'A' },
          { labelAr: 'B — 7–9 نقاط', value: 'B' },
          { labelAr: 'C — 10–15 نقطة', value: 'C' },
        ] },
      ] },
    ],
    scoringSteps: ['اجمع خمس درجات فقط: البيليروبين + الألبومين + طريقة تخثر واحدة (INR أو PT) + الاستسقاء + الاعتلال الدماغي.', 'النطاق 5–15: الفئة A = 5–6، B = 7–9، C = 10–15.', 'لا تحسب INR وPT معًا؛ هما بديلان بحسب نسخة التصنيف.', 'وثق النسخة عندما تستخدم عتبات مختلفة للبيليروبين أو تعريفات سريرية مختلفة للسيطرة على الاستسقاء/الاعتلال الدماغي.'],
    interpretationGuardrails: ['المقياس يتضمن عنصرين سريريين ذاتيي التقدير نسبيًا (الاستسقاء والاعتلال الدماغي).', 'العلاج المدر للبول أو اللاكتولوز/الريفاإكسيمين وغيرها قد يغير المظهر السريري.', 'لا تستخدم Child-Pugh وحده لتحديد أهلية زراعة الكبد أو الجرعات أو الإجراء الغازي؛ قد تكون أنظمة أخرى مطلوبة حسب السياق.'],
    stopRules: ['الاعتلال الدماغي الحاد، النزف، الصدمة، الإنتان، الفشل الكلوي أو تدهور كبدي سريع يحتاج تقييمًا عاجلًا مستقلًا عن الفئة.'],
    officialDownloads: [{ label: 'CDISC QRS — Child-Pugh Classification, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/child-pugh-classification', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/child-pugh-classification', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9841300/'],
    lastVerifiedOn: '2026-09-06',
  },

  'bode-index': {
    slug: 'bode-index',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مؤشر BODE لمرض الانسداد الرئوي المزمن — ورقة الحساب',
    titleEn: 'BODE Index',
    version: 'Original BODE 0–10 framework — Celli et al. 2004 / CDISC QRS',
    provenance: 'CDISC يصنف BODE Index ضمن Public Domain. يتكون من BMI، FEV1 كنسبة من المتوقع، mMRC، ومسافة اختبار المشي ست دقائق 6MWD.',
    rightsNotice: 'BODE Public Domain وفق CDISC. هذه الورقة تعيد بناء جدول النقاط الأصلي؛ لا تنسب توقع بقاء فردي دقيق دون الرجوع إلى مجتمع ومدة المتابعة والنموذج المناسب.',
    intendedUseAr: 'تجميع أربعة أبعاد في COPD — كتلة الجسم، انسداد مجرى الهواء، ضيق النفس والقدرة على التمرين — في درجة 0–10 لدعم توصيف الخطورة والمتابعة.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'الفاحص', 'تشخيص COPD واستقراره', 'مرجع معادلة FEV1 المتوقعة', 'بروتوكول 6MWT'],
    preflightChecks: ['يجب أن يكون FEV1 كنسبة مئوية من المتوقع وبقياس سبيرومتري صالح.', 'طبق mMRC 0–4 بالصيغة نفسها المستخدمة في مكتبة روافد.', 'نفذ 6MWT وفق بروتوكول ثابت وآمن وسجل المسافة بالمتر.', 'احسب BMI بالكيلوغرام/م² من قياسات مناسبة.', 'لا تفسر BODE أثناء تفاقم حاد كما لو كان خط أساس مستقرًا.'],
    sections: [
      { titleAr: 'المكونات ونقاط BODE', items: [
        { code: 'BODE-BMI-RAW', labelAr: 'BMI الخام', type: 'number', min: 5, max: 100, unit: 'kg/m²' },
        { code: 'BODE-BMI', labelAr: 'نقاط BMI', type: 'choice', options: [
          { labelAr: '0 — أكبر من 21 kg/m²', value: '0', score: 0 },
          { labelAr: '1 — 21 kg/m² أو أقل', value: '1', score: 1 },
        ] },
        { code: 'BODE-FEV1-RAW', labelAr: 'FEV1 كنسبة من المتوقع', type: 'number', min: 0, max: 200, unit: '%' },
        { code: 'BODE-FEV1', labelAr: 'نقاط انسداد مجرى الهواء', type: 'choice', options: [
          { labelAr: '0 — FEV1 ≥65% من المتوقع', value: '0', score: 0 },
          { labelAr: '1 — 50–64%', value: '1', score: 1 },
          { labelAr: '2 — 36–49%', value: '2', score: 2 },
          { labelAr: '3 — ≤35%', value: '3', score: 3 },
        ] },
        { code: 'BODE-MMRC-RAW', labelAr: 'درجة mMRC الخام', type: 'number', min: 0, max: 4, unit: '0–4' },
        { code: 'BODE-MMRC', labelAr: 'نقاط ضيق النفس', type: 'choice', options: [
          { labelAr: '0 — mMRC 0–1', value: '0', score: 0 },
          { labelAr: '1 — mMRC 2', value: '1', score: 1 },
          { labelAr: '2 — mMRC 3', value: '2', score: 2 },
          { labelAr: '3 — mMRC 4', value: '3', score: 3 },
        ] },
        { code: 'BODE-6MWD-RAW', labelAr: 'مسافة 6MWT الخام', type: 'distance', min: 0, max: 1500, unit: 'متر' },
        { code: 'BODE-6MWD', labelAr: 'نقاط القدرة على التمرين', type: 'choice', options: [
          { labelAr: '0 — ≥350 متر', value: '0', score: 0 },
          { labelAr: '1 — 250–349 متر', value: '1', score: 1 },
          { labelAr: '2 — 150–249 متر', value: '2', score: 2 },
          { labelAr: '3 — ≤149 متر', value: '3', score: 3 },
        ] },
        { code: 'BODE-TOTAL', labelAr: 'مجموع BODE', type: 'number', min: 0, max: 10, unit: '0–10' },
      ] },
    ],
    scoringSteps: ['حوّل كل مكون إلى نقاط وفق الجدول ثم اجمعها: BMI 0–1، FEV1 0–3، mMRC 0–3، 6MWD 0–3.', 'النطاق الكلي 0–10؛ الدرجة الأعلى ارتبطت تاريخيًا بخطر وفيات أعلى.', 'استخدم القيم الخام بجانب النقاط حتى يمكن تدقيق الحساب وإعادة التحليل.', 'يمكن وصف رباعيات 0–2، 3–4، 5–6، 7–10 في بعض الأدبيات، لكنها ليست بديلًا عن تقدير خطر فردي حديث.'],
    interpretationGuardrails: ['BODE مؤشر إنذاري متعدد الأبعاد وليس تشخيصًا لـCOPD.', 'لا تحول الدرجة إلى نسبة بقاء فردية ثابتة خارج نموذج/مدة متابعة محددة.', 'الأكسجين، التأهيل، التقنية السبيرومترية وبروتوكول المشي قد تؤثر في المكونات.', 'فسر التغير مع السياق السريري والإرشادات الحالية.'],
    stopRules: ['تفاقم COPD حاد، ألم صدري، نقص أكسجة مقلق، دوخة/إغماء أو ضيق نفس غير آمن يتقدم على استكمال 6MWT أو حساب BODE.'],
    officialDownloads: [{ label: 'CDISC QRS — BODE Index, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2706601/'],
    lastVerifiedOn: '2026-09-06',
  },

  'harvey-bradshaw-index': {
    slug: 'harvey-bradshaw-index',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مؤشر هارفي–برادشو لنشاط داء كرون — HBI',
    titleEn: 'Harvey-Bradshaw Index',
    version: 'Five-domain HBI / CDISC QRS v1.0',
    provenance: 'CDISC يصنف HBI ضمن Public Domain. يتكون من الرفاه العام، ألم البطن، عدد مرات البراز السائل في اليوم السابق، كتلة البطن، وثمانية اختلاطات — نقطة لكل اختلاط موجود.',
    rightsNotice: 'HBI Public Domain وفق CDISC. لا تخلط HBI الكامل مع partial/modified HBI التي تحذف بعض المكونات.',
    intendedUseAr: 'تقدير نشاط أعراض داء كرون سريريًا ومتابعة التغير باستخدام مؤشر مبسط؛ لا يقيس الالتهاب المخاطي مباشرة ولا يستبدل المؤشرات الحيوية أو التنظير.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'اليوم المرجعي للأعراض', 'الجراحة السابقة/فغرة إن وجدت', 'العلاج الحالي'],
    preflightChecks: ['بالنسبة للرفاه والألم وعدد مرات البراز السائل استخدم اليوم السابق وفق النسخة القياسية.', 'عدد مرات البراز السائل = عدد فعلي، وكل مرة تضيف نقطة واحدة؛ لا تحوله إلى فئات ما لم تستخدم نسخة معدلة معلنة.', 'افحص كتلة البطن فقط عندما يكون الفحص مناسبًا وآمنًا.', 'لا تستخدم HBI المعدل أو الجزئي ثم تسميه HBI كاملًا.'],
    sections: [
      { titleAr: 'المكونات الخمسة', items: [
        { code: 'HBI-WELL', labelAr: 'الرفاه العام في اليوم السابق', type: 'choice', options: [
          { labelAr: '0 — جيد جدًا', value: '0', score: 0 },
          { labelAr: '1 — أقل قليلًا من المعتاد', value: '1', score: 1 },
          { labelAr: '2 — سيئ', value: '2', score: 2 },
          { labelAr: '3 — سيئ جدًا', value: '3', score: 3 },
          { labelAr: '4 — بالغ السوء', value: '4', score: 4 },
        ] },
        { code: 'HBI-PAIN', labelAr: 'ألم البطن في اليوم السابق', type: 'choice', options: [
          { labelAr: '0 — لا يوجد', value: '0', score: 0 },
          { labelAr: '1 — خفيف', value: '1', score: 1 },
          { labelAr: '2 — متوسط', value: '2', score: 2 },
          { labelAr: '3 — شديد', value: '3', score: 3 },
        ] },
        { code: 'HBI-STOOLS', labelAr: 'عدد مرات البراز السائل/شديد الليونة في اليوم السابق — الدرجة تساوي العدد', type: 'number', min: 0, max: 100, unit: 'مرة = نقطة لكل مرة' },
        { code: 'HBI-MASS', labelAr: 'كتلة البطن', type: 'choice', options: [
          { labelAr: '0 — لا توجد', value: '0', score: 0 },
          { labelAr: '1 — مشكوك فيها', value: '1', score: 1 },
          { labelAr: '2 — مؤكدة', value: '2', score: 2 },
          { labelAr: '3 — مؤكدة ومؤلمة بالجس', value: '3', score: 3 },
        ] },
      ] },
      { titleAr: 'الاختلاطات — نقطة واحدة لكل اختلاط موجود', items: [
        { code: 'HBI-C-ARTHRALGIA', labelAr: 'ألم مفاصل/Arthralgia', type: 'choice', options: yesNo },
        { code: 'HBI-C-UVEITIS', labelAr: 'التهاب العنبية', type: 'choice', options: yesNo },
        { code: 'HBI-C-ERYTHEMA', labelAr: 'الحمامى العقدة', type: 'choice', options: yesNo },
        { code: 'HBI-C-APHTHOUS', labelAr: 'قرحات فموية قلاعية', type: 'choice', options: yesNo },
        { code: 'HBI-C-PYODERMA', labelAr: 'تقيح الجلد الغنغريني', type: 'choice', options: yesNo },
        { code: 'HBI-C-FISSURE', labelAr: 'شق شرجي', type: 'choice', options: yesNo },
        { code: 'HBI-C-FISTULA', labelAr: 'ناسور جديد', type: 'choice', options: yesNo },
        { code: 'HBI-C-ABSCESS', labelAr: 'خراج', type: 'choice', options: yesNo },
      ] },
      { titleAr: 'النتيجة', items: [{ code: 'HBI-TOTAL', labelAr: 'المجموع الكلي', type: 'number', min: 0, unit: 'نقطة' }] },
    ],
    scoringSteps: ['المجموع = الرفاه + ألم البطن + عدد مرات البراز السائل + درجة كتلة البطن + نقطة لكل اختلاط موجود.', 'لا يوجد حد أعلى ثابت منطقيًا لعنصر عدد مرات البراز؛ لذلك لا تفرض سقفًا مصطنعًا للمجموع.', 'التفسير الشائع: <5 هدأة سريرية؛ 5–7 نشاط خفيف؛ 8–16 نشاط متوسط؛ >16 نشاط شديد، مع وجود اختلافات بين الدراسات.', 'الاستجابة السريرية في بعض الدراسات تُعرّف بانخفاض نحو 3 نقاط أو أكثر؛ استخدم تعريف البروتوكول المحدد.'],
    interpretationGuardrails: ['HBI يقيس النشاط السريري للأعراض ولا يثبت أو ينفي الالتهاب المعوي النشط.', 'الفغرة أو الاستئصال السابق قد يغيّران معنى تكرار البراز والمكونات.', 'لا تستبدل به CRP أو calprotectin أو التنظير عندما تكون هذه البيانات مطلوبة.', 'ثبّت ما إذا كنت تستخدم HBI الكامل أو نسخة معدلة.'],
    stopRules: ['اشتباه انسداد، خراج/إنتان، نزف شديد، ألم بطني حاد أو تدهور جهازي يحتاج تقييمًا عاجلًا مستقلًا عن HBI.'],
    officialDownloads: [{ label: 'CDISC QRS — Harvey-Bradshaw Index, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/harvey-bradshaw-index', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/harvey-bradshaw-index', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6334085/'],
    lastVerifiedOn: '2026-09-06',
  },

  'rutgeerts-score': {
    slug: 'rutgeerts-score',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'درجة روتغيرتس للنكس التنظيري بعد جراحة داء كرون',
    titleEn: 'Rutgeerts Score',
    version: 'Original i0–i4 plus explicitly separated modified i2a/i2b',
    provenance: 'CDISC يصنف Rutgeerts Score ضمن Public Domain. الدرجة الأصلية i0–i4 تقيس الموجودات التنظيرية بعد الاستئصال اللفائفي القولوني؛ النسخة المعدلة تفصل i2 إلى i2a وi2b ويجب ألا تخلط معها.',
    rightsNotice: 'Rutgeerts Public Domain وفق CDISC. هذه الورقة تعرض التصنيف الأصلي، ثم حقلًا منفصلًا للنسخة المعدلة عند استخدامها؛ لا تحول i2a/i2b إلى درجات رقمية جديدة.',
    intendedUseAr: 'توحيد وصف النكس التنظيري بعد جراحة داء كرون في اللفائفي النهائي/المفاغرة اللفائفية القولونية ومتابعة الخطر ضمن سياق متخصص.',
    respondentFields: ['الاسم/الرمز', 'تاريخ التنظير', 'الفاحص/قارئ التنظير', 'تاريخ ونوع الجراحة', 'الفترة منذ الاستئصال', 'نوع التصنيف: أصلي أم معدل'],
    preflightChecks: ['يُطبق في السياق المناسب بعد جراحة داء كرون، وليس كنظام عام لكل تنظير كرون.', 'حدد قبل التسجيل هل تستخدم Rutgeerts الأصلي أم modified Rutgeerts.', 'راجع اللفائفي الجديد والمفاغرة وموضع الآفات بدقة.', 'وثق جودة الفحص وأي تضيق يمنع التقييم الكامل.'],
    sections: [
      { titleAr: 'Rutgeerts الأصلي — اختر فئة واحدة فقط', items: [{
        code: 'RUT-ORIGINAL', labelAr: 'الدرجة الأصلية', type: 'choice', options: [
          { labelAr: 'i0 — لا توجد آفات', value: 'i0' },
          { labelAr: 'i1 — خمس آفات قلاعية أو أقل في اللفائفي الجديد', value: 'i1' },
          { labelAr: 'i2 — أكثر من خمس آفات قلاعية مع مخاطية طبيعية بينها، أو مناطق متقطعة من آفات أكبر، أو آفات محصورة بالمفاغرة اللفائفية القولونية', value: 'i2' },
          { labelAr: 'i3 — التهاب لفائفي قلاعي منتشر مع مخاطية ملتهبة بصورة منتشرة', value: 'i3' },
          { labelAr: 'i4 — التهاب منتشر مع قرحات كبيرة و/أو عقيدات و/أو تضيق في اللفائفي الجديد', value: 'i4' },
        ]
      }] },
      { titleAr: 'Modified Rutgeerts — استخدمه فقط إذا كان البروتوكول يعتمد النسخة المعدلة', items: [{
        code: 'RUT-MODIFIED', labelAr: 'الفئة المعدلة', type: 'choice', options: [
          { labelAr: 'i0 — لا توجد آفات', value: 'i0' },
          { labelAr: 'i1 — خمس آفات قلاعية أو أقل', value: 'i1' },
          { labelAr: 'i2a — آفات محصورة بالمفاغرة اللفائفية القولونية، مع/دون تضيق مفاغري بحسب التعريف المستخدم', value: 'i2a' },
          { labelAr: 'i2b — أكثر من خمس آفات قلاعية أو آفات أكبر في اللفائفي الجديد مع مخاطية طبيعية بينها، مع/دون آفات مفاغرية', value: 'i2b' },
          { labelAr: 'i3 — التهاب لفائفي قلاعي منتشر مع مخاطية ملتهبة بصورة منتشرة', value: 'i3' },
          { labelAr: 'i4 — التهاب منتشر شديد مع قرحات كبيرة و/أو عقيدات و/أو تضيق', value: 'i4' },
        ]
      }] },
    ],
    scoringSteps: ['سجل تصنيفًا واحدًا وفق النسخة المحددة مسبقًا.', 'في النسخة الأصلية: i0، i1، i2، i3، i4. لا يوجد مجموع جمعي.', 'في النسخة المعدلة فقط تُفصل i2 إلى i2a (مفاغري) وi2b (لفائفي جديد).', 'لا تقارن i2 الأصلي مباشرة بـi2a أو i2b دون توضيح نظام التصنيف المستخدم.'],
    interpretationGuardrails: ['الدرجة تنبؤية/وصفية للنكس بعد الجراحة وليست تشخيصًا شاملًا لنشاط كرون.', 'هناك جدل وأدلة متطورة حول الدلالة النسبية لـi2a مقابل i2b؛ لا تقدم روافد قيمة إنذارية ثابتة بلا سياق.', 'تعتمد الموثوقية على جودة التنظير وخبرة المقيم وتعريف الآفات.', 'قرارات العلاج بعد الجراحة يجب أن تدمج عوامل الخطر والأعراض والمؤشرات الحيوية والإرشادات الحالية.'],
    stopRules: ['وجود تضيق شديد، نزف أو مضاعفة تنظيرية/جراحية يستوجب المسار السريري المناسب ولا يُختزل في درجة Rutgeerts.'],
    officialDownloads: [{ label: 'CDISC QRS — Rutgeerts Score, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/rutgeerts-score', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/rutgeerts-score', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9693828/', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10779955/'],
    lastVerifiedOn: '2026-09-06',
  },

  'cdc-hiv-surveillance-stage-2014': {
    slug: 'cdc-hiv-surveillance-stage-2014',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'مرحلة عدوى HIV للمراقبة الوبائية — CDC 2014',
    titleEn: 'CDC Revised Surveillance Case Definition for HIV Infection — 2014 Stage',
    version: 'CDC 2014 surveillance stages 0, 1, 2, 3, unknown',
    provenance: 'مراكز مكافحة الأمراض والوقاية منها CDC نشرت تعريف المراقبة المنقح لعام 2014 كعمل اتحادي رسمي، ويصنف الحالات المؤكدة إلى المرحلة 0 أو 1 أو 2 أو 3 أو غير معروفة. CDISC يصنف كذلك نظام CDC لتصنيف HIV ضمن Public Domain.',
    rightsNotice: 'المصدر الأساسي لهذه الورقة هو CDC MMWR 2014. الغرض مراقبة الصحة العامة وليس إدارة العلاج الفردي. بيانات HIV معلومات صحية شديدة الحساسية وتتطلب حماية مناسبة.',
    intendedUseAr: 'تطبيق قواعد مرحلة HIV للمراقبة الوبائية وفق تعريف CDC 2014، بما في ذلك المرحلة 0 للعدوى المبكرة والعتبات العمرية لـCD4.',
    respondentFields: ['معرف مراقبة غير مباشر', 'تاريخ التشخيص المؤكد', 'العمر في تاريخ اختبار CD4', 'تاريخ/نتيجة الاختبار السلبي أو غير الحاسم السابق إن وجد', 'تاريخ CD4', 'جهة/سياق المراقبة'],
    preflightChecks: ['يجب أولًا استيفاء تعريف حالة HIV مؤكدة وفق النظام المناسب؛ هذه الورقة لا تثبت التشخيص من تلقاء نفسها.', 'تحقق أولًا من معيار المرحلة 0 لأنه يسبق معايير المراحل الأخرى.', 'استخدم عدد CD4 أولًا؛ النسبة المئوية تستخدم فقط إذا كان العدد مفقودًا.', 'تحقق من وجود حالة انتهازية معرّفة للمرحلة 3 إذا لم تنطبق المرحلة 0.', 'احمِ الهوية والوصول إلى بيانات HIV وفق القانون والسياسة المحلية.'],
    sections: [
      { titleAr: 'المرحلة 0 — عدوى مبكرة', items: [
        { code: 'HIV0-NEG180', labelAr: 'اختبار HIV سلبي أو غير حاسم خلال 180 يومًا قبل أول اختبار إيجابي مؤكد؟', type: 'choice', options: yesNo },
        { code: 'HIV0-ALGO', labelAr: 'هل تسلسل خوارزمية الاختبار يثبت علامة فيروسية نوعية لـHIV خلال 0–180 يومًا قبل/بعد اختبار أضداد سلبي أو غير حاسم؟', type: 'choice', options: yesNo },
        { code: 'HIV0-PRIOR-EVIDENCE', labelAr: 'هل توجد أدلة عدوى HIV أقدم بأكثر من 60 يومًا من الاختبار السلبي/غير الحاسم المستخدم لإثبات المرحلة 0؟', type: 'choice', options: yesNo, noteAr: 'إذا نعم، فإن ذلك الاختبار السلبي/غير الحاسم لا يثبت المرحلة 0 وفق الاستثناء المحدد في CDC.' },
      ] },
      { titleAr: 'البيانات المرحلية الأخرى', items: [
        { code: 'HIV-AGE-GROUP', labelAr: 'الفئة العمرية في تاريخ CD4', type: 'choice', options: [
          { labelAr: 'أقل من سنة', value: 'lt1' },
          { labelAr: '1–5 سنوات', value: '1-5' },
          { labelAr: '6 سنوات فأكثر', value: 'ge6' },
        ] },
        { code: 'HIV-CD4-COUNT', labelAr: 'عدد خلايا CD4+', type: 'number', min: 0, max: 10000, unit: 'خلية/µL' },
        { code: 'HIV-CD4-PCT', labelAr: 'نسبة CD4+ من اللمفاويات — تستخدم فقط إذا كان العدد مفقودًا', type: 'number', min: 0, max: 100, unit: '%' },
        { code: 'HIV-STAGE3-OI', labelAr: 'هل شُخّصت حالة انتهازية محددة للمرحلة 3 وفق ملحق CDC؟', type: 'choice', options: yesNo },
      ] },
      { titleAr: 'المرحلة النهائية للمراقبة', items: [{
        code: 'HIV-STAGE-FINAL', labelAr: 'مرحلة CDC 2014', type: 'choice', options: [
          { labelAr: '0 — عدوى مبكرة وفق معايير المرحلة 0', value: '0' },
          { labelAr: '1', value: '1' },
          { labelAr: '2', value: '2' },
          { labelAr: '3 — AIDS ضمن تعريف المراقبة', value: '3' },
          { labelAr: 'غير معروفة', value: 'unknown' },
        ]
      }] },
    ],
    scoringSteps: ['أولًا: إذا استوفت الحالة معيار المرحلة 0 الصحيح ولم ينطبق الاستثناء، فالمرحلة 0 تتقدم على معايير CD4 والحالات المحددة للمرحلة 3 عند ذلك الزمن.', 'إذا مضى أكثر من 180 يومًا بعد مرحلة 0 عند التشخيص وتريد مرحلة في تاريخ لاحق، أعد التصنيف حينها إلى 1 أو 2 أو 3 أو غير معروفة حسب البيانات.', 'إذا لم تنطبق المرحلة 0 ووجدت حالة انتهازية محددة للمرحلة 3، فالمرحلة 3 بغض النظر عن CD4.', 'إذا لم تنطبق المرحلة 0 ولا حالة المرحلة 3، استخدم عدد CD4. إذا كان العدد مجهولًا فقط عندئذ استخدم النسبة.', 'للعمر ≥6 سنوات: المرحلة 1 إذا CD4 ≥500 أو، عند غياب العدد، ≥26%؛ المرحلة 2 إذا 200–499 أو 14–25%؛ المرحلة 3 إذا <200 أو <14%.', 'للعمر 1–5 سنوات: المرحلة 1 ≥1000 أو ≥30%؛ المرحلة 2 = 500–999 أو 22–29%؛ المرحلة 3 <500 أو <22%.', 'للعمر <1 سنة: المرحلة 1 ≥1500 أو ≥34%؛ المرحلة 2 = 750–1499 أو 26–33%؛ المرحلة 3 <750 أو <26%.', 'إذا لم توجد بيانات CD4 ولا حالة مرحلة 3 ولا مرحلة 0 صحيحة، سجل المرحلة غير معروفة.'],
    interpretationGuardrails: ['هذا نظام مراقبة سكانية؛ CDC ينص صراحة على أنه غير مناسب كدليل لإدارة المريض الفردية.', 'لا تستخدم CDC HIV surveillance stage لتحديد بدء العلاج أو وقفه أو تأخيره.', 'المرحلة عند التشخيص والمرحلة في تاريخ لاحق مفهومان مختلفان، والمرحلة يمكن أن تتغير لاحقًا.', 'بيانات HIV حساسة؛ استخدم أقل قدر من البيانات التعريفية واحمِ الوصول والسجلات.'],
    stopRules: ['أي حالة سريرية حادة أو عدوى انتهازية أو تدهور يستلزم رعاية سريرية مستقلة عن مهمة الترميز الوبائي.'],
    officialDownloads: [
      { label: 'CDC MMWR — Revised Surveillance Case Definition for HIV Infection, United States, 2014', url: 'https://www.cdc.gov/mmwr/preview/mmwrhtml/rr6303a1.htm', language: 'en', publisher: 'CDC' },
      { label: 'CDISC QRS — CDC HIV Classification, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/cdc-classification-system-hiv-infected-adults-and-adolescents', language: 'en', publisher: 'CDISC' },
    ],
    sourceUrls: ['https://www.cdc.gov/mmwr/preview/mmwrhtml/rr6303a1.htm', 'https://www.cdisc.org/standards/foundational/qrs/cdc-classification-system-hiv-infected-adults-and-adolescents'],
    lastVerifiedOn: '2026-09-06',
  },

  'clinical-global-impression': {
    slug: 'clinical-global-impression',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس الانطباع السريري العالمي — CGI',
    titleEn: 'Clinical Global Impression',
    version: 'Original CGI framework — Severity, Improvement, Efficacy Index',
    provenance: 'CGI أداة NIMH تاريخية بثلاثة مكونات: شدة المرض CGI-S، التحسن العالمي CGI-I، ومؤشر الفعالية CGI-E. CDISC يصنف CGI ضمن Public Domain. تعرض هذه الورقة المكونات الثلاثة مع إبقاء CGI-E منفصلًا إلى الأثر العلاجي والآثار الجانبية.',
    rightsNotice: 'CGI Public Domain وفق CDISC. المراسي المطورة خصيصًا لمرض أو دراسة من جهات أخرى قد تكون أعمالًا مشتقة منفصلة؛ لا تنسبها إلى CGI الأصلي.',
    intendedUseAr: 'تقدير عالمي مختصر من اختصاصي لشدة الحالة، تغيرها عن خط الأساس، وموازنة أثر الدواء وآثاره الجانبية عندما يكون CGI-E مناسبًا.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'الاضطراب/المشكلة المستهدفة', 'خط الأساس المرجعي لـCGI-I', 'العلاج/الدواء المرجعي لـCGI-E'],
    preflightChecks: ['حدد بوضوح الاضطراب أو المجال الذي يدور حوله الانطباع العالمي.', 'CGI-S يقارن شدة المريض بمرضى مشابهين/السياق السريري، لا بمجرد زيارة سابقة.', 'CGI-I يقارن بالحالة عند خط الأساس المحدد، وليس بالزيارة السابقة تلقائيًا.', 'CGI-E يُستخدم على أساس أثر الدواء فقط عندما يكون ذلك ذا معنى؛ لا تجبره على سياق لا يوجد فيه تدخل دوائي.'],
    sections: [
      { titleAr: 'CGI-S — شدة المرض الحالية', items: [{ code: 'CGI-S', labelAr: 'ما شدة المرض الحالية بصورة عالمية؟', type: 'choice', options: cgiSeverity }] },
      { titleAr: 'CGI-I — التحسن العالمي مقارنة بخط الأساس', items: [{ code: 'CGI-I', labelAr: 'مقارنة بالحالة عند خط الأساس، ما مقدار التغير العام؟', type: 'choice', options: cgiImprovement }] },
      { titleAr: 'CGI-E — مؤشر الفعالية على أساس أثر الدواء فقط', items: [
        { code: 'CGI-E-TE', labelAr: 'الأثر العلاجي', type: 'choice', options: cgiTherapeuticEffect },
        { code: 'CGI-E-SE', labelAr: 'الآثار الجانبية', type: 'choice', options: cgiSideEffects },
        { code: 'CGI-E-16', labelAr: 'ترميز الخلية 1–16 إذا كان البروتوكول يستخدم المصفوفة الأصلية', type: 'number', min: 1, max: 16, unit: 'خلية' },
      ] },
    ],
    scoringSteps: ['CGI-S: 1 طبيعي/غير مريض إلى 7 من أشد المرضى مرضًا؛ 0 = لم يُقيّم عند استخدام ترميز يسمح بذلك.', 'CGI-I: 1 تحسن كثيرًا جدًا، 2 تحسن كثيرًا، 3 تحسن قليلًا، 4 لا تغيير، 5 أسوأ قليلًا، 6 أسوأ كثيرًا، 7 أسوأ كثيرًا جدًا؛ 0 = لم يُقيّم.', 'CGI-E: سجل الأثر العلاجي 1–4 والآثار الجانبية 1–4 منفصلين. إذا كان بروتوكولك يستخدم ترميز المصفوفة 1–16: الخلية = (درجة الأثر العلاجي − 1) × 4 + درجة الآثار الجانبية.', 'لا تجمع CGI-S وCGI-I وCGI-E في مجموع كلي واحد.'],
    interpretationGuardrails: ['CGI تقدير عالمي يعتمد على حكم المقيم وقد يتأثر بخبرة الفاحص ومعرفته بالمريض.', 'ثبّت المشكلة المستهدفة وخط الأساس وتعريفات التدريب لرفع الموثوقية.', 'لا تستبدل CGI بمقياس أعراض نوعي عندما يلزم قياس تفصيلي.', 'تجنب إدخال أحداث غير متعلقة بالاضطراب المستهدف في تقييم CGI-S/CGI-I بطريقة تشوه قياس الفعالية.'],
    stopRules: ['ظهور خطر انتحار/عنف أو تدهور طبي/نفسي حاد يحتاج تقييم سلامة مباشرًا مستقلًا عن CGI.'],
    officialDownloads: [
      { label: 'CDISC QRS — Clinical Global Impression, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/clinical-global-impression', language: 'en', publisher: 'CDISC' },
      { label: 'NIH NDA — CGI data structure including original efficacy matrix coding', url: 'https://nda.nih.gov/data-structure/cgi01', language: 'en', publisher: 'NIH' },
    ],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/clinical-global-impression', 'https://nda.nih.gov/data-structure/cgi01', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2880930/'],
    lastVerifiedOn: '2026-09-06',
  },
};
