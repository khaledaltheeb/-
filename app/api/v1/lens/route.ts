import { jsonResponse, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';

export const dynamic = 'force-dynamic';

const LENS_ATTRIBUTION = {
  provider: 'The Lens',
  label: 'Data Sourced from The Lens',
  url: 'https://www.lens.org/',
  terms_url: 'https://about.lens.org/policies/#attribution',
};

export async function GET(request: Request) {
  const configured = Boolean(process.env.LENS_SCHOLARLY_API_TOKEN?.trim());
  return jsonResponse(request, {
    name: 'Rawafid Lens Scholarly API integration',
    api_version: PUBLIC_API_VERSION,
    status: configured ? 'configured' : 'awaiting_credential',
    mode: 'explicit_opt_in',
    search: {
      endpoint: '/api/v1/evidence-discovery',
      required_provider_parameter: 'providers=lens',
      example: '/api/v1/evidence-discovery?q=autism&providers=lens&limit=5',
      mixed_example: '/api/v1/evidence-discovery?q=autism&providers=europe_pmc,crossref,datacite,lens&limit=10',
      default_provider_set_excludes_lens: true,
    },
    attribution: LENS_ATTRIBUTION,
    identifiers: {
      lens_id_preserved: true,
      record_fields: ['provider_id', 'identifiers.lens'],
      original_record_link_preserved: true,
    },
    quota: {
      requests_per_minute: 10,
      requests_per_month: 20000,
      enforcement: 'distributed_fail_closed',
      accounting_scope: 'global_service_allocation',
      retries_per_upstream_request: 0,
    },
    security: {
      credential: 'server_side_only',
      credential_name: 'LENS_SCHOLARLY_API_TOKEN',
      exposed_to_client: false,
      database_guard: 'private_security_definer_plus_public_security_invoker_wrapper',
      rpc_execution_role: 'service_role_only',
    },
    privacy: {
      lens_specific_user_tracking: false,
      lens_specific_user_profiles: false,
      lens_specific_fingerprinting: false,
      quota_accounting_contains_user_identifiers: false,
    },
    rights: {
      metadata_discovery_only: true,
      api_access_does_not_imply_full_text_reuse_rights: true,
      redistribution_requires_upstream_rights_and_terms: true,
      lens_id_and_attribution_must_be_retained_when_lens_data_is_displayed_or_redistributed: true,
    },
    failure_behavior: {
      missing_credential: 'provider_not_configured',
      quota_exhausted: 'lens_provider_rate_limited',
      quota_guard_unavailable: 'lens_provider_unavailable_fail_closed',
      other_providers_remain_available: true,
    },
    documentation: '/developers/lens',
    openapi: '/api/openapi.json',
  }, { cacheControl: 'public, max-age=60, s-maxage=300, stale-while-revalidate=900' });
}

export const OPTIONS = optionsResponse;
