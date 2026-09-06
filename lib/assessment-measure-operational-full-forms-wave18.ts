import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const raw15: OperationalOption[] = [1, 2, 3, 4, 5].map((score) => ({
  labelAr: `الاستجابة الخام ${score} — استخدم مرساة النموذج الرسمي لهذا البند`,
  value: String(score),
  score,
}));

const yesNoUnknown: OperationalOption[] = [
  { labelAr: 'نعم', value: 'yes' },
  { labelAr: 'لا', value: 'no' },
  { labelAr: 'غير معروف / غير موثق', value: 'unknown' },
];

const CDISC_ALL = 'https://www.cdisc.org/qrs/all';
const CHART_RMD = 'https://www.sralab.org/rehabilitation-measures/craig-handicap-assessment-and-reporting-technique-short-form';
const CHART_FITBIR = 'https://fitbir.nih.gov/dictionary/publicData/dataStructureAction%21view.action?dataStructureName=CHARTSF&publicArea=true&style.key=fitbir-style';
const CES_VA = 'https://www.ptsd.va.gov/professional/assessment/te-measures/ces.asp';
const DRRI2_VA = 'https://www.ptsd.va.gov/professional/assessment/te-measures/drri.asp';
const DRSPI_PUBMED = 'https://pubmed.ncbi.nlm.nih.gov/22510680/';
const DRSPI_TBIMS = 'https://www.tbims.org/combi/drs/';
const DRSPI_FITBIR = 'https://fitbir.nih.gov/';

const chartSubscaleItems = [
  { code: 'CHART-PHYSICAL', labelAr: 'Physical Independence — الاستقلال الجسدي' },
  { code: 'CHART-COGNITIVE', labelAr: 'Cognitive Independence — الاستقلال المعرفي' },
  { code: 'CHART-MOBILITY', labelAr: 'Mobility — الحركة' },
  { code: 'CHART-OCCUPATION', labelAr: 'Occupation — العمل/النشاط الإنتاجي' },
  { code: 'CHART-SOCIAL', labelAr: 'Social Integration — الاندماج الاجتماعي' },
  { code: 'CHART-ECONOMIC', labelAr: 'Economic Self-Sufficiency — الاكتفاء الاقتصادي' },
] as const;

const drri2Scales = [
  ['DRRI2-01-PRIOR-STRESSORS', '1 — Prior Stressors / الضغوط السابقة للانتشار', 'predeployment'],
  ['DRRI2-02-CHILD-FAMILY', '2 — Childhood Family Functioning / الأداء الأسري في الطفولة', 'predeployment'],
  ['DRRI2-03-LIVING-WORK', '3 — Difficult Living and Working Environment / بيئة معيشة وعمل صعبة', 'deployment'],
  ['DRRI2-04-COMBAT', '4 — Combat Experiences / خبرات القتال', 'deployment'],
  ['DRRI2-05-AFTERMATH', '5 — Aftermath of Battle / آثار ما بعد المعركة', 'deployment'],
  ['DRRI2-06-NBC', '6 — Nuclear, Biological and Chemical Exposures / التعرضات النووية والبيولوجية والكيميائية', 'deployment'],
  ['DRRI2-07-THREAT', '7 — Perceived Threat / التهديد المدرك', 'deployment'],
  ['DRRI2-08-PREPAREDNESS', '8 — Preparedness / الاستعداد', 'deployment'],
  ['DRRI2-09-FAMILY-FRIEND-SUPPORT', '9 — Deployment Support from Family and Friends / دعم العائلة والأصدقاء', 'deployment'],
  ['DRRI2-10-UNIT-SUPPORT', '10 — Unit Social Support / الدعم الاجتماعي من الوحدة', 'deployment'],
  ['DRRI2-11-GENERAL-HARASSMENT', '11 — General Harassment / المضايقة العامة', 'deployment'],
  ['DRRI2-12-SEXUAL-HARASSMENT', '12 — Sexual Harassment / التحرش الجنسي', 'deployment'],
  ['DRRI2-13-LIFE-FAMILY-CONCERNS', '13 — Concerns about Life and Family Disruptions / مخاوف اضطراب الحياة والأسرة', 'deployment'],
  ['DRRI2-14-FAMILY-STRESSORS', '14 — Family Stressors / ضغوط الأسرة', 'deployment'],
  ['DRRI2-15-POST-STRESSORS', '15 — Postdeployment Stressors / ضغوط ما بعد الانتشار', 'postdeployment'],
  ['DRRI2-16-POST-SOCIAL-SUPPORT', '16 — Postdeployment Social Support / الدعم الاجتماعي بعد الانتشار', 'postdeployment'],
  ['DRRI2-17-POST-FAMILY', '17 — Postdeployment Family Functioning / الأداء الأسري بعد الانتشار', 'postdeployment'],
] as const;

