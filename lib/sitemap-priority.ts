const STRATEGIC_SECTOR_PRIORITIES: Record<string, number> = {
  'pediatric-oncology': 0.98,
  'addiction-recovery': 0.96,
  'mental-health': 0.96,
  psychology: 0.95,
  'special-needs': 0.96,
  'special-education': 0.96,
  'inclusive-education': 0.96,
  autism: 0.95,
  'learning-disabilities': 0.95,
  knowledge: 0.94,
};

const STRATEGIC_SECTION_PRIORITIES: Record<string, number> = {
  'research-evidence-learning': 0.97,
  'mental-health-first-aid': 0.96,
  'pediatric-cancer-types-diagnosis': 0.97,
  'pediatric-cancer-treatment-care': 0.97,
  'pediatric-cancer-research-evidence': 0.97,
  'pediatric-cancer-psychosocial-family': 0.96,
  'pediatric-cancer-supportive-rehab': 0.96,
  'pediatric-cancer-daily-life-school': 0.95,
  'pediatric-cancer-survivorship-late-effects': 0.96,
  'pediatric-cancer-palliative-bereavement': 0.96,
  'pediatric-cancer-theses-dissertations': 0.93,
  'cognitive-processes': 0.94,
};

const STRATEGIC_CONTENT_PREFIXES = [
  '/sections/research-evidence-learning/',
  '/sections/mental-health-first-aid/',
  '/sections/pediatric-cancer-',
  '/care-guides/',
  '/evidence-guides/',
  '/sectors/pediatric-oncology/',
] as const;

function clampPriority(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function sectorSitemapPriority(slug: string) {
  return clampPriority(STRATEGIC_SECTOR_PRIORITIES[slug] ?? 0.94);
}

export function sectionSitemapPriority(slug: string) {
  if (STRATEGIC_SECTION_PRIORITIES[slug] !== undefined) {
    return clampPriority(STRATEGIC_SECTION_PRIORITIES[slug]);
  }
  if (slug.startsWith('pediatric-cancer-')) return 0.95;
  return 0.88;
}

export function contentSitemapPriority(path: string) {
  const normalized = path === '/' ? path : path.replace(/\/+$/, '');
  if (STRATEGIC_CONTENT_PREFIXES.some((prefix) => normalized.startsWith(prefix.replace(/\/+$/, '')))) {
    return 0.88;
  }
  if (normalized.startsWith('/encyclopedia/')) return 0.82;
  if (normalized.startsWith('/quick-info/')) return 0.78;
  if (normalized.startsWith('/sections/')) return 0.84;
  if (normalized.startsWith('/sectors/')) return 0.86;
  return 0.78;
}
