import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const yesNo: OperationalOption[] = [
  { labelAr: 'نعم', value: 'yes', score: 1 },
  { labelAr: 'لا', value: 'no', score: 0 },
];

const zeroToFour: OperationalOption[] = [0, 1, 2, 3, 4].map((score) => ({ labelAr: String(score), value: String(score), score }));

const pclOptions: OperationalOption[] = [
  { labelAr: '0 — إطلاقًا', value: '0', score: 0 },
  { labelAr: '1 — قليلًا', value: '1', score: 1 },
  { labelAr: '2 — بدرجة متوسطة', value: '2', score: 2 },
  { labelAr: '3 — بدرجة كبيرة', value: '3', score: 3 },
  { labelAr: '4 — بدرجة شديدة جدًا', value: '4', score: 4 },
];

const lecOptions: OperationalOption[] = [
  { labelAr: 'حدث لي', value: 'happened-to-me' },
  { labelAr: 'شاهدته', value: 'witnessed' },
  { labelAr: 'علمت بحدوثه لشخص قريب', value: 'learned-about' },
  { labelAr: 'تعرضت لتفاصيله ضمن عملي', value: 'job-exposure' },
  { labelAr: 'غير متأكد', value: 'not-sure' },
  { labelAr: 'لا ينطبق', value: 'not-applicable' },
];

