const SITE_URL = 'https://healthrenewal.org';
const BRAND_SUFFIX = ' | روافد';

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'));
  return match ? match[2].trim() : '';
}

function metaContent(html: string, key: 'name' | 'property', value: string) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    if (attr(tag, key).toLowerCase() === value.toLowerCase()) return attr(tag, 'content');
  }
  return '';
}

function canonicalHref(html: string) {
  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    if (attr(tag, 'rel').toLowerCase().split(/\s+/).includes('canonical')) return attr(tag, 'href');
  }
  return '';
}

function decodeBasicEntities(value: string) {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function cleanText(value: string) {
  return decodeBasicEntities(value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function clampDocumentTitle(value: string) {
  const clean = cleanText(value);
  if (clean.length <= 65) return clean;

  const hasBrandSuffix = clean.endsWith(BRAND_SUFFIX);
  const suffix = hasBrandSuffix ? BRAND_SUFFIX : '';
  const base = hasBrandSuffix ? clean.slice(0, -BRAND_SUFFIX.length).trim() : clean;
  const available = 65 - suffix.length;
  if (base.length <= available) return `${base}${suffix}`;
  const clipped = `${base.slice(0, Math.max(1, available - 1)).trimEnd()}…`;
  return `${clipped}${suffix}`;
}

function canonicalFor(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

function hasJsonLd(html: string) {
  return /<script\b[^>]*type\s*=\s*(["'])application\/ld\+json\1/i.test(html);
}

export function hardenEvidenceGuideHtml(
  html: string,
  options: { canonicalPath: string; schemaType?: 'WebPage' | 'Article' | 'MedicalWebPage' },
) {
  const titleMatch = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitle = titleMatch?.[1] || '';
  const documentTitle = clampDocumentTitle(rawTitle || 'دليل مبني على المصادر | روافد');
  const description = cleanText(metaContent(html, 'name', 'description'));
  const canonical = canonicalHref(html) || canonicalFor(options.canonicalPath);
  const socialTitle = documentTitle.endsWith(BRAND_SUFFIX)
    ? documentTitle.slice(0, -BRAND_SUFFIX.length).trim()
    : documentTitle;
  const socialImage = `${SITE_URL}/seo-card?title=${encodeURIComponent(socialTitle || documentTitle)}`;

  let output = html;
  if (titleMatch && cleanText(rawTitle) !== documentTitle) {
    output = output.replace(titleMatch[0], `<title>${escapeAttribute(documentTitle)}</title>`);
  }

  const additions: string[] = [];
  if (!metaContent(output, 'property', 'og:title')) additions.push(`<meta property="og:title" content="${escapeAttribute(socialTitle || documentTitle)}">`);
  if (!metaContent(output, 'property', 'og:description') && description) additions.push(`<meta property="og:description" content="${escapeAttribute(description)}">`);
  if (!metaContent(output, 'property', 'og:url')) additions.push(`<meta property="og:url" content="${escapeAttribute(canonical)}">`);
  if (!metaContent(output, 'property', 'og:type')) additions.push('<meta property="og:type" content="article">');
  if (!metaContent(output, 'property', 'og:locale')) additions.push('<meta property="og:locale" content="ar_AR">');
  if (!metaContent(output, 'property', 'og:site_name')) additions.push('<meta property="og:site_name" content="روافد | Health Renewal">');
  if (!metaContent(output, 'property', 'og:image')) additions.push(`<meta property="og:image" content="${escapeAttribute(socialImage)}">`);
  if (!metaContent(output, 'name', 'twitter:card')) additions.push('<meta name="twitter:card" content="summary_large_image">');
  if (!metaContent(output, 'name', 'twitter:title')) additions.push(`<meta name="twitter:title" content="${escapeAttribute(socialTitle || documentTitle)}">`);
  if (!metaContent(output, 'name', 'twitter:description') && description) additions.push(`<meta name="twitter:description" content="${escapeAttribute(description)}">`);
  if (!metaContent(output, 'name', 'twitter:image')) additions.push(`<meta name="twitter:image" content="${escapeAttribute(socialImage)}">`);

  if (!hasJsonLd(output)) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': options.schemaType || 'WebPage',
      name: socialTitle || documentTitle,
      ...(description ? { description } : {}),
      url: canonical,
      inLanguage: 'ar',
      isPartOf: {
        '@type': 'WebSite',
        name: 'روافد | Health Renewal',
        url: `${SITE_URL}/`,
      },
    };
    additions.push(`<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`);
  }

  if (!additions.length) return output;
  return output.replace(/<\/head>/i, `${additions.join('')}</head>`);
}
