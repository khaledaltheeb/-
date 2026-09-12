import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION, serializePublicContent } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

const SEARCH_CONTENT_FIELDS = 'id,content_type,slug,title,excerpt,canonical_url,audience,schema_json,featured_image_url,featured_image_alt,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,sector_id,category_id' as const;

type CandidateRow = { content_id?: string | null; score?: number | null };

function latestUpdatedAt(rows: Array<Record<string, unknown>>) {
  let latest: string | null = null;
  let latestMs = Number.NEGATIVE_INFINITY;
  for (const row of rows) {
    const value = typeof row.updated_at === 'string' ? row.updated_at : '';
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp) && timestamp > latestMs) {
      latestMs = timestamp;
      latest = value;
    }
  }
  return latest;
}

export async function GET(request: Request) {
  const access = await withOptionalPartnerAccess(request, 'search:read');
  if (access.error) return access.error;
  const url = new URL(request.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (q.length < 2 || q.length > 160) return apiError(request, 400, 'invalid_parameter', 'q must contain between 2 and 160 characters.', 'q');
  const rawLimit = Number(url.searchParams.get('limit') || 20);
  const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, access.authorization?.authorized ? 100 : 50) : 20;
  const requestedType = (url.searchParams.get('type') || '').trim();

  const supabase = await createClient();

  // Rank search candidates inside PostgreSQL. Keeping the tsvector/websearch expression
  // behind an RPC avoids PostgREST parser differences while preserving RLS through
  // SECURITY INVOKER. Only published, indexable content can be returned by the RPC.
  const { data: candidateData, error: candidateError } = await supabase.rpc('api_search_public_content_ids', {
    p_query: q,
    p_limit: limit,
    p_type: requestedType || null,
  });
  if (candidateError) return apiError(request, 503, 'search_unavailable', 'Public search is temporarily unavailable.');

  const candidates = (Array.isArray(candidateData) ? candidateData : []) as CandidateRow[];
  const ids = candidates
    .map((row) => typeof row.content_id === 'string' ? row.content_id : '')
    .filter(Boolean);

  if (!ids.length) {
    const response = jsonResponse(request, {
      data: [],
      meta: {
        api_version: PUBLIC_API_VERSION,
        generated_at: new Date().toISOString(),
        query: q,
        type: requestedType || null,
        count: 0,
        search_mode: 'ranked_public_content',
      },
    }, { cacheControl: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' });
    return decoratePartnerResponse(response, access.headers);
  }

  let query = supabase
    .from('content')
    .select(SEARCH_CONTENT_FIELDS)
    .in('id', ids)
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString());
  if (requestedType) query = query.eq('content_type', requestedType);

  const { data, error } = await query;
  if (error) return apiError(request, 503, 'search_unavailable', 'Public search is temporarily unavailable.');

  const rank = new Map(ids.map((id, index) => [id, index]));
  const rows = (Array.isArray(data) ? data : []).slice().sort((left, right) => {
    const leftRank = rank.get(String(left.id)) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = rank.get(String(right.id)) ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  }) as Array<Record<string, unknown>>;

  const response = jsonResponse(request, {
    data: rows.map((row) => serializePublicContent(row, false)),
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      query: q,
      type: requestedType || null,
      count: rows.length,
      search_mode: 'ranked_public_content',
    },
  }, {
    cacheControl: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
    lastModified: latestUpdatedAt(rows),
  });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
