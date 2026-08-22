import toolsData from '@/data/cognitive-lab/tools.v1.json';
import extensionData from '@/data/cognitive-lab/tools.v2-extension.json';

export type CognitiveDifficultyStatus = 'verified' | 'review';

export type CognitiveTool = {
  slug: string;
  title: string;
  category: string;
  mode: string;
  summary: string;
  instructions: string;
  difficultyStatus: CognitiveDifficultyStatus;
};

const extensionTools = (extensionData as CognitiveTool[]).map((tool) => {
  if (tool.mode === 'spatial_folding') {
    return {
      ...tool,
      title: 'تتبع التحويلات المكانية',
      summary: 'تدريب على تتبع سلسلة من الدورانات الاتجاهية الرمزية داخل المتصفح، مع زيادة عدد التحولات تدريجيًا وطلب تحديد الاتجاه النهائي.',
      instructions: 'ابدأ من الاتجاه المعروض، وطبّق التحولات بالترتيب ثم اختر الاتجاه النهائي.',
    };
  }
  if (tool.mode === 'feedback_rule_learning') {
    return {
      ...tool,
      title: 'استقراء قاعدة مركبة من أمثلة معلّمة',
      summary: 'نشاط يستخرج قاعدة اقتران بين سمتين من أمثلة موجبة وسالبة معلّمة، ثم يطبق القاعدة على مثال جديد؛ وهو تعلم قاعدي تعليمي لا محاكاة لاختبار سريري.',
      instructions: 'قارن الأمثلة المعلّمة، استخرج السمتين اللازمتين معًا، ثم صنف المثال الجديد.',
    };
  }
  if (tool.mode === 'syllable_segmentation') {
    return {
      ...tool,
      title: 'التقسيم النطقي المبسط',
      summary: 'نشاط لغوي تعليمي يطلب تقسيم كلمات عربية مألوفة إلى وحدات نطقية مبسطة ضمن أمثلة مضبوطة، مع تجنب اعتباره تحليلًا فونولوجيًا تشخيصيًا أو معياريًا.',
      instructions: 'اختر التقسيم النطقي المبسط المطابق للمثال، مع الانتباه إلى أن النشاط تعليمي وليس اختبارًا سريريًا للوعي الصوتي.',
    };
  }
  return tool;
});

export const cognitiveTools = [...(toolsData as CognitiveTool[]), ...extensionTools];
const extensionSlugs = new Set(extensionTools.map((tool) => tool.slug));

export const cognitiveToolCategories = Array.from(
  new Set(cognitiveTools.map((tool) => tool.category)),
).sort((a, b) => a.localeCompare(b, 'ar'));

export function getCognitiveTool(slug: string) {
  return cognitiveTools.find((tool) => tool.slug === slug) ?? null;
}

export function isExtensionCognitiveTool(tool: CognitiveTool) {
  return extensionSlugs.has(tool.slug);
}

export function getRelatedCognitiveTools(tool: CognitiveTool, limit = 3) {
  return cognitiveTools
    .filter((candidate) => candidate.slug !== tool.slug)
    .sort((a, b) => {
      const categoryScore = Number(b.category === tool.category) - Number(a.category === tool.category);
      if (categoryScore !== 0) return categoryScore;
      const statusScore = Number(b.difficultyStatus === 'verified') - Number(a.difficultyStatus === 'verified');
      return statusScore || a.title.localeCompare(b.title, 'ar');
    })
    .slice(0, limit);
}
