const SITE_ORIGIN = 'https://healthrenewal.org';

function escapeHtmlAttribute(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function metaContent(html: string, attribute: 'name' | 'property', value: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const marker = new RegExp(`\\b${attribute}\\s*=\\s*["']${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["']`, 'i');
    if (!marker.test(tag)) continue;
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1];
    if (content) return content.trim();
  }
  return '';
}

function titleContent(html: string) {
  return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/<[^>]+>/g, '').trim() ?? '';
}

function descriptionContent(html: string) {
  return metaContent(html, 'name', 'description');
}

function shortenTitle(title: string) {
  if (title.length <= 65) return title;
  const withoutBrand = title.replace(/\s*[|｜-]\s*روافد\s*$/u, '').trim();
  if (withoutBrand.length >= 8 && withoutBrand.length <= 65) return withoutBrand;
  if (withoutBrand.length > 65) return `${withoutBrand.slice(0, 64).trimEnd()}…`;
  return title.slice(0, 65).trimEnd();
}

function hasJsonLd(html: string) {
  return /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>/i.test(html);
}

function injectIntoHead(html: string, additions: string[]) {
  if (!additions.length) return html;
  const block = `\n${additions.join('\n')}\n`;
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${block}</head>`);
  return `${block}${html}`;
}

export function hardenRawHtmlSeo(html: string, pathname: string) {
  let output = html;
  const originalTitle = titleContent(output);
  const safeTitle = shortenTitle(originalTitle);
  if (safeTitle && safeTitle !== originalTitle) {
    output = output.replace(/<title([^>]*)>[\s\S]*?<\/title>/i, `<title$1>${escapeHtmlAttribute(safeTitle)}</title>`);
  }

  const title = titleContent(output) || 'روافد | دليل معرفي';
  const description = descriptionContent(output) || title;
  const canonical = `${SITE_ORIGIN}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
  const additions: string[] = [];

  if (!metaContent(output, 'property', 'og:title')) {
    additions.push(`<meta property="og:title" content="${escapeHtmlAttribute(title)}">`);
  }
  if (!metaContent(output, 'property', 'og:description')) {
    additions.push(`<meta property="og:description" content="${escapeHtmlAttribute(description)}">`);
  }
  if (!metaContent(output, 'property', 'og:url')) {
    additions.push(`<meta property="og:url" content="${escapeHtmlAttribute(canonical)}">`);
  }
  if (!metaContent(output, 'property', 'og:type')) {
    additions.push('<meta property="og:type" content="article">');
  }
  if (!metaContent(output, 'name', 'twitter:card')) {
    additions.push('<meta name="twitter:card" content="summary_large_image">');
  }
  if (!hasJsonLd(output)) {
    additions.push(`<script type="application/ld+json">${JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description,
      url: canonical,
      inLanguage: 'ar',
      isPartOf: {
        '@type': 'WebSite',
        name: 'روافد',
        url: SITE_ORIGIN,
      },
    }).replaceAll('<', '\\u003c')}</script>`);
  }

  return injectIntoHead(output, additions);
}
