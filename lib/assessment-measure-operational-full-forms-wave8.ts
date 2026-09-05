import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const phqFrequency: OperationalOption[] = [
  { labelAr: 'أبدًا', labelEn: 'Not at all', value: '0', score: 0 },
  { labelAr: 'عدة أيام', labelEn: 'Several days', value: '1', score: 1 },
  { labelAr: 'أكثر من نصف الأيام', labelEn: 'More than half the days', value: '2', score: 2 },
  { labelAr: 'كل يوم تقريبًا', labelEn: 'Nearly every day', value: '3', score: 3 },
];

const hsiFirstCigarette: OperationalOption[] = [
  { labelAr: 'خلال 5 دقائق', labelEn: 'Within 5 minutes', value: '3', score: 3 },
  { labelAr: 'من 6 إلى 30 دقيقة', labelEn: '6–30 minutes', value: '2', score: 2 },
  { labelAr: 'من 31 إلى 60 دقيقة', labelEn: '31–60 minutes', value: '1', score: 1 },
  { labelAr: 'بعد أكثر من 60 دقيقة', labelEn: 'After 60 minutes', value: '0', score: 0 },
];

const hsiCigarettesPerDay: OperationalOption[] = [
  { labelAr: '10 سجائر أو أقل', labelEn: '10 or fewer', value: '0', score: 0 },
  { labelAr: 'من 11 إلى 20 سيجارة', labelEn: '11–20', value: '1', score: 1 },
  { labelAr: 'من 21 إلى 30 سيجارة', labelEn: '21–30', value: '2', score: 2 },
  { labelAr: '31 سيجارة أو أكثر', labelEn: '31 or more', value: '3', score: 3 },
];

