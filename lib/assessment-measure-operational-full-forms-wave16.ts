import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const yesNoUnknown: OperationalOption[] = [
  { labelAr: 'نعم', value: 'yes' },
  { labelAr: 'لا', value: 'no' },
  { labelAr: 'غير معروف / غير موثق', value: 'unknown' },
];

const points = (values: number[]): OperationalOption[] =>
  values.map((score) => ({ labelAr: `${score} نقطة`, value: String(score), score }));

const CDISC_QRS = 'https://www.cdisc.org/qrs/all';
const APACHE_CDISC = 'https://www.cdisc.org/standards/foundational/qrs/acute-physiology-and-chronic-health-evaluation-ii';
const APACHE_TABLE = 'https://www.merckmanuals.com/professional/multimedia/table/acute-physiologic-assessment-and-chronic-health-evaluation-apache-ii-scoring-system';
const APACHE_ORIGINAL = 'https://pubmed.ncbi.nlm.nih.gov/3928249/';
const MELD_OPTN = 'https://optn.transplant.hrsa.gov/data/allocation-calculators/meld-calculator/';
const MELD_30 = 'https://pubmed.ncbi.nlm.nih.gov/34481845/';
const ASSIGN_HOME = 'https://www.rightdecisions.scot.nhs.uk/assign-v20/what-is-assign/';
const ASSIGN_CALCULATOR = 'https://www.rightdecisions.scot.nhs.uk/assign-v20/assign-cardiovascular-risk-score-calculator/';
const ASSIGN_FAQ = 'https://www.rightdecisions.scot.nhs.uk/assign-v20/frequently-asked-questions-faqs/';
const OGI_CDISC = 'https://www.cdisc.org/qrs/all';
const MVAI_ORIGINAL = 'https://doi.org/10.1111/apt.14190';
const MVAI_REVIEW = 'https://academic.oup.com/ecco-jcc/article/18/6/836/7486246';

const apacheTemp: OperationalOption[] = [
  { labelAr: '0 — 36.0–38.4 °C', value: '0', score: 0 },
  { labelAr: '1 — 38.5–38.9 أو 34.0–35.9 °C', value: '1', score: 1 },
  { labelAr: '2 — 32.0–33.9 °C', value: '2', score: 2 },
  { labelAr: '3 — 39.0–40.9 أو 30.0–31.9 °C', value: '3', score: 3 },
  { labelAr: '4 — ≥41.0 أو ≤29.9 °C', value: '4', score: 4 },
];
const apacheMap: OperationalOption[] = [
  { labelAr: '0 — 70–109 mmHg', value: '0', score: 0 },
  { labelAr: '2 — 110–129 أو 50–69 mmHg', value: '2', score: 2 },
  { labelAr: '3 — 130–159 mmHg', value: '3', score: 3 },
  { labelAr: '4 — ≥160 أو ≤49 mmHg', value: '4', score: 4 },
];
const apacheHr: OperationalOption[] = [
  { labelAr: '0 — 70–109/دقيقة', value: '0', score: 0 },
  { labelAr: '2 — 110–139 أو 55–69/دقيقة', value: '2', score: 2 },
  { labelAr: '3 — 140–179 أو 40–54/دقيقة', value: '3', score: 3 },
  { labelAr: '4 — ≥180 أو ≤39/دقيقة', value: '4', score: 4 },
];
const apacheRr: OperationalOption[] = [
  { labelAr: '0 — 12–24/دقيقة', value: '0', score: 0 },
  { labelAr: '1 — 25–34 أو 10–11/دقيقة', value: '1', score: 1 },
  { labelAr: '2 — 6–9/دقيقة', value: '2', score: 2 },
  { labelAr: '3 — 35–49/دقيقة', value: '3', score: 3 },
  { labelAr: '4 — ≥50 أو ≤5/دقيقة', value: '4', score: 4 },
];
const apacheOxygen: OperationalOption[] = [
  { labelAr: '0 — FiO₂≥0.50 وA-aDO₂<200؛ أو FiO₂<0.50 وPaO₂>70', value: '0', score: 0 },
  { labelAr: '1 — FiO₂<0.50 وPaO₂ 61–70', value: '1', score: 1 },
  { labelAr: '2 — FiO₂≥0.50 وA-aDO₂ 200–349', value: '2', score: 2 },
  { labelAr: '3 — FiO₂≥0.50 وA-aDO₂ 350–499؛ أو FiO₂<0.50 وPaO₂ 55–60', value: '3', score: 3 },
  { labelAr: '4 — FiO₂≥0.50 وA-aDO₂≥500؛ أو FiO₂<0.50 وPaO₂<55', value: '4', score: 4 },
];
const apachePh: OperationalOption[] = [
  { labelAr: '0 — pH 7.33–7.49', value: '0', score: 0 },
  { labelAr: '1 — pH 7.50–7.59', value: '1', score: 1 },
  { labelAr: '2 — pH 7.25–7.32', value: '2', score: 2 },
  { labelAr: '3 — pH 7.60–7.69 أو 7.15–7.24', value: '3', score: 3 },
  { labelAr: '4 — pH ≥7.70 أو <7.15', value: '4', score: 4 },
];
const apacheNa: OperationalOption[] = [
  { labelAr: '0 — 130–149 mmol/L', value: '0', score: 0 },
  { labelAr: '1 — 150–154 mmol/L', value: '1', score: 1 },
  { labelAr: '2 — 155–159 أو 120–129 mmol/L', value: '2', score: 2 },
  { labelAr: '3 — 160–179 أو 111–119 mmol/L', value: '3', score: 3 },
  { labelAr: '4 — ≥180 أو ≤110 mmol/L', value: '4', score: 4 },
];
const apacheK: OperationalOption[] = [
  { labelAr: '0 — 3.5–5.4 mmol/L', value: '0', score: 0 },
  { labelAr: '1 — 5.5–5.9 أو 3.0–3.4 mmol/L', value: '1', score: 1 },
  { labelAr: '2 — 2.5–2.9 mmol/L', value: '2', score: 2 },
  { labelAr: '3 — 6.0–6.9 mmol/L', value: '3', score: 3 },
  { labelAr: '4 — ≥7.0 أو <2.5 mmol/L', value: '4', score: 4 },
];
const apacheCreatinine: OperationalOption[] = [
  { labelAr: '0 — 0.6–1.4 mg/dL', value: '0', score: 0 },
  { labelAr: '2 — 1.5–1.9 أو <0.6 mg/dL', value: '2', score: 2 },
  { labelAr: '3 — 2.0–3.4 mg/dL', value: '3', score: 3 },
  { labelAr: '4 — ≥3.5 mg/dL', value: '4', score: 4 },
];
const apacheHct: OperationalOption[] = [
  { labelAr: '0 — 30.0–45.9%', value: '0', score: 0 },
  { labelAr: '1 — 46.0–49.9%', value: '1', score: 1 },
  { labelAr: '2 — 50.0–59.9 أو 20.0–29.9%', value: '2', score: 2 },
  { labelAr: '4 — ≥60 أو <20%', value: '4', score: 4 },
];
const apacheWbc: OperationalOption[] = [
  { labelAr: '0 — 3.0–14.9 ×10³/µL', value: '0', score: 0 },
  { labelAr: '1 — 15.0–19.9 ×10³/µL', value: '1', score: 1 },
  { labelAr: '2 — 20.0–39.9 أو 1.0–2.9 ×10³/µL', value: '2', score: 2 },
  { labelAr: '4 — ≥40 أو <1 ×10³/µL', value: '4', score: 4 },
];

