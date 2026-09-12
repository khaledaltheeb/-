import { createClient } from '@/lib/supabase/server';
import { apiError, CONTENT_RESOURCE_TYPES, jsonResponse, listPublicContent, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

const TAXONOMIES: Record<string, { table: 'sectors' | 'categories' | 'tags'; fields: string; order: string }> = {
  sectors: { table: 'sectors', fields: 'id,slug,name_ar,description,seo_title,seo_description,audience,metadata,updated_at', order: 'sort_order' },
  categories: { table: 'categories', fields: 'id,sector_id,parent_id,slug,name_ar,description,seo_title,seo_description,audience,metadata,updated_at', order: 'sort_order' },
  tags: { table: 'tags', fields: 'id,slug,name_ar,description,updated_at', order: 'name_ar' },
};

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

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const access = await withOptionalPartnerAccess(request, 'content:read');
  if (access.error) return access.error;
  const { resource } = await context.params;
  const type = CONTENT_RESOURCE_TYPES[resource];
  if (type) return decoratePartnerResponse(await listPublicContent(request, type), access.headers);

  const taxonomy = TAXONOMIES[resource];
  if (!taxonomy) return apiError(request, 404, 'not_found', 'The requested API resource does not exist.');

  const url = new URL(request.url);
  const limitRaw = url.searchParams.get('limit');
  const offsetRaw = url.searchParams.get('offset');
  const parsedLimit = limitRaw === null ? 100 : Number(limitRaw);
  const parsedOffset = offsetRaw === null ? 0 : Number(offsetRaw);
  if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 500) {
    return apiError(request, 400, 'invalid_parameter', 'limit must be an integer between 1 and 500 for taxonomy resources.', 'limit');
  }
  if (!Number.isInteger(parsedOffset) || parsedOffset < 0 || parsedOffset > 100000) {
    return apiError(request, 400, 'invalid_parameter', 'offset must be an integer between 0 and 100000 for taxonomy resources.', 'offset');
  }
  const limit = parsedLimit;
  const offset = parsedOffset;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(taxonomy.table)
    .select(taxonomy.fields)
    .eq('is_active', true)
    .order(taxonomy.order, { ascending: true })
    .range(offset, offset + limit);
  if (error) return apiError(request, 503, 'upstream_unavailable', 'The public taxonomy is temporarily unavailable.');

  const rawRows: unknown[] = Array.isArray(data) ? data : [];
  const rows = rawRows.filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null);
  const hasMore = rows.length > limit;
  const page = rows.slice(0, limit);
  const nextOffset = hasMore ? offset + page.length : null;

  const response = jsonResponse(request, {
    data: page,
    pagination: {
      limit,
      offset,
      returned: page.length,
      has_more: hasMore,
      next_offset: nextOffset,
    },
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      resource,
      pagination_mode: 'offset',
    },
  }, {
    cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
    lastModified: latestUpdatedAt(page),
  });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;