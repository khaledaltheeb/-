import { buildOpenApiDocument } from '@/lib/openapi-v1-document';
import { jsonResponse } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return jsonResponse(request, buildOpenApiDocument(), {
    cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
  });
}