export const assessmentOperationalFullFormsWave1: Record<string, AssessmentOperationalMaterial> = {
  'roland-morris-disability-questionnaire': {
    slug: 'roland-morris-disability-questionnaire',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'استبيان رولاند–موريس للعجز بسبب ألم أسفل الظهر — RMDQ-24',
    titleEn: 'Roland-Morris Disability Questionnaire — 24 items',
    version: 'RMDQ-24 original structure',
    provenance: 'RMD يذكر صراحة أن الأصل وجميع الترجمات في المجال العام ولا يلزم إذن أو رسم لإعادة الاستخدام. البنود العربية هنا ترجمة تشغيلية من روافد؛ النسخة العربية المحققة بعينها يجب أن تُطابق قبل الاستخدام البحثي/السريري الرسمي.',
    rightsNotice: 'يمكن إعادة إنتاج RMDQ-24. لا تخلط هذه النسخة ذات 24 بندًا مع النسخ المختصرة أو المعدلة عند المقارنة أو تفسير التغير.',
    intendedUseAr: 'قياس أثر ألم أسفل الظهر على النشاط والوظيفة اليومية اليوم/في الفترة المحددة بالنسخة.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'مدة ألم أسفل الظهر', 'النسخة/اللغة'],
    preflightChecks: ['استخدم RMDQ-24 ولا تخلطه بنسخة 18/11/15 بندًا.', 'اطلب من الشخص تحديد العبارات التي تصفه بسبب الظهر، لا بسبب مرض آخر.', 'ثبّت اللغة والنسخة في القياسات المتكررة.'],
    sections: [{
      titleAr: 'ضع علامة «نعم» أمام كل عبارة تنطبق عليك بسبب ألم ظهرك',
      instructionsAr: 'ترجمة تشغيلية عربية من روافد للبنية الأصلية؛ للاستخدام الرسمي طابق النص مع النسخة العربية المحققة التي اخترتها.',
      items: [
        ['RMDQ1','أبقى في المنزل معظم الوقت بسبب ظهري.'],
        ['RMDQ2','أغيّر وضعي كثيرًا كي أجعل ظهري أكثر راحة.'],
        ['RMDQ3','أمشي أبطأ من المعتاد بسبب ظهري.'],
        ['RMDQ4','لا أقوم ببعض أعمال المنزل المعتادة بسبب ظهري.'],
        ['RMDQ5','أستخدم الدرابزين عند صعود الدرج بسبب ظهري.'],
        ['RMDQ6','أستلقي للراحة أكثر من المعتاد بسبب ظهري.'],
        ['RMDQ7','أحتاج التمسك بشيء للنهوض من الكرسي بسبب ظهري.'],
        ['RMDQ8','أطلب من الآخرين القيام بأشياء عني بسبب ظهري.'],
        ['RMDQ9','أرتدي ملابسي أبطأ من المعتاد بسبب ظهري.'],
        ['RMDQ10','لا أستطيع الوقوف إلا لفترات قصيرة بسبب ظهري.'],
        ['RMDQ11','أتجنب الانحناء أو الركوع بسبب ظهري.'],
        ['RMDQ12','أجد صعوبة في النهوض من الكرسي بسبب ظهري.'],
        ['RMDQ13','أشعر بألم الظهر معظم الوقت تقريبًا.'],
        ['RMDQ14','أجد صعوبة في التقلب في السرير بسبب ظهري.'],
        ['RMDQ15','شهيتي أقل بسبب ألم ظهري.'],
        ['RMDQ16','أجد صعوبة في ارتداء الجوارب بسبب ألم ظهري.'],
        ['RMDQ17','لا أمشي إلا مسافات قصيرة بسبب ألم ظهري.'],
        ['RMDQ18','أنام بصورة أسوأ بسبب ظهري.'],
        ['RMDQ19','أحتاج مساعدة شخص آخر في ارتداء ملابسي بسبب ألم ظهري.'],
        ['RMDQ20','أقضي معظم اليوم جالسًا بسبب ظهري.'],
        ['RMDQ21','أتجنب الأعمال المنزلية الثقيلة بسبب ظهري.'],
        ['RMDQ22','أكون أكثر تهيجًا أو سوء مزاج مع الناس بسبب ألم ظهري.'],
        ['RMDQ23','أصعد الدرج أبطأ من المعتاد بسبب ظهري.'],
        ['RMDQ24','أبقى في السرير معظم الوقت بسبب ظهري.'],
      ].map(([code,labelAr]) => ({ code, labelAr, type: 'choice' as const, options: yesNo })),
    }],
    scoringSteps: ['احسب بندًا واحدًا لكل «نعم» تنطبق: المجموع 0–24.', 'الدرجة الأعلى تعكس عجزًا وظيفيًا أكبر بسبب ألم أسفل الظهر.', 'لا تطبق MCID/MDC دون مطابقة السكان والنسخة والزمن؛ RMD يعرض قيمًا متعددة تختلف حسب المجتمع.'],
    interpretationGuardrails: ['الاستبيان لا يحدد سبب الألم ولا يشخّص فتقًا أو تضيقًا أو مرضًا خطيرًا.', 'التغير في الدرجة يجب تفسيره مع الألم والوظيفة وأهداف المريض.'],
    stopRules: ['أعراض إنذار مثل ضعف عصبي متفاقم أو اضطراب تحكم بالمثانة/الأمعاء أو حمى/رض شديد تحتاج تقييمًا طبيًا مستقلًا.'],
    officialDownloads: [{ label: 'RMD — RMDQ evidence and original instrument access', url: 'https://www.sralab.org/rehabilitation-measures/roland-morris-disability-questionnaire', language: 'en', publisher: 'RehabMeasures Database / Shirley Ryan AbilityLab' }],
    sourceUrls: ['https://www.sralab.org/rehabilitation-measures/roland-morris-disability-questionnaire','https://eprovide.mapi-trust.org/instruments/roland-morris-disability-questionnaire-24-items'],
    lastVerifiedOn: '2026-09-05',
  },

  'ptsd-checklist-for-dsm5': {
    slug: 'ptsd-checklist-for-dsm5',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'قائمة أعراض اضطراب ما بعد الصدمة لـDSM-5 — PCL-5',
    titleEn: 'PTSD Checklist for DSM-5 — PCL-5',
    version: 'Standard PCL-5, past month, 20 items',
    provenance: 'المركز الوطني الأمريكي لـPTSD يصرح أن PCL-5 مطور من موظفيه وهو في المجال العام وغير محمي بحقوق النشر. الترجمة العربية التالية تشغيلية من روافد وليست ترجمة رسمية من VA أو نسخة عربية محققة بحد ذاتها.',
    rightsNotice: 'الأصل Public Domain. للاستخدام العربي الرسمي استخدم ترجمة عربية محققة محددة واذكر مصدرها؛ VA يذكر أن ترجماته الرسمية المؤكدة المتاحة حاليًا ليست عربية.',
    intendedUseAr: 'قياس شدة 20 عرضًا من أعراض PTSD خلال الشهر الماضي، للمتابعة أو الفحص أو دعم تشخيص مبدئي؛ لا يستبدل مقابلة تشخيصية منظمة.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الحدث المرجعي/أسوأ حدث إن كان مناسبًا', 'الفترة المرجعية', 'طريقة التطبيق'],
    preflightChecks: ['الفترة القياسية: الشهر الماضي.', 'حدّد الحدث المرجعي عند استخدام الصيغة القياسية.', 'وفّر بيئة آمنة وتجنب إجبار الشخص على وصف تفاصيل الصدمة.', 'وجود ضيق شديد أو خطر على النفس يحتاج تقييمًا مباشرًا.'],
    sections: [{
      titleAr: 'خلال الشهر الماضي، إلى أي درجة أزعجتك المشكلات التالية المرتبطة بالتجربة الضاغطة؟',
      instructionsAr: 'ترجمة تشغيلية مختصرة من روافد؛ النسخة الإنجليزية الرسمية من VA هي المرجع القياسي.',
      items: [
        ['PCL1','ذكريات مزعجة ومتكررة وغير مرغوبة عن الحدث.'],['PCL2','أحلام مزعجة ومتكررة مرتبطة بالحدث.'],['PCL3','الشعور أو التصرف كما لو أن الحدث يحدث من جديد.'],['PCL4','ضيق نفسي شديد عند التذكير بالحدث.'],['PCL5','ردود فعل جسدية قوية عند التذكير بالحدث.'],['PCL6','تجنب ذكريات أو أفكار أو مشاعر مرتبطة بالحدث.'],['PCL7','تجنب أشخاص أو أماكن أو أنشطة أو مواقف تذكّر بالحدث.'],['PCL8','صعوبة تذكر أجزاء مهمة من الحدث.'],['PCL9','معتقدات سلبية قوية عن النفس أو الآخرين أو العالم.'],['PCL10','لوم النفس أو الآخرين على الحدث أو نتائجه.'],['PCL11','مشاعر سلبية قوية مثل الخوف أو الغضب أو الذنب أو العار.'],['PCL12','فقد الاهتمام بأنشطة كنت تستمتع بها.'],['PCL13','الشعور بالبعد أو الانفصال عن الآخرين.'],['PCL14','صعوبة الشعور بمشاعر إيجابية.'],['PCL15','تهيّج أو نوبات غضب أو سلوك عدواني.'],['PCL16','المخاطرة الزائدة أو القيام بأشياء قد تسبب الأذى.'],['PCL17','التيقظ الشديد أو البقاء على حذر دائم.'],['PCL18','سهولة الفزع أو الاستثارة المفاجئة.'],['PCL19','صعوبة التركيز.'],['PCL20','صعوبة البدء بالنوم أو الاستمرار فيه.'],
      ].map(([code,labelAr]) => ({ code, labelAr, type: 'choice' as const, options: pclOptions })),
    }],
    scoringSteps: ['اجمع البنود العشرين: 0–80.', 'يمكن فحص تجمعات DSM-5 أو استخدام مجموع كلي وفق دليل VA، لكن التشخيص النهائي يتطلب تقييمًا سريريًا مناسبًا.', 'VA يذكر أن cut-off تقريبيًا قد يختلف حسب المجتمع والغرض؛ لا تثبت قيمة واحدة لكل السكان.'],
    interpretationGuardrails: ['لا تستخدم PCL-5 كأداة تشخيص وحيدة.', 'تغيير الفترة المرجعية أو صياغة البنود قد يغير الخصائص السيكومترية.', 'لا تصف ترجمة روافد هذه بأنها نسخة عربية رسمية أو محققة.'],
    stopRules: ['ضيق شديد أو إفصاح عن خطر إيذاء النفس/الآخرين يستوجب تقييم سلامة مباشرًا.', 'يمكن إيقاف الاستبيان إذا أصبح تذكر الصدمة غير محتمل أو غير آمن.'],
    officialDownloads: [{ label: 'VA National Center for PTSD — official PCL-5 forms', url: 'https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp', language: 'en', publisher: 'U.S. Department of Veterans Affairs — National Center for PTSD' }],
    sourceUrls: ['https://www.ptsd.va.gov/professional/assessment/adult-sr/ptsd-checklist.asp','https://www.ptsd.va.gov/professional/assessment/documents/PCL5_Standard_form.pdf','https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn: '2026-09-05',
  },

  'life-events-checklist-dsm5-standard': {
    slug: 'life-events-checklist-dsm5-standard',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'قائمة أحداث الحياة لـDSM-5 — LEC-5 القياسية',
    titleEn: 'Life Events Checklist for DSM-5 — Standard Version',
    version: 'LEC-5 Standard; lifetime exposure; 17 event categories',
    provenance: 'VA National Center for PTSD أنشأ LEC-5 ويوفر النموذج مباشرة؛ CDISC يسجل النسخة القياسية Public Domain. الترجمة العربية هنا تشغيلية من روافد وليست ترجمة VA رسمية.',
    rightsNotice: 'الأصل Public Domain. لا تخلط النسخة القياسية بالممتدة أو المقابلة، ولا تعدّ عدد الأحداث كتشخيص PTSD.',
    intendedUseAr: 'مسح التعرض مدى الحياة لأحداث قد تكون صادمة، غالبًا قبل PCL-5/CAPS-5 أو ضمن تقييم الصدمة.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص/طريقة التطبيق'],
    preflightChecks: ['اشرح أن الشخص يستطيع اختيار أكثر من نوع تعرض لكل حدث.', 'لا تطلب تفاصيل غير ضرورية.', 'وفّر خيار التوقف إذا سبب التقييم ضيقًا شديدًا.'],
    sections: [{
      titleAr: 'طوال حياتك، حدّد طريقة التعرض لكل حدث',
      instructionsAr: 'يمكن اختيار أكثر من خانة عند الحاجة. الصياغة العربية تشغيلية؛ النموذج الرسمي الإنجليزي من VA هو المرجع.',
      items: [
        ['LEC1','كارثة طبيعية.'],['LEC2','حريق أو انفجار.'],['LEC3','حادث نقل خطير.'],['LEC4','حادث خطير في العمل أو المنزل أو أثناء نشاط ترفيهي.'],['LEC5','التعرض لمادة سامة أو إشعاع أو مواد خطرة.'],['LEC6','اعتداء جسدي.'],['LEC7','اعتداء أو تهديد بسلاح.'],['LEC8','اعتداء جنسي.'],['LEC9','تجربة جنسية أخرى غير مرغوبة أو غير مريحة.'],['LEC10','قتال أو التعرض لمنطقة حرب.'],['LEC11','أسر أو اختطاف أو احتجاز رهينة.'],['LEC12','مرض أو إصابة مهددة للحياة.'],['LEC13','معاناة بشرية شديدة.'],['LEC14','وفاة عنيفة مفاجئة.'],['LEC15','وفاة عرضية مفاجئة.'],['LEC16','إصابة خطيرة أو أذى أو وفاة تسببت بها لشخص آخر.'],['LEC17','حدث شديد الضغط أو الصدمة غير مذكور أعلاه.'],
      ].map(([code,labelAr]) => ({ code, labelAr, type: 'choice' as const, options: lecOptions, noteAr: 'قد ينطبق أكثر من نوع تعرض؛ في النسخة الورقية الرسمية يمكن تحديد أكثر من خانة.' })),
    }],
    scoringSteps: ['LEC-5 ليست مقياس شدة ذا مجموع تشخيصي واحد.', 'استخدمها لتحديد نوع التعرض والحدث المرجعي، ثم طبّق تقييم PTSD المناسب عند الحاجة.', 'تحقق من Criterion A سريريًا؛ مجرد اختيار حدث لا يثبت أنه يحقق المعيار.'],
    interpretationGuardrails: ['لا تحول عدد الأحداث إلى درجة “صدمة” أو تشخيص.', 'لا تستنتج PTSD من LEC-5 دون تقييم الأعراض والمعايير.'],
    stopRules: ['أوقف/أجّل التقييم إذا حدث ضيق شديد أو خطر حاد، وفعّل مسار السلامة المناسب.'],
    officialDownloads: [{ label: 'VA National Center for PTSD — official LEC-5 forms', url: 'https://www.ptsd.va.gov/professional/assessment/te-measures/life_events_checklist.asp', language: 'en', publisher: 'U.S. Department of Veterans Affairs — National Center for PTSD' }],
    sourceUrls: ['https://www.ptsd.va.gov/professional/assessment/te-measures/life_events_checklist.asp','https://www.cdisc.org/standards/foundational/qrs'],
    lastVerifiedOn: '2026-09-05',
  },

  'disability-rating-scale': {
    slug: 'disability-rating-scale',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس تصنيف العجز بعد إصابة الدماغ — DRS',
    titleEn: 'Disability Rating Scale',
    version: '8 items; total 0–29',
    provenance: 'CDISC يسجل DRS Public Domain، وNIH/FITBIR يعرض بنية المقياس. الترجمة العربية هنا تشغيلية وليست نسخة عربية محققة بعينها.',
    rightsNotice: 'الأصل Public Domain. سجّل العناصر الثمانية منفصلة ثم المجموع؛ الدرجة الأعلى تعكس عجزًا أشد.',
    intendedUseAr: 'تتبع التعافي الوظيفي بعد إصابة دماغية عبر الوعي والرعاية الذاتية والاعتماد والتكيف النفسي الاجتماعي.',
    respondentFields: ['الاسم/الرمز', 'التاريخ والوقت', 'الفاحص', 'تاريخ الإصابة', 'مصدر المعلومات'],
    preflightChecks: ['اعتمد أفضل استجابة قابلة للملاحظة.', 'افصل أثر الوعي عن القيود الجسدية عندما يطلب البند قدرة معرفية على الرعاية الذاتية.', 'وثق القيود التي تجعل عنصرًا غير قابل للتقييم.'],
    sections: [
      { titleAr: 'الإثارة والوعي والاستجابة', items: [
        { code:'DRS-EYE',labelAr:'فتح العينين',type:'choice',options:[{labelAr:'0 — تلقائي',value:'0',score:0},{labelAr:'1 — للكلام/المنبه الحسي',value:'1',score:1},{labelAr:'2 — للألم',value:'2',score:2},{labelAr:'3 — لا استجابة',value:'3',score:3}] },
        { code:'DRS-COMM',labelAr:'أفضل قدرة تواصل',type:'choice',options:[{labelAr:'0 — موجّه',value:'0',score:0},{labelAr:'1 — مرتبك',value:'1',score:1},{labelAr:'2 — غير مناسب',value:'2',score:2},{labelAr:'3 — غير مفهوم',value:'3',score:3},{labelAr:'4 — لا تواصل',value:'4',score:4}] },
        { code:'DRS-MOTOR',labelAr:'أفضل استجابة حركية',type:'choice',options:[{labelAr:'0 — يطيع',value:'0',score:0},{labelAr:'1 — يحدد موضع المنبه',value:'1',score:1},{labelAr:'2 — ينسحب',value:'2',score:2},{labelAr:'3 — انثناء',value:'3',score:3},{labelAr:'4 — بسط',value:'4',score:4},{labelAr:'5 — لا استجابة',value:'5',score:5}] },
      ] },
      { titleAr:'القدرة المعرفية على الرعاية الذاتية',instructionsAr:'قيّم معرفة الشخص كيف ومتى ينفذ الوظيفة، لا القوة الجسدية وحدها.',items:['التغذية','استخدام المرحاض','العناية الشخصية/التزيّن'].map((labelAr,index)=>({code:['DRS-FEED','DRS-TOILET','DRS-GROOM'][index],labelAr,type:'choice' as const,options:[{labelAr:'0 — كاملة',value:'0',score:0},{labelAr:'1 — جزئية',value:'1',score:1},{labelAr:'2 — حد أدنى',value:'2',score:2},{labelAr:'3 — معدومة',value:'3',score:3}]})) },
      { titleAr:'الاعتماد على الآخرين',items:[{code:'DRS-FUNCTION',labelAr:'مستوى الأداء الوظيفي',type:'choice',options:[{labelAr:'0 — مستقل تمامًا',value:'0',score:0},{labelAr:'1 — مستقل في بيئة خاصة',value:'1',score:1},{labelAr:'2 — اعتماد خفيف',value:'2',score:2},{labelAr:'3 — اعتماد متوسط',value:'3',score:3},{labelAr:'4 — اعتماد ملحوظ',value:'4',score:4},{labelAr:'5 — اعتماد كامل',value:'5',score:5}]}] },
      { titleAr:'التكيف النفسي الاجتماعي',items:[{code:'DRS-EMPLOY',labelAr:'القابلية للعمل/الدراسة/دور المنزل',type:'choice',options:[{labelAr:'0 — غير مقيد',value:'0',score:0},{labelAr:'1 — أعمال مختارة وتنافسية',value:'1',score:1},{labelAr:'2 — عمل محمي/غير تنافسي',value:'2',score:2},{labelAr:'3 — غير قابل للعمل حاليًا',value:'3',score:3}]}] },
    ],
    scoringSteps: ['اجمع العناصر الثمانية: 0–29.', '0 أفضل أداء و29 أشد عجزًا.', 'تصنيفات الشدة المنشورة يمكن استخدامها فقط مع توثيق المصدر والإصدار؛ لا تجعل الفئة بديلًا عن وصف العناصر.'],
    interpretationGuardrails: ['لا تستخدم DRS وحده للتنبؤ الحتمي بالمآل أو حرمان التأهيل.', 'قد تكون الدرجة الكلية نفسها ناتجة عن أنماط عجز مختلفة؛ راجع العناصر.'],
    stopRules: ['أي تدهور حاد في الوعي أو العلامات العصبية يستوجب تقييمًا طبيًا عاجلًا بدل الاكتفاء بإعادة التصنيف.'],
    officialDownloads: [{ label:'NIH Common Data Elements — Disability Rating Scale',url:'https://cde.nlm.nih.gov/formView?tinyId=XkP6_8s_KZ',language:'en',publisher:'NIH / NINDS' }],
    sourceUrls:['https://www.cdisc.org/standards/foundational/qrs','https://cde.nlm.nih.gov/formView?tinyId=XkP6_8s_KZ','https://fitbir.nih.gov/dictionary/publicData/dataStructureAction%21view.action?dataStructureName=DRS_TBI_FITBIR&publicArea=true&style.key=fitbir-style'],
    lastVerifiedOn:'2026-09-05',
  },

  'glasgow-outcome-scale-extended': {
    slug:'glasgow-outcome-scale-extended',kind:'clinical-classification',completeness:'standardized-protocol-sheet',titleAr:'مقياس غلاسكو الموسع للنتائج — GOSE',titleEn:'Glasgow Outcome Scale — Extended',version:'8 outcome categories with structured interview',
    provenance:'CDISC يسجل GOSE Public Domain. دليل المقابلة الحديث مفتوح CC BY؛ ورقة روافد تسجل النتيجة والمجالات ولا تستبدل نص المقابلة المعياري عند الدراسة الرسمية.',rightsNotice:'استخدم مقابلة GOSE المنظمة ومصدرها عند الحاجة إلى موثوقية بين المقيمين؛ لا تحول فئات النتيجة إلى تنبؤ حتمي.',intendedUseAr:'تصنيف النتيجة الوظيفية العالمية بعد إصابة الدماغ إلى ثماني فئات.',respondentFields:['الاسم/الرمز','التاريخ','تاريخ الإصابة','المقابل','مصدر المعلومات/المرافق'],preflightChecks:['قارن الوضع الحالي بوضع ما قبل الإصابة.','ركز على القدرة الفعلية الحالية لا التوقعات المستقبلية.','استخدم مقابلة منظمة ومُقيّمًا مدربًا عندما يكون ذلك جزءًا من بروتوكول الدراسة.'],
    sections:[{titleAr:'فئة GOSE النهائية',items:[{code:'GOSE',labelAr:'اختر الفئة',type:'choice',options:[{labelAr:'1 — وفاة',value:'1',score:1},{labelAr:'2 — حالة إنباتية/غياب استجابة هادفة',value:'2',score:2},{labelAr:'3 — عجز شديد أدنى',value:'3',score:3},{labelAr:'4 — عجز شديد أعلى',value:'4',score:4},{labelAr:'5 — عجز متوسط أدنى',value:'5',score:5},{labelAr:'6 — عجز متوسط أعلى',value:'6',score:6},{labelAr:'7 — تعافٍ جيد أدنى',value:'7',score:7},{labelAr:'8 — تعافٍ جيد أعلى',value:'8',score:8}]}]},{titleAr:'مجالات المقابلة المساندة',items:['الوعي/الاستجابة الهادفة','الاستقلال داخل المنزل','الاستقلال خارج المنزل/التسوق والتنقل','العمل أو الدراسة','الأنشطة الاجتماعية والترفيهية','العلاقات الأسرية والاجتماعية','المشكلات الحالية المنسوبة للإصابة'].map((labelAr,index)=>({code:`GOSE-D${index+1}`,labelAr,type:'text' as const}))}],
    scoringSteps:['عيّن فئة واحدة نهائية 1–8 وفق خوارزمية المقابلة المنظمة، وليس بالجمع الحسابي لمجالات منفصلة.','وثق مصدر المعلومات وأي عدم يقين.'],interpretationGuardrails:['GOSE مقياس رتبي عالمي؛ لا يصف جميع العجز المعرفي أو النفسي.','لا تستخدم الدرجة لسحب العلاج أو حرمان شخص من التأهيل.'],stopRules:['التغير العصبي الحاد يحتاج تقييمًا طبيًا مستقلًا.'],officialDownloads:[{label:'University of Stirling — GOSE structured interview resources',url:'https://www.stir.ac.uk/research/hub/publication/765612',language:'en',publisher:'University of Stirling'}],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs/extended-glasgow-outcome-scale','https://pmc.ncbi.nlm.nih.gov/articles/PMC8390784/'],lastVerifiedOn:'2026-09-05'
  },

  'patient-determined-disease-steps': {
    slug:'patient-determined-disease-steps',kind:'full-instrument',completeness:'exact-public-domain-form',titleAr:'خطوات المرض التي يحددها المريض — PDDS',titleEn:'Patient Determined Disease Steps',version:'0–8 patient-reported disability steps',provenance:'CDISC يسجل PDDS Public Domain. توجد نسخة عربية محققة منشورة، لكن نص ترجمتها المحدد يبقى مرتبطًا بمصدر الدراسة؛ الصياغة هنا تشغيلية من روافد.',rightsNotice:'الأصل Public Domain. لا تعامل PDDS وEDSS كمقياسين متبادلين واحدًا بواحد.',intendedUseAr:'تقرير ذاتي سريع عن مستوى العجز المرتبط بالتصلب المتعدد مع تركيز قوي على المشي والحركة.',respondentFields:['الاسم/الرمز','التاريخ','تشخيص MS/السياق','وسيلة الحركة المعتادة'],preflightChecks:['اطلب من الشخص اختيار مستوى واحد يصف وضعه الحالي أفضل وصف.','لا تحوّل النتيجة تلقائيًا إلى EDSS.'],sections:[{titleAr:'اختر مستوى PDDS',items:[{code:'PDDS',labelAr:'المستوى الحالي',type:'choice',options:[{labelAr:'0 — طبيعي',value:'0',score:0},{labelAr:'1 — عجز خفيف',value:'1',score:1},{labelAr:'2 — عجز متوسط',value:'2',score:2},{labelAr:'3 — عجز في المشي',value:'3',score:3},{labelAr:'4 — استخدام مبكر للعصا/مساعدة أحادية',value:'4',score:4},{labelAr:'5 — اعتماد متأخر على العصا/مساعدة أحادية',value:'5',score:5},{labelAr:'6 — دعم ثنائي/مشاية',value:'6',score:6},{labelAr:'7 — كرسي متحرك/سكوتر',value:'7',score:7},{labelAr:'8 — ملازم للسرير',value:'8',score:8}]}]}],scoringSteps:['سجّل مستوى واحدًا من 0 إلى 8؛ الأعلى يعكس عجزًا أكبر.','راجع الوصف الكامل للنسخة المستخدمة خصوصًا حدود المشي/المساعدة في الدرجات الوسطى.'],interpretationGuardrails:['PDDS يعتمد بدرجة كبيرة على الحركة ولا يغطي كل أعراض MS.','لا تستبدل به فحص EDSS العصبي عندما يكون EDSS مطلوبًا.'],stopRules:['أي تدهور عصبي حاد أو أعراض انتكاس محتملة تحتاج تقييمًا سريريًا.'],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs','https://pmc.ncbi.nlm.nih.gov/articles/PMC11235637/'],lastVerifiedOn:'2026-09-05'
  },

  'modified-medical-research-council-dyspnea-scale': {
    slug:'modified-medical-research-council-dyspnea-scale',kind:'full-instrument',completeness:'exact-public-domain-form',titleAr:'مقياس mMRC لضيق النفس',titleEn:'modified Medical Research Council Dyspnea Scale',version:'0–4 dyspnea grade',provenance:'CDISC وePROVIDE يسجلان mMRC في المجال العام. الترجمات المنشأة والموزعة من Mapi لها مسار توزيع مستقل؛ النص العربي هنا ترجمة تشغيلية من روافد لا تدّعي مطابقة ترجمة Mapi.',rightsNotice:'الأصل Public Domain؛ استخدم ترجمة محققة محددة عند الحاجة البحثية/السريرية الرسمية.',intendedUseAr:'تصنيف أثر ضيق النفس على النشاط اليومي والحركة من 0 إلى 4.',respondentFields:['الاسم/الرمز','التاريخ','التشخيص','الأكسجين/وسيلة الحركة إن وجدت'],preflightChecks:['اختر الدرجة التي تصف النشاط المحدود بسبب ضيق النفس تحديدًا.','ميّز ضيق النفس عن محدودية الحركة بسبب الألم أو الضعف فقط.'],sections:[{titleAr:'درجة mMRC',items:[{code:'MMRC',labelAr:'اختر الوصف الأقرب',type:'choice',options:[{labelAr:'0 — ضيق النفس فقط مع الجهد الشديد',value:'0',score:0},{labelAr:'1 — ضيق النفس عند الإسراع على سطح مستوٍ أو صعود منحدر خفيف',value:'1',score:1},{labelAr:'2 — أمشي أبطأ من أقراني على سطح مستوٍ بسبب ضيق النفس أو أتوقف عند المشي بسرعتي',value:'2',score:2},{labelAr:'3 — أتوقف لالتقاط النفس بعد نحو 100 متر أو بعد دقائق قليلة على سطح مستوٍ',value:'3',score:3},{labelAr:'4 — ضيق النفس يمنعني من مغادرة المنزل أو يحدث عند ارتداء/خلع الملابس',value:'4',score:4}]}]}],scoringSteps:['سجل درجة واحدة 0–4.','الدرجة الأعلى تعكس محدودية نشاط أكبر بسبب ضيق النفس.'],interpretationGuardrails:['لا تستخدم mMRC وحده لتشخيص COPD أو تحديد شدة مرض رئوي كامل.','يفضل دمجه مع القياسات السريرية المناسبة مثل وظائف الرئة/الأكسجة/اختبارات الأداء حسب الحالة.'],stopRules:['ضيق نفس حاد جديد، ألم صدري، زرقة، إغماء أو انخفاض أكسجة مقلق يحتاج تقييمًا عاجلًا.'],officialDownloads:[{label:'ePROVIDE — official mMRC-DS record and translation access',url:'https://eprovide.mapi-trust.org/instruments/modified-medical-research-council-dyspnea-scale',language:'en',publisher:'Mapi Research Trust'}],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs/modified-medical-research-council-dyspnea-scale','https://eprovide.mapi-trust.org/instruments/modified-medical-research-council-dyspnea-scale'],lastVerifiedOn:'2026-09-05'
  },

  'abnormal-involuntary-movement-scale': {
    slug:'abnormal-involuntary-movement-scale',kind:'scoring-form',completeness:'recording-and-scoring-sheet',titleAr:'مقياس الحركات اللاإرادية غير الطبيعية — AIMS',titleEn:'Abnormal Involuntary Movement Scale',version:'AIMS 12-item clinical rating structure',provenance:'CDISC يسجل AIMS Public Domain. ورقة روافد تسجل العناصر والبنية؛ المراسي التفصيلية للتقدير تُراجع من المصدر التدريبي قبل الاستخدام السريري الرسمي.',rightsNotice:'الأصل Public Domain. يتطلب الفحص ملاحظة منظمة وخبرة في تمييز خلل الحركة المتأخر عن أسباب حركية أخرى.',intendedUseAr:'مراقبة وتقدير الحركات اللاإرادية، خصوصًا عند التعرض لمضادات الذهان/خطر خلل الحركة المتأخر.',respondentFields:['الاسم/الرمز','التاريخ','الفاحص','الأدوية الحالية','الجرعة/التغيير الحديث'],preflightChecks:['راقب الشخص أثناء الجلوس والمحادثة وبحسب تعليمات الفحص الحركي.','وثق أمراض الأسنان/الأطقم لأنها قد تؤثر في حركات الفم.','لا تفترض أن كل حركة غير طبيعية هي خلل حركة متأخر.'],sections:[{titleAr:'مناطق الحركة — سجل 0–4 وفق مراسي AIMS',items:[['AIMS1','عضلات تعبير الوجه'],['AIMS2','الشفتان والمنطقة حول الفم'],['AIMS3','الفك'],['AIMS4','اللسان'],['AIMS5','الطرفان العلويان'],['AIMS6','الطرفان السفليان'],['AIMS7','الجذع/الرقبة/الكتفان/الوركان']].map(([code,labelAr])=>({code,labelAr,type:'task-score' as const,options:zeroToFour}))},{titleAr:'التقدير العالمي ووعي المريض',items:[{code:'AIMS8',labelAr:'الشدة الإجمالية للحركات غير الطبيعية',type:'task-score',options:zeroToFour},{code:'AIMS9',labelAr:'العجز الناتج عن الحركات',type:'task-score',options:zeroToFour},{code:'AIMS10',labelAr:'وعي المريض بالحركات/الضيق منها',type:'task-score',options:zeroToFour}]},{titleAr:'الأسنان',items:[{code:'AIMS11',labelAr:'مشكلات حالية في الأسنان/الفم',type:'choice',options:yesNo},{code:'AIMS12',labelAr:'هل يرتدي المريض طقم أسنان عادة؟',type:'choice',options:yesNo}]}],scoringSteps:['لا تعتمد على مجموع آلي واحد فقط؛ راجع عناصر مناطق الحركة والشدة والوعي كل على حدة.','قارن مع baseline قبل العلاج ومع قياسات متسلسلة عند المتابعة.'],interpretationGuardrails:['AIMS أداة مراقبة/شدة وليست تشخيصًا سببيًا مستقلًا.','قيّم الباركنسونية، الأكاثيزيا، الرعاش، اضطرابات عصبية أخرى وحركات الأسنان/الفم كأسباب بديلة.'],stopRules:['أعراض عصبية حادة أو تشنج/حمى/تغير وعي تحتاج تقييمًا عاجلًا ولا تُدار كدرجة AIMS روتينية.'],officialDownloads:[{label:'CDISC — AIMS Public Domain record',url:'https://www.cdisc.org/standards/foundational/qrs/abnormal-involuntary-movement-scale',language:'en',publisher:'CDISC'}],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs/abnormal-involuntary-movement-scale'],lastVerifiedOn:'2026-09-05'
  },

  'pain-intensity-cdisc': {
    slug:'pain-intensity-cdisc',kind:'full-instrument',completeness:'exact-public-domain-form',titleAr:'شدة الألم — مقياس رقمي 0–10',titleEn:'Pain Intensity — Numeric Rating',version:'0–10 numerical rating',provenance:'CDISC يسجل Pain Intensity Public Domain. ورقة روافد تستخدم مقياسًا رقميًا واضح المراسي وتلزم بتحديد الفترة المرجعية.',rightsNotice:'Public Domain. يجب توثيق السؤال والفترة المرجعية لأن “الألم الآن” يختلف عن “متوسط الألم” أو “أسوأ ألم”.',intendedUseAr:'تقدير شدة الألم ذاتيًا على مقياس 0–10.',respondentFields:['الاسم/الرمز','التاريخ/الوقت','موضع الألم','الفترة المرجعية'],preflightChecks:['حدد هل تسأل عن الألم الآن أو المتوسط أو الأسوأ خلال فترة محددة.','استخدم نفس الصيغة عند المقارنة.'],sections:[{titleAr:'شدة الألم',items:[{code:'PI',labelAr:'اختر رقمًا من 0 إلى 10؛ 0 = لا ألم، 10 = أسوأ ألم يمكن تصوره',type:'choice',options:Array.from({length:11},(_,score)=>({labelAr:String(score),value:String(score),score}))}]}],scoringSteps:['سجّل الرقم كما اختاره الشخص 0–10.','لا تحوّل الفرق إلى “تحسن مهم” دون MCID مناسب للسكان والحالة.'],interpretationGuardrails:['الألم تجربة متعددة الأبعاد؛ الشدة وحدها لا تقيس التداخل أو الوظيفة أو السبب.'],stopRules:['ألم صدري، ألم مفاجئ شديد غير معتاد، إصابة حادة خطرة أو أعراض عصبية/وعائية مقلقة تحتاج تقييمًا عاجلًا.'],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs/pain-intensity'],lastVerifiedOn:'2026-09-05'
  },

  'pain-relief-cdisc': {
    slug:'pain-relief-cdisc',kind:'full-instrument',completeness:'exact-public-domain-form',titleAr:'تخفيف الألم — Pain Relief',titleEn:'Pain Relief',version:'ordinal pain-relief rating',provenance:'CDISC يسجل Pain Relief Public Domain. يجب تثبيت إطار الزمن والتدخل الذي يقيم الشخص أثره.',rightsNotice:'Public Domain. لا تخلط تخفيف الألم مع شدة الألم الحالية.',intendedUseAr:'تقدير مقدار تحسن/تخفيف الألم بعد تدخل أو خلال فترة محددة.',respondentFields:['الاسم/الرمز','التاريخ/الوقت','التدخل/الدواء','الفترة منذ التدخل'],preflightChecks:['حدد التدخل والفترة المرجعية قبل السؤال.'],sections:[{titleAr:'مقدار تخفيف الألم',items:[{code:'PR',labelAr:'ما مقدار تخفيف الألم الذي حصلت عليه؟',type:'choice',options:[{labelAr:'0 — لا تخفيف',value:'0',score:0},{labelAr:'1 — تخفيف بسيط',value:'1',score:1},{labelAr:'2 — تخفيف متوسط',value:'2',score:2},{labelAr:'3 — تخفيف كبير',value:'3',score:3},{labelAr:'4 — تخفيف كامل',value:'4',score:4}]}]}],scoringSteps:['سجّل الدرجة 0–4 مع وقت التقييم بالنسبة للتدخل.','فسرها مع شدة الألم والوظيفة والآثار الجانبية.'],interpretationGuardrails:['درجة تخفيف مرتفعة لا تعني أن التدخل آمن أو مناسب طويلًا.'],stopRules:['الآثار الجانبية الخطرة أو التدهور السريري تحتاج تقييمًا مستقلًا.'],sourceUrls:['https://www.cdisc.org/qrs/all'],lastVerifiedOn:'2026-09-05'
  },

  'patient-global-impression': {
    slug:'patient-global-impression',kind:'full-instrument',completeness:'exact-public-domain-form',titleAr:'الانطباع العالمي للمريض — PGI',titleEn:'Patient Global Impression',version:'context-defined global impression item',provenance:'CDISC يسجل PGI Public Domain ويعرض مثالًا لسلم تحسن من خمس نقاط؛ يجب تحديد البنية/المرض والفترة قبل التطبيق.',rightsNotice:'Public Domain؛ PGI ليس سؤالًا واحدًا عالميًا مستقلًا عن السياق، لذلك يجب كتابة ما الذي يُقيّم بوضوح.',intendedUseAr:'التقاط تقييم المريض العالمي للتغير/التحسن في مشكلة محددة.',respondentFields:['الاسم/الرمز','التاريخ','المشكلة/الحالة المقيمة','الفترة المرجعية'],preflightChecks:['اكتب الحالة أو العرض الذي يقيم المريض تغيره.','حدد نقطة المقارنة: قبل العلاج/الزيارة السابقة/خط الأساس.'],sections:[{titleAr:'الانطباع العالمي عن التحسن',items:[{code:'PGI-IMPROVEMENT',labelAr:'مقارنة بخط الأساس، كيف تصف حالتك الآن؟',type:'choice',options:[{labelAr:'0 — أسوأ',value:'0',score:0},{labelAr:'1 — دون تغير',value:'1',score:1},{labelAr:'2 — أفضل قليلًا',value:'2',score:2},{labelAr:'3 — أفضل',value:'3',score:3},{labelAr:'4 — أفضل بكثير',value:'4',score:4}]}]}],scoringSteps:['سجل الاستجابة مع الحالة المحددة ونقطة المقارنة.','لا تقارن PGI بين دراسات تستخدم أسئلة/مراسي مختلفة دون توحيد.'],interpretationGuardrails:['PGI تقييم عالمي ذاتي وقد يتأثر بالتوقعات والذاكرة؛ استخدمه مع مقاييس محددة للبنية المقاسة.'],stopRules:[],sourceUrls:['https://www.cdisc.org/standards/foundational/qrs/patient-global-impression','https://www.cdisc.org/kb/examples/patient-global-impression-82586381'],lastVerifiedOn:'2026-09-05'
  },
};
