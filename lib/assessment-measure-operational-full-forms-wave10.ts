import type { AssessmentOperationalMaterial } from '@/lib/assessment-measure-operational';

const OFFICIAL_IPAQ_HOME = 'https://sites.google.com/view/ipaq/home';
const OFFICIAL_IPAQ_DOWNLOAD = 'https://sites.google.com/view/ipaq/download';
const OFFICIAL_IPAQ_SCORE = 'https://sites.google.com/view/ipaq/score';
const OFFICIAL_IPAQ_FAQ = 'https://sites.google.com/view/ipaq/faq';
const OFFICIAL_ENGLISH_SHORT = 'https://drive.google.com/file/d/1LMCwPR0ddtdkb3uIuKPccip7ooD8wmrf/view';
const OFFICIAL_ARABIC_SAUDI_SHORT = 'https://drive.google.com/file/d/1kUhVObA_K-Tr81onZQp6Y8RmilTKqRNY/view';

export const assessmentOperationalFullFormsWave10: Record<string, AssessmentOperationalMaterial> = {
  'international-physical-activity-questionnaire-short-form-self-administered': {
    slug: 'international-physical-activity-questionnaire-short-form-self-administered',
    kind: 'scoring-form',
    completeness: 'recording-and-scoring-sheet',
    titleAr: 'ورقة تسجيل وحساب IPAQ-SF — النسخة القصيرة ذاتية التطبيق لآخر 7 أيام',
    titleEn: 'IPAQ-SF Short Last 7 Days Self-Administered — Recording and Scoring Worksheet',
    version: 'August 2002 Short Last 7 Days Self-Administered format; scoring protocol revised November 2005',
    provenance: 'تعتمد الورقة على النسخة القصيرة ذاتية التطبيق المنشورة في موقع IPAQ الرسمي وعلى بروتوكول التسجيل والحساب الرسمي. موقع IPAQ يصف الأداة بأنها publicly available / open access ولا تتطلب إذنًا للاستخدام، ويعرض النسخة الإنجليزية ونسخة عربية (Saudi Arabia) ضمن مستودع التنزيلات. تحذر الجهة نفسها من أن كثيرًا من الترجمات المرفوعة قُدمت من باحثين مستقلين ولم تتحقق الجهة من دقتها؛ لذلك لا تعيد روافد صياغة البنود العربية ولا تصف الملف العربي بأنه اعتماد لغوي من IPAQ.',
    rightsNotice: 'تستخدم هذه الصفحة حق IPAQ المفتوح وتربط مباشرة بالنسخ الرسمية المنشورة. هذه ورقة تسجيل وحساب وليست إعادة نشر حرفية للترجمة العربية. يجب إبقاء النسب إلى IPAQ، والإشارة إلى أي تعديل عند إنشاء نسخة مشتقة، وعدم تقديم نتيجة النشاط كتشخيص أو تصريح طبي لممارسة الرياضة.',
    intendedUseAr: 'تسجيل إجابات IPAQ-SF المأخوذة من النسخة الرسمية ثم حساب النشاط المستمر بوحدة MET-min/week وتصنيفه إلى منخفض/متوسط/مرتفع وفق بروتوكول IPAQ. لا تقيس الورقة اللياقة البدنية ولا تحدد سلامة ممارسة التمرين لشخص بعينه.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'البلد/اللغة', 'نسخة IPAQ المستخدمة', 'طريقة التطبيق'],
    preflightChecks: [
      'استخدم النسخة الرسمية المطابقة: Short Last 7 Days Self-Administered، ولا تخلطها مع Long Form أو Telephone Form أو IPAQ-Elderly.',
      'تأكد أن الإجابات تشير إلى الأيام السبعة السابقة وأن النشاط المسجل يطابق تعريفات الشدة في النسخة المستخدمة.',
      'اعتمد فقط الفترات التي تحقق شرط الاستمرار الوارد في النسخة الرسمية؛ لا تخترع إجابات عند غياب الأيام أو الدقائق.',
      'عند استخدام الملف العربي المنشور في مستودع IPAQ، وثّق أنه Arabic (Saudi Arabia) self-admin short ولا تعممه بوصفه نسخة عربية موحدة لكل البلدان.',
    ],
    sections: [
      {
        titleAr: 'النشاط شديد الشدة',
        titleEn: 'Vigorous-intensity activity',
        instructionsAr: 'انسخ القيم من استبيان IPAQ-SF الرسمي؛ لا تعيد تفسير السؤال أثناء التسجيل.',
        items: [
          { code: 'IPAQSF-VIG-DAYS', labelAr: 'عدد أيام النشاط شديد الشدة خلال آخر 7 أيام', labelEn: 'Days of vigorous-intensity activity in the last 7 days', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQSF-VIG-MIN', labelAr: 'الدقائق المعتادة في أحد تلك الأيام', labelEn: 'Minutes per usual vigorous-intensity day', type: 'number', min: 0, max: 1440, unit: 'دقيقة/يوم' },
        ],
      },
      {
        titleAr: 'النشاط متوسط الشدة',
        titleEn: 'Moderate-intensity activity',
        instructionsAr: 'سجل النشاط المتوسط وفق تعريف النسخة الرسمية، مع إبقاء المشي في القسم المنفصل أدناه.',
        items: [
          { code: 'IPAQSF-MOD-DAYS', labelAr: 'عدد أيام النشاط متوسط الشدة خلال آخر 7 أيام', labelEn: 'Days of moderate-intensity activity in the last 7 days', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQSF-MOD-MIN', labelAr: 'الدقائق المعتادة في أحد تلك الأيام', labelEn: 'Minutes per usual moderate-intensity day', type: 'number', min: 0, max: 1440, unit: 'دقيقة/يوم' },
        ],
      },
      {
        titleAr: 'المشي',
        titleEn: 'Walking',
        items: [
          { code: 'IPAQSF-WALK-DAYS', labelAr: 'عدد أيام المشي خلال آخر 7 أيام', labelEn: 'Days of walking in the last 7 days', type: 'number', min: 0, max: 7, unit: 'يوم/أسبوع' },
          { code: 'IPAQSF-WALK-MIN', labelAr: 'الدقائق المعتادة للمشي في أحد تلك الأيام', labelEn: 'Minutes walking per usual walking day', type: 'number', min: 0, max: 1440, unit: 'دقيقة/يوم' },
        ],
      },
      {
        titleAr: 'الجلوس',
        titleEn: 'Sitting',
        items: [
          { code: 'IPAQSF-SIT-MIN', labelAr: 'إجمالي وقت الجلوس في يوم اعتيادي من أيام الأسبوع وفق النسخة الرسمية', labelEn: 'Sitting time on a usual weekday as recorded by the official form', type: 'number', min: 0, max: 1440, unit: 'دقيقة/يوم', noteAr: 'وقت الجلوس مؤشر منفصل ولا يدخل في مجموع MET-min/week للنشاط.' },
        ],
      },
    ],
    scoringSteps: [
      'طبّق قواعد تنظيف البيانات الرسمية قبل الحساب. إذا كانت قيمة الأيام أو الدقائق غير صالحة أو مفقودة فلا تستنتجها من تلقاء نفسك؛ ارجع إلى بروتوكول IPAQ.',
      'لـIPAQ-SF تُحسب مساهمة المشي عادةً: 3.3 MET × دقائق المشي/اليوم × أيام المشي/الأسبوع.',
      'تُحسب مساهمة النشاط متوسط الشدة عادةً: 4.0 MET × دقائق النشاط المتوسط/اليوم × أيام النشاط المتوسط/الأسبوع.',
      'تُحسب مساهمة النشاط شديد الشدة عادةً: 8.0 MET × دقائق النشاط الشديد/اليوم × أيام النشاط الشديد/الأسبوع.',
      'المجموع المستمر = Walking MET-min/week + Moderate MET-min/week + Vigorous MET-min/week. لا تضف وقت الجلوس إلى هذا المجموع.',
      'التصنيف «متوسط» يتحقق عند استيفاء واحد من معايير IPAQ الرسمية: 3 أيام أو أكثر من نشاط شديد ≥20 دقيقة/يوم؛ أو 5 أيام أو أكثر من نشاط متوسط/مشي ≥30 دقيقة/يوم؛ أو 5 أيام أو أكثر من أي مزيج يحقق ≥600 MET-min/week.',
      'التصنيف «مرتفع» يتحقق عند استيفاء أحد المعيارين الرسميين: نشاط شديد ≥3 أيام مع ≥1500 MET-min/week؛ أو 7 أيام أو أكثر من أي مزيج يحقق ≥3000 MET-min/week.',
      'إذا لم تتحقق معايير المتوسط أو المرتفع فالتصنيف «منخفض/غير نشط» وفق بروتوكول IPAQ.',
      'عند وجود اختلاف بين هذه الورقة وأحدث بروتوكول رسمي منشور من IPAQ، تكون النسخة الرسمية هي المرجع الحاكم ويجب تحديث سجل روافد قبل استخراج نتيجة نهائية.',
    ],
    interpretationGuardrails: [
      'IPAQ أداة تقرير ذاتي للمراقبة السكانية والبحوث؛ لا تقيس القدرة القلبية التنفسية مباشرة ولا تحل محل accelerometer أو اختبار الجهد.',
      'الصدق المعياري مقابل مقاييس موضوعية قد يكون محدودًا، والنتائج عرضة للتذكر والمبالغة/النقص في التقرير.',
      'MET-min/week تقدير معياري للمقارنة وليس قياسًا مباشرًا لاستهلاك الطاقة الفردي.',
      'التصنيف لا يقرر تلقائيًا وصفة تمرين، شدة تدريب أو صلاحية طبية لممارسة النشاط.',
      'الملف العربي الموجود في مستودع IPAQ لا يُعامل تلقائيًا كنسخة عربية محققة لكل بلد؛ يجب توثيق النسخة والسياق ودراسة التحقق عند الاستخدام البحثي الدقيق.',
    ],
    stopRules: [
      'إذا كانت بيانات الأيام/الدقائق غير متسقة أو خارج النطاق فلا تحسب نتيجة قبل مراجعة الإدخال وقواعد التنظيف الرسمية.',
      'إذا استُخدمت نسخة غير Short Last 7 Days Self-Administered فلا تستخدم هذه الورقة كأنها مطابقة؛ اختر بروتوكول الإصدار الصحيح.',
      'وجود ألم صدري، ضيق نفس غير معتاد، إغماء، أعراض عصبية حادة أو مانع طبي محتمل يستلزم تقييمًا صحيًا مناسبًا؛ لا تستخدم IPAQ لإعطاء تصريح سلامة لممارسة الرياضة.',
    ],
    officialDownloads: [
      { label: 'IPAQ official downloads — all questionnaire versions', url: OFFICIAL_IPAQ_DOWNLOAD, language: 'en', publisher: 'IPAQ' },
      { label: 'IPAQ English — self-administered short form', url: OFFICIAL_ENGLISH_SHORT, language: 'en', publisher: 'IPAQ' },
      { label: 'IPAQ Arabic (Saudi Arabia) — self-administered short form', url: OFFICIAL_ARABIC_SAUDI_SHORT, language: 'ar', publisher: 'IPAQ download repository' },
      { label: 'IPAQ official scoring protocol page', url: OFFICIAL_IPAQ_SCORE, language: 'en', publisher: 'IPAQ' },
    ],
    sourceUrls: [
      OFFICIAL_IPAQ_HOME,
      OFFICIAL_IPAQ_DOWNLOAD,
      OFFICIAL_IPAQ_SCORE,
      OFFICIAL_IPAQ_FAQ,
      OFFICIAL_ENGLISH_SHORT,
      OFFICIAL_ARABIC_SAUDI_SHORT,
      'https://pubmed.ncbi.nlm.nih.gov/12900694/',
      'https://pubmed.ncbi.nlm.nih.gov/42040138/',
    ],
    lastVerifiedOn: '2026-09-06',
  },
};
