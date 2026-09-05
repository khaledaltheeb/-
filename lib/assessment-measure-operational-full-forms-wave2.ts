import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const severity04: OperationalOption[] = [
  { labelAr: '0 — غائب', value: '0', score: 0 },
  { labelAr: '1 — خفيف', value: '1', score: 1 },
  { labelAr: '2 — متوسط', value: '2', score: 2 },
  { labelAr: '3 — شديد', value: '3', score: 3 },
  { labelAr: '4 — شديد جدًا', value: '4', score: 4 },
];

const score02: OperationalOption[] = [0, 1, 2].map((score) => ({ labelAr: String(score), value: String(score), score }));
const score04: OperationalOption[] = [0, 1, 2, 3, 4].map((score) => ({ labelAr: String(score), value: String(score), score }));

const auditFrequency: OperationalOption[] = [
  { labelAr: 'أبدًا', value: '0', score: 0 },
  { labelAr: 'مرة شهريًا أو أقل', value: '1', score: 1 },
  { labelAr: '2–4 مرات في الشهر', value: '2', score: 2 },
  { labelAr: '2–3 مرات في الأسبوع', value: '3', score: 3 },
  { labelAr: '4 مرات أو أكثر في الأسبوع', value: '4', score: 4 },
];

const auditQuantity: OperationalOption[] = [
  { labelAr: '1 أو 2', value: '0', score: 0 },
  { labelAr: '3 أو 4', value: '1', score: 1 },
  { labelAr: '5 أو 6', value: '2', score: 2 },
  { labelAr: '7 إلى 9', value: '3', score: 3 },
  { labelAr: '10 أو أكثر', value: '4', score: 4 },
];

const auditPastYearFrequency: OperationalOption[] = [
  { labelAr: 'أبدًا', value: '0', score: 0 },
  { labelAr: 'أقل من مرة شهريًا', value: '1', score: 1 },
  { labelAr: 'شهريًا', value: '2', score: 2 },
  { labelAr: 'أسبوعيًا', value: '3', score: 3 },
  { labelAr: 'يوميًا أو شبه يومي', value: '4', score: 4 },
];

const auditConcern: OperationalOption[] = [
  { labelAr: 'لا', value: '0', score: 0 },
  { labelAr: 'نعم، لكن ليس خلال السنة الماضية', value: '2', score: 2 },
  { labelAr: 'نعم، خلال السنة الماضية', value: '4', score: 4 },
];

const barsObjective: OperationalOption[] = [
  { labelAr: '0 — طبيعي؛ حركات تململ عرضية فقط في الأطراف', value: '0', score: 0 },
  { labelAr: '1 — حركات تململ مميزة موجودة لأقل من نصف زمن الملاحظة', value: '1', score: 1 },
  { labelAr: '2 — الحركات المميزة موجودة لنصف زمن الملاحظة على الأقل', value: '2', score: 2 },
  { labelAr: '3 — تململ مميز شبه مستمر و/أو عدم القدرة على البقاء جالسًا أو واقفًا دون مشي أو إيقاع الحركة', value: '3', score: 3 },
];

const barsAwareness: OperationalOption[] = [
  { labelAr: '0 — لا يوجد شعور داخلي بالتململ', value: '0', score: 0 },
  { labelAr: '1 — إحساس داخلي غير نوعي بالتململ', value: '1', score: 1 },
  { labelAr: '2 — وعي بعدم القدرة على إبقاء الساقين ساكنتين أو رغبة في تحريكهما، ويزداد عند طلب الوقوف ساكنًا', value: '2', score: 2 },
  { labelAr: '3 — اندفاع شديد للحركة معظم الوقت و/أو رغبة قوية في المشي أو الإيقاع معظم الوقت', value: '3', score: 3 },
];

const barsDistress: OperationalOption[] = [
  { labelAr: '0 — لا ضيق', value: '0', score: 0 },
  { labelAr: '1 — ضيق خفيف', value: '1', score: 1 },
  { labelAr: '2 — ضيق متوسط', value: '2', score: 2 },
  { labelAr: '3 — ضيق شديد', value: '3', score: 3 },
];

const barsGlobal: OperationalOption[] = [
  { labelAr: '0 — غائبة؛ لا دليل على وعي بالتململ. الحركات دون شعور داخلي قد تمثل pseudoakathisia', value: '0', score: 0 },
  { labelAr: '1 — مشكوك فيها؛ توتر داخلي غير نوعي مع تململ حركي', value: '1', score: 1 },
  { labelAr: '2 — خفيفة؛ وعي بالتململ مع ضيق قليل أو معدوم، وقد لا تُلاحظ الحركات المميزة بوضوح', value: '2', score: 2 },
  { labelAr: '3 — متوسطة؛ وعي بالتململ مع حركات مميزة واضحة وحالة مزعجة للمريض', value: '3', score: 3 },
  { labelAr: '4 — ملحوظة/Marked؛ رغبة قهرية في المشي أو الإيقاع، مع القدرة على البقاء جالسًا خمس دقائق على الأقل', value: '4', score: 4 },
  { labelAr: '5 — شديدة؛ اندفاع قوي للمشي معظم الوقت وعدم القدرة على الجلوس أو الاستلقاء لأكثر من دقائق قليلة مع ضيق شديد', value: '5', score: 5 },
];

