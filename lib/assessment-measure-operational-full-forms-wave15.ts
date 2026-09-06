import type { AssessmentOperationalMaterial } from '@/lib/assessment-measure-operational';
import { assessmentOperationalFullFormsWave14 } from '@/lib/assessment-measure-operational-full-forms-wave14';

const sesCdV1 = assessmentOperationalFullFormsWave14['simple-endoscopic-score-crohns-disease-v1'];

export const assessmentOperationalFullFormsWave15: Record<string, AssessmentOperationalMaterial> = {
  'simple-endoscopic-score-crohns-disease-v1': {
    ...sesCdV1,
    preflightChecks: [
      ...sesCdV1.preflightChecks,
      'قاعدة التضيق الحاسمة: درجة 3 تعني تضيقًا لا يمكن عبوره. عندما يمنع التضيق تقدم المنظار، لا تُسند درجات افتراضية للقطاعات غير المفحوصة بعده؛ وتبقى التضيقّات القابلة للعبور في القطاعات المقيمة ضمن 0–2.',
    ],
    scoringSteps: [
      'في كل قطاع قابل للتقييم، سجّل أربعة متغيرات: حجم القرحة 0–3، السطح المتقرح 0–3، السطح المتأثر 0–3، والتضيق 0–3.',
      'مجموع حجم القرحة عبر القطاعات الخمسة يمكن أن يصل إلى 15، ومجموع السطح المتقرح إلى 15، ومجموع السطح المتأثر إلى 15.',
      'مجموع درجات التضيق لا يتجاوز 11: درجة 3 مخصصة لتضيق غير قابل للعبور؛ وعند حدوثه تتوقف إمكانية تقييم القطاعات الواقعة بعده، بينما أقصى تضيق في القطاعات الأخرى التي أمكن تقييمها هو 2 (قابل للعبور).',
      'الحد الأعلى القياسي لـSES-CD هو لذلك 56 = 15 + 15 + 15 + 11، وليس 60. لا تجمع خمس درجات تضيق مقدارها 3 كما لو كان من الممكن عبور كل تضيق غير قابل للعبور.',
      'اجمع فقط الدرجات الناتجة من القطاعات المقيمة فعليًا، وسجّل القطاعات غير القابلة للتقييم وسبب ذلك بدل منحها صفرًا أو قيمة مفترضة.',
      'عند المتابعة استخدم النسخة نفسها وتعريفات المتغيرات نفسها، ووثّق مدى التنظير وجودة التحضير لفهم أي تغير في المجموع.',
    ],
    interpretationGuardrails: [
      ...sesCdV1.interpretationGuardrails,
      'إذا كان المجموع المحسوب يتجاوز 56 فهناك خطأ في تطبيق قاعدة التضيق أو في جمع القطاعات ويجب إعادة التدقيق قبل استخدام النتيجة.',
    ],
    sourceUrls: [
      ...sesCdV1.sourceUrls,
      'https://pmc.ncbi.nlm.nih.gov/articles/PMC5881717/',
    ],
    lastVerifiedOn: '2026-09-06',
  },
};
