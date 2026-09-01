import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

function boundedInteger(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function clean(value: string | null, max = 160) {
  const text = value?.trim() || '';
  return text ? text.slice(0, max) : null;
}

export async function GET(request: Request) {
  const access = await withOptionalPartnerAccess(request, 'sources:read');
  if (access.error) return access.error;

  const url = new URL(request.url);
  const limit = boundedInteger(url.searchParams.get('limit'), 25, 1, 100);
  const offset = boundedInteger(url.searchParams.get('offset'), 0, 0, 100000);
  const publisher = clean(url.searchParams.get('publisher'));
  const type = clean(url.searchParams.get('type'), 80);
  const q = clean(url.searchParams.get('q'));

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('api_source_registry', {
    p_limit: limit,
    p_offset: offset,
    p_publisher: publisher,
    p_type: type,
    p_q: q,
  });

  if (error) return apiError(request, 503, 'upstream_unavailable', 'The source registry is temporarily unavailable.');
  const rows = Array.isArray(data) ? data : [];
  const response = jsonResponse(request, {
    data: rows,
    pagination: { limit, offset, returned: rows.length, next_offset: rows.length === limit ? offset + limit : null },
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      filters: { publisher, type, q },
      provenance_note: 'السجل يعرض المصادر المرتبطة بمواد منشورة وقابلة للفهرسة فقط. وجود المصدر لا يمنح تلقائيًا حق إعادة نشره.',
    },
  });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