export const assessmentOperationalFullFormsWave16: Record<string, AssessmentOperationalMaterial> = {
  'apache-ii': {
    slug: 'apache-ii',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'APACHE II — ورقة التسجيل والحساب دون حاسبة وفيات فردية',
    titleEn: 'APACHE II scoring worksheet',
    version: 'Classic APACHE II / CDISC RS v2.1 (20 May 2025)',
    provenance: 'CDISC يصنف APACHE II كـPublic Domain. ورقة روافد تعيد بناء نظام النقاط الكلاسيكي 0–71 من أسوأ القيم خلال أول 24 ساعة، مع فصل واضح بين درجة الشدة وبين أي نموذج وفيات يحتاج تشخيصًا ومعايرة سكانية.',
    rightsNotice: 'APACHE II نفسه Public Domain وفق CDISC. لا تعيد روافد نسخ واجهة حاسبة تجارية أو معاملات نموذج وفيات خاص بطرف ثالث.',
    intendedUseAr: 'تسجيل APACHE II في العناية الحثيثة أو البحث والجودة وفق النسخة الكلاسيكية، لا لاتخاذ قرار سحب علاج أو توقع وفاة فرد بعينه.',
    respondentFields: ['الاسم/الرمز', 'وقت دخول ICU', 'نافذة أول 24 ساعة', 'الفاحص', 'مصدر البيانات', 'هل المريض بعد جراحة اختيارية/طارئة أم غير جراحي'],
    preflightChecks: [
      'استخدم أسوأ قيمة صحيحة لكل متغير خلال أول 24 ساعة وفق قواعد APACHE II، ولا تنتقِ قيمة لتأكيد توقع مسبق.',
      'في الأكسجة: إذا FiO₂ ≥0.50 استخدم A-aDO₂؛ وإذا FiO₂ <0.50 استخدم PaO₂.',
      'إذا لم تتوفر غازات دم شريانية يمكن أن يستخدم البروتوكول التاريخي البيكربونات الوريدية كبديل؛ راجع جدول APACHE II الأصلي قبل التسجيل ولا تجمع pH والبيكربونات معًا.',
      'في الفشل الكلوي الحاد تضاعف نقاط الكرياتينين؛ وثق سبب اعتبار الحالة حادة.',
    ],
    sections: [
      {
        titleAr: 'Acute Physiology Score — أسوأ 24 ساعة',
        items: [
          { code: 'APACHE-TEMP', labelAr: 'الحرارة المركزية', type: 'choice', options: apacheTemp },
          { code: 'APACHE-MAP', labelAr: 'متوسط الضغط الشرياني MAP', type: 'choice', options: apacheMap },
          { code: 'APACHE-HR', labelAr: 'معدل القلب', type: 'choice', options: apacheHr },
          { code: 'APACHE-RR', labelAr: 'معدل التنفس', type: 'choice', options: apacheRr },
          { code: 'APACHE-FIO2', labelAr: 'FiO₂ المستخدم عند قياس الأكسجة', type: 'number', min: 0.21, max: 1, unit: 'fraction' },
          { code: 'APACHE-OXYGEN', labelAr: 'نقاط الأكسجة حسب فرع FiO₂ الصحيح', type: 'choice', options: apacheOxygen },
          { code: 'APACHE-PH', labelAr: 'نقاط pH الشرياني', type: 'choice', options: apachePh },
          { code: 'APACHE-NA', labelAr: 'نقاط الصوديوم', type: 'choice', options: apacheNa },
          { code: 'APACHE-K', labelAr: 'نقاط البوتاسيوم', type: 'choice', options: apacheK },
          { code: 'APACHE-CREAT-BASE', labelAr: 'نقاط الكرياتينين الأساسية', type: 'choice', options: apacheCreatinine },
          { code: 'APACHE-ARF', labelAr: 'فشل كلوي حاد؟ عند نعم تضاعف نقاط الكرياتينين', type: 'choice', options: yesNoUnknown },
          { code: 'APACHE-CREAT-ADJUSTED', labelAr: 'نقاط الكرياتينين بعد تطبيق قاعدة المضاعفة إن لزم', type: 'number', min: 0, max: 8, unit: 'points' },
          { code: 'APACHE-HCT', labelAr: 'نقاط الهيماتوكريت', type: 'choice', options: apacheHct },
          { code: 'APACHE-WBC', labelAr: 'نقاط كريات الدم البيضاء', type: 'choice', options: apacheWbc },
          { code: 'APACHE-GCS-ACTUAL', labelAr: 'GCS الفعلي', type: 'number', min: 3, max: 15, unit: '3–15' },
          { code: 'APACHE-GCS-POINTS', labelAr: 'نقاط الوعي = 15 − GCS الفعلي', type: 'number', min: 0, max: 12, unit: 'points' },
          { code: 'APACHE-APS', labelAr: 'مجموع Acute Physiology Score', type: 'number', min: 0, max: 60, unit: 'points' },
        ],
      },
      {
        titleAr: 'العمر والحالة الصحية المزمنة',
        items: [
          { code: 'APACHE-AGE-POINTS', labelAr: 'نقاط العمر: <45=0؛ 45–54=2؛ 55–64=3؛ 65–74=5؛ ≥75=6', type: 'choice', options: points([0, 2, 3, 5, 6]) },
          { code: 'APACHE-CHRONIC', labelAr: 'الحالة الصحية المزمنة: 0؛ أو 2 بعد جراحة اختيارية؛ أو 5 لغير الجراحي/جراحة طارئة عند وجود قصور عضو شديد سابق أو تثبيط مناعي', type: 'choice', options: points([0, 2, 5]) },
          { code: 'APACHE-TOTAL', labelAr: 'APACHE II = APS + العمر + الحالة المزمنة', type: 'number', min: 0, max: 71, unit: '0–71' },
        ],
      },
    ],
    scoringSteps: [
      'سجّل نقطة واحدة لكل متغير فسيولوجي من أسوأ قيمة خلال أول 24 ساعة؛ لا تجمع أكثر من بند بديل للمتغير نفسه.',
      'لنقاط الكرياتينين: استخدم النقاط الأساسية ثم ضاعفها إذا كان الفشل الكلوي حادًا كما يعرّفه البروتوكول.',
      'نقاط GCS = 15 − GCS الفعلي.',
      'APS هو مجموع 12 المتغيرات الفسيولوجية. APACHE II = APS + نقاط العمر + نقاط الحالة الصحية المزمنة، بنطاق 0–71.',
      'لا تحول الدرجة هنا إلى احتمال وفاة فردي؛ نماذج الوفاة تعتمد على تشخيص ومعايرة وسياق زمني مختلف.',
    ],
    interpretationGuardrails: [
      'الدرجة الأعلى تعكس شدة أكبر على مستوى التقسيم الطبقي للمجموعات؛ ليست حكمًا حتميًا على مآل شخص.',
      'لا تستخدم APACHE II لتقرير سحب العلاج أو رفض العناية أو تحديد عدم جدوى العلاج.',
      'المعايرة القديمة قد لا تنطبق على وحدة أو زمن أو مجتمع مختلف؛ أي استعمال تنبؤي يحتاج تحققًا محليًا.',
    ],
    stopRules: ['أي عدم استقرار حاد يُعالج سريريًا فورًا؛ استكمال الورقة لا يؤخر الإنعاش أو العلاج.'],
    officialDownloads: [
      { label: 'CDISC QRS — APACHE II Public Domain', url: APACHE_CDISC, language: 'en', publisher: 'CDISC' },
      { label: 'Merck/MSD — APACHE II scoring table', url: APACHE_TABLE, language: 'en', publisher: 'Merck Manual' },
    ],
    sourceUrls: [APACHE_CDISC, APACHE_TABLE, APACHE_ORIGINAL],
    lastVerifiedOn: '2026-09-06',
  },

  'model-for-end-stage-liver-disease': {
    slug: 'model-for-end-stage-liver-disease',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'MELD 3.0 — ورقة إدخال وتوثيق مرتبطة بالحاسبة الرسمية',
    titleEn: 'MELD 3.0 official-calculator handoff worksheet',
    version: 'MELD 3.0 / OPTN adult policy inputs effective 13 Jul 2023; verified 6 Sep 2026',
    provenance: 'MELD التاريخي Public Domain وفق CDISC، لكن التخصيص المعاصر للأعضاء يعتمد سياسة وإصدارًا رسميًا. لذلك تثبت روافد مدخلات MELD 3.0 وحدوده وتوجه النتيجة النهائية للحاسبة الرسمية بدل نشر حاسبة عامة بلا إصدار.',
    rightsNotice: 'MELD مصنف Public Domain لدى CDISC. سياسات OPTN وواجهتها الرسمية مرجع تنظيمي مستقل؛ هذه الورقة لا تدعي أنها بديل عن نظام التخصيص الرسمي.',
    intendedUseAr: 'تجهيز وتوثيق مدخلات MELD 3.0 ومراجعتها قبل/بعد إدخالها في الحاسبة الرسمية، مع منع خلط MELD التاريخي أو MELD-Na مع MELD 3.0.',
    respondentFields: ['الاسم/الرمز', 'تاريخ الميلاد', 'تاريخ الإضافة لقائمة الانتظار إن وجد', 'تاريخ/وقت سحب المختبر', 'برنامج/جهة الزراعة', 'إصدار السياسة المستخدمة'],
    preflightChecks: [
      'حدد أولًا هل الغرض تعليمي/بحثي أم تخصيص عضو رسمي؛ للتخصيص استخدم نظام الجهة التنظيمية فقط.',
      'تحقق من الوحدات: bilirubin وcreatinine mg/dL، sodium mEq/L، albumin g/dL، وINR بلا وحدة.',
      'وثق هل حدث غسيل كلوي مرتين أو 24 ساعة CVVHD خلال الأسبوع السابق لفحص الكرياتينين؛ OPTN يضبط creatinine إلى 3 mg/dL عند تحقق القاعدة.',
      'لا تستخدم صيغة البالغين لمريض أصغر من 18 سنة دون تطبيق سياسة العمر الرسمية؛ حاسبة OPTN تدير قواعد العمر.',
    ],
    sections: [
      {
        titleAr: 'مدخلات MELD 3.0',
        items: [
          { code: 'MELD30-AGE', labelAr: 'العمر عند الحساب', type: 'number', min: 12, max: 120, unit: 'years' },
          { code: 'MELD30-SEX', labelAr: 'الجنس المستخدم في حساب MELD للبالغين', type: 'choice', options: [{ labelAr: 'ذكر', value: 'male' }, { labelAr: 'أنثى', value: 'female' }] },
          { code: 'MELD30-BILI', labelAr: 'Total bilirubin', type: 'number', min: 0, unit: 'mg/dL' },
          { code: 'MELD30-NA', labelAr: 'Serum sodium', type: 'number', min: 100, max: 180, unit: 'mEq/L' },
          { code: 'MELD30-INR', labelAr: 'INR', type: 'number', min: 0 },
          { code: 'MELD30-ALBUMIN', labelAr: 'Serum albumin', type: 'number', min: 0, unit: 'g/dL' },
          { code: 'MELD30-CREAT', labelAr: 'Serum creatinine', type: 'number', min: 0, unit: 'mg/dL' },
          { code: 'MELD30-DIALYSIS', labelAr: 'غسيل كلوي مرتين أو ≥24 ساعة CVVHD خلال الأسبوع السابق للكرياتينين؟', type: 'choice', options: yesNoUnknown },
          { code: 'MELD30-OFFICIAL', labelAr: 'النتيجة المنقولة من حاسبة/نظام OPTN الرسمي', type: 'number', min: 6, max: 40, unit: 'MELD points' },
        ],
      },
    ],
    scoringSteps: [
      'للبالغين، MELD 3.0 يستخدم bilirubin وsodium وINR وalbumin وcreatinine مع مصطلح للجنس وتفاعلات محددة؛ تثبت القيم وفق حدود السياسة قبل الحساب.',
      'في الصيغة المنشورة: creatinine يحد عادة بين 1 و3 mg/dL، bilirubin وINR بحد أدنى 1، sodium بين 125 و137 mEq/L، وalbumin بين 1.5 و3.5 g/dL؛ قاعدة الغسيل قد تثبت creatinine عند 3.',
      'للاستخدام التنظيمي لا تحسب النتيجة يدويًا من هذه الصفحة: افتح حاسبة OPTN الحالية، أدخل المدخلات، ثم انقل الناتج وسجل تاريخ السياسة.',
      'لا تقارن درجات محسوبة بإصدارات MELD مختلفة كما لو كانت متطابقة.',
    ],
    interpretationGuardrails: [
      'الدرجة جزء من نظام تخصيص ومخاطر وليست وحدها قرار أهلية زراعة أو رفض رعاية.',
      'سياسات الاستثناءات والقيم المقبولة وفترات التحديث قد تتغير؛ المرجع التنظيمي الحالي يتقدم على هذه الورقة.',
      'أي تدهور كبدي حاد أو نزف أو إنتان أو اعتلال دماغي يحتاج تقييمًا عاجلًا مستقلًا عن الدرجة.',
    ],
    stopRules: ['إذا تعارضت الورقة مع سياسة برنامج الزراعة أو حاسبة OPTN الحالية، اتبع السياسة/الحاسبة الرسمية وسجل التعارض للمراجعة.'],
    officialDownloads: [
      { label: 'OPTN — official MELD calculator', url: MELD_OPTN, language: 'en', publisher: 'OPTN / HRSA' },
      { label: 'Kim et al. — MELD 3.0 development', url: MELD_30, language: 'en', publisher: 'PubMed' },
    ],
    sourceUrls: [CDISC_QRS, MELD_OPTN, MELD_30],
    lastVerifiedOn: '2026-09-06',
  },

  'assign-cardiovascular-risk-score': {
    slug: 'assign-cardiovascular-risk-score',
    kind: 'protocol-sheet',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'ASSIGN v2.0 — ورقة تجهيز المدخلات والإحالة للحاسبة الاسكتلندية الرسمية',
    titleEn: 'ASSIGN v2.0 official-calculator handoff sheet',
    version: 'ASSIGN v2.0 — recalibrated 2024 / national Right Decisions implementation',
    provenance: 'CDISC يدرج ASSIGN Risk Score Version 2.0 كـPublic Domain. النسخة الوطنية الحالية أعيدت معايرتها للسكان الاسكتلنديين، تستخدم SIMD، ومسجلة كجهاز طبي Class 1 لدى MHRA؛ لذلك لا تستنسخ روافد الحاسبة كأداة قرار للأردن.',
    rightsNotice: 'المؤشر Public Domain وفق CDISC. واجهة Right Decisions الرسمية ومحتواها التنظيمي تبقى المرجع التشغيلي الوطني في اسكتلندا.',
    intendedUseAr: 'تجهيز مدخلات ASSIGN v2.0 وتوثيق نتيجته الرسمية في سياقه الاسكتلندي أو البحثي، مع منع إسقاط المعايرة أو SIMD على سكان غير اسكتلنديين.',
    respondentFields: ['الاسم/الرمز', 'مكان الإقامة/السياق', 'تاريخ الحساب', 'مصدر SIMD', 'الفاحص', 'سبب التقييم'],
    preflightChecks: [
      'ASSIGN v2.0 مخصص لأفراد في اسكتلندا دون CVD معروف؛ لا تستخدمه كحاسبة مخاطر محلية للأردن أو العالم العربي دون تحقق ومعايرة.',
      'تحقق مما إذا كان الشخص ضمن فئة تعد عالية الخطورة أصلًا حسب المسار الاسكتلندي ولا تحتاج ASSIGN.',
      'استخدم SIMD 2020 الصحيح للعنوان الاسكتلندي؛ لا تستبدله بمؤشر حرمان غير مكافئ.',
      'العتبة الحالية في v2.0 عالية الخطورة هي ≥10% وليست عتبة 20% التاريخية.',
    ],
    sections: [
      {
        titleAr: 'مدخلات الحاسبة الرسمية',
        items: [
          { code: 'ASSIGN2-AGE', labelAr: 'العمر', type: 'number', min: 18, max: 100, unit: 'years' },
          { code: 'ASSIGN2-SEX', labelAr: 'الجنس البيولوجي المستخدم في النموذج', type: 'choice', options: [{ labelAr: 'ذكر', value: 'male' }, { labelAr: 'أنثى', value: 'female' }] },
          { code: 'ASSIGN2-TC', labelAr: 'Total cholesterol', type: 'number', min: 0, unit: 'mmol/L' },
          { code: 'ASSIGN2-HDL', labelAr: 'HDL cholesterol', type: 'number', min: 0, unit: 'mmol/L' },
          { code: 'ASSIGN2-SBP', labelAr: 'Systolic blood pressure', type: 'number', min: 40, max: 300, unit: 'mmHg' },
          { code: 'ASSIGN2-DM', labelAr: 'داء السكري', type: 'choice', options: yesNoUnknown },
          { code: 'ASSIGN2-FHX', labelAr: 'تاريخ عائلي CVD لدى والد/والدة/أخ/أخت قبل 60 سنة', type: 'choice', options: yesNoUnknown },
          { code: 'ASSIGN2-CIG', labelAr: 'عدد السجائر يوميًا', type: 'number', min: 0, max: 100, unit: 'cigarettes/day' },
          { code: 'ASSIGN2-SIMD', labelAr: 'SIMD score المستخدم في الحاسبة', type: 'number', min: 0 },
          { code: 'ASSIGN2-OFFICIAL', labelAr: 'ASSIGN v2.0 الرسمي', type: 'number', min: 0, max: 100, unit: '% 10-year risk' },
        ],
      },
    ],
    scoringSteps: [
      'اجمع المدخلات التسعة التي تستخدمها النسخة الحالية: العمر، الجنس، total cholesterol، HDL، SBP، السكري، التاريخ العائلي، السجائر/اليوم، وSIMD.',
      'افتح حاسبة Right Decisions الرسمية وأدخل القيم؛ لا تستخدم روافد كنسخة بديلة من جهاز/حاسبة وطنية منظمة.',
      'سجّل النتيجة الرسمية وتاريخ الحساب والإصدار. ASSIGN v2.0 يعبر عن خطر CVD خلال 10 سنوات.',
      'في السياق الاسكتلندي الحالي، ≥10% يُعد high risk؛ لا تنقل هذه العتبة تلقائيًا إلى سكان آخرين.',
    ],
    interpretationGuardrails: [
      'النموذج مبني ومعاد معايرته على سكان اسكتلنديين ويعتمد SIMD؛ الصلاحية الخارجية ليست مفترضة.',
      'النتيجة احتمال سكاني وليست ضمانًا لحدوث أو عدم حدوث حدث قلبي وعائي.',
      'لا تستخدم هذه الورقة لتبرير دواء أو رفضه خارج إرشادات وسياق المريض.',
    ],
    stopRules: ['إذا لم يتوفر SIMD اسكتلندي صحيح أو كان الشخص خارج السكان المستهدفين، لا تنتج “درجة ASSIGN محلية” مصطنعة.'],
    officialDownloads: [
      { label: 'Right Decisions — ASSIGN v2.0 official calculator', url: ASSIGN_CALCULATOR, language: 'en', publisher: 'NHS Scotland / Right Decisions' },
      { label: 'Right Decisions — What is ASSIGN?', url: ASSIGN_HOME, language: 'en', publisher: 'NHS Scotland / Right Decisions' },
    ],
    sourceUrls: [CDISC_QRS, ASSIGN_HOME, ASSIGN_CALCULATOR, ASSIGN_FAQ],
    lastVerifiedOn: '2026-09-06',
  },

  'observer-global-impression': {
    slug: 'observer-global-impression',
    kind: 'protocol-sheet',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'OGI — بروتوكول الانطباع العالمي للمراقب',
    titleEn: 'Observer Global Impression operational protocol',
    version: 'CDISC OGI QS v1.0 — released 20 Oct 2024',
    provenance: 'CDISC يصنف Observer Global Impression كـPublic Domain، QS، Version 1.0. لأن OGI إطار عالمي يحتاج تحديد مفهوم قابل للملاحظة وفترة مرجعية وسياق دراسة، لا تخترع روافد “نسخة عربية مرضية موحدة” غير موجودة.',
    rightsNotice: 'OGI Public Domain وفق CDISC. أي صياغة خاصة بدراسة/شركة أو ترجمة محققة بعينها قد تكون مادة منفصلة؛ هذه الورقة بروتوكول توثيق وتشغيل.',
    intendedUseAr: 'توحيد من هو المراقب، ما المفهوم الذي يلاحظه، ما الفترة المرجعية، وما مرساة الشدة/التغير المستخدمة قبل تسجيل الانطباع العالمي.',
    respondentFields: ['المشارك/الرمز', 'اسم/رمز المراقب', 'صلة المراقب بالمشارك', 'مدة معرفة المراقب بالمشارك', 'تاريخ التقييم', 'البروتوكول/الدراسة'],
    preflightChecks: [
      'حدد مفهومًا يمكن للمراقب ملاحظته فعليًا؛ لا تطلب منه تقدير تجربة داخلية لا يستطيع رؤيتها مباشرة.',
      'ثبت سؤال/مرساة الشدة أو التغير وفترة الاستدعاء في البروتوكول قبل بدء جمع البيانات.',
      'لا تخلط OGI مع Patient Global Impression أو Clinical Global Impression؛ مصدر المعلومة مختلف.',
      'إذا استُخدمت ترجمة عربية، وثق هل هي ترجمة بروتوكولية محلية أم نسخة محققة، ولا تصفها بأنها validated بلا دراسة تحقق.',
    ],
    sections: [
      {
        titleAr: 'تعريف التقييم قبل الدرجة',
        items: [
          { code: 'OGI-CONCEPT', labelAr: 'المفهوم/العرض القابل للملاحظة المراد تقييمه', type: 'text' },
          { code: 'OGI-RECALL', labelAr: 'الفترة المرجعية/الاستدعاء', type: 'text' },
          { code: 'OGI-ANCHOR-VERSION', labelAr: 'اسم/إصدار مرساة الاستجابة المستخدمة', type: 'text' },
          { code: 'OGI-SEVERITY', labelAr: 'درجة الشدة الخام وفق مرساة البروتوكول', type: 'number', min: 0, max: 10, unit: 'protocol-defined' },
          { code: 'OGI-CHANGE', labelAr: 'درجة التغير الخام مقارنة بخط الأساس وفق مرساة البروتوكول', type: 'number', min: 0, max: 10, unit: 'protocol-defined' },
          { code: 'OGI-OBSERVABILITY', labelAr: 'هل كانت لدى المراقب فرصة كافية للملاحظة خلال الفترة المحددة؟', type: 'choice', options: yesNoUnknown },
          { code: 'OGI-CONTEXT', labelAr: 'أحداث/تغيرات قد تؤثر في قابلية المقارنة', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'استخدم فقط مرساة الاستجابة المحددة مسبقًا في البروتوكول؛ لا تحول الدرجة الخام بين مقاييس 5 أو 7 نقاط من دون قاعدة تحقق.',
      'افصل الشدة الحالية عن التغير منذ خط الأساس؛ هما سؤالان/مفهومان مختلفان عند استخدامهما.',
      'سجّل “غير قابل للتقييم” بدل إجبار المراقب على التخمين عندما لم تتوفر فرصة ملاحظة كافية.',
    ],
    interpretationGuardrails: [
      'OGI انطباع عالمي من مراقب؛ لا يساوي تقييم المريض الذاتي ولا فحص الطبيب الموضوعي.',
      'قابلية المقارنة تتطلب ثبات المفهوم والمراقب/مصدر المعلومة والفترة والمرساة بقدر الإمكان.',
      'لا توجد عتبة عربية عامة صالحة لكل مرض أو بروتوكول.',
    ],
    stopRules: ['إذا كان المفهوم غير قابل للملاحظة أو المراقب لا يملك معرفة كافية بالفترة المطلوبة، لا تنتج درجة قسرية.'],
    officialDownloads: [{ label: 'CDISC QRS — Observer Global Impression v1.0, Public Domain', url: OGI_CDISC, language: 'en', publisher: 'CDISC' }],
    sourceUrls: [OGI_CDISC, 'https://clinicaltrials.gov/study/NCT04040192'],
    lastVerifiedOn: '2026-09-06',
  },

  'modified-van-assche-index': {
    slug: 'modified-van-assche-index',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'mVAI — ورقة Samaan 2017 ذات المكونات الخمسة الموزونة',
    titleEn: 'Modified Van Assche Index — Samaan 2017 reduced five-component model',
    version: 'Samaan et al. 2017 reduced mixed-effects model; CDISC MVAI RS v1.0 rights context',
    provenance: 'CDISC يصنف Modified Van Assche Index كـPublic Domain. لتجنب خلط تطبيقات متعددة تحمل الاسم نفسه، تثبت هذه الورقة تحديدًا النموذج المخفض في Samaan 2017: خمسة مكونات موزونة بعد نموذج mixed-effects.',
    rightsNotice: 'المؤشر Public Domain وفق CDISC. صور MRI ونصوص المقالة/الجداول المنشورة ليست معاد نشرها؛ روافد تعيد بناء حقول التسجيل والوزن مع نسبة المصدر.',
    intendedUseAr: 'تسجيل نشاط الناسور حول الشرج في داء كرون على MRI بواسطة قارئ متمرس، باستخدام متغيرات وتعريفات Samaan 2017 نفسها عند المقارنة الطولية أو البحثية.',
    respondentFields: ['الاسم/الرمز', 'تاريخ MRI', 'القارئ', 'خبرة القارئ/المركز', 'بروتوكول MRI', 'وجود gadolinium/التسلسلات اللازمة'],
    preflightChecks: [
      'ثبت أن المقصود هو reduced five-component mVAI من Samaan 2017؛ لا تخلطه مع Van Assche الأصلي 0–22 أو تطبيقات معدلة أخرى.',
      'راجع التعريفات المصورة الأصلية للمكونات قبل الاستخدام المؤسسي ودرب المقيمين عليها؛ الدراسة أظهرت أن اتفاق المقيمين ليس مثاليًا.',
      'إذا كانت جودة MRI أو التسلسلات غير كافية لتقييم عنصر، سجّل عدم القابلية للتقييم بدل افتراض الصفر.',
      'لا تستخدم نموذج رؤية آلية غير محقق لإسناد الدرجات.',
    ],
    sections: [
      {
        titleAr: 'مكونات النموذج المخفض',
        items: [
          { code: 'MVAI-EXT', labelAr: 'Extension: 0 absent؛ 1 infralevatoric؛ 2 horseshoe؛ 3 supralevatoric', type: 'choice', options: [0, 1, 2, 3].map((v) => ({ labelAr: String(v), value: String(v), score: v })) },
          { code: 'MVAI-T2', labelAr: 'T2 hyperintensity: 0 absent؛ 1 mild؛ 2 pronounced', type: 'choice', options: [0, 1, 2].map((v) => ({ labelAr: String(v), value: String(v), score: v })) },
          { code: 'MVAI-PROCTITIS', labelAr: 'Rectal wall involvement/proctitis raw score وفق تعريفات النسخة: 0–2', type: 'choice', options: [0, 1, 2].map((v) => ({ labelAr: String(v), value: String(v), score: v })) },
          { code: 'MVAI-MASS', labelAr: 'Inflammatory mass: 0 absent؛ 1 diffuse؛ 2 focal؛ 3 small collection؛ 4 medium؛ 5 large', type: 'choice', options: [0, 1, 2, 3, 4, 5].map((v) => ({ labelAr: String(v), value: String(v), score: v })) },
          { code: 'MVAI-DOMINANT', labelAr: 'Dominant feature: 0 fibrous؛ 1 granulation tissue؛ 2 fluid/pus', type: 'choice', options: [0, 1, 2].map((v) => ({ labelAr: String(v), value: String(v), score: v })) },
          { code: 'MVAI-TOTAL', labelAr: 'المجموع الموزون', type: 'number', min: 0, max: 20, unit: 'weighted points' },
        ],
      },
    ],
    scoringSteps: [
      'احسب: 1.5×Extension + 2.3×T2 hyperintensity + 1.0×rectal wall involvement/proctitis + 1.2×inflammatory mass + 1.2×dominant feature.',
      'المعاملات القياسية في النموذج المخفض هي 1.5، 2.3، 1.0، 1.2، 1.2 على الترتيب.',
      'الحد الحسابي الأقصى من هذه الأوزان والدرجات الخام هو 19.5؛ المقالة الأصلية تصف نطاق النتيجة إجمالًا 0–20، لذلك وثق طريقة التقريب إذا استُخدمت.',
      'حافظ على نسخة Samaan 2017 نفسها في المتابعة؛ لا تقارن مباشرة مع Van Assche الأصلي أو نسخ معدلة أخرى.',
    ],
    interpretationGuardrails: [
      'mVAI أداة MRI جزئية التحقق؛ مراجعة حديثة تشير إلى أن بعض خصائص القياس ما تزال بحاجة لمزيد من التحقق.',
      'لا توجد عتبة علاجية عالمية تجعل الدرجة وحدها قرار جراحة أو بيولوجي.',
      'الخراج أو الإنتان أو التدهور السريري يحتاج تقييمًا عاجلًا بغض النظر عن المجموع.',
    ],
    stopRules: ['MRI غير كافٍ أو قارئ غير مدرب على التعريفات = لا تنتج مجموعًا نهائيًا زائف الدقة.'],
    officialDownloads: [
      { label: 'CDISC QRS — Modified Van Assche Index, Public Domain', url: CDISC_QRS, language: 'en', publisher: 'CDISC' },
      { label: 'Samaan et al. 2017 — original modified index', url: MVAI_ORIGINAL, language: 'en', publisher: 'Alimentary Pharmacology & Therapeutics' },
    ],
    sourceUrls: [CDISC_QRS, MVAI_ORIGINAL, MVAI_REVIEW],
    lastVerifiedOn: '2026-09-06',
  },
};
