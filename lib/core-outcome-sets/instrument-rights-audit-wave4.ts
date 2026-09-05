import type { InstrumentCrosswalkRecord } from '@/lib/core-outcome-sets/instrument-crosswalk';

const CANCHILD_CAPE_PAC = 'https://canchild.ca/shop/67-cape-pac-manual-only/';
const CAMBRIDGE_ARC_EQ = 'https://www.autismresearchcentre.com/tests/empathy-quotient-eq-for-adults/';
const ATS_PSQ = 'https://site.thoracic.org/assemblies/srn/sleep-related-questionnaires/psq';
const PHENX_PANAS = 'https://dev.phenxtoolkit.org/protocols/view/180502';
const FACES_PERMISSION = 'https://archivo.revistas.ucr.ac.cr/index.php/actualidades/article/download/23573/35082/58482';
const RBS_PERMISSION_EVIDENCE = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12239515/';

const auditedOverridesWave4: Record<string, Partial<InstrumentCrosswalkRecord>> = {
  'pac-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — PAC مرخص من McMaster/CanChild ولا يجوز عرضه أو توزيعه عامًا',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'ترخيص CAPE/PAC الرسمي من McMaster يمنح ترخيصًا فرديًا غير قابل للتحويل للاستخدام البحثي/السريري غير التجاري، ويمنع توزيع النسخ، العرض العام، أو إتاحة المقياس للتنزيل عبر شبكة. لذلك لا تنشر روافد بنود PAC أو نموذجًا عامًا دون ترخيص مناسب من McMaster.',
    evidenceUrl: CANCHILD_CAPE_PAC,
    evidenceCitation: 'McMaster University / CanChild — CAPE/PAC individual licence: non-transferable, no public display/download or redistribution',
    lastVerified: '2026-09-06',
  },
  'rbs-r-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — حقوق RBS-R ليست ملكًا عامًا ويجب تثبيت إذن النسخة قبل إعادة النشر',
    rightsStatus: 'owner-conditions',
    rightsNote: 'دراسات التكييف المنشورة توثق الحصول على إذن المطور قبل ترجمة RBS-R، ما يؤكد أن التكييف لا يُعامل كعمل حر تلقائيًا. لا يوجد في سجل روافد إذن مباشر يبيح إعادة توزيع النسخة الأصلية/العربية للعامة، لذلك يبقى النموذج مرجعيًا حتى تثبت شروط المالك للإصدار المقصود.',
    arabicEvidence: 'psychometric-context',
    arabicEvidenceLabel: 'تحقق عربي حديث في عينة عراقية — دليل سياقي لا يساوي ترخيص إعادة نشر',
    arabicEvidenceNote: 'دراسة منشورة في 2025 ترجمت وقيّمت RBS-R لدى 258 طفلًا عراقيًا ذوي توحد ودعمت بنية موثوقة/صالحة سياقيًا. ترخيص المقالة المفتوح لا ينقل تلقائيًا حقوق نص المقياس نفسه.',
    evidenceUrl: RBS_PERMISSION_EVIDENCE,
    evidenceCitation: 'RBS-R adaptation literature documents developer permission before translation; Arabic validation: Int J Methods Psychiatr Res 2025, PMCID PMC12745494, PMID 41457433',
    lastVerified: '2026-09-06',
  },
  'psq-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — PSQ يتطلب مسار ترخيص/إذن حتى عندما يكون مجانيًا للبحث الأكاديمي',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'American Thoracic Society يذكر أن Pediatric Sleep Questionnaire متاح ليُرخص مجانًا للاستخدام الأكاديمي والبحثي ويعطي بيانات المطور للتصريح. هذا ليس تصريحًا عامًا لإعادة نشر نموذج الويب أو توزيعه على الجمهور؛ لذلك يبقى PSQ مرجعيًا في روافد ما لم نحصل على ترخيص مناسب.',
    arabicEvidence: 'psychometric-context',
    arabicEvidenceLabel: 'توجد نسخ عربية محققة منشورة في السعودية/المنطقة — سياقية',
    arabicEvidenceNote: 'دراسة Sleep Medicine 2023 ترجمت وحققت PSQ بالعربية السعودية لدى 220 طفلًا وأبلغت اتساقًا داخليًا مرتفعًا، كما ظهرت دراسات عربية إضافية لاحقًا. لا تُعمم العتبات أو الأداء على كل الأطفال العرب، ولا تمنح الدراسة حق إعادة نشر الأداة.',
    evidenceUrl: ATS_PSQ,
    evidenceCitation: 'American Thoracic Society PSQ page — licensed free for academic/research use; Arabic validation: Sleep Medicine 2023, PMID 36780751, DOI 10.1016/j.sleep.2023.01.017',
    lastVerified: '2026-09-06',
  },
  'empathy-quotient-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — EQ متاح من Cambridge ARC للاستخدام البحثي غير التجاري بشروط المالك',
    rightsStatus: 'owner-conditions',
    rightsNote: 'Autism Research Centre بجامعة Cambridge يتيح اختبارات ARC للبحث/الاستخدام السريري وفق شروطه: الاستخدام غير التجاري/البحثي، إسناد المصدر، وعدم التعديل دون إذن. وجود ملف قابل للتنزيل لا يعني حق إعادة توزيعه من روافد كنسخة مستقلة للعامة.',
    arabicEvidence: 'official-or-linguistic-translation',
    arabicEvidenceLabel: 'ترجمة عربية رسمية متاحة مباشرة من Cambridge ARC',
    arabicEvidenceNote: 'صفحة Empathy Quotient الرسمية في ARC تسرد نسخة عربية وتنسبها للمترجم. هذا يثبت توفر ترجمة رسمية عبر الجهة المالكة، لا يثبت تلقائيًا تحققًا سيكومتريًا عربيًا أو حق روافد بإعادة استضافتها.',
    evidenceUrl: CAMBRIDGE_ARC_EQ,
    evidenceCitation: 'University of Cambridge Autism Research Centre — EQ official page with Arabic download; ARC tests terms require research/non-commercial use, attribution, and permission for adaptation',
    lastVerified: '2026-09-06',
  },
  'panas-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — PANAS/PANAS-C عائلة محمية والإصدار المقصود في ICHOM يحتاج حسمًا',
    rightsStatus: 'owner-conditions',
    rightsNote: 'PhenX يوثق أن PANAS-X محمي بحقوق Watson وClark وأن إعادة الإنتاج مسموحة للتطبيقات غير التجارية فقط، وأن PANAS-C كذلك يجيز الاستخدام/إعادة الإنتاج غير التجاري بينما يتطلب التجاري إذنًا مكتوبًا. سجل ICHOM لدينا لا يحسم PANAS مقابل PANAS-C/الإصدار، لذا لا تنشر روافد نموذجًا قبل exact-version review.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم يكتمل تدقيق النسخة العربية المطابقة للإصدار المقصود',
    arabicEvidenceNote: 'وجود ترجمات PANAS عربية في الأدبيات لا يكفي حتى نحدد ما إذا كان ICHOM يقصد PANAS أو PANAS-C وأي تعليمات زمنية/نسخة، ثم نثبت حقوق تلك النسخة ودليلها العربي.',
    evidenceUrl: PHENX_PANAS,
    evidenceCitation: 'PhenX Toolkit — PANAS/PANAS-C copyright and non-commercial permission terms; exact ICHOM version deliberately unresolved',
    lastVerified: '2026-09-06',
  },
  'faces-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — FACES يتطلب إذنًا/ترخيصًا والإصدار في ICHOM غير محسوم',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'خطاب إذن موقع من مطور FACES IV يوضح أن الاستخدام يتم بإذن وأن الحزمة الكاملة لها شروط تطبيق وإسناد. ولأن سجل ICHOM في روافد يسمي FACES كعائلة دون حسم الإصدار، لا نعيد نشر أو نشغل نموذجًا قبل تثبيت FACES IV/الإصدار المقصود وشروطه الحالية.',
    arabicEvidence: 'psychometric-context',
    arabicEvidenceLabel: 'تحقق عربي منشور لـFACES IV في السعودية — لا يثبت إصدار ICHOM تلقائيًا',
    arabicEvidenceNote: 'دراسة Journal of Family Issues حققت FACES IV في عينة سعودية من 369 مشاركًا. هذا يدعم الدليل العربي للإصدار الرابع في ذلك السياق، لكنه لا يحسم أن ICHOM يقصد FACES IV ولا ينقل إذن إعادة النشر.',
    evidenceUrl: FACES_PERMISSION,
    evidenceCitation: 'David H. Olson / Life Innovations permission letter for FACES IV; Arabic FACES IV psychometrics: DOI 10.1177/0192513X211033936',
    lastVerified: '2026-09-06',
  },
};

export function applyInstrumentRightsAuditWave4(record: InstrumentCrosswalkRecord): InstrumentCrosswalkRecord {
  const override = auditedOverridesWave4[record.id];
  if (!override) return record;

  return {
    ...record,
    ...override,
    internalPath: undefined,
    catalogSync: record.catalogMatchedSlug ? 'rights-conflict' : record.catalogSync,
    catalogSyncNote: [
      record.catalogSyncNote,
      'Rights Audit Wave 4: وجود ترجمة أو نموذج مجاني للبحث أو سجل داخلي لا يساوي إذن إعادة توزيع عام؛ تبقى شروط المالك والإصدار الدقيق حاجزًا مستقلًا قبل التشغيل.',
    ].filter(Boolean).join(' '),
  };
}
