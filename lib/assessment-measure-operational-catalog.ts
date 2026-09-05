import type { AssessmentMeasure } from '@/lib/assessment-measures';
import {
  getOperationalMaterial as getBaseOperationalMaterial,
  type AssessmentOperationalMaterial,
  type OfficialDownload,
  type OperationalFieldType,
  type OperationalItem,
  type OperationalMaterialKind,
  type OperationalOption,
  type OperationalSection,
} from '@/lib/assessment-measure-operational';
import { assessmentOperationalFullFormsWave1 } from '@/lib/assessment-measure-operational-full-forms-wave1';
import { assessmentOperationalFullFormsWave2 } from '@/lib/assessment-measure-operational-full-forms-wave2';

export type {
  AssessmentOperationalMaterial,
  OfficialDownload,
  OperationalFieldType,
  OperationalItem,
  OperationalMaterialKind,
  OperationalOption,
  OperationalSection,
};

export const explicitOperationalMaterials: Record<string, AssessmentOperationalMaterial> = {
  ...assessmentOperationalFullFormsWave1,
  ...assessmentOperationalFullFormsWave2,
};

export function getOperationalMaterial(measure: AssessmentMeasure): AssessmentOperationalMaterial {
  return explicitOperationalMaterials[measure.slug] ?? getBaseOperationalMaterial(measure);
}
