export type Locale = 'ar' | 'en' | 'es';
export type Domain = 'legal' | 'oncology' | 'mental-health' | 'education' | 'addiction' | 'directory' | 'tools' | 'general';

export type SemanticSeoInput = {
  title: string;
  description?: string | null;
  path: string;
  keywords?: string[];
  relatedTerms?: string[];
  searchIntents?: string[];
};

export type SemanticSeoProfile = {
  locale: Locale;
  domain: Domain;
  primaryTopic: string;
  topicKeywords: string[];
  searchIntents: string[];
  keywords: string[];
};

function clean(value: string) {
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function key(value: string, locale: Locale) {
  return clean(value).toLocaleLowerCase(locale === 'ar' ? 'ar' : locale);
}

function localeFor(path: string): Locale {
  const normalized = path.toLowerCase();
  if (normalized === '/en' || normalized.startsWith('/en/')) return 'en';
  if (normalized === '/es' || normalized.startsWith('/es/')) return 'es';
  return 'ar';
}

function domainFor(input: SemanticSeoInput): Domain {
  const haystack = `${input.path} ${input.title} ${input.description || ''} ${(input.keywords || []).join(' ')}`.toLowerCase();
  if (/privacy|terms|legal|policy|حقوق|خصوصي|شروط/.test(haystack)) return 'legal';
  if (/pediatric-oncology|oncology|cancer|سرطان|أورام|ابيضاض|لوكيميا/.test(haystack)) return 'oncology';
  if (/mental-health|psych|نفسي|اكتئاب|قلق|صدم/.test(haystack)) return 'mental-health';
  if (/special-needs|education|autism|learning-disab|تربية|تعلم|توحد|إعاقة|اعاقة|دمج/.test(haystack)) return 'education';
  if (/addiction|substance|إدمان|ادمان|تعافي|انسحاب/.test(haystack)) return 'addiction';
  if (/specialists|centers|directory|provider|مختص|مراكز|دليل مهني/.test(haystack)) return 'directory';
  if (/tools|assessment|quiz|lab|حاسبة|اختبار|مقياس|استبيان/.test(haystack)) return 'tools';
  return 'general';
}

function unique(values: string[] | undefined, locale: Locale, limit = 40) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values || []) {
    const normalized = clean(value);
    const normalizedKey = key(normalized, locale);
    if (!normalized || normalizedKey.length < 2 || seen.has(normalizedKey)) continue;
    seen.add(normalizedKey);
    out.push(normalized);
    if (out.length >= limit) break;
  }
  return out;
}

function primaryTopic(input: SemanticSeoInput, topicKeywords: string[]) {
  return topicKeywords[0] || clean(input.title.replace(/\|.*$/, '')) || 'روافد';
}

/**
 * Curated SEO profile.
 *
 * This function deliberately does not invent keywords or search queries. The editorial
 * layer supplies real target queries after search-intent research; runtime only normalizes
 * and deduplicates them. This prevents a fixed keyword quota from creating irrelevant
 * phrases that users never search for.
 */
export function buildSemanticSeoProfile(input: SemanticSeoInput): SemanticSeoProfile {
  const locale = localeFor(input.path);
  const topicKeywords = unique([...(input.keywords || []), ...(input.relatedTerms || [])], locale);
  const searchIntents = unique(input.searchIntents, locale);
  const resolvedPrimaryTopic = primaryTopic(input, topicKeywords);
  return {
    locale,
    domain: domainFor(input),
    primaryTopic: resolvedPrimaryTopic,
    topicKeywords,
    searchIntents,
    keywords: unique([...topicKeywords, ...searchIntents], locale, 80),
  };
}
