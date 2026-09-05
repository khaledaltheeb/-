import {
  arabicStatusBadge,
  assessmentMeasureCategories as assessmentMeasureCategoriesBase,
  assessmentMeasures as assessmentMeasuresWave1,
  rightsBadge,
  type AssessmentMeasure,
  type ArabicMeasureStatus,
  type MeasureRightsStatus,
} from '@/lib/assessment-measures';
import { assessmentMeasuresWave2 } from '@/lib/assessment-measures-wave2';
import { assessmentMeasuresWave3 } from '@/lib/assessment-measures-wave3';
import { assessmentMeasuresWave4 } from '@/lib/assessment-measures-wave4';
import { assessmentMeasuresWave5 } from '@/lib/assessment-measures-wave5';
import { assessmentMeasuresWave6 } from '@/lib/assessment-measures-wave6';
import { assessmentMeasuresWave7 } from '@/lib/assessment-measures-wave7';
import { assessmentMeasuresWave8 } from '@/lib/assessment-measures-wave8';
import { assessmentMeasuresWave9 } from '@/lib/assessment-measures-wave9';
import { assessmentMeasuresWave10 } from '@/lib/assessment-measures-wave10';
import { assessmentMeasuresWave11 } from '@/lib/assessment-measures-wave11';
import { assessmentMeasureCategoriesWave4 } from '@/lib/assessment-measures-wave4-categories';
import { assessmentMeasureCategoriesWave6 } from '@/lib/assessment-measures-wave6-categories';
import { assessmentMeasureCategoriesWave7 } from '@/lib/assessment-measures-wave7-categories';
import { assessmentMeasureCategoriesWave8 } from '@/lib/assessment-measures-wave8-categories';
import { assessmentMeasureCategoriesWave9 } from '@/lib/assessment-measures-wave9-categories';
import { assessmentMeasureCategoriesWave10 } from '@/lib/assessment-measures-wave10-categories';

export type { AssessmentMeasure, ArabicMeasureStatus, MeasureRightsStatus };
export { arabicStatusBadge, rightsBadge };

export const assessmentMeasureCategories = [
  ...assessmentMeasureCategoriesBase,
  ...assessmentMeasureCategoriesWave4,
  ...assessmentMeasureCategoriesWave6,
  ...assessmentMeasureCategoriesWave7,
  ...assessmentMeasureCategoriesWave8,
  ...assessmentMeasureCategoriesWave9,
  ...assessmentMeasureCategoriesWave10,
];

