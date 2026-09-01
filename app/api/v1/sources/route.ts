import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

function boundedInteger(value: string | null, fallback: number, min: number, max: number) {
  if (value === null) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

function clean(value: string | null, max = 160) {
  const text = value?.trim() || '';
  if (!text) return { value: null, valid: true };
  return text.length <= max ? { value: text, valid: true } : { value: null, valid: false };
}

export async function GET(request: Request) {
  const access = await withOptionalPartnerAccess(request, 'sources:read');
  if (access.error) return access.error;

  const url = new URL(request.url);
  const limit = boundedInteger(url.searchParams.get('limit'), 25, 1, 100);
  if (limit === null) return apiError(request, 400, 'invalid_parameter', 'limit must be an integer between 1 and 100.', 'limit');
  const offset = boundedInteger(url.searchParams.get('offset'), 0, 0, 100000);
  if (offset === null) return apiError(request, 400, 'invalid_parameter', 'offset must be an integer between 0 and 100000.', 'offset');

  const publisherInput = clean(url.searchParams.get('publisher'));
  if (!publisherInput.valid) return apiError(request, 400, 'invalid_parameter', 'publisher must contain at most 160 characters.', 'publisher');
  const typeInput = clean(url.searchParams.get('type'), 80);
  if (!typeInput.valid) return apiError(request, 400, 'invalid_parameter', 'type must contain at most 80 characters.', 'type');
  const qInput = clean(url.searchParams.get('q'));
  if (!qInput.valid) return apiError(request, 400, 'invalid_parameter', 'q must contain at most 160 characters.', 'q');

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('api_source_registry', {
    p_limit: limit,
    p_offset: offset,
    p_publisher: publisherInput.value,
    p_type: typeInput.value,
    p_q: qInput.value,
  });

  if (error) return apiError(request, 503, 'upstream_unavailable', 'The source registry is temporarily unavailable.');
  const rows = Array.isArray(data) ? data : [];
  const response = jsonResponse(request, {
    data: rows,
    pagination: { limit, offset, returned: rows.length, next_offset: rows.length === limit ? offset + limit : null },
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      filters: { publisher: publisherInput.value, type: typeInput.value, q: qInput.value },
      provenance_note: 'السجل يعرض المصادر المرتبطة بمواد منشورة وقابلة للفهرسة فقط. وجود المصدر لا يمنح تلقائيًا حق إعادة نشره.',
    },
  });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
