import { assessmentMeasures } from '@/lib/assessment-measures-catalog';
import {
  instrumentCrosswalk as baseInstrumentCrosswalk,
  type InstrumentCrosswalkRecord,
} from '@/lib/core-outcome-sets/instrument-crosswalk';
import { instrumentCrosswalkWave2Seed } from '@/lib/core-outcome-sets/instrument-crosswalk-wave2';
import { applyInstrumentRightsAudit } from '@/lib/core-outcome-sets/instrument-rights-audit';
import { applyInstrumentRightsAuditWave4 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave4';
import { applyInstrumentRightsAuditWave5 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave5';
import { applyInstrumentRightsAuditWave6 } from '@/lib/core-outcome-sets/instrument-rights-audit-wave6';
import { applyInstrumentRightsAuditClosure } from '@/lib/core-outcome-sets/instrument-rights-audit-closure';

const normalizeAcronym = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]+/g, '');

const assessmentCatalogByAcronym = new Map<string, (typeof assessmentMeasures)[number][]>();
for (const measure of assessmentMeasures) {
  const key = normalizeAcronym(measure.acronym);
  if (!key) continue;
  const matches = assessmentCatalogByAcronym.get(key) ?? [];
  matches.push(measure);
  assessmentCatalogByAcronym.set(key, matches);
}

const wave2AutomaticPromotionBlockedIds = new Set([
  'whodas-addiction-source-level',
  'srs-autism',
  'vineland-autism',
  'pac-autism',
  'panas-autism',
  'faces-autism',
  'empathy-quotient-autism',
  'psq-autism',
]);

function upgradeBaseRecord(record: InstrumentCrosswalkRecord): InstrumentCrosswalkRecord {
  if (record.id !== 'kidscreen-10') return record;

  return {
    ...record,
    linkedCosSlugs: Array.from(new Set([...record.linkedCosSlugs, 'addiction-ichom-standard-set'])),
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'الموقع الرسمي لـKIDSCREEN يصف الاستبيانات بأنها fully open-access. هذا يزيل غموض الوصول، لكنه لا يلغي ضرورة مطابقة النسخة واللغة وطريقة التطبيق عند التنفيذ داخل روافد.',
    arabicEvidence: 'official-or-linguistic-translation',
    arabicEvidenceLabel: 'نسخ عربية رسمية متاحة لـKIDSCREEN-10؛ التحقق المحلي يبقى سياقيًا',
    arabicEvidenceNote: 'KIDSCREEN يدرج العربية/Arabian ضمن اللغات المتاحة لاستبيانات الطفل/اليافع والوالد، بما في ذلك KIDSCREEN-10. وجود الترجمة الرسمية لا يثبت تلقائيًا measurement invariance أو العتبات في كل بلد عربي.',
    evidenceUrl: 'https://www.kidscreen.org/english/questionnaires/',
    evidenceCitation: 'KIDSCREEN official questionnaires/language versions — KIDSCREEN-10 fully open-access; Arabic/Arabian versions listed',
    lastVerified: '2026-09-06',
    catalogSyncNote: [record.catalogSyncNote, 'تم تدقيق توفر KIDSCREEN-10 والترجمة العربية من المصدر الرسمي في Wave 2؛ تدقيق الحقوق التفصيلي اللاحق يطبق بعد هذه الطبقة ولا تُنقل أي صلاحية سيكومترية محلية تلقائيًا.'].filter(Boolean).join(' '),
  };
}

