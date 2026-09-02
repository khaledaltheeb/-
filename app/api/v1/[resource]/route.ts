import { createClient } from '@/lib/supabase/server';
import { apiError, CONTENT_RESOURCE_TYPES, jsonResponse, listPublicContent, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

const TAXONOMIES: Record<string, { table: 'sectors' | 'categories' | 'tags'; fields: string; order: string }> = {
  sectors: { table: 'sectors', fields: 'id,slug,name_ar,description,seo_title,seo_description,audience,updated_at', order: 'sort_order' },
  categories: { table: 'categories', fields: 'id,sector_id,parent_id,slug,name_ar,description,seo_title,seo_description,audience,updated_at', order: 'sort_order' },
  tags: { table: 'tags', fields: 'id,slug,name_ar,description,updated_at', order: 'name_ar' },
};

export async function GET(request: Request, context: { params: Promise<{ resource: string }> }) {
  const access = await withOptionalPartnerAccess(request, 'content:read');
  if (access.error) return access.error;
  const { resource } = await context.params;
  const type = CONTENT_RESOURCE_TYPES[resource];
  if (type) return decoratePartnerResponse(await listPublicContent(request, type), access.headers);

  const taxonomy = TAXONOMIES[resource];
  if (!taxonomy) return apiError(request, 404, 'not_found', 'The requested API resource does not exist.');

  const limitRaw = new URL(request.url).searchParams.get('limit');
  const limit = limitRaw === null ? 100 : Number(limitRaw);
  if (!Number.isInteger(limit) || limit < 1 || limit > 500) return apiError(request, 400, 'invalid_parameter', 'limit must be an integer between 1 and 500.', 'limit');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(taxonomy.table)
    .select(taxonomy.fields)
    .eq('is_active', true)
    .order(taxonomy.order, { ascending: true })
    .limit(limit);
  if (error) return apiError(request, 503, 'upstream_unavailable', 'The public taxonomy is temporarily unavailable.');

  const response = jsonResponse(request, {
    data: data || [],
    pagination: { limit, has_more: Array.isArray(data) && data.length === limit },
    meta: { api_version: PUBLIC_API_VERSION, generated_at: new Date().toISOString(), resource },
  }, { cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
