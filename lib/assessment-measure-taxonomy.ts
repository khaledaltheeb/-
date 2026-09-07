import type { AssessmentMeasure } from '@/lib/assessment-measures';

export type MeasurementObjectKind =
  | 'prom'
  | 'clinro'
  | 'perfo'
  | 'obsro'
  | 'mixed'
  | 'clinical-classification'
  | 'composite-index'
  | 'other';

export type MeasurementUseTag =
  | 'screening'
  | 'risk-estimation'
  | 'outcome-monitoring'
  | 'functional-assessment'
  | 'symptom-severity'
  | 'neuropsychological'
  | 'rehabilitation'
  | 'research-outcome';

export type AdministrationFormatTag =
  | 'self-completed'
  | 'interviewer-administered'
  | 'structured-interview'
  | 'clinician-observation'
  | 'caregiver-observation'
  | 'performance-task';

export type MeasurementTaxonomy = {
  kind: MeasurementObjectKind;
  kindLabel: string;
  coaType: 'PRO' | 'ClinRO' | 'ObsRO' | 'PerfO' | null;
  useTags: MeasurementUseTag[];
  useLabels: string[];
  administrationTags: AdministrationFormatTag[];
  administrationLabels: string[];
  rationale: string;
  reviewMode: 'explicit-override' | 'semantic-contract';
};

type ExplicitTaxonomyDecision = { kind: MeasurementObjectKind; rationale: string };

const kindLabels: Record<MeasurementObjectKind, string> = {
  prom: 'PRO / PROM — تقرير مباشر من المريض أو المشارك',
  clinro: 'ClinRO — تقييم يقرره مختص بعد الملاحظة',
  perfo: 'PerfO — أداء مهمة معيارية مباشرة',
  obsro: 'ObsRO — تقرير مراقب غير المريض وغير المختص المعالج',
  mixed: 'أداة متعددة المصادر/الأنواع — لا تُختزل في COA واحد',
  'clinical-classification': 'تصنيف أو مرحلة سريرية — ليس نوع COA مستقلًا بحد ذاته',
  'composite-index': 'مؤشر أو درجة مركبة — نوع بنية حسابية يحتاج تحديد مصادر مكوناته',
  other: 'أداة قياس خارج التصنيف الحالي — تتطلب مراجعة صريحة قبل اعتماد النوع',
};

const useLabels: Record<MeasurementUseTag, string> = {
  screening: 'فحص/فرز أولي',
  'risk-estimation': 'تقدير خطر',
  'outcome-monitoring': 'متابعة نتائج/تغير',
  'functional-assessment': 'تقييم وظيفي',
  'symptom-severity': 'شدة أعراض',
  neuropsychological: 'قياس معرفي/عصبي نفسي',
  rehabilitation: 'تأهيل',
  'research-outcome': 'مخرج بحثي',
};

const administrationLabels: Record<AdministrationFormatTag, string> = {
  'self-completed': 'استكمال ذاتي',
  'interviewer-administered': 'تطبيق بواسطة مقابل دون تغيير مصدر التقرير',
  'structured-interview': 'مقابلة منظمة/مقننة',
  'clinician-observation': 'ملاحظة/حكم سريري',
  'caregiver-observation': 'ملاحظة مقدم رعاية/مراقب',
  'performance-task': 'مهمة أداء مباشرة',
};

