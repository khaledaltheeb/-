import visualProfiles from '@/data/quick-info-visuals.json';

export type QuickInfoVisualProfile = {
  id: string;
  label: string;
  icon: string;
  keywords: string[];
  accent: string;
  accentDark: string;
  soft: string;
  glow: string;
};

const profiles = visualProfiles as QuickInfoVisualProfile[];
const fallbackProfile = profiles.find((profile) => profile.id === 'general') ?? profiles[0];

function normalizeTopicText(value: string) {
  return value
    .normalize('NFKC')
    .toLocaleLowerCase('ar')
    .replace(/[أإآ]/gu, 'ا')
    .replace(/ؤ/gu, 'و')
    .replace(/ئ/gu, 'ي')
    .replace(/ى/gu, 'ي')
    .replace(/ة/gu, 'ه')
    .replace(/[\u064B-\u065F\u0670]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

export function getQuickInfoVisualProfile(title: string): QuickInfoVisualProfile {
  const normalizedTitle = normalizeTopicText(title);
  for (const profile of profiles) {
    if (profile.id === 'general') continue;
    if (profile.keywords.some((keyword) => normalizedTitle.includes(normalizeTopicText(keyword)))) return profile;
  }
  return fallbackProfile;
}
