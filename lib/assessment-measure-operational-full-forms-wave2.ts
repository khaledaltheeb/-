import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const severity04: OperationalOption[] = [
  { labelAr: '0 — غير موجود', value: '0', score: 0 },
  { labelAr: '1 — خفيف', value: '1', score: 1 },
  { labelAr: '2 — متوسط', value: '2', score: 2 },
  { labelAr: '3 — شديد', value: '3', score: 3 },
  { labelAr: '4 — شديد جدًا', value: '4', score: 4 },
];

const bothered02: OperationalOption[] = [
  { labelAr: '0 — لم يزعجني إطلاقًا', value: '0', score: 0 },
  { labelAr: '1 — أزعجني قليلًا', value: '1', score: 1 },
  { labelAr: '2 — أزعجني كثيرًا', value: '2', score: 2 },
];

const agree17: OperationalOption[] = [
  { labelAr: '1 — لا أوافق بشدة', value: '1', score: 1 },
  { labelAr: '2 — لا أوافق', value: '2', score: 2 },
  { labelAr: '3 — لا أوافق قليلًا', value: '3', score: 3 },
  { labelAr: '4 — محايد', value: '4', score: 4 },
  { labelAr: '5 — أوافق قليلًا', value: '5', score: 5 },
  { labelAr: '6 — أوافق', value: '6', score: 6 },
  { labelAr: '7 — أوافق بشدة', value: '7', score: 7 },
];

const zeroToThree: OperationalOption[] = [0, 1, 2, 3].map((score) => ({ labelAr: String(score), value: String(score), score }));
const zeroToFour: OperationalOption[] = [0, 1, 2, 3, 4].map((score) => ({ labelAr: String(score), value: String(score), score }));
const zeroToSix: OperationalOption[] = [0, 1, 2, 3, 4, 5, 6].map((score) => ({ labelAr: String(score), value: String(score), score }));

