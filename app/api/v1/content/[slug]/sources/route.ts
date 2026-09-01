import { createClient } from '@/lib/supabase/server';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION, serializePublicContent } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const access = await withOptionalPartnerAccess(request, 'sources:read');
  if (access.error) return access.error;
  const { slug } = await context.params;
  if (!/^[a-z0-9][a-z0-9-]{0,199}$/i.test(slug)) return apiError(request, 400, 'invalid_parameter', 'The slug is invalid.', 'slug');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select('id,content_type,slug,title,canonical_url,references_json,schema_json,updated_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  if (error) return apiError(request, 503, 'upstream_unavailable', 'The public source registry is temporarily unavailable.');
  if (!data) return apiError(request, 404, 'not_found', 'The requested public resource was not found.');

  const serialized = serializePublicContent(data as Record<string, unknown>, false);
  const response = jsonResponse(request, {
    data: {
      content: { id: serialized.id, type: serialized.type, slug: serialized.slug, title: serialized.title, canonical_url: serialized.canonical_url },
      sources: serialized.references,
      source_count: Array.isArray(serialized.references) ? serialized.references.length : 0,
      rights: serialized.rights,
    },
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      provenance_note: 'هذه الواجهة تعرض المراجع المسجلة للمادة المنشورة ولا تعني أن كل مصدر يمنح حق إعادة نشر نصه.',
    },
  }, { lastModified: data.updated_at ? String(data.updated_at) : null });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