function drsPiMaterial(source: 'survivor' | 'caregiver'): AssessmentOperationalMaterial {
  const survivor = source === 'survivor';
  const sourceAr = survivor ? 'الناجي' : 'مقدم الرعاية';
  const sourceEn = survivor ? 'Survivor' : 'Caregiver';
  const slug = survivor
    ? 'expanded-drs-postacute-interview-survivor'
    : 'expanded-drs-postacute-interview-caregiver';

  return {
    slug,
    kind: 'protocol-sheet',
    completeness: 'recording-and-scoring-sheet',
    titleAr: `Expanded DRS‑PI — نسخة ${sourceAr}: ورقة المقابلة وخروج الخوارزمية الرسمية`,
    titleEn: `Expanded Disability Rating Scale — Postacute Interview ${sourceEn} Version operational record`,
    version: `Expanded DRS-PI ${sourceEn} Version 1.0 / CDISC QS v1.0 (19 Apr 2016)`,
    provenance: `CDISC يصنف Expanded DRS-PI ${sourceEn} Version كـPublic Domain. مقابلة DRS ما بعد الحادة تحول الإجابات إلى عناصر ودرجات بخوارزمية منشورة؛ لذلك تحفظ روافد هوية المجيب، اكتمال المقابلة، والدرجات المشتقة رسميًا ولا تخترع جمعًا يدويًا بديلًا.`,
    rightsNotice: 'الأصل Public Domain وفق CDISC، لكن ترجمة أو مادة تدريبية من طرف ثالث قد تحمل شروطًا مستقلة. لا تدعي هذه الورقة أنها ترجمة عربية محققة لأسئلة المقابلة الأصلية.',
    intendedUseAr: survivor
      ? 'تطبيق نسخة الناجي عندما يكون التقرير الذاتي موثوقًا بما يكفي، مع اشتقاق المخرجات بخوارزمية Expanded DRS-PI الرسمية وعدم استخدام الدرجة منفردة للحكم على الأهلية للخدمات.'
      : 'تطبيق نسخة مقدم الرعاية عندما يحدد البروتوكول proxy report أو يكون التقرير الذاتي محدودًا، مع إبقاء مصدر التقرير ظاهرًا وعدم استخدامه لحجب صوت الناجي.',
    respondentFields: survivor
      ? ['الاسم/الرمز', 'الزمن منذ الإصابة', 'تاريخ المقابلة', 'المحاور', 'نسخة Survivor', 'ملاحظات التواصل/الاستبصار']
      : ['الاسم/الرمز', 'الزمن منذ الإصابة', 'تاريخ المقابلة', 'المحاور', 'اسم/رمز مقدم الرعاية', 'صلة المجيب', 'مدة معرفته/ملاحظته للحالة'],
    preflightChecks: [
      `ثبت أن النسخة المستخدمة هي ${sourceEn} ولا تخلط أسئلتها مع النسخة الأخرى في مقابلة واحدة.`,
      survivor
        ? 'استخدم نسخة الناجي فقط عندما تسمح القدرة المعرفية واللغوية والتواصلية بتقرير ذاتي موثوق بما يكفي؛ وثق أي مصادر مساعدة.'
        : 'مصدر التقرير هو مقدم الرعاية؛ وثق صلته ومدة الملاحظة وأي فجوة معرفية، ولا تعامل proxy report كحقيقة مطلقة.',
      'استخدم نص المقابلة وتسلسل الاستفسارات والخوارزمية الرسمية من المصدر المعتمد؛ لا تستنتج الدرجات من عناوين المجالات فقط.',
      'في سياق DRS-PI ما بعد الحاد توجد تعديلات عن DRS الأصلي، منها التعامل مع Eye Opening وCommunication؛ لا تعيد بناء Original DRS إلا إذا اتبعت الخوارزمية المخصصة لذلك.',
      'تدريب/اختبار جامعي البيانات مطلوب عند تطبيق السجل المؤسسي؛ وثق حالة التدريب والإصدار.',
    ],
    sections: [
      {
        titleAr: `سلامة مصدر المقابلة — ${sourceAr}`,
        items: [
          { code: `EDRSPI-${source.toUpperCase()}-VERSION`, labelAr: 'إصدار/تاريخ نموذج المقابلة والخوارزمية المستخدمة', type: 'text' },
          { code: `EDRSPI-${source.toUpperCase()}-TRAINED`, labelAr: 'المحاور مدرب/معتمد وفق متطلبات المشروع؟', type: 'choice', options: yesNoUnknown },
          { code: `EDRSPI-${source.toUpperCase()}-COMPLETE`, labelAr: 'هل اكتملت المقابلة بصورة صالحة للاشتقاق؟', type: 'choice', options: yesNoUnknown },
          { code: `EDRSPI-${source.toUpperCase()}-LIMITS`, labelAr: 'بنود/مجالات غير محسومة أو قيود المصدر', type: 'text' },
        ],
      },
      {
        titleAr: 'المخرجات المشتقة بالخوارزمية الرسمية',
        instructionsAr: 'انقل المخرجات من خوارزمية Expanded DRS-PI المعتمدة؛ لا تحسبها من هذه الحقول يدويًا إذا لم تكن الخوارزمية أمامك.',
        items: [
          { code: `EDRSPI-${source.toUpperCase()}-EXPANDED`, labelAr: 'Expanded DRS-PI derived score / الدرجة الموسعة المشتقة', type: 'number', min: 0 },
          { code: `EDRSPI-${source.toUpperCase()}-DRSPI`, labelAr: 'DRS-PI derived score إن طُلب في البروتوكول', type: 'number', min: 0 },
          { code: `EDRSPI-${source.toUpperCase()}-ORIGINAL-DRS`, labelAr: 'Original DRS equivalent إن اشتُق رسميًا', type: 'number', min: 0, max: 29 },
          { code: `EDRSPI-${source.toUpperCase()}-EMPLOYMENT`, labelAr: 'Actual employment / المشاركة في العمل كما يخرجها/يوثقها البروتوكول الموسع', type: 'text' },
          { code: `EDRSPI-${source.toUpperCase()}-PARTICIPATION`, labelAr: 'ملاحظات المشاركة/الوظيفة التي تفسر الدرجة', type: 'text' },
        ],
      },
      {
        titleAr: 'مقارنة المصادر عند توفرهما',
        items: [
          { code: `EDRSPI-${source.toUpperCase()}-OTHER-SOURCE`, labelAr: `هل تتوفر نسخة ${survivor ? 'مقدم الرعاية' : 'الناجي'} لنفس نقطة الزمن؟`, type: 'choice', options: yesNoUnknown },
          { code: `EDRSPI-${source.toUpperCase()}-DISCREPANCY`, labelAr: 'الفروق الجوهرية بين المصادر وكيف جرى تفسيرها سريريًا', type: 'text' },
        ],
      },
    ],
    scoringSteps: [
      `أكمل مقابلة ${sourceEn} الرسمية أولًا، ثم طبّق خوارزمية التسجيل الخاصة بنفس النسخة.`,
      'لا تجمع إجابات المقابلة يدويًا إلى مجموع جديد؛ البنود تتحول إلى درجات وفق الخوارزمية الأصلية.',
      'إذا اشتُق Expanded DRS-PI وDRS-PI وOriginal DRS في الوقت نفسه، سجّل كل مخرج باسمه وإصداره بدل معاملتها كدرجة واحدة.',
      survivor
        ? 'عندما يكون التقرير الذاتي غير موثوق بسبب الإدراك/التواصل، وثق ذلك وأضف مصدرًا آخر بدل افتراض الدقة.'
        : 'عندما يتعارض proxy report مع تقرير الناجي القابل للاعتماد، احتفظ بالاختلاف واستكشفه؛ لا تختَر الأعلى أو الأدنى آليًا.',
    ],
    interpretationGuardrails: [
      'الدرجة تصف العجز/الوظيفة ضمن بنية DRS-PI ولا تقيس كل أبعاد نوعية الحياة أو الاستقلال أو المشاركة.',
      survivor
        ? 'لا تستخدم الدرجة وحدها لتحديد أهلية خدمات التأهيل أو التعويض أو القدرة القانونية.'
        : 'لا تستخدم تقرير مقدم الرعاية وحده لحجب صوت الناجي أو لتحديد الأهلية القانونية أو التأهيلية.',
      'المقارنة بين Survivor وCaregiver مفيدة فقط مع حفظ هوية المصدر؛ الاختلاف ليس خطأً يُمحى آليًا.',
    ],
    stopRules: ['إذا تعذر إكمال المقابلة بصورة صالحة أو كانت الخوارزمية/النسخة غير محددة، لا تنتج درجة مشتقة نهائية.'],
    officialDownloads: [
      { label: `CDISC QRS — Expanded DRS-PI ${sourceEn} Version, Public Domain`, url: CDISC_ALL, language: 'en', publisher: 'CDISC' },
      { label: 'PubMed — structured DRS postacute interview development and psychometrics', url: DRSPI_PUBMED, language: 'en', publisher: 'PubMed' },
      { label: 'TBI Model Systems — DRS/DRS-PI resources and algorithms', url: DRSPI_TBIMS, language: 'en', publisher: 'TBIMS' },
    ],
    sourceUrls: [CDISC_ALL, DRSPI_PUBMED, DRSPI_TBIMS, DRSPI_FITBIR],
    lastVerifiedOn: '2026-09-06',
  };
}

