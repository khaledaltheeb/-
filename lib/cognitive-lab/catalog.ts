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

export const cognitiveTools = [...toolsData, ...extensionData] as CognitiveTool[];

export const cognitiveToolCategories = Array.from(
  new Set(cognitiveTools.map((tool) => tool.category)),
).sort((a, b) => a.localeCompare(b, 'ar'));

export function getCognitiveTool(slug: string) {
  return cognitiveTools.find((tool) => tool.slug === slug) ?? null;
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
