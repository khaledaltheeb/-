import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const SWLS_OFFICIAL = 'https://labs.psychology.illinois.edu/~ediener/Documents/SWLS.html';
const SWLS_ARABIC_OFFICIAL = 'https://labs.psychology.illinois.edu/~ediener/Documents/SWLS_Arabic2.pdf';

const agreement7: OperationalOption[] = [
  { labelAr: '1 — لا أوافق بشدة', labelEn: 'Strongly disagree', value: '1', score: 1 },
  { labelAr: '2 — لا أوافق', labelEn: 'Disagree', value: '2', score: 2 },
  { labelAr: '3 — لا أوافق قليلًا', labelEn: 'Slightly disagree', value: '3', score: 3 },
  { labelAr: '4 — محايد', labelEn: 'Neither agree nor disagree', value: '4', score: 4 },
  { labelAr: '5 — أوافق قليلًا', labelEn: 'Slightly agree', value: '5', score: 5 },
  { labelAr: '6 — أوافق', labelEn: 'Agree', value: '6', score: 6 },
  { labelAr: '7 — أوافق بشدة', labelEn: 'Strongly agree', value: '7', score: 7 },
];

export const assessmentOperationalFullFormsWave11: Record<string, AssessmentOperationalMaterial> = {
  'satisfaction-with-life-scale': {
    slug: 'satisfaction-with-life-scale',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'ورقة تسجيل وحساب مقياس الرضا عن الحياة (SWLS)',
    titleEn: 'Satisfaction With Life Scale (SWLS) — Recording and Scoring Worksheet',
    version: 'Original 5-item SWLS, Diener et al. 1985',
    provenance: 'صفحة Ed Diener الرسمية تنص صراحةً على أن SWLS في المجال العام وغير محمي بحقوق النشر، وأن جميع المختصين والباحثين يمكنهم استخدامه بلا إذن أو رسوم مع نسبة المؤلفين. الصفحة الرسمية تصف الأداة بأنها خمسة بنود وتربط بالنسخة الإنجليزية وبترجمات متعددة؛ كما يستضيف مجلد المؤلف ملف SWLS_Arabic2.pdf. بسبب ظهور خلل ترميز عند استخراج النص العربي آليًا، لا تعيد روافد كتابة نص الترجمة من استخراج مشوّه؛ هذه الورقة تسجل درجات البنود الخمسة بعد تطبيق النسخة الرسمية المستخدمة.',
    rightsNotice: 'SWLS Public Domain وفق صفحة Ed Diener الرسمية. يجب نسبة الأداة إلى Ed Diener وRobert A. Emmons وRandy J. Larsen وSharon Griffin مع مرجع 1985. ورقة روافد لا تدعي أن صياغة عربية محلية جديدة هي الترجمة الرسمية؛ عند التطبيق بالعربية استخدم الملف العربي المستضاف لدى صاحب المقياس أو نسخة عربية محددة موثقة.',
    intendedUseAr: 'قياس الحكم المعرفي العام على الرضا عن الحياة عبر خمسة بنود. المقياس لا يشخّص الاكتئاب أو أي اضطراب نفسي، ولا يستبدل التقييم السريري عندما توجد أعراض أو مخاطر نفسية.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'اللغة/النسخة المستخدمة', 'سياق التطبيق'],
    preflightChecks: [
      'ثبت النسخة واللغة قبل التطبيق، ولا تخلط صياغات من ترجمات عربية مختلفة في المتابعة الطولية.',
      'استخدم مقياس الاستجابة 1–7 نفسه لكل البنود الخمسة.',
      'إذا استُخدم الملف العربي المستضاف رسميًا، وثّق اسم الملف/الرابط ولا تنسخ نصًا مشوّهًا من OCR أو استخراج PDF.',
      'لا تستخدم SWLS كأداة فرز للانتحار أو كتشخيص للاكتئاب؛ انخفاض الرضا يحتاج تفسيرًا ضمن السياق الأوسع.',
    ],
    sections: [
      {
        titleAr: 'درجات البنود الخمسة من النسخة الرسمية المستخدمة',
        titleEn: 'Five item scores from the official version used',
        instructionsAr: 'اقرأ البنود من النسخة الرسمية الإنجليزية أو الترجمة العربية الموثقة المستخدمة، ثم سجل هنا درجة كل بند من 1 إلى 7. تعمدت روافد عدم إعادة كتابة نص الترجمة العربية من ملف PDF ذي استخراج آلي مشوّه.',
        items: [
          { code: 'SWLS-1', labelAr: 'درجة البند 1 من النسخة الرسمية', labelEn: 'Official SWLS item 1 score', type: 'choice', options: agreement7 },
          { code: 'SWLS-2', labelAr: 'درجة البند 2 من النسخة الرسمية', labelEn: 'Official SWLS item 2 score', type: 'choice', options: agreement7 },
          { code: 'SWLS-3', labelAr: 'درجة البند 3 من النسخة الرسمية', labelEn: 'Official SWLS item 3 score', type: 'choice', options: agreement7 },
          { code: 'SWLS-4', labelAr: 'درجة البند 4 من النسخة الرسمية', labelEn: 'Official SWLS item 4 score', type: 'choice', options: agreement7 },
          { code: 'SWLS-5', labelAr: 'درجة البند 5 من النسخة الرسمية', labelEn: 'Official SWLS item 5 score', type: 'choice', options: agreement7 },
        ],
      },
    ],
    scoringSteps: [
      'اجمع درجات البنود الخمسة؛ كل بند 1–7، لذا يتراوح المجموع من 5 إلى 35.',
      'النطاقات الوصفية الشائعة المنشورة مع مواد SWLS: 31–35 راضٍ جدًا، 26–30 راضٍ، 21–25 راضٍ إلى حد ما، 20 محايد، 15–19 غير راضٍ إلى حد ما، 10–14 غير راضٍ، 5–9 غير راضٍ جدًا.',
      'استخدم المجموع للمقارنة الوصفية أو الطولية فقط مع توثيق النسخة واللغة والسياق؛ لا تحوله إلى تشخيص نفسي.',
      'عند مقارنة قياسات متكررة استخدم النسخة واللغة وخيارات الاستجابة نفسها، وفسر التغير مع خطأ القياس والسياق وليس بالرقم منفردًا.',
    ],
    interpretationGuardrails: [
      'SWLS يقيس الرضا العام عن الحياة كحكم معرفي ولا يقيس المزاج اللحظي وحده.',
      'الحدود الوصفية ليست عتبات تشخيصية ولا تعني أن الشخص يحتاج أو لا يحتاج علاجًا نفسيًا.',
      'اختلاف الثقافة واللغة والعمر والسياق قد يؤثر في توزيع الدرجات؛ لا تفترض تكافؤ كل ترجمة عربية دون دليل النسخة نفسها.',
      'النتيجة المنخفضة لا تكفي لتشخيص الاكتئاب، والنتيجة المرتفعة لا تنفي وجود ضيق أو اضطراب نفسي.',
    ],
    stopRules: [
      'إذا ظهرت أثناء التطبيق معلومات عن خطر فوري على النفس أو الآخرين، أوقف الاستخدام الروتيني وانتقل إلى مسار السلامة المناسب؛ SWLS ليس أداة تقييم خطر.',
      'إذا لم تُستخدم نسخة موثقة أو تغيّر سلم الاستجابة عن 1–7 فلا تحسب مجموعًا على أنه SWLS القياسي.',
      'إذا تعذر فهم البنود أو الاستجابة بسبب حاجز لغوي/معرفي فلا تستخرج درجة غير موثوقة؛ استخدم طريقة أو نسخة ملائمة.',
    ],
    officialDownloads: [
      { label: 'Ed Diener official SWLS page — permission, English form and scoring resources', url: SWLS_OFFICIAL, language: 'en', publisher: 'Ed Diener / University of Illinois' },
      { label: 'SWLS Arabic translation hosted in Ed Diener document repository', url: SWLS_ARABIC_OFFICIAL, language: 'ar', publisher: 'Ed Diener document repository' },
    ],
    sourceUrls: [
      SWLS_OFFICIAL,
      SWLS_ARABIC_OFFICIAL,
      'https://doi.org/10.1207/s15327752jpa4901_13',
    ],
    lastVerifiedOn: '2026-09-06',
  },
};
