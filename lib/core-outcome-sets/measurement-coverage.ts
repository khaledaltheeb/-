import { coreOutcomeRegistry } from '@/lib/core-outcome-sets/registry';
import { instrumentCrosswalk } from '@/lib/core-outcome-sets/instrument-crosswalk-registry';

export type CoreOutcomeMeasurementCoverageStatus =
  | 'mapped'
  | 'mapping-gap-explicit'
  | 'mapping-gap-linked'
  | 'outcome-only';

export type CoreOutcomeMeasurementCoverageRecord = {
  slug: string;
  condition: string;
  healthArea: string;
  measurementStatus: (typeof coreOutcomeRegistry)[number]['measurementStatus'];
  measurementStatusLabel: string;
  mappedInstrumentIds: string[];
  mappedInstrumentCount: number;
  coverageStatus: CoreOutcomeMeasurementCoverageStatus;
  coverageLabel: string;
  nextAction: string;
};

export const coreOutcomeMeasurementCoverage: readonly CoreOutcomeMeasurementCoverageRecord[] = coreOutcomeRegistry.map((record) => {
  const mappedInstruments = instrumentCrosswalk.filter((instrument) => instrument.linkedCosSlugs.includes(record.slug));
  const mappedInstrumentIds = mappedInstruments.map((instrument) => instrument.id);

  if (mappedInstrumentIds.length > 0) {
    return {
      slug: record.slug,
      condition: record.condition,
      healthArea: record.healthArea,
      measurementStatus: record.measurementStatus,
      measurementStatusLabel: record.measurementStatusLabel,
      mappedInstrumentIds,
      mappedInstrumentCount: mappedInstrumentIds.length,
      coverageStatus: 'mapped',
      coverageLabel: 'يوجد instrument mapping في روافد',
      nextAction: 'استكمال تدقيق الإصدار والحقوق والدليل العربي لكل أداة، ثم توسيع الربط عند وجود أدوات إضافية موصى بها.',
    } satisfies CoreOutcomeMeasurementCoverageRecord;
  }

  if (record.measurementStatus === 'explicit') {
    return {
      slug: record.slug,
      condition: record.condition,
      healthArea: record.healthArea,
      measurementStatus: record.measurementStatus,
      measurementStatusLabel: record.measurementStatusLabel,
      mappedInstrumentIds,
      mappedInstrumentCount: 0,
      coverageStatus: 'mapping-gap-explicit',
      coverageLabel: 'توجد توصيات قياس صريحة لكن crosswalk غير مكتمل',
      nextAction: 'استخراج الأدوات الدقيقة من Standard Set/COMS، ثم تدقيق الإصدار والحقوق والعربية قبل إضافتها إلى crosswalk.',
    } satisfies CoreOutcomeMeasurementCoverageRecord;
  }

  if (record.measurementStatus === 'linked') {
    return {
      slug: record.slug,
      condition: record.condition,
      healthArea: record.healthArea,
      measurementStatus: record.measurementStatus,
      measurementStatusLabel: record.measurementStatusLabel,
      mappedInstrumentIds,
      mappedInstrumentCount: 0,
      coverageStatus: 'mapping-gap-linked',
      coverageLabel: 'يوجد مسار قياس/Set مرتبط لكن الأدوات لم تُربط بعد',
      nextAction: 'فتح المصدر المرتبط وتثبيت أسماء الأدوات وإصداراتها قبل أي ادعاء بالتوفر أو الصلاحية العربية.',
    } satisfies CoreOutcomeMeasurementCoverageRecord;
  }

  return {
    slug: record.slug,
    condition: record.condition,
    healthArea: record.healthArea,
    measurementStatus: record.measurementStatus,
    measurementStatusLabel: record.measurementStatusLabel,
    mappedInstrumentIds,
    mappedInstrumentCount: 0,
    coverageStatus: 'outcome-only',
    coverageLabel: 'لا توجد توصية أداة مثبتة في سجل روافد حتى الآن',
    nextAction: 'الإبقاء على COS كطبقة WHAT وعدم اختراع HOW؛ أي أداة لاحقة تحتاج مصدرًا صريحًا ومراجعة مستقلة.',
  } satisfies CoreOutcomeMeasurementCoverageRecord;
});

export const measurementCoverageStats = {
  totalCos: coreOutcomeMeasurementCoverage.length,
  mappedCos: coreOutcomeMeasurementCoverage.filter((record) => record.coverageStatus === 'mapped').length,
  mappingGaps: coreOutcomeMeasurementCoverage.filter((record) => record.coverageStatus === 'mapping-gap-explicit' || record.coverageStatus === 'mapping-gap-linked').length,
  outcomeOnly: coreOutcomeMeasurementCoverage.filter((record) => record.coverageStatus === 'outcome-only').length,
  unmappedCos: coreOutcomeMeasurementCoverage.filter((record) => record.mappedInstrumentCount === 0).length,
};

export const unmappedCoreOutcomeMeasurementCoverage = coreOutcomeMeasurementCoverage.filter(
  (record) => record.mappedInstrumentCount === 0,
);
