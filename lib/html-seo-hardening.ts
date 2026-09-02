const SITE_URL = 'https://healthrenewal.org';
const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/seo-card`;
const SITE_NAME = 'Health Renewal | روافد';
const MAX_TITLE_LENGTH = 65;

type HardenHtmlSeoOptions = {
  canonicalUrl: string;
};

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? match[2].trim() : '';
}

function stripTags(value = '') {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractTitle(html: string) {
  const raw = (html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
  return decodeHtml(stripTags(raw));
}

function metaContent(html: string, key: 'name' | 'property', value: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attr(tag, key).toLowerCase() === value.toLowerCase()) return decodeHtml(attr(tag, 'content'));
  }
  return '';
}

function canonicalHref(html: string) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (attr(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical')) return attr(tag, 'href');
  }
  return '';
}

function injectIntoHead(html: string, markup: string) {
  return /<\/head>/i.test(html) ? html.replace(/<\/head>/i, `${markup}</head>`) : html;
}

function ensureMeta(html: string, key: 'name' | 'property', value: string, content: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  const existing = tags.find((tag) => attr(tag, key).toLowerCase() === value.toLowerCase());
  const replacement = `<meta ${key}="${escapeHtml(value)}" content="${escapeHtml(content)}">`;
  if (!existing) return injectIntoHead(html, replacement);
  if (attr(existing, 'content').trim()) return html;
  return html.replace(existing, replacement);
}

function ensureCanonical(html: string, canonicalUrl: string) {
  if (canonicalHref(html)) return html;
  return injectIntoHead(html, `<link rel="canonical" href="${escapeHtml(canonicalUrl)}">`);
}

function shortenTitle(title: string) {
  if (title.length <= MAX_TITLE_LENGTH) return title;

  const candidate = title
    .replace(/\s*(?:\||–|—)\s*(?:روافد|Health Renewal(?:\s*\|\s*روافد)?)\s*$/iu, '')
    .trim();
  if (candidate.length <= MAX_TITLE_LENGTH) return candidate;

  const words = candidate.split(/\s+/).filter(Boolean);
  let shortened = '';
  for (const word of words) {
    const next = shortened ? `${shortened} ${word}` : word;
    if (next.length > MAX_TITLE_LENGTH - 1) break;
    shortened = next;
  }

  if (!shortened) shortened = candidate.slice(0, MAX_TITLE_LENGTH - 1).trimEnd();
  return `${shortened}…`.slice(0, MAX_TITLE_LENGTH);
}

function normalizeDocumentTitle(html: string, title: string) {
  const seoTitle = shortenTitle(title);
  if (!seoTitle || seoTitle === title) return html;
  return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seoTitle)}</title>`);
}

function ensureJsonLd(html: string, canonicalUrl: string, title: string, description: string) {
  if (/<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1/i.test(html)) return html;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: 'ar',
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: SITE_NAME,
        inLanguage: 'ar',
      },
    ],
  };
  const json = JSON.stringify(schema).replace(/</g, '\\u003c');
  return injectIntoHead(html, `<script type="application/ld+json">${json}</script>`);
}

export function hardenHtmlSeo(html: string, { canonicalUrl }: HardenHtmlSeoOptions) {
  const originalTitle = extractTitle(html);
  const title = originalTitle || SITE_NAME;
  const description = metaContent(html, 'name', 'description');

  let output = normalizeDocumentTitle(html, title);
  output = ensureCanonical(output, canonicalUrl);
  output = ensureMeta(output, 'property', 'og:type', 'article');
  output = ensureMeta(output, 'property', 'og:locale', 'ar_AR');
  output = ensureMeta(output, 'property', 'og:site_name', SITE_NAME);
  output = ensureMeta(output, 'property', 'og:title', title);
  if (description) output = ensureMeta(output, 'property', 'og:description', description);
  output = ensureMeta(output, 'property', 'og:url', canonicalUrl);
  output = ensureMeta(output, 'property', 'og:image', DEFAULT_SOCIAL_IMAGE);
  output = ensureMeta(output, 'name', 'twitter:card', 'summary_large_image');
  output = ensureMeta(output, 'name', 'twitter:title', title);
  if (description) output = ensureMeta(output, 'name', 'twitter:description', description);
  output = ensureMeta(output, 'name', 'twitter:image', DEFAULT_SOCIAL_IMAGE);
  output = ensureJsonLd(output, canonicalUrl, title, description);
  return output;
}
