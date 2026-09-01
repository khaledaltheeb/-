import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const access = await withOptionalPartnerAccess(request, 'sources:read');
  if (access.error) return access.error;
  const { slug } = await context.params;
  if (!/^[a-z0-9][a-z0-9-]{0,199}$/i.test(slug)) return apiError(request, 400, 'invalid_parameter', 'The slug is invalid.', 'slug');

  const supabase = await createClient();
  const { data, error } = await supabase.rpc('api_content_sources', { p_slug: slug });
  if (error) return apiError(request, 503, 'upstream_unavailable', 'The public source registry is temporarily unavailable.');
  if (!data) return apiError(request, 404, 'not_found', 'The requested public resource was not found.');

  const row = data as { content?: { updated_at?: string | null }; sources?: unknown[] };
  const response = jsonResponse(request, {
    data: {
      ...data,
      source_count: Array.isArray(row.sources) ? row.sources.length : 0,
    },
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      registry: 'normalized-v1',
      provenance_note: 'هذه الواجهة تعرض سجل المصادر المعياري المرتبط بالمادة المنشورة. وجود المصدر أو الترخيص المسجل لا يمنح تلقائيًا حقوقًا تتجاوز شروط صاحب المصدر.',
    },
  }, { lastModified: row.content?.updated_at || null });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