const pasiSeverity: OperationalOption[] = [
  { labelAr: '0 — لا يوجد', value: '0', score: 0 },
  { labelAr: '1 — خفيف', value: '1', score: 1 },
  { labelAr: '2 — متوسط', value: '2', score: 2 },
  { labelAr: '3 — شديد', value: '3', score: 3 },
  { labelAr: '4 — شديد جدًا', value: '4', score: 4 },
];

const pasiArea: OperationalOption[] = [
  { labelAr: '0 — 0% من المنطقة', value: '0', score: 0 },
  { labelAr: '1 — 1–9%', value: '1', score: 1 },
  { labelAr: '2 — 10–29%', value: '2', score: 2 },
  { labelAr: '3 — 30–49%', value: '3', score: 3 },
  { labelAr: '4 — 50–69%', value: '4', score: 4 },
  { labelAr: '5 — 70–89%', value: '5', score: 5 },
  { labelAr: '6 — 90–100%', value: '6', score: 6 },
];

export const assessmentOperationalFullFormsWave2: Record<string, AssessmentOperationalMaterial> = {
  'alcohol-use-disorders-identification-test-consumption': {
    slug: 'alcohol-use-disorders-identification-test-consumption',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'اختبار تحديد اضطرابات استخدام الكحول — أسئلة الاستهلاك AUDIT-C',
    titleEn: 'Alcohol Use Disorders Identification Test — Consumption (AUDIT-C)',
    version: '3-item AUDIT-C',
    provenance: 'CDISC يصنف AUDIT-C ضمن Public Domain. البنود والبنية مأخوذة من عائلة AUDIT التابعة لمنظمة الصحة العالمية؛ الصياغة العربية هنا ترجمة تشغيلية من روافد وليست نسخة عربية رسمية محققة بعينها.',
    rightsNotice: 'الأداة الأصلية Public Domain وفق CDISC. لا يعني ذلك أن كل ترجمة منشورة من طرف ثالث حرة تلقائيًا؛ لذلك تُوسم هذه العربية كترجمة تشغيلية وتُطابق ترجمة محققة قبل بروتوكول بحثي رسمي.',
    intendedUseAr: 'فحص مختصر لنمط استهلاك الكحول بهدف تحديد الحاجة إلى تقييم أوسع. لا يثبت اضطراب استخدام الكحول ولا يحدد خطة علاج بمفرده.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'السياق السريري/البحثي', 'تعريف المشروب المعياري المستخدم محليًا'],
    preflightChecks: ['حدد للمجيب ما المقصود بالمشروب الكحولي والمشروب المعياري وفق البروتوكول/البلد.', 'احفظ الخصوصية وتجنب صياغة حكمية تزيد نقص الإفصاح.', 'إذا كان المجيب لا يشرب مطلقًا فسجّل ذلك بوضوح ولا تحوّل النتيجة إلى تشخيص.'],
    sections: [{
      titleAr: 'أسئلة AUDIT-C الثلاثة',
      instructionsAr: 'اختر إجابة واحدة لكل سؤال. هذه ترجمة تشغيلية عربية من روافد للبنية الأصلية.',
      items: [
        { code: 'AUDITC1', labelAr: 'كم مرة تتناول مشروبًا يحتوي على الكحول؟', type: 'choice', options: auditFrequency },
        { code: 'AUDITC2', labelAr: 'في يوم اعتيادي تشرب فيه، كم عدد المشروبات المعيارية المحتوية على الكحول التي تتناولها؟', type: 'choice', options: auditQuantity },
        { code: 'AUDITC3', labelAr: 'كم مرة تتناول ستة مشروبات أو أكثر في مناسبة واحدة؟', type: 'choice', options: auditPastYearFrequency },
      ],
    }],
    scoringSteps: ['اجمع درجات البنود الثلاثة: المجموع 0–12.', 'الدرجة الأعلى تعكس نمط استهلاك أكثر احتمالًا لأن يكون ذا خطورة أو أثر صحي.', 'لا تعتمد روافد حدًا واحدًا عالميًا؛ العتبة المثلى تختلف حسب السكان والغرض والجنس والسياق، ويجب تثبيتها من بروتوكول محلي/بحثي مناسب.', 'النتيجة الإيجابية تقود إلى تقييم أوسع مثل AUDIT الكامل أو مقابلة سريرية، لا إلى تشخيص آلي.'],
    interpretationGuardrails: ['AUDIT-C أداة فحص وليست تشخيصًا.', 'تعريف المشروب المعياري والفترة المرجعية يجب أن يبقيا ثابتين عند المقارنة.', 'لا تستخدم النتيجة لتقدير شدة الانسحاب أو الخطر الطبي الحاد.'],
    stopRules: ['تسمم حاد، تغير وعي، اختلاجات، هذيان أو اشتباه انسحاب شديد يحتاج تقييمًا طبيًا عاجلًا مستقلًا عن الدرجة.'],
    officialDownloads: [
      { label: 'WHO — AUDIT guidelines for primary care', url: 'https://www.who.int/publications/i/item/WHO-MSD-MSB-01.6a', language: 'en', publisher: 'World Health Organization' },
      { label: 'CDISC QRS — AUDIT-C Public Domain record', url: 'https://www.cdisc.org/standards/foundational/qrs', language: 'en', publisher: 'CDISC' },
    ],
    sourceUrls: ['https://www.who.int/publications/i/item/WHO-MSD-MSB-01.6a', 'https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn: '2026-09-06',
  },

  'alcohol-use-disorders-identification-test-self-report': {
    slug: 'alcohol-use-disorders-identification-test-self-report',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'اختبار تحديد اضطرابات استخدام الكحول — التقرير الذاتي AUDIT',
    titleEn: 'Alcohol Use Disorders Identification Test — Self-Report (AUDIT-SR)',
    version: '10-item self-report AUDIT',
    provenance: 'منظمة الصحة العالمية نشرت دليل AUDIT ذي 10 بنود، وCDISC يصنف AUDIT-SR ضمن Public Domain. الصياغة العربية التالية ترجمة تشغيلية من روافد وليست ادعاءً بأنها ترجمة WHO عربية رسمية أو نسخة محققة بعينها.',
    rightsNotice: 'الأداة الأصلية Public Domain وفق CDISC. عند الاستخدام السريري أو البحثي العربي الرسمي اختر ترجمة عربية محققة محددة ووثق مصدرها؛ لا تنسب ترجمة روافد إلى WHO.',
    intendedUseAr: 'فحص أنماط الاستهلاك الخطر والضار ومؤشرات الاعتماد والعواقب المرتبطة بالكحول ضمن الرعاية الأولية أو مسار تقييم أوسع.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'طريقة التطبيق', 'تعريف المشروب المعياري المستخدم', 'المقيم/الجهة عند التطبيق بالمقابلة'],
    preflightChecks: ['الفترة المرجعية الأساسية في دليل WHO هي السنة الماضية.', 'اشرح معنى المشروب المعياري بما يتسق مع البروتوكول المحلي.', 'وفر خصوصية كافية؛ الإفصاح قد يتأثر بالوصمة أو الخوف من العواقب.', 'لا تستخدم AUDIT بدل تقييم الانسحاب أو الخطر الطبي.'],
    sections: [
      {
        titleAr: 'الاستهلاك — البنود 1–3',
        items: [
          { code: 'AUDIT1', labelAr: 'كم مرة تتناول مشروبًا يحتوي على الكحول؟', type: 'choice', options: auditFrequency },
          { code: 'AUDIT2', labelAr: 'في يوم اعتيادي تشرب فيه، كم عدد المشروبات المعيارية المحتوية على الكحول التي تتناولها؟', type: 'choice', options: auditQuantity },
          { code: 'AUDIT3', labelAr: 'كم مرة تتناول ستة مشروبات أو أكثر في مناسبة واحدة؟', type: 'choice', options: auditPastYearFrequency },
        ],
      },
      {
        titleAr: 'فقد السيطرة ومؤشرات الاعتماد — البنود 4–6',
        instructionsAr: 'خلال السنة الماضية:',
        items: [
          { code: 'AUDIT4', labelAr: 'كم مرة وجدت أنك غير قادر على التوقف عن الشرب بعد أن بدأت؟', type: 'choice', options: auditPastYearFrequency },
          { code: 'AUDIT5', labelAr: 'كم مرة أخفقت بسبب الشرب في القيام بما كان متوقعًا منك عادةً؟', type: 'choice', options: auditPastYearFrequency },
          { code: 'AUDIT6', labelAr: 'كم مرة احتجت إلى مشروب في الصباح لتستعيد نشاطك بعد جلسة شرب كثيفة؟', type: 'choice', options: auditPastYearFrequency },
        ],
      },
      {
        titleAr: 'العواقب والقلق من الآخرين — البنود 7–10',
        items: [
          { code: 'AUDIT7', labelAr: 'خلال السنة الماضية، كم مرة شعرت بالذنب أو الندم بعد الشرب؟', type: 'choice', options: auditPastYearFrequency },
          { code: 'AUDIT8', labelAr: 'خلال السنة الماضية، كم مرة عجزت عن تذكر ما حدث في الليلة السابقة بسبب الشرب؟', type: 'choice', options: auditPastYearFrequency },
          { code: 'AUDIT9', labelAr: 'هل أصبت أنت أو شخص آخر بأذى نتيجة شربك؟', type: 'choice', options: auditConcern },
          { code: 'AUDIT10', labelAr: 'هل أبدى قريب أو صديق أو طبيب أو عامل صحي قلقًا بشأن شربك أو اقترح عليك التقليل منه؟', type: 'choice', options: auditConcern },
        ],
      },
    ],
    scoringSteps: ['اجمع درجات البنود العشرة: المجموع 0–40.', 'وفق دليل WHO، الدرجة 8 أو أكثر استُخدمت تاريخيًا كمؤشر يحتاج انتباهًا أكبر، لكن حساسية/نوعية العتبة تتغير حسب السكان والغرض.', 'لا تحول نطاقات التدخل أو العتبات إلى تشخيص آلي؛ إذا كانت النتيجة مرتفعة أو ظهرت مخاطر أخرى فأكمل تقييمًا سريريًا مناسبًا.', 'راجع البنود 4–10 نوعيًا؛ قد تكون بعض العواقب المهمة سريريًا ذات قيمة حتى مع مجموع غير مرتفع.'],
    interpretationGuardrails: ['AUDIT فحص وليس معيارًا تشخيصيًا مستقلًا لاضطراب استخدام الكحول.', 'لا تساوِ الدرجة مع شدة الانسحاب.', 'استخدم النسخة واللغة وتعريف المشروب المعياري نفسيهما في القياسات المتكررة.', 'لا تعمم أداء دراسة تحقق عربية في مجتمع واحد على جميع البلدان أو الفئات العربية.'],
    stopRules: ['علامات الانسحاب الشديد أو التسمم الحاد أو خطر الانتحار/العنف أو اضطراب الوعي تحتاج مسار سلامة/رعاية عاجلة مستقلًا عن AUDIT.'],
    officialDownloads: [
      { label: 'WHO — AUDIT Guidelines for Use in Primary Care, 2nd ed.', url: 'https://www.who.int/publications/i/item/WHO-MSD-MSB-01.6a', language: 'en', publisher: 'World Health Organization' },
      { label: 'CDISC QRS — AUDIT-SR Public Domain record', url: 'https://www.cdisc.org/standards/foundational/qrs', language: 'en', publisher: 'CDISC' },
    ],
    sourceUrls: ['https://www.who.int/publications/i/item/WHO-MSD-MSB-01.6a', 'https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn: '2026-09-06',
  },

  'hamilton-anxiety-rating-scale': {
    slug: 'hamilton-anxiety-rating-scale',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس هاملتون لتقدير القلق — HAM-A',
    titleEn: 'Hamilton Anxiety Rating Scale',
    version: '14-item clinician-rated HAM-A',
    provenance: 'CDISC يصنف HAM-A ضمن Public Domain. الأداة الأصلية تتكون من 14 مجالًا يقدّر كل منها 0–4. النص العربي هنا ترجمة تشغيلية من روافد للمجالات ومحتواها السريري وليست نسخة عربية محققة منشورة بعينها.',
    rightsNotice: 'HAM-A الأصلية Public Domain؛ الأدلة أو المقابلات المنظمة المشتقة لاحقًا قد تحمل حقوقًا مختلفة. لا تنسب هذه الصياغة العربية إلى ناشر أو دراسة تحقق ما لم تُطابق نسختها.',
    intendedUseAr: 'تقدير شدة أعراض القلق النفسية والجسدية بواسطة فاحص سريري مدرب ومتابعة التغير بمرور الوقت.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'التشخيص/السياق', 'الأدوية والتغيرات الحديثة', 'الفترة المرجعية المستخدمة'],
    preflightChecks: ['يُطبق بواسطة فاحص قادر على التفريق بين القلق وأعراض المرض الطبي والآثار الدوائية.', 'ثبّت الفترة المرجعية وطريقة المقابلة بين الزيارات.', 'لا تفسر الأعراض القلبية أو التنفسية أو العصبية تلقائيًا على أنها قلق.'],
    sections: [{
      titleAr: 'مجالات HAM-A الأربعة عشر — قدّر شدة كل مجال من 0 إلى 4',
      instructionsAr: '0 غائب، 1 خفيف، 2 متوسط، 3 شديد، 4 شديد جدًا. استخدم أمثلة المجال لتوجيه الحكم ولا تجمع أعراضًا غير مرتبطة به.',
      items: [
        { code: 'HAMA1', labelAr: 'المزاج القَلِق: القلق، توقع الأسوأ، التوجس، سرعة الاستثارة/التهيج.', type: 'task-score', options: severity04 },
        { code: 'HAMA2', labelAr: 'التوتر: إحساس بالتوتر، سهولة التعب، الفزع، البكاء بسهولة، الارتجاف، التململ، صعوبة الاسترخاء.', type: 'task-score', options: severity04 },
        { code: 'HAMA3', labelAr: 'المخاوف: مثل الظلام أو الغرباء أو البقاء وحيدًا أو الحيوانات أو المرور أو الحشود بحسب ما ينطبق.', type: 'task-score', options: severity04 },
        { code: 'HAMA4', labelAr: 'الأرق: صعوبة بدء النوم أو استمراره، نوم غير مُرضٍ، تعب عند الاستيقاظ، أحلام أو كوابيس واضطرابات ليلية.', type: 'task-score', options: severity04 },
        { code: 'HAMA5', labelAr: 'الوظيفة المعرفية/الذهنية: صعوبة التركيز وضعف الذاكرة.', type: 'task-score', options: severity04 },
        { code: 'HAMA6', labelAr: 'المزاج المكتئب: فقد الاهتمام أو المتعة، الاكتئاب، تغيرات الاستيقاظ أو التباين اليومي للمزاج.', type: 'task-score', options: severity04 },
        { code: 'HAMA7', labelAr: 'الأعراض الجسدية العضلية: آلام وتيبس، نفضات عضلية، صرير الأسنان، عدم ثبات الصوت أو زيادة التوتر العضلي.', type: 'task-score', options: severity04 },
        { code: 'HAMA8', labelAr: 'الأعراض الجسدية الحسية: طنين، تشوش الرؤية، هبات ساخنة/باردة، ضعف أو إحساس بالوخز.', type: 'task-score', options: severity04 },
        { code: 'HAMA9', labelAr: 'الأعراض القلبية الوعائية: تسرع القلب، خفقان، ألم صدري، نبضات وعائية، شعور بالإغماء أو اضطراب النبض.', type: 'task-score', options: severity04 },
        { code: 'HAMA10', labelAr: 'الأعراض التنفسية: ضغط أو انقباض صدري، إحساس بالاختناق، التنهد، ضيق النفس.', type: 'task-score', options: severity04 },
        { code: 'HAMA11', labelAr: 'الأعراض المعدية المعوية: صعوبة البلع، غازات/ألم بطني، حرقة أو امتلاء، غثيان/قيء، اضطراب الأمعاء أو الإمساك أو نقص الوزن.', type: 'task-score', options: severity04 },
        { code: 'HAMA12', labelAr: 'الأعراض البولية/التناسلية: تكرار أو إلحاح بولي، اضطرابات الدورة، نقص الرغبة أو الوظيفة الجنسية بحسب السياق.', type: 'task-score', options: severity04 },
        { code: 'HAMA13', labelAr: 'الأعراض اللاإرادية: جفاف الفم، الاحمرار أو الشحوب، التعرق، الدوار، صداع التوتر أو انتصاب الشعر.', type: 'task-score', options: severity04 },
        { code: 'HAMA14', labelAr: 'السلوك أثناء المقابلة: التململ، الحركة، الارتجاف، تعبير الوجه المتوتر، التنهد/التنفس السريع أو مظاهر القلق الملحوظة.', type: 'task-score', options: severity04 },
      ],
    }],
    scoringSteps: ['اجمع البنود الأربعة عشر: المجموع 0–56.', 'لا تستخدم عتبة واحدة بوصفها تشخيصًا؛ نطاقات الشدة المنشورة تختلف باختلاف الدراسة والسكان وطريقة المقابلة.', 'افحص نمط البنود النفسية والجسدية بدل الاعتماد على المجموع فقط، خصوصًا عند وجود مرض طبي أو آثار دوائية.'],
    interpretationGuardrails: ['HAM-A يقيس الشدة ولا يحدد اضطراب القلق النوعي بمفرده.', 'البنود الجسدية قد تتأثر بحالات قلبية أو تنفسية أو غدية أو دوائية.', 'جودة القياس تعتمد على تدريب المقيم وثبات المقابلة.'],
    stopRules: ['ألم صدري حاد، إغماء، ضيق نفس مقلق، اضطراب وعي أو خطر انتحار/عنف يحتاج تقييمًا مباشرًا مستقلًا عن الدرجة.'],
    officialDownloads: [{ label: 'CDISC QRS — Hamilton Anxiety Rating Scale, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/hamilton-anxiety-rating-scale', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/hamilton-anxiety-rating-scale', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5546554/'],
    lastVerifiedOn: '2026-09-06',
  },

  'barnes-akathisia-rating-scale': {
    slug: 'barnes-akathisia-rating-scale',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس بارنز لتقدير الأكاثيزيا — BARS',
    titleEn: 'Barnes Akathisia Rating Scale',
    version: 'Barnes 1989 / CDISC QRS',
    provenance: 'CDISC يصنف BARS ضمن Public Domain. بُنيت الورقة على بنية Barnes الأصلية: ملاحظة موضوعية، وعي ذاتي بالتململ، الضيق، ثم التقدير السريري العالمي. الصياغة العربية ترجمة تشغيلية من روافد.',
    rightsNotice: 'المقياس الأصلي Public Domain وفق CDISC. حافظ على بنية العناصر والمراسي؛ لا تخلط BARS مع مقاييس الهياج العامة التي تستخدم الاختصار نفسه أحيانًا.',
    intendedUseAr: 'اكتشاف وتقدير شدة الأكاثيزيا الدوائية ومتابعتها، خصوصًا عند استخدام مضادات الذهان أو أدوية قد تسبب التململ الحركي.',
    respondentFields: ['الاسم/الرمز', 'التاريخ والوقت', 'الفاحص', 'الأدوية والجرعات', 'تاريخ بدء/تغير الأعراض'],
    preflightChecks: ['راقب المريض جالسًا ثم واقفًا أثناء حديث محايد لمدة لا تقل عن دقيقتين في كل وضع.', 'بعد الملاحظة اسأل مباشرة عن الخبرة الذاتية للتململ والضيق.', 'فرّق قدر الإمكان بين الأكاثيزيا والقلق والهياج ومتلازمة تململ الساقين واضطرابات الحركة الأخرى.'],
    sections: [
      { titleAr: 'الملاحظة الموضوعية', items: [{ code: 'BARS-OBJ', labelAr: 'الحركات المميزة للأكاثيزيا أثناء الملاحظة', type: 'task-score', options: barsObjective }] },
      { titleAr: 'الخبرة الذاتية', items: [
        { code: 'BARS-AWARE', labelAr: 'الوعي الداخلي بالتململ/الحاجة إلى الحركة', type: 'task-score', options: barsAwareness },
        { code: 'BARS-DISTRESS', labelAr: 'الضيق المرتبط بالتململ', type: 'task-score', options: barsDistress },
      ] },
      { titleAr: 'التقدير السريري العالمي', items: [{ code: 'BARS-GLOBAL', labelAr: 'الشدة العالمية للأكاثيزيا', type: 'task-score', options: barsGlobal }] },
    ],
    scoringSteps: ['سجل العناصر الأربعة كلًا على حدة.', 'يمكن وصف مجموع الأعراض الثلاثة الأولى 0–9 عندما ينص البروتوكول على ذلك؛ لا تستبدل به التقدير العالمي 0–5.', 'قارن بالخط الأساسي وتوقيت بدء/رفع الجرعة بدل تفسير رقم منفرد خارج السياق.'],
    interpretationGuardrails: ['المقياس يدعم تشخيص/شدة الأكاثيزيا لكنه لا يثبت أن دواءً بعينه هو السبب.', 'قد تظهر حركات موضوعية دون إحساس ذاتي؛ تُراجع إمكانية pseudoakathisia بدل فرض التشخيص.', 'الأكاثيزيا الشديدة قد تقترن بضيق نفسي شديد وتحتاج تقييم سلامة.'],
    stopRules: ['وجود أفكار إيذاء النفس أو اندفاع خطير أو هياج شديد أو أعراض عصبية حادة يستوجب تقييمًا مباشرًا ولا ينتظر استكمال المقياس.'],
    officialDownloads: [{ label: 'CDISC QRS — Barnes Akathisia Rating Scale, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/barnes-akathisia-rating-scale', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/barnes-akathisia-rating-scale', 'https://pubmed.ncbi.nlm.nih.gov/2574607/', 'https://www.cambridge.org/core/books/abs/akathisia-and-restless-legs/barnes-1989-akathisia-rating-scale/C5D46739746BAD982B0BA5B513C487AC'],
    lastVerifiedOn: '2026-09-06',
  },

  'rockport-one-mile-walk-test': {
    slug: 'rockport-one-mile-walk-test',
    kind: 'protocol-sheet',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'اختبار روكبورت للمشي لمسافة ميل واحد — ورقة التطبيق والحساب',
    titleEn: 'Rockport One Mile Walk Test',
    version: 'Rockport 1-mile walk / Kline equation',
    provenance: 'CDISC يصنف Rockport One Mile Walk Test ضمن Public Domain. معادلة Kline المنشورة عام 1987 طُورت لتقدير VO₂max من مشي ميل واحد مع العمر والوزن والجنس ومعدل القلب النهائي.',
    rightsNotice: 'البروتوكول Public Domain وفق CDISC. المعادلة نموذج تقدير سكاني وليست قياسًا مباشرًا لـVO₂max ولا تشخيصًا للياقة أو مرض القلب.',
    intendedUseAr: 'تسجيل اختبار مشي ميل واحد وتقدير القدرة الهوائية عندما يكون الاختبار مناسبًا وآمنًا للفرد والسياق.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'الفاحص', 'الحالة الصحية/سبب الاختبار', 'الأدوية المؤثرة في معدل القلب'],
    preflightChecks: ['تأكد من ملاءمة اختبار الجهد الميداني وعدم وجود مانع سريري.', 'استخدم مسارًا مستويًا معلومًا بطول ميل واحد (نحو 1.609 كم) ومؤقتًا دقيقًا.', 'سجل الوزن بوحدة صحيحة؛ معادلة Kline الأصلية تستخدم الرطل.', 'يجب توثيق أن معادلة الجنس الأصلية اشتقت بترميز ثنائي (ذكر=1، أنثى=0) ولا يجوز افتراض صلاحيتها خارج مجتمع الاشتقاق.'],
    sections: [
      { titleAr: 'بيانات المعادلة', items: [
        { code: 'ROCK-AGE', labelAr: 'العمر', type: 'number', min: 0, max: 120, unit: 'سنة' },
        { code: 'ROCK-SEX', labelAr: 'ترميز الجنس في معادلة Kline الأصلية', type: 'choice', options: [{ labelAr: '0 — أنثى وفق ترميز المعادلة الأصلية', value: '0', score: 0 }, { labelAr: '1 — ذكر وفق ترميز المعادلة الأصلية', value: '1', score: 1 }] },
        { code: 'ROCK-WEIGHT-LB', labelAr: 'الوزن المستخدم في المعادلة', type: 'number', min: 0, max: 1000, unit: 'رطل lb' },
      ] },
      { titleAr: 'أداء الميل الواحد', instructionsAr: 'يمشي الشخص ميلًا واحدًا بأسرع سرعة مشي آمنة ممكنة دون الركض، مع تسجيل الزمن ومعدل القلب عند النهاية حسب البروتوكول.', items: [
        { code: 'ROCK-TIME-MIN', labelAr: 'دقائق إكمال الميل', type: 'number', min: 0, max: 120, unit: 'دقيقة' },
        { code: 'ROCK-TIME-SEC', labelAr: 'الثواني الإضافية', type: 'number', min: 0, max: 59, unit: 'ثانية' },
        { code: 'ROCK-HR-END', labelAr: 'معدل القلب عند نهاية المشي', type: 'number', min: 0, max: 260, unit: 'نبضة/دقيقة' },
        { code: 'ROCK-RPE', labelAr: 'مجهود محسوس/أعراض أثناء الاختبار — اختياري وفق البروتوكول', type: 'text' },
        { code: 'ROCK-VO2', labelAr: 'VO₂max المقدر بعد الحساب', type: 'number', min: 0, max: 100, unit: 'ml/kg/min' },
      ] },
    ],
    scoringSteps: ['حوّل الزمن إلى دقائق عشرية: الدقائق + (الثواني ÷ 60).', 'معادلة Kline الشائعة: VO₂max = 132.853 − (0.0769 × الوزن بالرطل) − (0.3877 × العمر) + (6.315 × ترميز الجنس) − (3.2649 × زمن الميل بالدقائق) − (0.1565 × معدل القلب النهائي).', 'سجل الناتج كتقدير لا كقياس مخبري مباشر.', 'لا تقارن بنتائج معيارية إلا إذا كانت مناسبة للعمر والسكان وطريقة الاختبار.'],
    interpretationGuardrails: ['العلاقة بين معدل القلب والجهد تتأثر بالأدوية مثل حاصرات بيتا وبالحالة الطبية.', 'المعادلة الأصلية طورت في بالغين أصحاء بعمر 30–69 سنة؛ الأداء خارج مجتمع الاشتقاق يحتاج حذرًا.', 'لا تستخدم نتيجة الاختبار لاستبعاد مرض قلبي أو رئوي.'],
    stopRules: ['أوقف الاختبار واتبع بروتوكول السلامة عند ألم صدري، دوخة شديدة، إغماء، ضيق نفس غير متناسب، عدم اتزان خطير أو أعراض حادة أخرى.'],
    officialDownloads: [{ label: 'CDISC QRS — Rockport One Mile Walk Test, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/rockport-one-mile-walk-test', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/rockport-one-mile-walk-test', 'https://pubmed.ncbi.nlm.nih.gov/3600239/'],
    lastVerifiedOn: '2026-09-06',
  },

  'psoriasis-area-severity-index-fredriksson': {
    slug: 'psoriasis-area-severity-index-fredriksson',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مؤشر مساحة وشدة الصدفية — PASI Fredriksson',
    titleEn: 'Psoriasis Area and Severity Index — Fredriksson',
    version: 'PASI Fredriksson / CDISC QRS Version 1.0 (2026)',
    provenance: 'CDISC نشر في 3 أبريل 2026 نسخة PASI Fredriksson كـPublic Domain. البنية الكلاسيكية تقيم الاحمرار والتثخن/الاندفاع والقشور 0–4، ومساحة الإصابة 0–6 في أربع مناطق مع أوزان 0.1/0.2/0.3/0.4.',
    rightsNotice: 'PASI Fredriksson Public Domain وفق CDISC. هذه الورقة ترجمة تشغيلية عربية للهيكل الحسابي وليست مادة تدريب جلدية بديلة عن توحيد المقيمين.',
    intendedUseAr: 'قياس شدة الصدفية ومساحة انتشارها بصورة معيارية ومتابعة التغير، خصوصًا في الدراسات والعلاج الجلدي المتخصص.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'العلاج الحالي', 'خط الأساس/الزيارة'],
    preflightChecks: ['قيّم المناطق الأربع منفصلة: الرأس، الطرفان العلويان، الجذع، الطرفان السفليان.', 'قدّر الاحمرار والتثخن والقشور كلًا من 0 إلى 4.', 'حوّل نسبة المساحة المصابة في كل منطقة إلى درجة مساحة 0–6.', 'استخدم المقيم نفسه أو تدريبًا موحدًا متى أمكن لتقليل اختلاف المقيمين.'],
    sections: [
      { titleAr: 'الرأس والرقبة — الوزن 0.1', items: [
        { code: 'PASI-H-E', labelAr: 'الاحمرار E', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-H-I', labelAr: 'التثخن/الاندفاع I', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-H-D', labelAr: 'القشور/التوسف D', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-H-A', labelAr: 'مساحة الإصابة A', type: 'task-score', options: pasiArea },
      ] },
      { titleAr: 'الطرفان العلويان — الوزن 0.2', items: [
        { code: 'PASI-U-E', labelAr: 'الاحمرار E', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-U-I', labelAr: 'التثخن/الاندفاع I', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-U-D', labelAr: 'القشور/التوسف D', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-U-A', labelAr: 'مساحة الإصابة A', type: 'task-score', options: pasiArea },
      ] },
      { titleAr: 'الجذع — الوزن 0.3', items: [
        { code: 'PASI-T-E', labelAr: 'الاحمرار E', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-T-I', labelAr: 'التثخن/الاندفاع I', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-T-D', labelAr: 'القشور/التوسف D', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-T-A', labelAr: 'مساحة الإصابة A', type: 'task-score', options: pasiArea },
      ] },
      { titleAr: 'الطرفان السفليان — الوزن 0.4', items: [
        { code: 'PASI-L-E', labelAr: 'الاحمرار E', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-L-I', labelAr: 'التثخن/الاندفاع I', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-L-D', labelAr: 'القشور/التوسف D', type: 'task-score', options: pasiSeverity },
        { code: 'PASI-L-A', labelAr: 'مساحة الإصابة A', type: 'task-score', options: pasiArea },
      ] },
      { titleAr: 'النتيجة', items: [{ code: 'PASI-TOTAL', labelAr: 'PASI الكلي بعد الحساب', type: 'number', min: 0, max: 72, unit: '0–72' }] },
    ],
    scoringSteps: ['لكل منطقة: اجمع E + I + D، ثم اضرب في درجة المساحة A ثم في وزن المنطقة.', 'PASI = 0.1(Eh+Ih+Dh)Ah + 0.2(Eu+Iu+Du)Au + 0.3(Et+It+Dt)At + 0.4(El+Il+Dl)Al.', 'النطاق الكلي 0–72.', 'عند حساب PASI 75/90 مثلًا، المقصود نسبة التحسن من خط أساس موثق، لا درجة مطلقة جديدة.'],
    interpretationGuardrails: ['PASI لا يلتقط وحده تأثير المرض على جودة الحياة أو المواقع الخاصة أو الأعراض مثل الحكة.', 'الاختلاف بين المقيمين قد يؤثر في التقدير؛ التدريب والتوحيد مهمان.', 'لا تستخدم رقم PASI منفردًا لاتخاذ قرار علاجي خارج إرشاد متخصص.'],
    stopRules: ['الاشتباه بعدوى جلدية شديدة، تدهور جهازي أو تفاعل دوائي خطير يحتاج تقييمًا طبيًا مستقلًا.'],
    officialDownloads: [{ label: 'CDISC QRS — PASI Fredriksson, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/psoriasis-area-and-severity-index-version-fredriksson-pasi-fredriksson', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/psoriasis-area-and-severity-index-version-fredriksson-pasi-fredriksson', 'https://dermnetnz.org/topics/pasi-score'],
    lastVerifiedOn: '2026-09-06',
  },

  'hamilton-depression-rating-scale-17': {
    slug: 'hamilton-depression-rating-scale-17',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'مقياس هاملتون لتقدير الاكتئاب — HAMD-17 ورقة التسجيل',
    titleEn: 'Hamilton Depression Rating Scale — 17 Item',
    version: 'HAMD-17 / CDISC RS Version 2.1 (2026)',
    provenance: 'CDISC يصنف HAMD-17 ضمن Public Domain. هذه الورقة تنقل المجالات السبعة عشر ونطاق التسجيل الصحيح لكل عنصر، لكنها لا تدّعي أنها مقابلة عربية منظمة أو ترجمة عربية محققة لمراسي كل درجة.',
    rightsNotice: 'HAMD-17 الأصلية Public Domain. المقابلات المنظمة المشتقة وترجمات الأطراف الثالثة قد تكون لها شروط منفصلة. استخدم دليل/ترجمة محددة عند الحاجة إلى موثوقية بحثية رسمية.',
    intendedUseAr: 'تسجيل شدة 17 مجالًا من أعراض الاكتئاب بواسطة فاحص سريري مدرب ومتابعة التغير؛ ليست أداة تشخيص ذاتي.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'التشخيص/السياق', 'الفترة المرجعية', 'الأدوية/التغيرات العلاجية'],
    preflightChecks: ['يُطبق بواسطة مقيم سريري مدرب.', 'استخدم مراسي HAMD-17 المحددة نفسها بين الزيارات.', 'بند الانتحار يُراجع مستقلًا عن المجموع؛ أي خطر حالي يحتاج تقييم سلامة مباشرًا.'],
    sections: [{
      titleAr: 'بنود HAMD-17 ونطاقاتها الأصلية',
      instructionsAr: 'هذه ورقة تسجيل بنيوية؛ راجع مراسي الوصف التفصيلية من النسخة المرجعية قبل التقييم الرسمي.',
      items: [
        { code: 'HAMD17-1', labelAr: '1. المزاج المكتئب', type: 'task-score', options: score04 },
        { code: 'HAMD17-2', labelAr: '2. مشاعر الذنب', type: 'task-score', options: score04 },
        { code: 'HAMD17-3', labelAr: '3. أفكار/سلوك الانتحار', type: 'task-score', options: score04, noteAr: 'أي درجة تشير إلى أفكار موت/إيذاء النفس تستلزم تقييم سلامة مباشرًا بحسب السياق، ولا تنتظر المجموع.' },
        { code: 'HAMD17-4', labelAr: '4. الأرق — بداية الليل', type: 'task-score', options: score02 },
        { code: 'HAMD17-5', labelAr: '5. الأرق — منتصف الليل', type: 'task-score', options: score02 },
        { code: 'HAMD17-6', labelAr: '6. الأرق — الاستيقاظ المبكر', type: 'task-score', options: score02 },
        { code: 'HAMD17-7', labelAr: '7. العمل والأنشطة/الاهتمامات', type: 'task-score', options: score04 },
        { code: 'HAMD17-8', labelAr: '8. التباطؤ النفسي الحركي/الفكري', type: 'task-score', options: score04 },
        { code: 'HAMD17-9', labelAr: '9. الهياج', type: 'task-score', options: score04 },
        { code: 'HAMD17-10', labelAr: '10. القلق النفسي', type: 'task-score', options: score04 },
        { code: 'HAMD17-11', labelAr: '11. القلق الجسدي', type: 'task-score', options: score04 },
        { code: 'HAMD17-12', labelAr: '12. الأعراض الجسدية المعدية المعوية', type: 'task-score', options: score02 },
        { code: 'HAMD17-13', labelAr: '13. الأعراض الجسدية العامة', type: 'task-score', options: score02 },
        { code: 'HAMD17-14', labelAr: '14. الأعراض التناسلية/نقص الرغبة', type: 'task-score', options: score02 },
        { code: 'HAMD17-15', labelAr: '15. توهم المرض/الانشغال المرضي', type: 'task-score', options: score04 },
        { code: 'HAMD17-16', labelAr: '16. فقدان الوزن', type: 'task-score', options: score02 },
        { code: 'HAMD17-17', labelAr: '17. الاستبصار', type: 'task-score', options: score02 },
      ],
    }],
    scoringSteps: ['اجمع البنود السبعة عشر وفق نطاق كل عنصر؛ المجموع القياسي 0–52.', 'لا تستخدم عتبة واحدة كتشخيص؛ HAMD-17 مقياس شدة وتاريخيًا استُخدمت نطاقات متعددة بحسب الدراسات.', 'تحتاج المقارنة الطولية إلى ثبات النسخة والمقيم/التدريب قدر الإمكان.'],
    interpretationGuardrails: ['المقياس متعدد الأبعاد ويتأثر بالنوم والمرض الجسدي والآثار الدوائية.', 'لا تستخدم الدرجة وحدها لإثبات أو نفي اضطراب اكتئابي.', 'هذه الورقة تسجل البنية الصحيحة لكنها لا تستبدل مراسي المقابلة التفصيلية عند البروتوكولات الرسمية.'],
    stopRules: ['خطر انتحار أو ذهان/هياج شديد أو تدهور طبي حاد يحتاج تقييمًا مباشرًا مستقلًا عن HAMD-17.'],
    officialDownloads: [{ label: 'CDISC QRS — HAMD-17 Public Domain record', url: 'https://www.cdisc.org/standards/foundational/qrs/hamilton-depression-rating-scale-17-item', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/hamilton-depression-rating-scale-17-item', 'https://evs.nci.nih.gov/ftp1/CDISC/SDTM/Archive/QS%20Terminology%202012-03-23.html'],
    lastVerifiedOn: '2026-09-06',
  },
};
