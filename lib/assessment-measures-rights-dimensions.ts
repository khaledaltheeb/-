import type { AssessmentMeasure } from '@/lib/assessment-measures';

export type MeasureRightsDimensionStatus =
  | 'public-domain'
  | 'open-reuse'
  | 'source-specific'
  | 'translation-evidence-only'
  | 'translation-rights-unverified'
  | 'arabic-republication-verified-protocol'
  | 'arabic-republication-withheld';

export type AssessmentMeasureRightsDimensions = {
  originalInstrument: {
    status: 'public-domain' | 'open-reuse';
    label: string;
    note: string;
    sourceUrl: string | null;
    sourceLabel: string | null;
  };
  sourceDocument: {
    status: 'source-specific';
    label: string;
    note: string;
  };
  arabicVersion: {
    status: 'translation-evidence-only' | 'translation-rights-unverified';
    label: string;
    note: string;
    evidenceUrl: string | null;
    evidenceLabel: string | null;
  };
  arabicRepublication: {
    status: 'arabic-republication-verified-protocol' | 'arabic-republication-withheld';
    label: string;
    note: string;
  };
};

const failClosedArabicRepublication = new Set<string>([
  'heaviness-of-smoking-index',
]);

/**
 * Rights are deliberately modelled as independent dimensions.
 * Public-domain/open-reuse status of an instrument never propagates to a
 * publisher's document, a third-party translation, or an Arabic reproduction.
 */
export function getAssessmentMeasureRightsDimensions(measure: AssessmentMeasure): AssessmentMeasureRightsDimensions {
  const rightsSource = measure.sources.find((source) => source.role === 'rights') ?? null;
  const translationSource = measure.sources.find((source) => source.role === 'translation') ?? null;
  const arabicRepublicationAllowed = measure.fullArabicFormPublished && !failClosedArabicRepublication.has(measure.slug);

  return {
    originalInstrument: {
      status: measure.rightsStatus,
      label: measure.rightsLabel,
      note: measure.rightsNote,
      sourceUrl: rightsSource?.url ?? null,
      sourceLabel: rightsSource?.label ?? null,
    },
    sourceDocument: {
      status: 'source-specific',
      label: 'حقوق الوثيقة تُراجع منفصلة',
      note: 'حالة الأداة لا تمنح تلقائيًا حق نسخ صفحة الناشر أو ملف PDF أو الدليل أو الرسوم أو الجداول التابعة لمصدر بعينه.',
    },
    arabicVersion: translationSource
      ? {
          status: 'translation-evidence-only',
          label: 'يوجد دليل/مصدر عربي — حق التوزيع مستقل',
          note: `${measure.arabicNote} وجود دراسة تحقق أو ملف ترجمة يثبت وجود نسخة لغوية أو يصفها، لكنه لا يساوي تلقائيًا ترخيص إعادة استضافتها أو توزيع نصها.`,
          evidenceUrl: translationSource.url,
          evidenceLabel: translationSource.label,
        }
      : {
          status: 'translation-rights-unverified',
          label: 'لا يوجد مصدر ترجمة مستقل في السجل الحالي',
          note: `${measure.arabicNote} لا نستنتج حق الترجمة أو إعادة توزيعها من حقوق الأصل.`,
          evidenceUrl: null,
          evidenceLabel: null,
        },
    arabicRepublication: arabicRepublicationAllowed
      ? {
          status: 'arabic-republication-verified-protocol',
          label: 'النشر العربي مسموح وفق دليل الحقوق المحدد لهذه الأداة',
          note: measure.fullArabicFormNote,
        }
      : {
          status: 'arabic-republication-withheld',
          label: failClosedArabicRepublication.has(measure.slug)
            ? 'موقوف تحفظيًا — حق الترجمة/إعادة النشر يحتاج دليلًا مستقلًا'
            : 'النص العربي الكامل غير منشور',
          note: failClosedArabicRepublication.has(measure.slug)
            ? 'أبقينا الدليل العلمي للمقياس، لكننا أوقفنا النموذج العربي التشغيلي لأن إتاحة الاستخدام لا تُفسر تلقائيًا كترخيص لنشر ترجمة عربية جديدة.'
            : measure.fullArabicFormNote,
        },
  };
}
