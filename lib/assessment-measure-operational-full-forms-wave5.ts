import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';
import { assessmentOperationalFullFormsWave2 } from '@/lib/assessment-measure-operational-full-forms-wave2';

const yesNo: OperationalOption[] = [
  { labelAr: 'لا', value: 'no', score: 0 },
  { labelAr: 'نعم', value: 'yes', score: 1 },
];

const score02: OperationalOption[] = [0, 1, 2].map((score) => ({ labelAr: String(score), value: String(score), score }));
const score04: OperationalOption[] = [0, 1, 2, 3, 4].map((score) => ({ labelAr: String(score), value: String(score), score }));

const hamd17Base = assessmentOperationalFullFormsWave2['hamilton-depression-rating-scale-17'];
const hamd17ItemsFor24 = hamd17Base.sections[0].items.map((item, index) => ({
  ...item,
  code: `HAMD24-${index + 1}`,
}));

export const assessmentOperationalFullFormsWave5: Record<string, AssessmentOperationalMaterial> = {
  'kdigo-acute-kidney-injury-stage': {
    slug: 'kdigo-acute-kidney-injury-stage',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'مراحل إصابة الكلى الحادة وفق KDIGO — ورقة التعريف والتصنيف',
    titleEn: 'KDIGO Acute Kidney Injury Stage',
    version: 'KDIGO 2012 final AKI definition and Stage 1–3 functional criteria',
    provenance: 'تعتمد هذه الورقة على إرشاد KDIGO 2012 النهائي لتعريف AKI وتصنيف المراحل 1–3، وهو الإصدار الذي يمثله سجل CDISC QRS العام. توجد في 2026 مسودة KDIGO AKI/AKD قيد المراجعة العامة؛ لا تُعامل المسودة كبديل نهائي تلقائيًا.',
    rightsNotice: 'CDISC يصنف KDIGO AKI Stage ضمن Public Domain. يجب تسجيل الإصدار المستخدم؛ لا تخلط مع RIFLE أو AKIN أو مسودة KDIGO 2026 دون وسم واضح.',
    intendedUseAr: 'تحديد وجود AKI ومرحلة شدتها من الكرياتينين وإدرار البول ضمن النوافذ الزمنية المحددة، مع أخذ أعلى مرحلة مستوفاة. التصنيف لا يحدد سبب الأذية ولا قرار العلاج بمفرده.',
    respondentFields: ['الاسم/الرمز', 'التاريخ والوقت', 'الفاحص', 'العمر', 'الوزن المستخدم لحساب إدرار البول', 'مصدر/تاريخ كرياتينين خط الأساس', 'سياق الدخول/العناية الحثيثة'],
    preflightChecks: [
      'ثبت أن هذه الورقة تستخدم KDIGO 2012 النهائي.',
      'حدد كرياتينين خط الأساس من بيانات موثقة قدر الإمكان؛ لا تخترع baseline غير مبرر.',
      'رتب قياسات الكرياتينين مع أوقاتها لتطبيق نافذة 48 ساعة و7 أيام بصورة صحيحة.',
      'استخدم إدرار بول موثوقًا ووزنًا مناسبًا، وسجل أثر المدرات/السوائل عندما يكون ذا صلة.',
      'عين المرحلة الأعلى التي يحققها أي من معيارَي الكرياتينين أو إدرار البول.',
    ],
    sections: [
      {
        titleAr: 'هل يستوفي تعريف AKI؟ — KDIGO 2012',
        items: [
          { code: 'KDIGO-DEF-SCR048', labelAr: 'ارتفاع SCr بمقدار ≥0.3 mg/dL (≥26.5 µmol/L) خلال 48 ساعة', type: 'choice', options: yesNo },
          { code: 'KDIGO-DEF-SCR15X7D', labelAr: 'ارتفاع SCr إلى ≥1.5 مرة خط الأساس، معلوم أو مفترض أنه حدث خلال 7 أيام سابقة', type: 'choice', options: yesNo },
          { code: 'KDIGO-DEF-UO6H', labelAr: 'إدرار البول <0.5 mL/kg/h لمدة 6 ساعات', type: 'choice', options: yesNo },
          { code: 'KDIGO-AKI-PRESENT', labelAr: 'يستوفي تعريف AKI إذا تحقق واحد أو أكثر مما سبق', type: 'choice', options: yesNo },
        ],
      },
      {
        titleAr: 'قيم الكرياتينين/إدرار البول اللازمة للتدقيق',
        items: [
          { code: 'KDIGO-BASELINE-SCR', labelAr: 'SCr خط الأساس', type: 'number', min: 0, unit: 'mg/dL' },
          { code: 'KDIGO-CURRENT-SCR', labelAr: 'أعلى/حالي SCr في نافذة التصنيف', type: 'number', min: 0, unit: 'mg/dL' },
          { code: 'KDIGO-SCR-RATIO', labelAr: 'نسبة SCr الحالي إلى خط الأساس', type: 'number', min: 0, unit: '× baseline' },
          { code: 'KDIGO-SCR-DELTA48', labelAr: 'الزيادة المطلقة في SCr خلال 48 ساعة', type: 'number', min: 0, unit: 'mg/dL' },
          { code: 'KDIGO-UO-RATE', labelAr: 'إدرار البول الأدنى/المستمر', type: 'number', min: 0, unit: 'mL/kg/h' },
          { code: 'KDIGO-UO-DURATION', labelAr: 'مدة استيفاء عتبة قلة البول', type: 'number', min: 0, unit: 'ساعة' },
          { code: 'KDIGO-ANURIA-DURATION', labelAr: 'مدة انقطاع البول التام', type: 'number', min: 0, unit: 'ساعة' },
          { code: 'KDIGO-RRT', labelAr: 'بدء علاج الإحلال الكلوي RRT خلال الحالة الحالية', type: 'choice', options: yesNo },
          { code: 'KDIGO-PED-EGFR', labelAr: 'إذا كان العمر <18 سنة: أدنى eGFR', type: 'number', min: 0, unit: 'mL/min/1.73m²' },
        ],
      },
      {
        titleAr: 'مرحلة الكرياتينين',
        items: [{
          code: 'KDIGO-C-STAGE', labelAr: 'أعلى مرحلة مستوفاة بواسطة SCr/RRT', type: 'choice', options: [
            { labelAr: '0 — لا يستوفي معيار مرحلة بالكرياتينين', value: '0', score: 0 },
            { labelAr: '1 — SCr 1.5–1.9× baseline أو زيادة ≥0.3 mg/dL (≥26.5 µmol/L)', value: '1', score: 1 },
            { labelAr: '2 — SCr 2.0–2.9× baseline', value: '2', score: 2 },
            { labelAr: '3 — SCr ≥3.0× baseline، أو SCr ≥4.0 mg/dL (≥353.6 µmol/L)، أو بدء RRT، أو عند <18 سنة eGFR <35 mL/min/1.73m²', value: '3', score: 3 },
          ]
        }],
      },
      {
        titleAr: 'مرحلة إدرار البول',
        items: [{
          code: 'KDIGO-U-STAGE', labelAr: 'أعلى مرحلة مستوفاة بواسطة إدرار البول', type: 'choice', options: [
            { labelAr: '0 — لا يستوفي معيار مرحلة بإدرار البول', value: '0', score: 0 },
            { labelAr: '1 — <0.5 mL/kg/h لمدة 6–12 ساعة', value: '1', score: 1 },
            { labelAr: '2 — <0.5 mL/kg/h لمدة ≥12 ساعة', value: '2', score: 2 },
            { labelAr: '3 — <0.3 mL/kg/h لمدة ≥24 ساعة أو انقطاع البول ≥12 ساعة', value: '3', score: 3 },
          ]
        }],
      },
      {
        titleAr: 'المرحلة النهائية',
        items: [
          { code: 'KDIGO-FINAL-STAGE', labelAr: 'مرحلة AKI النهائية = الأعلى بين معيار الكرياتينين ومعيار إدرار البول', type: 'choice', options: [
            { labelAr: 'لا توجد AKI وفق البيانات المتاحة', value: '0' },
            { labelAr: 'Stage 1', value: '1' },
            { labelAr: 'Stage 2', value: '2' },
            { labelAr: 'Stage 3', value: '3' },
          ] },
          { code: 'KDIGO-STAGE-DRIVER', labelAr: 'المعيار الذي قاد المرحلة الأعلى (SCr / urine output / RRT / pediatric eGFR)', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'AKI موجودة إذا تحقق واحد على الأقل: زيادة SCr ≥0.3 mg/dL خلال 48 ساعة؛ أو SCr ≥1.5× baseline خلال 7 أيام؛ أو UO <0.5 mL/kg/h لمدة 6 ساعات.',
      'Stage 1: SCr 1.5–1.9× baseline أو زيادة ≥0.3 mg/dL؛ أو UO <0.5 mL/kg/h لمدة 6–12 ساعة.',
      'Stage 2: SCr 2.0–2.9× baseline؛ أو UO <0.5 mL/kg/h لمدة ≥12 ساعة.',
      'Stage 3: SCr ≥3.0× baseline أو SCr ≥4.0 mg/dL أو بدء RRT أو، لدى من <18 سنة، eGFR <35 mL/min/1.73m²؛ أو UO <0.3 mL/kg/h لمدة ≥24 ساعة أو anuria ≥12 ساعة.',
      'عين المرحلة النهائية وفق أعلى/أسوأ مرحلة يحققها معيار الكرياتينين أو إدرار البول؛ لا تحسب متوسطًا بينهما.',
      'أعد المرحلة مع وصول بيانات جديدة؛ AKI عملية زمنية وليست رقمًا ثابتًا عند لحظة واحدة.',
    ],
    interpretationGuardrails: [
      'KDIGO stage يصف الشدة الوظيفية ولا يحدد المسبب.',
      'SCr يتأخر عن بعض أشكال الأذية ويتأثر بالكتلة العضلية والحجم والتخفيف؛ وإدرار البول يتأثر بالسوائل والمدرات ودقة القياس.',
      'عدم معرفة baseline بدقة قد يغيّر التصنيف؛ وثق طريقة تقديره بدل إخفاء عدم اليقين.',
      'مسودة KDIGO 2026 قيد المراجعة العامة تضيف إطارًا أوسع يتضمن معايير بنيوية/biomarker؛ لا تُدمج هذه العناصر في ورقة 2012 قبل إصدار نهائي واعتماد إصدار محدد.',
    ],
    stopRules: ['فرط بوتاسيوم مهدد، حماض شديد، وذمة رئوية، تسمم قابل للغسيل أو تدهور سريري خطير يحتاج تدخلاً عاجلًا مستقلًا عن رقم المرحلة.'],
    officialDownloads: [
      { label: 'KDIGO 2012 Clinical Practice Guideline for Acute Kidney Injury', url: 'https://kdigo.org/wp-content/uploads/2016/10/KDIGO-2012-AKI-Guideline-English.pdf', language: 'en', publisher: 'KDIGO' },
      { label: 'CDISC QRS — KDIGO AKI Stage, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/kidney-disease-improving-global-outcomes-kdigo-aki-stage', language: 'en', publisher: 'CDISC' },
      { label: 'KDIGO 2026 AKI/AKD Guideline Public Review Draft — update watch only', url: 'https://kdigo.org/wp-content/uploads/2026/03/KDIGO-2026-AKI-AKD-Guideline-Public-Review-Draft-Mar-2026.pdf', language: 'en', publisher: 'KDIGO' },
    ],
    sourceUrls: [
      'https://kdigo.org/wp-content/uploads/2016/10/KDIGO-2012-AKI-Guideline-English.pdf',
      'https://www.cdisc.org/standards/foundational/qrs/kidney-disease-improving-global-outcomes-kdigo-aki-stage',
      'https://kdigo.org/wp-content/uploads/2026/03/KDIGO-2026-AKI-AKD-Guideline-Public-Review-Draft-Mar-2026.pdf',
    ],
    lastVerifiedOn: '2026-09-06',
  },

  'atlas-cdi-score': {
    slug: 'atlas-cdi-score',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس ATLAS لعدوى المطثية العسيرة — ورقة الحساب',
    titleEn: 'ATLAS Score for Clostridioides difficile Infection',
    version: 'Original 5-component ATLAS score / Miller et al. 2013 / CDISC QRS v1.0',
    provenance: 'CDISC يصنف ATLAS ضمن Public Domain. اشتقاق Miller وآخرين فحص ستة متغيرات بما فيها الحرارة، لكن النظام النهائي الأفضل تمييزًا كان من خمسة متغيرات فقط: Age, Treatment with systemic antibiotics, Leukocyte count, Albumin, Serum creatinine — ATLAS — بمجموع 0–10.',
    rightsNotice: 'ATLAS Public Domain وفق CDISC. لا تضف الحرارة إلى مجموع ATLAS النهائي؛ كانت من متغيرات الاشتقاق المرشحة وليست حرفًا/مكونًا في النظام النهائي ذي الخمسة عناصر.',
    intendedUseAr: 'توصيف خطر انخفاض الاستجابة السريرية لعلاج CDI في سياق الدراسة/المريض عند التشخيص باستخدام خمسة متغيرات بسيطة. ليس أداة لتحديد المضاد أو الجراحة أو شدة CDI الحالية بمفرده.',
    respondentFields: ['الاسم/الرمز', 'تاريخ ووقت تقييم CDI', 'العمر', 'الفاحص', 'توقيت المختبر بالنسبة لتشخيص CDI', 'العلاج بالمضادات الجهازية المتزامن'],
    preflightChecks: [
      'أكد أن البيانات مأخوذة في سياق CDI المشخص/المشتبه بحسب بروتوكولك؛ ATLAS لا يشخّص CDI.',
      'استخدم المكونات الخمسة النهائية فقط؛ لا تدخل الحرارة في المجموع.',
      'عرّف systemic antibiotic treatment كما في الاشتقاق: مضاد جهازي لمدة يوم واحد أو أكثر أثناء علاج CDI.',
      'ثبت الوحدات: WBC، albumin، creatinine قبل التحويل إلى نقاط.',
      'لا تستخدم علاقة cure التاريخية كضمان فردي أو بديل لإرشادات CDI الحالية.',
    ],
    sections: [
      { titleAr: 'المكونات الخمسة ونقاط ATLAS', items: [
        { code: 'ATLAS-AGE-RAW', labelAr: 'العمر', type: 'number', min: 0, max: 130, unit: 'سنة' },
        { code: 'ATLAS-AGE', labelAr: 'Age', type: 'choice', options: [
          { labelAr: '0 — أقل من 60 سنة', value: '0', score: 0 },
          { labelAr: '1 — 60–79 سنة', value: '1', score: 1 },
          { labelAr: '2 — 80 سنة فأكثر', value: '2', score: 2 },
        ] },
        { code: 'ATLAS-TREATMENT', labelAr: 'Treatment with systemic antibiotics during CDI therapy (≥1 day)', type: 'choice', options: [
          { labelAr: '0 — لا', value: '0', score: 0 },
          { labelAr: '2 — نعم', value: '2', score: 2 },
        ], noteAr: 'لا توجد فئة 1 نقطة لهذا المكون في ATLAS النهائي.' },
        { code: 'ATLAS-WBC-RAW', labelAr: 'عدد الكريات البيضاء WBC', type: 'number', min: 0, unit: 'خلية/µL' },
        { code: 'ATLAS-WBC', labelAr: 'Leukocyte count', type: 'choice', options: [
          { labelAr: '0 — أقل من 16,000/µL', value: '0', score: 0 },
          { labelAr: '1 — 16,000–25,000/µL', value: '1', score: 1 },
          { labelAr: '2 — أكثر من 25,000/µL', value: '2', score: 2 },
        ] },
        { code: 'ATLAS-ALBUMIN-RAW', labelAr: 'ألبومين المصل', type: 'number', min: 0, unit: 'g/L' },
        { code: 'ATLAS-ALBUMIN', labelAr: 'Serum albumin', type: 'choice', options: [
          { labelAr: '0 — أكثر من 35 g/L', value: '0', score: 0 },
          { labelAr: '1 — 26–35 g/L', value: '1', score: 1 },
          { labelAr: '2 — 25 g/L أو أقل', value: '2', score: 2 },
        ] },
        { code: 'ATLAS-CREAT-RAW', labelAr: 'كرياتينين المصل', type: 'number', min: 0, unit: 'µmol/L' },
        { code: 'ATLAS-CREAT', labelAr: 'Serum creatinine', type: 'choice', options: [
          { labelAr: '0 — ≤120 µmol/L', value: '0', score: 0 },
          { labelAr: '1 — 121–179 µmol/L', value: '1', score: 1 },
          { labelAr: '2 — ≥180 µmol/L', value: '2', score: 2 },
        ] },
        { code: 'ATLAS-TOTAL', labelAr: 'مجموع ATLAS', type: 'number', min: 0, max: 10, unit: '0–10' },
      ] },
    ],
    scoringSteps: [
      'اجمع: العمر 0–2 + المضاد الجهازي 0 أو 2 + WBC 0–2 + الألبومين 0–2 + الكرياتينين 0–2؛ المجموع 0–10.',
      'في الاشتقاق الأصلي كان ATLAS النهائي من خمسة متغيرات؛ الحرارة لا تدخل المجموع النهائي رغم أنها دُرست كمرشح.',
      'ارتبطت الدرجة الأعلى بانخفاض معدل الشفاء في قواعد بيانات التجارب الأصلية، مع علاقة انحدار تاريخية cure rate ≈ 100 − (5.08 × ATLAS)، لكن هذه ليست معايرة حديثة أو ضمانًا فرديًا.',
      'احتفظ بالقيم الخام إلى جانب النقاط لتدقيق الوحدات وإعادة الحساب.',
    ],
    interpretationGuardrails: [
      'ATLAS طُوّر أساسًا للتنبؤ بالاستجابة/الشفاء في قواعد بيانات تجارب علاجية تاريخية؛ فائدته الحالية في قرارات الإدارة ليست مثبتة كقاعدة علاجية وحيدة.',
      'لا تستخدمه لتشخيص CDI، أو اختيار المضاد منفردًا، أو تأخير تقييم fulminant colitis أو toxic megacolon أو الصدمة.',
      'العلاج والوبائيات وإرشادات CDI تغيرت منذ اشتقاق المقياس؛ لا تنقل معدل شفاء تاريخيًا إلى مريض حالي كاحتمال شخصي مؤكد.',
    ],
    stopRules: ['الصدمة، ileus، توسع قولون سمي، انثقاب، تدهور سريع أو CDI fulminant يحتاج إدارة عاجلة مستقلة عن ATLAS.'],
    officialDownloads: [{ label: 'CDISC QRS — ATLAS, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/age-treatment-systemic-antibiotics-leukocyte-count-serum-albumin-and', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/age-treatment-systemic-antibiotics-leukocyte-count-serum-albumin-and', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3618004/'],
    lastVerifiedOn: '2026-09-06',
  },

  'valg-small-cell-lung-cancer-staging': {
    slug: 'valg-small-cell-lung-cancer-staging',
    kind: 'clinical-classification',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'تصنيف VALG لسرطان الرئة صغير الخلايا — Limited vs Extensive',
    titleEn: 'Veterans Administration Lung Study Group Classification for Small Cell Lung Cancer',
    version: 'VALG two-stage framework with current NCI/TNM context',
    provenance: 'CDISC يصنف VALG ضمن Public Domain. يظل نظام المرحلتين Limited/Extensive مستخدمًا سريريًا، لكن NCI يوضح عدم وجود تعريف واحد مقبول عالميًا لكل حدود limited stage، وأن AJCC TNM يُستخدم أيضًا لتصنيف SCLC.',
    rightsNotice: 'VALG Public Domain وفق CDISC. هذه ورقة تصنيف ودعم قرار توثيقي، لا بديل عن TNM ولا عن تخطيط علاج إشعاعي/أورام متعدد التخصصات.',
    intendedUseAr: 'توثيق ما إذا كان SCLC يندرج ضمن limited-stage أو extensive-stage وفق إطار VALG والسياق الإشعاعي، مع وسم الحالات الحدّية وعدم إخفاء TNM.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'TNM/AJCC المتاح', 'مصادر التصوير', 'فريق الأورام/الإشعاع عند الحالات الحدية'],
    preflightChecks: [
      'أكد تشخيص SCLC قبل استخدام تصنيف المرحلة.',
      'راجع الصدر والمنصف والعقد فوق الترقوة والانصباب الجنبي/التأموري والانتقالات البعيدة.',
      'قيّم ما إذا كان حجم المرض يمكن احتواؤه ضمن حقل إشعاعي محتمل التحمل عندما يُستخدم مفهوم limited-stage الحديث.',
      'لا تجبر حالة حدية مثل contralateral supraclavicular nodes أو massive tumor أو بعض الانصبابات داخل خانة واحدة دون توثيق تعريف المؤسسة/الفريق.',
      'سجل TNM بالتوازي عندما يكون متاحًا؛ NCI يدرج AJCC TNM وVALG وIASLC ضمن أنظمة staging لـSCLC.',
    ],
    sections: [
      { titleAr: 'قائمة التحقق التشريحية/الإشعاعية', items: [
        { code: 'VALG-ORIGIN-HEMITHORAX', labelAr: 'المرض محصور في نصف الصدر الأصلي/المنصف والعقد التي يمكن إدراجها ضمن تعريف limited-stage المستخدم', type: 'choice', options: yesNo },
        { code: 'VALG-SUPRACLAVICULAR', labelAr: 'عقد فوق الترقوة موجودة — وثق الجانب والتعريف المؤسسي', type: 'text' },
        { code: 'VALG-CONTRALATERAL-HILAR', labelAr: 'عقد نقيرية مقابلة موجودة', type: 'choice', options: yesNo },
        { code: 'VALG-PLEURAL-EFFUSION', labelAr: 'انصباب جنبي/تأموري — وثق إن كان خبيثًا أو غير حاسم', type: 'text' },
        { code: 'VALG-MASSIVE-TUMOR', labelAr: 'كتلة ضخمة/حجم مرض يجعل حقل الإشعاع غير محتمل التحمل', type: 'choice', options: yesNo },
        { code: 'VALG-DISTANT-METS', labelAr: 'انتقالات بعيدة (M1) موجودة', type: 'choice', options: yesNo },
        { code: 'VALG-RT-PORT', labelAr: 'هل يمكن احتواء المرض كله ضمن حقل إشعاعي محتمل التحمل وفق فريق الإشعاع؟', type: 'choice', options: [
          { labelAr: 'نعم', value: 'yes' },
          { labelAr: 'لا', value: 'no' },
          { labelAr: 'غير محسوم/يحتاج تخطيطًا', value: 'uncertain' },
        ] },
      ] },
      { titleAr: 'المرحلة', items: [{
        code: 'VALG-STAGE', labelAr: 'تصنيف VALG', type: 'choice', options: [
          { labelAr: 'Limited-stage — المرض ضمن المجال المحدود المستخدم ويمكن احتواؤه في حقل إشعاعي محتمل التحمل', value: 'limited' },
          { labelAr: 'Extensive-stage — انتشار يتجاوز تعريف limited-stage؛ الانتقالات البعيدة M1 دائمًا Extensive', value: 'extensive' },
          { labelAr: 'Boundary / adjudication required — حالة حدية يعتمد تصنيفها على تعريف المؤسسة/الفريق', value: 'boundary' },
        ]
      }, {
        code: 'VALG-TNM', labelAr: 'TNM/AJCC الموازي', type: 'text', noteAr: 'لا تستبدل نظام TNM الحديث بتصنيف VALG ثنائي المرحلة.'
      }],
    ],
    scoringSteps: [
      'Limited-stage عمومًا: المرض محصور في hemithorax الأصلي والمنصف و/أو supraclavicular nodes ويمكن احتواؤه ضمن حقل إشعاعي محتمل التحمل وفق التعريف المستخدم.',
      'Extensive-stage: المرض يتجاوز تعريف limited-stage؛ وجود distant metastasis (M1) يجعله extensive-stage.',
      'لا يوجد تعريف واحد عالمي لجميع الحالات الحدّية؛ pleural effusion، massive pulmonary tumor، وcontralateral supraclavicular nodes أُدرجت أو استُبعدت تاريخيًا من limited-stage بواسطة مجموعات مختلفة.',
      'سجل TNM/AJCC بالتوازي؛ NCI يوضح أن SCLC يُصنف أيضًا باستخدام TNM، ولا يجوز تحويل VALG إلى بديل كامل عنه.',
    ],
    interpretationGuardrails: [
      'تصنيف VALG ثنائي المرحلة مفيد للتواصل السريري لكنه لا يلتقط التفاصيل التشريحية التي يوفرها TNM.',
      'قرار قابلية العلاج الإشعاعي وحجم الحقل قرار متخصص وليس مجرد خانة آلية.',
      'الحالات الحدية يجب أن تحفظ كمعلومة غير يقينية/مناقشة متعددة التخصصات بدل فرض تصنيف زائف.',
    ],
    stopRules: ['هذه أداة staging وليست أداة طوارئ؛ الأعراض الحادة مثل متلازمة الوريد الأجوف العلوي أو ضغط الحبل الشوكي تحتاج مسارًا عاجلًا مستقلًا عن إكمال التصنيف.'],
    officialDownloads: [
      { label: 'NCI PDQ — SCLC staging systems and limited/extensive definitions', url: 'https://www.cancer.gov/types/lung/hp/small-cell-lung-treatment-pdq', language: 'en', publisher: 'National Cancer Institute' },
      { label: 'CDISC QRS — VALG, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs', language: 'en', publisher: 'CDISC' },
    ],
    sourceUrls: ['https://www.cancer.gov/types/lung/hp/small-cell-lung-treatment-pdq', 'https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn: '2026-09-06',
  },

  'hamilton-depression-rating-scale-24': {
    slug: 'hamilton-depression-rating-scale-24',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'مقياس هاملتون لتقدير الاكتئاب — HAMD-24 ورقة التسجيل',
    titleEn: 'Hamilton Depression Rating Scale — 24 Item',
    version: '24-item clinician-rated HAMD / public-domain structure',
    provenance: 'CDISC يصنف HAMD-24 ضمن Public Domain. تبني هذه الورقة البنود 1–17 من ورقة HAMD-17 التشغيلية في روافد، ثم تضيف البند 18 للتباين اليومي (وقت التباين غير مسجل في المجموع + شدة 0–2)، والبنود 19–24 وفق نطاقات NIH NDA: 19 و20 و22–24 = 0–4، و21 = 0–2.',
    rightsNotice: 'HAMD-24 الأصلية Public Domain وفق CDISC. هذه الصياغة العربية ورقة تسجيل تشغيلية من روافد وليست ادعاءً بأنها مقابلة عربية منظمة أو ترجمة عربية محققة. SIGH-D/GRID-HAMD وأدلة مقابلة مشتقة قد تحمل حقوقًا/نسخًا مختلفة.',
    intendedUseAr: 'تسجيل شدة 24 مجالًا في نسخة HAMD الموسعة بواسطة فاحص سريري مدرب ومتابعة التغير؛ ليست أداة تشخيص ذاتي.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'التشخيص/السياق', 'الفترة المرجعية — عادة الأسبوع السابق وفق بروتوكول HAMD المستخدم', 'الأدوية/التغيرات العلاجية', 'مصدر النسخة/المقابلة إن كانت منظمة'],
    preflightChecks: [
      'يطبق بواسطة فاحص مدرب وباستخدام مراسي نسخة ثابتة.',
      'البنود 1–17 تتبع نفس بنية HAMD-17 المعتمدة في مكتبة روافد؛ لا تبدّل نطاق بند منفرد بين الزيارات.',
      'في البند 18 سجل اتجاه/وقت التباين اليومي منفصلًا عن شدة التباين؛ الذي يدخل المجموع هو الشدة 0–2، لا رمز AM/PM/afternoon.',
      'بند الانتحار رقم 3 يراجع مستقلًا عن المجموع؛ وجود خطر حالي يحتاج تقييم سلامة مباشرًا.',
    ],
    sections: [
      {
        titleAr: 'البنود 1–17 — نفس نطاقات HAMD-17',
        instructionsAr: 'استخدم مراسي النسخة/المقابلة المرجعية نفسها. هذه البنود مستمدة بنيويًا من ورقة HAMD-17 التشغيلية داخل روافد.',
        items: hamd17ItemsFor24,
      },
      {
        titleAr: 'البنود الإضافية 18–24',
        items: [
          { code: 'HAMD24-18-TIME', labelAr: '18A. اتجاه/وقت التباين اليومي — معلومات وصفية لا تدخل المجموع', type: 'choice', options: [
            { labelAr: 'لا يوجد تباين', value: 'none' },
            { labelAr: 'أسوأ صباحًا', value: 'am' },
            { labelAr: 'أسوأ مساءً', value: 'pm' },
            { labelAr: 'أسوأ بعد الظهر', value: 'afternoon' },
          ] },
          { code: 'HAMD24-18', labelAr: '18B. شدة التباين اليومي', type: 'task-score', options: [
            { labelAr: '0 — لا يوجد/طبيعي', value: '0', score: 0 },
            { labelAr: '1 — خفيف', value: '1', score: 1 },
            { labelAr: '2 — شديد/متوسط إلى شديد بحسب النسخة المرجعية', value: '2', score: 2 },
          ] },
          { code: 'HAMD24-19', labelAr: '19. تبدد الشخصية/تبدد الواقع', type: 'task-score', options: [
            { labelAr: '0 — غائب', value: '0', score: 0 },
            { labelAr: '1 — خفيف', value: '1', score: 1 },
            { labelAr: '2 — متوسط', value: '2', score: 2 },
            { labelAr: '3 — شديد', value: '3', score: 3 },
            { labelAr: '4 — مُعطّل/شديد جدًا بحسب النسخة', value: '4', score: 4 },
          ] },
          { code: 'HAMD24-20', labelAr: '20. الأعراض الارتيابية/البارانوية', type: 'task-score', options: score04 },
          { code: 'HAMD24-21', labelAr: '21. الأعراض الوسواسية والقهرية', type: 'task-score', options: score02 },
          { code: 'HAMD24-22', labelAr: '22. العجز/الشعور بالعجز Helplessness', type: 'task-score', options: [
            { labelAr: '0 — لا دليل على العجز', value: '0', score: 0 },
            { labelAr: '1 — مشاعر ذاتية تظهر عند الاستفسار فقط', value: '1', score: 1 },
            { labelAr: '2 — يذكر مشاعر العجز تلقائيًا', value: '2', score: 2 },
            { labelAr: '3 — يحتاج الحث/الإرشاد/الطمأنة لإنجاز الأعمال أو النظافة الشخصية', value: '3', score: 3 },
            { labelAr: '4 — يحتاج مساعدة جسدية للملبس أو العناية أو الأكل أو مهام السرير/النظافة', value: '4', score: 4 },
          ] },
          { code: 'HAMD24-23', labelAr: '23. اليأس Hopelessness', type: 'task-score', options: [
            { labelAr: '0 — غير موجود', value: '0', score: 0 },
            { labelAr: '1 — شك متقطع في التحسن ويمكن طمأنته', value: '1', score: 1 },
            { labelAr: '2 — يشعر باليأس باستمرار لكنه يقبل الطمأنة', value: '2', score: 2 },
            { labelAr: '3 — يعبّر عن الإحباط/اليأس/التشاؤم بما لا يزول بالطمأنة', value: '3', score: 3 },
            { labelAr: '4 — يكرر تلقائيًا وبصورة غير ملائمة قناعة شديدة بأنه لن يتحسن', value: '4', score: 4 },
          ] },
          { code: 'HAMD24-24', labelAr: '24. انعدام القيمة Worthlessness', type: 'task-score', options: [
            { labelAr: '0 — غير موجود', value: '0', score: 0 },
            { labelAr: '1 — شعور بانخفاض القيمة/تقدير الذات يظهر عند الاستفسار فقط', value: '1', score: 1 },
            { labelAr: '2 — يذكر الشعور بانعدام القيمة تلقائيًا', value: '2', score: 2 },
            { labelAr: '3 — شعور شديد ومستمر بأنه عديم القيمة/أدنى من الآخرين', value: '3', score: 3 },
            { labelAr: '4 — أفكار وهامية بانعدام القيمة أو ما يعادلها', value: '4', score: 4 },
          ] },
        ],
      },
      { titleAr: 'النتيجة', items: [{ code: 'HAMD24-TOTAL', labelAr: 'مجموع البنود 1–24 — لا يدخل HAMD24-18-TIME', type: 'number', min: 0, max: 76, unit: '0–76' }] },
    ],
    scoringSteps: [
      'اجمع البنود 1–17 وفق نطاقاتها الأصلية (حد أقصى 52 في هذه النسخة)، ثم أضف: 18 شدة التباين 0–2، 19 = 0–4، 20 = 0–4، 21 = 0–2، 22–24 = 0–4 لكل بند.',
      'لا تدخل حقل 18A الخاص بوقت/اتجاه التباين اليومي في المجموع.',
      'النطاق النظري لهذه البنية = 0–76.',
      'توجد في الأدبيات فروق طفيفة بين نسخ HAMD في مجموعات البنود/الحد الأقصى؛ سجل نسخة المقياس والمقابلة بدل مقارنة 75 و76 أو 52 و53 كما لو كانت متطابقة.',
      'أحد التصنيفات المنشورة الشائعة لـHAMD-24 يصف 0–7 طبيعي، 8–13 خفيف، 14–18 متوسط، 19–22 شديد، ≥23 شديد جدًا؛ هذه نطاقات وصفية بحثية وليست تشخيصًا مستقلًا.',
    ],
    interpretationGuardrails: [
      'HAMD-24 مقياس شدة متعدد البنود وليس اختبارًا تشخيصيًا مستقلًا.',
      'النسخة العربية هنا ترجمة تشغيلية بنيوية؛ لا تُعرض على أنها ترجمة عربية محققة لمقابلة HAMD منظمة بعينها.',
      'جودة النتيجة تعتمد على تدريب المقيم وثبات المقابلة والمراسي.',
      'بند الانتحار يُفسر ويُتصرف بشأنه مستقلًا عن المجموع النهائي.',
    ],
    stopRules: ['أي أفكار/سلوك انتحاري حالي، ذهان شديد، هياج خطير أو تدهور طبي حاد يحتاج تقييمًا مباشرًا ولا ينتظر استكمال الدرجة.'],
    officialDownloads: [
      { label: 'CDISC QRS — Hamilton Depression Rating Scale 24-Item, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/hamilton-depression-rating-scale-24-item', language: 'en', publisher: 'CDISC' },
      { label: 'NIMH Data Archive — Hamilton Rating Scale for Depression data dictionary', url: 'https://nda.nih.gov/ndar_data_dictionary.html?short_name=hrsd01', language: 'en', publisher: 'National Institute of Mental Health' },
    ],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/hamilton-depression-rating-scale-24-item', 'https://nda.nih.gov/ndar_data_dictionary.html?short_name=hrsd01', 'https://www.ncbi.nlm.nih.gov/books/NBK564553/'],
    lastVerifiedOn: '2026-09-06',
  },
};
