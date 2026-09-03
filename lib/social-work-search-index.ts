import { SOCIAL_WORK_PAGES } from '@/lib/social-work-pages.generated';
import { SOCIAL_WORK_TALENTIA_PAGES } from '@/lib/social-work-talentia-pages';
import { SOCIAL_WORK_COMPARATIVE_PAGES } from '@/lib/social-work-comparative-pages';

export type SocialWorkStaticSearchResult = {
  entity_type: 'content';
  entity_id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  destination: string;
  score: number;
};

type IndexedPage = {
  key: string;
  title: string;
  description: string;
  text: string;
  destination: string;
};

const ARABIC_STOPWORDS = new Set([
  'كيف', 'هل', 'ما', 'ماذا', 'من', 'في', 'على', 'علي', 'الى', 'إلى', 'عن', 'مع',
  'هذا', 'هذه', 'ذلك', 'الذي', 'التي', 'هو', 'هي', 'او', 'أو', 'ثم', 'قد', 'بعد', 'قبل',
]);

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_m, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n: string) => String.fromCodePoint(Number.parseInt(n, 16)));
}

function cleanText(value: string) {
  return decodeHtml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html: string) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  const raw = cleanText(match?.[1] ?? '');
  return raw.replace(/\s*\|\s*(?:منصة\s*)?روافد.*$/i, '').trim();
}

function extractDescription(html: string) {
  const direct = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["'][^>]*>/i);
  if (direct?.[1]) return cleanText(direct[1]);
  const tag = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i)?.[0] ?? '';
  return cleanText(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? '');
}

function normalize(value: string) {
  return value
    .toLocaleLowerCase('ar')
    .replace(/[ًٌٍَُِّْـٰ]/gu, '')
    .replace(/[أإآٱ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .replace(/ة/gu, 'ه')
    .replace(/ؤ/gu, 'و')
    .replace(/ئ/gu, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

function coreTokens(query: string) {
  return [...new Set(normalize(query).split(' ').filter((token) => token.length >= 2 && !ARABIC_STOPWORDS.has(token)))];
}

function buildIndex(): IndexedPage[] {
  // Match the serving precedence in app/evidence-guides/social-work/[[...slug]]/route.ts:
  // comparative > Talentia > recovered pages.
  const pages = new Map<string, string>(Object.entries(SOCIAL_WORK_PAGES));
  for (const [key, html] of Object.entries(SOCIAL_WORK_TALENTIA_PAGES)) pages.set(key, html);
  for (const [key, html] of Object.entries(SOCIAL_WORK_COMPARATIVE_PAGES)) pages.set(key, html);

  return [...pages.entries()].flatMap(([key, html]) => {
    const title = extractTitle(html);
    if (!title) return [];
    const description = extractDescription(html);
    const text = cleanText(html).slice(0, 24_000);
    const destination = key
      ? `/evidence-guides/social-work/${key}/`
      : '/evidence-guides/social-work/';
    return [{ key, title, description, text, destination }];
  });
}

const INDEX = buildIndex();

export function getSocialWorkStaticSearchIndex() {
  return INDEX;
}

export function searchSocialWorkStaticPages(query: string, limit = 50): SocialWorkStaticSearchResult[] {
  const normalizedQuery = normalize(query);
  if (normalizedQuery.length < 2) return [];

  const tokens = coreTokens(query);
  const asksSocialWork = normalizedQuery.includes('العمل الاجتماعي') || normalizedQuery.includes('الخدمه الاجتماعيه');
  const asksEthics = normalizedQuery.includes('اخلاقي') || normalizedQuery.includes('اخلاقيات');

  return INDEX.flatMap((page): SocialWorkStaticSearchResult[] => {
    const title = normalize(page.title);
    const description = normalize(page.description);
    const haystack = normalize(`${page.title} ${page.description} ${page.text}`);

    const titleHits = tokens.filter((token) => title.includes(token)).length;
    const descriptionHits = tokens.filter((token) => description.includes(token)).length;
    const bodyHits = tokens.filter((token) => haystack.includes(token)).length;
    const tokenCount = Math.max(tokens.length, 1);

    let score = 0;
    if (title === normalizedQuery) score += 2600;
    else if (title.includes(normalizedQuery)) score += 1900;
    else if (description.includes(normalizedQuery)) score += 1250;
    else if (haystack.includes(normalizedQuery)) score += 650;

    score += (titleHits / tokenCount) * 1000;
    score += (descriptionHits / tokenCount) * 450;
    score += (bodyHits / tokenCount) * 220;

    if (asksSocialWork) score += 420;
    if (asksEthics && (title.includes('اخلاقي') || description.includes('اخلاقي'))) score += 650;
    if (asksEthics && page.key === 'professional-ethics') score += 520;
    if (asksSocialWork && page.key === 'international-comparative-practice') score += 220;

    if (bodyHits === 0 && titleHits === 0 && descriptionHits === 0) return [];

    return [{
      entity_type: 'content',
      entity_id: `static:social-work:${page.key || 'hub'}`,
      slug: `social-work-${page.key || 'hub'}`,
      title: page.title,
      subtitle: 'العمل الاجتماعي — دليل مؤسسي ثابت',
      excerpt: page.description || page.text.slice(0, 240),
      destination: page.destination,
      score,
    }];
  })
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ar'))
    .slice(0, Math.max(1, Math.min(limit, 100)));
}
