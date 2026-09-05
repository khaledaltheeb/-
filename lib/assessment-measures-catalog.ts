import {
  arabicStatusBadge,
  assessmentMeasureCategories,
  assessmentMeasures as assessmentMeasuresWave1,
  rightsBadge,
  type AssessmentMeasure,
  type ArabicMeasureStatus,
  type MeasureRightsStatus,
} from '@/lib/assessment-measures';
import { assessmentMeasuresWave2 } from '@/lib/assessment-measures-wave2';

export type { AssessmentMeasure, ArabicMeasureStatus, MeasureRightsStatus };
export { arabicStatusBadge, assessmentMeasureCategories, rightsBadge };

export const assessmentMeasures: AssessmentMeasure[] = [
  ...assessmentMeasuresWave1,
  ...assessmentMeasuresWave2,
];

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
