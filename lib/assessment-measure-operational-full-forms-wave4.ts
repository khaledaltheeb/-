import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const yesNoUnknown: OperationalOption[] = [
  { labelAr: 'نعم', value: 'yes' },
  { labelAr: 'لا', value: 'no' },
  { labelAr: 'غير معروف / غير موثق', value: 'unknown' },
];

const hivAgeBands: OperationalOption[] = [
  { labelAr: 'أقل من سنة', value: 'lt1' },
  { labelAr: '1–5 سنوات', value: '1to5' },
  { labelAr: '6 سنوات فأكثر', value: 'gte6' },
];

const hivStages: OperationalOption[] = [
  { labelAr: 'Stage 0 — عدوى مبكرة', value: '0', score: 0 },
  { labelAr: 'Stage 1', value: '1', score: 1 },
  { labelAr: 'Stage 2', value: '2', score: 2 },
  { labelAr: 'Stage 3', value: '3', score: 3 },
  { labelAr: 'Stage unknown — غير معروفة', value: 'unknown' },
];

const pceSex: OperationalOption[] = [
  { labelAr: 'أنثى — كما صيغ النموذج الأصلي', value: 'female' },
  { labelAr: 'ذكر — كما صيغ النموذج الأصلي', value: 'male' },
];

const pceRace: OperationalOption[] = [
  { labelAr: 'Black / African-American — فئة النموذج التاريخي', value: 'black' },
  { labelAr: 'White — فئة النموذج التاريخي', value: 'white' },
  { labelAr: 'فئة أخرى — لم تُشتق لها معادلة PCE مستقلة في النموذج الأصلي', value: 'other' },
];

