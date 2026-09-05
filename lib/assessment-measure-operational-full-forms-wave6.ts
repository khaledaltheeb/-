import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';
import { assessmentOperationalFullFormsWave1 } from '@/lib/assessment-measure-operational-full-forms-wave1';

const yesNoUnknown: OperationalOption[] = [
  { labelAr: 'نعم', value: 'yes' },
  { labelAr: 'لا', value: 'no' },
  { labelAr: 'غير معروف / غير موثق', value: 'unknown' },
];

const rmdq24Canonical = assessmentOperationalFullFormsWave1['roland-morris-disability-questionnaire'];

const westHavenGrades: OperationalOption[] = [
  { labelAr: '0 — لا توجد اضطرابات سريرية ظاهرة في الحالة العقلية وفق West Haven', value: '0', score: 0 },
  { labelAr: 'I — تغيرات طفيفة: نقص بسيط في الوعي/الانتباه، قلق أو نشوة، اضطراب بسيط في الحساب أو إيقاع النوم', value: '1', score: 1 },
  { labelAr: 'II — خمول/لامبالاة، اضطراب التوجه للزمن، تغير واضح بالشخصية أو سلوك غير ملائم؛ قد يظهر asterixis', value: '2', score: 2 },
  { labelAr: 'III — نعاس إلى شبه سبات مع بقاء الاستجابة للمثيرات، ارتباك وتوهان واضح وسلوك غريب', value: '3', score: 3 },
  { labelAr: 'IV — غيبوبة وعدم القدرة على تقييم الحالة العقلية بالطريقة المعتادة', value: '4', score: 4 },
];

const tannerPubicHair: OperationalOption[] = [
  { labelAr: '1 — لا يوجد شعر عانة نهائي؛ مظهر ما قبل البلوغ', value: '1', score: 1 },
  { labelAr: '2 — شعر متناثر/ناعم يبدأ بالظهور، مع تصبغ محدود', value: '2', score: 2 },
  { labelAr: '3 — شعر أغمق وأخشن وأكثر تجعدًا، لكنه لا يغطي توزيع البالغ', value: '3', score: 3 },
  { labelAr: '4 — شعر من نمط البالغ لكنه يغطي مساحة أصغر ولا يمتد بعد إلى الفخذين', value: '4', score: 4 },
  { labelAr: '5 — توزيع بالغ يمتد جانبيًا نحو السطح الإنسي للفخذين', value: '5', score: 5 },
];

const tannerBreast: OperationalOption[] = [
  { labelAr: '1 — لا نسيج غدي ثديي محسوس؛ مرحلة ما قبل البلوغ', value: '1', score: 1 },
  { labelAr: '2 — بدء برعم الثدي مع اتساع الهالة', value: '2', score: 2 },
  { labelAr: '3 — زيادة نمو الثدي والهالة دون تكوّن بروز ثانوي مستقل للهالة', value: '3', score: 3 },
  { labelAr: '4 — الهالة والحلمة تشكلان بروزًا ثانويًا فوق محيط الثدي', value: '4', score: 4 },
  { labelAr: '5 — محيط ثدي ناضج؛ تعود الهالة إلى محيط الثدي وتبقى الحلمة بارزة', value: '5', score: 5 },
];

const tannerMaleGenital: OperationalOption[] = [
  { labelAr: '1 — أعضاء تناسلية بمظهر ما قبل البلوغ؛ حجم الخصية عادة <4 mL', value: '1', score: 1 },
  { labelAr: '2 — بدء تضخم الخصيتين والصفن مع تغير ملمس/لون جلد الصفن؛ القضيب لم يزد كثيرًا بعد', value: '2', score: 2 },
  { labelAr: '3 — استمرار نمو الخصيتين والصفن مع زيادة واضحة في طول القضيب', value: '3', score: 3 },
  { labelAr: '4 — مزيد من نمو الخصيتين والصفن مع زيادة عرض القضيب ونمو الحشفة وتصبغ الصفن', value: '4', score: 4 },
  { labelAr: '5 — أعضاء تناسلية خارجية بمظهر وحجم بالغين', value: '5', score: 5 },
];

const sofaResp: OperationalOption[] = [
  { labelAr: '0 — PaO₂/FiO₂ ≥400', value: '0', score: 0 },
  { labelAr: '1 — PaO₂/FiO₂ <400', value: '1', score: 1 },
  { labelAr: '2 — PaO₂/FiO₂ <300', value: '2', score: 2 },
  { labelAr: '3 — PaO₂/FiO₂ <200 مع دعم تنفسي', value: '3', score: 3 },
  { labelAr: '4 — PaO₂/FiO₂ <100 مع دعم تنفسي', value: '4', score: 4 },
];

const sofaPlatelets: OperationalOption[] = [
  { labelAr: '0 — الصفائح ≥150 ×10³/µL', value: '0', score: 0 },
  { labelAr: '1 — الصفائح <150 ×10³/µL', value: '1', score: 1 },
  { labelAr: '2 — الصفائح <100 ×10³/µL', value: '2', score: 2 },
  { labelAr: '3 — الصفائح <50 ×10³/µL', value: '3', score: 3 },
  { labelAr: '4 — الصفائح <20 ×10³/µL', value: '4', score: 4 },
];