export const assessmentOperationalFullFormsWave2: Record<string, AssessmentOperationalMaterial> = {
  'patient-health-questionnaire-15': {
    slug: 'patient-health-questionnaire-15',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'استبيان صحة المريض — 15 عرضًا جسديًا (PHQ-15)',
    titleEn: 'Patient Health Questionnaire-15',
    version: 'PHQ-15 — past 4 weeks; 15 somatic symptoms',
    provenance: 'PHQ-15 ضمن عائلة PHQ المتاحة للاستخدام العام، وCDISC يدرجه Public Domain. الصياغة العربية هنا تشغيلية من روافد؛ للاستخدام البحثي الرسمي ثبّت ترجمة عربية محققة محددة.',
    rightsNotice: 'يمكن إعادة استخدام الأصل. لا تغيّر الفترة المرجعية أو بنية 0–2 عند مقارنة النتائج عبر الزمن.',
    intendedUseAr: 'قياس شدة عبء 15 عرضًا جسديًا خلال الأسابيع الأربعة الماضية؛ لا يحدد سبب الأعراض ولا يساوي تشخيص اضطراب الأعراض الجسدية.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'الجنس عند الحاجة لبند الدورة الشهرية', 'طريقة التطبيق/اللغة'],
    preflightChecks: ['الفترة المرجعية: الأسابيع الأربعة الماضية.', 'فسّر الأعراض الجديدة أو الشديدة طبيًا عند الحاجة بدل نسبتها تلقائيًا لعامل نفسي.', 'بند الدورة الشهرية لا يطبق على من لا ينطبق عليه.'],
    sections: [{
      titleAr: 'خلال الأسابيع الأربعة الماضية، إلى أي درجة أزعجتك المشكلات التالية؟',
      instructionsAr: 'ترجمة تشغيلية عربية من روافد لبنية PHQ-15؛ المصدر الإنجليزي العام هو المرجع عند الدراسات الرسمية.',
      items: [
        ['PHQ15-1','ألم المعدة أو البطن.'],
        ['PHQ15-2','ألم الظهر.'],
        ['PHQ15-3','ألم في الذراعين أو الساقين أو المفاصل.'],
        ['PHQ15-4','تقلصات الدورة الشهرية أو مشكلات أخرى مرتبطة بها — عندما ينطبق.'],
        ['PHQ15-5','الصداع.'],
        ['PHQ15-6','ألم الصدر.'],
        ['PHQ15-7','الدوخة.'],
        ['PHQ15-8','نوبات الإغماء أو فقدان الوعي.'],
        ['PHQ15-9','الشعور بخفقان القلب أو تسارعه.'],
        ['PHQ15-10','ضيق النفس.'],
        ['PHQ15-11','ألم أو مشكلات أثناء العلاقة الجنسية.'],
        ['PHQ15-12','الإمساك أو البراز الرخو/الإسهال.'],
        ['PHQ15-13','الغثيان أو الغازات أو عسر الهضم.'],
        ['PHQ15-14','التعب أو انخفاض الطاقة.'],
        ['PHQ15-15','صعوبة النوم.'],
      ].map(([code, labelAr]) => ({ code, labelAr, type: 'choice' as const, options: bothered02 })),
    }],
    scoringSteps: ['اجمع البنود الخمسة عشر: النطاق 0–30.', 'تستخدم كثيرًا القيم 5 و10 و15 كعتبات تقريبية لعبء أعراض خفيف ومتوسط وشديد، لكنها ليست تشخيصًا سببيًا.', 'راجع كل عرض مهم سريريًا بصورة مستقلة؛ الدرجة الكلية لا تبرر تجاهل المرض العضوي.'],
    interpretationGuardrails: ['لا تستخدم PHQ-15 لإثبات أن الأعراض «نفسية».', 'الأمراض المزمنة والحادة والأدوية والحمل واضطرابات النوم وغيرها قد ترفع الدرجة.'],
    stopRules: ['ألم صدري جديد، ضيق نفس شديد، إغماء، أعراض عصبية حادة أو أي علامة إنذار تحتاج تقييمًا مباشرًا وفق الحالة.'],
    officialDownloads: [{ label: 'NIDDK Repository — PHQ-15 no-copyright form', url: 'https://repository.niddk.nih.gov/public/study_document/Forms/APRON_forms_nocopyright.pdf', language: 'en', publisher: 'NIDDK / NIH' }],
    sourceUrls: ['https://repository.niddk.nih.gov/public/study_document/Forms/APRON_forms_nocopyright.pdf','https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn: '2026-09-05',
  },

  'hamilton-anxiety-rating-scale': {
    slug: 'hamilton-anxiety-rating-scale',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'مقياس هاملتون لتقدير القلق — HAM-A',
    titleEn: 'Hamilton Anxiety Rating Scale',
    version: '14 clinician-rated domains; 0–4 each',
    provenance: 'CDISC يسجل HAM-A Public Domain. ورقة روافد تحفظ المجالات الأربعة عشر وبنية 0–4؛ الوصف السريري التفصيلي داخل كل مجال يحتاج تدريبًا ومصدرًا معياريًا عند الاستخدام البحثي الرسمي.',
    rightsNotice: 'الأصل Public Domain. لا تستخدم قائمة أعراض مترجمة محليًا على أنها نسخة عربية محققة دون توثيق.',
    intendedUseAr: 'تقدير شدة أعراض القلق النفسية والجسدية بواسطة مُقيّم سريري.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'التشخيص/السياق', 'الأدوية والتغييرات الحديثة'],
    preflightChecks: ['المقياس مُقيّم سريريًا وليس استبيان تقرير ذاتي بسيطًا.', 'اجمع تاريخًا كافيًا قبل التقدير، خصوصًا للأعراض الجسدية التي قد يكون لها سبب طبي.'],
    sections: [{
      titleAr: 'المجالات الأربعة عشر — 0 غير موجود إلى 4 شديد جدًا',
      items: [
        ['HAMA1','المزاج القَلِق: القلق والتوقعات السلبية والانشغال.'],
        ['HAMA2','التوتر: الشعور بالتوتر، التعب، صعوبة الاسترخاء أو الاستثارة.'],
        ['HAMA3','المخاوف: مخاوف نوعية مثل الظلام أو الغرباء أو الوحدة أو المرض حسب الحالة.'],
        ['HAMA4','الأرق واضطراب النوم.'],
        ['HAMA5','الأعراض الفكرية/المعرفية مثل ضعف التركيز أو الذاكرة.'],
        ['HAMA6','المزاج المكتئب وفقد الاهتمام.'],
        ['HAMA7','الأعراض الجسدية العضلية.'],
        ['HAMA8','الأعراض الجسدية الحسية.'],
        ['HAMA9','الأعراض القلبية الوعائية.'],
        ['HAMA10','الأعراض التنفسية.'],
        ['HAMA11','الأعراض المعدية المعوية.'],
        ['HAMA12','الأعراض البولية/التناسلية.'],
        ['HAMA13','الأعراض اللاإرادية مثل جفاف الفم أو التعرق أو الدوار.'],
        ['HAMA14','السلوك أثناء المقابلة مثل التململ أو التوتر الملحوظ.'],
      ].map(([code, labelAr]) => ({ code, labelAr, type: 'task-score' as const, options: severity04 })),
    }],
    scoringSteps: ['اجمع 14 مجالًا: النطاق 0–56.', 'توجد نطاقات شائعة لتوصيف الشدة، لكنها تختلف بين المصادر والسياقات؛ لا تحولها إلى تشخيص آلي.', 'افصل قراءة العناصر النفسية عن الجسدية عند تفسير سبب ارتفاع المجموع.'],
    interpretationGuardrails: ['HAM-A يقيس الشدة ولا يثبت اضطراب قلق بعينه.', 'الأعراض القلبية أو التنفسية أو الهضمية أو العصبية تحتاج تفسيرًا طبيًا مناسبًا عندما تكون جديدة أو شديدة.'],
    stopRules: ['أعراض طبية حادة أو خطر نفسي مباشر يستوجب مسار تقييم عاجل بدل الاعتماد على الدرجة.'],
    officialDownloads: [{ label: 'CDISC QRS — HAM-A Public Domain record', url: 'https://www.cdisc.org/standards/foundational/qrs', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs','https://pmc.ncbi.nlm.nih.gov/articles/PMC9447374/'],
    lastVerifiedOn: '2026-09-05',
  },

  'satisfaction-with-life-scale': {
    slug: 'satisfaction-with-life-scale',
    kind: 'full-instrument',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'مقياس الرضا عن الحياة — SWLS',
    titleEn: 'Satisfaction With Life Scale',
    version: '5 items; 7-point agreement scale',
    provenance: 'موقع المؤلف Ed Diener يوضح أن SWLS محمي بحقوق النشر لكنه متاح مجانًا للاستخدام غير التجاري مع نسبة العمل للمؤلفين، ويوفر ترجمتين عربيتين رسميتين للتنزيل.',
    rightsNotice: 'الاستخدام على روافد مسموح فقط ضمن الاستخدام غير التجاري مع النسبة. لا نصف SWLS بأنه Public Domain، حتى لو صنفته مصادر ثانوية بهذه الطريقة.',
    intendedUseAr: 'قياس الحكم المعرفي العام على الرضا عن الحياة عبر خمسة بنود.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'النسخة/اللغة'],
    preflightChecks: ['تأكد أن الاستخدام غير تجاري.', 'انسب المقياس إلى Diener, Emmons, Larsen & Griffin (1985).', 'للاستخدام العربي الرسمي استخدم إحدى الترجمات العربية المتاحة من موقع المؤلف بدل اعتبار صياغة روافد نسخة رسمية.'],
    sections: [{
      titleAr: 'حدد مدى موافقتك على كل عبارة',
      instructionsAr: 'الصياغة العربية التالية شرح تشغيلي؛ استخدم ملف الترجمة العربية الرسمي من موقع المؤلف عند التطبيق الرسمي.',
      items: [
        ['SWLS1','حياتي قريبة عمومًا من الصورة المثالية التي أتمناها.'],
        ['SWLS2','ظروف حياتي جيدة جدًا.'],
        ['SWLS3','أنا راضٍ عن حياتي.'],
        ['SWLS4','حتى الآن حصلت على الأشياء المهمة التي أريدها في الحياة.'],
        ['SWLS5','لو أعدت عيش حياتي، فلن أغيّر إلا القليل جدًا.'],
      ].map(([code, labelAr]) => ({ code, labelAr, type: 'choice' as const, options: agree17 })),
    }],
    scoringSteps: ['اجمع البنود الخمسة: النطاق 5–35.', 'التفسير التقليدي: 31–35 رضا شديد، 26–30 رضا، 21–25 رضا طفيف، 20 محايد، 15–19 عدم رضا طفيف، 10–14 عدم رضا، 5–9 عدم رضا شديد.', 'استخدم المعايير/الترجمة المناسبة للمجتمع ولا تعتبر الدرجة تشخيصًا للصحة النفسية.'],
    interpretationGuardrails: ['SWLS يقيس الرضا المعرفي العام ولا يقيس الاكتئاب أو جودة الحياة الصحية بصورة كاملة.', 'شرط الاستخدام غير التجاري والنسبة يجب أن يبقى ظاهرًا.'],
    stopRules: [],
    officialDownloads: [{ label: 'Ed Diener — official SWLS page, permissions and Arabic translations', url: 'https://eddiener.com/satisfaction-with-life-scale-swls/', language: 'ar', publisher: 'Ed Diener' }],
    sourceUrls: ['https://eddiener.com/satisfaction-with-life-scale-swls/'],
    lastVerifiedOn: '2026-09-05',
  },

  'clinical-global-impression': {
    slug: 'clinical-global-impression',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'الانطباع السريري العالمي — CGI',
    titleEn: 'Clinical Global Impression',
    version: 'CGI-S + CGI-I + CGI-E',
    provenance: 'CDISC يسجل CGI Public Domain، وتصف NIDA/NCBI البنية الثلاثية: شدة المرض، التحسن العالمي، ومؤشر الفعالية.',
    rightsNotice: 'الأصل Public Domain. لا تجمع CGI-S وCGI-I وCGI-E في مجموع كلي؛ كل جزء يفسر منفصلًا.',
    intendedUseAr: 'تقدير سريري عالمي لشدة الحالة والتغير منذ خط الأساس وعلاقة الفائدة العلاجية بالآثار الجانبية.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'الحالة المستهدفة', 'خط الأساس/تاريخ بدء العلاج'],
    preflightChecks: ['يحتاج CGI معرفة سريرية كافية بالحالة والتاريخ.', 'حدد الحالة المستهدفة وخط الأساس قبل CGI-I.', 'لا تستخدم الانطباع العام بدل مقاييس نوعية عندما تكون مطلوبة.'],
    sections: [
      { titleAr: 'CGI-S — شدة المرض الحالية', items: [{ code: 'CGI-S', labelAr: 'الشدة الحالية', type: 'choice', options: [
        {labelAr:'1 — طبيعي/غير مريض',value:'1',score:1},{labelAr:'2 — حدّي',value:'2',score:2},{labelAr:'3 — خفيف',value:'3',score:3},{labelAr:'4 — متوسط',value:'4',score:4},{labelAr:'5 — ملحوظ',value:'5',score:5},{labelAr:'6 — شديد',value:'6',score:6},{labelAr:'7 — من أشد الحالات',value:'7',score:7},
      ] }] },
      { titleAr: 'CGI-I — التحسن مقارنة بخط الأساس', items: [{ code: 'CGI-I', labelAr: 'التغير العام', type: 'choice', options: [
        {labelAr:'1 — تحسن كبير جدًا',value:'1',score:1},{labelAr:'2 — تحسن كبير',value:'2',score:2},{labelAr:'3 — تحسن طفيف',value:'3',score:3},{labelAr:'4 — دون تغير',value:'4',score:4},{labelAr:'5 — أسوأ قليلًا',value:'5',score:5},{labelAr:'6 — أسوأ كثيرًا',value:'6',score:6},{labelAr:'7 — أسوأ بكثير جدًا',value:'7',score:7},
      ] }] },
      { titleAr: 'CGI-E — الفعالية والآثار الجانبية', instructionsAr: 'سجّل بعدي الفائدة والآثار الجانبية منفصلين ثم ارجع إلى مصفوفة CGI-E القياسية عند الحاجة البحثية الرسمية.', items: [
        { code:'CGI-E-BENEFIT', labelAr:'الفائدة العلاجية', type:'choice', options:[{labelAr:'تحسن ملحوظ',value:'marked'},{labelAr:'تحسن متوسط',value:'moderate'},{labelAr:'تحسن طفيف',value:'minimal'},{labelAr:'دون تغير أو أسوأ',value:'none-worse'}] },
        { code:'CGI-E-AE', labelAr:'أثر الآثار الجانبية', type:'choice', options:[{labelAr:'لا توجد',value:'none'},{labelAr:'لا تؤثر بوضوح في الأداء',value:'not-significant'},{labelAr:'تؤثر بوضوح في الأداء',value:'significant'},{labelAr:'تفوق الفائدة العلاجية',value:'outweigh'}] },
      ] },
    ],
    scoringSteps: ['سجّل CGI-S وCGI-I منفصلين من 1–7.', 'CGI-E مصفوفة فائدة × آثار جانبية، وليس مجموعًا يُضاف إلى الجزأين الآخرين.', 'لا يوجد CGI Total واحد معتمد.'],
    interpretationGuardrails: ['CGI عرضة للحكم الذاتي ويجب دعمها بمعلومات سريرية ومقاييس نوعية عند الإمكان.', 'ثبات تعريف خط الأساس أساسي لتفسير CGI-I.'],
    stopRules: ['أي خطر حاد أو تدهور شديد يستوجب إجراءً سريريًا مناسبًا ولا ينتظر تقدير CGI.'],
    officialDownloads: [{ label:'NIDA Data Share — Clinical Global Impression Scales',url:'https://datashare.nida.nih.gov/instrument/clinical-global-impression-scales',language:'en',publisher:'NIDA / NIH' }],
    sourceUrls:['https://datashare.nida.nih.gov/instrument/clinical-global-impression-scales','https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn:'2026-09-05',
  },

  'bode-index': {
    slug:'bode-index',kind:'scoring-form',completeness:'exact-public-domain-form',titleAr:'مؤشر BODE في مرض الانسداد الرئوي المزمن',titleEn:'BODE Index',version:'BMI + FEV1 + mMRC + 6MWD; total 0–10',provenance:'CDISC يسجل BODE Public Domain. الجدول التشغيلي مبني على بنية المؤشر الأصلية المنشورة.',rightsNotice:'Public Domain للأداة؛ لا تستخدم الدرجة كحاسبة وفاة فردية أو كشرط وحيد للأهلية العلاجية.',intendedUseAr:'دمج كتلة الجسم، انسداد مجرى الهواء، ضيق النفس والقدرة على التمرين لتوصيف مخاطر/شدة متعددة الأبعاد لدى COPD.',respondentFields:['الاسم/الرمز','التاريخ','الطول','الوزن','FEV1 بعد موسع قصبي % متوقع','6MWD','mMRC'],preflightChecks:['استخدم FEV1 % predicted بعد موسع قصبي وفق البروتوكول.', 'استخدم 6MWT موحدًا وآمنًا.', 'استخدم mMRC 0–4 كما هو محدد.', 'احسب BMI بوحدة kg/m².'],sections:[
      {titleAr:'BMI',items:[{code:'BODE-BMI',labelAr:'BMI',type:'choice',options:[{labelAr:'>21 = 0 نقطة',value:'0',score:0},{labelAr:'≤21 = 1 نقطة',value:'1',score:1}]}]},
      {titleAr:'FEV1 % المتوقع',items:[{code:'BODE-FEV1',labelAr:'درجة الانسداد',type:'choice',options:[{labelAr:'≥65% = 0',value:'0',score:0},{labelAr:'50–64% = 1',value:'1',score:1},{labelAr:'36–49% = 2',value:'2',score:2},{labelAr:'≤35% = 3',value:'3',score:3}]}]},
      {titleAr:'مسافة المشي 6 دقائق',items:[{code:'BODE-6MWD',labelAr:'6MWD',type:'choice',options:[{labelAr:'≥350 م = 0',value:'0',score:0},{labelAr:'250–349 م = 1',value:'1',score:1},{labelAr:'150–249 م = 2',value:'2',score:2},{labelAr:'≤149 م = 3',value:'3',score:3}]}]},
      {titleAr:'mMRC',items:[{code:'BODE-MMRC',labelAr:'درجة ضيق النفس',type:'choice',options:[{labelAr:'0–1 = 0',value:'0',score:0},{labelAr:'2 = 1',value:'1',score:1},{labelAr:'3 = 2',value:'2',score:2},{labelAr:'4 = 3',value:'3',score:3}]}]},
    ],scoringSteps:['اجمع نقاط المكونات الأربعة: النطاق 0–10.', 'الدرجة الأعلى ترتبط عادة بمآل أسوأ على مستوى المجموعات، لكنها ليست احتمال وفاة فرديًا مباشرًا.'],interpretationGuardrails:['لا تنشر روافد حاسبة وفاة أو توصية علاج آلية من BODE.', 'أي مقارنة طولية تحتاج بروتوكول FEV1 و6MWT ثابتًا.'],stopRules:['لا تُجرِ 6MWT عند عدم الأمان السريري؛ اتبع قواعد الإيقاف الخاصة به.'],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs','https://pmc.ncbi.nlm.nih.gov/articles/PMC2528218/'],lastVerifiedOn:'2026-09-05'
  },

  'harvey-bradshaw-index': {
    slug:'harvey-bradshaw-index',kind:'scoring-form',completeness:'exact-public-domain-form',titleAr:'مؤشر هارفي–برادشو لنشاط داء كرون — HBI',titleEn:'Harvey-Bradshaw Index',version:'5 components; additive score',provenance:'CDISC يسجل HBI Public Domain. بنية المؤشر الخماسية منشورة في إرشادات ودراسات داء كرون.',rightsNotice:'Public Domain. لا تخلط HBI مع pHBI أو CDAI أو نسخ محلية مختلفة.',intendedUseAr:'تقدير نشاط داء كرون سريريًا من الرفاه العام وألم البطن والبراز السائل وكتلة البطن والمضاعفات.',respondentFields:['الاسم/الرمز','التاريخ','الفاحص','جراحة/فغرة سابقة إن وجدت'],preflightChecks:['المكونات الثلاثة الأولى تعكس عادة اليوم السابق.', 'عدّ البراز السائل فعليًا ولا تحوله إلى فئات ما لم تستخدم نسخة تنص على ذلك.', 'قد تكون الأداة أقل ملاءمة مع الفغرات أو بعد بعض الجراحات.'],sections:[
      {titleAr:'الرفاه العام',items:[{code:'HBI-WELL',labelAr:'الحالة العامة',type:'choice',options:[{labelAr:'0 — جيد جدًا',value:'0',score:0},{labelAr:'1 — دون المعتاد قليلًا',value:'1',score:1},{labelAr:'2 — سيئ',value:'2',score:2},{labelAr:'3 — سيئ جدًا',value:'3',score:3},{labelAr:'4 — بالغ السوء',value:'4',score:4}]}]},
      {titleAr:'ألم البطن',items:[{code:'HBI-PAIN',labelAr:'شدة الألم',type:'choice',options:[{labelAr:'0 — لا يوجد',value:'0',score:0},{labelAr:'1 — خفيف',value:'1',score:1},{labelAr:'2 — متوسط',value:'2',score:2},{labelAr:'3 — شديد',value:'3',score:3}]}]},
      {titleAr:'البراز السائل',items:[{code:'HBI-STOOLS',labelAr:'عدد مرات البراز السائل خلال اليوم',type:'number',min:0,noteAr:'نقطة واحدة لكل مرة براز سائل.'}]},
      {titleAr:'كتلة البطن',items:[{code:'HBI-MASS',labelAr:'الفحص',type:'choice',options:[{labelAr:'0 — لا توجد',value:'0',score:0},{labelAr:'1 — مشكوك فيها',value:'1',score:1},{labelAr:'2 — مؤكدة',value:'2',score:2},{labelAr:'3 — مؤكدة ومؤلمة',value:'3',score:3}]}]},
      {titleAr:'المضاعفات — نقطة لكل واحدة',items:['ألم/التهاب مفاصل','التهاب عنبية','حمامى عقدة','قرح فموية قلاعية','تقيح الجلد الغنغريني','شق شرجي','ناسور جديد','خراج'].map((labelAr,index)=>({code:`HBI-C${index+1}`,labelAr,type:'checkbox' as const}))},
    ],scoringSteps:['المجموع = الرفاه + ألم البطن + عدد البراز السائل + كتلة البطن + عدد المضاعفات.', 'يستخدم كثيرًا <5 كهدأة و≥5 كنشاط؛ بعض الاستخدامات تضع عتبات أخرى للشدة، لذا وثق المصدر.', 'لا تستخدم HBI وحده لتحديد الحاجة إلى بيولوجي أو جراحة.'],interpretationGuardrails:['الأعراض قد لا تعكس الالتهاب الموضوعي دائمًا؛ اربطها بالفحوص والواسمات/التنظير عند الحاجة.'],stopRules:['ألم شديد متفاقم، انسداد محتمل، حمى/إنتان، نزف مهم أو خراج محتمل يحتاج تقييمًا عاجلًا.'],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs','https://pmc.ncbi.nlm.nih.gov/articles/PMC6334085/'],lastVerifiedOn:'2026-09-05'
  },

  'child-pugh-classification': {
    slug:'child-pugh-classification',kind:'clinical-classification',completeness:'exact-public-domain-form',titleAr:'تصنيف Child-Pugh لمرض الكبد',titleEn:'Child-Pugh Classification',version:'5 domains; total 5–15; classes A/B/C',provenance:'CDISC يسجل Child-Pugh Public Domain. الحدود المخبرية والسريرية موثقة في مراجع الكبد.',rightsNotice:'Public Domain. يجب تثبيت النسخة وخاصة تعريف الاستسقاء/الاعتلال الدماغي ومعالجة الأمراض الصفراوية.',intendedUseAr:'توصيف شدة مرض الكبد المزمن/التشمع إنذاريًا بصورة عامة.',respondentFields:['الاسم/الرمز','التاريخ','البيليروبين','الألبومين','INR أو PT','الاستسقاء','درجة الاعتلال الدماغي'],preflightChecks:['لا تستخدم Child-Pugh وحده لأهلية الزراعة أو قرار الجراحة أو الجرعات.', 'في الأمراض الصفراوية توجد حدود بيليروبين بديلة في بعض المراجع.', 'وثق هل تستخدم INR أم إطالة PT.'],sections:[
      {titleAr:'البيليروبين — mg/dL',items:[{code:'CP-BILI',labelAr:'البيليروبين',type:'choice',options:[{labelAr:'<2 = 1',value:'1',score:1},{labelAr:'2–3 = 2',value:'2',score:2},{labelAr:'>3 = 3',value:'3',score:3}]}]},
      {titleAr:'الألبومين — g/dL',items:[{code:'CP-ALB',labelAr:'الألبومين',type:'choice',options:[{labelAr:'>3.5 = 1',value:'1',score:1},{labelAr:'2.8–3.5 = 2',value:'2',score:2},{labelAr:'<2.8 = 3',value:'3',score:3}]}]},
      {titleAr:'التخثر',items:[{code:'CP-INR',labelAr:'INR',type:'choice',options:[{labelAr:'<1.7 = 1',value:'1',score:1},{labelAr:'1.7–2.3 = 2',value:'2',score:2},{labelAr:'>2.3 = 3',value:'3',score:3}]}]},
      {titleAr:'الاستسقاء',items:[{code:'CP-ASCITES',labelAr:'الاستسقاء',type:'choice',options:[{labelAr:'لا يوجد = 1',value:'1',score:1},{labelAr:'خفيف/مضبوط = 2',value:'2',score:2},{labelAr:'متوسط أو شديد رغم العلاج = 3',value:'3',score:3}]}]},
      {titleAr:'الاعتلال الدماغي الكبدي',items:[{code:'CP-HE',labelAr:'الدرجة',type:'choice',options:[{labelAr:'لا يوجد = 1',value:'1',score:1},{labelAr:'درجة I–II = 2',value:'2',score:2},{labelAr:'درجة III–IV = 3',value:'3',score:3}]}]},
    ],scoringSteps:['اجمع المجالات الخمسة: 5–15.', 'A = 5–6، B = 7–9، C = 10–15.', 'في أمراض صفراوية مختارة قد تستخدم حدود بيليروبين <4 / 4–10 / >10؛ لا تبدّل الحدود دون توثيق.'],interpretationGuardrails:['الفئات إنذارية عامة ولا تعطي قرار علاج فرديًا.', 'MELD/MELD 3.0 وسياسات الزراعة الحديثة قد تكون أنسب لأغراض أخرى.'],stopRules:['اعتلال دماغي حاد، نزف، إنتان أو عدم استقرار يحتاج تقييمًا عاجلًا.'],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs','https://www.ncbi.nlm.nih.gov/books/NBK224641/'],lastVerifiedOn:'2026-09-05'
  },

  'rutgeerts-score': {
    slug:'rutgeerts-score',kind:'clinical-classification',completeness:'exact-public-domain-form',titleAr:'درجة Rutgeerts للنكس التنظيري بعد جراحة كرون',titleEn:'Rutgeerts Score',version:'i0–i4; modified i2a/i2b context',provenance:'CDISC يسجل Rutgeerts Public Domain. التصنيف الأصلي والنسخة المعدلة موثقان في أدبيات المتابعة بعد الاستئصال اللفائفي القولوني.',rightsNotice:'Public Domain. لا تخلط i2 الأصلي مع i2a/i2b المعدل في قاعدة بيانات واحدة دون وسم الإصدار.',intendedUseAr:'تصنيف شدة النكس التنظيري في اللفائفي النهائي/المفاغرة بعد جراحة كرون.',respondentFields:['الاسم/الرمز','تاريخ الجراحة','تاريخ التنظير','المُقيّم','نسخة التصنيف: أصلية/معدلة'],preflightChecks:['يطبق في السياق الجراحي المناسب لا في كل تنظير كرون.', 'وثق إن كانت الآفات محصورة بالمفاغرة أو في اللفائفي الجديد.', 'استخدم جودة تنظير كافية.'],sections:[{titleAr:'التصنيف',items:[{code:'RUT',labelAr:'درجة Rutgeerts',type:'choice',options:[{labelAr:'i0 — لا آفات',value:'i0'},{labelAr:'i1 — خمس آفات قلاعية أو أقل',value:'i1'},{labelAr:'i2 — أكثر من خمس آفات قلاعية مع مخاطية طبيعية بينها أو مناطق تخطٍ/آفات أكبر أو آفات محصورة بالمفاغرة',value:'i2'},{labelAr:'i3 — التهاب لفائفي قلاعي منتشر مع مخاطية ملتهبة بصورة منتشرة',value:'i3'},{labelAr:'i4 — التهاب منتشر شديد مع قرح كبيرة/عقيدات و/أو تضيق',value:'i4'}]}]},{titleAr:'إذا استخدمت النسخة المعدلة',items:[{code:'RUT-I2',labelAr:'تفصيل i2',type:'choice',options:[{labelAr:'غير منطبق',value:'na'},{labelAr:'i2a — آفات محصورة بخط المفاغرة مع أو بدون <5 آفات قلاعية لفائفية',value:'i2a'},{labelAr:'i2b — >5 آفات قلاعية أو مناطق تخطٍ/قرح أكبر في اللفائفي الجديد مع أو بدون آفات المفاغرة',value:'i2b'}]}]}],scoringSteps:['سجّل i0–i4، ومع النسخة المعدلة وثق i2a/i2b بوضوح.', 'لا تجعل الدرجة وحدها أمرًا آليًا بتصعيد العلاج؛ اربطها بعوامل الخطر والأعراض والواسمات والسياسة العلاجية.'],interpretationGuardrails:['تعريف النكس السريري والتنظيري ليس متطابقًا.', 'الإصدار المعدل يحتاج وسمًا منفصلًا عند المقارنة بالدراسات الأصلية.'],stopRules:[],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs','https://pmc.ncbi.nlm.nih.gov/articles/PMC12786823/'],lastVerifiedOn:'2026-09-05'
  },

  'kdigo-aki-stage': {
    slug:'kdigo-aki-stage',kind:'clinical-classification',completeness:'exact-public-domain-form',titleAr:'تصنيف KDIGO 2012 لإصابة الكلى الحادة — AKI',titleEn:'KDIGO 2012 Acute Kidney Injury Stage',version:'KDIGO 2012 creatinine/urine-output staging',provenance:'جدول KDIGO 2012 الرسمي يحدد المراحل 1–3 بحسب الكرياتينين وإدرار البول. توجد مسودة تحديث 2026، لذلك تُوسم هذه الورقة صراحة بأنها KDIGO 2012.',rightsNotice:'هذه ورقة تطبيق للتصنيف المنشور؛ لا تستخدمها كبديل عن أحدث إرشاد أو بروتوكول محلي عندما يتغير الإصدار.',intendedUseAr:'تصنيف شدة AKI بحسب أسوأ معيار كرياتينين أو إدرار بول محقق.',respondentFields:['الاسم/الرمز','التاريخ/الوقت','الكرياتينين الأساسي','الكرياتينين الحالي','الوزن','إدرار البول وفترته','RRT إن وجد'],preflightChecks:['ثبت baseline المناسب للكرياتينين.', 'احسب إدرار البول بوحدة mL/kg/h على الفترة الصحيحة.', 'اختر المرحلة الأعلى إذا اختلف معيار الكرياتينين عن البول.', 'تحقق من أحدث KDIGO قبل اعتماد سياسة مؤسسية.'],sections:[{titleAr:'مرحلة AKI',items:[{code:'KDIGO-AKI',labelAr:'اختر أعلى مرحلة محققة',type:'choice',options:[{labelAr:'Stage 1 — SCr 1.5–1.9× baseline أو زيادة ≥0.3 mg/dL؛ أو بول <0.5 mL/kg/h لمدة 6–12 ساعة',value:'1',score:1},{labelAr:'Stage 2 — SCr 2.0–2.9× baseline؛ أو بول <0.5 mL/kg/h لمدة ≥12 ساعة',value:'2',score:2},{labelAr:'Stage 3 — SCr 3× baseline أو ≥4.0 mg/dL أو بدء RRT أو <18 سنة eGFR <35؛ أو بول <0.3 mL/kg/h لمدة ≥24 ساعة أو انقطاع بول ≥12 ساعة',value:'3',score:3}]}]}],scoringSteps:['مرحلة AKI هي أعلى مرحلة يحققها أي من معياري الكرياتينين أو إدرار البول.', 'سجل المعيار الذي حدد المرحلة والوقت.', 'هذه نسخة KDIGO 2012؛ لا تفترض أنها تمثل أي تحديث نهائي لاحق.'],interpretationGuardrails:['المرحلة لا تحدد وحدها سبب AKI أو الحاجة إلى RRT أو السوائل أو الجرعات.', 'قرار العلاج يعتمد على السياق والديناميكا الدموية والشوارد والحمولة والسُمية وغيرها.'],stopRules:['قلة البول الحادة، فرط بوتاسيوم، حماض شديد، وذمة رئوية أو عدم استقرار يتطلب تقييمًا عاجلًا.'],officialDownloads:[{label:'KDIGO 2012 AKI Guideline — staging table',url:'https://kdigo.org/wp-content/uploads/2017/04/KDIGO-AKI-Guideline_Cass-2014.pdf',language:'en',publisher:'KDIGO'}],sourceUrls:['https://kdigo.org/wp-content/uploads/2017/04/KDIGO-AKI-Guideline_Cass-2014.pdf'],lastVerifiedOn:'2026-09-05'
  },

  'west-haven-hepatic-encephalopathy-grade': {
    slug:'west-haven-hepatic-encephalopathy-grade',kind:'clinical-classification',completeness:'exact-public-domain-form',titleAr:'معايير West Haven للاعتلال الدماغي الكبدي',titleEn:'West Haven Criteria for Hepatic Encephalopathy',version:'Grades 0–4',provenance:'التصنيف السريري منشور على نطاق واسع ويُستخدم لتوصيف الحالة العقلية في الاعتلال الدماغي الكبدي.',rightsNotice:'ورقة روافد تلخص التصنيف السريري ولا تنقل مادة تدريبية محمية.',intendedUseAr:'توصيف شدة التغير العصبي النفسي في HE من دون جعل الأمونيا أو الدرجة وحدهما تشخيصًا.',respondentFields:['الاسم/الرمز','التاريخ/الوقت','الفاحص','حالة الكبد','أسباب بديلة محتملة لاضطراب الوعي'],preflightChecks:['استبعد/قيّم الأسباب الأخرى لتغير الوعي.', 'لا تعتمد على مستوى الأمونيا وحده.', 'ميّز minimal/covert HE عن الدرجات السريرية الظاهرة حسب البروتوكول.'],sections:[{titleAr:'درجة West Haven',items:[{code:'WHC',labelAr:'الدرجة',type:'choice',options:[{labelAr:'0 — لا شذوذات سريرية ظاهرة',value:'0',score:0},{labelAr:'I — نقص وعي بسيط/قلق أو نشوة/قصر انتباه/ضعف الحساب أو تغير النوم',value:'1',score:1},{labelAr:'II — خمول أو لامبالاة، اضطراب اتجاه للوقت، تغير شخصية/سلوك غير مناسب وقد يظهر asterixis',value:'2',score:2},{labelAr:'III — نعاس إلى شبه سبات مع بقاء الاستجابة، ارتباك واضطراب اتجاه واضح وسلوك غريب',value:'3',score:3},{labelAr:'IV — غيبوبة وعدم القدرة على اختبار الحالة العقلية',value:'4',score:4}]}]}],scoringSteps:['سجل الدرجة السريرية مع علامات الفحص والمصدر والتوقيت.', 'الدرجات II–IV تمثل HE ظاهرًا في كثير من الأطر؛ لكن التشخيص يحتاج سياقًا كبديًا واستبعاد أسباب أخرى.'],interpretationGuardrails:['الأمونيا لا تكفي وحدها للتشخيص أو الدرجة.', 'المهدئات والإنتان والنزف واضطراب الشوارد والسكتة وغيرها قد تحاكي أو تفاقم HE.'],stopRules:['درجة III–IV أو أي تدهور وعي حاد يحتاج تقييمًا عاجلًا ومراقبة مجرى الهواء/الأسباب المهددة للحياة وفق السياق.'],sourceUrls:['https://pmc.ncbi.nlm.nih.gov/articles/PMC3971432/','https://pmc.ncbi.nlm.nih.gov/articles/PMC10885427/'],lastVerifiedOn:'2026-09-05'
  },

  'psoriasis-area-severity-index-fredriksson': {
    slug:'psoriasis-area-severity-index-fredriksson',kind:'scoring-form',completeness:'exact-public-domain-form',titleAr:'مؤشر مساحة وشدة الصدفية — PASI',titleEn:'Psoriasis Area and Severity Index',version:'Fredriksson PASI; 4 regions; range 0–72',provenance:'CDISC يسجل PASI-F Public Domain. المعادلة القياسية تجمع شدة الاحمرار والسماكة والقشور مع مساحة الإصابة وأوزان المناطق.',rightsNotice:'Public Domain للأداة؛ صور التدريب/مخططات الجسم من جهات أخرى قد تكون محمية ولا تُنسخ هنا.',intendedUseAr:'تقدير شدة الصدفية الجلدية ومداها عبر أربع مناطق جسم.',respondentFields:['الاسم/الرمز','التاريخ','الفاحص','العلاج الحالي'],preflightChecks:['قيّم كل منطقة منفصلة.', 'الشدة E/I/S من 0–4.', 'المساحة من 0–6 بحسب نسبة الجلد المصاب.', 'لا تنسخ صور جسم/تدريب محمية.'],sections:['الرأس والرقبة','الطرفان العلويان','الجذع','الطرفان السفليان'].map((region,index)=>({titleAr:region,items:[{code:`PASI-E${index+1}`,labelAr:'الاحمرار/erythema 0–4',type:'task-score' as const,options:zeroToFour},{code:`PASI-I${index+1}`,labelAr:'السماكة/induration 0–4',type:'task-score' as const,options:zeroToFour},{code:`PASI-S${index+1}`,labelAr:'القشور/desquamation 0–4',type:'task-score' as const,options:zeroToFour},{code:`PASI-A${index+1}`,labelAr:'درجة المساحة: 0=0%، 1=1–9%، 2=10–29%، 3=30–49%، 4=50–69%، 5=70–89%، 6=90–100%',type:'task-score' as const,options:zeroToSix}]})),scoringSteps:['لكل منطقة: (E + I + S) × Area × weight.', 'الأوزان: الرأس 0.1، الطرفان العلويان 0.2، الجذع 0.3، الطرفان السفليان 0.4.', 'PASI = مجموع المناطق؛ النطاق 0–72.'],interpretationGuardrails:['PASI لا يقيس الأعراض أو جودة الحياة مباشرة.', 'يحتاج تدريبًا لتقليل اختلاف تقدير المساحة والسماكة والحمامى.'],stopRules:[],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs','https://dermnetnz.org/topics/pasi-score'],lastVerifiedOn:'2026-09-05'
  },

  'vignos-lower-extremity-rating-scale': {
    slug:'vignos-lower-extremity-rating-scale',kind:'clinical-classification',completeness:'exact-public-domain-form',titleAr:'مقياس Vignos لوظيفة الطرفين السفليين',titleEn:'Vignos Lower Extremity Functional Grade',version:'Grades 1–10',provenance:'CDISC يسجل Vignos Public Domain، وتعرض دراسات Duchenne تسلسل الدرجات الوظيفية 1–10.',rightsNotice:'Public Domain. لا تجبر الشخص على صعود درج أو النهوض من كرسي فقط لإثبات درجة إذا كان ذلك غير آمن؛ يمكن الاعتماد على أداء معروف موثق حسب البروتوكول.',intendedUseAr:'تصنيف وظيفة الطرفين السفليين والمشي/الدرج في الاضطرابات العصبية العضلية.',respondentFields:['الاسم/الرمز','التاريخ','الفاحص','الأجهزة/الجبائر','وسيلة الحركة المعتادة'],preflightChecks:['قيّم سلامة المشي/الدرج قبل الاختبار.', 'وثق الجبائر والمساعدة المستخدمة.', 'لا تفرض محاولة غير آمنة.'],sections:[{titleAr:'درجة Vignos',items:[{code:'VIGNOS',labelAr:'اختر الدرجة المطابقة',type:'choice',options:[{labelAr:'1 — يمشي ويصعد الدرج دون مساعدة',value:'1',score:1},{labelAr:'2 — يمشي ويصعد الدرج باستخدام الدرابزين',value:'2',score:2},{labelAr:'3 — يمشي ويصعد الدرج ببطء مع الدرابزين (>12 ثانية لأربع درجات معيارية)',value:'3',score:3},{labelAr:'4 — يمشي دون مساعدة وينهض من الكرسي لكنه لا يصعد الدرج',value:'4',score:4},{labelAr:'5 — يمشي دون مساعدة لكنه لا ينهض من الكرسي ولا يصعد الدرج',value:'5',score:5},{labelAr:'6 — يمشي فقط بمساعدة شخص أو يمشي مستقلًا بجبائر طويلة للساقين',value:'6',score:6},{labelAr:'7 — يمشي بجبائر طويلة ويحتاج مساعدة للتوازن',value:'7',score:7},{labelAr:'8 — يقف بجبائر طويلة لكنه لا يستطيع المشي حتى مع المساعدة',value:'8',score:8},{labelAr:'9 — يستخدم كرسيًا متحركًا',value:'9',score:9},{labelAr:'10 — ملازم للسرير',value:'10',score:10}]}]}],scoringSteps:['اختر درجة واحدة تمثل أفضل وصف وظيفي حالي ثابت.', 'الدرجة الأعلى تعكس فقدًا وظيفيًا أكبر.'],interpretationGuardrails:['لا تستخدم الدرجة وحدها لتحديد أهلية علاج أو جهاز أو دعم.', 'تغير الدرجة قد يتأثر بإصابة/مرض حاد أو البيئة.'],stopRules:['لا تطلب محاولة درج/قيام غير آمنة أو قد تسبب سقوطًا.'],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs','https://pmc.ncbi.nlm.nih.gov/articles/PMC4147958/'],lastVerifiedOn:'2026-09-05'
  },
};
