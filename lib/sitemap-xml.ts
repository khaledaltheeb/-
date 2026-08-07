import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/seo';

export type SitemapEntry = { path: string; lastModified?: string | Date | null; changeFrequency?: string; priority?: number };

function escapeXml(value: string) {
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}
function absolute(path: string) {
  if (/^https:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function sitemapResponse(entries: SitemapEntry[]) {
  const indexingEnabled = process.env.NEXT_PUBLIC_ALLOW_INDEXING === 'true';
  const safeEntries = indexingEnabled ? entries : [];
  const urls = safeEntries.map((entry) => {
    const lastmod = entry.lastModified ? new Date(entry.lastModified).toISOString() : undefined;
    return `<url><loc>${escapeXml(absolute(entry.path))}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}${entry.changeFrequency ? `<changefreq>${escapeXml(entry.changeFrequency)}</changefreq>` : ''}${entry.priority !== undefined ? `<priority>${entry.priority.toFixed(1)}</priority>` : ''}</url>`;
  }).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
  return new NextResponse(xml, { headers: { 'Content-Type':'application/xml; charset=utf-8', 'Cache-Control':'public, max-age=0, s-maxage=900, stale-while-revalidate=3600' } });
}
