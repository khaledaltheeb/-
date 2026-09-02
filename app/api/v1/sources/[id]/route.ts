import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await withOptionalPartnerAccess(request, 'sources:read');
  if (access.error) return access.error;

  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return apiError(request, 400, 'invalid_parameter', 'The source id must be a UUID.', 'id');
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('api_source_detail', { p_source_id: id });
  if (error) return apiError(request, 503, 'upstream_unavailable', 'The source registry is temporarily unavailable.');
  if (!data) return apiError(request, 404, 'not_found', 'The requested source was not found in the public registry.');

  const response = jsonResponse(request, {
    data,
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      provenance_note: 'إصدارات المصدر وسجل الاستشهادات مخصصة للتتبع والإسناد، وليست ترخيصًا لإعادة نشر محتوى الطرف الثالث.',
    },
  });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
