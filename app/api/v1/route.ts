import { apiDiscovery, jsonResponse, optionsResponse } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return jsonResponse(request, {
    ...apiDiscovery(),
    resources: [
      'content','articles','guides','research','conditions','comparisons','tools','courses','learning-paths',
      'resources','protocols','interventions','assessments','glossary','sectors','categories','tags','search','evidence-discovery','lens','changes','stats',
    ],
    evidence_discovery: {
      href: '/api/v1/evidence-discovery',
      providers: ['europe_pmc','crossref','datacite','lens'],
      default_providers: ['europe_pmc','crossref','datacite'],
      lens_is_opt_in: true,
      lens_requires_server_configuration: true,
      provider_cursors_are_independent: true,
    },
    lens: {
      href: '/api/v1/lens',
      documentation: '/developers/lens',
      search_href: '/api/v1/evidence-discovery?providers=lens&q={query}',
      mode: 'explicit_opt_in',
      attribution: 'Data Sourced from The Lens',
      lens_id_retention_required: true,
      public_api_token_exposure: false,
      quota: { requests_per_minute: 10, requests_per_month: 20000, enforcement: 'distributed_fail_closed' },
    },
  }, { cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' });
}

export const OPTIONS = optionsResponse;