function resolveWave2AgainstAssessmentCatalog(record: InstrumentCrosswalkRecord): InstrumentCrosswalkRecord {
  const key = normalizeAcronym(record.acronym);
  const matches = key ? (assessmentCatalogByAcronym.get(key) ?? []) : [];

  if (wave2AutomaticPromotionBlockedIds.has(record.id)) {
    return {
      ...record,
      catalogSync: 'blocked-family',
      catalogSyncNote: 'التزام exact-version: الاسم في المصدر يصف عائلة/إصدارًا غير محسوم بدقة، لذلك لا تُرقّى الحالة تلقائيًا حتى لو ظهر acronym مشابه في Catalog.',
    };
  }

  if (matches.length === 0) {
    return { ...record, catalogSync: 'no-exact-match' };
  }

  if (matches.length > 1) {
    return {
      ...record,
      catalogSync: 'ambiguous-exact-match',
      catalogSyncNote: `وُجد ${matches.length} تطابقات للاختصار نفسه في Assessment Measures Catalog؛ يلزم حسم الإصدار يدويًا قبل تغيير الحالة.`,
    };
  }

  const match = matches[0];

  if (record.rightsStatus === 'owner-conditions' || record.rightsStatus === 'license-or-permission-required') {
    return {
      ...record,
      catalogSync: 'rights-conflict',
      catalogMatchedSlug: match.slug,
      catalogSyncNote: 'يوجد تطابق في Catalog، لكن هذا السجل يحمل قيود مالك/ترخيص؛ لا تُلغى القيود تلقائيًا بمجرد وجود سجل داخلي.',
    };
  }

  if (record.rawafidStatus === 'not-in-library') {
    return {
      ...record,
      rawafidStatus: 'operational-full',
      rawafidStatusLabel: 'متاح تشغيليًا في مكتبة روافد — طابقه Assessment Measures Catalog تطابقًا فريدًا',
      internalPath: `/assessment-measures/${match.slug}/`,
      rightsStatus: 'rawafid-provenance-verified',
      rightsNote: `${record.rightsNote} تطابق هذا السجل مع أداة واحدة في Assessment Measures Catalog؛ حالة الحقوق الحالية هناك: ${match.rightsLabel}.`,
      catalogSync: 'auto-promoted',
      catalogMatchedSlug: match.slug,
      catalogSyncNote: 'الترقية تخص التوفر التشغيلي فقط؛ لا تنقل الدليل العربي أو الصلاحية السيكومترية بين الإصدارات أو المجتمعات.',
    };
  }

  return {
    ...record,
    catalogSync: 'seed',
    catalogMatchedSlug: match.slug,
    catalogSyncNote: 'التطابق الحالي متسق مع Assessment Measures Catalog.',
  };
}

const upgradedBaseInstrumentCrosswalk = baseInstrumentCrosswalk.map(upgradeBaseRecord);
const resolvedWave2InstrumentCrosswalk = instrumentCrosswalkWave2Seed.map(resolveWave2AgainstAssessmentCatalog);
const rightsAuditedInstrumentCrosswalkWave3 = [
  ...upgradedBaseInstrumentCrosswalk,
  ...resolvedWave2InstrumentCrosswalk,
].map(applyInstrumentRightsAudit);
const rightsAuditedInstrumentCrosswalkWave4 = rightsAuditedInstrumentCrosswalkWave3.map(applyInstrumentRightsAuditWave4);
const rightsAuditedInstrumentCrosswalkWave5 = rightsAuditedInstrumentCrosswalkWave4.map(applyInstrumentRightsAuditWave5);
const rightsAuditedInstrumentCrosswalkWave6 = rightsAuditedInstrumentCrosswalkWave5.map(applyInstrumentRightsAuditWave6);
const rightsAuditedInstrumentCrosswalk = rightsAuditedInstrumentCrosswalkWave6.map(applyInstrumentRightsAuditClosure);

export const instrumentCrosswalk: readonly InstrumentCrosswalkRecord[] = rightsAuditedInstrumentCrosswalk;

export function getInstrumentCrosswalkForCos(cosSlug: string) {
  return instrumentCrosswalk.filter((item) => item.linkedCosSlugs.includes(cosSlug));
}

export const instrumentCrosswalkStats = {
  total: instrumentCrosswalk.length,
  operationalFull: instrumentCrosswalk.filter((item) => item.rawafidStatus === 'operational-full').length,
  referenceRights: instrumentCrosswalk.filter((item) => item.rawafidStatus === 'reference-rights').length,
  notInLibrary: instrumentCrosswalk.filter((item) => item.rawafidStatus === 'not-in-library').length,
  arabicPsychometricContext: instrumentCrosswalk.filter((item) => item.arabicEvidence === 'psychometric-context').length,
  officialArabicTranslation: instrumentCrosswalk.filter((item) => item.arabicEvidence === 'official-or-linguistic-translation').length,
  autoPromoted: instrumentCrosswalk.filter((item) => item.catalogSync === 'auto-promoted').length,
  catalogRightsConflicts: instrumentCrosswalk.filter((item) => item.catalogSync === 'rights-conflict').length,
  wave2: resolvedWave2InstrumentCrosswalk.length,
};