const sofaBilirubin: OperationalOption[] = [
  { labelAr: '0 — bilirubin <1.2 mg/dL', value: '0', score: 0 },
  { labelAr: '1 — 1.2–1.9 mg/dL', value: '1', score: 1 },
  { labelAr: '2 — 2.0–5.9 mg/dL', value: '2', score: 2 },
  { labelAr: '3 — 6.0–11.9 mg/dL', value: '3', score: 3 },
  { labelAr: '4 — ≥12.0 mg/dL', value: '4', score: 4 },
];

const sofaCardio: OperationalOption[] = [
  { labelAr: '0 — MAP ≥70 mmHg دون معيار وعائي أعلى', value: '0', score: 0 },
  { labelAr: '1 — MAP <70 mmHg', value: '1', score: 1 },
  { labelAr: '2 — dopamine ≤5 µg/kg/min أو dobutamine بأي جرعة', value: '2', score: 2 },
  { labelAr: '3 — dopamine >5 إلى ≤15 أو epinephrine ≤0.1 أو norepinephrine ≤0.1 µg/kg/min', value: '3', score: 3 },
  { labelAr: '4 — dopamine >15 أو epinephrine >0.1 أو norepinephrine >0.1 µg/kg/min', value: '4', score: 4 },
];

const sofaGcs: OperationalOption[] = [
  { labelAr: '0 — GCS 15', value: '0', score: 0 },
  { labelAr: '1 — GCS 13–14', value: '1', score: 1 },
  { labelAr: '2 — GCS 10–12', value: '2', score: 2 },
  { labelAr: '3 — GCS 6–9', value: '3', score: 3 },
  { labelAr: '4 — GCS <6', value: '4', score: 4 },
];

const sofaRenal: OperationalOption[] = [
  { labelAr: '0 — creatinine <1.2 mg/dL', value: '0', score: 0 },
  { labelAr: '1 — creatinine 1.2–1.9 mg/dL', value: '1', score: 1 },
  { labelAr: '2 — creatinine 2.0–3.4 mg/dL', value: '2', score: 2 },
  { labelAr: '3 — creatinine 3.5–4.9 mg/dL أو urine output <500 mL/day', value: '3', score: 3 },
  { labelAr: '4 — creatinine ≥5.0 mg/dL أو urine output <200 mL/day', value: '4', score: 4 },
];

