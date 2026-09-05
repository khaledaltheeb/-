import type { InstrumentCrosswalkRecord } from '@/lib/core-outcome-sets/instrument-crosswalk';

const ICHOM_AUTISM_REFERENCE_GUIDE = 'https://connect.ichom.org/wp-content/uploads/2021/06/ASD_Both_Track_Reference_Guide_Document.pdf';
const WPS_SRS = 'https://www.wpspublish.com/srs-2-social-responsiveness-scale-second-edition';
const PEARSON_VINELAND = 'https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Behavior/Adaptive/Vineland-Adaptive-Behavior-Scales-%7C-Third-Edition/p/100001622.html';
const ASEBA_COPYRIGHT = 'https://aseba.org/ordering/';
const ATS_BISQ = 'https://site.thoracic.org/assemblies/srn/sleep-related-questionnaires/bisq';

const overridesWave5: Record<string, Partial<InstrumentCrosswalkRecord>> = {
  'rbs-r-autism': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف تشغيليًا — ICHOM يذكر أنه free for all to use لكن لا يقدم معلومات ترخيص تفصيلية',
    rightsStatus: 'not-reviewed',
    rightsNote: 'دليل ICHOM الرسمي لمجموعة التوحد يذكر لـRBS-R: لا تتوفر معلومات ترخيص، والأداة free for all to use. لذلك نصحح الحكم السابق ولا نصفها كأداة تتطلب إذن مالك مثبتًا. وفي الوقت نفسه لا نستنتج من عبارة free to use حق إعادة الاستضافة/التوزيع العام لنص الأداة دون شروط أو مصدر ترخيص أدق.',
    arabicEvidence: 'psychometric-context',
    arabicEvidenceLabel: 'تحقق عربي حديث في عينة عراقية — دليل سياقي منفصل عن حقوق إعادة النشر',
    arabicEvidenceNote: 'دراسة 2025 قيّمت نسخة عربية من RBS-R لدى أطفال عراقيين ذوي توحد. هذا يدعم الدليل السيكومتري في ذلك السياق فقط؛ لا يحول النص المترجم إلى مادة قابلة لإعادة الاستضافة تلقائيًا.',
    evidenceUrl: ICHOM_AUTISM_REFERENCE_GUIDE,
    evidenceCitation: 'ICHOM Autism Spectrum Disorder Data Collection Reference Guide — RBS-R: no licensing information available; free for all to use. Arabic validation evidence retained separately.',
    lastVerified: '2026-09-06',
  },
  'cfql-2-autism': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف تشغيليًا — ICHOM يذكر CFQL-2 كأداة free for all to use دون معلومات ترخيص تفصيلية',
    rightsStatus: 'not-reviewed',
    rightsNote: 'دليل ICHOM الرسمي يذكر لـCFQL-2 أن معلومات الترخيص غير متاحة وأن الأداة free for all to use. نحفظ هذا كدليل استخدام، لكن لا نساويه تلقائيًا بحق استضافة نص المقياس أو ترجمته/إعادة توزيعه من روافد قبل تثبيت المصدر وشروط النسخة الثانية نفسها.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم يكتمل تدقيق نسخة عربية مطابقة لـCFQL-2',
    arabicEvidenceNote: 'لا ننقل أي ترجمة أو دليل من إصدار سابق إلى CFQL-2 دون exact-version review.',
    evidenceUrl: ICHOM_AUTISM_REFERENCE_GUIDE,
    evidenceCitation: 'ICHOM Autism Spectrum Disorder Data Collection Reference Guide — CFQL-2: no licensing information available; free for all to use',
    lastVerified: '2026-09-06',
  },
  'vineland-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — Vineland/VABS يجب شراؤه للاستخدام وفق ICHOM',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'دليل ICHOM الرسمي يذكر أن Vineland Behavior Scales يجب شراؤها للاستخدام. Pearson يوزع Vineland-3 كأداة تجارية. لذلك لا تنشر روافد البنود أو النماذج الكاملة، ولا تساوي بين Vineland-II وVineland-3 أو بين الإصدارات دون تثبيت الإصدار المقصود.',
    arabicEvidence: 'related-version-only',
    arabicEvidenceLabel: 'يوجد دليل عربي لإصدار مرتبط (VABS-II)، وليس إثباتًا للنسخة الحالية/المقصودة في ICHOM',
    arabicEvidenceNote: 'توجد دراسة فلسطينية على النسخة العربية من VABS-II في عينة صغيرة. هذا دليل مفيد لإصدار مرتبط فقط ولا يثبت Vineland-3 أو الإصدار الذي ينبغي تشغيله ضمن المسار الحالي.',
    evidenceUrl: PEARSON_VINELAND,
    evidenceCitation: 'ICHOM Autism Reference Guide — Vineland Behavior Scales: must be purchased for use; Pearson Vineland-3 product/permissions. Arabic evidence is related-version only (VABS-II).',
    lastVerified: '2026-09-06',
  },
  'cbcl-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — CBCL يجب شراؤه ولا يجوز نسخ النماذج خارج شروط ASEBA',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'دليل ICHOM الرسمي يذكر أن CBCL يجب شراؤه للاستخدام. ASEBA يوضح أن النماذج والملفات محمية وأن النسخ/التوزيع يخضعان للشراء أو التراخيص المعتمدة، بما في ذلك الترجمة/النشر الإلكتروني. لذلك لا تستضيف روافد البنود أو scoring من مصادر ثانوية.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم تُثبت بعد نسخة عربية مرخصة مطابقة للـform/age band المقصود',
    arabicEvidenceNote: 'اسم CBCL وحده لا يكفي؛ يجب تحديد form والعمر واللغة والترخيص ثم ربط أي دليل عربي بالإصدار نفسه.',
    evidenceUrl: ASEBA_COPYRIGHT,
    evidenceCitation: 'ICHOM Autism Reference Guide — CBCL: must be purchased for use; ASEBA ordering/licensing terms for authorized forms and translations',
    lastVerified: '2026-09-06',
  },
  'faces-autism': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف تشغيليًا — ICHOM يذكر أن FACES متاح مجانًا ولا يحتاج ترخيصًا، لكن الإصدار المقصود غير محسوم',
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'دليل ICHOM الرسمي لمجموعة التوحد يذكر FACES كأداة freely available online وLicense not needed. هذا يصحح وصف Wave 4 بأنها تتطلب ترخيصًا. تبقى مشكلة exact-version قائمة لأن عائلة FACES متعددة الإصدارات، لذلك لا ننشر نموذجًا كاملًا قبل تحديد الإصدار الذي يطابق ICHOM وتدقيق النسخة العربية.',
    arabicEvidence: 'psychometric-context',
    arabicEvidenceLabel: 'تحقق عربي منشور لـFACES IV في السعودية — إصدار محدد لا يثبت تلقائيًا نسخة ICHOM',
    arabicEvidenceNote: 'الدليل السعودي يدعم FACES IV في سياقه. لا نرحله إلى إصدار آخر من FACES ولا نحول وجوده إلى إثبات أن ICHOM يقصد FACES IV دون مصدر صريح.',
    evidenceUrl: ICHOM_AUTISM_REFERENCE_GUIDE,
    evidenceCitation: 'ICHOM Autism Reference Guide — FACES: freely available online, license not needed; Arabic FACES IV evidence retained as exact-version-specific context',
    lastVerified: '2026-09-06',
  },
  'empathy-quotient-autism': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف تشغيليًا — ICHOM يذكر أن EQ متاح مجانًا ولا يحتاج ترخيصًا',
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'دليل ICHOM الرسمي يذكر Empathy Quotient كأداة freely available online وLicense not needed. لذلك نصحح حالة reference-rights السابقة. تبقى شروط الإسناد وعدم التعديل التي تنشرها Cambridge ARC جزءًا من تنفيذ سليم، لكنها لا تعني أن ICHOM يتطلب شراء ترخيص.',
    arabicEvidence: 'official-or-linguistic-translation',
    arabicEvidenceLabel: 'ترجمة عربية رسمية متاحة من Cambridge Autism Research Centre',
    arabicEvidenceNote: 'وجود الترجمة الرسمية يثبت التوفر اللغوي، لا يثبت وحده الخصائص السيكومترية في كل مجتمع عربي ولا يبرر تعديل الأداة.',
    evidenceUrl: ICHOM_AUTISM_REFERENCE_GUIDE,
    evidenceCitation: 'ICHOM Autism Reference Guide — Empathy Quotient: freely available online, license not needed; Cambridge ARC provides an official Arabic translation',
    lastVerified: '2026-09-06',
  },
  'psq-autism': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف تشغيليًا — ICHOM يقول License not needed بينما ATS يصف مسار ترخيص مجاني للبحث؛ الخلاف محفوظ صراحة',
    rightsStatus: 'not-reviewed',
    rightsNote: 'دليل ICHOM الرسمي يذكر Pediatric Sleep Questionnaire كأداة freely available online وLicense not needed، بينما صفحة American Thoracic Society تصفها بأنها licensed free for academic/research use وتوجّه إلى المطور للتصريح. بسبب اختلاف الصياغة بين مصدرين موثوقين لا نصفها كأداة مدفوعة ولا كملك عام؛ تبقى غير تشغيلية حتى نحسم شروط إعادة الاستضافة العامة.',
    arabicEvidence: 'psychometric-context',
    arabicEvidenceLabel: 'تحقق عربي سعودي منشور — دليل سياقي منفصل عن مسألة الترخيص',
    arabicEvidenceNote: 'دراسة Sleep Medicine 2023 دعمت النسخة العربية السعودية في عينة أطفال محددة. لا تعمم العتبات ولا تنقل حق إعادة النشر.',
    evidenceUrl: ICHOM_AUTISM_REFERENCE_GUIDE,
    evidenceCitation: 'ICHOM Autism Reference Guide — PSQ: freely available online, license not needed; ATS describes a free academic/research licensing path. Rights discrepancy intentionally unresolved.',
    lastVerified: '2026-09-06',
  },
  'bisq-autism': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف تشغيليًا — BISQ موثق كمتاح للعامة ومجاني للاستخدام، لكن العربية الدقيقة لم تُدقق بعد',
    rightsStatus: 'rawafid-provenance-verified',
    rightsNote: 'دليل ICHOM الرسمي يذكر Brief Infant Sleep Questionnaire بأنه publicly available and free to use. وتعرضه مصادر النوم المؤسسية كأداة متاحة. لذلك لا نسجله كأداة مقيدة، لكن لا ننشر نسخة عربية أو نموذجًا تشغيليًا قبل إثبات النسخة العربية الدقيقة والتوافق العمري.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم يثبت بعد تحقق عربي للـBISQ نفسه في سجل روافد',
    arabicEvidenceNote: 'دراسات لمقاييس نوم عربية أخرى لا تُنقل إلى BISQ، كما أن ترجمات غير عربية لا تُعامل كدليل عربي.',
    evidenceUrl: ATS_BISQ,
    evidenceCitation: 'ICHOM Autism Reference Guide — BISQ: publicly available and free to use; Arabic exact-version evidence not yet established in Rawafid',
    lastVerified: '2026-09-06',
  },
  'panas-autism': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'غير مضاف تشغيليًا — ICHOM يذكر free to use مع غياب معلومات ترخيص، والإصدار لا يزال غير محسوم',
    rightsStatus: 'not-reviewed',
    rightsNote: 'دليل ICHOM الرسمي يذكر PANAS/PANAS-Children: لا تتوفر معلومات ترخيص وfree to use. لذلك نصحح وصف Wave 4 كـowner-controlled قطعي. وبسبب بقاء الإصدار/الفئة العمرية غير محددين بدقة، لا ننشر نموذجًا حتى نثبت PANAS مقابل PANAS-C وتعليمات الفترة المرجعية وشروط النسخة.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم يُدقق بعد الإصدار العربي المطابق لما يقصده ICHOM',
    arabicEvidenceNote: 'وجود ترجمات PANAS عربية في الأدبيات لا يكفي من دون exact-version matching.',
    evidenceUrl: ICHOM_AUTISM_REFERENCE_GUIDE,
    evidenceCitation: 'ICHOM Autism Reference Guide — PANAS/PANAS-Children: no licensing information available; free to use. Exact-version remains unresolved.',
    lastVerified: '2026-09-06',
  },
  'mcmaster-fad-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — ICHOM يذكر أن رسوم ترخيص FAD تحدد بناءً على نموذج التسجيل',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'دليل ICHOM الرسمي يذكر أن licensing fees لـMcMaster Family Assessment Device تحدد وفق المعلومات المقدمة في registration form. هذا المصدر أقرب مباشرة إلى تنفيذ Standard Set من صفحات ثانوية تصف الأداة بأنها غير محمية؛ لذلك نحفظها كأداة تتطلب مسار ترخيص/تسجيل قبل استضافة النموذج أو تشغيله.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم يكتمل تدقيق نسخة عربية مطابقة وشروط استخدامها',
    arabicEvidenceNote: 'أي ترجمة عربية يجب ربطها بالإصدار/المقاييس الفرعية المقصودة وبشروط المالك الحالية.',
    evidenceUrl: ICHOM_AUTISM_REFERENCE_GUIDE,
    evidenceCitation: 'ICHOM Autism Reference Guide — FAD licensing fees determined from registration information; this set-specific implementation source governs Rawafid status',
    lastVerified: '2026-09-06',
  },
  'srs-autism': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — SRS/SRS-2 يجب شراؤه للاستخدام وفق ICHOM/WPS',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'دليل ICHOM الرسمي يذكر أن SRS يجب شراؤه للاستخدام. WPS يوزع SRS-2 كأداة تجارية. كما أن سجل ICHOM/المنشور لا يُعامل الاسم SRS وSRS-2 كإصدار واحد تلقائيًا؛ يجب تثبيت الإصدار قبل أي تطبيق.',
    arabicEvidence: 'not-audited',
    arabicEvidenceLabel: 'لم تُثبت بعد نسخة عربية مرخصة مطابقة للإصدار المقصود',
    arabicEvidenceNote: 'لا نعتبر وجود ترجمات غير رسمية أو دراسات على إصدار آخر دليلًا كافيًا دون مطابقة الإصدار والترخيص.',
    evidenceUrl: WPS_SRS,
    evidenceCitation: 'ICHOM Autism Reference Guide — SRS: must be purchased for use; WPS SRS-2 product/translation terms; exact edition remains explicit',
    lastVerified: '2026-09-06',
  },
};

export function applyInstrumentRightsAuditWave5(record: InstrumentCrosswalkRecord): InstrumentCrosswalkRecord {
  const override = overridesWave5[record.id];
  if (!override) return record;

  const operational = override.rawafidStatus === 'operational-full';
  return {
    ...record,
    ...override,
    internalPath: operational ? record.internalPath : undefined,
    catalogSync: record.catalogMatchedSlug && (override.rawafidStatus === 'reference-rights' || override.rightsStatus === 'license-or-permission-required')
      ? 'rights-conflict'
      : record.catalogSync,
    catalogSyncNote: [
      record.catalogSyncNote,
      'Rights Audit Wave 5 يطبق دليل ICHOM الرسمي الخاص بترخيص أدوات Autism Standard Set كمرجع أولي أقوى، ويصحح الأحكام الأشد السابقة عندما يقول المصدر صراحة free to use أو license not needed. هذا لا يلغي تدقيق الإصدار والعربية وإعادة الاستضافة قبل التشغيل.',
    ].filter(Boolean).join(' '),
  };
}
