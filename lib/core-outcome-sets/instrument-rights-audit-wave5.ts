import type { InstrumentCrosswalkRecord } from '@/lib/core-outcome-sets/instrument-crosswalk';

const GAD2_NICE = 'https://www.ncbi.nlm.nih.gov/books/NBK92248/';

const auditedOverridesWave5: Record<string, Partial<InstrumentCrosswalkRecord>> = {
  'gad-2': {
    rawafidStatus: 'operational-full',
    rawafidStatusLabel: 'متاح تشغيليًا في مكتبة روافد — GAD-2 موثق كأداة مستقلة',
    internalPath: '/assessment-measures/generalized-anxiety-disorder-2/',
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'ملحق NICE المنشور عبر NCBI يعرّف GAD-2 بأنه أول بندين من GAD-7 ويذكر صراحة أنه لا يلزم إذن لإعادة إنتاجه أو ترجمته أو عرضه أو توزيعه. وجود GAD-7 في المكتبة لم يكن وحده سبب الترقية؛ الترقية تمت بعد تدقيق GAD-2 نفسه كمقياس مستقل.',
    arabicEvidence: 'psychometric-context',
    arabicEvidenceLabel: 'دليل سيكومتري عربي مباشر لـGAD-2 في عينة سعودية محددة — سياقي',
    arabicEvidenceNote: 'دراسة Ali وزملائه المنشورة في 2026 قيّمت GAD-2 العربي لدى 85 أمًا سعودية لأطفال ذوي إعاقة ذهنية. يدعم ذلك الدليل العربي المباشر في تلك العينة، لكنه لا يمنح صلاحية عربية عامة ولا يبرر تعميم عتبات الدراسة على كل السكان أو البلدان العربية.',
    evidenceUrl: GAD2_NICE,
    evidenceCitation: 'NICE / NCBI Bookshelf — GAD-2 questionnaire and unrestricted reproduce/translate/display/distribute statement; Arabic psychometric context: Ali et al. 2026, PMID 42084504',
    lastVerified: '2026-09-06',
    catalogSync: 'seed',
    catalogMatchedSlug: 'generalized-anxiety-disorder-2',
    catalogSyncNote: 'Rights Audit Wave 5: جرى تدقيق GAD-2 كنسخة مستقلة وربطها يدويًا بسجل Assessment Measures المطابق؛ الترقية لا تنقل عتبات أو خصائص سيكومترية بين المجتمعات.',
  },
};

export function applyInstrumentRightsAuditWave5(record: InstrumentCrosswalkRecord): InstrumentCrosswalkRecord {
  const override = auditedOverridesWave5[record.id];
  if (!override) return record;

  return {
    ...record,
    ...override,
  };
}