export const assessmentOperationalFullFormsWave6: Record<string, AssessmentOperationalMaterial> = {
  'roland-morris-disability-questionnaire-24': {
    ...rmdq24Canonical,
    slug: 'roland-morris-disability-questionnaire-24',
    titleAr: 'استبيان رولاند–موريس للعجز بسبب ألم أسفل الظهر — RMDQ-24',
    titleEn: 'Roland-Morris Disability Questionnaire — 24 items',
    version: 'RMDQ-24 original structure — canonical alias to the existing full operational form',
    provenance: `${rmdq24Canonical.provenance} هذا السجل Alias تشغيلي لنفس نموذج RMDQ-24 المنشور في روافد تحت slug التاريخي roland-morris-disability-questionnaire؛ لا توجد نسختان مختلفتان من البنود.`,
    lastVerifiedOn: '2026-09-06',
  },

  'west-haven-hepatic-encephalopathy-grade': {
    slug: 'west-haven-hepatic-encephalopathy-grade',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'درجة ويست هيفن للاعتلال الدماغي الكبدي — ورقة التصنيف السريري',
    titleEn: 'West Haven Hepatic Encephalopathy Grade',
    version: 'West Haven grades 0–IV with covert/overt context',
    provenance: 'CDISC يصنف West Haven Hepatic Encephalopathy Grade كأداة Public Domain. المراسي السريرية هنا منظمة من التعريفات المتداولة في توافق ISHEN والأدبيات الحديثة، بصياغة عربية من روافد لا تدعي أنها ترجمة عربية معيارية مستقلة.',
    rightsNotice: 'التصنيف في المجال العام وفق CDISC. لا تنسخ رسومًا أو جداول مصممة أو شروحًا محمية من طرف ثالث؛ هذه ورقة تسجيل عربية مستقلة مع نسبة المصادر.',
    intendedUseAr: 'توحيد وصف شدة الاعتلال الدماغي الكبدي سريريًا من عدم وجود علامات ظاهرة إلى الغيبوبة. لا يثبت السبب ولا يستبعد أسباب اضطراب الوعي الأخرى.',
    respondentFields: ['الاسم/الرمز', 'التاريخ/الوقت', 'السياق الكبدي المعروف', 'نوع HE إن كان محددًا: A/B/C', 'المحفزات المحتملة', 'اسم الفاحص'],
    preflightChecks: [
      'قيّم مستوى الوعي والاستقرار الحيوي أولًا؛ لا تؤخر الاستجابة للطوارئ لإكمال التصنيف.',
      'ابحث عن أسباب بديلة/مرافقة لتغير الحالة العقلية مثل نقص السكر، السكتة، الإنتان، الأدوية، النزف، اضطرابات الشوارد أو التسمم.',
      'لا تستخدم مستوى الأمونيا وحده لتشخيص HE أو لتحديد الدرجة.',
      'في الاضطراب الشديد للوعي يمكن إضافة Glasgow Coma Scale لتوصيف مستوى الوعي دون استبدال التقييم السببي.',
    ],
    sections: [
      {
        titleAr: 'الملاحظات السريرية قبل اختيار الدرجة',
        items: [
          { code: 'WH-CONSCIOUSNESS', labelAr: 'مستوى الوعي: يقظ / خامل / نعاس / شبه سبات / غيبوبة', type: 'text' },
          { code: 'WH-ORIENT-TIME', labelAr: 'اضطراب التوجه للزمن', type: 'choice', options: yesNoUnknown },
          { code: 'WH-ORIENT-PLACE', labelAr: 'اضطراب التوجه للمكان', type: 'choice', options: yesNoUnknown },
          { code: 'WH-ATTENTION', labelAr: 'نقص الانتباه أو صعوبة الحساب البسيط', type: 'choice', options: yesNoUnknown },
          { code: 'WH-SLEEP', labelAr: 'اضطراب/انعكاس نمط النوم', type: 'choice', options: yesNoUnknown },
          { code: 'WH-BEHAVIOR', labelAr: 'تغير واضح في الشخصية أو سلوك غير مناسب/غريب', type: 'choice', options: yesNoUnknown },
          { code: 'WH-ASTERIXIS', labelAr: 'Asterixis (رفرفة اليد)', type: 'choice', options: yesNoUnknown },
          { code: 'WH-ALT-CAUSES', labelAr: 'أسباب بديلة أو مرافقة لتغير الحالة العقلية تم تقييمها', type: 'text' },
        ],
      },
      {
        titleAr: 'درجة West Haven',
        instructionsAr: 'اختر أعلى وصف سريري متماسك مع الحالة. التمييز بين I وII يتحسن بإعطاء وزن لاضطراب التوجه للزمن والتغير الواضح في السلوك/الشخصية.',
        items: [
          { code: 'WH-GRADE', labelAr: 'الدرجة النهائية', type: 'choice', options: westHavenGrades },
          { code: 'WH-BASIS', labelAr: 'المظاهر التي حددت الدرجة', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'Grade 0: لا توجد علامات سريرية ظاهرة وفق West Haven؛ لا يعني ذلك استبعاد minimal HE الذي قد يحتاج اختبارات نفسية عصبية/سيكومترية.',
      'Grade I: تغيرات طفيفة في الوعي أو الانتباه أو المزاج/النوم أو الحساب دون التوهان الواضح المميز للمرحلة الأعلى.',
      'Grade II: خمول/لامبالاة أو تغير شخصية واضح مع اضطراب التوجه للزمن؛ asterixis شائع وقد يدعم الوصف لكنه ليس شرطًا وحيدًا.',
      'Grade III: نعاس شديد إلى شبه سبات مع بقاء الاستجابة للمثيرات، وارتباك/توهان واضح.',
      'Grade IV: غيبوبة.',
      'في التصنيف الشائع: minimal HE وGrade I يندرجان ضمن covert HE، بينما Grades II–IV هي overt HE؛ لا تجعل هذه التسمية بديلًا عن الدرجة نفسها.',
    ],
    interpretationGuardrails: [
      'West Haven تصنيف سريري رتبي وليس مقياسًا خطيًا؛ الفرق بين درجتين لا يمثل مقدارًا متساويًا من التغير.',
      'Grade 0 لا يساوي تلقائيًا غياب minimal HE؛ التشخيص الدقيق للحالات الخفية يحتاج أدوات ملائمة.',
      'ارتفاع الأمونيا قد يدعم السياق لكنه لا يحدد الدرجة ولا يثبت HE بمفرده.',
      'الدرجة لا تحدد وحدها سبب التدهور ولا خطة العلاج؛ عالج المحفزات والأسباب البديلة وفق التقييم السريري.',
    ],
    stopRules: [
      'تدهور سريع في الوعي أو عدم حماية مجرى الهواء أو عجز عصبي بؤري أو عدم استقرار حيوي يستوجب تقييمًا عاجلًا قبل استكمال نموذج روتيني.',
      'إذا كان الفاحص غير قادر على التمييز بين Grade I وII، وثق عدم اليقين والمظاهر الموضوعية بدل فرض درجة.',
    ],
    officialDownloads: [
      { label: 'CDISC QRS — West Haven Hepatic Encephalopathy Grade', url: 'https://www.cdisc.org/standards/foundational/qrs/west-haven-hepatic-encephalopathy-grade', language: 'en', publisher: 'CDISC' },
      { label: 'ISHEN consensus — West Haven criteria and operational distinctions', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3971432/', language: 'en', publisher: 'International Society for Hepatic Encephalopathy and Nitrogen Metabolism / PMC' },
    ],
    sourceUrls: [
      'https://www.cdisc.org/standards/foundational/qrs/west-haven-hepatic-encephalopathy-grade',
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC3971432/',
    ],
    lastVerifiedOn: '2026-09-06',
  },

  'tanner-scale-boy': {
    slug: 'tanner-scale-boy',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس تانر للنضج الجنسي — الأولاد — ورقة تصنيف نصية',
    titleEn: 'Tanner Scale Boy',
    version: 'Tanner/sexual maturity rating — genital and pubic-hair stages scored separately',
    provenance: 'CDISC يصنف Tanner Scale Boy كـPublic Domain. الصياغة العربية هنا تلخص المراسي السريرية المعروفة من 1 إلى 5 دون نسخ صور أو مخططات طرف ثالث. يجب تسجيل مرحلة الأعضاء التناسلية ومرحلة شعر العانة كلًا على حدة لأنهما قد لا يتقدمان بالتزامن.',
    rightsNotice: 'التصنيف Public Domain وفق CDISC، لكن الصور والرسومات السريرية المنشورة في مراجع أخرى قد تكون محمية. روافد لا تعيد نشر الصور ولا تتطلب رفع صور للمريض.',
    intendedUseAr: 'توثيق مرحلة النضج الجنسي سريريًا لدى الذكور ضمن تقييم النمو والبلوغ. لا يستخدم لاستنتاج السلوك الجنسي أو سوء المعاملة ولا لتقييم الهوية الجندرية.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر الزمني', 'العمر الحملي/السياق عند الحاجة', 'سبب التقييم', 'اسم الفاحص'],
    preflightChecks: [
      'استخدم التقييم فقط لضرورة سريرية/بحثية مشروعة وبما يتفق مع موافقة ولي الأمر/المريض والقوانين والسياسات المحلية.',
      'اشرح الفحص بلغة مناسبة للعمر واحصل على assent عندما يكون مناسبًا، ووفر chaperone وفق السياسة المحلية.',
      'احمِ الخصوصية والكرامة؛ لا تلتقط أو ترفع أو تحتفظ بصور للأعضاء التناسلية أو شعر العانة من أجل هذه الأداة.',
      'سجّل genital stage وpubic-hair stage منفصلين؛ لا تجبرهما على رقم واحد.',
    ],
    sections: [
      {
        titleAr: 'التطور التناسلي',
        items: [
          { code: 'TANNER-B-GENITAL', labelAr: 'مرحلة الأعضاء التناسلية الخارجية', type: 'choice', options: tannerMaleGenital },
          { code: 'TANNER-B-TESTIS-VOL', labelAr: 'حجم الخصية إن قيس بأداة مناسبة', type: 'number', unit: 'mL', min: 0 },
          { code: 'TANNER-B-GENITAL-NOTE', labelAr: 'ملاحظات سريرية لازمة فقط', type: 'text' },
        ],
      },
      {
        titleAr: 'شعر العانة — يسجل مستقلًا',
        items: [
          { code: 'TANNER-B-PH', labelAr: 'مرحلة شعر العانة', type: 'choice', options: tannerPubicHair },
        ],
      },
    ],
    scoringSteps: [
      'سجّل مرحلة الأعضاء التناسلية 1–5 ومرحلة شعر العانة 1–5 كمتغيرين منفصلين.',
      'Stage 1 يمثل ما قبل البلوغ، وStage 2 عادة بداية التغيرات البلوغية في المجال المقاس، وStage 5 النمط الناضج.',
      'لا تحسب متوسطًا بين المرحلتين ولا تنتج Tanner total score؛ عدم التزامن بين المجالات قد يكون طبيعيًا.',
      'فسر المرحلة مع سرعة النمو والعمر والسياق السريري، وليس كاختبار تشخيصي مستقل.',
    ],
    interpretationGuardrails: [
      'المدى الطبيعي لبدء البلوغ وتقدمه متباين؛ الرقم وحده لا يثبت اضطرابًا.',
      'شعر العانة يتأثر بالأدرينارك وقد لا يعكس تنشيط المحور التناسلي بنفس دقة نمو الخصية/الأعضاء.',
      'لا تستخدم هذه الدرجة لإثبات أو نفي نشاط جنسي أو إساءة أو بلوغ قانوني.',
      'التقييم الذاتي أو عبر الصور أقل ضبطًا من فحص سريري مناسب؛ روافد لا يطلب صورًا.',
    ],
    stopRules: [
      'أوقف الفحص إذا رفض الطفل/الناشئ أو ظهر ضيق، ما لم تكن هناك ضرورة طبية عاجلة تُدار وفق بروتوكول مؤسسي مناسب.',
      'أي اشتباه إساءة أو خطر حماية يُدار بمسار safeguarding مستقل، وليس من خلال Tanner stage.',
    ],
    officialDownloads: [
      { label: 'CDISC QRS — Tanner Scale Boy public-domain listing', url: 'https://www.cdisc.org/standards/foundational/qrs', language: 'en', publisher: 'CDISC' },
      { label: 'Endotext — Normal and Abnormal Puberty', url: 'https://www.ncbi.nlm.nih.gov/books/NBK279024/', language: 'en', publisher: 'NCBI Bookshelf / Endotext' },
    ],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs', 'https://www.ncbi.nlm.nih.gov/books/NBK279024/'],
    lastVerifiedOn: '2026-09-06',
  },

  'tanner-scale-girl': {
    slug: 'tanner-scale-girl',
    kind: 'clinical-classification',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس تانر للنضج الجنسي — البنات — ورقة تصنيف نصية',
    titleEn: 'Tanner Scale Girl',
    version: 'Tanner/sexual maturity rating — breast and pubic-hair stages scored separately',
    provenance: 'CDISC يصنف Tanner Scale Girl كـPublic Domain. الصياغة العربية هنا تلخص مراحل نمو الثدي وشعر العانة 1–5 دون نسخ الصور/الرسومات المنشورة في مراجع أخرى. يجب تسجيل المجالين بصورة منفصلة.',
    rightsNotice: 'التصنيف Public Domain وفق CDISC. الصور والمخططات السريرية في المراجع الأخرى قد تكون محمية؛ لا تُنسخ ولا يُطلب من المستخدم رفع صور شخصية.',
    intendedUseAr: 'توثيق مرحلة النضج الجنسي لدى الإناث ضمن تقييم النمو والبلوغ. لا يستخدم لاستنتاج السلوك الجنسي أو سوء المعاملة ولا لتقييم الهوية الجندرية.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر الزمني', 'سبب التقييم', 'تاريخ بدء التغيرات إن كان معروفًا', 'اسم الفاحص'],
    preflightChecks: [
      'استخدم الفحص فقط لضرورة سريرية/بحثية مشروعة وبموافقة مناسبة وسياسة خصوصية واضحة.',
      'اشرح الإجراء بلغة مناسبة للعمر واحصل على assent عندما يكون مناسبًا ووفر chaperone وفق السياسة المحلية.',
      'لا تلتقط أو ترفع أو تحتفظ بصور للثدي أو شعر العانة من أجل هذا التصنيف.',
      'سجّل breast stage وpubic-hair stage منفصلين؛ لا تفترض أنهما متزامنان.',
    ],
    sections: [
      {
        titleAr: 'نمو الثدي',
        items: [
          { code: 'TANNER-G-BREAST', labelAr: 'مرحلة نمو الثدي', type: 'choice', options: tannerBreast },
          { code: 'TANNER-G-BREAST-NOTE', labelAr: 'ملاحظات سريرية لازمة فقط', type: 'text' },
        ],
      },
      {
        titleAr: 'شعر العانة — يسجل مستقلًا',
        items: [
          { code: 'TANNER-G-PH', labelAr: 'مرحلة شعر العانة', type: 'choice', options: tannerPubicHair },
        ],
      },
    ],
    scoringSteps: [
      'سجّل breast stage من 1–5 وpubic-hair stage من 1–5 كلًا على حدة.',
      'Stage 1 يمثل ما قبل البلوغ، Stage 2 للثدي يمثل ظهور breast bud، وStage 5 النمط الناضج.',
      'لا تحسب متوسطًا أو Tanner total score، لأن المجالين لا يلزمان بالتزامن.',
      'فسر المرحلة مع العمر وسرعة النمو والتاريخ السريري؛ لا تستخدمها كتشخيص مستقل للبلوغ المبكر أو المتأخر.',
    ],
    interpretationGuardrails: [
      'المدى الطبيعي للتوقيت واسع؛ يلزم السياق السريري عند الاشتباه ببلوغ مبكر/متأخر.',
      'نمو الثدي أفضل من شعر العانة وحده في توصيف تنشيط محور البلوغ التناسلي، لأن الأدرينارك قد يتقدم بصورة مستقلة.',
      'لا تستخدم Tanner stage لإثبات أو نفي نشاط جنسي أو إساءة أو بلوغ قانوني.',
      'التقييم الذاتي/الصور أقل ضبطًا من التقييم السريري المناسب، وروافد لا يطلب صورًا.',
    ],
    stopRules: [
      'أوقف الفحص إذا رفضت الطفلة/الناشئة أو ظهر ضيق، ما لم تكن هناك ضرورة طبية عاجلة تُدار وفق بروتوكول مؤسسي مناسب.',
      'أي اشتباه إساءة أو خطر حماية يُدار بمسار safeguarding مستقل لا بتفسير Tanner stage.',
    ],
    officialDownloads: [
      { label: 'CDISC QRS — Tanner Scale Girl', url: 'https://www.cdisc.org/standards/foundational/qrs/tanner-scale-girl', language: 'en', publisher: 'CDISC' },
      { label: 'Endotext — Normal and Abnormal Puberty', url: 'https://www.ncbi.nlm.nih.gov/books/NBK279024/', language: 'en', publisher: 'NCBI Bookshelf / Endotext' },
    ],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/tanner-scale-girl', 'https://www.ncbi.nlm.nih.gov/books/NBK279024/'],
    lastVerifiedOn: '2026-09-06',
  },

  'valg-small-cell-lung-cancer-staging': {
    slug: 'valg-small-cell-lung-cancer-staging',
    kind: 'clinical-classification',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'تصنيف VALG لسرطان الرئة صغير الخلايا — Limited / Extensive',
    titleEn: 'Veterans Administration Lung Study Group Classification for Small Cell Lung Cancer',
    version: 'VALG limited-stage / extensive-stage with mandatory modern TNM cross-documentation',
    provenance: 'المقياس مسجل في كتالوج روافد كـPublic Domain وفق CDISC QRS. NCI ما يزال يصف Limited-Stage وExtensive-Stage SCLC ويعرض العلاقة مع IASLC/AJCC TNM؛ هذه الورقة توثق التصنيف الثنائي من دون إلغاء TNM الحديث.',
    rightsNotice: 'التصنيف نفسه Public Domain وفق سجل الحقوق لدينا/CDISC. نصوص NCI والرسوم والمخططات لا تنسخ حرفيًا؛ هذه ورقة تسجيل مستقلة مع روابط المصدر.',
    intendedUseAr: 'توثيق التصنيف الثنائي التقليدي لـSCLC إلى limited أو extensive مع حفظ تفاصيل TNM الحالية والتصوير. لا يستبدل staging oncologic كاملًا.',
    respondentFields: ['الاسم/الرمز', 'تاريخ التشخيص', 'تاريخ staging', 'تأكيد histology/cytology لـSCLC', 'اسم فريق/مراجع الأورام'],
    preflightChecks: [
      'أكد تشخيص small cell lung cancer مرضيًا قبل استعمال التصنيف.',
      'راجع imaging المناسب للصدر والمواقع البعيدة والدماغ وفق بروتوكول الأورام الحالي قبل تثبيت المرحلة.',
      'لا تجعل limited/extensive بديلًا عن TNM؛ سجل الاثنين عندما يكون TNM متاحًا.',
      'وجود M1/distant metastasis يجعل المرض extensive وفق توصيف NCI.',
    ],
    sections: [
      {
        titleAr: 'مدى المرض',
        items: [
          { code: 'VALG-ORIGIN-HEMITHORAX', labelAr: 'المرض محصور في hemithorax الأصلي/المنصف/العقد فوق الترقوة ضمن نطاق يمكن احتواؤه في حقل إشعاعي مقبول', type: 'choice', options: yesNoUnknown },
          { code: 'VALG-CONTRA', labelAr: 'وجود عقد فوق ترقوية مقابلة أو امتداد صدري يجعل تعريف limited محل خلاف/غير قابل للاحتواء', type: 'choice', options: yesNoUnknown },
          { code: 'VALG-PLEURAL', labelAr: 'انصباب جنبي خبيث/إصابة جنبية ذات صلة بالمرحلة', type: 'choice', options: yesNoUnknown },
          { code: 'VALG-DISTANT', labelAr: 'نقائل بعيدة (M1) أو انتشار خارج حدود limited-stage', type: 'choice', options: yesNoUnknown },
          { code: 'VALG-SITES', labelAr: 'مواقع الانتشار/التصوير الداعم', type: 'text' },
        ],
      },
      {
        titleAr: 'التصنيف والتوثيق الموازي',
        items: [
          { code: 'VALG-STAGE', labelAr: 'VALG classification', type: 'choice', options: [
            { labelAr: 'Limited-stage', value: 'limited' },
            { labelAr: 'Extensive-stage', value: 'extensive' },
            { labelAr: 'غير قابل للتحديد من البيانات الحالية', value: 'unknown' },
          ] },
          { code: 'VALG-TNM', labelAr: 'AJCC/IASLC TNM stage والإصدار المستخدم', type: 'text' },
          { code: 'VALG-RT-FIELD', labelAr: 'إذا اعتبر Limited: ملاحظة قابلية احتواء المرض في حقل إشعاعي مقبول وفق فريق الإشعاع', type: 'text' },
          { code: 'VALG-BASIS', labelAr: 'أساس القرار وأي نقطة خلاف تصنيفي', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'Limited-stage: المرض محصور بصورة عامة في hemithorax الأصلي والمنصف و/أو العقد فوق الترقوة بحيث يمكن احتواؤه ضمن تعريف limited وحقل إشعاعي مقبول؛ توجد اختلافات تاريخية في بعض الحالات الحدية.',
      'Extensive-stage: انتشار يتجاوز تعريف limited؛ وجود distant metastasis (M1) يعد extensive.',
      'لا تُخفِ الحالات الحدودية مثل pleural effusion أو contralateral supraclavicular nodes؛ وثقها وناقشها ضمن فريق الأورام لأن التعريفات التاريخية اختلفت.',
      'سجّل TNM بالتوازي وفق الإصدار الحالي المستخدم؛ لا تحول VALG إلى بديل عن AJCC/IASLC staging.',
    ],
    interpretationGuardrails: [
      'VALG تصنيف عملي ثنائي مفيد في SCLC لكنه لا يحمل كل التفاصيل التشريحية التي يوفرها TNM.',
      'القرار العلاجي يعتمد على المرحلة والتصوير والحالة العامة والوظيفة العضوية وتقييم الفريق، وليس على خانة limited/extensive منفردة.',
      'التصوير/الإشعاع وتقنيات العلاج تغيرت منذ تطوير VALG؛ لذلك يجب توثيق معيار الحقل الإشعاعي بدل افتراضه.',
    ],
    stopRules: [
      'لا تثبت limited-stage إذا كان staging غير مكتمل أو توجد نقائل بعيدة غير محسومة.',
      'أعراض عصبية جديدة أو علامات ضغط/انسداد أو تدهور حاد تحتاج استقصاء وعلاجًا عاجلًا مستقلًا عن تعبئة التصنيف.',
    ],
    officialDownloads: [
      { label: 'NCI Professional PDQ — Small Cell Lung Cancer staging', url: 'https://www.cancer.gov/types/lung/hp/small-cell-lung-treatment-pdq', language: 'en', publisher: 'National Cancer Institute' },
      { label: 'NCI Patient PDQ — Limited and Extensive stage definitions', url: 'https://www.cancer.gov/types/lung/patient/small-cell-lung-treatment-pdq', language: 'en', publisher: 'National Cancer Institute' },
      { label: 'CDISC QRS catalog — rights/status reference', url: 'https://www.cdisc.org/standards/foundational/qrs', language: 'en', publisher: 'CDISC' },
    ],
    sourceUrls: [
      'https://www.cancer.gov/types/lung/hp/small-cell-lung-treatment-pdq',
      'https://www.cancer.gov/types/lung/patient/small-cell-lung-treatment-pdq',
      'https://www.cdisc.org/standards/foundational/qrs',
    ],
    lastVerifiedOn: '2026-09-06',
  },

  'sofa-27mar2024': {
    slug: 'sofa-27mar2024',
    kind: 'scoring-form',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'SOFA 27MAR2024 — ورقة تسجيل كاملة للنسخة الأصلية/التاريخية',
    titleEn: 'Sepsis-related Organ Failure Assessment 27MAR2024 Score',
    version: 'CDISC SOFA 27MAR2024 / original SOFA thresholds — legacy after SOFA-2 publication',
    provenance: 'CDISC يصنف SOFA 27MAR2024 كـPublic Domain. حدود التسجيل هنا تمثل بنية SOFA الأصلية التي يمثلها سجل 27MAR2024. نُشر SOFA-2 في JAMA في 29 أكتوبر 2025 وصُحح في 29 يناير 2026؛ لذلك تُعرّف هذه الصفحة صراحة بأنها legacy ولا تخلط حدود SOFA-2 داخل الجدول القديم.',
    rightsNotice: 'SOFA 27MAR2024 Public Domain وفق CDISC. هذه ورقة روافد مستقلة للتسجيل؛ لا تنسخ تخطيط جداول ناشرين أو موادهم الإضافية.',
    intendedUseAr: 'توصيف اختلال ستة أجهزة عضوية وجمع درجة 0–24 وفق النسخة الأصلية/SOFA 27MAR2024. ليست حاسبة وفاة فردية ولا أداة مستقلة للتشخيص أو سحب/رفض العلاج.',
    respondentFields: ['الاسم/الرمز', 'تاريخ/وقت نافذة القياس', 'مكان الرعاية/ICU', 'تعريف اختيار القيم: current/worst within protocol window', 'اسم المراجع'],
    preflightChecks: [
      'ثبت الإصدار: هذه الورقة SOFA 27MAR2024/original thresholds وليست SOFA-2.',
      'ثبت نافذة القياس وقاعدة اختيار القيم قبل التسجيل، ولا تنتقِ أسوأ القيم من نوافذ مختلفة بلا بروتوكول.',
      'استخدم القيم والوحدات الأصلية الموثقة ودوّن الدعم التنفسي/الوعائي المصاحب.',
      'إذا كانت قيمة مفقودة فلا تخترعها؛ اتبع بروتوكول الدراسة/المؤسسة لتعامل البيانات المفقودة.',
    ],
    sections: [
      {
        titleAr: 'المتغيرات الخام والتوقيت',
        items: [
          { code: 'SOFA-PF', labelAr: 'PaO₂/FiO₂ ratio', type: 'number', min: 0 },
          { code: 'SOFA-RESP-SUPPORT', labelAr: 'دعم تنفسي عند القياس', type: 'choice', options: yesNoUnknown },
          { code: 'SOFA-PLT', labelAr: 'Platelets', type: 'number', unit: '×10³/µL', min: 0 },
          { code: 'SOFA-BILI', labelAr: 'Bilirubin', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'SOFA-MAP', labelAr: 'Mean arterial pressure', type: 'number', unit: 'mmHg', min: 0 },
          { code: 'SOFA-VASO', labelAr: 'Vasopressor/inotrope + أعلى جرعة µg/kg/min في النافذة', type: 'text' },
          { code: 'SOFA-GCS-RAW', labelAr: 'Glasgow Coma Scale', type: 'number', min: 3, max: 15 },
          { code: 'SOFA-CREAT', labelAr: 'Creatinine', type: 'number', unit: 'mg/dL', min: 0 },
          { code: 'SOFA-UO', labelAr: 'Urine output خلال 24 ساعة عند استخدام معيار البول', type: 'number', unit: 'mL/day', min: 0 },
        ],
      },
      {
        titleAr: 'تسجيل الأجهزة الستة — اختر درجة واحدة لكل جهاز',
        items: [
          { code: 'SOFA-RESP', labelAr: 'Respiratory', type: 'choice', options: sofaResp },
          { code: 'SOFA-COAG', labelAr: 'Coagulation / platelets', type: 'choice', options: sofaPlatelets },
          { code: 'SOFA-LIVER', labelAr: 'Liver / bilirubin', type: 'choice', options: sofaBilirubin },
          { code: 'SOFA-CARDIO', labelAr: 'Cardiovascular', type: 'choice', options: sofaCardio },
          { code: 'SOFA-CNS', labelAr: 'Central nervous system / GCS', type: 'choice', options: sofaGcs },
          { code: 'SOFA-RENAL', labelAr: 'Renal', type: 'choice', options: sofaRenal },
        ],
      },
      {
        titleAr: 'المجموع والتتبع',
        items: [
          { code: 'SOFA-TOTAL', labelAr: 'المجموع الكلي', type: 'number', unit: '/24', min: 0, max: 24 },
          { code: 'SOFA-NOTE', labelAr: 'ملاحظات حول القيم المفقودة/التدخلات/التوقيت', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      'اختر 0–4 لكل واحد من الأجهزة الستة وفق الحدود أعلاه؛ عند تحقق أكثر من معيار داخل جهاز واحد استخدم الدرجة الأعلى المنطبقة ضمن نافذة البروتوكول.',
      'اجمع Respiratory + Coagulation + Liver + Cardiovascular + CNS + Renal للحصول على مجموع 0–24.',
      'سجّل التوقيت والدعم العلاجي لأن vasopressors والتهوية والتسكين قد تؤثر مباشرة في بعض المكونات.',
      'لا تستخدم عتبات SOFA-2 داخل هذه الورقة. إذا كان الهدف التقييم المعاصر بـSOFA-2 فاستخدم أداة منفصلة تحمل الاسم والإصدار بوضوح.',
    ],
    interpretationGuardrails: [
      'SOFA يصف شدة اختلال الأعضاء؛ لا تستخدم SOFA وحده لتشخيص الإنتان أو لاستبعاد العلاج أو لتقرير سحب الدعم الحيوي.',
      'لا تحول روافد SOFA إلى حاسبة وفاة فردية؛ العلاقة بالمآلات سكانية/سياقية ولا تبرر توقعًا حتميًا لفرد.',
      'SOFA-2 تحديث معاصر منشور في 2025 مع تعديلات حدود ومعايير دعم حديثة؛ المقارنة بين النسختين تحتاج ذكر الإصدار.',
      'تغير الدرجة يعتمد على توقيت القياس وطريقة التقاط القيم، لذلك يجب تثبيت المنهج عند المتابعة.',
    ],
    stopRules: [
      'أي تدهور حيوي حاد يتطلب استجابة وعلاجًا فوريًا ولا ينتظر استكمال الدرجة.',
      'إذا لم تعرف الإصدار أو نافذة القياس فلا تنتج رقمًا يبدو قابلًا للمقارنة؛ وثق البيانات الخام أولًا.',
    ],
    officialDownloads: [
      { label: 'CDISC QRS — SOFA 27MAR2024 Public Domain listing', url: 'https://www.cdisc.org/standards/foundational/qrs', language: 'en', publisher: 'CDISC' },
      { label: 'Original SOFA publication — PubMed', url: 'https://pubmed.ncbi.nlm.nih.gov/8844239/', language: 'en', publisher: 'Intensive Care Medicine / PubMed' },
      { label: 'JAMA 2025 — Development and Validation of SOFA-2', url: 'https://jamanetwork.com/journals/jama/fullarticle/2840822', language: 'en', publisher: 'JAMA' },
    ],
    sourceUrls: [
      'https://www.cdisc.org/standards/foundational/qrs',
      'https://pubmed.ncbi.nlm.nih.gov/8844239/',
      'https://jamanetwork.com/journals/jama/fullarticle/2840822',
    ],
    lastVerifiedOn: '2026-09-06',
  },
};
