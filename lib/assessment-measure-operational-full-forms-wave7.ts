import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const severity04: OperationalOption[] = [
  { labelAr: '0 — غير موجود/لا شيء', labelEn: 'None / Not present', value: '0', score: 0 },
  { labelAr: '1 — طفيف جدًا', labelEn: 'Slight', value: '1', score: 1 },
  { labelAr: '2 — خفيف', labelEn: 'Mild', value: '2', score: 2 },
  { labelAr: '3 — متوسط', labelEn: 'Moderate', value: '3', score: 3 },
  { labelAr: '4 — شديد', labelEn: 'Severe', value: '4', score: 4 },
];

const rpqSeverity: OperationalOption[] = [
  { labelAr: '0 — لم أختبر هذا العرض على الإطلاق', labelEn: 'Not experienced at all', value: '0', score: 0 },
  { labelAr: '1 — ليس مشكلة أكثر مما كان عليه قبل الإصابة', labelEn: 'No more of a problem than before the injury', value: '1', score: 1 },
  { labelAr: '2 — مشكلة خفيفة', labelEn: 'Mild problem', value: '2', score: 2 },
  { labelAr: '3 — مشكلة متوسطة', labelEn: 'Moderate problem', value: '3', score: 3 },
  { labelAr: '4 — مشكلة شديدة', labelEn: 'Severe problem', value: '4', score: 4 },
];

const gcgiSeverity: OperationalOption[] = [
  { labelAr: 'غير مُقيّم', labelEn: 'Not assessed', value: 'na' },
  { labelAr: '1 — طبيعي، غير مريض على الإطلاق', labelEn: 'Normal, not at all ill', value: '1', score: 1 },
  { labelAr: '2 — على الحد من المرض', labelEn: 'Borderline ill', value: '2', score: 2 },
  { labelAr: '3 — مريض بدرجة خفيفة', labelEn: 'Mildly ill', value: '3', score: 3 },
  { labelAr: '4 — مريض بدرجة متوسطة', labelEn: 'Moderately ill', value: '4', score: 4 },
  { labelAr: '5 — مريض بدرجة ملحوظة', labelEn: 'Markedly ill', value: '5', score: 5 },
  { labelAr: '6 — مريض بشدة', labelEn: 'Severely ill', value: '6', score: 6 },
  { labelAr: '7 — ضمن أشد المرضى مرضًا', labelEn: 'Among the most extremely ill patients', value: '7', score: 7 },
];

const gcgiImprovement: OperationalOption[] = [
  { labelAr: 'غير مُقيّم', labelEn: 'Not assessed', value: 'na' },
  { labelAr: '1 — تحسن كثيرًا جدًا', labelEn: 'Very much improved', value: '1', score: 1 },
  { labelAr: '2 — تحسن كثيرًا', labelEn: 'Much improved', value: '2', score: 2 },
  { labelAr: '3 — تحسن بشكل طفيف', labelEn: 'Minimally improved', value: '3', score: 3 },
  { labelAr: '4 — لا تغيير', labelEn: 'No change', value: '4', score: 4 },
  { labelAr: '5 — أسوأ بشكل طفيف', labelEn: 'Minimally worse', value: '5', score: 5 },
  { labelAr: '6 — أسوأ بكثير', labelEn: 'Much worse', value: '6', score: 6 },
  { labelAr: '7 — أسوأ بكثير جدًا', labelEn: 'Very much worse', value: '7', score: 7 },
];

const poorExcellent4: OperationalOption[] = [
  { labelAr: '1 — سيئ', labelEn: 'Poor', value: '1', score: 1 },
  { labelAr: '2 — مقبول', labelEn: 'Fair', value: '2', score: 2 },
  { labelAr: '3 — جيد', labelEn: 'Good', value: '3', score: 3 },
  { labelAr: '4 — ممتاز', labelEn: 'Excellent', value: '4', score: 4 },
];

const treatmentPreference4: OperationalOption[] = [
  { labelAr: '1 — أسوأ من العلاج المقارن', labelEn: 'Worse than', value: '1', score: 1 },
  { labelAr: '2 — مساوٍ للعلاج المقارن', labelEn: 'Equal to', value: '2', score: 2 },
  { labelAr: '3 — أفضل من العلاج المقارن', labelEn: 'Better than', value: '3', score: 3 },
  { labelAr: '4 — أفضل بكثير من العلاج المقارن', labelEn: 'Much better than', value: '4', score: 4 },
];

const diseaseStepsOptions: OperationalOption[] = [
  { labelAr: '0 — طبيعي وظيفيًا؛ لا قيود على النشاط أو نمط الحياة', labelEn: 'Normal', value: '0', score: 0 },
  { labelAr: '1 — إعاقة خفيفة؛ أعراض أو علامات خفيفة', labelEn: 'Mild disability', value: '1', score: 1 },
  { labelAr: '2 — إعاقة متوسطة؛ اضطراب مشي ظاهر دون أداة مساعدة للمشي', labelEn: 'Moderate disability', value: '2', score: 2 },
  { labelAr: '3 — عصا مبكرة؛ دعم أحادي للمسافات الأطول مع القدرة على المشي ≥25 قدمًا بدونه', labelEn: 'Early cane', value: '3', score: 3 },
  { labelAr: '4 — عصا متأخرة؛ يعتمد على دعم أحادي ولا يستطيع المشي 25 قدمًا بدونه', labelEn: 'Late cane', value: '4', score: 4 },
  { labelAr: '5 — دعم ثنائي؛ يحتاج دعمًا ثنائيًا للمشي 25 قدمًا', labelEn: 'Bilateral support', value: '5', score: 5 },
  { labelAr: '6 — محصور أساسًا بالكرسي المتحرك/السكوتر ولا يستطيع المشي 25 قدمًا حتى بدعم ثنائي', labelEn: 'Confined to wheelchair', value: '6', score: 6 },
  { labelAr: 'U — غير قابل للتصنيف ضمن الفئات السابقة', labelEn: 'Unclassifiable', value: 'U' },
];