const evidenceOverrides: Record<string, Partial<AssessmentMeasure>> = {
  'karnofsky-performance-scale': {
    rightsNote: 'CDISC يدرج Karnofsky Performance Scale بحالة Public Domain. كما تعرض قاعدة NIH Common Data Elements بنية السلم وقيمه، وتوثق الأدبيات أصل KPS لدى Karnofsky وBurchenal عام 1949. أي ترجمة أو مادة تدريبية لطرف ثالث تبقى منفصلة حقوقيًا.',
    sources: [
      { label: 'CDISC QRS — KPS Public Domain status', url: 'https://www.cdisc.org/standards/foundational/qrs/karnofsky-performance-scale', role: 'rights' },
      { label: 'NIH Common Data Elements — Karnofsky performance scale score', url: 'https://cde.nlm.nih.gov/deView?tinyId=XJwxoFT6L', role: 'original' },
      { label: 'PubMed — history and original reference of the Karnofsky scale', url: 'https://pubmed.ncbi.nlm.nih.gov/23239756/', role: 'evidence' },
    ],
  },
  'eastern-cooperative-oncology-group-performance-status': {
    rightsNote: 'الصفحة الرسمية لـECOG-ACRIN تنص صراحة على أن ECOG Performance Status متداول في المجال العام ومتاح للاستخدام العام، وتحدد صيغة النسبة المطلوبة عند استخدام السلم في المواد المطبوعة. CDISC يدرجه كذلك بحالة Public Domain.',
    sources: [
      { label: 'ECOG-ACRIN — official ECOG Performance Status Scale', url: 'https://ecog-acrin.org/resources/ecog-performance-status/', role: 'original' },
      { label: 'CDISC QRS — ECOG Public Domain status', url: 'https://www.cdisc.org/standards/foundational/qrs', role: 'rights' },
      { label: 'PubMed — Oken et al. 1982 ECOG criteria', url: 'https://pubmed.ncbi.nlm.nih.gov/7165009/', role: 'evidence' },
    ],
  },
  'patient-determined-disease-steps': {
    arabicStatus: 'validated-version-reported',
    arabicLabel: 'توجد نسخة عربية محققة منشورة',
    arabicNote: 'نشرت دراسة من جامعة العلوم والتكنولوجيا الأردنية ترجمة عربية للـPDDS باستخدام ترجمة أمامية وعكسية، واختبرتها لدى 115 شخصًا مصابًا بالتصلب المتعدد. أظهرت ارتباطًا قويًا مع EDSS وثبات إعادة اختبار ممتازًا. لا يعني ذلك تلقائيًا أن نص الترجمة المنشور قابل لإعادة النشر الكامل؛ تُراجع حقوق النسخة نفسها قبل عرض بنودها.',
    sources: [
      { label: 'CDISC QRS — PDDS Public Domain status', url: 'https://www.cdisc.org/standards/foundational/qrs', role: 'rights' },
      { label: 'PubMed — PDDS validation against EDSS and functional outcomes (2013)', url: 'https://pubmed.ncbi.nlm.nih.gov/23617555/', role: 'evidence' },
      { label: 'PubMed — Arabic PDDS translation and validation in Jordan', url: 'https://pubmed.ncbi.nlm.nih.gov/33153361/', role: 'translation' },
      { label: 'PubMed — PDDS validation in ambulatory older adults with MS (2025)', url: 'https://pubmed.ncbi.nlm.nih.gov/40117985/', role: 'evidence' },
    ],
  },
  'glasgow-outcome-scale-extended': {
    nameAr: 'مقياس غلاسكو الموسع للمآل',
    nameEn: 'Extended Glasgow Outcome Scale',
    acronym: 'GOSE',
    version: '8-category structured outcome scale',
    summary: 'مقياس عالمي من ثماني فئات لتوصيف المآل الوظيفي بعد إصابة الدماغ، ويكون أكثر موثوقية عندما يطبق عبر مقابلة منظمة وتعليمات تسجيل ثابتة.',
    purpose: 'توصيف المآل العام بعد إصابة الدماغ الرضّية ومتابعة التعافي أو استخدامه كمخرج في الدراسات السريرية.',
    construct: 'المآل الوظيفي العام والاستقلال بعد إصابة الدماغ',
    populations: ['الأشخاص بعد إصابة دماغ رضّية', 'سياقات أبحاث إصابات الدماغ والمتابعة العصبية التأهيلية'],
    settings: ['جراحة الأعصاب', 'التأهيل العصبي', 'عيادات إصابات الدماغ', 'البحوث السريرية'],
    categories: ['brain-injury', 'neurological-outcomes', 'rehabilitation-outcomes'],
    administrationMode: 'مقابلة منظمة مع الشخص و/أو مقدم الرعاية وفق دليل GOSE، ثم تعيين واحدة من ثماني فئات للمآل.',
    administrationTime: 'عادة عدة دقائق إلى نحو 15 دقيقة بحسب تعقيد الحالة وتوفر مخبر مناسب.',
    equipment: ['دليل المقابلة المنظمة للنسخة المستخدمة', 'معلومات موثوقة عن الاستقلال والأنشطة قبل الإصابة وبعدها'],
    scoring: 'تصنف النتيجة على ثماني درجات مرتبة من الوفاة إلى التعافي الجيد الأعلى. يجب استخدام المقابلة المنظمة وتعريفات الفئات نفسها وعدم استنتاج الدرجة من GCS أو من وصف موجز غير كافٍ.',
    interpretation: 'GOSE مقياس مآل رتبي عالمي؛ الدرجة الأعلى تعكس استقلالًا ومآلًا أفضل، لكنها لا تصف كل جوانب الإدراك أو المشاركة أو جودة الحياة.',
    limitations: ['يتأثر بالتدريب وطريقة المقابلة ومصدر المعلومات.', 'قد يحدث اختلاف بين المقيمين إذا لم تستخدم مقابلة منظمة.', 'لا يلتقط جميع العجز المعرفي أو النفسي الدقيق.', 'العلاقة بين فئات GOSE ليست فواصل كمية متساوية.'],
    administrationSteps: ['ثبت نسخة ودليل GOSE المستخدمين.', 'اجمع معلومات الاستقلال والأنشطة والعمل والعلاقات الاجتماعية وفق المقابلة المنظمة.', 'استوضح الفروق بين القيود الناتجة عن إصابة الدماغ وبين الحالات السابقة.', 'عيّن الفئة وفق قواعد الدليل لا بالانطباع الحر.', 'وثق مصدر المعلومات وأي عدم يقين.'],
    safetyNotes: ['GOSE ليس أداة فرز طارئ ولا يحدد وحده الأهلية للعلاج أو التأهيل.', 'لا تستخدم انخفاض الدرجة لتبرير سحب علاج أو حرمان من خدمات تأهيلية.', 'المآل الفردي يحتاج تقييمًا عصبيًا وتأهيليًا متعدد الأبعاد.'],
    rightsStatus: 'public-domain',
    rightsLabel: 'Public Domain — موثق في CDISC QRS',
    rightsNote: 'CDISC يدرج Extended Glasgow Outcome Scale بحالة Public Domain. تبقى المواد التدريبية أو الترجمات المنشورة من جهات أخرى مستقلة حقوقيًا.',
    rightsVerifiedOn: '2026-09-05',
    arabicStatus: 'validated-version-reported',
    arabicLabel: 'توجد ترجمة عربية/مغاربية مدروسة للمقابلة المنظمة',
    arabicNote: 'نشرت دراسة 2025 تقييمًا لترجمة المقابلة المنظمة لـGOSE لدى 123 مريضًا بإصابة دماغية في المغرب وأظهرت اتفاقًا مرتفعًا بين المقيمين. هذا دليل سياقي مهم لكنه لا يثبت تلقائيًا تكافؤ كل صياغة عربية أو حق إعادة نشر نص الترجمة.',
    fullArabicFormPublished: false,
    fullArabicFormNote: 'لا ننشر نص مقابلة عربية كاملًا قبل مراجعة النسخة المنشورة وحقوقها ومطابقة المصطلحات.',
    sources: [
      { label: 'CDISC QRS — GOSE Public Domain status', url: 'https://www.cdisc.org/standards/foundational/qrs/extended-glasgow-outcome-scale', role: 'rights' },
      { label: 'PubMed — structured GOSE interview guidelines', url: 'https://pubmed.ncbi.nlm.nih.gov/9726257/', role: 'original' },
      { label: 'PubMed — Moroccan translation/interrater reliability study (2025)', url: 'https://pubmed.ncbi.nlm.nih.gov/40021118/', role: 'translation' },
    ],
    related: ['glasgow-coma-scale-ninds', 'modified-rankin-scale', 'mayo-portland-adaptability-inventory-4', 'disability-rating-scale', 'rivermead-post-concussion-questionnaire'],
  },
  'general-clinical-global-impression': {
    nameAr: 'الانطباعات السريرية العالمية العامة للألم',
    nameEn: 'General Clinical Global Impressions — Pain',
    acronym: 'GCGI',
    version: 'GCGI v1 — ACTTION/STANDARDS pain-response questionnaire',
    summary: 'استبيان عام لتقييم الاستجابة للألم يتكون من خمسة أحكام منفصلة: شدة الألم العالمية، التحسن العالمي، حالة الألم، تفضيل علاج الألم، والتقييم العالمي لدواء الألم. وهو مختلف عن NIMH Clinical Global Impression (CGI).',
    purpose: 'توثيق الانطباع العالمي عن الألم والاستجابة للعلاج ضمن سياق يحدد المقيم وموضع الألم والفترة الزمنية ومرجع المقارنة.',
    construct: 'الانطباع العالمي عن شدة الألم وتحسنه وحالته والاستجابة للعلاج',
    populations: ['أشخاص يخضعون لتقييم الألم أو علاجه', 'المشاركون في تجارب ودراسات الألم السريرية'],
    settings: ['عيادات الألم', 'التجارب السريرية', 'البحوث الدوائية', 'المتابعة العلاجية'],
    administrationMode: 'خمسة تقييمات منفصلة على CRF؛ يمكن أن يكون المقيم SUBJECT أو INVESTIGATOR وفق البروتوكول، مع تسجيل موقع الألم والتوقيت ومرجع المقارنة.',
    administrationTime: 'دقائق قليلة عادة بعد تثبيت موضع الألم والفترة/نقطة القياس ومرجع العلاج.',
    equipment: ['نموذج GCGI v1 أو ورقة تسجيل مطابقة', 'تعريف واضح للتوقيت والمقيم ومرجع المقارنة'],
    scoring: 'لا يوجد مجموع كلي. Global Severity وGlobal Improvement يستخدمان سلمين من 7 نقاط؛ Disease Status وTreatment Preference وGlobal Rating of Pain Medication تستخدم سلالم من 4 نقاط. كل بند يفسر مستقلًا.',
    interpretation: 'الدرجات لا تكون قابلة للتفسير إلا مع معرفة من قام بالتقييم، وأين يقع الألم، والفترة الزمنية، وما هو العلاج/المرجع المقارن عند سؤال التفضيل.',
    limitations: ['ليس بديلًا عن قياس شدة الألم أو تخفيف الألم.', 'لا يوجد total score صالح عبر البنود الخمسة.', 'تشابه الاسم مع CGI قد يسبب خلطًا منهجيًا إذا لم يذكر GCGI pain v1 صراحة.', 'الترجمة العربية التشغيلية تحتاج تحققًا لغويًا/سيكومتريًا قبل اعتبارها نسخة عربية معيارية.'],
    administrationSteps: ['حدد موضع الألم.', 'حدد المقيم SUBJECT أو INVESTIGATOR.', 'ثبت نقطة/فترة القياس.', 'ثبت مرجع المقارنة في سؤال Treatment Preference.', 'سجل التقييمات الخمسة كلًا على حدة دون إنشاء مجموع كلي.'],
    safetyNotes: ['الألم الحاد الجديد أو أعراض الإنذار تتطلب تقييمًا سببيًا عاجلًا ولا تنتظر الاستبيان.', 'Not assessed ليست «لا ألم» ولا ينبغي تحويلها إلى درجة سريرية صفر.', 'لا تستخدم GCGI وحده لاتخاذ قرار علاجي أو استبعاد تقييم طبي.'],
    rightsStatus: 'public-domain',
    rightsLabel: 'Public Domain — CDISC GCGI v1',
    rightsNote: 'CDISC يصف Pain General Clinical Global Impressions v1 كاستبيان Public Domain طُوّر ضمن ACTTION/STANDARDS. البنود الخمسة ومراسيها موثقة في معيار CDISC/NCI، مع ضرورة فصل GCGI عن CGI الأصلي.',
    rightsVerifiedOn: '2026-09-06',
    sources: [
      { label: 'CDISC QRS — General Clinical Global Impressions (GCGI) v1', url: 'https://www.cdisc.org/standards/foundational/qrs', role: 'rights' },
      { label: 'NCI EVS — CDISC GCGI controlled terminology', url: 'https://evs.nci.nih.gov/ftp1/CDISC/SDTM/', role: 'original' },
    ],
    related: ['clinical-global-impression', 'pain-intensity', 'pain-relief'],
  },
};