export const assessmentOperationalFullFormsWave4: Record<string, AssessmentOperationalMaterial> = {
  'cdc-hiv-surveillance-stage-2014': {
    slug: 'cdc-hiv-surveillance-stage-2014',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'تصنيف مرحلة عدوى HIV للمراقبة الوبائية — CDC 2014',
    titleEn: 'CDC Revised Surveillance Case Definition for HIV Infection — 2014 Stage',
    version: 'CDC 2014 surveillance stages 0, 1, 2, 3, unknown',
    provenance: 'ورقة عمل عربية منظمة مباشرة من تعريف CDC الرسمي لعام 2014. صفحة CDC للموارد ما تزال تصنف تعريف 2014 كـCurrent في 2026. لم تتغير الحدود العددية أو أولوية قواعد التصنيف.',
    rightsNotice: 'مادة CDC الاتحادية الأصلية قابلة لإعادة الاستخدام وفق سياسة الوكالة مع النسبة المناسبة وعدم الإيحاء بالتأييد. هذه ورقة روافد وليست نموذجًا رسميًا صادرًا عن CDC.',
    intendedUseAr: 'تحديد مرحلة HIV لأغراض المراقبة الوبائية وتحليل المرحلة عند التشخيص. التعريف مخصص للمراقبة السكانية وليس لاتخاذ قرار علاجي فردي.',
    respondentFields: ['معرف حالة غير مباشر', 'تاريخ التشخيص المؤكد', 'العمر في تاريخ اختبار CD4', 'مصدر البيانات/نظام المراقبة', 'تاريخ التصنيف'],
    preflightChecks: [
      'طبّق الورقة فقط على حالة HIV مؤكدة وفق نظام المراقبة المعتمد.',
      'احمِ سرية بيانات HIV واستخدم الحد الأدنى الضروري من المعرفات.',
      'تحقق من Stage 0 أولًا؛ إذا استوفت معاييره ولم ينطبق الاستثناء فإنه يتقدم على جميع المراحل الأخرى.',
    ],
    sections: [
      {
        titleAr: '1) Stage 0 — فحص العدوى المبكرة',
        instructionsAr: 'راجع تسلسل الاختبارات كاملًا. Stage 0 يعتمد على تسلسل نتائج متعارضة يدل على عدوى مبكرة، مع الاستثناء الوارد في تعريف CDC.',
        items: [
          { code: 'HIV0-RECENT-NEG', labelAr: 'نتيجة HIV سلبية أو غير حاسمة خلال 180 يومًا قبل أول نتيجة إيجابية مؤكدة؟', type: 'choice', options: yesNoUnknown },
          { code: 'HIV0-ALGORITHM', labelAr: 'أو خوارزم اختبار أظهر علامات فيروسية نوعية لـHIV مثل p24 أو NAT ضمن 0–180 يومًا قبل/بعد اختبار أضداد سلبي أو غير حاسم، بما يطابق تعريف CDC؟', type: 'choice', options: yesNoUnknown },
          { code: 'HIV0-PRIOR-EVIDENCE', labelAr: 'هل سبقت النتيجة السلبية/غير الحاسمة بأكثر من 60 يومًا أدلة موثقة على عدوى HIV سابقة تجعل استثناء Stage 0 منطبقًا؟', type: 'choice', options: yesNoUnknown },
          { code: 'HIV0-DATES', labelAr: 'تواريخ الاختبارات وتسلسلها وملاحظات التحقق', type: 'text' },
        ],
      },
      {
        titleAr: '2) حالة محددة للمرحلة 3',
        instructionsAr: 'إذا لم تتحقق Stage 0، فإن وجود مرض/حالة انتهازية محددة للمرحلة 3 يجعل المرحلة 3 بصرف النظر عن CD4.',
        items: [
          { code: 'HIV3-OI', labelAr: 'وجود مرض/حالة محددة للمرحلة 3 وفق ملحق CDC', type: 'choice', options: yesNoUnknown },
          { code: 'HIV3-OI-NOTE', labelAr: 'اسم الحالة والتاريخ ومصدر التوثيق', type: 'text' },
        ],
      },
      {
        titleAr: '3) CD4 والعمر',
        instructionsAr: 'إذا لم تتحقق Stage 0 ولم توجد حالة محددة للمرحلة 3، يعتمد التصنيف أساسًا على CD4 count. تُستخدم النسبة المئوية فقط إذا كان العدد مفقودًا.',
        items: [
          { code: 'HIV-AGE-BAND', labelAr: 'الفئة العمرية في تاريخ اختبار CD4', type: 'choice', options: hivAgeBands },
          { code: 'HIV-CD4-COUNT', labelAr: 'CD4 count', type: 'number', unit: 'cells/µL', min: 0 },
          { code: 'HIV-CD4-PCT', labelAr: 'CD4 percentage — تستخدم للتصنيف إذا كان العدد غير متوفر', type: 'number', unit: '%', min: 0, max: 100 },
          { code: 'HIV-CD4-DATE', labelAr: 'تاريخ عينة CD4', type: 'text' },
        ],
      },
      {
        titleAr: '4) المرحلة النهائية',
        items: [
          { code: 'HIV-STAGE-FINAL', labelAr: 'مرحلة HIV للمراقبة وفق CDC 2014', type: 'choice', options: hivStages },
          { code: 'HIV-STAGE-BASIS', labelAr: 'أساس التصنيف: Stage 0 / حالة Stage 3 / CD4 count / CD4 % / معلومات غير كافية', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'أولًا: إذا تحققت Stage 0 ولم ينطبق الاستثناء، فالمرحلة Stage 0 بغض النظر عن CD4 أو الأمراض المحددة للمرحلة 3.',
      'إذا لم تتحقق Stage 0 ووجد مرض محدد للمرحلة 3، فالمرحلة Stage 3 بغض النظر عن CD4.',
      'إذا لم ينطبق ما سبق، استخدم CD4 count أولًا. استخدم CD4 percentage فقط إذا كان العدد مفقودًا.',
      'العمر <1 سنة: Stage 1 إذا count ≥1500 أو، عند غياب العدد، percentage ≥34%؛ Stage 2 إذا count 750–1499 أو 26–33%؛ Stage 3 إذا count <750 أو percentage <26%.',
      'العمر 1–5 سنوات: Stage 1 إذا count ≥1000 أو percentage ≥30%؛ Stage 2 إذا count 500–999 أو 22–29%؛ Stage 3 إذا count <500 أو percentage <22%.',
      'العمر ≥6 سنوات: Stage 1 إذا count ≥500 أو percentage ≥26%؛ Stage 2 إذا count 200–499 أو 14–25%؛ Stage 3 إذا count <200 أو percentage <14%.',
      'إذا لم توجد معلومات كافية عن CD4 ولا مرض Stage 3 ولم تتحقق Stage 0، فالتصنيف Stage unknown.',
    ],
    interpretationGuardrails: [
      'CDC ينص صراحة على أن هذا تصنيف للمراقبة وقد لا يكون مناسبًا لرعاية المريض أو القرارات السريرية الفردية.',
      'المرحلة تصف الحالة في نقطة زمنية؛ stage at diagnosis مفهوم زمني محدد ويمكن أن تتغير المرحلة لاحقًا.',
      'لا تستخدم المرحلة لتحديد بدء/إيقاف العلاج المضاد للفيروسات القهقرية أو أهلية الرعاية.',
      'بيانات HIV حساسة؛ طبّق متطلبات الخصوصية والأمن المحلية.',
    ],
    stopRules: [
      'لا تصنف حالة غير مؤكدة باعتبارها HIV surveillance case.',
      'عند تضارب تواريخ الاختبارات أو عدم وضوح Stage 0، ارجع لتعريف CDC الأصلي بدل التخمين.',
    ],
    officialDownloads: [
      { label: 'CDC — Revised Surveillance Case Definition for HIV Infection, United States, 2014', url: 'https://www.cdc.gov/mmwr/preview/mmwrhtml/rr6303a1.htm', language: 'en', publisher: 'CDC' },
      { label: 'CDC — HIV Data Guidelines and Resources (2014 definition: Current)', url: 'https://www.cdc.gov/hiv-data/resources/index.html', language: 'en', publisher: 'CDC' },
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
    version: 'KDIGO 2012 final staging — current final AKI guideline as of 2026-09-06',
    provenance: 'تعتمد الورقة على معايير KDIGO 2012 النهائية. موقع KDIGO في سبتمبر 2026 ما يزال يعرض تحديث AKI/AKD 2026 كمسودة مراجعة عامة سيجري إعدادها للنشر؛ لذلك لا تُدمج معايير المسودة مع المعيار النهائي الحالي.',
    rightsNotice: 'CDISC يدرج KDIGO AKI Stage ضمن Public Domain. هذه صياغة تشغيلية عربية للمعايير وليست نسخة من تصميم جدول ناشر محمي.',
    intendedUseAr: 'توثيق تعريف ومرحلة AKI من الكرياتينين وإدرار البول بصورة معيارية. المرحلة أداة توصيف وخطورة، وليست قرارًا علاجيًا مستقلًا.',
    respondentFields: ['الاسم/الرمز', 'التاريخ/الوقت', 'العمر', 'الوزن المستخدم لحساب mL/kg/h', 'السياق السريري', 'الفاحص/المراجع'],
    preflightChecks: [
      'حدد baseline creatinine من مرجع موثق قدر الإمكان؛ لا تختلق baseline بلا مبرر.',
      'رتب قيم الكرياتينين زمنيًا لأن تعريف AKI يعتمد على نافذتي 48 ساعة و7 أيام.',
      'تحقق من دقة قياس إدرار البول والوزن والفترة الزمنية.',
      'إذا تحقق أكثر من معيار، سجّل أعلى مرحلة محققة.',
    ],
    sections: [
      {
        titleAr: 'الكرياتينين',
        items: [
          { code: 'AKI-BASELINE-SCR', labelAr: 'Serum creatinine الأساسي', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'AKI-CURRENT-SCR', labelAr: 'Serum creatinine الحالي/الأعلى في النافذة', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'AKI-SCR-ABS-RISE', labelAr: 'الزيادة المطلقة خلال 48 ساعة', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'AKI-SCR-RATIO', labelAr: 'النسبة إلى baseline خلال 7 أيام', type: 'number', unit: '× baseline', min: 0 },
        ],
      },
      {
        titleAr: 'إدرار البول وعوامل Stage 3',
        items: [
          { code: 'AKI-UO-RATE', labelAr: 'معدل إدرار البول', type: 'number', unit: 'mL/kg/h', min: 0 },
          { code: 'AKI-UO-DURATION', labelAr: 'مدة استمرار معدل البول المسجل', type: 'number', unit: 'hours', min: 0 },
          { code: 'AKI-ANURIA', labelAr: 'Anuria لمدة ≥12 ساعة', type: 'choice', options: yesNoUnknown },
          { code: 'AKI-RRT', labelAr: 'بدء renal replacement therapy', type: 'choice', options: yesNoUnknown },
          { code: 'AKI-PEDS-EGFR', labelAr: 'إذا كان العمر <18 سنة: eGFR الأدنى', type: 'number', unit: 'mL/min/1.73m²', min: 0 },
        ],
      },
      {
        titleAr: 'المرحلة',
        items: [
          { code: 'AKI-STAGE', labelAr: 'KDIGO AKI stage', type: 'choice', options: [
            { labelAr: 'لا تستوفي AKI حسب البيانات المتاحة', value: '0' },
            { labelAr: 'Stage 1', value: '1', score: 1 },
            { labelAr: 'Stage 2', value: '2', score: 2 },
            { labelAr: 'Stage 3', value: '3', score: 3 },
            { labelAr: 'غير قابل للتحديد من البيانات الحالية', value: 'unknown' },
          ] },
          { code: 'AKI-STAGE-BASIS', labelAr: 'المعيار الذي حدد أعلى مرحلة: SCr / urine output / RRT / pediatric eGFR', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'تعريف AKI في KDIGO 2012 يتحقق بأي من: زيادة SCr ≥0.3 mg/dL (≥26.5 µmol/L) خلال 48 ساعة؛ أو SCr ≥1.5× baseline معروف/مفترض خلال 7 أيام؛ أو urine volume <0.5 mL/kg/h لمدة 6 ساعات.',
      'Stage 1: SCr 1.5–1.9× baseline أو زيادة ≥0.3 mg/dL؛ أو urine output <0.5 mL/kg/h لمدة 6–12 ساعة.',
      'Stage 2: SCr 2.0–2.9× baseline؛ أو urine output <0.5 mL/kg/h لمدة ≥12 ساعة.',
      'Stage 3: SCr ≥3.0× baseline؛ أو SCr ≥4.0 mg/dL (≥353.6 µmol/L)؛ أو بدء renal replacement therapy؛ أو لمن هم <18 سنة eGFR <35 mL/min/1.73m²؛ أو urine output <0.3 mL/kg/h لمدة ≥24 ساعة؛ أو anuria لمدة ≥12 ساعة.',
      'إذا اختلفت مرحلة الكرياتينين عن مرحلة البول، استخدم أعلى مرحلة محققة واحتفظ بسبب التصنيف.',
    ],
    interpretationGuardrails: [
      'مرحلة KDIGO لا تحدد سبب AKI؛ يجب تقييم السبب والسياق بصورة مستقلة.',
      'لا تستخدم المرحلة وحدها لبدء أو إيقاف kidney replacement therapy أو تحديد جرعة دواء أو خطة سوائل.',
      'مسودة KDIGO 2026 AKI/AKD ليست إرشادًا نهائيًا حتى تاريخ التحقق؛ لا تخلط معاييرها المقترحة بجدول 2012.',
      'أعد التقييم عند وصول بيانات جديدة؛ AKI حالة ديناميكية.',
    ],
    stopRules: [
      'فرط بوتاسيوم شديد أو حماض شديد أو وذمة رئوية أو تدهور ديناميكي دموي أو قلة بول مع تدهور سريري يحتاج تقييمًا عاجلًا مستقلًا عن رقم المرحلة.',
      'إذا كانت baseline أو البيانات الزمنية أو إدرار البول غير موثوقة، سجّل عدم اليقين بدل اختلاق مرحلة دقيقة.',
    ],
    officialDownloads: [
      { label: 'KDIGO — Acute Kidney Injury and AKD guideline hub', url: 'https://kdigo.org/guidelines/acute-kidney-injury/', language: 'en', publisher: 'KDIGO' },
      { label: 'KDIGO summary — AKI definition and staging table', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4057151/', language: 'en', publisher: 'Kidney International / PubMed Central' },
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
    version: '2013 ACC/AHA Pooled Cohort Equations — legacy model in 2026 lipid-guideline context',
    provenance: 'توثق الورقة متغيرات PCE الأصلية وحدودها من إرشاد ACC/AHA 2013. إرشاد اضطراب الدهون ACC/AHA 2026 يوصي PREVENT-ASCVD بدل PCE لتقدير الخطر الذي يوجه خفض الدهون في الوقاية الأولية؛ لذلك لا تنشئ روافد هنا حاسبة علاجية معاصرة.',
    rightsNotice: 'CDISC يدرج ASCVD 10-Year Risk Estimator ضمن Public Domain. هذه ورقة توثيق من روافد ولا تعني تأييد ACC/AHA للتنفيذ.',
    intendedUseAr: 'توثيق أو إعادة تدقيق حساب PCE تاريخي في دراسة أو سجل أو مقارنة منهجية. ليست هذه حاسبة لتقرير علاج خفض الدهون في 2026.',
    respondentFields: ['معرف الحالة/السجل', 'تاريخ القياسات', 'سبب استخدام PCE: بحث/تفسير سجل/مقارنة', 'مصدر أداة الحساب أو التنفيذ البرمجي'],
    preflightChecks: [
      'أكد أن السؤال يتطلب PCE التاريخي. للقرارات الحالية لخافضات الدهون راجع PREVENT-ASCVD وإرشاد 2026.',
      'PCE الأصلي لخطورة 10 سنوات طُور للأعمار 40–79 عامًا في فئات السكان المحددة في الاشتقاق.',
      'لا تفترض صلاحية المعايرة لسكان عرب أو أي مجموعة لم تدخل بصورة كافية في الاشتقاق الأصلي.',
    ],
    sections: [
      {
        titleAr: 'متغيرات PCE الأصلية',
        instructionsAr: 'سجّل القيم التي استُخدمت فعليًا. لا تستخدم معادلة مختصرة أو معاملات محلية غير موثقة.',
        items: [
          { code: 'PCE-AGE', labelAr: 'العمر', type: 'number', unit: 'years', min: 0 },
          { code: 'PCE-SEX', labelAr: 'الجنس كما عرّفه النموذج الأصلي', type: 'choice', options: pceSex },
          { code: 'PCE-RACE', labelAr: 'فئة العرق في النموذج التاريخي', type: 'choice', options: pceRace },
          { code: 'PCE-TC', labelAr: 'Total cholesterol', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'PCE-HDL', labelAr: 'HDL cholesterol', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'PCE-SBP', labelAr: 'Systolic blood pressure', type: 'number', unit: 'mmHg', min: 0 },
          { code: 'PCE-BP-TREATED', labelAr: 'استخدام علاج خافض للضغط في النموذج', type: 'choice', options: yesNoUnknown },
          { code: 'PCE-DIABETES', labelAr: 'Diabetes', type: 'choice', options: yesNoUnknown },
          { code: 'PCE-SMOKING', labelAr: 'Current smoking', type: 'choice', options: yesNoUnknown },
        ],
      },
      {
        titleAr: 'توثيق النتيجة المحسوبة من تنفيذ موثق',
        items: [
          { code: 'PCE-RISK', labelAr: '10-year ASCVD risk الناتج من PCE موثق', type: 'number', unit: '%', min: 0, max: 100 },
          { code: 'PCE-CALCULATOR', labelAr: 'اسم/إصدار أداة الحساب أو المرجع البرمجي', type: 'text' },
          { code: 'PCE-NOTE', labelAr: 'ملاحظات المعايرة/السكان/سبب استخدام نموذج legacy', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'PCE الأصلي يستخدم نماذج خاصة بالجنس والفئة العرقية التاريخية ومتغيرات العمر وTotal-C وHDL-C وSBP مع حالة علاج الضغط والسكري والتدخين الحالي.',
      'لإعادة إنتاج نتيجة تاريخية استخدم معاملات/تنفيذ PCE الأصلي الموثق من إرشاد 2013 أو أداة موثوقة تصرح بالإصدار؛ لا تنشئ معاملات مختصرة محلية.',
      'وثق النتيجة ومصدر التنفيذ حتى تكون قابلة للتتبع والمراجعة.',
      'لا تنقل عتبات علاج قديمة تلقائيًا إلى قرار سريري في 2026؛ توجيه ACC/AHA 2026 يفضل PREVENT-ASCVD بدل PCE لتقدير الخطر المعاصر الذي يوجه LLT في الوقاية الأولية المناسبة.',
    ],
    interpretationGuardrails: [
      'PCE نموذج احتمالي تاريخي وليس تشخيصًا ولا أداة لتفسير أعراض قلبية حادة.',
      'العرق في PCE متغير تاريخي من بنية النموذج، ولا ينبغي التعامل معه كافتراض بيولوجي عام.',
      'لا تدّعِ أن PCE معاير لسكان الشرق الأوسط وشمال أفريقيا دون تحقق سكاني مستقل.',
      'للقرارات المعاصرة ارجع إلى الإرشاد الحالي وعوامل التخصيص وإعادة التصنيف بدل هذه الورقة منفردة.',
    ],
    stopRules: [
      'لا تستخدم هذه الورقة لتأخير تقييم ألم صدري أو أعراض قلبية حادة.',
      'إذا كان الهدف قرار خفض دهون حاليًا، لا تستخدم PCE كخيار افتراضي؛ راجع PREVENT والإرشاد الحالي.',
    ],
    officialDownloads: [
      { label: 'ACC — ASCVD Risk Estimator (legacy PCE implementation)', url: 'https://tools.acc.org/ascvd-risk-estimator/default.aspx', language: 'en', publisher: 'American College of Cardiology' },
      { label: '2013 ACC/AHA Guideline — PCE development and implementation', url: 'https://www.jacc.org/doi/10.1016/j.jacc.2013.11.005', language: 'en', publisher: 'ACC/AHA' },
      { label: '2026 ACC/AHA Dyslipidemia Guideline — PREVENT replaces older PCE for current LLT risk assessment', url: 'https://professional.heart.org/en/science-news/2026-guideline-on-the-management-of-dyslipidemia/top-things-to-know', language: 'en', publisher: 'American Heart Association' },
    ],
    sourceUrls: [
      'https://tools.acc.org/ascvd-risk-estimator/default.aspx',
      'https://www.jacc.org/doi/10.1016/j.jacc.2013.11.005',
      'https://professional.heart.org/en/science-news/2026-guideline-on-the-management-of-dyslipidemia/top-things-to-know',
    ],
    lastVerifiedOn: '2026-09-06',
  },
};
