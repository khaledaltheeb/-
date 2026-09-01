import { discoverEvidence } from '@/lib/research-integrations/evidence-discovery';
import type { EvidenceProvider } from '@/lib/research-integrations/types';
import { apiError, jsonResponse, optionsResponse, PUBLIC_API_VERSION } from '@/lib/public-api-v1';
import { decoratePartnerResponse, withOptionalPartnerAccess } from '@/lib/partner-api-v1';

export const dynamic = 'force-dynamic';

const ALLOWED = new Set<EvidenceProvider>(['europe_pmc', 'lens']);

function bounded(value: string | null, fallback: number, max: number) {
  const parsed = Number(value ?? fallback);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

function parseProviders(value: string | null): EvidenceProvider[] | null {
  if (!value) return ['europe_pmc', 'lens'];
  const list = [...new Set(value.split(',').map((item) => item.trim().toLowerCase()).filter(Boolean))];
  if (!list.length || list.some((item) => !ALLOWED.has(item as EvidenceProvider))) return null;
  return list as EvidenceProvider[];
}

export async function GET(request: Request) {
  const access = await withOptionalPartnerAccess(request, 'search:read');
  if (access.error) return access.error;
  const url = new URL(request.url);
  const q = url.searchParams.get('q')?.trim() || '';
  if (q.length < 2 || q.length > 500) return apiError(request, 400, 'invalid_parameter', 'q must contain 2-500 characters.', 'q');
  const providers = parseProviders(url.searchParams.get('providers'));
  if (!providers) return apiError(request, 400, 'invalid_parameter', 'providers may contain europe_pmc and lens only.', 'providers');
  const max = access.authorization?.authorized ? 100 : 50;
  const limit = bounded(url.searchParams.get('limit'), 20, max);
  const result = await discoverEvidence({ query: q, providers, limit, europe_pmc_cursor: url.searchParams.get('cursor') });
  const response = jsonResponse(request, {
    data: result.records,
    providers: result.providers,
    meta: {
      api_version: PUBLIC_API_VERSION,
      generated_at: new Date().toISOString(),
      query: q,
      requested_providers: providers,
      note: 'Discovery metadata is normalized from upstream services. Reuse rights remain governed by each source and record license.',
    },
  }, { cacheControl: 'public, max-age=0, s-maxage=300, stale-while-revalidate=900' });
  return decoratePartnerResponse(response, access.headers);
}

export const OPTIONS = optionsResponse;