export const assessmentMeasures: AssessmentMeasure[] = [
  ...assessmentMeasuresWave1,
  ...assessmentMeasuresWave2,
  ...assessmentMeasuresWave3,
  ...assessmentMeasuresWave4,
  ...assessmentMeasuresWave5,
  ...assessmentMeasuresWave6,
  ...assessmentMeasuresWave7,
  ...assessmentMeasuresWave8,
  ...assessmentMeasuresWave9,
  ...assessmentMeasuresWave10,
  ...assessmentMeasuresWave11,
].map((measure) => ({ ...measure, ...(evidenceOverrides[measure.slug] ?? {}) }));

export const assessmentMeasureAliases: Record<string, string> = {
  'extended-glasgow-outcome-scale': 'glasgow-outcome-scale-extended',
};

export const assessmentMeasureSlugs = assessmentMeasures.map((measure) => measure.slug);
export const assessmentMeasureRouteSlugs = [...assessmentMeasureSlugs, ...Object.keys(assessmentMeasureAliases)];

export function getCanonicalAssessmentMeasureSlug(slug: string) {
  return assessmentMeasureAliases[slug] ?? slug;
}

export function getAssessmentMeasure(slug: string) {
  const canonicalSlug = getCanonicalAssessmentMeasureSlug(slug);
  return assessmentMeasures.find((measure) => measure.slug === canonicalSlug) ?? null;
}

export function getAssessmentMeasureCategory(slug: string) {
  return assessmentMeasureCategories.find((category) => category.slug === slug) ?? null;
}

export function getMeasuresByCategory(slug: string) {
  return assessmentMeasures.filter((measure) => measure.categories.includes(slug));
}
