import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const FHS_POLICY = 'https://www.framinghamheartstudy.org/fhs-for-researchers/policies-and-procedures/framingham-risk-score-policy/';
const FHS_CVD_10Y = 'https://www.framinghamheartstudy.org/fhs-for-researchers/fhs-risk-functions/cardiovascular-disease-10-year-risk/';
const AHA_PREVENT_2026 = 'https://professional.heart.org/en/science-news/2026-guideline-on-the-management-of-dyslipidemia/top-things-to-know';

const yesNo: OperationalOption[] = [
  { labelAr: 'لا', labelEn: 'No', value: '0' },
  { labelAr: 'نعم', labelEn: 'Yes', value: '1' },
];

const sexModel: OperationalOption[] = [
  { labelAr: 'معاملات الرجال في النموذج المنشور', labelEn: 'Published male coefficients', value: 'male' },
  { labelAr: 'معاملات النساء في النموذج المنشور', labelEn: 'Published female coefficients', value: 'female' },
];

export const assessmentOperationalFullFormsWave12: Record<string, AssessmentOperationalMaterial> = {
  'framingham-cvd-10-year-risk': {
    slug: 'framingham-cvd-10-year-risk',
    kind: 'scoring-form',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'ورقة حساب فرامنغهام لخطر أمراض القلب والأوعية خلال 10 سنوات — النموذج العام 2008',
    titleEn: 'Framingham General Cardiovascular Disease 10-Year Risk — 2008 Primary Lipid Model Worksheet',
    version: 'D’Agostino et al. 2008 General CVD primary lipid model; official FHS coefficients',
    provenance: 'دراسة فرامنغهام الرسمية تنشر نموذج General CVD 10-year risk لعام 2008 ومعاملاته وصيغته، وتوضح سياسة FHS أن حاسبات المخاطر متاحة للاستخدام العام ولا تتطلب إذنًا خاصًا أو رسوم ترخيص. هذه الورقة تطبق النموذج المعتمد على الدهون فقط ولا تخلطه بنموذج BMI الأبسط أو CHD القديم أو PREVENT المعاصر.',
    rightsNotice: 'سياسة Framingham Heart Study تسمح بالاستخدام العام للحاسبات دون إذن أو رسوم، لكنها تمنع أي ادعاء أو إيحاء بأن FHS يؤيد موقع روافد أو استخدامه للحاسبة، وتخلي FHS مسؤوليتها عن أخطاء الحساب خارج موقعها. يجب نسبة النموذج والمصدر بوضوح.',
    intendedUseAr: 'تسجيل المدخلات والتحقق اليدوي/البحثي من خطر أول حدث CVD خلال 10 سنوات لدى أشخاص بعمر 30–74 سنة دون CVD عند خط الأساس، وفق نموذج D’Agostino 2008 العام. لا تُستخدم النتيجة وحدها لاتخاذ قرار دوائي حديث؛ الإرشادات الأمريكية لعام 2026 تعتمد PREVENT-ASCVD في سياقات الوقاية الأولية المرتبطة بالدهون.',
    respondentFields: ['الاسم/الرمز', 'تاريخ القياس', 'السياق/الدراسة', 'مصدر القيم المخبرية', 'ملاحظات المعايرة السكانية'],
    preflightChecks: [
      'استخدم هذه الورقة فقط للنموذج العام CVD 10-year المعتمد على الدهون المنشور عام 2008؛ لا تخلطه مع CHD 1998 أو BMI model أو PREVENT.',
      'العمر في نموذج FHS الرسمي 30–74 سنة، والشخص دون CVD عند فحص خط الأساس؛ خارج هذا النطاق لا تستخرج نسبة وكأن النموذج محقق.',
      'استخدم الكوليسترول الكلي وHDL بوحدة mg/dL، وضغط الدم الانقباضي بوحدة mmHg، وحدد هل الضغط يعالج دوائيًا وقت القياس.',
      'التدخين والسكري متغيران ثنائيان في الصيغة الأصلية: نعم=1، لا=0.',
      'اختر معاملات الرجال أو النساء كما نشرها النموذج الأصلي فقط؛ النموذج التاريخي لا يوفر معاملات مستقلة لهويات جندرية أخرى، ولا يجوز اختراع تحويل.',
    ],
    sections: [
      {
        titleAr: 'المدخلات الأساسية للنموذج المعتمد على الدهون',
        titleEn: 'Primary lipid-model inputs',
        items: [
          { code: 'FHS-CVD-SEX', labelAr: 'مجموعة المعاملات المنشورة المستخدمة', labelEn: 'Published coefficient set', type: 'choice', options: sexModel },
          { code: 'FHS-CVD-AGE', labelAr: 'العمر', labelEn: 'Age', type: 'number', min: 30, max: 74, unit: 'سنة' },
          { code: 'FHS-CVD-TC', labelAr: 'الكوليسترول الكلي', labelEn: 'Total cholesterol', type: 'number', unit: 'mg/dL' },
          { code: 'FHS-CVD-HDL', labelAr: 'كوليسترول HDL', labelEn: 'HDL cholesterol', type: 'number', unit: 'mg/dL' },
          { code: 'FHS-CVD-SBP', labelAr: 'ضغط الدم الانقباضي', labelEn: 'Systolic blood pressure', type: 'number', unit: 'mmHg' },
          { code: 'FHS-CVD-SBP-TREATED', labelAr: 'هل ضغط الدم يعالج دوائيًا؟', labelEn: 'Treated systolic blood pressure?', type: 'choice', options: yesNo },
          { code: 'FHS-CVD-SMOKER', labelAr: 'مدخن حاليًا؟', labelEn: 'Current smoker?', type: 'choice', options: yesNo },
          { code: 'FHS-CVD-DIABETES', labelAr: 'سكري؟', labelEn: 'Diabetes?', type: 'choice', options: yesNo },
        ],
      },
    ],
    scoringSteps: [
      'استخدم اللوغاريتم الطبيعي ln للعمر والكوليسترول الكلي وHDL وضغط الدم الانقباضي. رمز exp يعني الدالة الأسية e^x.',
      'للرجال: ΣβX = 3.06117×ln(age) + 1.12370×ln(TC) − 0.93263×ln(HDL) + [1.93303×ln(SBP) إذا غير معالج، أو 1.99881×ln(SBP) إذا معالج] + 0.65451×smoker + 0.57367×diabetes.',
      'خطر الرجال خلال 10 سنوات = 1 − 0.88936 ^ exp(ΣβX − 23.9802). اضرب الناتج في 100 للحصول على النسبة المئوية.',
      'للنساء: ΣβX = 2.32888×ln(age) + 1.20904×ln(TC) − 0.70833×ln(HDL) + [2.76157×ln(SBP) إذا غير معالج، أو 2.82263×ln(SBP) إذا معالج] + 0.52873×smoker + 0.69154×diabetes.',
      'خطر النساء خلال 10 سنوات = 1 − 0.95012 ^ exp(ΣβX − 26.1931). اضرب الناتج في 100 للحصول على النسبة المئوية.',
      'تحقق من النتيجة مقابل الحاسبة/Spreadsheet الرسمي من FHS عند استخدام النسبة في بحث أو توثيق سريري؛ لا تعتمد نسخة محلية غير مختبرة كمصدر وحيد للحساب.',
      'لا تحول نسبة Framingham إلى عتبة علاجية من تلقاء نفسك. في 2026 توصي إرشادات AHA/ACC المعاصرة باستخدام PREVENT-ASCVD بدل أدوات أقدم لتوجيه كثير من قرارات خفض الدهون في الوقاية الأولية.',
    ],
    interpretationGuardrails: [
      'Outcome النموذج واسع: يشمل الوفاة التاجية واحتشاء القلب والقصور التاجي والذبحة والسكتة الإقفارية/النزفية وTIA ومرض الشرايين المحيطية وفشل القلب؛ لا تفسر النسبة كخطر MI وحده.',
      'النموذج مشتق تاريخيًا من Framingham وقد يسيء المعايرة في سكان مختلفين، بما في ذلك مجتمعات عربية، ما لم توجد معايرة/تحقق محليان.',
      'النسبة احتمال إحصائي على مستوى نموذج سكاني وليست يقينًا فرديًا ولا تشخيصًا لمرض قلبي وعائي.',
      'لا تقارن نتيجة هذا النموذج مباشرة بنتيجة PREVENT أو PCE أو Framingham CHD وكأنها تقيس outcome واحدًا وبنفس المعايرة.',
      'بيانات المختبر أو الضغط غير الصحيحة تنتقل مباشرة إلى الخطر المحسوب؛ وثق تاريخ القياس والوحدات والعلاج.',
      'اختيار معامل الرجال/النساء يعكس بنية النموذج المنشور التاريخية ولا يعرّف هوية الشخص أو يحل قضايا التطبيق السريري خارج الفئات التي اشتق منها النموذج.',
    ],
    stopRules: [
      'لا تحسب النتيجة إذا كان العمر خارج 30–74 سنة أو توجد CVD معروفة عند خط الأساس وتقدمها على أنها Framingham General CVD 10-year validated estimate.',
      'لا تستخدم الورقة لإهمال ألم صدري أو ضيق نفس حاد أو أعراض سكتة أو حالة طارئة؛ تقييم الأعراض الحادة مستقل عن أي خطر طويل المدى.',
      'إذا كانت الوحدات غير معروفة أو القيم مفقودة أو غير موثوقة، أوقف الحساب بدل التخمين.',
      'للقرارات العلاجية المعاصرة ارجع إلى الإرشادات الحالية والأداة الموصى بها للسياق والسكان؛ لا تجعل Framingham 2008 افتراضيًا لمجرد توفره.',
    ],
    officialDownloads: [
      { label: 'Framingham Heart Study — CVD 10-year risk coefficients, formulas and calculator', url: FHS_CVD_10Y, language: 'en', publisher: 'Framingham Heart Study' },
      { label: 'Framingham Risk Score policy — public use / no license fee / no endorsement', url: FHS_POLICY, language: 'en', publisher: 'Framingham Heart Study' },
      { label: 'AHA 2026 Dyslipidemia Guideline — contemporary PREVENT-ASCVD boundary', url: AHA_PREVENT_2026, language: 'en', publisher: 'American Heart Association' },
    ],
    sourceUrls: [
      FHS_CVD_10Y,
      FHS_POLICY,
      'https://pubmed.ncbi.nlm.nih.gov/18212285/',
      AHA_PREVENT_2026,
    ],
    lastVerifiedOn: '2026-09-06',
  },
};
