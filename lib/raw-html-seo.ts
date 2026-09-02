type RawHtmlSeoOptions = {
  canonicalUrl: string;
  type?: 'article' | 'website';
  fallbackDescription?: string;
};

function decodeEntities(value: string) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function textValue(value: string) {
  return decodeEntities(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function metaContent(html: string, attribute: 'name' | 'property', value: string) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const direct = html.match(new RegExp(`<meta\\b[^>]*${attribute}=["']${escaped}["'][^>]*content=["']([^"']*)["'][^>]*>`, 'i'));
  if (direct?.[1]) return textValue(direct[1]);
  const reversed = html.match(new RegExp(`<meta\\b[^>]*content=["']([^"']*)["'][^>]*${attribute}=["']${escaped}["'][^>]*>`, 'i'));
  return reversed?.[1] ? textValue(reversed[1]) : '';
}

function canonicalHref(html: string) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (!/\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag)) continue;
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (href) return decodeEntities(href.trim());
  }
  return '';
}

function tagText(html: string, tag: 'title' | 'h1') {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match?.[1] ? textValue(match[1]) : '';
}

function clampTitle(value: string) {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length <= 60 ? clean : `${clean.slice(0, 59).trimEnd()}…`;
}

function clampDescription(value: string) {
  const clean = value.replace(/\s+/g, ' ').trim();
  return clean.length <= 160 ? clean : `${clean.slice(0, 159).trimEnd()}…`;
}

function replaceTitle(html: string, title: string) {
  if (!/<title\b/i.test(html)) return html;
  return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, `<title>${escapeAttribute(title)}</title>`);
}

function hasMeta(html: string, attribute: 'name' | 'property', value: string) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`<meta\\b[^>]*${attribute}=["']${escaped}["']`, 'i').test(html);
}

function metaTag(attribute: 'name' | 'property', key: string, value: string) {
  return `<meta ${attribute}="${escapeAttribute(key)}" content="${escapeAttribute(value)}">`;
}

export function hardenRawHtmlSeo(html: string, options: RawHtmlSeoOptions) {
  if (!/<head\b/i.test(html) || !/<\/head>/i.test(html)) return html;

  const originalTitle = tagText(html, 'title') || metaContent(html, 'property', 'og:title') || tagText(html, 'h1') || 'روافد';
  const title = clampTitle(originalTitle);
  const descriptionSource = metaContent(html, 'name', 'description') || metaContent(html, 'property', 'og:description') || options.fallbackDescription || '';
  const description = clampDescription(descriptionSource || 'محتوى عربي موثوق من منصة روافد مع مصادر قابلة للتتبع وإرشادات عملية واضحة.');
  const canonical = canonicalHref(html) || options.canonicalUrl;
  const type = options.type || 'article';

  let output = originalTitle.length > 65 ? replaceTitle(html, title) : html;
  const tags: string[] = [];

  if (!canonicalHref(output)) tags.push(`<link rel="canonical" href="${escapeAttribute(canonical)}">`);
  if (!hasMeta(output, 'property', 'og:type')) tags.push(metaTag('property', 'og:type', type));
  if (!hasMeta(output, 'property', 'og:title')) tags.push(metaTag('property', 'og:title', title));
  if (!hasMeta(output, 'property', 'og:description')) tags.push(metaTag('property', 'og:description', description));
  if (!hasMeta(output, 'property', 'og:url')) tags.push(metaTag('property', 'og:url', canonical));
  if (!hasMeta(output, 'name', 'twitter:card')) tags.push(metaTag('name', 'twitter:card', 'summary_large_image'));
  if (!hasMeta(output, 'name', 'twitter:title')) tags.push(metaTag('name', 'twitter:title', title));
  if (!hasMeta(output, 'name', 'twitter:description')) tags.push(metaTag('name', 'twitter:description', description));

  if (!/<script\b[^>]*type=["']application\/ld\+json["']/i.test(output)) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? ['WebPage', 'Article'] : 'WebPage',
      url: canonical,
      name: title,
      headline: type === 'article' ? title : undefined,
      description,
      inLanguage: 'ar',
      isPartOf: { '@id': 'https://healthrenewal.org/#website' },
      publisher: { '@id': 'https://healthrenewal.org/#organization' },
    };
    tags.push(`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`);
  }

  if (!tags.length) return output;
  return output.replace(/<\/head>/i, `${tags.join('')}</head>`);
}
