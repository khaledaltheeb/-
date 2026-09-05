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
import { assessmentMeasureCategoriesWave4 } from '@/lib/assessment-measures-wave4-categories';
import { assessmentMeasureCategoriesWave6 } from '@/lib/assessment-measures-wave6-categories';
import { assessmentMeasureCategoriesWave7 } from '@/lib/assessment-measures-wave7-categories';

export type { AssessmentMeasure, ArabicMeasureStatus, MeasureRightsStatus };
export { arabicStatusBadge, rightsBadge };

export const assessmentMeasureCategories = [
  ...assessmentMeasureCategoriesBase,
  ...assessmentMeasureCategoriesWave4,
  ...assessmentMeasureCategoriesWave6,
  ...assessmentMeasureCategoriesWave7,
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
};

export const assessmentMeasures: AssessmentMeasure[] = [
  ...assessmentMeasuresWave1,
  ...assessmentMeasuresWave2,
  ...assessmentMeasuresWave3,
  ...assessmentMeasuresWave4,
  ...assessmentMeasuresWave5,
  ...assessmentMeasuresWave6,
  ...assessmentMeasuresWave7,
].map((measure) => ({ ...measure, ...(evidenceOverrides[measure.slug] ?? {}) }));

export const assessmentMeasureSlugs = assessmentMeasures.map((measure) => measure.slug);

export function getAssessmentMeasure(slug: string) {
  return assessmentMeasures.find((measure) => measure.slug === slug) ?? null;
}

export function getAssessmentMeasureCategory(slug: string) {
  return assessmentMeasureCategories.find((category) => category.slug === slug) ?? null;
}

export function getMeasuresByCategory(slug: string) {
  return assessmentMeasures.filter((measure) => measure.categories.includes(slug));
}
