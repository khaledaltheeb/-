import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { CROSSREF_OPERATIONAL_POLICY, fetchCrossrefWork, normalizeDoi } from '@/lib/crossref-metadata';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const access = await withOptionalPartnerAccess(request, 'sources:read');
  if (access.error) return access.error;
  const doi = normalizeDoi(new URL(request.url).searchParams.get('doi') || '');
  if (!doi) return apiError(request, 400, 'invalid_parameter', 'doi must be a valid DOI or https://doi.org URL.', 'doi');

  try {
    const result = await fetchCrossrefWork(doi);
    if (result.status === 404) return apiError(request, 404, 'not_found', 'No Crossref metadata record was found for this DOI.');
    if (result.status !== 200 || !result.data) {
      const retryAfter = result.headers.get('retry-after');
      const response = apiError(request, result.status === 429 ? 429 : 503, result.status === 429 ? 'upstream_rate_limited' : 'upstream_unavailable', 'Crossref metadata is temporarily unavailable.');
      if (retryAfter) response.headers.set('Retry-After', retryAfter);
      return response;
    }
    const response = jsonResponse(request, {
      data: result.data,
      meta: {
        api_version: PUBLIC_API_VERSION,
        integration: 'crossref',
        generated_at: new Date().toISOString(),
        operational_policy: CROSSREF_OPERATIONAL_POLICY,
      },
    }, { cacheControl: 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800' });
    return decoratePartnerResponse(response, access.headers);
  } catch {
    return apiError(request, 503, 'upstream_unavailable', 'Crossref metadata is temporarily unavailable.');
  }
}

export const OPTIONS = optionsResponse;
