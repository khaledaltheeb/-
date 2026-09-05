import type { AssessmentOperationalMaterial, OperationalOption } from '@/lib/assessment-measure-operational';

const phqFrequency: OperationalOption[] = [
  { labelAr: 'أبدًا', labelEn: 'Not at all', value: '0', score: 0 },
  { labelAr: 'عدة أيام', labelEn: 'Several days', value: '1', score: 1 },
  { labelAr: 'أكثر من نصف الأيام', labelEn: 'More than half the days', value: '2', score: 2 },
  { labelAr: 'كل يوم تقريبًا', labelEn: 'Nearly every day', value: '3', score: 3 },
];

export const assessmentOperationalFullFormsWave8: Record<string, AssessmentOperationalMaterial> = {
  'patient-health-questionnaire-2': {
    slug: 'patient-health-questionnaire-2',
    kind: 'full-instrument',
    completeness: 'exact-public-domain-form',
    titleAr: 'استبيان صحة المريض — بندان (PHQ-2)',
    titleEn: 'Patient Health Questionnaire-2 (PHQ-2)',
    version: 'PHQ-2 — first two PHQ-9 items, two-week self-report',
    provenance: 'NIH HEAL Common Data Elements يوفر PHQ-2 بالعربية ويعرض Copyright: No. البندان هما البندان الأولان من PHQ-9؛ الصياغة العربية هنا متطابقة مع صياغة PHQ-9 التشغيلية المرتبطة بمصدر NIH داخل روافد.',
    rightsNotice: 'لا يلزم إذن لإعادة إنتاج PHQ-2 أو ترجمته أو عرضه أو توزيعه وفق سجل NIH CDE/PHQ. حافظ على البندين والفترة المرجعية وخيارات الاستجابة دون تحويل الأداة إلى نسخة معدلة.',
    intendedUseAr: 'فحص أولي سريع لأعراض الاكتئاب خلال الأسبوعين الماضيين. لا يشخص اضطرابًا اكتئابيًا ولا يقيّم خطر الانتحار.',
    respondentFields: ['الاسم/الرمز', 'التاريخ', 'العمر', 'سياق التطبيق'],
    preflightChecks: ['تأكيد الفترة المرجعية: الأسبوعان الماضيان.', 'توفير خصوصية مناسبة للإجابة.', 'عدم استخدام PHQ-2 كبديل عن سؤال السلامة المباشر عند وجود قلق بشأن إيذاء النفس أو الانتحار.'],
    sections: [{
      titleAr: 'خلال الأسبوعين الماضيين، كم مرة أزعجتك المشكلات التالية؟',
      items: [
        { code: 'PHQ2-1', labelAr: 'قلة الاهتمام أو المتعة في القيام بالأشياء.', labelEn: 'Little interest or pleasure in doing things', type: 'choice', options: phqFrequency },
        { code: 'PHQ2-2', labelAr: 'الشعور بالإحباط أو الاكتئاب أو اليأس.', labelEn: 'Feeling down, depressed, or hopeless', type: 'choice', options: phqFrequency },
      ],
    }],
    scoringSteps: ['اجمع درجتي البندين: 0–3 لكل بند، والمجموع الكلي 0–6.', 'في دراسة التحقق الأصلية كان مجموع 3 نقطة قطع شائعة للفحص؛ عمليًا الدرجة ≥3 تستدعي تقييمًا أوسع للاكتئاب وفق السياق.', 'لا تضف سؤال الأثر الوظيفي أو بقية PHQ-9 إلى مجموع PHQ-2؛ إذا احتجت تقييمًا أوسع استخدم أداة منفصلة موثقة.', 'لا تستخدم المجموع لإثبات تشخيص أو لنفي خطر الانتحار.'],
    interpretationGuardrails: ['PHQ-2 أداة screening وليست تشخيصًا.', 'القطع ≥3 مدعوم في الدراسة الأصلية لكنه لا يملك حساسية/نوعية ثابتة في كل مجتمع.', 'دراسة عربية 2025 دعمت خصائص الأداة لدى عينة محددة من أمهات سعوديات لأطفال ذوي إعاقة ذهنية؛ لا تُعمم عتبات تلك العينة على المنطقة العربية كلها.', 'PHQ-2 لا يحتوي أي بند عن أفكار الموت أو إيذاء النفس؛ السلامة تُقيّم بمسار مستقل عند الحاجة.'],
    stopRules: ['عند وجود خطر فوري على النفس أو الآخرين انتقل إلى مسار السلامة/الطوارئ المحلي بدل الاستمرار كنموذج فرز روتيني.', 'إذا تعذر فهم خيارات الاستجابة أو الفترة المرجعية فاستعمل طريقة تطبيق مناسبة أو تقييمًا مهنيًا بدل استخراج درجة غير صالحة.'],
    officialDownloads: [
      { label: 'NIH HEAL CDE — PHQ-2 Arabic CRF and Copyright: No', url: 'https://www.nih.gov/node/19936', language: 'ar', publisher: 'NIH' },
    ],
    sourceUrls: [
      'https://www.nih.gov/node/19936',
      'https://pubmed.ncbi.nlm.nih.gov/14583691/',
      'https://pubmed.ncbi.nlm.nih.gov/40687118/',
    ],
    lastVerifiedOn: '2026-09-06',
  },
};
