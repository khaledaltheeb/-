import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';
import { assessmentOperationalFullFormsWave2 } from '@/lib/assessment-measure-operational-full-forms-wave2';

const score02: OperationalOption[] = [0, 1, 2].map((score) => ({ labelAr: String(score), value: String(score), score }));
const score04: OperationalOption[] = [0, 1, 2, 3, 4].map((score) => ({ labelAr: String(score), value: String(score), score }));

const hamd17Base = assessmentOperationalFullFormsWave2['hamilton-depression-rating-scale-17'];
const hamd17ItemsFor24 = hamd17Base.sections[0].items.map((item, index) => ({
  ...item,
  code: `HAMD24-${index + 1}`,
}));

export const assessmentOperationalFullFormsWave13: Record<string, AssessmentOperationalMaterial> = {
  'atlas-cdi-score': {
    slug: 'atlas-cdi-score',
    kind: 'scoring-form',
    completeness: 'exact-public-domain-form',
    titleAr: 'مقياس ATLAS لعدوى المطثية العسيرة — ورقة الحساب',
    titleEn: 'ATLAS Score for Clostridioides difficile Infection',
    version: 'Original 5-component ATLAS score / Miller et al. 2013 / CDISC QRS v1.0',
    provenance: 'CDISC يصنف ATLAS ضمن Public Domain. اشتقاق Miller وآخرين فحص ستة متغيرات بما فيها الحرارة، لكن النظام النهائي الأفضل تمييزًا كان من خمسة متغيرات فقط: Age, Treatment with systemic antibiotics, Leukocyte count, Albumin, Serum creatinine — ATLAS — بمجموع 0–10.',
    rightsNotice: 'ATLAS Public Domain وفق CDISC. لا تضف الحرارة إلى مجموع ATLAS النهائي؛ كانت من متغيرات الاشتقاق المرشحة وليست حرفًا/مكونًا في النظام النهائي ذي الخمسة عناصر.',
    intendedUseAr: 'توصيف خطر انخفاض الاستجابة السريرية لعلاج CDI في سياق الدراسة/المريض عند التشخيص باستخدام خمسة متغيرات بسيطة. ليس أداة لتحديد المضاد أو الجراحة أو شدة CDI الحالية بمفرده.',
    respondentFields: ['الاسم/الرمز', 'تاريخ ووقت تقييم CDI', 'العمر', 'الفاحص', 'توقيت المختبر بالنسبة لتشخيص CDI', 'العلاج بالمضادات الجهازية المتزامن'],
    preflightChecks: [
      'أكد أن البيانات مأخوذة في سياق CDI المشخص/المشتبه بحسب بروتوكولك؛ ATLAS لا يشخّص CDI.',
      'استخدم المكونات الخمسة النهائية فقط؛ لا تدخل الحرارة في المجموع.',
      'عرّف systemic antibiotic treatment كما في الاشتقاق: مضاد جهازي لمدة يوم واحد أو أكثر أثناء علاج CDI.',
      'ثبت الوحدات: WBC، albumin، creatinine قبل التحويل إلى نقاط.',
      'لا تستخدم علاقة cure التاريخية كضمان فردي أو بديل لإرشادات CDI الحالية.',
    ],
    sections: [
      {
        titleAr: 'المكونات الخمسة ونقاط ATLAS',
        items: [
          { code: 'ATLAS-AGE-RAW', labelAr: 'العمر', type: 'number', min: 0, max: 130, unit: 'سنة' },
          { code: 'ATLAS-AGE', labelAr: 'Age', type: 'choice', options: [
            { labelAr: '0 — أقل من 60 سنة', value: '0', score: 0 },
            { labelAr: '1 — 60–79 سنة', value: '1', score: 1 },
            { labelAr: '2 — 80 سنة فأكثر', value: '2', score: 2 },
          ] },
          { code: 'ATLAS-TREATMENT', labelAr: 'Treatment with systemic antibiotics during CDI therapy (≥1 day)', type: 'choice', options: [
            { labelAr: '0 — لا', value: '0', score: 0 },
            { labelAr: '2 — نعم', value: '2', score: 2 },
          ], noteAr: 'لا توجد فئة 1 نقطة لهذا المكون في ATLAS النهائي.' },
          { code: 'ATLAS-WBC-RAW', labelAr: 'عدد الكريات البيضاء WBC', type: 'number', min: 0, unit: 'خلية/µL' },
          { code: 'ATLAS-WBC', labelAr: 'Leukocyte count', type: 'choice', options: [
            { labelAr: '0 — أقل من 16,000/µL', value: '0', score: 0 },
            { labelAr: '1 — 16,000–25,000/µL', value: '1', score: 1 },
            { labelAr: '2 — أكثر من 25,000/µL', value: '2', score: 2 },
          ] },
          { code: 'ATLAS-ALBUMIN-RAW', labelAr: 'ألبومين المصل', type: 'number', min: 0, unit: 'g/L' },
          { code: 'ATLAS-ALBUMIN', labelAr: 'Serum albumin', type: 'choice', options: [
            { labelAr: '0 — أكثر من 35 g/L', value: '0', score: 0 },
            { labelAr: '1 — 26–35 g/L', value: '1', score: 1 },
            { labelAr: '2 — 25 g/L أو أقل', value: '2', score: 2 },
          ] },
          { code: 'ATLAS-CREAT-RAW', labelAr: 'كرياتينين المصل', type: 'number', min: 0, unit: 'µmol/L' },
          { code: 'ATLAS-CREAT', labelAr: 'Serum creatinine', type: 'choice', options: [
            { labelAr: '0 — ≤120 µmol/L', value: '0', score: 0 },
            { labelAr: '1 — 121–179 µmol/L', value: '1', score: 1 },
            { labelAr: '2 — ≥180 µmol/L', value: '2', score: 2 },
          ] },
          { code: 'ATLAS-TOTAL', labelAr: 'مجموع ATLAS', type: 'number', min: 0, max: 10, unit: '0–10' },
        ],
      },
    ],
    scoringSteps: [
      'اجمع: العمر 0–2 + المضاد الجهازي 0 أو 2 + WBC 0–2 + الألبومين 0–2 + الكرياتينين 0–2؛ المجموع 0–10.',
      'في الاشتقاق الأصلي كان ATLAS النهائي من خمسة متغيرات؛ الحرارة لا تدخل المجموع النهائي رغم أنها دُرست كمرشح.',
      'ارتبطت الدرجة الأعلى بانخفاض معدل الشفاء في قواعد بيانات التجارب الأصلية، مع علاقة انحدار تاريخية cure rate ≈ 100 − (5.08 × ATLAS)، لكن هذه ليست معايرة حديثة أو ضمانًا فرديًا.',
      'احتفظ بالقيم الخام إلى جانب النقاط لتدقيق الوحدات وإعادة الحساب.',
    ],
    interpretationGuardrails: [
      'ATLAS طُوّر أساسًا للتنبؤ بالاستجابة/الشفاء في قواعد بيانات تجارب علاجية تاريخية؛ فائدته الحالية في قرارات الإدارة ليست مثبتة كقاعدة علاجية وحيدة.',
      'لا تستخدمه لتشخيص CDI، أو اختيار المضاد منفردًا، أو تأخير تقييم fulminant colitis أو toxic megacolon أو الصدمة.',
      'العلاج والوبائيات وإرشادات CDI تغيرت منذ اشتقاق المقياس؛ لا تنقل معدل شفاء تاريخيًا إلى مريض حالي كاحتمال شخصي مؤكد.',
    ],
    stopRules: ['الصدمة، ileus، توسع قولون سمي، انثقاب، تدهور سريع أو CDI fulminant يحتاج إدارة عاجلة مستقلة عن ATLAS.'],
    officialDownloads: [{ label: 'CDISC QRS — ATLAS, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/age-treatment-systemic-antibiotics-leukocyte-count-serum-albumin-and', language: 'en', publisher: 'CDISC' }],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/age-treatment-systemic-antibiotics-leukocyte-count-serum-albumin-and', 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3618004/'],
    lastVerifiedOn: '2026-09-06',
  },

  'hamilton-depression-rating-scale-24': {
    slug: 'hamilton-depression-rating-scale-24',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'مقياس هاملتون لتقدير الاكتئاب — HAMD-24 ورقة التسجيل',
    titleEn: 'Hamilton Depression Rating Scale — 24 Item',
    version: '24-item clinician-rated HAMD / public-domain structure',
    provenance: 'CDISC يصنف HAMD-24 ضمن Public Domain. تبني هذه الورقة البنود 1–17 من ورقة HAMD-17 التشغيلية في روافد، ثم تضيف البند 18 للتباين اليومي (وقت التباين غير مسجل في المجموع + شدة 0–2)، والبنود 19–24 وفق نطاقات NIH NDA: 19 و20 و22–24 = 0–4، و21 = 0–2.',
    rightsNotice: 'HAMD-24 الأصلية Public Domain وفق CDISC. هذه الصياغة العربية ورقة تسجيل تشغيلية من روافد وليست ادعاءً بأنها مقابلة عربية منظمة أو ترجمة عربية محققة. SIGH-D/GRID-HAMD وأدلة مقابلة مشتقة قد تحمل حقوقًا/نسخًا مختلفة.',
    intendedUseAr: 'تسجيل شدة 24 مجالًا في نسخة HAMD الموسعة بواسطة فاحص سريري مدرب ومتابعة التغير؛ ليست أداة تشخيص ذاتي.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'الفاحص', 'التشخيص/السياق', 'الفترة المرجعية — عادة الأسبوع السابق وفق بروتوكول HAMD المستخدم', 'الأدوية/التغيرات العلاجية', 'مصدر النسخة/المقابلة إن كانت منظمة'],
    preflightChecks: [
      'يطبق بواسطة فاحص مدرب وباستخدام مراسي نسخة ثابتة.',
      'البنود 1–17 تتبع نفس بنية HAMD-17 المعتمدة في مكتبة روافد؛ لا تبدّل نطاق بند منفرد بين الزيارات.',
      'في البند 18 سجل اتجاه/وقت التباين اليومي منفصلًا عن شدة التباين؛ الذي يدخل المجموع هو الشدة 0–2، لا رمز AM/PM/afternoon.',
      'بند الانتحار رقم 3 يراجع مستقلًا عن المجموع؛ وجود خطر حالي يحتاج تقييم سلامة مباشرًا.',
    ],
    sections: [
      {
        titleAr: 'البنود 1–17 — نفس نطاقات HAMD-17',
        instructionsAr: 'استخدم مراسي النسخة/المقابلة المرجعية نفسها. هذه البنود مستمدة بنيويًا من ورقة HAMD-17 التشغيلية داخل روافد.',
        items: hamd17ItemsFor24,
      },
      {
        titleAr: 'البنود الإضافية 18–24',
        items: [
          { code: 'HAMD24-18-TIME', labelAr: '18A. اتجاه/وقت التباين اليومي — معلومات وصفية لا تدخل المجموع', type: 'choice', options: [
            { labelAr: 'لا يوجد تباين', value: 'none' },
            { labelAr: 'أسوأ صباحًا', value: 'am' },
            { labelAr: 'أسوأ مساءً', value: 'pm' },
            { labelAr: 'أسوأ بعد الظهر', value: 'afternoon' },
          ] },
          { code: 'HAMD24-18', labelAr: '18B. شدة التباين اليومي', type: 'task-score', options: [
            { labelAr: '0 — لا يوجد/طبيعي', value: '0', score: 0 },
            { labelAr: '1 — خفيف', value: '1', score: 1 },
            { labelAr: '2 — شديد/متوسط إلى شديد بحسب النسخة المرجعية', value: '2', score: 2 },
          ] },
          { code: 'HAMD24-19', labelAr: '19. تبدد الشخصية/تبدد الواقع', type: 'task-score', options: [
            { labelAr: '0 — غائب', value: '0', score: 0 },
            { labelAr: '1 — خفيف', value: '1', score: 1 },
            { labelAr: '2 — متوسط', value: '2', score: 2 },
            { labelAr: '3 — شديد', value: '3', score: 3 },
            { labelAr: '4 — مُعطّل/شديد جدًا بحسب النسخة', value: '4', score: 4 },
          ] },
          { code: 'HAMD24-20', labelAr: '20. الأعراض الارتيابية/البارانوية', type: 'task-score', options: score04 },
          { code: 'HAMD24-21', labelAr: '21. الأعراض الوسواسية والقهرية', type: 'task-score', options: score02 },
          { code: 'HAMD24-22', labelAr: '22. العجز/الشعور بالعجز Helplessness', type: 'task-score', options: [
            { labelAr: '0 — لا دليل على العجز', value: '0', score: 0 },
            { labelAr: '1 — مشاعر ذاتية تظهر عند الاستفسار فقط', value: '1', score: 1 },
            { labelAr: '2 — يذكر مشاعر العجز تلقائيًا', value: '2', score: 2 },
            { labelAr: '3 — يحتاج الحث/الإرشاد/الطمأنة لإنجاز الأعمال أو النظافة الشخصية', value: '3', score: 3 },
            { labelAr: '4 — يحتاج مساعدة جسدية للملبس أو العناية أو الأكل أو مهام السرير/النظافة', value: '4', score: 4 },
          ] },
          { code: 'HAMD24-23', labelAr: '23. اليأس Hopelessness', type: 'task-score', options: [
            { labelAr: '0 — غير موجود', value: '0', score: 0 },
            { labelAr: '1 — شك متقطع في التحسن ويمكن طمأنته', value: '1', score: 1 },
            { labelAr: '2 — يشعر باليأس باستمرار لكنه يقبل الطمأنة', value: '2', score: 2 },
            { labelAr: '3 — يعبّر عن الإحباط/اليأس/التشاؤم بما لا يزول بالطمأنة', value: '3', score: 3 },
            { labelAr: '4 — يكرر تلقائيًا وبصورة غير ملائمة قناعة شديدة بأنه لن يتحسن', value: '4', score: 4 },
          ] },
          { code: 'HAMD24-24', labelAr: '24. انعدام القيمة Worthlessness', type: 'task-score', options: [
            { labelAr: '0 — غير موجود', value: '0', score: 0 },
            { labelAr: '1 — شعور بانخفاض القيمة/تقدير الذات يظهر عند الاستفسار فقط', value: '1', score: 1 },
            { labelAr: '2 — يذكر الشعور بانعدام القيمة تلقائيًا', value: '2', score: 2 },
            { labelAr: '3 — شعور شديد ومستمر بأنه عديم القيمة/أدنى من الآخرين', value: '3', score: 3 },
            { labelAr: '4 — أفكار وهامية بانعدام القيمة أو ما يعادلها', value: '4', score: 4 },
          ] },
        ],
      },
      { titleAr: 'النتيجة', items: [{ code: 'HAMD24-TOTAL', labelAr: 'مجموع البنود 1–24 — لا يدخل HAMD24-18-TIME', type: 'number', min: 0, max: 76, unit: '0–76' }] },
    ],
    scoringSteps: [
      'اجمع البنود 1–17 وفق نطاقاتها الأصلية (حد أقصى 52 في هذه النسخة)، ثم أضف: 18 شدة التباين 0–2، 19 = 0–4، 20 = 0–4، 21 = 0–2، 22–24 = 0–4 لكل بند.',
      'لا تدخل حقل 18A الخاص بوقت/اتجاه التباين اليومي في المجموع.',
      'النطاق النظري لهذه البنية = 0–76.',
      'توجد في الأدبيات فروق طفيفة بين نسخ HAMD في مجموعات البنود/الحد الأقصى؛ سجل نسخة المقياس والمقابلة بدل مقارنة 75 و76 أو 52 و53 كما لو كانت متطابقة.',
      'أحد التصنيفات المنشورة الشائعة لـHAMD-24 يصف 0–7 طبيعي، 8–13 خفيف، 14–18 متوسط، 19–22 شديد، ≥23 شديد جدًا؛ هذه نطاقات وصفية بحثية وليست تشخيصًا مستقلًا.',
    ],
    interpretationGuardrails: [
      'HAMD-24 مقياس شدة متعدد البنود وليس اختبارًا تشخيصيًا مستقلًا.',
      'النسخة العربية هنا ترجمة تشغيلية بنيوية؛ لا تُعرض على أنها ترجمة عربية محققة لمقابلة HAMD منظمة بعينها.',
      'جودة النتيجة تعتمد على تدريب المقيم وثبات المقابلة والمراسي.',
      'بند الانتحار يُفسر ويُتصرف بشأنه مستقلًا عن المجموع النهائي.',
    ],
    stopRules: ['أي أفكار/سلوك انتحاري حالي، ذهان شديد، هياج خطير أو تدهور طبي حاد يحتاج تقييمًا مباشرًا ولا ينتظر استكمال الدرجة.'],
    officialDownloads: [
      { label: 'CDISC QRS — Hamilton Depression Rating Scale 24-Item, Public Domain', url: 'https://www.cdisc.org/standards/foundational/qrs/hamilton-depression-rating-scale-24-item', language: 'en', publisher: 'CDISC' },
      { label: 'NIMH Data Archive — Hamilton Rating Scale for Depression data dictionary', url: 'https://nda.nih.gov/ndar_data_dictionary.html?short_name=hrsd01', language: 'en', publisher: 'National Institute of Mental Health' },
    ],
    sourceUrls: ['https://www.cdisc.org/standards/foundational/qrs/hamilton-depression-rating-scale-24-item', 'https://nda.nih.gov/ndar_data_dictionary.html?short_name=hrsd01', 'https://www.ncbi.nlm.nih.gov/books/NBK564553/'],
    lastVerifiedOn: '2026-09-06',
  },
};
