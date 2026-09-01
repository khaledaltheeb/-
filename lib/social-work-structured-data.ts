const SITE_NAME = 'Rawafid | Health Renewal';

function decodeHtml(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function attribute(html: string, pattern: RegExp, fallback = '') {
  return decodeHtml(html.match(pattern)?.[1] ?? fallback);
}

function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/[<>&]/g, (character) => (
    character === '<' ? '\\u003c' : character === '>' ? '\\u003e' : '\\u0026'
  ));
}

/**
 * Applies one deterministic SEO/structured-data contract to recovered static pages.
 * Existing valid tags are preserved; only missing fields are injected.
 */
export function ensureSocialWorkStructuredData(html: string, key: string) {
  const canonical = `https://healthrenewal.org/evidence-guides/social-work/${key ? `${key}/` : ''}`;
  const title = attribute(html, /<title[^>]*>([^<]+)<\/title>/i, 'العمل الاجتماعي والأسرة والمجتمع | روافد');
  const description = attribute(
    html,
    /<meta\s+name=["']description["']\s+content=["']([^"']+)["'][^>]*>/i,
    'أدلة عربية عملية موثقة في العمل الاجتماعي والأسرة والمجتمع.',
  );
  const pageType = key ? 'article' : 'website';
  const additions: string[] = [];

  if (!/<meta\s+property=["']og:title["']/i.test(html)) additions.push(`<meta property="og:title" content="${title.replaceAll('"', '&quot;')}">`);
  if (!/<meta\s+property=["']og:description["']/i.test(html)) additions.push(`<meta property="og:description" content="${description.replaceAll('"', '&quot;')}">`);
  if (!/<meta\s+property=["']og:url["']/i.test(html)) additions.push(`<meta property="og:url" content="${canonical}">`);
  if (!/<meta\s+property=["']og:type["']/i.test(html)) additions.push(`<meta property="og:type" content="${pageType}">`);
  if (!/<meta\s+property=["']og:locale["']/i.test(html)) additions.push('<meta property="og:locale" content="ar_AR">');
  if (!/<meta\s+property=["']og:site_name["']/i.test(html)) additions.push(`<meta property="og:site_name" content="${SITE_NAME}">`);
  if (!/<meta\s+name=["']twitter:card["']/i.test(html)) additions.push('<meta name="twitter:card" content="summary">');

  if (!/<script\s+type=["']application\/ld\+json["']/i.test(html)) {
    const schema = key
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: title.replace(/\s*\|\s*روافد\s*$/u, ''),
          description,
          url: canonical,
          inLanguage: 'ar',
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: 'https://healthrenewal.org/' },
          publisher: { '@type': 'Organization', name: SITE_NAME, url: 'https://healthrenewal.org/' },
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: title.replace(/\s*\|\s*روافد\s*$/u, ''),
          description,
          url: canonical,
          inLanguage: 'ar',
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: 'https://healthrenewal.org/' },
        };
    additions.push(`<script type="application/ld+json">${safeJson(schema)}</script>`);
  }

  return additions.length
    ? html.replace(/<\/head>/i, `${additions.join('')}</head>`)
    : html;
}
