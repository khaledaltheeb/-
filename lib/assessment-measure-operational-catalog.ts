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
import { assessmentOperationalFullFormsWave3 } from '@/lib/assessment-measure-operational-full-forms-wave3';
import { assessmentOperationalFullFormsWave4 } from '@/lib/assessment-measure-operational-full-forms-wave4';
import { assessmentOperationalFullFormsWave5 } from '@/lib/assessment-measure-operational-full-forms-wave5';
import { assessmentOperationalFullFormsWave6 } from '@/lib/assessment-measure-operational-full-forms-wave6';
import { assessmentOperationalFullFormsWave7 } from '@/lib/assessment-measure-operational-full-forms-wave7';
import { assessmentOperationalFullFormsWave8 } from '@/lib/assessment-measure-operational-full-forms-wave8';
import { assessmentOperationalFullFormsWave9 } from '@/lib/assessment-measure-operational-full-forms-wave9';
import { assessmentOperationalFullFormsWave10 } from '@/lib/assessment-measure-operational-full-forms-wave10';
import { assessmentOperationalFullFormsWave11 } from '@/lib/assessment-measure-operational-full-forms-wave11';

export type {
  AssessmentOperationalMaterial,
  OfficialDownload,
  OperationalFieldType,
  OperationalItem,
  OperationalMaterialKind,
  OperationalOption,
  OperationalSection,
};

// Rights-verified explicit materials always override the universal recording-sheet fallback.
export const explicitOperationalMaterials: Record<string, AssessmentOperationalMaterial> = {
  ...assessmentOperationalFullFormsWave1,
  ...assessmentOperationalFullFormsWave2,
  ...assessmentOperationalFullFormsWave3,
  ...assessmentOperationalFullFormsWave4,
  ...assessmentOperationalFullFormsWave5,
  ...assessmentOperationalFullFormsWave6,
  ...assessmentOperationalFullFormsWave7,
  ...assessmentOperationalFullFormsWave8,
  ...assessmentOperationalFullFormsWave9,
  ...assessmentOperationalFullFormsWave10,
  ...assessmentOperationalFullFormsWave11,
};

export function getOperationalMaterial(measure: AssessmentMeasure): AssessmentOperationalMaterial {
  return explicitOperationalMaterials[measure.slug] ?? getBaseOperationalMaterial(measure);
}
