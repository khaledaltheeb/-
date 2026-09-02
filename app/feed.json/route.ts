import { feedResponse, feedUnavailable } from '@/lib/feed-http';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/seo';
import { publicContentHref } from '@/lib/public-content-routing';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select('slug,title,excerpt,content_type,canonical_url,published_at,updated_at,author_display_name,featured_image_url')
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })
    .limit(100);
  if (error || !Array.isArray(data)) {
    return feedUnavailable(request, 'The Rawafid JSON Feed cannot be generated from the canonical catalog right now.');
  }

  const rows = data;
  const items = rows.flatMap((row) => {
    if (!row.slug || !row.title) return [];
    const path = publicContentHref(row);
    const url = path.startsWith('http') ? path : `${SITE_URL}${path}`;
    return [{
      id: url,
      url,
      title: row.title,
      summary: row.excerpt || undefined,
      date_published: row.published_at || undefined,
      date_modified: row.updated_at || undefined,
      authors: row.author_display_name ? [{ name: row.author_display_name }] : undefined,
      image: row.featured_image_url || undefined,
      tags: row.content_type ? [row.content_type] : undefined,
    }];
  });
  const payload = JSON.stringify({
    version: 'https://jsonfeed.org/version/1.1',
    title: 'منصة روافد — أحدث المحتوى',
    home_page_url: SITE_URL,
    feed_url: `${SITE_URL}/feed.json`,
    language: 'ar',
    description: 'خلاصة معيارية لأحدث المواد العامة المنشورة في منصة روافد.',
    items,
  });
  const lastModified = rows[0]?.updated_at || rows[0]?.published_at || null;
  return feedResponse(request, payload, {
    contentType: 'application/feed+json; charset=utf-8',
    lastModified,
  });
}