export const assessmentOperationalFullFormsWave18: Record<string, AssessmentOperationalMaterial> = {
  'chart-short-form': {
    slug: 'chart-short-form',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'CHART‑SF — ورقة تسجيل المجالات الستة والمجموع مع مصدر المجيب',
    titleEn: 'Craig Handicap Assessment and Reporting Technique — Short Form scoring record',
    version: 'CHART-SF 19-item Short Form; CDISC paper/interview QS public-domain variants',
    provenance: 'CHART-SF يتكون من 19 بندًا ويعطي ست درجات مجالية من 0–100 ومجموعًا أقصى 600؛ CDISC يدرج صيغ paper/interview ومخرجات ADaM كـPublic Domain. تحفظ روافد الدرجة الرسمية ومصدر المجيب بدل إعادة اختراع خوارزمية العناصر.',
    rightsNotice: 'الأصل Public Domain وفق CDISC. النموذج/الخوارزمية الرسمية والمراجع المرتبطة هي مرجع الاشتقاق؛ ترجمة عربية محددة تحتاج تحققًا لغويًا منفصلًا.',
    intendedUseAr: 'توثيق المشاركة/العائق الاجتماعي بعد الإصابة أو الإعاقة عبر المجالات الستة مع الحفاظ على نوع النموذج ومصدر التقرير، سواء self-report أو proxy.',
    respondentFields: ['الاسم/الرمز', 'تاريخ التقييم', 'نوع النموذج Paper/Interview', 'المجيب Self/Proxy', 'صلة الـProxy إن وجد', 'الفاحص', 'إصدار خوارزمية التسجيل'],
    preflightChecks: [
      'ثبت صيغة CHART-SF: paper أو interview، ولا تخلط تعليمات/حقول الصيغ في جلسة واحدة.',
      'ثبت مصدر التقرير Self أو Proxy؛ اختلاف المصدر قد يؤثر في المقارنة ولا يجوز إخفاؤه.',
      'استخدم البنود الـ19 والخوارزمية الرسمية لاشتقاق المجالات؛ لا تحسب الدرجات من عناوين المجالات الموجودة هنا.',
      'إذا كانت بيانات مجال ناقصة، طبق قاعدة النموذج الرسمية للمفقود ولا تفترض 0 أو 100.',
    ],
    sections: [
      {
        titleAr: 'توثيق اكتمال النموذج',
        items: [
          { code: 'CHART-FORM', labelAr: 'صيغة النموذج', type: 'choice', options: [{ labelAr: 'Paper Version', value: 'paper' }, { labelAr: 'Interview Version', value: 'interview' }] },
          { code: 'CHART-SOURCE', labelAr: 'مصدر التقرير', type: 'choice', options: [{ labelAr: 'Self report / الشخص نفسه', value: 'self' }, { labelAr: 'Proxy / مقدم معلومات آخر', value: 'proxy' }] },
          { code: 'CHART-ITEMS-COMPLETE', labelAr: 'عدد البنود المكتملة من 19', type: 'number', min: 0, max: 19, unit: 'items' },
          { code: 'CHART-MISSING', labelAr: 'البنود/البيانات المفقودة وكيف عولجت وفق الدليل', type: 'text' },
        ],
      },
      {
        titleAr: 'الدرجات الرسمية للمجالات',
        items: [
          ...chartSubscaleItems.map(({ code, labelAr }) => ({ code, labelAr, type: 'number' as const, min: 0, max: 100, unit: '0–100' })),
          { code: 'CHART-TOTAL', labelAr: 'المجموع الكلي للمجالات الستة عند صلاحية جميع المخرجات', type: 'number', min: 0, max: 600, unit: '0–600' },
        ],
      },
    ],
    scoringSteps: [
      'طبّق خوارزمية CHART-SF الرسمية على البنود الـ19 للحصول على ست درجات مجال، كل واحدة 0–100.',
      'عند توفر المجالات الستة بصورة صالحة، يمكن جمعها إلى مجموع 0–600؛ الدرجة الأعلى تعكس مشاركة/استقلالًا أكبر أو handicap أقل وفق بناء CHART.',
      'لا تنتج CHART-TOTAL إذا كان مجال غير صالح ولم تنص الخوارزمية الرسمية على معالجة قابلة للدفاع.',
      'في المتابعة، حافظ على نفس صيغة النموذج ومصدر المجيب قدر الإمكان.',
    ],
    interpretationGuardrails: [
      'CHART-SF يلتقط المشاركة/العائق الاجتماعي وليس شدة الإصابة العصبية أو جودة الحياة كلها.',
      'لا تعامل فروق Self وProxy كفروق مرضية صرفة؛ مصدر التقرير جزء من القياس.',
      'لا تستخدم المجموع وحده لاتخاذ قرار أهلية خدمة أو تعويض.',
    ],
    stopRules: ['إذا لم تُعرف صيغة النموذج أو مصدر المجيب أو كانت الخوارزمية الرسمية غير متاحة، سجّل البيانات دون ادعاء مجموع نهائي.'],
    officialDownloads: [
      { label: 'CDISC QRS — CHART-SF public-domain variants', url: CDISC_ALL, language: 'en', publisher: 'CDISC' },
      { label: 'RehabMeasures — CHART-SF evidence and scoring overview', url: CHART_RMD, language: 'en', publisher: 'Shirley Ryan AbilityLab' },
      { label: 'FITBIR — CHART-SF data structure/form', url: CHART_FITBIR, language: 'en', publisher: 'NIH FITBIR' },
    ],
    sourceUrls: [CDISC_ALL, CHART_RMD, CHART_FITBIR],
    lastVerifiedOn: '2026-09-06',
  },

  'combat-exposure-scale': {
    slug: 'combat-exposure-scale',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'CES — ورقة التسجيل والتحويل الموزون 0–41',
    titleEn: 'Combat Exposure Scale weighted scoring sheet',
    version: 'Keane et al. Combat Exposure Scale; VA / CDISC public-domain construct',
    provenance: 'National Center for PTSD وCDISC يعرضان CES كأداة Public Domain. يتكون من سبعة بنود بخيارات خام 1–5 لكن تحويل كل بند إلى النقاط ليس متماثلًا، ويبلغ المجموع الموزون 0–41.',
    rightsNotice: 'الأداة الأصلية Public Domain. عناوين البنود العربية هنا وصف تشغيلي للمفهوم وليست ترجمة عربية محققة من دراسة بعينها؛ يجب استخدام صياغة لغوية محققة إذا كان الهدف قياسًا عربيًا معياريًا.',
    intendedUseAr: 'تقدير مقدار التعرض لخبرات قتالية لدى العسكريين/المحاربين لأغراض البحث أو التقييم السياقي، وليس تشخيص PTSD أو تقدير الخطورة الفردية.',
    respondentFields: ['الاسم/الرمز', 'فترة الخدمة/الصراع المقصودة', 'البلد/المهمة', 'تاريخ التطبيق', 'المطبق', 'لغة/نسخة النموذج'],
    preflightChecks: [
      'اشرح أن الأسئلة تتناول خبرات قتال وقد تكون مزعجة، وأن للمشارك حق التوقف أو عدم الإجابة ضمن حدود البروتوكول.',
      'استخدم مرساة الاستجابة الرسمية لكل بند؛ لا تفترض أن معنى 1–5 واحد عبر البنود السبعة.',
      'لا تطلب تفاصيل عملياتية حساسة أو معلومات شخصية غير لازمة للقياس.',
      'أي إفصاح عن خطر حالي أو انتحار/عنف يحتاج مسار سلامة مستقلًا ولا ينتظر الدرجة.',
    ],
    sections: [
      {
        titleAr: 'الاستجابات الخام السبعة',
        instructionsAr: 'اقرأ نص ومرساة كل بند من النموذج الرسمي/النسخة المحققة ثم سجّل الرمز الخام 1–5 هنا.',
        items: [
          { code: 'CES-1', labelAr: 'بند 1 — تكرار المشاركة في مواجهات/قتال مباشر', type: 'choice', options: raw15 },
          { code: 'CES-2', labelAr: 'بند 2 — التعرض لإطلاق نار/خطر من قوات معادية', type: 'choice', options: raw15 },
          { code: 'CES-3', labelAr: 'بند 3 — التعرض لمحاصرة/تطويق أو خطر قتالي مماثل وفق الصياغة الرسمية', type: 'choice', options: raw15 },
          { code: 'CES-4', labelAr: 'بند 4 — نسبة/عدد أفراد الوحدة المتأثرين بإصابة أو وفاة وفق النموذج', type: 'choice', options: raw15 },
          { code: 'CES-5', labelAr: 'بند 5 — تكرار إطلاق النار على العدو/الاشتباك وفق الصياغة الرسمية', type: 'choice', options: raw15 },
          { code: 'CES-6', labelAr: 'بند 6 — تكرار وجود الفرد في خطر الموت أو الإصابة أثناء القتال', type: 'choice', options: raw15 },
          { code: 'CES-7', labelAr: 'بند 7 — مدة/تواتر العمل تحت ظروف قتالية شديدة وفق النموذج', type: 'choice', options: raw15 },
        ],
      },
      {
        titleAr: 'النقاط المحولة والنتيجة',
        items: [
          { code: 'CES-S1', labelAr: 'نقاط البند 1 = (raw−1)×2', type: 'number', min: 0, max: 8 },
          { code: 'CES-S2', labelAr: 'نقاط البند 2 = raw−1', type: 'number', min: 0, max: 4 },
          { code: 'CES-S3', labelAr: 'نقاط البند 3: raw 1–4 → (raw−1)×2؛ raw 5 → (raw−2)×2', type: 'number', min: 0, max: 6 },
          { code: 'CES-S4', labelAr: 'نقاط البند 4: raw 1–4 → raw−1؛ raw 5 → raw−2', type: 'number', min: 0, max: 3 },
          { code: 'CES-S5', labelAr: 'نقاط البند 5 = raw−1', type: 'number', min: 0, max: 4 },
          { code: 'CES-S6', labelAr: 'نقاط البند 6 = (raw−1)×2', type: 'number', min: 0, max: 8 },
          { code: 'CES-S7', labelAr: 'نقاط البند 7 = (raw−1)×2', type: 'number', min: 0, max: 8 },
          { code: 'CES-TOTAL', labelAr: 'المجموع الموزون', type: 'number', min: 0, max: 41, unit: '0–41' },
          { code: 'CES-BAND', labelAr: 'فئة التعرض', type: 'choice', options: [
            { labelAr: '0–8 — Light / خفيف', value: 'light' },
            { labelAr: '9–16 — Light–moderate / خفيف إلى متوسط', value: 'light-moderate' },
            { labelAr: '17–24 — Moderate / متوسط', value: 'moderate' },
            { labelAr: '25–32 — Moderate–heavy / متوسط إلى مرتفع', value: 'moderate-heavy' },
            { labelAr: '33–41 — Heavy / مرتفع', value: 'heavy' },
          ] },
        ],
      },
    ],
    scoringSteps: [
      'حوّل الاستجابات الخام وفق أوزان البنود السبعة الموثقة؛ لا تجمع raw 1–5 مباشرة.',
      'اجمع CES-S1…CES-S7 للحصول على 0–41.',
      'صنف المجموع: 0–8 خفيف، 9–16 خفيف–متوسط، 17–24 متوسط، 25–32 متوسط–مرتفع، 33–41 مرتفع.',
      'احتفظ بالاستجابات الخام والنسخة/اللغة المستخدمة كي تبقى النتيجة قابلة للتدقيق.',
    ],
    interpretationGuardrails: [
      'CES يقيس التعرض القتالي، لا أعراض PTSD ولا تشخيصه.',
      'الدرجة الأعلى لا تعني تلقائيًا مرضًا نفسيًا ولا تتنبأ بسلوك عنيف.',
      'التجارب القتالية والسياق الثقافي/العسكري تختلف؛ لا تستخدم الفئات للحكم على استحقاق خدمة أو تعويض بلا إطار مناسب.',
    ],
    stopRules: ['أوقف/عدّل التطبيق عند ضيق شديد أو طلب المشارك التوقف، وفعّل مسار السلامة عند وجود خطر حالي.'],
    officialDownloads: [
      { label: 'VA National Center for PTSD — Combat Exposure Scale', url: CES_VA, language: 'en', publisher: 'U.S. Department of Veterans Affairs' },
      { label: 'CDISC QRS — CES Public Domain status', url: CDISC_ALL, language: 'en', publisher: 'CDISC' },
    ],
    sourceUrls: [CES_VA, CDISC_ALL],
    lastVerifiedOn: '2026-09-06',
  },

  'deployment-risk-resilience-inventory-2': {
    slug: 'deployment-risk-resilience-inventory-2',
    kind: 'protocol-sheet',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'DRRI‑2 — سجل المقاييس السبعة عشر دون مجموع كلي مصطنع',
    titleEn: 'Deployment Risk and Resilience Inventory-2 — 17-scale operational registry',
    version: 'DRRI-2 (2012 family) / CDISC QS v1.0 released 29 Jun 2021',
    provenance: 'DRRI-2 حزمة من 17 مقياسًا منفصلًا تغطي ما قبل الانتشار وأثناءه وما بعده. CDISC يصنف DRRI-2 كـPublic Domain، وVA يوفر المقاييس والدليل. لا يوجد مبرر لجمع المقاييس السبعة عشر في “درجة DRRI-2 كلية” واحدة.',
    rightsNotice: 'DRRI-2 Public Domain وفق CDISC/VA، لكن ترجمة عربية أو مواد تطبيق مشتقة يجب تثبيتها لغويًا. لا تعيد هذه الورقة طباعة البنود الحساسة كاملة؛ تربط بالنماذج الرسمية وتسجل مخرجات المقاييس.',
    intendedUseAr: 'تنظيم تطبيق المقاييس المطلوبة من DRRI-2 وتوثيق نتائجها على مستوى كل بناء على حدة، مع تقليل جمع البيانات الحساسة غير اللازمة والحفاظ على مسار دعم عند الضيق.',
    respondentFields: ['الاسم/الرمز', 'فترة/مهمة الانتشار المقصودة', 'مرحلة التقييم pre/deployment/post', 'لغة النسخة', 'تاريخ التطبيق', 'المطبق', 'مكان حفظ البيانات وصلاحيات الوصول'],
    preflightChecks: [
      'حدد المقاييس اللازمة للسؤال السريري/البحثي مسبقًا؛ لا تطبق 17 مقياسًا تلقائيًا لمجرد توفرها.',
      'وضح للمشارك طبيعة الأسئلة الحساسة وحق التوقف/التخطي وفق البروتوكول، خصوصًا القتال والفقد والتحرش والتعرضات.',
      'استخدم النسخة الرسمية/المحققة لكل scale وخوارزمية تسجيله؛ المقاييس تختلف في عدد البنود واتجاه الدرجات.',
      'لا تطلب تفاصيل عسكرية تشغيلية أو هوية أشخاص لا يحتاجها القياس.',
      'أي خطر حالي أو عنف أو انتحار أو اعتداء مستمر يحتاج استجابة سلامة مستقلة عن درجات DRRI-2.',
    ],
    sections: [
      {
        titleAr: 'حالة التطبيق والدرجات الرسمية للمقاييس السبعة عشر',
        instructionsAr: 'لكل مقياس، سجل النتيجة الرسمية بعد تطبيق النموذج ودليله. لا تجمع هذه النتائج إلى مجموع واحد.',
        items: drri2Scales.flatMap(([code, labelAr, phase]) => [
          { code: `${code}-STATUS`, labelAr: `${labelAr} — حالة التطبيق (${phase})`, type: 'choice' as const, options: [
            { labelAr: 'تم التطبيق', value: 'completed' },
            { labelAr: 'غير مطبق', value: 'not-administered' },
            { labelAr: 'بدأ ولم يكتمل', value: 'incomplete' },
            { labelAr: 'غير صالح للتسجيل', value: 'invalid' },
          ] },
          { code: `${code}-SCORE`, labelAr: `${labelAr} — الدرجة/المخرج الرسمي`, type: 'number' as const, min: 0 },
        ]),
      },
      {
        titleAr: 'جودة وسلامة التطبيق',
        items: [
          { code: 'DRRI2-SCALES-COMPLETED', labelAr: 'عدد المقاييس المكتملة من 17', type: 'number', min: 0, max: 17 },
          { code: 'DRRI2-STOPPED-DISTRESS', labelAr: 'هل أوقف/علّق أي مقياس بسبب ضيق أو طلب المشارك؟', type: 'choice', options: yesNoUnknown },
          { code: 'DRRI2-SAFETY-ACTION', labelAr: 'إجراء سلامة/إحالة اتخذ عند الحاجة', type: 'text' },
          { code: 'DRRI2-NO-GRAND-TOTAL', labelAr: 'تأكيد: لم يُحسب مجموع كلي عبر المقاييس السبعة عشر', type: 'checkbox' },
        ],
      },
    ],
    scoringSteps: [
      'طبّق وسجّل كل scale مختار وفق دليله؛ لا تفترض أن اتجاه أو مدى الدرجات متطابق بين المقاييس.',
      'احفظ المخرج الخاص بكل scale باسمه ومرحلته (predeployment/deployment/postdeployment).',
      'لا تحسب grand total لـDRRI-2؛ السبعة عشر بناءً منفصلًا وليست بنود مقياس أحادي.',
      'يمكن استخدام Warfare Exposure Short Form عندما يحدده البروتوكول، لكنه إصدار مختصر مستقل ولا يُستنتج هنا آليًا من درجات غير مكتملة.',
    ],
    interpretationGuardrails: [
      'DRRI-2 يصف عوامل خطر ومرونة وتجارب انتشار ولا يشخص PTSD أو الاكتئاب أو اضطرابًا نفسيًا.',
      'مقاييس التحرش/القتال/التهديد لا تستخدم لتقييم المصداقية أو اللوم أو الأهلية القانونية تلقائيًا.',
      'القيم المعيارية وعتبات التفسير يجب أن تكون خاصة بالمقياس والسكان والنسخة؛ لا يوجد cut-off عالمي لـDRRI-2 ككل.',
    ],
    stopRules: ['أوقف التطبيق عند ضيق شديد أو طلب المشارك، وطبّق سياسة الحماية/السلامة المحلية عند الإفصاح عن خطر حالي.'],
    officialDownloads: [
      { label: 'VA National Center for PTSD — DRRI-2 scales and manual', url: DRRI2_VA, language: 'en', publisher: 'U.S. Department of Veterans Affairs' },
      { label: 'CDISC QRS — DRRI-2 Public Domain status', url: CDISC_ALL, language: 'en', publisher: 'CDISC' },
    ],
    sourceUrls: [DRRI2_VA, CDISC_ALL, 'https://pubmed.ncbi.nlm.nih.gov/23088702/'],
    lastVerifiedOn: '2026-09-06',
  },

  'expanded-drs-postacute-interview-survivor': drsPiMaterial('survivor'),
  'expanded-drs-postacute-interview-caregiver': drsPiMaterial('caregiver'),
};
