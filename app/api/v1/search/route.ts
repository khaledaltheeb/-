import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION, serializePublicContent } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (q.length < 2 || q.length > 160) return apiError(request, 400, 'invalid_parameter', 'q must contain between 2 and 160 characters.', 'q');
  const rawLimit = Number(url.searchParams.get('limit') || 20);
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 20;
  const requestedType = (url.searchParams.get('type') || '').trim();

  const supabase = await createClient();
  let query = supabase
    .from('content')
    .select('id,content_type,slug,title,excerpt,canonical_url,audience,schema_json,featured_image_url,featured_image_alt,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,sector_id,category_id')
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .textSearch('search_vector', q, { config: 'simple', type: 'websearch' })
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (requestedType) query = query.eq('content_type', requestedType);

  const { data, error } = await query;
  if (error) return apiError(request, 503, 'search_unavailable', 'Public search is temporarily unavailable.');
  const rows = Array.isArray(data) ? data : [];
  return jsonResponse(request, {
    data: rows.map((row) => serializePublicContent(row as Record<string, unknown>, false)),
    meta: { api_version: PUBLIC_API_VERSION, generated_at: new Date().toISOString(), query: q, type: requestedType || null, count: rows.length },
  }, { cacheControl: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' });
}

export const OPTIONS = optionsResponse;
