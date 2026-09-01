import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, parseIsoDate, PUBLIC_API_VERSION } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sinceRaw = url.searchParams.get('since');
  const since = parseIsoDate(sinceRaw);
  if (!sinceRaw || !since) return apiError(request, 400, 'invalid_parameter', 'since is required and must be an ISO-8601 date.', 'since');
  const rawLimit = Number(url.searchParams.get('limit') || 100);
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : 100;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('api_change_log')
    .select('id,content_id,event_type,slug,content_type,canonical_url,occurred_at')
    .gt('occurred_at', since)
    .order('occurred_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(limit + 1);
  if (error) return apiError(request, 503, 'changes_unavailable', 'The public change stream is temporarily unavailable.');
  const rows = Array.isArray(data) ? data : [];
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);
  const nextSince = page.length ? String(page[page.length - 1].occurred_at) : since;
  return jsonResponse(request, {
    data: page,
    pagination: { limit, has_more: hasMore, next_since: nextSince },
    meta: { api_version: PUBLIC_API_VERSION, generated_at: new Date().toISOString(), since },
  }, { cacheControl: 'public, max-age=0, s-maxage=30, stale-while-revalidate=120', lastModified: page.length ? String(page[page.length - 1].occurred_at) : null });
}

export const OPTIONS = optionsResponse;
