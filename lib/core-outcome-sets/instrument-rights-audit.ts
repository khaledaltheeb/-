import type { InstrumentCrosswalkRecord } from '@/lib/core-outcome-sets/instrument-crosswalk';

const NHS_NCCR = 'https://digital.nhs.uk/services/national-clinical-content-repository-copyright-licensing-service/nccr-tools-and-measures-library';
const KIDSCREEN_TERMS = 'https://www.kidscreen.org/english/terms-of-use/';
const SURE_TERMS = 'https://www.kcl.ac.uk/research/sure-substance-use-recovery-evaluator';
const HSI_SAMHSA = 'https://www.ncbi.nlm.nih.gov/books/NBK574912/box/p2.b7/?report=objectonly';

const auditedOverrides: Record<string, Partial<InstrumentCrosswalkRecord>> = {
  'kidscreen-10': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — الاستخدام مفتوح لكن إعادة التوزيع العامة مقيدة بشروط KIDSCREEN',
    rightsStatus: 'owner-conditions',
    rightsNote: 'KIDSCREEN يصف أدواته بأنها fully open-access، لكنه يحتفظ بحقوق النشر لجميع الاستبيانات والترجمات، ويطلب عدم تعديلها، وينص على أن إعادة الإنتاج تكون فقط ضمن النطاق المسموح وأن توزيع/نقل الاستبيانات إلى أطراف ثالثة غير مسموح. لذلك لا تنشر روافد نموذج KIDSCREEN-10 كاملًا للعامة أو تعيد توزيعه من تلقاء نفسها.',
    evidenceUrl: KIDSCREEN_TERMS,
    evidenceCitation: 'KIDSCREEN Group — Terms of Use & Copyright; open access does not waive copyright or third-party distribution restrictions',
    lastVerified: '2026-09-06',
  },
  'top-addiction-ichom': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — TOP أداة محمية ومدرجة ضمن مكتبة NHS المرخصة',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'NHS England NCCR يوضح أن مكتبته تضم أدوات تقييم محمية بحقوق النشر ويعرض Treatment Outcomes Profile مع Sub-licence available. هذا لا يمنح روافد ترخيص NHS؛ يلزم إذن/ترخيص مستقل قبل نسخ البنود أو تشغيلها إلكترونيًا.',
    evidenceUrl: NHS_NCCR,
    evidenceCitation: 'ICHOM addiction Standard Set; NHS England NCCR tools and measures library — TOP listed as copyrighted content with sub-licence available',
    lastVerified: '2026-09-06',
  },
  'pgsi': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — PGSI أداة محمية ومدرجة ضمن مكتبة NHS المرخصة',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'NHS England NCCR يصف مكتبته بأنها مكتبة أدوات محمية بحقوق النشر، ويعرض Problem Gambling Severity Index مع Sub-licence available. وجود الأداة في مصدر أو دراسة مفتوحة لا يساوي إذن إعادة نشر البنود؛ روافد تحتاج مسار إذن مستقل قبل التشغيل الكامل.',
    evidenceUrl: NHS_NCCR,
    evidenceCitation: 'ICHOM addiction Standard Set; NHS England NCCR tools and measures library — PGSI listed as copyrighted content with sub-licence available',
    lastVerified: '2026-09-06',
  },
  'igdt-10': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — IGDT-10 أداة محمية ومدرجة ضمن مكتبة NHS المرخصة',
    rightsStatus: 'license-or-permission-required',
    rightsNote: 'NHS England NCCR يدرج Internet Gaming Disorder Test-10 ضمن مكتبة أدوات محمية بحقوق النشر مع Sub-licence available. تراخيص المقالات التي درست IGDT-10 لا تُنقل تلقائيًا إلى حقوق نص الأداة نفسها، لذلك لا تنشر روافد البنود دون إذن مستقل.',
    evidenceUrl: NHS_NCCR,
    evidenceCitation: 'ICHOM addiction Standard Set; NHS England NCCR tools and measures library — IGDT-10 listed as copyrighted content with sub-licence available',
    lastVerified: '2026-09-06',
  },
  'sure-addiction': {
    rawafidStatus: 'reference-rights',
    rawafidStatusLabel: 'مرجعي — الاستخدام غير الربحي له شروط، والنشر/التخزين الإلكتروني يحتاج إذنًا',
    rightsStatus: 'owner-conditions',
    rightsNote: 'King’s College London يثبت Copyright © 2016 ويجيز استخدام SURE في الجمعيات غير الربحية أو الرعاية الصحية دون licence، لكنه يمنع التوزيع أو الاستغلال التجاري، وينص على أن النقل أو التخزين الإلكتروني يحتاج إذنًا كتابيًا. وبما أن روافد منصة ويب عامة، لا نعيد نشر النموذج الكامل إلكترونيًا دون موافقة المالك.',
    evidenceUrl: SURE_TERMS,
    evidenceCitation: 'King’s College London — SURE access and copyright terms; NHS England NCCR also lists SURE in its licensed copyrighted-content library',
    lastVerified: '2026-09-06',
  },
  'heaviness-of-smoking-index': {
    rawafidStatus: 'not-in-library',
    rawafidStatusLabel: 'فجوة حقوق قبل التشغيل — لا يُستنتج Public Domain من تقرير SAMHSA',
    rightsStatus: 'not-reviewed',
    rightsNote: 'يعرض SAMHSA/NCBI صيغة HSI داخل تقرير حكومي مفتوح، لكن العرض نفسه موسوم بأنه Adapted with permission. لذلك لا نعامل نص HSI أو scoring كملك عام لمجرد أن التقرير المحيط Public Domain؛ يلزم تثبيت مصدر الأداة وحق إعادة استخدامها بصورة مستقلة.',
    evidenceUrl: HSI_SAMHSA,
    evidenceCitation: 'SAMHSA TIP 63 / NCBI Bookshelf — HSI exhibit is explicitly marked “Adapted with permission”; instrument rights remain unresolved for Rawafid',
    lastVerified: '2026-09-06',
  },
};

export function applyInstrumentRightsAudit(record: InstrumentCrosswalkRecord): InstrumentCrosswalkRecord {
  const override = auditedOverrides[record.id];
  if (!override) return record;

  const restricted = override.rawafidStatus === 'reference-rights';
  return {
    ...record,
    ...override,
    internalPath: restricted ? undefined : record.internalPath,
    catalogSync: record.catalogMatchedSlug && restricted ? 'rights-conflict' : record.catalogSync,
    catalogSyncNote: [
      record.catalogSyncNote,
      restricted
        ? 'تدقيق الحقوق اللاحق يمنع تحويل وجود سجل داخلي أو سهولة الوصول إلى إذن لإعادة النشر؛ حالة المالك تتقدم على الترقية الآلية.'
        : 'تدقيق الحقوق اللاحق أبقى الأداة غير تشغيلية حتى يثبت حق النسخة نفسها.',
    ].filter(Boolean).join(' '),
  };
}