// Explicit, reviewed object-type decisions for every published measure in waves 1–12.
// The decision describes the measurement object/source, not whether the measure is validated,
// FDA-qualified, suitable for a specific population, or legally reusable in a given context.
const explicitKindOverrides: Record<string, ExplicitTaxonomyDecision> = {
  '10-meter-walk-test': { kind: 'perfo', rationale: 'النتيجة مشتقة من أداء المشي المقاس مباشرة تحت بروتوكول مهمة.' },
  '6-minute-walk-test': { kind: 'perfo', rationale: 'المسافة تنتج من أداء بدني مباشر خلال مهمة زمنية معيارية.' },
  'abnormal-involuntary-movement-scale': { kind: 'clinro', rationale: 'الفاحص يلاحظ الحركات اللاإرادية ويقرر الدرجات السريرية.' },
  'alcohol-use-disorders-identification-test-consumption': { kind: 'prom', rationale: 'البنود تسجل تقرير الشخص عن استهلاك الكحول دون حكم فاحص على الإجابة.' },
  'alcohol-use-disorders-identification-test-self-report': { kind: 'prom', rationale: 'النسخة الذاتية تعتمد مباشرة على تقرير المشارك عن السلوك والعواقب.' },
  'apache-ii': { kind: 'composite-index', rationale: 'الدرجة تجمع متغيرات فسيولوجية وعمرية وحالة صحية في خوارزمية مركبة.' },
  'ascvd-pooled-cohort-equations-10-year-risk': { kind: 'composite-index', rationale: 'ناتج خطر محسوب من عدة متغيرات ديموغرافية وسريرية ومخبرية.' },
  'assign-cardiovascular-risk-score': { kind: 'composite-index', rationale: 'مؤشر خطر قلبي وعائي مشتق خوارزميًا من عدة عوامل.' },
  'atlas-cdi-score': { kind: 'composite-index', rationale: 'درجة تنبؤية مركبة تجمع متغيرات سريرية ومخبرية وليست تقريرًا أحادي المصدر.' },
  'barnes-akathisia-rating-scale': { kind: 'clinro', rationale: 'التقييم يتضمن ملاحظة سريرية وحكم الفاحص على شدة الأكاثيزيا.' },
  'berg-balance-scale': { kind: 'perfo', rationale: 'الدرجة مشتقة من أداء الشخص لمهام توازن يلاحظها المقيم وفق قواعد محددة.' },
  'bode-index': { kind: 'composite-index', rationale: 'يجمع BMI والانسداد وضيق النفس والقدرة على التمرين في مؤشر واحد.' },
  'brief-psychiatric-rating-scale-anchored': { kind: 'clinro', rationale: 'المقيم يدمج المقابلة والملاحظة ويعين درجات الأعراض وفق مرساة سريرية.' },
  'brooke-upper-extremity-rating-scale': { kind: 'clinical-classification', rationale: 'يصنف القدرة الوظيفية للطرف العلوي في درجات مرتبة قائمة على مستوى الأداء.' },
  'cdc-hiv-surveillance-stage-2014': { kind: 'clinical-classification', rationale: 'نظام مرحلة ترصدية يعتمد معايير سريرية/مخبرية ولا يمثل COA واحدًا.' },
  'chart-short-form': { kind: 'prom', rationale: 'النسخة القصيرة تجمع معلومات المشاركة/الاستقلال من تقرير الشخص أو مقابلة تسجل تقريره.' },
  'child-pugh-classification': { kind: 'composite-index', rationale: 'يجمع مؤشرات مخبرية وأحكامًا سريرية ثم يحولها إلى مجموع وفئة؛ لذلك هو بنية مركبة.' },
  'clinical-global-impression': { kind: 'clinro', rationale: 'الانطباع العالمي يقرره المختص سريريًا بعد تقييم الحالة.' },
  'combat-exposure-scale': { kind: 'prom', rationale: 'يقيس التعرض القتالي من خلال تقرير الشخص عن خبراته.' },
  'controlled-oral-word-association-test': { kind: 'perfo', rationale: 'النتيجة تعتمد على إنتاج كلمات خلال مهمة معرفية محددة الزمن/القواعد.' },
  'covi-anxiety-scale': { kind: 'clinro', rationale: 'مقياس قلق يقدره الفاحص سريريًا عبر المقابلة والملاحظة.' },
  'crohns-disease-activity-index-v1': { kind: 'composite-index', rationale: 'CDAI يجمع يوميات أعراض ونتائج فحص/مختبر ومتغيرات متعددة في معادلة مركبة.' },
  'deployment-risk-resilience-inventory-2': { kind: 'prom', rationale: 'مجموعة مقاييس ذاتية لتجارب الانتشار العسكري وعوامل الخطر والمرونة.' },
  'disability-rating-scale': { kind: 'clinro', rationale: 'المقيم يحدد درجات الوعي والاعتماد والوظيفة بعد إصابة الدماغ من معلومات التقييم.' },
  'disease-steps': { kind: 'clinical-classification', rationale: 'يصنف الإعاقة المرتبطة بالتصلب المتعدد ضمن درجات وظيفية مرتبة.' },
  'eastern-cooperative-oncology-group-performance-status': { kind: 'clinical-classification', rationale: 'ECOG PS فئات مرتبة للحالة الوظيفية وليس مقياس COA أحادي المصدر بالمعنى الصارم.' },
  'expanded-disability-status-scale': { kind: 'clinro', rationale: 'EDSS يقرره فاحص بعد فحص عصبي ودمج نظم وظيفية وقواعد تسجيل.' },
  'expanded-drs-postacute-interview-caregiver': { kind: 'obsro', rationale: 'مصدر التقرير مقدم الرعاية عن أداء الناجي في البيئة بعد الحادة.' },
  'expanded-drs-postacute-interview-survivor': { kind: 'prom', rationale: 'مصدر التقرير هو الناجي نفسه في نسخة المقابلة المخصصة له.' },
  'four-stair-ascend': { kind: 'perfo', rationale: 'القياس قائم على أداء صعود الدرج مباشرة تحت بروتوكول محدد.' },
  'four-stair-descend': { kind: 'perfo', rationale: 'القياس قائم على أداء نزول الدرج مباشرة تحت بروتوكول محدد.' },
  'framingham-cvd-10-year-risk': { kind: 'composite-index', rationale: 'خطر عشر سنوات يحسب من مجموعة عوامل ضمن معادلة تنبؤية.' },
  'general-clinical-global-impression': { kind: 'mixed', rationale: 'بنية GCGI للألم تتضمن أحكامًا عالمية متعددة قد تختلف جهة التقرير بينها؛ لا تختزل بأمان في COA واحد.' },
  'generalized-anxiety-disorder-2': { kind: 'prom', rationale: 'بندان من تقرير الشخص عن تكرار أعراض القلق.' },
  'generalized-anxiety-disorder-7': { kind: 'prom', rationale: 'GAD-7 تقرير مباشر من الشخص عن تكرار الأعراض خلال فترة مرجعية.' },
  'geriatric-depression-scale': { kind: 'prom', rationale: 'الإجابات تعكس تقرير الشخص عن الخبرة المزاجية والأعراض.' },
  'glasgow-coma-scale-ninds': { kind: 'clinro', rationale: 'الفاحص يلاحظ استجابات العين والكلام والحركة ويعين الدرجات.' },
  'glasgow-outcome-scale-extended': { kind: 'clinical-classification', rationale: 'GOSE ينتهي إلى واحدة من ثماني فئات مآل مرتبة عبر قواعد مقابلة منظمة.' },
  'hamilton-anxiety-rating-scale': { kind: 'clinro', rationale: 'HAM-A مقياس يقدره المختص بعد مقابلة وتقييم سريري.' },
  'hamilton-depression-rating-scale-17': { kind: 'clinro', rationale: 'HAM-D-17 يعتمد تقدير الفاحص للأعراض عبر مقابلة سريرية.' },
  'hamilton-depression-rating-scale-24': { kind: 'clinro', rationale: 'HAM-D-24 يعتمد تقدير الفاحص للأعراض عبر مقابلة سريرية.' },
  'harvey-bradshaw-index': { kind: 'composite-index', rationale: 'HBI يجمع عدة مكونات للأعراض والفحص في درجة نشاط واحدة.' },
  'heaviness-of-smoking-index': { kind: 'composite-index', rationale: 'HSI يحسب من عنصرين سلوكيين في درجة مركبة لا من بند نتيجة منفرد.' },
  'international-physical-activity-questionnaire-long-form': { kind: 'prom', rationale: 'النشاط البدني يبلغه الشخص ذاتيًا عبر مجالات وفترات محددة.' },
  'international-physical-activity-questionnaire-short-form-self-administered': { kind: 'prom', rationale: 'نسخة ذاتية صريحة تعتمد تقرير المشارك عن نشاطه البدني.' },
  'jfk-coma-recovery-scale-revised': { kind: 'clinro', rationale: 'المختص يطبق منبهات معيارية ويقرر أفضل الاستجابات السلوكية في مجالات متعددة.' },
  'karnofsky-performance-scale': { kind: 'clinical-classification', rationale: 'KPS يصنف الحالة الوظيفية إلى مستويات مئوية وصفية مرتبة.' },
  'kdigo-acute-kidney-injury-stage': { kind: 'clinical-classification', rationale: 'مرحلة AKI تحدد من معايير الكرياتينين/إدرار البول ضمن نظام تصنيف سريري.' },
  'kurtzke-functional-systems-score': { kind: 'clinro', rationale: 'الفاحص العصبي يحدد درجات النظم الوظيفية من نتائج الفحص.' },
  'life-events-checklist-dsm5-standard': { kind: 'prom', rationale: 'المشارك يبلغ بنفسه عن أنواع التعرض للأحداث الصادمة.' },
  'mayo-portland-adaptability-inventory-4': { kind: 'mixed', rationale: 'MPAI-4 له صيغ/مصادر متعددة تشمل الشخص والآخرين/المختص؛ لا يصح اختزاله في مصدر COA واحد.' },
  'minnesota-tobacco-withdrawal-scale-revised': { kind: 'prom', rationale: 'أعراض الانسحاب تسجل من تقرير الشخص في الاستخدام الذاتي المعتاد.' },
  'model-for-end-stage-liver-disease': { kind: 'composite-index', rationale: 'MELD ناتج معادلة من قيم مخبرية/سريرية متعددة.' },
  'modified-medical-research-council-dyspnea-scale': { kind: 'prom', rationale: 'الدرجة تعكس وصف الشخص لحد النشاط الذي يسبب ضيق النفس.' },
  'modified-rankin-scale': { kind: 'clinical-classification', rationale: 'mRS فئات مرتبة للعجز/الاعتماد تُسند وفق قواعد تقييم.' },
  'modified-van-assche-index': { kind: 'clinro', rationale: 'مؤشرات التصوير بالرنين تقيم وتُسجل بواسطة قارئ/مختص من الصور.' },
  'observer-global-impression': { kind: 'obsro', rationale: 'مصدر الانطباع العالمي مراقب غير المريض، لذا يصنف كتقرير مراقب.' },
  'pain-intensity-cdisc': { kind: 'prom', rationale: 'شدة الألم خبرة لا تُلاحظ مباشرة وتأتي من تقرير الشخص.' },
  'pain-relief-cdisc': { kind: 'prom', rationale: 'الإحساس بتخفف الألم يبلغه الشخص مباشرة.' },
  'patient-determined-disease-steps': { kind: 'prom', rationale: 'PDDS صمم كتصنيف ذاتي يختاره الشخص لوصف إعاقته المرتبطة بالتصلب المتعدد.' },
  'patient-global-impression': { kind: 'prom', rationale: 'المريض نفسه يقدم الحكم العالمي عن حالته/تغيره.' },
  'patient-health-questionnaire-15': { kind: 'prom', rationale: 'PHQ-15 تقرير ذاتي عن إزعاج الأعراض الجسدية.' },
  'patient-health-questionnaire-2': { kind: 'prom', rationale: 'PHQ-2 تقرير مباشر عن تكرار عرضي الاكتئاب الأساسيين.' },
  'patient-health-questionnaire-9': { kind: 'prom', rationale: 'PHQ-9 تقرير مباشر عن تكرار أعراض الاكتئاب خلال أسبوعين.' },
  'psoriasis-area-severity-index-fredriksson': { kind: 'clinro', rationale: 'PASI يعتمد تقدير الفاحص لمساحة وشدة علامات الصدفية ثم حسابها.' },
  'ptsd-checklist-for-dsm5': { kind: 'prom', rationale: 'PCL-5 تقرير ذاتي عن شدة أعراض PTSD خلال فترة مرجعية.' },
  'rey-auditory-verbal-learning-test': { kind: 'perfo', rationale: 'النتيجة تنتج من أداء تذكر/تعلم قائمة كلمات تحت إجراءات اختبار.' },
  'rising-from-floor': { kind: 'perfo', rationale: 'القياس ينتج من أداء الانتقال من الأرض مباشرة.' },
  'rivermead-post-concussion-questionnaire': { kind: 'prom', rationale: 'الشخص يبلغ شدة أعراض ما بعد الارتجاج مقارنة بما قبل الإصابة.' },
  'rockport-one-mile-walk-test': { kind: 'perfo', rationale: 'النتيجة تعتمد على أداء مشي ميل وقياسات زمن/نبض ضمن مهمة مباشرة.' },
  'roland-morris-disability-questionnaire': { kind: 'prom', rationale: 'الشخص يحدد عبارات العجز المرتبط بألم الظهر التي تنطبق عليه.' },
  'roland-morris-disability-questionnaire-24': { kind: 'prom', rationale: 'نسخة 24 بندًا من تقرير الشخص عن العجز المرتبط بألم الظهر.' },
  'rutgeerts-score': { kind: 'clinro', rationale: 'الدرجة يحددها قارئ/مختص من المظهر التنظيري بعد الجراحة.' },
  'satisfaction-with-life-scale': { kind: 'prom', rationale: 'الحكم على الرضا عن الحياة يأتي مباشرة من الشخص.' },
  'simple-endoscopic-score-crohns-disease-v1': { kind: 'clinro', rationale: 'SES-CD يسجله قارئ التنظير من خصائص مخاطية مرئية ثم يجمع المجالات.' },
  'sofa-27mar2024': { kind: 'composite-index', rationale: 'SOFA يجمع ستة أنظمة أعضاء من قيم سريرية ومخبرية في درجة مركبة.' },
  'tanner-scale-boy': { kind: 'clinro', rationale: 'مرحلة النضج الجسدي تسجل من تقييم الخصائص البدنية بواسطة فاحص عند التطبيق السريري.' },
  'tanner-scale-girl': { kind: 'clinro', rationale: 'مرحلة النضج الجسدي تسجل من تقييم الخصائص البدنية بواسطة فاحص عند التطبيق السريري.' },
  'timed-up-and-go': { kind: 'perfo', rationale: 'النتيجة زمن أداء سلسلة حركية مباشرة وفق بروتوكول TUG.' },
  'valg-small-cell-lung-cancer-staging': { kind: 'clinical-classification', rationale: 'VALG نظام مرحلة مرضية بفئتين سريريتين وليس COA منفردًا.' },
  'vignos-lower-extremity-rating-scale': { kind: 'clinical-classification', rationale: 'Vignos يصنف القدرة الحركية للطرف السفلي في درجات وظيفية مرتبة.' },
  'visual-function-questionnaire-25': { kind: 'prom', rationale: 'VFQ-25 يقيس أثر الرؤية ووظائفها من تقرير المريض.' },
  'west-haven-hepatic-encephalopathy-grade': { kind: 'clinical-classification', rationale: 'West Haven يصنف شدة الاعتلال الدماغي الكبدي إلى درجات سريرية مرتبة.' },
};

