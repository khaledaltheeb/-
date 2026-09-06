import type { InstrumentCrosswalkRecord } from '@/lib/core-outcome-sets/instrument-crosswalk';

const RCADS_UCLA = 'https://www.childfirst.ucla.edu/resources/';
const GMFM_CANCHILD = 'https://canchild.ca/resources/44-gross-motor-function-measure-gmfm/';

const auditedOverridesWave6: Record<string, Partial<InstrumentCrosswalkRecord>> = {
  rcads: {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — RCADS محمي وUCLA هي قناة التوزيع الرسمية',
    internalPath: '/assessment-measures/rights-review/#revised-childrens-anxiety-and-depression-scale',
    rightsStatus: 'owner-conditions',
    rightsNote: 'UCLA Child FIRST يوضح أن RCADS ومشتقاته وترجماته مملوكة ومحميّة بحقوق النشر لـChorpita وSpence، وأن الإتاحة المجانية للمستخدم لا تعني ترخيصًا دائمًا لإعادة التوزيع. صفحة UCLA هي قناة التوزيع الرسمية، وإنشاء adaptations أو مشتقات أو أدوات scoring خاصة يحتاج إذنًا؛ لذلك لا تعيد روافد نشر البنود أو النموذج الكامل أو scorer عام.',
    arabicEvidence: 'related-version-only',
    arabicEvidenceLabel: 'دليل عربي مباشر لنسخة RCADS-25 المختصرة فقط — لا يثبت RCADS الكامل',
    arabicEvidenceNote: 'Perkins وAlós (2021) طورا RCADS25-Arabic واختبراها لدى 250 طفلًا ناطقًا بالعربية في سوريا. هذا دليل مهم للنسخة المختصرة RCADS-25، لكنه لا يُنقل تلقائيًا إلى RCADS الكامل ذي 47 بندًا ولا يثبت وجود ترجمة عربية رسمية كاملة موزعة حاليًا من UCLA.',
    evidenceUrl: RCADS_UCLA,
    evidenceCitation: 'UCLA Child FIRST RCADS official distribution/terms; Perkins & Alós 2021 RCADS25-Arabic, PMID 34210326',
    lastVerified: '2026-09-06',
    catalogSync: 'rights-conflict',
    catalogSyncNote: 'Rights Audit Wave 6: شروط المالك تتقدم على أي تطابق مستقبلي في Catalog؛ وجود سجل أو ترجمة مختصرة لا يسمح بإعادة نشر RCADS الكامل أو scorer عام.',
  },
  gmfm: {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — GMFM محمي، والإصدار الدقيق GMFM-66/88 غير محسوم في سجل COS',
    internalPath: '/assessment-measures/rights-review/#gross-motor-function-measure',
    rightsStatus: 'owner-conditions',
    rightsNote: 'CanChild يتيح score sheets للاستخدام الشخصي غير التجاري وفق شروطه، لكن مواد GMFM تحمل حقوقًا محفوظة ولا تُعامل كمحتوى عام لإعادة التوزيع. كما أن GMFM-66 وGMFM-88 ليسا إصدارًا واحدًا: يختلف عدد البنود وطريقة التسجيل ونطاق الصلاحية، لذلك لا تنشر روافد نموذجًا كاملًا أو scorer قبل حسم الإصدار وشروطه.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم تثبت نسخة عربية مطابقة لـGMFM-66 أو GMFM-88 من المصدر الرسمي',
    arabicEvidenceNote: 'CanChild يعرض مواد عربية لـGMFCS-E&R، لكن GMFCS نظام تصنيف مختلف عن GMFM ولا يجوز نقل حالة اللغة أو التحقق منه إلى GMFM. لا نصف GMFM بأنه جاهز بالعربية حتى يثبت إصدار عربي مطابق لـGMFM-66 أو GMFM-88 ودليله.',
    evidenceUrl: GMFM_CANCHILD,
    evidenceCitation: 'CanChild GMFM official resources/score sheets and copyright; exact-version distinction GMFM-66 vs GMFM-88',
    lastVerified: '2026-09-06',
    catalogSync: 'rights-conflict',
    catalogSyncNote: 'Rights Audit Wave 6: exact-version وحقوق CanChild يمنعان الترقية الآلية. GMFM-66/88 يجب أن يبقيا منفصلين، وGMFCS Arabic لا يُعامل كدليل عربي لـGMFM.',
  },
};

export function applyInstrumentRightsAuditWave6(record: InstrumentCrosswalkRecord): InstrumentCrosswalkRecord {
  const override = auditedOverridesWave6[record.id];
  if (!override) return record;
  return { ...record, ...override };
}
