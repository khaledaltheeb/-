import { assessmentMeasures } from '@/lib/assessment-measures-catalog';

export type InstrumentCrosswalkRecord = {
  id: string;
  instrument: string;
  acronym: string;
  linkedCosSlugs: string[];
  rawafidStatus: 'operational-full' | 'reference-rights' | 'not-in-library';
  rawafidStatusLabel: string;
  internalPath?: string;
  rightsStatus: 'rawafid-provenance-verified' | 'owner-conditions' | 'license-or-permission-required' | 'not-reviewed';
  rightsNote: string;
  arabicEvidence: 'psychometric-context' | 'official-or-linguistic-translation' | 'related-version-only' | 'not-audited';
  arabicEvidenceLabel: string;
  arabicEvidenceNote: string;
  evidenceUrl?: string;
  evidenceCitation: string;
  lastVerified: string;
  catalogSync?: 'seed' | 'auto-promoted' | 'rights-conflict' | 'blocked-family' | 'no-exact-match' | 'ambiguous-exact-match';
  catalogMatchedSlug?: string;
  catalogSyncNote?: string;
};

const instrumentCrosswalkSeed: readonly InstrumentCrosswalkRecord[] = [
  {
    id: 'phq-9',
    instrument: 'Patient Health Questionnaire-9',
    acronym: 'PHQ-9',
    linkedCosSlugs: ['adult-depression-anxiety-ichom-standard-set', 'adult-epilepsy-ichom-standard-set'],
    rawafidStatus: 'operational-full',
    rawafidStatusLabel: 'متاح تشغيليًا في مكتبة روافد',
    internalPath: '/assessment-measures/patient-health-questionnaire-9/',
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'المكتبة التشغيلية الحالية في روافد تصنف النموذج كأساس كامل ذي provenance موثق. هذا لا يجعل كل ترجمة عربية أو كل سياق استخدام متكافئًا تلقائيًا.',
    arabicEvidence: 'psychometric-context',
    arabicEvidenceLabel: 'دليل سيكومتري عربي محدد السياق',
    arabicEvidenceNote: 'دراسة Sawaya وزملائه (2016) ترجمت وقيّمت PHQ-9 في عينة مرضى نفسيين خارجيين ناطقين بالعربية في لبنان. دعمت الثبات والبنية العاملية، مع ملاحظة أن الحساسية كانت أفضل من النوعية مقابل التشخيص السريري؛ لذلك لا نعمم العتبات بلا تقييم للسياق.',
    evidenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/27031595/',
    evidenceCitation: 'Sawaya et al., Psychiatry Research, 2016; DOI 10.1016/j.psychres.2016.03.030',
    lastVerified: '2026-09-05',
  },
  {
    id: 'gad-7',
    instrument: 'Generalized Anxiety Disorder-7',
    acronym: 'GAD-7',
    linkedCosSlugs: ['adult-depression-anxiety-ichom-standard-set'],
    rawafidStatus: 'operational-full',
    rawafidStatusLabel: 'متاح تشغيليًا في مكتبة روافد',
    internalPath: '/assessment-measures/generalized-anxiety-disorder-7/',
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'المكتبة التشغيلية الحالية في روافد تصنف GAD-7 كأساس كامل ذي provenance موثق. ملاءمة التطبيق والعتبة والنسخة العربية يجب أن تبقى مرتبطة بالمجتمع والغرض.',
    arabicEvidence: 'psychometric-context',
    arabicEvidenceLabel: 'دليل سيكومتري عربي محدد السياق',
    arabicEvidenceNote: 'دراسة Sawaya وزملائه (2016) دعمت الثبات والبنية العاملية في عينة لبنانية نفسية خارجية، لكنها وجدت أن GAD-7 لم يكن حساسًا أو نوعيًا بما يكفي لالتقاط اضطرابات القلق مقابل تشخيص الأخصائي في تلك العينة. لذلك نعرضه كدليل سياقي لا كاعتماد عربي شامل.',
    evidenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/27031595/',
    evidenceCitation: 'Sawaya et al., Psychiatry Research, 2016; DOI 10.1016/j.psychres.2016.03.030',
    lastVerified: '2026-09-05',
  },
  {
    id: 'whodas-2-12',
    instrument: 'WHO Disability Assessment Schedule 2.0 — 12 item',
    acronym: 'WHODAS 2.0-12',
    linkedCosSlugs: ['adult-depression-anxiety-ichom-standard-set'],
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف بعد إلى مكتبة روافد',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'WHO توجّه المستخدمين إلى مسار ترخيص عند إعادة إنتاج WHODAS 2.0 أو دمجه في نظام إلكتروني/سجل بيانات؛ لذلك لا ننشر النموذج لمجرد أن ترجمة عربية موجودة.',
    arabicEvidence: 'official-or-linguistic-translation',
    arabicEvidenceLabel: 'العربية متاحة رسميًا؛ التحقق السيكومتري المحلي غير محسوم هنا',
    arabicEvidenceNote: 'دليل WHO يذكر العربية ضمن اللغات المتاحة. صفحة WHO تنبه أيضًا إلى أن بعض الترجمات جاءت من شركاء وأفراد وأن WHO لا يضمن جودة كل ترجمة غير منتجة لديه. وجود النسخة اللغوية ليس بديلًا عن تحقق سيكومتري في المجتمع المقصود.',
    evidenceUrl: 'https://www.who.int/classifications/international-classification-of-functioning-disability-and-health/who-disability-assessment-schedule',
    evidenceCitation: 'World Health Organization — WHODAS 2.0 resources and licensing guidance',
    lastVerified: '2026-09-05',
  },
  {
    id: 'rcads',
    instrument: 'Revised Children’s Anxiety and Depression Scale',
    acronym: 'RCADS',
    linkedCosSlugs: ['youth-anxiety-depression-ocd-ptsd-ichom'],
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف بعد إلى مكتبة روافد',
    rightsStatus: 'not-reviewed',
    rightsNote: 'لم تكتمل مراجعة حقوق إعادة النشر/التشغيل للنسخة التي يوصي بها Standard Set داخل روافد، لذلك لا ننشر البنود أو scoring حتى تثبت النسخة وشروطها.',
    arabicEvidence: 'related-version-only',
    arabicEvidenceLabel: 'دليل عربي لنسخة RCADS-25 المختصرة، وليس إثباتًا للنسخة الكاملة',
    arabicEvidenceNote: 'Perkins وAlós (2021) طورا RCADS25-Arabic واختبراها لدى 250 طفلًا ناطقًا بالعربية في سوريا. الدراسة دعمت الثبات وبنية عاملية ملائمة، مع تفضيل عامل internalizing واحد. هذا دليل مهم لكنه لا يثبت تلقائيًا خصائص النسخة الكاملة التي قد يقصدها Standard Set.',
    evidenceUrl: 'https://pubmed.ncbi.nlm.nih.gov/34210326/',
    evidenceCitation: 'Perkins & Alós, Conflict and Health, 2021; DOI 10.1186/s13031-021-00386-1',
    lastVerified: '2026-09-05',
  },
  {
    id: 'c-ssrs-screening',
    instrument: 'Columbia-Suicide Severity Rating Scale — Screening',
    acronym: 'C-SSRS',
    linkedCosSlugs: ['youth-anxiety-depression-ocd-ptsd-ichom'],
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'موجود مرجعيًا مع قيود حقوق/مالك',
    internalPath: '/assessment-measures/rights-review/#columbia-suicide-severity-rating-scale-screening',
    rightsStatus: 'owner-conditions',
    rightsNote: 'سجل الحقوق في روافد يصنف C-SSRS Screening كأداة تحكم شروط المالك استخدامها. لا ننسخ النص أو نحول وجودها في COMS إلى إذن نشر.',
    arabicEvidence: 'official-or-linguistic-translation',
    arabicEvidenceLabel: 'ترجمات عربية خاصة بالبلد متاحة من الجهة المالكة',
    arabicEvidenceNote: 'Columbia Lighthouse Project يدرج ترجمات عربية للنسخة الكاملة لبلدان متعددة، ومنها الأردن ولبنان والسعودية وقطر والإمارات وغيرها، ويؤكد أهمية linguistic validation الخاصة بكل بلد وألا تُستبدل نسخة بلد بأخرى بلا تحقق. الحصول على النسخ يتم عبر الجهة المالكة.',
    evidenceUrl: 'https://cssrs.columbia.edu/the-columbia-scale-c-ssrs/translations/',
    evidenceCitation: 'The Columbia Lighthouse Project — C-SSRS Translations',
    lastVerified: '2026-09-05',
  },
  {
    id: 'kidscreen-10',
    instrument: 'KIDSCREEN-10',
    acronym: 'KIDSCREEN-10',
    linkedCosSlugs: ['youth-anxiety-depression-ocd-ptsd-ichom'],
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف بعد إلى مكتبة روافد',
    rightsStatus: 'not-reviewed',
    rightsNote: 'لم تُستكمل بعد مراجعة النسخة والترخيص/إعادة النشر في روافد.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم يكتمل تدقيق النسخة العربية المطابقة',
    arabicEvidenceNote: 'لا نعتبر وجود ترجمة عربية في دراسة أو موقع خارجي كافيًا حتى نثبت أن النسخة هي KIDSCREEN-10 المطلوبة وأن شروط الاستخدام والدليل السيكومتري يطابقان المجتمع المقصود.',
    evidenceCitation: 'Pending exact-version Arabic and rights audit',
    lastVerified: '2026-09-05',
  },
  {
    id: 'gad-2',
    instrument: 'Generalized Anxiety Disorder-2',
    acronym: 'GAD-2',
    linkedCosSlugs: ['adult-epilepsy-ichom-standard-set'],
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف كأداة مستقلة إلى مكتبة روافد',
    rightsStatus: 'not-reviewed',
    rightsNote: 'وجود GAD-7 في روافد لا يبرر افتراض أن GAD-2 مستوفٍ تلقائيًا لكل متطلبات التوثيق والتطبيق كنسخة مستقلة.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'الدليل العربي للنسخة ذات البندين لم يُدقق بعد',
    arabicEvidenceNote: 'دليل GAD-7 العربي لا يُنقل تلقائيًا إلى GAD-2؛ يجب توثيق أداء النسخة ذات البندين وعتبتها في المجتمع المستهدف قبل تقديمها كأداة عربية متحققة.',
    evidenceCitation: 'Pending exact GAD-2 Arabic psychometric audit',
    lastVerified: '2026-09-05',
  },
  {
    id: 'qolie-10',
    instrument: 'Quality of Life in Epilepsy-10',
    acronym: 'QOLIE-10',
    linkedCosSlugs: ['adult-epilepsy-ichom-standard-set'],
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف بعد إلى مكتبة روافد',
    rightsStatus: 'not-reviewed',
    rightsNote: 'يلزم تثبيت المصدر والإصدار وشروط الاستخدام قبل أي إعادة نشر أو تطبيق تفاعلي.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم يثبت بعد دليل عربي للنسخة الدقيقة QOLIE-10 في سجل روافد',
    arabicEvidenceNote: 'وجود دراسات عربية لإصدارات أخرى من عائلة QOLIE لا يكفي لإثبات خصائص QOLIE-10 نفسها؛ نحافظ على exact-version matching.',
    evidenceCitation: 'Pending exact-version Arabic and rights audit',
    lastVerified: '2026-09-05',
  },
  {
    id: 'promis-cognition-sleep',
    instrument: 'PROMIS Cognitive Function / Sleep Disturbance short forms',
    acronym: 'PROMIS Cognition / Sleep',
    linkedCosSlugs: ['adult-epilepsy-ichom-standard-set'],
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضافة بعد إلى مكتبة روافد',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'HealthMeasures يطلب الحصول على الترجمات عبره ويذكر أن الترجمات محمية بحقوق النشر، وأن الاستخدام الرقمي/الترجمات قد يحتاج إذنًا أو HEAP بحسب الغرض.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'توفر العربية للإصدارات الدقيقة لم يُثبت في روافد',
    arabicEvidenceNote: 'وجود نظام ترجمة رسمي في PROMIS لا يعني أن كل short form موصى بها هنا لها ترجمة عربية معتمدة. يجب الاستعلام عن الإصدار المحدد ثم تثبيت الترخيص وشهادة الترجمة.',
    evidenceUrl: 'https://www.healthmeasures.net/explore-measurement-systems/promis/obtain-administer-measures',
    evidenceCitation: 'HealthMeasures — PROMIS Obtain & Administer Measures / translations and permissions',
    lastVerified: '2026-09-05',
  },
  {
    id: 'gmfm',
    instrument: 'Gross Motor Function Measure',
    acronym: 'GMFM',
    linkedCosSlugs: ['cerebral-palsy-lower-limb-surgery'],
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف بعد إلى مكتبة روافد',
    rightsStatus: 'not-reviewed',
    rightsNote: 'يلزم تدقيق الإصدار المقصود (مثل GMFM-66/88) والمصدر وشروط الاستخدام قبل النشر؛ اسم GMFM وحده غير كافٍ.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم يكتمل تدقيق النسخة العربية والإصدار المطابق',
    arabicEvidenceNote: 'سنفصل أي دليل عربي حسب الإصدار والفئة العمرية/الوظيفية بدل جمع GMFM-66 وGMFM-88 تحت حالة تحقق واحدة.',
    evidenceCitation: 'Pending exact-version Arabic and rights audit',
    lastVerified: '2026-09-05',
  },
  {
    id: 'promis-pain-fatigue',
    instrument: 'PROMIS Pain Interference / Fatigue',
    acronym: 'PROMIS Pain / Fatigue',
    linkedCosSlugs: ['cerebral-palsy-lower-limb-surgery'],
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضافة بعد إلى مكتبة روافد',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'ترجمات PROMIS محمية ويجب طلبها من HealthMeasures؛ الاستخدام الإلكتروني خارج بعض حالات البحث غير التجاري قد يتطلب إذنًا ومراجعة تنفيذ.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'توفر/تحقق النسخ العربية الدقيقة لم يُثبت بعد',
    arabicEvidenceNote: 'لا ننقل حالة ترجمة PROMIS عامة إلى Pain Interference أو Fatigue دون تحديد short form/version واللغة والحقوق.',
    evidenceUrl: 'https://www.healthmeasures.net/explore-measurement-systems/promis/obtain-administer-measures',
    evidenceCitation: 'HealthMeasures — PROMIS translations and permission workflow',
    lastVerified: '2026-09-05',
  },
  {
    id: 'eq-5d-5l',
    instrument: 'EQ-5D-5L',
    acronym: 'EQ-5D-5L',
    linkedCosSlugs: ['musculoskeletal-rehabilitation-core-measures'],
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'موجود في سجل المقاييس المقيدة حقوقيًا',
    internalPath: '/assessment-measures/rights-review/#eq-5d-5l',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'سجل الحقوق في روافد يصنف EQ-5D-5L ضمن الأدوات التي يتطلب استخدامها ترخيصًا وفق شروط الجهة المالكة؛ لذلك نعرض المرجع لا نموذجًا منسوخًا.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم تُربط بعد نسخة عربية مرخصة ودليلها السيكومتري بهذا السجل',
    arabicEvidenceNote: 'أي نسخة عربية يجب أن تُطابق البلد/الإصدار والترخيص والدراسة ذات الصلة قبل وصفها بأنها قابلة للاستخدام في سياق معين.',
    evidenceCitation: 'Rawafid rights register + pending Arabic exact-version audit',
    lastVerified: '2026-09-05',
  },
] as const;