function normalizedText(measure: AssessmentMeasure) {
  return [measure.nameAr, measure.nameEn, measure.version, measure.summary, measure.purpose, measure.construct, measure.administrationMode, measure.scoring, measure.interpretation, ...measure.categories, ...measure.populations, ...measure.settings].join(' ').toLowerCase();
}

function semanticKind(measure: AssessmentMeasure): MeasurementObjectKind {
  const text = normalizedText(measure);
  const administration = measure.administrationMode.toLowerCase();
  if (/تقرير ذاتي|self[- ]?report|patient[- ]reported|participant[- ]reported/.test(administration + ' ' + text)) return 'prom';
  if (/مقدم الرعاية|caregiver|proxy|observer[- ]reported|parent[- ]reported/.test(administration)) return 'obsro';
  if (/اختبار أداء|أداء مباشر|performance test|walk test|مهمة أداء|standardized task/.test(text)) return 'perfo';
  if (/بواسطة فاحص|المقيم|clinician|فحص سريري|تقييم سريري|clinical observation/.test(administration)) return 'clinro';
  if (/تصنيف|مرحلة سريرية|فئات المآل|performance status|classification|staging/.test(text)) return 'clinical-classification';
  if (/مؤشر|index|درجة مركبة|composite|risk score/.test(text)) return 'composite-index';
  return 'other';
}

