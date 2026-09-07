import { discoverEvidence } from '@/lib/research-integrations/evidence-discovery';
import type { EvidenceProvider } from '@/lib/research-integrations/types';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

const ALLOWED = new Set<EvidenceProvider>(['europe_pmc', 'crossref', 'datacite', 'lens']);
const DEFAULT_PROVIDERS: EvidenceProvider[] = ['europe_pmc', 'crossref', 'datacite'];
const LENS_ATTRIBUTION = {
  provider: 'The Lens',
  label: 'Scholarly metadata provided by The Lens',
  url: 'https://www.lens.org/',
  terms_url: 'https://about.lens.org/policies/#attribution',
};

function bounded(value: string | null, fallback: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function parseProviders(value: string | null): EvidenceProvider[] | null {
  if (!value) return DEFAULT_PROVIDERS;
  const list = [...new Set(value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))];
  if (!list.length || list.some((item) => !ALLOWED.has(item as EvidenceProvider))) return null;
  return list as EvidenceProvider[];
}

function optionalDate(value: string | null) {
  if (!value) return { value: null, valid: true };
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? { value: null, valid: false } : { value: new Date(timestamp).toISOString(), valid: true };
}

export async function GET(request: Request) {
  const access = await withOptionalPartnerAccess(request, 'search:read');
  if (access.error) return access.error;
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() || '';
  if (q.length < 2 || q.length > 500) return apiError(request, 400, 'invalid_parameter', 'q must contain 2-500 characters.', 'q');
  const providers = parseProviders(url.searchParams.get('providers'));
  if (!providers) return apiError(request, 400, 'invalid_parameter', 'providers may contain europe_pmc, crossref, datacite and lens only.', 'providers');
  const fromUpdate = optionalDate(url.searchParams.get('crossref_from_update_date'));
  if (!fromUpdate.valid) return apiError(request, 400, 'invalid_parameter', 'crossref_from_update_date must be a valid ISO date.', 'crossref_from_update_date');
  const fromIndex = optionalDate(url.searchParams.get('crossref_from_index_date'));
  if (!fromIndex.valid) return apiError(request, 400, 'invalid_parameter', 'crossref_from_index_date must be a valid ISO date.', 'crossref_from_index_date');

  const max = access.authorization?.authorized ? 100 : 50;
  const limit = bounded(url.searchParams.get('limit'), 20, max);
  const result = await discoverEvidence({
    query: q,
    providers,
    limit,
    europe_pmc_cursor: url.searchParams.get('europe_pmc_cursor') || url.searchParams.get('cursor'),
    crossref_cursor: url.searchParams.get('crossref_cursor'),
    datacite_cursor: url.searchParams.get('datacite_cursor'),
    crossref_from_update_date: fromUpdate.value,
    crossref_from_index_date: fromIndex.value,
  });
  const response = jsonResponse(request, {
    data: result.records,
    providers: result.providers,
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      query: q,
      requested_providers: providers,
      default_providers: DEFAULT_PROVIDERS,
      lens: providers.includes('lens') ? {
        opt_in: true,
        attribution: LENS_ATTRIBUTION,
        plan_limits: { requests_per_minute: 10, requests_per_month: 20000 },
      } : {
        opt_in: false,
        note: 'Lens is intentionally opt-in. Add lens to providers to use the configured Lens Scholarly API integration.',
      },
      note: 'Discovery metadata is normalized from upstream services. Reuse rights remain governed by each source and record license.',
    },
  }, { cacheControl: 'public, max-age=0, s-maxage=300, stale-while-revalidate=900' });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
