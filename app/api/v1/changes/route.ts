import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, parseIsoDate, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

type ChangeCursor = { occurred_at: string; id: string };

function encodeChangeCursor(cursor: ChangeCursor) {
  return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url');
}

function decodeChangeCursor(value: string | null): ChangeCursor | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as Partial<ChangeCursor>;
    if (!parsed.occurred_at || !parsed.id || Number.isNaN(Date.parse(parsed.occurred_at))) return null;
    if (!/^[1-9][0-9]*$/.test(parsed.id)) return null;
    return { occurred_at: new Date(parsed.occurred_at).toISOString(), id: parsed.id };
  } catch { return null; }
}

export async function GET(request: Request) {
  const access = await withOptionalPartnerAccess(request, 'changes:read');
  if (access.error) return access.error;
  const url = new URL(request.url);
  const cursorRaw = url.searchParams.get('cursor');
  const cursor = decodeChangeCursor(cursorRaw);
  if (cursorRaw && !cursor) return apiError(request, 400, 'invalid_cursor', 'The change-stream cursor is invalid or expired.', 'cursor');

  const sinceRaw = url.searchParams.get('since');
  const since = parseIsoDate(sinceRaw);
  if (!cursor && (!sinceRaw || !since)) return apiError(request, 400, 'invalid_parameter', 'since is required and must be an ISO-8601 date when cursor is not supplied.', 'since');

  const rawLimit = Number(url.searchParams.get('limit') || 100);
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, access.authorization?.authorized ? 1000 : 500) : 100;

  const supabase = await createClient();
  let query = supabase
    .from('api_change_log')
    .select('id,content_id,event_type,slug,content_type,canonical_url,occurred_at')
    .order('occurred_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(limit + 1);

  if (cursor) query = query.or(`occurred_at.gt.${cursor.occurred_at},and(occurred_at.eq.${cursor.occurred_at},id.gt.${cursor.id})`);
  else query = query.gt('occurred_at', since as string);

  const { data, error } = await query;
  if (error) return apiError(request, 503, 'changes_unavailable', 'The public change stream is temporarily unavailable.');
  const rows = Array.isArray(data) ? data : [];
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);
  const tail = page.at(-1);
  const nextCursor = hasMore && tail?.occurred_at && tail?.id
    ? encodeChangeCursor({ occurred_at: String(tail.occurred_at), id: String(tail.id) })
    : null;
  const compatibilitySince = tail?.occurred_at ? String(tail.occurred_at) : cursor?.occurred_at || since;

  const response = jsonResponse(request, {
    data: page,
    pagination: {
      limit,
      has_more: hasMore,
      next_cursor: nextCursor,
      next_since: compatibilitySince,
      next_since_note: 'Compatibility only. Use next_cursor for lossless pagination when multiple events share the same timestamp.',
    },
    meta: { api_version: PUBLIC_API_VERSION, generated_at: new Date().toISOString(), since: since || null, cursor: cursorRaw || null },
  }, { cacheControl: 'public, max-age=0, s-maxage=30, stale-while-revalidate=120', lastModified: tail?.occurred_at ? String(tail.occurred_at) : null });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