export const assessmentOperationalFullFormsWave7: Record<string, AssessmentOperationalMaterial> = {
  'rivermead-post-concussion-questionnaire': {
    slug: 'rivermead-post-concussion-questionnaire',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'استبيان ريفرميد لأعراض ما بعد الارتجاج — RPQ',
    titleEn: 'Rivermead Post-Concussion Symptoms Questionnaire (RPQ)',
    version: 'Original 16-symptom RPQ structure with FITBIR RPQ3/RPQ13/total scoring',
    provenance: 'CDISC يصنف RPQ كـPublic Domain، وFITBIR ينشر بنية البيانات الحالية وقاعدة المجموع 0–64. البنود الإنجليزية تمثل الأعراض الستة عشر المعروفة؛ الصياغة العربية في روافد ترجمة تشغيلية تعليمية ولا تُقدَّم كنسخة عربية محققة سيكومتريًا ما لم يذكر مصدر تحقق مستقل.',
    rightsNotice: 'RPQ Public Domain وفق CDISC. إعادة الاستخدام هنا لا تمنح أي ادعاء بوجود ترجمة عربية رسمية أو معتمدة؛ احتفظ باسم الأداة والإصدار ومصدر الترجمة عند الاستخدام البحثي.',
    intendedUseAr: 'قياس شدة أعراض شائعة بعد إصابة الرأس/الارتجاج مقارنة بما قبل الإصابة. المقياس يصف الأعراض ولا يشخّص متلازمة ما بعد الارتجاج أو سبب كل عرض بمفرده.',
    respondentFields: ['الاسم/الرمز', 'تاريخ الإصابة', 'تاريخ التقييم', 'نوع/سياق إصابة الرأس', 'طريقة التطبيق', 'اسم الفاحص عند المقابلة'],
    preflightChecks: [
      'أكد أن المقارنة هي مع حالة الشخص قبل الإصابة، لأن الاستجابة 1 تعني أن العرض ليس أكثر مشكلة مما كان قبلها.',
      'لا تستخدم RPQ بدل التقييم الطبي عند أعراض عصبية حادة أو متفاقمة.',
      'ثبت اللغة والصياغة نفسها في المتابعات الطولية.',
    ],
    sections: [
      {
        titleAr: 'الأعراض الستة عشر',
        instructionsAr: 'لكل عرض اختر مدى المشكلة مقارنة بما قبل الإصابة. عند حساب المجموع التقليدي تُعامل الاستجابة 1 كصفر وتُستبعد من المجموع.',
        items: [
          { code: 'RPQ01', labelAr: 'الصداع', labelEn: 'Headaches', type: 'choice', options: rpqSeverity },
          { code: 'RPQ02', labelAr: 'الشعور بالدوخة', labelEn: 'Feelings of dizziness', type: 'choice', options: rpqSeverity },
          { code: 'RPQ03', labelAr: 'الغثيان و/أو القيء', labelEn: 'Nausea and/or vomiting', type: 'choice', options: rpqSeverity },
          { code: 'RPQ04', labelAr: 'الحساسية للضوضاء/الانزعاج بسهولة من الأصوات العالية', labelEn: 'Noise sensitivity / easily upset by loud noise', type: 'choice', options: rpqSeverity },
          { code: 'RPQ05', labelAr: 'اضطراب النوم', labelEn: 'Sleep disturbance', type: 'choice', options: rpqSeverity },
          { code: 'RPQ06', labelAr: 'التعب/الإرهاق بسهولة أكبر', labelEn: 'Fatigue / tiring more easily', type: 'choice', options: rpqSeverity },
          { code: 'RPQ07', labelAr: 'سرعة الاستثارة أو الغضب', labelEn: 'Being irritable / easily angered', type: 'choice', options: rpqSeverity },
          { code: 'RPQ08', labelAr: 'الشعور بالاكتئاب أو الميل للبكاء', labelEn: 'Feeling depressed or tearful', type: 'choice', options: rpqSeverity },
          { code: 'RPQ09', labelAr: 'الشعور بالإحباط أو نفاد الصبر', labelEn: 'Feeling frustrated or impatient', type: 'choice', options: rpqSeverity },
          { code: 'RPQ10', labelAr: 'النسيان/ضعف الذاكرة', labelEn: 'Forgetfulness / poor memory', type: 'choice', options: rpqSeverity },
          { code: 'RPQ11', labelAr: 'ضعف التركيز', labelEn: 'Poor concentration', type: 'choice', options: rpqSeverity },
          { code: 'RPQ12', labelAr: 'الحاجة إلى وقت أطول للتفكير', labelEn: 'Taking longer to think', type: 'choice', options: rpqSeverity },
          { code: 'RPQ13', labelAr: 'تشوش الرؤية', labelEn: 'Blurred vision', type: 'choice', options: rpqSeverity },
          { code: 'RPQ14', labelAr: 'الحساسية للضوء/الانزعاج بسهولة من الضوء الساطع', labelEn: 'Light sensitivity / easily upset by bright light', type: 'choice', options: rpqSeverity },
          { code: 'RPQ15', labelAr: 'ازدواج الرؤية', labelEn: 'Double vision', type: 'choice', options: rpqSeverity },
          { code: 'RPQ16', labelAr: 'التململ', labelEn: 'Restlessness', type: 'choice', options: rpqSeverity },
        ],
      },
      {
        titleAr: 'صعوبات أخرى — لا تدخل في المجموع القياسي',
        items: [
          { code: 'RPQ-OTHER1-TEXT', labelAr: 'صعوبة أخرى 1', type: 'text' },
          { code: 'RPQ-OTHER1-SCORE', labelAr: 'شدة الصعوبة الأخرى 1', type: 'choice', options: rpqSeverity },
          { code: 'RPQ-OTHER2-TEXT', labelAr: 'صعوبة أخرى 2', type: 'text' },
          { code: 'RPQ-OTHER2-SCORE', labelAr: 'شدة الصعوبة الأخرى 2', type: 'choice', options: rpqSeverity },
        ],
      },
    ],
    scoringSteps: [
      'للمجموع التقليدي: أعد ترميز كل استجابة 1 إلى 0، ثم اجمع البنود RPQ01–RPQ16 فقط؛ النطاق 0–64.',
      'لا تدخل حقول «صعوبات أخرى» في المجموع، وفق تعليمات FITBIR.',
      'يمكن توثيق RPQ-3 = مجموع البنود 1–3 بعد استبعاد/إعادة ترميز الاستجابة 1؛ النطاق 0–12.',
      'يمكن توثيق RPQ-13 = مجموع البنود 4–16 بعد استبعاد/إعادة ترميز الاستجابة 1؛ النطاق 0–52.',
      'لا تفسر ارتفاع المجموع على أنه إثبات سببية إصابة الرأس لكل عرض؛ قارن مع الحالة السابقة والسياق الطبي والنفسي والدوائي.',
    ],
    interpretationGuardrails: [
      'RPQ أداة أعراض وليست تشخيصًا مستقلًا.',
      'الاستجابة 1 لها معنى نوعي خاص وليست شدة خفيفة؛ إدخالها كنقطة واحدة يغيّر خوارزمية المجموع.',
      'عند استخدام ترجمة عربية يجب ذكر مصدرها وحالة تحققها؛ ترجمة روافد هنا تشغيلية وليست ادعاء تحقق سيكومتري.',
    ],
    stopRules: [
      'صداع شديد متفاقم، قيء متكرر، ضعف بؤري، اختلاجات، تدهور وعي، أو تغير عصبي حاد يحتاج تقييمًا طبيًا عاجلًا بدل إكمال نموذج روتيني.',
      'إذا أثارت الأسئلة ضيقًا شديدًا أو كشفت خطرًا نفسيًا حاليًا فطبّق مسار السلامة المناسب.',
    ],
    officialDownloads: [
      { label: 'CDISC QRS — Rivermead Post-Concussion Symptoms Questionnaire', url: 'https://www.cdisc.org/standards/foundational/qrs/rivermead-post-concussion-symptoms-questionnaire', language: 'en', publisher: 'CDISC' },
      { label: 'FITBIR — current RPQ data structure', url: 'https://fitbir.nih.gov/dictionary/publicData/dataStructureAction!view.action?dataStructureName=RivermeadPCSQ&publicArea=true&style.key=fitbir-style', language: 'en', publisher: 'FITBIR / NIH' },
    ],
    sourceUrls: [
      'https://www.cdisc.org/standards/foundational/qrs/rivermead-post-concussion-symptoms-questionnaire',
      'https://fitbir.nih.gov/dictionary/publicData/dataStructureAction!view.action?dataStructureName=RivermeadPCSQ&publicArea=true&style.key=fitbir-style',
    ],
    lastVerifiedOn: '2026-09-06',
  },

  'minnesota-tobacco-withdrawal-scale-revised': {
    slug: 'minnesota-tobacco-withdrawal-scale-revised',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس مينيسوتا لأعراض انسحاب التبغ — المنقح MTWS-R',
    titleEn: 'Minnesota Tobacco Withdrawal Scale — Revised (MTWS-R)',
    version: '15-item revised self-report form; owner-source core-eight scoring explicitly preserved',
    provenance: 'CDISC يصنف MTWS-R كـPublic Domain، وePROVIDE يحدد النسخة المنقحة ذات 15 بندًا كأحدث نسخة. تعليمات المطور John R. Hughes/University of Vermont تميز ثمانية أعراض أساسية موثقة جيدًا (سبعة أعراض DSM + craving) عن سبعة أعراض مرشحة إضافية. صفحة PhenX المحدثة تعرض صياغة مختلفة تقول «first nine»؛ لذلك توثق روافد هذا التعارض ولا تخلط القاعدتين بصمت.',
    rightsNotice: 'المطور يذكر أن المقياس غير محمي بحقوق نشر ولا يحتاج إذنًا للاستخدام، وPhenX يذكر أنه متاح بحرية دون إذن. الصياغة العربية هنا ترجمة تشغيلية من روافد وليست ترجمة عربية محققة؛ توجد ترجمات عربية تاريخية قد تكون لإصدارات أقدم وتحتاج مطابقة الإصدار.',
    intendedUseAr: 'تسجيل شدة أعراض انسحاب التبغ/النيكوتين ومتابعتها قبل وبعد الامتناع أو خلال تدخلات الإقلاع. لا يحدد المقياس وحده سبب الأعراض ولا جرعة دواء الإقلاع.',
    respondentFields: ['الاسم/الرمز', 'تاريخ/وقت التقييم', 'آخر استخدام للتبغ/النيكوتين', 'الفترة المرجعية المستخدمة', 'حالة الامتناع/العلاج', 'نوع المنتج النيكوتيني'],
    preflightChecks: [
      'ثبت النسخة: MTWS-R ذات 15 بندًا، ولا تخلطها مع نسخ MNWS التاريخية ذات 7/8/9/11 بندًا.',
      'تعليمات المطور تستخدم عادة آخر 24 ساعة للتقرير الذاتي؛ إذا استُخدمت فترة أخرى فوثقها ولا تقارنها مباشرة دون تنبيه.',
      'سجّل ما إذا كانت النتيجة مبنية على قاعدة UVM core-eight أم بروتوكول آخر مثل PhenX؛ لا تغيّر قاعدة المجموع بين الزيارات.',
    ],
    sections: [
      {
        titleAr: 'الأعراض الأساسية الثمانية — core set وفق تعليمات المطور',
        instructionsAr: 'قيّم كل عرض 0–4. هذه المجموعة تضم سبعة أعراض انسحاب أساسية + الرغبة/الاشتهاء. ترتيب العرض هنا تنظيمي لتوضيح قاعدة التسجيل، وليس ادعاء أن كل المصادر تطبع البنود بالترتيب نفسه.',
        items: [
          { code: 'MTWS-CORE-ANGER', labelAr: 'غاضب/سريع الاستثارة/محبط', labelEn: 'Angry, irritable, frustrated', type: 'choice', options: severity04 },
          { code: 'MTWS-CORE-ANX', labelAr: 'قلق/عصبي', labelEn: 'Anxious, nervous', type: 'choice', options: severity04 },
          { code: 'MTWS-CORE-DEP', labelAr: 'مزاج مكتئب/حزين', labelEn: 'Depressed mood, sad', type: 'choice', options: severity04 },
          { code: 'MTWS-CORE-CONC', labelAr: 'صعوبة التركيز', labelEn: 'Difficulty concentrating', type: 'choice', options: severity04 },
          { code: 'MTWS-CORE-APP', labelAr: 'زيادة الشهية/الجوع/زيادة الوزن', labelEn: 'Increased appetite, hungry, weight gain', type: 'choice', options: severity04 },
          { code: 'MTWS-CORE-SLEEP', labelAr: 'أرق/مشكلات نوم/الاستيقاظ ليلًا', labelEn: 'Insomnia, sleep problems, awakening at night', type: 'choice', options: severity04 },
          { code: 'MTWS-CORE-REST', labelAr: 'تململ', labelEn: 'Restless', type: 'choice', options: severity04 },
          { code: 'MTWS-CORE-CRAVE', labelAr: 'رغبة أو اشتهاء لاستخدام التبغ/التدخين', labelEn: 'Desire or craving to smoke', type: 'choice', options: severity04 },
        ],
      },
      {
        titleAr: 'الأعراض المرشحة الإضافية السبعة',
        instructionsAr: 'تُسجل منفردة ولا تُدمج تلقائيًا في core-eight discomfort score.',
        items: [
          { code: 'MTWS-CAND-IMP', labelAr: 'نفاد الصبر', labelEn: 'Impatient', type: 'choice', options: severity04 },
          { code: 'MTWS-CAND-CONST', labelAr: 'إمساك', labelEn: 'Constipation', type: 'choice', options: severity04 },
          { code: 'MTWS-CAND-DIZZ', labelAr: 'دوخة', labelEn: 'Dizziness', type: 'choice', options: severity04 },
          { code: 'MTWS-CAND-COUGH', labelAr: 'زيادة السعال', labelEn: 'Increased coughing', type: 'choice', options: severity04 },
          { code: 'MTWS-CAND-DREAM', labelAr: 'زيادة الأحلام أو الكوابيس', labelEn: 'Increased dreaming or nightmares', type: 'choice', options: severity04 },
          { code: 'MTWS-CAND-NAUSEA', labelAr: 'غثيان', labelEn: 'Nausea', type: 'choice', options: severity04 },
          { code: 'MTWS-CAND-THROAT', labelAr: 'ألم/التهاب الحلق', labelEn: 'Sore throat', type: 'choice', options: severity04 },
        ],
      },
      {
        titleAr: 'توثيق خوارزمية التسجيل المستخدمة',
        items: [
          { code: 'MTWS-SCORING-RULE', labelAr: 'قاعدة التسجيل/المصدر المستخدم (UVM core-eight / PhenX protocol / study-specific)', type: 'text' },
          { code: 'MTWS-CORE8-MEAN', labelAr: 'متوسط الأعراض الأساسية الثمانية إذا اتُّبعت قاعدة UVM', type: 'number', min: 0, max: 4 },
          { code: 'MTWS-NOTE', labelAr: 'ملاحظات على أعراض طبية/نفسية بديلة أو أدوية أو تغيير فترة القياس', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'كل عرض يسجل من 0 = غير موجود إلى 4 = شديد.',
      'وفق تعليمات المطور UVM التي راجعتها روافد: احسب discomfort score من الأعراض الأساسية الثمانية فقط؛ استخدم المتوسط للحفاظ على النطاق 0–4 وسجّل القاعدة صراحة.',
      'الأعراض المرشحة السبعة الإضافية تسجل منفردة ولا تدخل تلقائيًا في core-eight score.',
      'PhenX في صفحته المحدثة لعام 2026 يعرض تعليمات تقول first nine items لدرجة discomfort؛ إذا كان بروتوكولك يعتمد PhenX فطبّق نسخته حرفيًا وسمِّ الخوارزمية، ولا تقارن الناتج مباشرة مع core-eight من دون توضيح.',
      'لا تجمع أو تعيد ترتيب نسخ تاريخية مختلفة ثم تسمي الناتج MTWS-R قياسيًا.',
    ],
    interpretationGuardrails: [
      'الأعراض غير نوعية وقد تنتج عن اضطراب نفسي أو مرض طبي أو دواء أو نوم أو ضغط؛ لا تنسبها تلقائيًا للانسحاب.',
      'لا توجد population norms حقيقية عامة بحسب خلفية المطور؛ الأفضل تتبع التغير داخل الشخص/البروتوكول الثابت.',
      'لا تستخدم المجموع وحده لتحديد دواء أو جرعة علاج الإقلاع.',
      'أي ترجمة عربية يجب أن تثبت الإصدار؛ المطور يحذر من أن بعض الترجمات المتاحة قد تكون لنسخ أقدم.',
    ],
    stopRules: [
      'أعراض طبية حادة أو تدهور نفسي شديد أو أفكار إيذاء النفس تحتاج تقييمًا مستقلًا وعاجلًا عند اللزوم.',
      'إذا تعذر تحديد نسخة المقياس أو قاعدة التسجيل المستخدمة فلا تنتج مجموعًا قابلًا للمقارنة؛ احتفظ بالدرجات البندية الخام.',
    ],
    officialDownloads: [
      { label: 'PhenX — Withdrawal from Tobacco Use / MTWS-R protocol', url: 'https://www.phenxtoolkit.org/protocols/view/721001', language: 'en', publisher: 'PhenX Toolkit / RTI International' },
      { label: 'ePROVIDE — Minnesota Tobacco Withdrawal Scale', url: 'https://eprovide.mapi-trust.org/instruments/minnesota-tobacco-withdrawal-scale', language: 'en', publisher: 'Mapi Research Trust' },
      { label: 'CDISC QRS catalog — MTWS-R rights status', url: 'https://www.cdisc.org/qrs/all', language: 'en', publisher: 'CDISC' },
    ],
    sourceUrls: [
      'https://www.phenxtoolkit.org/protocols/view/721001',
      'https://eprovide.mapi-trust.org/instruments/minnesota-tobacco-withdrawal-scale',
      'https://www.cdisc.org/qrs/all',
    ],
    lastVerifiedOn: '2026-09-06',
  },

  'disease-steps': {
    slug: 'disease-steps',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'Disease Steps للتصلب المتعدد — ورقة التصنيف الوظيفي',
    titleEn: 'Disease Steps',
    version: 'Hohol Disease Steps 0–6 + U',
    provenance: 'المراسي 0–6 وU مستندة إلى الدراسة الأصلية لـHohol وآلية التطبيق المفصلة في Rehabilitation Measures Database. CDISC يسجل Disease Steps كـPublic Domain في كتالوج QRS.',
    rightsNotice: 'التصنيف Public Domain وفق CDISC. الصياغة العربية ترجمة تشغيلية من روافد؛ لا تُنسب كترجمة عربية معيارية محققة ما لم يُذكر مصدر مستقل.',
    intendedUseAr: 'تصنيف سريع للإعاقة الوظيفية في التصلب المتعدد، مع تركيز قوي على المشي واستخدام وسائل المساعدة. لا يقيس نشاط المرض أو الانتكاس أو كل الأعراض غير الحركية.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'نوع/مسار التصلب المتعدد إن كان معروفًا', 'وسيلة المشي المعتادة', 'الفاحص'],
    preflightChecks: [
      'اجمع تاريخًا عصبيًا وظيفيًا كافيًا؛ تمييز الدرجتين 1 و2 يعتمد أيضًا على الفحص العصبي.',
      'لا تطلب مشيًا 25 قدمًا إذا كان غير آمن؛ وثق سبب عدم الاختبار.',
      'لا تخلط Disease Steps clinician scale مع Patient Determined Disease Steps (PDDS) ذي البناء المختلف.',
    ],
    sections: [
      {
        titleAr: 'المشي والدعم',
        items: [
          { code: 'DS-25FT', labelAr: 'القدرة على مشي 25 قدمًا بأمان', type: 'text' },
          { code: 'DS-AID', labelAr: 'وسيلة المساعدة المعتادة/المطلوبة للمشي', type: 'text' },
          { code: 'DS-GRADE', labelAr: 'Disease Steps grade', type: 'choice', options: diseaseStepsOptions },
          { code: 'DS-BASIS', labelAr: 'أساس اختيار الدرجة/نتائج الفحص ذات الصلة', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      '0: طبيعي وظيفيًا دون قيود على النشاط أو نمط الحياة.',
      '1: إعاقة خفيفة مع أعراض/علامات خفيفة؛ 2: إعاقة متوسطة مع اضطراب مشي ظاهر دون أداة مساعدة.',
      '3: يستخدم دعمًا أحاديًا للمسافات الأطول لكنه يستطيع مشي ≥25 قدمًا بدونه.',
      '4: يعتمد على دعم أحادي ولا يستطيع مشي 25 قدمًا بدونه.',
      '5: يحتاج دعمًا ثنائيًا للمشي 25 قدمًا.',
      '6: محصور أساسًا بالكرسي المتحرك/السكوتر وغير قادر على مشي 25 قدمًا حتى مع دعم ثنائي.',
      'U: غير قابل للتصنيف عندما تكون الإعاقة المهمة خارج نمط الفئات، مثل اختلال معرفي/بصري شديد أو تعب طاغٍ أو اضطراب أمعاء/مثانة مهم مع إعاقة جسدية بسيطة نسبيًا.',
    ],
    interpretationGuardrails: [
      'السلم مرجّح بشدة للمشي؛ لا يمثل التعب والإدراك والرؤية والمشاركة الاجتماعية جيدًا.',
      'ارتفاع الدرجة يعكس اعتمادًا حركيًا أكبر لكنه ليس قياسًا لنشاط الالتهاب أو عدد الانتكاسات.',
      'للبحوث التي تتطلب قياس أداء موضوعي، قد تكون اختبارات المشي الموقوتة أكثر ملاءمة لبعض الأهداف.',
    ],
    stopRules: [
      'لا تُجرِ اختبار مشي إذا كان هناك خطر سقوط أو تدهور عصبي حاد.',
      'أي اشتباه انتكاس جديد أو تدهور عصبي حاد يحتاج تقييمًا سريريًا مستقلًا.',
    ],
    officialDownloads: [
      { label: 'RMD — Disease Steps', url: 'https://www.sralab.org/rehabilitation-measures/disease-steps', language: 'en', publisher: 'Shirley Ryan AbilityLab' },
      { label: 'PubMed — original Disease Steps development', url: 'https://pubmed.ncbi.nlm.nih.gov/7854521/', language: 'en', publisher: 'Neurology / PubMed' },
      { label: 'CDISC QRS catalog — Disease Steps rights status', url: 'https://www.cdisc.org/qrs/all', language: 'en', publisher: 'CDISC' },
    ],
    sourceUrls: ['https://www.sralab.org/rehabilitation-measures/disease-steps', 'https://pubmed.ncbi.nlm.nih.gov/7854521/', 'https://www.cdisc.org/qrs/all'],
    lastVerifiedOn: '2026-09-06',
  },

  'controlled-oral-word-association-test': {
    slug: 'controlled-oral-word-association-test',
    kind: 'protocol-sheet',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'اختبار التداعي اللفظي المضبوط COWAT — ورقة تطبيق وتسجيل لغوية',
    titleEn: 'Controlled Oral Word Association Test (COWAT)',
    version: 'Letter verbal-fluency protocol sheet; F-A-S only when that specific version/norm set is selected',
    provenance: 'CDISC يصنف COWAT كـPublic Domain. COWAT مفهوم اختبار طلاقة حرفية توجد له مجموعات حروف وصيغ معيارية مختلفة؛ F-A-S شائع لكنه ليس النسخة الوحيدة. لذلك لا تنشئ روافد «حروفًا عربية مكافئة» بلا دراسة معيارية.',
    rightsNotice: 'المهمة الأساسية Public Domain وفق CDISC؛ إلا أن كتيبات أو مجموعات معايير أو تكييفات بعينها قد يكون لها ناشر/حقوق منفصلة. هذه الورقة تسجل البروتوكول والنتيجة ولا تنسخ معايير طرف ثالث.',
    intendedUseAr: 'تطبيق وتوثيق طلاقة لفظية حرفية موقوتة ضمن تقييم عصبي نفسي أوسع. الأداء شديد الحساسية للغة والتعليم ومجموعة الحروف ولا يشخص ضعفًا تنفيذيًا منفردًا.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'سنوات التعليم', 'اللغة الأساسية', 'لغة الاختبار', 'المعيار/الدراسة المرجعية', 'الفاحص'],
    preflightChecks: [
      'حدد نسخة COWAT ومجموعة الحروف قبل التطبيق. لا تفترض أن F-A-S تصلح لكل لغة.',
      'إذا كان الاختبار بالعربية، استخدم فقط حروفًا ومعايير منشورة ومحققة للسكان المقصودين؛ لا تترجم F-A-S حرفيًا.',
      'ثبت زمن الجولة وقواعد الكلمات المقبولة/المرفوضة بين جميع الجولات والمقارنات.',
    ],
    sections: [
      {
        titleAr: 'تعريف البروتوكول',
        items: [
          { code: 'COWAT-PROTOCOL', labelAr: 'اسم النسخة/البروتوكول', type: 'text' },
          { code: 'COWAT-LANGUAGE', labelAr: 'لغة التطبيق', type: 'text' },
          { code: 'COWAT-LETTERS', labelAr: 'مجموعة الحروف المستخدمة (مثال: F/A/S فقط عند تطبيق نسخة FAS)', type: 'text' },
          { code: 'COWAT-SECONDS', labelAr: 'الزمن لكل حرف', type: 'number', unit: 'seconds', min: 1 },
          { code: 'COWAT-NORM', labelAr: 'مرجع المعايير السكانية/اللغوية', type: 'text' },
        ],
      },
      {
        titleAr: 'الجولة 1',
        items: [
          { code: 'COWAT-L1', labelAr: 'الحرف', type: 'text' },
          { code: 'COWAT-L1-WORDS', labelAr: 'قائمة الكلمات بالترتيب', type: 'text' },
          { code: 'COWAT-L1-CORRECT', labelAr: 'عدد الكلمات الصحيحة', type: 'number', min: 0 },
          { code: 'COWAT-L1-REPEAT', labelAr: 'التكرارات/perseverations', type: 'number', min: 0 },
          { code: 'COWAT-L1-PROPER', labelAr: 'الأسماء الخاصة المرفوضة وفق البروتوكول', type: 'number', min: 0 },
          { code: 'COWAT-L1-RULE', labelAr: 'مخالفات قواعد الجذر/الاشتقاق أو قواعد أخرى', type: 'number', min: 0 },
        ],
      },
      {
        titleAr: 'الجولة 2',
        items: [
          { code: 'COWAT-L2', labelAr: 'الحرف', type: 'text' },
          { code: 'COWAT-L2-WORDS', labelAr: 'قائمة الكلمات بالترتيب', type: 'text' },
          { code: 'COWAT-L2-CORRECT', labelAr: 'عدد الكلمات الصحيحة', type: 'number', min: 0 },
          { code: 'COWAT-L2-REPEAT', labelAr: 'التكرارات/perseverations', type: 'number', min: 0 },
          { code: 'COWAT-L2-PROPER', labelAr: 'الأسماء الخاصة المرفوضة', type: 'number', min: 0 },
          { code: 'COWAT-L2-RULE', labelAr: 'مخالفات القواعد', type: 'number', min: 0 },
        ],
      },
      {
        titleAr: 'الجولة 3',
        items: [
          { code: 'COWAT-L3', labelAr: 'الحرف', type: 'text' },
          { code: 'COWAT-L3-WORDS', labelAr: 'قائمة الكلمات بالترتيب', type: 'text' },
          { code: 'COWAT-L3-CORRECT', labelAr: 'عدد الكلمات الصحيحة', type: 'number', min: 0 },
          { code: 'COWAT-L3-REPEAT', labelAr: 'التكرارات/perseverations', type: 'number', min: 0 },
          { code: 'COWAT-L3-PROPER', labelAr: 'الأسماء الخاصة المرفوضة', type: 'number', min: 0 },
          { code: 'COWAT-L3-RULE', labelAr: 'مخالفات القواعد', type: 'number', min: 0 },
        ],
      },
      {
        titleAr: 'الإجمالي والتفسير',
        items: [
          { code: 'COWAT-TOTAL', labelAr: 'مجموع الكلمات الصحيحة عبر الجولات المحددة في البروتوكول', type: 'number', min: 0 },
          { code: 'COWAT-NORMED', labelAr: 'الدرجة المعيارية/المئين إن كان هناك مرجع مناسب', type: 'text' },
          { code: 'COWAT-NOTE', labelAr: 'ملاحظات اللغة/التعليم/السمع/الكلام/الالتزام بالقواعد', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'في نسخة F-A-S الشائعة: تُعطى عادة 60 ثانية لكل حرف، ويجمع عدد الكلمات المقبولة عبر الحروف؛ لا تعمم هذه الحروف على جميع نسخ COWAT أو اللغات.',
      'استبعد التكرارات والأسماء الخاصة والكلمات المخالفة لقواعد البروتوكول المحدد؛ قواعد الاشتقاق/الجذر يجب أن تكون مثبتة في النسخة اللغوية.',
      'احتفظ بالعدد الخام لكل حرف وبالإجمالي وبالأخطاء، ولا تفسر الإجمالي دون مرجع معياري ملائم للعمر والتعليم واللغة.',
      'إذا لم يوجد معيار عربي صالح لمجموعة الحروف المستخدمة، اعرض الأداء الخام فقط ولا تولد «درجة معيارية عربية» من معايير إنجليزية.',
    ],
    interpretationGuardrails: [
      'COWAT يتأثر بقوة باللغة وتواتر الحروف والتعليم والثقافة؛ المقارنة عبر لغات أو مجموعات حروف مختلفة غير مباشرة.',
      'النتيجة المنخفضة ليست تشخيصًا لاضطراب تنفيذي أو لغوي بمفردها.',
      'لا تعتبر F-A-S مرادفًا عالميًا لكل COWAT، فهناك بروتوكولات تستخدم مجموعات أخرى مثل C/F/L.',
    ],
    stopRules: [
      'حاجز لغوي أو اضطراب نطق/سمع شديد يجعل المقارنة المعيارية غير صالحة يجب توثيقه بدل إصدار استنتاج آلي.',
      'إذا لم يُثبت البروتوكول/الحروف/الزمن فلا تنتج درجة معيارية.',
    ],
    officialDownloads: [
      { label: 'CDISC QRS — Controlled Oral Word Association Test', url: 'https://www.cdisc.org/standards/foundational/qrs/controlled-oral-word-association-test', language: 'en', publisher: 'CDISC' },
      { label: 'PubMed — updated COWAT norms', url: 'https://pubmed.ncbi.nlm.nih.gov/14588937/', language: 'en', publisher: 'PubMed' },
    ],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/controlled-oral-word-association-test', 'https://pubmed.ncbi.nlm.nih.gov/14588937/'],
    lastVerifiedOn: '2026-09-06',
  },

  'general-clinical-global-impression': {
    slug: 'general-clinical-global-impression',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'الانطباعات السريرية العالمية العامة للألم — GCGI v1',
    titleEn: 'General Clinical Global Impressions (GCGI) — Pain v1',
    version: 'CDISC GCGI v1 / ACTTION-STANDARDS pain-response questionnaire',
    provenance: 'هذا السجل يصحح الالتباس في الوصف السابق بالموقع: GCGI المقصود في CDISC ليس مجرد حكم عالمي عام مرادفًا لـNIMH CGI. إنه استبيان ألم Public Domain طوّر ضمن ACTTION/STANDARDS ويحتوي خمسة تقييمات منفصلة: Global Severity of Pain، Global Improvement of Pain، Global Disease Status of Pain، Pain Treatment Preference، وGlobal Rating of Pain Medication.',
    rightsNotice: 'CDISC يصف GCGI v1 كاستبيان Public Domain. هذه الورقة تعيد تنظيم المراسي القياسية وتفصلها عن CGI الأصلي. الصياغة العربية ترجمة تشغيلية من روافد ولا تدعي تحققًا لغويًا مستقلًا.',
    intendedUseAr: 'تسجيل الانطباع العالمي عن شدة/تحسن/حالة الألم وتفضيل العلاج وتقييم دواء الألم ضمن بروتوكول يحدد المقيم والموقع والفترة الزمنية والمقارنة. لا تجمع البنود الخمسة في مجموع كلي واحد.',
    respondentFields: ['الاسم/الرمز', 'التاريخ/الوقت', 'موضع الألم', 'المقيم: SUBJECT أو INVESTIGATOR', 'الفترة/النافذة الزمنية', 'مرجع المقارنة/العلاج', 'البروتوكول/الزيارة'],
    preflightChecks: [
      'حدد من هو المقيم لكل بند: المشارك أو الباحث/المختص، وفق البروتوكول.',
      'حدد موضع الألم والفترة الزمنية أو نقطة القياس، مثل right now أو منذ الدواء أو نافذة محددة.',
      'في Pain Treatment Preference اكتب العلاج/المرجع الذي تتم المقارنة به؛ خيار «أفضل من» بلا مرجع غير قابل للتفسير.',
      'لا تخلط GCGI pain v1 مع Clinical Global Impression (CGI-S/CGI-I/CGI-E) الموجود كأداة مستقلة في المكتبة.',
    ],
    sections: [
      {
        titleAr: 'التقييمات الخمسة',
        items: [
          { code: 'GCGI0101', labelAr: 'الشدة العالمية للألم', labelEn: 'Global Severity of Pain', type: 'choice', options: gcgiSeverity },
          { code: 'GCGI0102', labelAr: 'التحسن العالمي للألم', labelEn: 'Global Improvement of Pain', type: 'choice', options: gcgiImprovement },
          { code: 'GCGI0103', labelAr: 'الحالة العالمية لمرض/حالة الألم', labelEn: 'Global Disease Status of Pain', type: 'choice', options: poorExcellent4 },
          { code: 'GCGI-REFERENCE', labelAr: 'العلاج/المرجع المستخدم في سؤال تفضيل العلاج', type: 'text' },
          { code: 'GCGI0104', labelAr: 'تفضيل علاج الألم مقارنة بالمرجع المحدد', labelEn: 'Pain Treatment Preference', type: 'choice', options: treatmentPreference4 },
          { code: 'GCGI0105', labelAr: 'التقييم العالمي لدواء الألم', labelEn: 'Global Rating of Pain Medication', type: 'choice', options: poorExcellent4 },
        ],
      },
    ],
    scoringSteps: [
      'GCGI0101 = مقياس لفظي 7 نقاط من 1 طبيعي/غير مريض إلى 7 ضمن أشد المرضى مرضًا؛ «Not assessed» حالة مفقودة/غير مقيمة وليست شدة صفر سريريًا.',
      'GCGI0102 = مقياس تحسن 7 نقاط من 1 تحسن كثيرًا جدًا إلى 4 لا تغيير إلى 7 أسوأ كثيرًا جدًا.',
      'GCGI0103 = 4 نقاط: Poor/Fair/Good/Excellent.',
      'GCGI0104 = 4 نقاط مقارنة بمرجع محدد: Worse than/Equal to/Better than/Much better than.',
      'GCGI0105 = 4 نقاط: Poor/Fair/Good/Excellent.',
      'لا تجمع البنود الخمسة في total score؛ كل سؤال يمثل construct ومقياس استجابة مستقلًا.',
    ],
    interpretationGuardrails: [
      'التفسير يعتمد على المقيم وموضع الألم والتوقيت والمرجع العلاجي؛ يجب حفظ هذه المتغيرات مع الدرجة.',
      'Not assessed لا تعني «لا ألم» ولا يجوز تحويلها إلى صفر في تحليل سريري دون خطة بيانات صريحة.',
      'GCGI لا يحل محل Pain Intensity أو Pain Relief أو التشخيص السببي للألم؛ يمكن أن يُستخدم بجانبها ضمن بروتوكول.',
      'لا تخلط نتائج GCGI مع CGI-S/CGI-I/CGI-E رغم تشابه الاسم.',
    ],
    stopRules: [
      'ألم جديد شديد أو أعراض إنذار حادة تتطلب تقييم السبب ولا تنتظر استكمال الاستبيان.',
      'إذا كان مرجع المقارنة أو المقيم أو التوقيت غير معروفًا، لا تقدم درجة GCGI0104/التغير على أنها قابلة للمقارنة الطولية.',
    ],
    officialDownloads: [
      { label: 'CDISC — General Clinical Global Impressions questionnaire supplement', url: 'https://www.cdisc.org/standards/foundational/qrs', language: 'en', publisher: 'CDISC' },
      { label: 'NCI EVS — CDISC GCGI controlled terminology', url: 'https://evs.nci.nih.gov/ftp1/CDISC/SDTM/', language: 'en', publisher: 'NCI Enterprise Vocabulary Services' },
    ],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs', 'https://evs.nci.nih.gov/ftp1/CDISC/SDTM/'],
    lastVerifiedOn: '2026-09-06',
  },
};
