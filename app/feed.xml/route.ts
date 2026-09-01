import { feedResponse, feedUnavailable } from '@/lib/feed-http';
import { SITE_URL } from '@/lib/seo';
import { publicContentHref } from '@/lib/public-content-routing';

export const dynamic = 'force-dynamic';

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function absolute(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

type FeedRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  content_type: string | null;
  canonical_url: string | null;
  published_at: string | null;
  updated_at: string | null;
};

async function latestRows(): Promise<FeedRow[]> {
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!projectUrl || !publishableKey) throw new Error('Feed data source is not configured.');

  const params = new URLSearchParams({
    select: 'slug,title,excerpt,content_type,canonical_url,published_at,updated_at',
    status: 'eq.published',
    robots_index: 'eq.true',
    published_at: `lte.${new Date().toISOString()}`,
    order: 'published_at.desc.nullslast,updated_at.desc',
    limit: '100',
  });
  const response = await fetch(`${projectUrl}/rest/v1/content?${params.toString()}`, {
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      Accept: 'application/json',
    },
    next: { revalidate: 900, tags: ['rawafid-feed'] },
  });
  if (!response.ok) throw new Error(`Feed data source returned HTTP ${response.status}.`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) throw new Error('Feed data source returned an invalid payload.');
  return data as FeedRow[];
}

export async function GET(request: Request) {
  let rows: FeedRow[];
  try {
    rows = await latestRows();
  } catch {
    return feedUnavailable(request, 'The Rawafid content feed cannot be generated from the canonical catalog right now.');
  }

  const lastBuild = rows[0]?.updated_at || rows[0]?.published_at || null;
  const items = rows.flatMap((row) => {
    if (!row?.slug || !row?.title) return [];
    const url = absolute(publicContentHref(row));
    const date = row.published_at || row.updated_at;
    return [`<item><title>${escapeXml(row.title)}</title><link>${escapeXml(url)}</link><guid isPermaLink="true">${escapeXml(url)}</guid>${date ? `<pubDate>${escapeXml(new Date(date).toUTCString())}</pubDate>` : ''}${row.excerpt ? `<description>${escapeXml(row.excerpt)}</description>` : ''}</item>`];
  }).join('');

  const buildDate = lastBuild ? `<lastBuildDate>${escapeXml(new Date(lastBuild).toUTCString())}</lastBuildDate>` : '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>روافد — أحدث المحتوى</title><link>${escapeXml(`${SITE_URL}/`)}</link><description>أحدث الصفحات المنشورة والمراجعة في منصة روافد.</description><language>ar</language>${buildDate}<atom:link href="${escapeXml(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;

  return feedResponse(request, xml, {
    contentType: 'application/rss+xml; charset=utf-8',
    lastModified: lastBuild,
  });
}
