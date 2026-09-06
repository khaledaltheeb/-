import type { AssessmentMeasure } from '@/lib/assessment-measures';
import {
  getOperationalMaterial as getBaseOperationalMaterial,
  operationalMaterials as baseOperationalMaterials,
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
import { assessmentOperationalFullFormsWave12 } from '@/lib/assessment-measure-operational-full-forms-wave12';
import { assessmentOperationalFullFormsWave13 } from '@/lib/assessment-measure-operational-full-forms-wave13';
import { assessmentOperationalFullFormsWave14 } from '@/lib/assessment-measure-operational-full-forms-wave14';
import { assessmentOperationalFullFormsWave15 } from '@/lib/assessment-measure-operational-full-forms-wave15';
import { assessmentOperationalFullFormsWave16 } from '@/lib/assessment-measure-operational-full-forms-wave16';
import { assessmentOperationalFullFormsWave17 } from '@/lib/assessment-measure-operational-full-forms-wave17';
import { assessmentOperationalFullFormsWave18 } from '@/lib/assessment-measure-operational-full-forms-wave18';

export type {
  AssessmentOperationalMaterial,
  OfficialDownload,
  OperationalFieldType,
  OperationalItem,
  OperationalMaterialKind,
  OperationalOption,
  OperationalSection,
};

// Every explicitly authored material is authoritative over the universal documentation fallback.
// The base registry contains the original rights-reviewed operational set; later waves extend or
// intentionally harden those records. Later spreads are authoritative when the same slug appears again.
export const explicitOperationalMaterials: Record<string, AssessmentOperationalMaterial> = {
  ...baseOperationalMaterials,
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
  ...assessmentOperationalFullFormsWave12,
  ...assessmentOperationalFullFormsWave13,
  ...assessmentOperationalFullFormsWave14,
  ...assessmentOperationalFullFormsWave15,
  ...assessmentOperationalFullFormsWave16,
  ...assessmentOperationalFullFormsWave17,
  ...assessmentOperationalFullFormsWave18,
};

export function hasExplicitOperationalMaterial(slug: string): boolean {
  return Boolean(explicitOperationalMaterials[slug]);
}

export function getOperationalMaterial(measure: AssessmentMeasure): AssessmentOperationalMaterial {
  return explicitOperationalMaterials[measure.slug] ?? getBaseOperationalMaterial(measure);
}