function semanticUseTags(measure: AssessmentMeasure): MeasurementUseTag[] {
  const text = normalizedText(measure);
  const tags = new Set<MeasurementUseTag>();
  if (/فحص أولي|فرز|screening|screen/.test(text)) tags.add('screening');
  if (/خطر|risk|سقوط/.test(text)) tags.add('risk-estimation');
  if (/متابعة|تغير|نتائج|outcome|response/.test(text)) tags.add('outcome-monitoring');
  if (/وظيف|استقلال|مشاركة|function|disability|mobility/.test(text)) tags.add('functional-assessment');
  if (/أعراض|شدة|severity|symptom/.test(text)) tags.add('symptom-severity');
  if (/معرف|ذاكر|انتباه|تنفيذي|neuropsych|cognitive/.test(text)) tags.add('neuropsychological');
  if (/تأهيل|rehabilitation/.test(text)) tags.add('rehabilitation');
  if (/بحث|دراسة|تجارب|research|trial/.test(text)) tags.add('research-outcome');
  return [...tags];
}

function semanticAdministrationTags(measure: AssessmentMeasure): AdministrationFormatTag[] {
  const administration = measure.administrationMode.toLowerCase();
  const tags = new Set<AdministrationFormatTag>();
  if (/تقرير ذاتي|self[- ]?report|يملؤها|يجيب بنفسه/.test(administration)) tags.add('self-completed');
  if (/مقابلة|interviewer[- ]administered|administered by interviewer/.test(administration)) tags.add('interviewer-administered');
  if (/مقابلة منظمة|مقابلة مقننة|structured interview/.test(administration)) tags.add('structured-interview');
  if (/clinician|فاحص|المقيم|فحص سريري|ملاحظة سريرية/.test(administration)) tags.add('clinician-observation');
  if (/caregiver|proxy|observer|مقدم الرعاية|الوالد|الأهل/.test(administration)) tags.add('caregiver-observation');
  if (/اختبار أداء|مهمة|walk|performance|زمن|مسافة/.test(administration)) tags.add('performance-task');
  return [...tags];
}

