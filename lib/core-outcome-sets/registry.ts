export type CoreOutcomeRecord = {
  slug: string;
  titleAr: string;
  titleEn: string;
  healthArea: string;
  condition: string;
  stage: 'completed' | 'ongoing';
  stageLabel: string;
  cometClassification: string[];
  scope: {
    population: string;
    age: string;
    intervention: string;
    useContext: string;
    geography: string;
  };
  summary: string;
  coreOutcomes: string[];
  measurementStatus: 'explicit' | 'linked' | 'not-established';
  measurementStatusLabel: string;
  measurementRecommendations: string[];
  stakeholders: string[];
  arabicReview: {
    cosContext: 'not-assessed' | 'requires-local-review';
    instrumentAdaptation: 'not-assessed';
    note: string;
  };
  rawafidSectors: string[];
  source: {
    cometUrl: string;
    doi?: string;
    secondaryUrl?: string;
    publicationYear: number;
    lastVerified: string;
  };
  qualityNote: string;
};

export const coreOutcomeRegistry: readonly CoreOutcomeRecord[] = [
  {
    slug: 'addiction-ichom-standard-set',
    titleAr: 'المجموعة الدولية للنتائج المتمحورة حول المريض في اضطرابات الإدمان',
    titleEn: 'An International, Multidisciplinary Consensus Set of Patient-Centered Outcome Measures for Substance-Related and Addictive Disorders',
    healthArea: 'الإدمان والصحة النفسية',
    condition: 'اضطرابات الكحول والمواد والتبغ والمقامرة والألعاب',
    stage: 'completed',
    stageLabel: 'مكتمل',
    cometClassification: ['COS للممارسة', 'COS للبحوث/التجارب السريرية'],
    scope: {
      population: 'الأشخاص الذين يطلبون علاجًا لاضطرابات مرتبطة بالإدمان',
      age: '12 سنة فأكثر وفق سجل COMET',
      intervention: 'الرعاية/العلاج في اضطرابات الإدمان؛ لا يقيّد السجل نوع تدخل واحد',
      useContext: 'الممارسة، تحسين الخدمات، المقارنة والبحث السريري',
      geography: 'مجموعة دولية؛ فريق من 11 دولة و5 قارات',
    },
    summary: 'مجموعة دولية حدّدت حدًا أدنى من مجالات النتائج المتمحورة حول المريض لتوحيد متابعة العلاج وتحسين المقارنة بين الخدمات والدراسات.',
    coreOutcomes: [
      'تكرار وكمية السلوك/الاضطراب الإدماني',
      'عبء الأعراض',
      'جودة الحياة المرتبطة بالصحة',
      'الأداء العام',
      'الأداء النفسي والاجتماعي',
      'الصحة الجسدية والنفسية والرفاه العام',
    ],
    measurementStatus: 'explicit',
    measurementStatusLabel: 'توجد توصيات قياس ضمن ICHOM Standard Set',
    measurementRecommendations: [
      'يوجد Standard Set مرجعي وتوقيتات قياس ومتغيرات case-mix مرتبطة بالمجموعة.',
      'لا تعتبر روافد أي أداة عربية صالحة تلقائيًا؛ يلزم فحص الإصدار والحقوق والدليل العربي لكل أداة على حدة.',
    ],
    stakeholders: ['خبراء سريريون', 'أشخاص ذوو خبرة معيشة', 'باحثون', 'مقدمو خدمات', 'صناع سياسات', 'منهجيون'],
    arabicReview: {
      cosContext: 'requires-local-review',
      instrumentAdaptation: 'not-assessed',
      note: 'المجموعة دولية، لكن ملاءمتها التشغيلية للبيئات العربية وتوفر نسخ عربية متحققة من أدواتها لم تُقيّم بعد في روافد.',
    },
    rawafidSectors: ['الإدمان والتعافي', 'Assessment Lab', 'مكتبة أدوات القياس'],
    source: {
      cometUrl: 'https://www.comet-initiative.org/studies/details/1185',
      doi: 'https://doi.org/10.3390/jcm13072154',
      secondaryUrl: 'https://www.ichom.org/',
      publicationYear: 2024,
      lastVerified: '2026-09-05',
    },
    qualityNote: 'مدرج في قاعدة COMET ومكتمل. لم تُنجز روافد بعد مراجعة مستقلة بندًا بندًا وفق COS-STAD لهذا السجل.',
  },
  {
    slug: 'opioid-use-disorder-cos',
    titleAr: 'مجموعة النتائج الأساسية لاضطراب استخدام المواد الأفيونية',
    titleEn: 'The opioid use disorder core outcomes set (OUD-COS) for treatment research',
    healthArea: 'الإدمان والصحة النفسية',
    condition: 'اضطراب استخدام المواد الأفيونية',
    stage: 'completed',
    stageLabel: 'مكتمل',
    cometClassification: ['COS للبحوث/التجارب السريرية', 'COS للممارسة'],
    scope: {
      population: 'البالغون المصابون باضطراب استخدام المواد الأفيونية',
      age: '18 سنة فأكثر وفق سجل COMET',
      intervention: 'تدخلات دوائية وغير دوائية',
      useContext: 'بحوث فعالية وفاعلية علاج اضطراب استخدام الأفيونات',
      geography: 'طُوّر داخل شبكة NIDA Clinical Trials Network في الولايات المتحدة',
    },
    summary: 'OUD-COS الإصدار الأول يحدد خمس نتائج أساسية توافق عليها خبراء وممارسون في شبكة NIDA CTN لتقليل التباين الكبير في نتائج بحوث العلاج.',
    coreOutcomes: [
      'الانطباع العام للمريض عن التحسن',
      'حدوث جرعة زائدة غير مميتة',
      'فحص السمية للمخدرات غير المشروعة/غير الطبية',
      'مدة البقاء في العلاج',
      'التسمم الأفيوني المميت',
    ],
    measurementStatus: 'not-established',
    measurementStatusLabel: 'لا يوجد COMS عربي أو دولي موثق هنا في روافد',
    measurementRecommendations: [
      'السجل يحدد outcomes ومصادر تقرير مختلفة: المريض، الطبيب والسجلات الإدارية.',
      'اختيار أداة/طريقة قياس تفصيلية لكل outcome يحتاج مراجعة منفصلة قبل التطبيق العربي.',
    ],
    stakeholders: ['ممارسون سريريون', 'باحثون سريريون', 'إداريون', 'منهجيون', 'إحصائيون'],
    arabicReview: {
      cosContext: 'requires-local-review',
      instrumentAdaptation: 'not-assessed',
      note: 'التطوير أمريكي؛ يلزم تقييم اختلاف منظومة العلاج والسجلات والوفيات والسمية في السياقات العربية قبل التبني المباشر.',
    },
    rawafidSectors: ['الإدمان والتعافي', 'أطلس الإدمان', 'المقارنات', 'Assessment Lab'],
    source: {
      cometUrl: 'https://www.comet-initiative.org/Studies/Details/1579',
      doi: 'https://doi.org/10.1111/add.15875',
      publicationYear: 2022,
      lastVerified: '2026-09-05',
    },
    qualityNote: 'مدرج في COMET ومكتمل. لا تعني هذه الإضافة أن NIDA أو COMET اعتمدا استخدام روافد للمجموعة.',
  },
  {
    slug: 'autism-ichom-standard-set',
    titleAr: 'مجموعة ICHOM المعيارية لنتائج اضطراب طيف التوحد',
    titleEn: 'Development of a standardized set of outcomes for autism spectrum disorder',
    healthArea: 'النمو العصبي والتربية الدامجة',
    condition: 'اضطراب طيف التوحد',
    stage: 'completed',
    stageLabel: 'مكتمل',
    cometClassification: ['COS للممارسة'],
    scope: {
      population: 'الأفراد ذوو اضطراب طيف التوحد عبر مراحل عمرية واسعة',
      age: '1 سنة فأكثر وفق سجل COMET',
      intervention: 'أي تدخل/خدمة ضمن نطاق التطبيق',
      useContext: 'الممارسة، قياس الرعاية، تحسين الجودة والمقارنة',
      geography: 'تطوير دولي مع مراعاة اختلاف نظم الصحة والرعاية الاجتماعية والتعليم',
    },
    summary: 'مجموعة معيارية دولية تركز على النتائج المتمحورة حول الشخص، وصُممت لتقليل عدم الاتساق في تقييم الرعاية والخدمات للأشخاص ذوي التوحد.',
    coreOutcomes: [
      'الأعراض/السمات الأساسية',
      'الأداء اليومي',
      'إمكانية الوصول',
      'الدعم',
    ],
    measurementStatus: 'linked',
    measurementStatusLabel: 'يوجد ICHOM Set مرتبط؛ تفاصيل الأدوات تحتاج مراجعة مستقلة',
    measurementRecommendations: [
      'COMET يربط إلى ICHOM set الخاص بالتوحد.',
      'أي أداة ضمن المجموعة يجب تقييم خصائصها السيكومترية ونسختها العربية وحقوق استخدامها بصورة منفصلة.',
    ],
    stakeholders: ['خبراء سريريون', 'منهجيون', 'باحثون', 'ممثلون ذوو خبرة معيشة/دعم'],
    arabicReview: {
      cosContext: 'requires-local-review',
      instrumentAdaptation: 'not-assessed',
      note: 'رغم الطابع الدولي، لم تُنجز بعد مطابقة منهجية مع خدمات ودعم وتعليم الأشخاص ذوي التوحد في المنطقة العربية.',
    },
    rawafidSectors: ['التوحد', 'التربية الدامجة', 'ذوو الاحتياجات الخاصة', 'Assessment Lab'],
    source: {
      cometUrl: 'https://comet-initiative.org/Studies/Details/1951',
      doi: 'https://doi.org/10.1016/j.rasd.2024.102451',
      secondaryUrl: 'https://www.ichom.org/',
      publicationYear: 2024,
      lastVerified: '2026-09-05',
    },
    qualityNote: 'مدرج في COMET كمجموعة للممارسة. روافد لم تُصدر بعد حكمًا مستقلاً على جودة كل أداة قياس ضمن الـSet.',
  },
  {
    slug: 'youth-anxiety-depression-ocd-ptsd-ichom',
    titleAr: 'المجموعة الدولية لنتائج القلق والاكتئاب والوسواس وPTSD لدى الأطفال والشباب',
    titleEn: 'International consensus on a standard set of outcome measures for child and youth anxiety, depression, OCD, and PTSD',
    healthArea: 'الصحة النفسية للأطفال واليافعين',
    condition: 'القلق، الاكتئاب، الوسواس القهري واضطراب ما بعد الصدمة',
    stage: 'completed',
    stageLabel: 'مكتمل',
    cometClassification: ['COS للممارسة'],
    scope: {
      population: 'الأطفال والشباب المصابون باضطرابات القلق أو الاكتئاب أو الوسواس القهري أو PTSD',
      age: '6–24 سنة وفق سجل COMET',
      intervention: 'أي تدخل',
      useContext: 'الممارسة الروتينية وقياس النتائج في خدمات الصحة النفسية',
      geography: 'تطوير دولي؛ التحقق الخارجي شمل مشاركين من 45 دولة',
    },
    summary: 'مجموعة ICHOM للشباب توصي بحد أدنى من النتائج يتتبع الأعراض والأفكار/السلوك الانتحاري والأداء، مع أدوات محددة للاستخدام الروتيني.',
    coreOutcomes: [
      'الأعراض المرتبطة بالاضطراب',
      'الأفكار والسلوك الانتحاري',
      'الأداء/الوظيفة',
      'جودة الحياة/الأثر الوظيفي بحسب الأدوات الموصى بها',
    ],
    measurementStatus: 'explicit',
    measurementStatusLabel: 'توجد أدوات قياس موصى بها صراحة',
    measurementRecommendations: [
      'Revised Children\'s Anxiety and Depression Scale (RCADS)',
      'Obsessive Compulsive Inventory for Children (OCI-CV)',
      'Children\'s Revised Impact of Events Scale (CRIES)',
      'Columbia Suicide Severity Rating Scale (C-SSRS)',
      'KIDSCREEN-10',
      'Children\'s Global Assessment Scale (CGAS)',
      'Child Anxiety Life Interference Scale (CALIS)',
    ],
    stakeholders: ['خبراء سريريون', 'أطفال/شباب ومقدمو رعاية', 'باحثون'],
    arabicReview: {
      cosContext: 'requires-local-review',
      instrumentAdaptation: 'not-assessed',
      note: 'وجود أداة في Standard Set لا يثبت توفر نسخة عربية مرخصة ومتكافئة. يجب فحص كل أداة وإصدارها العربي منفردًا.',
    },
    rawafidSectors: ['الصحة النفسية', 'الصحة النفسية للأطفال', 'Assessment Lab', 'مكتبة أدوات القياس'],
    source: {
      cometUrl: 'https://www.comet-initiative.org/studies/details/978',
      doi: 'https://doi.org/10.1016/S2215-0366(20)30356-4',
      publicationYear: 2021,
      lastVerified: '2026-09-05',
    },
    qualityNote: 'مدرج في COMET ومكتمل. حالة الحقوق والترجمة والتحقق العربي للأدوات السبع لم تُدمج في شارة واحدة وتحتاج سجلات أداة منفصلة.',
  },
  {
    slug: 'childhood-cancer-quality-of-survival',
    titleAr: 'المجموعة الدولية لنتائج جودة البقاء بعد سرطان الطفولة',
    titleEn: 'A joint international consensus statement for measuring quality of survival for patients with childhood cancer',
    healthArea: 'سرطان الأطفال والنجاة طويلة الأمد',
    condition: '17 نوعًا من سرطانات الطفولة',
    stage: 'completed',
    stageLabel: 'مكتمل',
    cometClassification: ['COS للممارسة'],
    scope: {
      population: 'مرضى وناجو سرطانات الطفولة عبر سرطانات دموية وأورام الجهاز العصبي المركزي وأورام صلبة',
      age: 'سياق سرطانات الطفولة؛ راجع تعريف كل نوع فرعي في المصدر عند التطبيق',
      intervention: 'أي تدخل ضمن متابعة نتائج الرعاية والنجاة',
      useContext: 'قياس جودة الرعاية والنجاة، التحسين المؤسسي والمقارنة',
      geography: 'تطوير دولي بمشاركة 68 مؤسسة',
    },
    summary: 'طوّر International Childhood Cancer Outcome Project مجموعات نتائج أساسية بحسب نوع سرطان الطفولة، مع نتائج جسدية مشتركة/نوعية وثلاثة أبعاد لجودة الحياة.',
    coreOutcomes: [
      '4–8 نتائج جسدية بحسب نوع السرطان؛ من أمثلتها فشل القلب، ضعف الخصوبة والأورام اللاحقة',
      'جودة الحياة الجسدية',
      'جودة الحياة النفسية والاجتماعية',
      'جودة الحياة/الأداء العصبي المعرفي',
    ],
    measurementStatus: 'explicit',
    measurementStatusLabel: 'حُددت طرائق قياس عامة؛ التفاصيل تختلف حسب outcome ونوع السرطان',
    measurementRecommendations: [
      'استخراج من السجل الطبي',
      'استبيانات',
      'الربط مع السجلات القائمة',
    ],
    stakeholders: ['ناجون من سرطان الطفولة', 'أطباء أورام أطفال', 'مقدمو رعاية صحية', 'مختصون نفسيون/عصبيون معرفيون'],
    arabicReview: {
      cosContext: 'requires-local-review',
      instrumentAdaptation: 'not-assessed',
      note: 'يجب فحص قابلية جمع النتائج طويلة الأمد وتوفر السجلات وأدوات جودة الحياة العربية في كل نظام صحي عربي مستهدف.',
    },
    rawafidSectors: ['سرطان الأطفال', 'التأهيل', 'الصحة النفسية', 'Assessment Lab'],
    source: {
      cometUrl: 'https://www.comet-initiative.org/Studies/Details/2865',
      doi: 'https://doi.org/10.1038/s41591-023-02339-y',
      publicationYear: 2023,
      lastVerified: '2026-09-05',
    },
    qualityNote: 'مدرج في COMET ومكتمل. لا يجوز اختزال المشروع إلى قائمة واحدة لجميع سرطانات الأطفال لأن النتائج الجسدية تختلف حسب النوع.',
  },
  {
    slug: 'cerebral-palsy-lower-limb-surgery',
    titleAr: 'مجموعة النتائج الأساسية لجراحة الأطراف السفلية لدى الأطفال ذوي الشلل الدماغي',
    titleEn: 'A core outcome set for lower limb orthopaedic surgery for children with cerebral palsy',
    healthArea: 'الشلل الدماغي وجراحة الأطفال والتأهيل',
    condition: 'الشلل الدماغي لدى الأطفال القادرين على المشي والخاضعين لجراحة عظمية للطرف السفلي',
    stage: 'completed',
    stageLabel: 'مكتمل',
    cometClassification: ['COS للبحوث/التجارب السريرية'],
    scope: {
      population: 'أطفال ويافعون قادرون على المشي ومصابون بالشلل الدماغي',
      age: '0–18 سنة في سجل COS الأصلي',
      intervention: 'جراحة عظمية للأطراف السفلية',
      useContext: 'الدراسات السريرية وتوحيد تقييم نتائج الجراحة',
      geography: 'تطوير دولي متعدد أصحاب المصلحة',
    },
    summary: 'توصلت الدراسة إلى 19 نتيجة ضمن ثمانية مجالات، ثم نُشرت في 2025 دراسة مرتبطة لاختيار مجموعة من أدوات القياس لكل المجالات.',
    coreOutcomes: [
      'الألم والإرهاق',
      'بنية الأطراف السفلية',
      'الوظيفة الحركية',
      'الحركة في أنشطة الحياة اليومية',
      'نتائج مرتبطة بالمشي',
      'النشاط البدني',
      'الاستقلالية',
      'جودة الحياة',
    ],
    measurementStatus: 'explicit',
    measurementStatusLabel: 'يوجد set لاحق موصى به لأدوات القياس',
    measurementRecommendations: [
      'Three-dimensional gait analysis',
      'Edinburgh Visual Gait Scale',
      'Gross Motor Function Measure (GMFM)',
      'Gait Outcome Assessment List',
      'Gillette Functional Assessment Questionnaire',
      'PROMIS Pain Interference and Fatigue',
      'Cerebral Palsy Quality of Life for Children questionnaire',
    ],
    stakeholders: ['أطفال/يافعون ذوو شلل دماغي', 'أولياء أمور/مقدمو رعاية', 'مهنيون صحيون'],
    arabicReview: {
      cosContext: 'requires-local-review',
      instrumentAdaptation: 'not-assessed',
      note: 'هذه حالة نموذجية للفصل بين COS وCOMS: النتائج الأساسية منشورة، وأدوات القياس المختارة لاحقًا تحتاج تقييمًا عربيًا أداةً بأداة.',
    },
    rawafidSectors: ['الشلل الدماغي', 'ذوو الاحتياجات الخاصة', 'التأهيل', 'مكتبة أدوات القياس'],
    source: {
      cometUrl: 'https://www.comet-initiative.org/Studies/Details/1236',
      doi: 'https://doi.org/10.1111/dmcn.15351',
      secondaryUrl: 'https://www.comet-initiative.org/Studies/Details/3749',
      publicationYear: 2022,
      lastVerified: '2026-09-05',
    },
    qualityNote: 'COMET يسجل COS الأصلي ومجموعة القياس اللاحقة كدراسات مرتبطة. توصيات 2025 لا تعني تلقائيًا وجود نسخ عربية متحققة من الأدوات السبعة.',
  },
  {
    slug: 'musculoskeletal-rehabilitation-core-measures',
    titleAr: 'المجموعة الأساسية لقياسات نتائج التأهيل في الحالات العضلية الهيكلية',
    titleEn: 'Consensus-based core set of outcome measures for rehabilitation in musculoskeletal diseases',
    healthArea: 'التأهيل والطب الفيزيائي',
    condition: 'الحالات العضلية الهيكلية',
    stage: 'completed',
    stageLabel: 'مكتمل',
    cometClassification: ['COS للبحوث/التجارب السريرية', 'COS للممارسة'],
    scope: {
      population: 'أشخاص يتلقون تأهيلًا بسبب أمراض/حالات عضلية هيكلية',
      age: 'غير محدد في سجل COMET',
      intervention: 'التأهيل',
      useContext: 'الممارسة والبحث في التأهيل',
      geography: 'طُورت واختُبرت عمليًا في النرويج',
    },
    summary: 'مجموعة تجمع outcomes وأدوات قياس عملية للتأهيل العضلي الهيكلي، مع اختبار للجدوى والاستجابة؛ وينص المصدر على الحاجة إلى اختبارات إضافية خارج النرويج.',
    coreOutcomes: [
      'الألم',
      'الإرهاق',
      'اللياقة البدنية',
      'الصحة النفسية',
      'الأنشطة اليومية',
      'تحقيق الأهداف',
      'جودة الحياة',
      'المشاركة الاجتماعية',
      'التكيف/المواجهة',
    ],
    measurementStatus: 'explicit',
    measurementStatusLabel: 'توجد أدوات قياس محددة في المجموعة الأصلية',
    measurementRecommendations: [
      'Numeric Rating Scale للألم',
      'Numeric Rating Scale للإرهاق',
      '30-second Sit to Stand للّياقة البدنية',
      'Hopkins Symptom Checklist-5 للصحة النفسية',
      'Hannover Functional Questionnaire للأنشطة اليومية',
      'Patient-Specific Functional Scale مع motivation score لتحقيق الأهداف',
      'EQ-5D-5L لجودة الحياة',
      'COOP/WONCA social participation item للمشاركة الاجتماعية',
      'Effective Musculoskeletal Consumer Scale-17 للتكيف/المواجهة',
    ],
    stakeholders: ['خبراء سريريون', 'مرضى/مستهلكون', 'باحثون'],
    arabicReview: {
      cosContext: 'requires-local-review',
      instrumentAdaptation: 'not-assessed',
      note: 'المصدر نفسه يحذر من الحاجة لاختبار المجموعة في بلدان أخرى؛ وهذا يجعل التحقق السياقي العربي أولوية قبل التبني المؤسسي.',
    },
    rawafidSectors: ['التأهيل', 'الطب الفيزيائي', 'Assessment Lab', 'مكتبة أدوات القياس'],
    source: {
      cometUrl: 'https://www.comet-initiative.org/studies/details/1209',
      doi: 'https://doi.org/10.1080/03009742.2017.1347959',
      publicationYear: 2018,
      lastVerified: '2026-09-05',
    },
    qualityNote: 'مدرج في COMET. المجموعة تجمع WHAT وHOW في مشروع واحد، لذلك تعرض روافد النتائج والأدوات كطبقتين منفصلتين داخل السجل نفسه.',
  },
  {
    slug: 'critical-illness-physical-rehabilitation-practice',
    titleAr: 'PRACTICE: مجموعة النتائج الأساسية للتأهيل البدني بعد المرض الحرج',
    titleEn: 'PRACTICE: Development of a Core Outcome Set for Trials of Physical Rehabilitation in Critical Illness',
    healthArea: 'العناية الحرجة والتأهيل',
    condition: 'المرض الحرج والنجاة بعد العناية المركزة',
    stage: 'completed',
    stageLabel: 'مكتمل',
    cometClassification: ['COS للبحوث/التجارب السريرية'],
    scope: {
      population: 'الناجون من المرض الحرج عبر مسار التعافي',
      age: '16–100 سنة وفق سجل COMET',
      intervention: 'التأهيل البدني/التمارين عبر ICU وما بعد الخروج',
      useContext: 'التجارب المستقبلية للتأهيل البدني بعد المرض الحرج',
      geography: 'توافق دولي؛ 329 مشاركًا من 26 دولة في الدراسة النهائية',
    },
    summary: 'توصل PRACTICE إلى ثماني نتائج ذات أهمية حرجة اتفقت عليها مجموعات الباحثين والممارسين والمرضى/مقدمي الرعاية.',
    coreOutcomes: [
      'الوظيفة البدنية',
      'أنشطة الحياة اليومية',
      'البقاء/النجاة',
      'جودة الحياة المرتبطة بالصحة',
      'القدرة على التمرين',
      'الوظيفة المعرفية',
      'الرفاه العاطفي والنفسي',
      'الهشاشة',
    ],
    measurementStatus: 'not-established',
    measurementStatusLabel: 'اختيار أدوات القياس ما زال مطلوبًا لتنفيذ COS بالكامل',
    measurementRecommendations: [
      'المنشور النهائي يذكر صراحة أن تحديد أدوات القياس الموصى بها لهذه النتائج مطلوب كخطوة لاحقة.',
    ],
    stakeholders: ['باحثون', 'ممارسون سريريون', 'مرضى ومقدمو رعاية', 'ممولو أبحاث', 'مطورو إرشادات', 'مفوضو خدمات'],
    arabicReview: {
      cosContext: 'requires-local-review',
      instrumentAdaptation: 'not-assessed',
      note: 'يمكن استخدام COS كنقطة مرجعية للنتائج، لكن اختيار instruments وإثبات النسخ العربية والتوقيتات يحتاج عملًا منفصلًا.',
    },
    rawafidSectors: ['التأهيل', 'العناية الحرجة', 'الصحة النفسية', 'Assessment Lab'],
    source: {
      cometUrl: 'https://www.comet-initiative.org/studies/details/288',
      doi: 'https://doi.org/10.1513/AnnalsATS.202406-581OC',
      secondaryUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11622824/',
      publicationYear: 2024,
      lastVerified: '2026-09-05',
    },
    qualityNote: 'مدرج في COMET ومكتمل كـCOS. لا نعرض أي COMS لأن الدراسة النهائية نفسها تنص على أن تعيين أدوات القياس ما زال مطلوبًا.',
  },
] as const;

export const coreOutcomeRegistrySlugs = coreOutcomeRegistry.map((item) => item.slug);

export function getCoreOutcomeRecord(slug: string) {
  return coreOutcomeRegistry.find((item) => item.slug === slug);
}
