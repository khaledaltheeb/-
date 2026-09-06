import type { InstrumentCrosswalkRecord } from '@/lib/core-outcome-sets/instrument-crosswalk';

const ICHOM_AUTISM_REFERENCE = 'https://connect.ichom.org/wp-content/uploads/2021/06/ASD_Both_Track_Reference_Guide_Document.pdf';
const UW_FAD = 'https://arc.psych.wisc.edu/self-report/mcmaster-family-assessment-device-fad/';
const NCTSN_FAD = 'https://www.nctsn.org/measures/family-assessment-device';
const ATS_BISQ = 'https://site.thoracic.org/assemblies/srn/sleep-related-questionnaires/bisq';
const NIH_PHQ2 = 'https://www.nih.gov/node/19936';

const auditedClosureOverrides: Record<string, Partial<InstrumentCrosswalkRecord>> = {
  'cfql-2-autism': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'حقوق الاستخدام مدققة — CFQL-2 متاح للاستخدام دون كلفة، لكنه غير مضاف بعد كنموذج تشغيلي في روافد',
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'دليل ICHOM المرجعي للتوحد يصف CFQL-2 بأنه Free for all to use مع عدم توفر معلومات ترخيص إضافية، كما تسجله مصادر قياس مستقلة حديثة بوصفه publicly available at no cost. هذا يثبت قابلية الاستخدام ولا نحوله إلى ادعاء Public Domain أو إذن غير محدود بالتعديل أو إنشاء ترجمة عربية؛ أي إعادة استضافة كاملة أو تكييف لغوي يجب أن يحافظ على المصدر والإصدار وشروط المؤلفين.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لا توجد في سجل روافد ترجمة عربية موثقة للإصدار CFQL-2',
    arabicEvidenceNote: 'توفر الأداة الإنجليزية دون كلفة لا يثبت وجود ترجمة عربية مرخصة أو تحقق سيكومتري عربي؛ لا ننشئ ترجمة من طرفنا ونصفها كنسخة معتمدة.',
    evidenceUrl: ICHOM_AUTISM_REFERENCE,
    evidenceCitation: 'ICHOM Autism Spectrum Disorder Reference Guide — CFQL-2 listed as free for all to use; SPRNetwork 2026 inventory — publicly available at no cost; exact-version and translation boundaries preserved',
    lastVerified: '2026-09-06',
  },
  'mcmaster-fad-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — مصادر FAD العامة لا تمنح روافد أساسًا كافيًا لإعادة توزيع البنود',
    rightsStatus: 'owner-conditions',
    rightsNote: 'المصادر الموثوقة ليست متطابقة: NCTSN يسجل FAD بأنه Free وCopyrighted: No، بينما University of Wisconsin–Madison تنص صراحةً أنها لا تملك سلطة حقوقية على المقياس ولا تستطيع منح الإذن وتطلب الرجوع إلى مؤلفي الاستبيان. لذلك تتخذ روافد المسار المحافظ: نشر وصف ومرجع فقط، وعدم إعادة نشر البنود أو scorer كامل حتى يثبت إذن مباشر أو مصدر مالك حاسم.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'النسخة العربية المطابقة لم تُدقق بعد',
    arabicEvidenceNote: 'وجود دراسات أو ترجمات لـFAD لا يكفي لإعادة الاستضافة قبل مطابقة النسخة/المقاييس الفرعية وتثبيت provenance وحقوق الترجمة نفسها.',
    evidenceUrl: UW_FAD,
    evidenceCitation: `UW–Madison Addiction Research Center — no copyright authority / contact questionnaire author for permissions; NCTSN FAD registry — Cost: Free, Copyrighted: No (${NCTSN_FAD})`,
    lastVerified: '2026-09-06',
  },
  'bisq-autism': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'حقوق الاستخدام مدققة — BISQ الأصلي متاح مجانًا للاستخدام؛ لم يُبنَ بعد كنموذج روافد مستقل',
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'American Thoracic Society يصف Brief Infant Sleep Questionnaire الأصلي بأنه publicly available and free for use ويشير إلى مصدر الأداة. هذا التدقيق يخص BISQ الأصلي ولا يُنقل تلقائيًا إلى BISQ-R أو BISQ-R Short Form أو أي scoring service/نسخة معدلة.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم تُثبت بعد نسخة عربية مطابقة لـBISQ الأصلي في سجل روافد',
    arabicEvidenceNote: 'توجد تكييفات لغوية منشورة لـBISQ في مجتمعات متعددة، لكننا لا ننقل صلاحية أي ترجمة أو إصدار معدل إلى النسخة العربية قبل exact-version review.',
    evidenceUrl: ATS_BISQ,
    evidenceCitation: 'American Thoracic Society — Brief Infant Sleep Questionnaire (BISQ): original BISQ publicly available and free for use; BISQ/BISQ-R version boundary preserved',
    lastVerified: '2026-09-06',
  },
  'phq-2-autism': {
    rawafidStatus: 'operational-full',
    rawafidStatusLabel: 'متاح تشغيليًا في مكتبة روافد — نفس PHQ-2 الموثق، وليس نسخة توحد مستقلة',
    internalPath: '/assessment-measures/patient-health-questionnaire-2/',
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'هذا السجل يشير إلى PHQ-2 نفسه المدرج في Assessment Measures Catalog. NIH HEAL CDE يسجل Copyright: No ويوفر ملف PHQ-2 عربيًا، لذلك لا نعامل ظهوره داخل ICHOM Autism كأداة مختلفة أو كترخيص جديد. تبقى حدود العمر والسياق السريري مستقلة عن حق إعادة الاستخدام.',
    arabicEvidence: 'official-or-linguistic-translation',
    arabicEvidenceLabel: 'ملف عربي مباشر متاح من NIH؛ الدليل السيكومتري العربي يبقى محدد السياق',
    arabicEvidenceNote: 'NIH يوفر ملف PHQ-2 عربيًا، وتوجد دراسة سيكومترية عربية حديثة في عينة سعودية محددة. هذا يثبت وجود النسخة العربية والدليل السياقي، لكنه لا يبرر تعميم الأداء أو العتبة على جميع الأطفال أو الأشخاص ذوي التوحد.',
    evidenceUrl: NIH_PHQ2,
    evidenceCitation: 'NIH HEAL CDE — PHQ-2 Copyright: No + Arabic file; Kroenke et al. 2003 original PHQ-2; Arabic psychometric context: Ali et al. 2025, PMID 40687118',
    lastVerified: '2026-09-06',
  },
};

export function applyInstrumentRightsAuditClosure(record: InstrumentCrosswalkRecord): InstrumentCrosswalkRecord {
  const override = auditedClosureOverrides[record.id];
  if (!override) return record;

  const next = { ...record, ...override };

  return {
    ...next,
    catalogSync:
      next.rightsStatus === 'owner-conditions' || next.rightsStatus === 'license-or-permission-required'
        ? (record.catalogMatchedSlug ? 'rights-conflict' : record.catalogSync)
        : record.catalogSync,
    catalogSyncNote: [
      record.catalogSyncNote,
      'Rights Closure Audit: أُغلقت حالة الحقوق بمصدر خاص بالأداة/الإصدار؛ لا يُنقل حق الاستخدام إلى ترجمة أو إصدار أو فئة عمرية أخرى تلقائيًا.',
    ].filter(Boolean).join(' '),
  };
}