export const assessmentOperationalFullFormsWave8: Record<string, AssessmentOperationalMaterial> = {
  'patient-health-questionnaire-2': {
    slug: 'patient-health-questionnaire-2',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'استبيان صحة المريض — بندان (PHQ-2)',
    titleEn: 'Patient Health Questionnaire-2 (PHQ-2)',
    version: 'PHQ-2 — first two PHQ-9 items, two-week self-report',
    provenance: 'NIH HEAL Common Data Elements يوفر PHQ-2 بالعربية ويعرض Copyright: No. البندان هما البندان الأولان من PHQ-9؛ الصياغة العربية هنا متطابقة مع صياغة PHQ-9 التشغيلية المرتبطة بمصدر NIH داخل روافد.',
    rightsNotice: 'لا يلزم إذن لإعادة إنتاج PHQ-2 أو ترجمته أو عرضه أو توزيعه وفق سجل NIH CDE/PHQ. حافظ على البندين والفترة المرجعية وخيارات الاستجابة دون تحويل الأداة إلى نسخة معدلة.',
    intendedUseAr: 'فحص أولي سريع لأعراض الاكتئاب خلال الأسبوعين الماضيين. لا يشخص اضطرابًا اكتئابيًا ولا يقيّم خطر الانتحار.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'سياق التطبيق'],
    preflightChecks: ['تأكيد الفترة المرجعية: الأسبوعان الماضيان.', 'توفير خصوصية مناسبة للإجابة.', 'عدم استخدام PHQ-2 كبديل عن سؤال السلامة المباشر عند وجود قلق بشأن إيذاء النفس أو الانتحار.'],
    sections: [{
      titleAr: 'خلال الأسبوعين الماضيين، كم مرة أزعجتك المشكلات التالية؟',
      items: [
        { code: 'PHQ2-1', labelAr: 'قلة الاهتمام أو المتعة في القيام بالأشياء.', labelEn: 'Little interest or pleasure in doing things', type: 'choice', options: phqFrequency },
        { code: 'PHQ2-2', labelAr: 'الشعور بالإحباط أو الاكتئاب أو اليأس.', labelEn: 'Feeling down, depressed, or hopeless', type: 'choice', options: phqFrequency },
      ],
    }],
    scoringSteps: ['اجمع درجتي البندين: 0–3 لكل بند، والمجموع الكلي 0–6.', 'في دراسة التحقق الأصلية كان مجموع 3 نقطة قطع شائعة للفحص؛ عمليًا الدرجة ≥3 تستدعي تقييمًا أوسع للاكتئاب وفق السياق.', 'لا تضف سؤال الأثر الوظيفي أو بقية PHQ-9 إلى مجموع PHQ-2؛ إذا احتجت تقييمًا أوسع استخدم أداة منفصلة موثقة.', 'لا تستخدم المجموع لإثبات تشخيص أو لنفي خطر الانتحار.'],
    interpretationGuardrails: ['PHQ-2 أداة screening وليست تشخيصًا.', 'القطع ≥3 مدعوم في الدراسة الأصلية لكنه لا يملك حساسية/نوعية ثابتة في كل مجتمع.', 'دراسة عربية 2025 دعمت خصائص الأداة لدى عينة محددة من أمهات سعوديات لأطفال ذوي إعاقة ذهنية؛ لا تُعمم عتبات تلك العينة على المنطقة العربية كلها.', 'PHQ-2 لا يحتوي أي بند عن أفكار الموت أو إيذاء النفس؛ السلامة تُقيّم بمسار مستقل عند الحاجة.'],
    stopRules: ['عند وجود خطر فوري على النفس أو الآخرين انتقل إلى مسار السلامة/الطوارئ المحلي بدل الاستمرار كنموذج فرز روتيني.', 'إذا تعذر فهم خيارات الاستجابة أو الفترة المرجعية فاستعمل طريقة تطبيق مناسبة أو تقييمًا مهنيًا بدل استخراج درجة غير صالحة.'],
    officialDownloads: [
      { label: 'NIH HEAL CDE — PHQ-2 Arabic CRF and Copyright: No', url: 'https://www.nih.gov/node/19936', language: 'ar', publisher: 'NIH' },
    ],
    sourceUrls: [
      'https://www.nih.gov/node/19936',
      'https://pubmed.ncbi.nlm.nih.gov/14583691/',
      'https://pubmed.ncbi.nlm.nih.gov/40687118/',
    ],
    lastVerifiedOn: '2026-09-06',
  },
  'heaviness-of-smoking-index': {
    slug: 'heaviness-of-smoking-index',
    kind: 'full-instrument',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'مؤشر شدة التدخين (HSI)',
    titleEn: 'Heaviness of Smoking Index (HSI)',
    version: 'Original two-item HSI — cigarettes only',
    provenance: 'PhenX Toolkit يعرّف HSI كبروتوكول من بندين مشتق من FTND ويصرح بأن البروتوكول freely available وأن permission not required for use. بنية الفئات والتسجيل تتبع دراسة Heatherton وزملائه الأصلية عام 1989.',
    rightsNotice: 'PhenX يثبت أن HSI متاح للاستخدام دون طلب إذن. الصياغة العربية هنا تقديم تشغيلي من روافد لبنية HSI وليست ادعاءً بوجود نسخة عربية معيارية محققة مستقلة.',
    intendedUseAr: 'تقدير سريع لشدة نمط تدخين السجائر المرتبط باعتماد النيكوتين. لا يستخدم لتشخيص اضطراب استخدام التبغ، ولا يطبق على الشيشة أو السجائر الإلكترونية أو منتجات النيكوتين الأخرى دون دليل خاص.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'حالة تدخين السجائر', 'سياق التطبيق'],
    preflightChecks: ['تأكيد أن الشخص يدخن السجائر حاليًا وأن السؤالين يتعلقان بالسجائر فقط.', 'عدم تحويل عدد وحدات الشيشة أو جلسات التدخين أو السجائر الإلكترونية إلى عدد سجائر بصورة تقديرية.', 'تحديد أن المقصود بزمن أول سيجارة هو الزمن بعد الاستيقاظ من النوم.'],
    sections: [{
      titleAr: 'مؤشر شدة التدخين — سؤالان',
      titleEn: 'Heaviness of Smoking Index — two items',
      items: [
        { code: 'HSI-TTFC', labelAr: 'بعد كم من الوقت من استيقاظك تدخن سيجارتك الأولى؟', labelEn: 'How soon after you wake up do you smoke your first cigarette?', type: 'choice', options: hsiFirstCigarette },
        { code: 'HSI-CPD', labelAr: 'كم سيجارة تدخن في اليوم عادةً؟', labelEn: 'How many cigarettes do you smoke per day?', type: 'choice', options: hsiCigarettesPerDay },
      ],
    }],
    scoringSteps: ['سجل درجة زمن أول سيجارة من 0 إلى 3 حسب الفئة المحددة.', 'سجل درجة عدد السجائر اليومية من 0 إلى 3 حسب الفئة المحددة.', 'اجمع الدرجتين فقط: المجموع الكلي من 0 إلى 6.', 'لا تضف بنودًا أخرى من FTND إلى مجموع HSI ولا تحوّل الدرجة إلى تشخيص مستقل.'],
    interpretationGuardrails: ['كلما ارتفعت الدرجة زادت شدة نمط التدخين المرتبط بالاعتماد على النيكوتين.', 'العتبات الوصفية تختلف بين الدراسات والخدمات؛ لا تفرض روافد حدًا تشخيصيًا عالميًا.', 'HSI مختصر وقد يظهر تأثيرًا أرضيًا عند المدخنين الخفيفين.', 'وجود دراسات عربية على FTND/FTCD يدعم ملاءمة البندين لغويًا وسياقيًا لكنه لا يثبت وحده خصائص HSI العربي كأداة مستقلة.'],
    stopRules: ['إذا كان الشخص لا يدخن السجائر فلا تستخرج HSI من منتجات تبغ أو نيكوتين أخرى.', 'إذا تعذر تحديد عدد السجائر اليومية أو زمن أول سيجارة بصورة ذات معنى، وثق ذلك بدل اختلاق فئة تقريبية.', 'الأعراض الطبية الحادة أو الاشتباه بتسمم النيكوتين أو ضيق النفس الحاد تستلزم تقييمًا طبيًا مناسبًا لا استكمال أداة قياس روتينية.'],
    officialDownloads: [
      { label: 'PhenX Toolkit — Heaviness of Smoking Index protocol', url: 'https://www.phenxtoolkit.org/protocols/view/330201?origin=browse', language: 'en', publisher: 'PhenX Toolkit' },
    ],
    sourceUrls: [
      'https://www.phenxtoolkit.org/protocols/view/330201?origin=browse',
      'https://pubmed.ncbi.nlm.nih.gov/2758152/',
      'https://pubmed.ncbi.nlm.nih.gov/22799320/',
      'https://pubmed.ncbi.nlm.nih.gov/23457896/',
    ],
    lastVerifiedOn: '2026-09-06',
  },
};