const normalizeAcronym = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]+/g, '');

const automaticPromotionBlockedIds = new Set([
  'rcads',
  'gmfm',
  'promis-cognition-sleep',
  'promis-pain-fatigue',
]);

const assessmentCatalogByAcronym = new Map<string, (typeof assessmentMeasures)[number][]>();
for (const measure of assessmentMeasures) {
  const key = normalizeAcronym(measure.acronym);
  if (!key) continue;
  const matches = assessmentCatalogByAcronym.get(key) ?? [];
  matches.push(measure);
  assessmentCatalogByAcronym.set(key, matches);
}

function resolveAgainstAssessmentCatalog(record: InstrumentCrosswalkRecord): InstrumentCrosswalkRecord {
  const key = normalizeAcronym(record.acronym);
  const matches = key ? (assessmentCatalogByAcronym.get(key) ?? []) : [];

  if (automaticPromotionBlockedIds.has(record.id)) {
    return {
      ...record,
      catalogSync: 'blocked-family',
      catalogSyncNote: 'التزام exact-version: هذه عائلة أو سجل متعدد الإصدارات ولا يُرقّى تلقائيًا بمجرد تطابق اسم/اختصار عام.',
    };
  }

  if (matches.length === 0) {
    return { ...record, catalogSync: 'no-exact-match' };
  }

  if (matches.length > 1) {
    return {
      ...record,
      catalogSync: 'ambiguous-exact-match',
      catalogSyncNote: `وُجد ${matches.length} تطابقات للاختصار نفسه في Catalog؛ يلزم حسم الإصدار يدويًا قبل تغيير الحالة.`,
    };
  }

  const match = matches[0];

  if (
    record.rawafidStatus === 'not-in-library' &&
    record.rightsStatus !== 'owner-conditions' &&
    record.rightsStatus !== 'license-or-permission-required'
  ) {
    return {
      ...record,
      rawafidStatus: 'operational-full',
      rawafidStatusLabel: 'متاح تشغيليًا في مكتبة روافد — مزامن تلقائيًا مع Assessment Measures Catalog',
      internalPath: `/assessment-measures/${match.slug}/`,
      rightsStatus: 'rawafid-provenance-verified',
      rightsNote: `${record.rightsNote} تمت مزامنة التوفر التشغيلي من Assessment Measures Catalog بعد تطابق اختصار فريد؛ حالة الحقوق الحالية في Catalog: ${match.rightsLabel}.`,
      catalogSync: 'auto-promoted',
      catalogMatchedSlug: match.slug,
      catalogSyncNote: 'تمت الترقية من فجوة مكتبة لأن الأداة ظهرت كتطابق acronym فريد في Catalog ذي provenance/rights موثق، دون نقل أي دليل عربي بين الإصدارات.',
    };
  }

  if (
    record.rightsStatus === 'owner-conditions' ||
    record.rightsStatus === 'license-or-permission-required'
  ) {
    return {
      ...record,
      catalogSync: 'rights-conflict',
      catalogMatchedSlug: match.slug,
      catalogSyncNote: 'يوجد تطابق في Catalog، لكن سجل COS يحمل قيود مالك/ترخيص؛ لا تُرقّى الحالة آليًا حتى تُحسم حقوق الإصدار المقصود صراحة.',
    };
  }

  return {
    ...record,
    catalogSync: 'seed',
    catalogMatchedSlug: match.slug,
    catalogSyncNote: 'التطابق التشغيلي الحالي متسق مع Assessment Measures Catalog.',
  };
}

export const instrumentCrosswalk: readonly InstrumentCrosswalkRecord[] = instrumentCrosswalkSeed.map(resolveAgainstAssessmentCatalog);

export function getInstrumentCrosswalkForCos(cosSlug: string) {
  return instrumentCrosswalk.filter((item) => item.linkedCosSlugs.includes(cosSlug));
}

export const instrumentCrosswalkStats = {
  total: instrumentCrosswalk.length,
  operationalFull: instrumentCrosswalk.filter((item) => item.rawafidStatus === 'operational-full').length,
  referenceRights: instrumentCrosswalk.filter((item) => item.rawafidStatus === 'reference-rights').length,
  notInLibrary: instrumentCrosswalk.filter((item) => item.rawafidStatus === 'not-in-library').length,
  arabicPsychometricContext: instrumentCrosswalk.filter((item) => item.arabicEvidence === 'psychometric-context').length,
  autoPromoted: instrumentCrosswalk.filter((item) => item.catalogSync === 'auto-promoted').length,
  catalogRightsConflicts: instrumentCrosswalk.filter((item) => item.catalogSync === 'rights-conflict').length,
};
