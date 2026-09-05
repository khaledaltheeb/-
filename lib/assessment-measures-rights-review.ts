export type AssessmentMeasureRightsReviewStatus =
  | 'granted-to-cdisc'
  | 'author-permission-required'
  | 'denied'
  | 'no-response-received'
  | 'exempt-from-copyright';

export type AssessmentMeasureRightsReviewItem = {
  slug: string;
  nameAr: string;
  nameEn: string;
  acronym: string;
  domain: string;
  status: AssessmentMeasureRightsReviewStatus;
  statusLabel: string;
  whyReferenceOnly: string;
  safeUseOnRawafid: string;
  rightsSource: string;
  rightsVerifiedOn: string;
};

export const assessmentMeasuresRightsReview: AssessmentMeasureRightsReviewItem[] = [
  {
    slug: 'mmse-2-standard-version',
    nameAr: 'فحص الحالة العقلية المصغر — الإصدار الثاني القياسي',
    nameEn: 'Mini-Mental State Examination 2 Standard Version',
    acronym: 'MMSE-2 SV',
    domain: 'الإدراك',
    status: 'granted-to-cdisc',
    statusLabel: 'Granted to CDISC — إذن المالك مطلوب للاستخدام',
    whyReferenceOnly: 'CDISC يحدد الحالة Granted؛ هذا الإذن خاص بتطوير ملحق CDISC ولا يمنح روافد حق نسخ الأداة أو ترجمتها أو توزيعها.',
    safeUseOnRawafid: 'صفحة مرجعية تشرح الغرض والاختيار والحدود وتوجه إلى المصدر المرخص، دون إعادة نشر البنود أو مفتاح التسجيل.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs/mini-mental-state-examination-2-standard-version',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'hospital-anxiety-depression-scale',
    nameAr: 'مقياس القلق والاكتئاب في المستشفى',
    nameEn: 'Hospital Anxiety and Depression Scale',
    acronym: 'HADS',
    domain: 'الصحة النفسية',
    status: 'granted-to-cdisc',
    statusLabel: 'Granted to CDISC — إذن المالك مطلوب',
    whyReferenceOnly: 'حالة CDISC هي Granted، لذلك لا نعامل المقياس كـPublic Domain ولا نعيد نشر البنود أو الترجمة أو مفتاح التسجيل.',
    safeUseOnRawafid: 'دليل اختيار واستخدام وحقوق مع إحالة إلى الجهة المالكة أو الموزع المرخص.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs/hospital-anxiety-and-depression-scale',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'epworth-sleepiness-scale',
    nameAr: 'مقياس إبوورث للنعاس',
    nameEn: 'Epworth Sleepiness Scale',
    acronym: 'ESS',
    domain: 'النوم والنعاس',
    status: 'granted-to-cdisc',
    statusLabel: 'Granted to CDISC — إذن المالك مطلوب',
    whyReferenceOnly: 'يظهر ESS في سجل CDISC بحالة Granted؛ الإتاحة أو الشهرة لا تساوي تصريح إعادة النشر.',
    safeUseOnRawafid: 'شرح متى يستخدم وحدوده وكيفية الوصول إلى النسخة الرسمية من دون نسخ بنوده.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs/epworth-sleepiness-scale',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'eortc-qlq-c30-v3',
    nameAr: 'استبيان جودة الحياة لمرضى السرطان EORTC QLQ-C30 — الإصدار 3',
    nameEn: 'EORTC Quality of Life Questionnaire Core 30 Version 3.0',
    acronym: 'EORTC QLQ-C30 V3',
    domain: 'الأورام وجودة الحياة',
    status: 'granted-to-cdisc',
    statusLabel: 'Granted to CDISC — ترخيص الجهة المالكة مطلوب',
    whyReferenceOnly: 'CDISC يحدد QLQ-C30 V3 بحالة Granted. لا ننشر البنود أو الترجمات أو خوارزمية التسجيل باعتبارها محتوى حرًا.',
    safeUseOnRawafid: 'صفحة مرجعية للأورام تشرح المجالات وسياق الاستخدام وتوجه إلى نظام EORTC الرسمي للحصول على النسخ والترخيص.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs/european-organisation-research-and-treatment-cancer-quality-life',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'eq-5d-5l',
    nameAr: 'مقياس جودة الحياة EQ-5D-5L',
    nameEn: 'European Quality of Life Five Dimension Five Level Scale',
    acronym: 'EQ-5D-5L',
    domain: 'جودة الحياة والصحة العامة',
    status: 'granted-to-cdisc',
    statusLabel: 'Granted to CDISC — ترخيص الاستخدام مطلوب',
    whyReferenceOnly: 'CDISC يدرج EQ-5D-5L بحالة Granted؛ لا نعيد نشر الأداة أو قيمها أو ترجمتها كأنها Public Domain.',
    safeUseOnRawafid: 'شرح البنية والفرق عن أدوات جودة الحياة الأخرى مع رابط الجهة الرسمية للحصول على النسخة المطلوبة.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'columbia-suicide-severity-rating-scale-screening',
    nameAr: 'مقياس كولومبيا لشدة الانتحار — نسخة الفحص',
    nameEn: 'Columbia-Suicide Severity Rating Scale Screening',
    acronym: 'C-SSRS Screening',
    domain: 'السلامة وخطر الانتحار',
    status: 'granted-to-cdisc',
    statusLabel: 'Granted to CDISC — شروط المالك تحكم الاستخدام',
    whyReferenceOnly: 'CDISC يحدد نسخة Screening بحالة Granted. بسبب حساسية المقياس وحقوقه لا ننشئ نسخة محلية أو نغير صياغته أو مفتاحه.',
    safeUseOnRawafid: 'صفحة مرجعية توضح أن تقييم خطر الانتحار يحتاج بروتوكول سلامة وتدريبًا مناسبًا، مع إحالة إلى المصدر الرسمي.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs/columbia-suicide-severity-rating-scale-screening',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'positive-negative-syndrome-scale',
    nameAr: 'مقياس المتلازمة الإيجابية والسلبية',
    nameEn: 'Positive and Negative Syndrome Scale',
    acronym: 'PANSS',
    domain: 'الذهان والفصام',
    status: 'granted-to-cdisc',
    statusLabel: 'Granted to CDISC — إذن المالك مطلوب',
    whyReferenceOnly: 'PANSS مدرج لدى CDISC بحالة Granted، لذلك لا يعاد نشر بنوده أو نظام التسجيل أو مواد التدريب دون الترخيص الصحيح.',
    safeUseOnRawafid: 'شرح الغرض والفروق عن BPRS-A وقيود الاختيار، مع رابط المصدر الحقوقي.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs/positive-and-negative-syndrome-scale',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'trail-making-test',
    nameAr: 'اختبار تتبع المسار',
    nameEn: 'Trail Making Test',
    acronym: 'TMT',
    domain: 'الإدراك وعلم النفس العصبي',
    status: 'author-permission-required',
    statusLabel: 'Author Permission Required',
    whyReferenceOnly: 'CDISC يصنف TMT ضمن Author Permission Required؛ المستخدم يحتاج الحصول على المواد/الإذن من صاحب الحق وفق التعليمات.',
    safeUseOnRawafid: 'صفحة مقارنة وشرح منهجي فقط؛ لا نعيد إنشاء أوراق الاختبار أو نمط الأرقام والحروف.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'montreal-cognitive-assessment',
    nameAr: 'تقييم مونتريال المعرفي',
    nameEn: 'Montreal Cognitive Assessment',
    acronym: 'MoCA',
    domain: 'الإدراك',
    status: 'denied',
    statusLabel: 'Denied في سجل CDISC',
    whyReferenceOnly: 'سجل CDISC يعرض MoCA بحالة Denied لإنشاء ملحق QRS؛ هذه إشارة واضحة إلى عدم التعامل معه كمحتوى قابل لإعادة النشر من هذا المصدر.',
    safeUseOnRawafid: 'صفحة تعريف ومقارنة ووصلة إلى الجهة الرسمية فقط، بلا نموذج أو بنود أو مفتاح تسجيل.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs/montreal-cognitive-assessment',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'work-limitations-questionnaire',
    nameAr: 'استبيان قيود العمل',
    nameEn: 'Work Limitations Questionnaire',
    acronym: 'WLQ',
    domain: 'العمل والإنتاجية',
    status: 'denied',
    statusLabel: 'Denied في سجل CDISC',
    whyReferenceOnly: 'CDISC يعرض WLQ بحالة Denied؛ لذلك لا ننشر المحتوى أو نبني نسخة مشتقة.',
    safeUseOnRawafid: 'صفحة مرجعية تقارن الهدف بمقاييس المشاركة والإنتاجية الأخرى من دون إعادة نشر الأداة.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs/work-limitations-questionnaire',
    rightsVerifiedOn: '2026-09-05',
  },
  {
    slug: 'mini-international-neuropsychiatric-interview',
    nameAr: 'المقابلة العصبية النفسية الدولية المختصرة',
    nameEn: 'Mini International Neuropsychiatric Interview',
    acronym: 'MINI',
    domain: 'المقابلات التشخيصية النفسية',
    status: 'no-response-received',
    statusLabel: 'No Response Received في سجل CDISC',
    whyReferenceOnly: 'CDISC يسجل MINI بحالة No Response Received؛ عدم الرد ليس تصريحًا ولا يجعل الأداة حرة.',
    safeUseOnRawafid: 'شرح وظيفة المقابلة وحدودها ومقارنتها بمقابلات أخرى مع إحالة للجهة المالكة، دون نص المقابلة أو خوارزميتها.',
    rightsSource: 'https://www.cdisc.org/standards/foundational/qrs/mini-international-neuropsychiatric-interview-mini',
    rightsVerifiedOn: '2026-09-05',
  },
];

export const assessmentMeasureRightsReviewStatusLabels: Record<AssessmentMeasureRightsReviewStatus, string> = {
  'granted-to-cdisc': 'Granted to CDISC — إذن المالك ما يزال مطلوبًا',
  'author-permission-required': 'إذن المؤلف مطلوب',
  denied: 'رفض/Denied في سجل CDISC',
  'no-response-received': 'لم يصل رد من صاحب الحقوق',
  'exempt-from-copyright': 'معفى من حقوق النشر وفق شروط استخدام المالك',
};
