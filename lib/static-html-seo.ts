type StaticHtmlSeoOptions = {
  collection?: boolean;
};

const MAX_TITLE_LENGTH = 65;
const BRAND_SUFFIX = /\s*\|\s*روافد\s*$/u;

function codePointLength(value: string) {
  return Array.from(value).length;
}

function shortenTitle(value: string) {
  const trimmed = value.trim();
  if (codePointLength(trimmed) <= MAX_TITLE_LENGTH) return trimmed;

  const withoutBrand = trimmed.replace(BRAND_SUFFIX, '').trim();
  if (codePointLength(withoutBrand) <= MAX_TITLE_LENGTH) return withoutBrand;

  const words = withoutBrand.split(/\s+/u);
  let candidate = '';
  for (const word of words) {
    const next = candidate ? `${candidate} ${word}` : word;
    if (codePointLength(next) > MAX_TITLE_LENGTH) break;
    candidate = next;
  }

  if (codePointLength(candidate) >= 8) return candidate;
  return Array.from(withoutBrand).slice(0, MAX_TITLE_LENGTH).join('').trim();
}

function extract(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1]?.trim() ?? '';
}

function hasMetaProperty(html: string, property: string) {
  return new RegExp(`<meta\\b[^>]*\\bproperty=["']${property}["'][^>]*>`, 'i').test(html);
}

function hasMetaName(html: string, name: string) {
  return new RegExp(`<meta\\b[^>]*\\bname=["']${name}["'][^>]*>`, 'i').test(html);
}

function escapeHtml(value: string) {
  return value
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]+|#\d+|#x[\da-fA-F]+);)/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function decodeCommonEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

export function hardenStaticHtmlSeo(html: string, options: StaticHtmlSeoOptions = {}) {
  if (!/<head\b[^>]*>[\s\S]*<\/head>/i.test(html)) return html;

  const rawTitle = extract(html, /<title>([\s\S]*?)<\/title>/i);
  const description = extract(html, /<meta\b[^>]*\bname=["']description["'][^>]*\bcontent=["']([^"']*)["'][^>]*>/i);
  const canonical = extract(html, /<link\b[^>]*\brel=["']canonical["'][^>]*\bhref=["']([^"']+)["'][^>]*>/i);
  if (!rawTitle || !description || !canonical) return html;

  const title = shortenTitle(decodeCommonEntities(rawTitle));
  const socialTitle = title.replace(BRAND_SUFFIX, '').trim();
  const decodedDescription = decodeCommonEntities(description);

  const output = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  const additions: string[] = [];

  if (!hasMetaProperty(output, 'og:type')) additions.push(`<meta property="og:type" content="${options.collection ? 'website' : 'article'}">`);
  if (!hasMetaProperty(output, 'og:locale')) additions.push('<meta property="og:locale" content="ar_AR">');
  if (!hasMetaProperty(output, 'og:title')) additions.push(`<meta property="og:title" content="${escapeHtml(socialTitle)}">`);
  if (!hasMetaProperty(output, 'og:description')) additions.push(`<meta property="og:description" content="${escapeHtml(decodedDescription)}">`);
  if (!hasMetaProperty(output, 'og:url')) additions.push(`<meta property="og:url" content="${escapeHtml(canonical)}">`);

  if (!hasMetaName(output, 'twitter:card')) additions.push('<meta name="twitter:card" content="summary_large_image">');
  if (!hasMetaName(output, 'twitter:title')) additions.push(`<meta name="twitter:title" content="${escapeHtml(socialTitle)}">`);
  if (!hasMetaName(output, 'twitter:description')) additions.push(`<meta name="twitter:description" content="${escapeHtml(decodedDescription)}">`);

  if (!/<script\b[^>]*\btype=["']application\/ld\+json["'][^>]*>/i.test(output)) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': options.collection ? 'CollectionPage' : 'WebPage',
      name: socialTitle,
      description: decodedDescription,
      url: canonical,
      inLanguage: 'ar',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Health Renewal | روافد',
        url: 'https://healthrenewal.org/',
      },
    };
    additions.push(`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`);
  }

  if (!additions.length) return output;
  return output.replace(/<\/head>/i, `${additions.join('')}</head>`);
}