function coaTypeFor(kind: MeasurementObjectKind): MeasurementTaxonomy['coaType'] {
  if (kind === 'prom') return 'PRO';
  if (kind === 'clinro') return 'ClinRO';
  if (kind === 'obsro') return 'ObsRO';
  if (kind === 'perfo') return 'PerfO';
  return null;
}

export function classifyAssessmentMeasure(measure: AssessmentMeasure): MeasurementTaxonomy {
  const decision = explicitKindOverrides[measure.slug];
  const kind = decision?.kind ?? semanticKind(measure);
  const useTags = semanticUseTags(measure);
  const administrationTags = semanticAdministrationTags(measure);
  return {
    kind,
    kindLabel: kindLabels[kind],
    coaType: coaTypeFor(kind),
    useTags,
    useLabels: useTags.map((tag) => useLabels[tag]),
    administrationTags,
    administrationLabels: administrationTags.map((tag) => administrationLabels[tag]),
    rationale: decision?.rationale ?? 'نوع كائن القياس مستنتج من مصدر التقرير/الملاحظة أو طبيعة مهمة الأداء؛ يلزم قرار صريح قبل اعتماد مقياس جديد.',
    reviewMode: decision ? 'explicit-override' : 'semantic-contract',
  };
}

export const measurementObjectKindLabels = kindLabels;
export const measurementUseTagLabels = useLabels;
export const measurementAdministrationLabels = administrationLabels;
