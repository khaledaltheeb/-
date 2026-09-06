import { apiDiscovery, jsonResponse, optionsResponse } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return jsonResponse(request, {
    ...apiDiscovery(),
    resources: [
      'content','articles','guides','research','conditions','comparisons','tools','courses','learning-paths',
      'resources','protocols','interventions','assessments','glossary','sectors','categories','tags','search','evidence-discovery','changes','stats',
    ],
    evidence_discovery: {
      href: '/api/v1/evidence-discovery',
      providers: ['europe_pmc','crossref','datacite','lens'],
      default_providers: ['europe_pmc','crossref','datacite','lens'],
      lens_requires_server_configuration: true,
      provider_cursors_are_independent: true,
    },
    integrations: {
      crossref_work_metadata: {
        href: '/api/v1/integrations/crossref/works?doi={doi}',
        method: 'GET',
        purpose: 'Resolve one DOI to governed Crossref bibliographic metadata while preserving source title, stewardship, relations, licenses and record timestamps.',
        metadata_only: true,
        optional_partner_scope: 'sources:read',
      },
    },
  }, { cacheControl: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' });
}

export const OPTIONS = optionsResponse;
