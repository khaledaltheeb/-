import { feedResponse, feedUnavailable } from '@/lib/feed-http';
import { getMagazineItems } from '@/lib/magazine';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

function absolute(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function GET(request: Request) {
  let items;
  try {
    items = (await getMagazineItems()).slice(0, 30);
  } catch {
    return feedUnavailable(request, 'The Rawafid magazine feed cannot be generated from the canonical catalog right now.');
  }

  const lastBuild = items[0]?.updated_at || items[0]?.published_at || new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>المجلة والأبحاث | منصة روافد</title><link>${escapeXml(`${SITE_URL}/magazine/`)}</link><description>قراءات عربية نقدية للأبحاث والدراسات الحديثة.</description><language>ar</language><lastBuildDate>${escapeXml(new Date(lastBuild).toUTCString())}</lastBuildDate><atom:link href="${escapeXml(`${SITE_URL}/magazine/feed.xml`)}" rel="self" type="application/rss+xml"/>${items.map((item) => {
    const url = absolute(item.canonical_url || `/content/${item.slug}`);
    return `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid>${item.excerpt ? `<description>${escapeXml(item.excerpt)}</description>` : ''}${item.published_at ? `<pubDate>${escapeXml(new Date(item.published_at).toUTCString())}</pubDate>` : ''}</item>`;
  }).join('')}</channel></rss>`;

  return feedResponse(request, xml, {
    contentType: 'application/rss+xml; charset=utf-8',
    cacheControl: 'public, max-age=0, s-maxage=1800, stale-while-revalidate=7200',
    lastModified: lastBuild,
  });
}
