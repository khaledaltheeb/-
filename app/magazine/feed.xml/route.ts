import { getMagazineItems } from '@/lib/magazine';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char] || char));
}

export async function GET() {
  const items = (await getMagazineItems()).slice(0, 30);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>المجلة والأبحاث | منصة روافد</title><link>${SITE_URL}/magazine/</link><description>قراءات عربية نقدية للأبحاث والدراسات الحديثة.</description><language>ar</language>${items.map((item) => `<item><title>${escapeXml(item.title)}</title><link>${SITE_URL}${escapeXml(item.canonical_url || `/content/${item.slug}`)}</link><guid isPermaLink="true">${SITE_URL}${escapeXml(item.canonical_url || `/content/${item.slug}`)}</guid>${item.excerpt ? `<description>${escapeXml(item.excerpt)}</description>` : ''}${item.published_at ? `<pubDate>${new Date(item.published_at).toUTCString()}</pubDate>` : ''}</item>`).join('')}</channel></rss>`;
  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8', 'cache-control': 'public, max-age=0, s-maxage=3600' } });
}
