import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const gadFrequency: OperationalOption[] = [
  { labelAr: 'أبدًا', labelEn: 'Not at all', value: '0', score: 0 },
  { labelAr: 'عدة أيام', labelEn: 'Several days', value: '1', score: 1 },
  { labelAr: 'أكثر من نصف الأيام', labelEn: 'More than half the days', value: '2', score: 2 },
  { labelAr: 'كل يوم تقريبًا', labelEn: 'Nearly every day', value: '3', score: 3 },
];

export const assessmentOperationalFullFormsWave9: Record<string, AssessmentOperationalMaterial> = {
  'generalized-anxiety-disorder-2': {
    slug: 'generalized-anxiety-disorder-2',
    kind: 'full-instrument',
    completeness: 'standardized-protocol-sheet',
    titleAr: 'مقياس اضطراب القلق العام — بندان (GAD-2)',
    titleEn: 'Generalized Anxiety Disorder-2 (GAD-2)',
    version: 'GAD-2 — first two GAD-7 items, two-week self-report',
    provenance: 'ملحق NICE المنشور عبر NCBI يعرّف GAD-2 بأنه أول بندين من GAD-7 ويذكر صراحة أن الإذن غير مطلوب لإعادة الإنتاج أو الترجمة أو العرض أو التوزيع. الصياغة العربية هنا تستخدم البندين الأولين نفسيهما من GAD-7 العربي الموجود أصلًا في مكتبة روافد والمرتبط بملف NIH HEAL العربي.',
    rightsNotice: 'لا يلزم إذن لإعادة إنتاج GAD-2 أو ترجمته أو عرضه أو توزيعه وفق ملحق NICE/NCBI. تحافظ روافد على البندين والفترة المرجعية وخيارات الاستجابة ولا تضيف بقية GAD-7 إلى مجموع GAD-2.',
    intendedUseAr: 'فحص أولي سريع لأعراض القلق خلال الأسبوعين الماضيين لتحديد الحاجة إلى تقييم أوسع. النتيجة ليست تشخيصًا لاضطراب القلق العام أو لأي اضطراب قلق آخر.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'سياق التطبيق'],
    preflightChecks: ['تأكيد الفترة المرجعية: الأسبوعان الماضيان.', 'استخدام البندين الأولين فقط من GAD-7 مع خيارات الاستجابة 0–3.', 'عدم استخدام الأداة كبديل عن التقييم السريري عند وجود ضيق شديد أو أعراض طبية أو نفسية حادة.'],
    sections: [{
      titleAr: 'خلال الأسبوعين الماضيين، كم مرة انزعجت من المشكلات التالية؟',
      items: [
        { code: 'GAD2-1', labelAr: 'الشعور بالعصبية أو القلق أو التوتر.', labelEn: 'Feeling nervous, anxious or on edge', type: 'choice', options: gadFrequency },
        { code: 'GAD2-2', labelAr: 'عدم القدرة على إيقاف القلق أو السيطرة عليه.', labelEn: 'Not being able to stop or control worrying', type: 'choice', options: gadFrequency },
      ],
    }],
    scoringSteps: ['اجمع درجتي البندين: 0–3 لكل بند، والمجموع الكلي 0–6.', 'الدرجة ≥3 عتبة فحص شائعة لتحديد الحاجة إلى تقييم أوسع، وليست حدًا تشخيصيًا ثابتًا لكل مجتمع.', 'لا تضف البنود 3–7 من GAD-7 إلى مجموع GAD-2؛ إذا احتجت تقييمًا أوسع فاستخدم GAD-7 كأداة منفصلة.', 'فسر النتيجة مع السياق السريري، الوظيفة، الأعراض المصاحبة والأسباب الطبية/الدوائية المحتملة.'],
    interpretationGuardrails: ['GAD-2 أداة screening مختصرة وليست تشخيصًا.', 'الحساسية والنوعية والعتبة المثلى تختلف باختلاف المجتمع والمرجع التشخيصي والغرض.', 'دراسة عربية منشورة في 2026 قيّمت GAD-2 لدى عينة محددة من أمهات سعوديات لأطفال ذوي إعاقة ذهنية؛ لا تُعمم عتبات تلك الدراسة أو خصائصها على كل السكان العرب.', 'وجود نتيجة منخفضة لا ينفي القلق السريري إذا كانت القصة أو الوظيفة تشير إلى مشكلة تحتاج تقييمًا.'],
    stopRules: ['عند وجود أزمة نفسية حادة أو خطر مباشر على النفس أو الآخرين انتقل إلى مسار السلامة/الطوارئ المحلي بدل الاستمرار كفحص روتيني.', 'إذا كانت الأعراض قد تمثل حالة طبية حادة أو تأثير دواء/مادة، يلزم تقييم مناسب بدل الاعتماد على GAD-2.', 'إذا تعذر فهم الفترة المرجعية أو خيارات الاستجابة فلا تستخرج درجة غير موثوقة.'],
    officialDownloads: [
      { label: 'NICE / NCBI Bookshelf — GAD-2 questionnaire and reuse statement', url: 'https://www.ncbi.nlm.nih.gov/books/NBK92248/', language: 'en', publisher: 'NICE / NCBI Bookshelf' },
      { label: 'NIH HEAL CDE — GAD-7 Arabic CRF', url: 'https://www.nih.gov/node/19876', language: 'ar', publisher: 'NIH' },
    ],
    sourceUrls: [
      'https://www.ncbi.nlm.nih.gov/books/NBK92248/',
      'https://www.nih.gov/node/19876',
      'https://pubmed.ncbi.nlm.nih.gov/17339617/',
      'https://pubmed.ncbi.nlm.nih.gov/42084504/',
    ],
    lastVerifiedOn: '2026-09-06',
  },
};
