import { searchCrossref } from '@/lib/research-integrations/crossref';
import { searchDataCite } from '@/lib/research-integrations/datacite';
import { deduplicateEvidence } from '@/lib/research-integrations/dedupe';
import { searchEuropePmc } from '@/lib/research-integrations/europe-pmc';
import { ExternalServiceError } from '@/lib/research-integrations/http';
import { searchLensScholarly } from '@/lib/research-integrations/lens';
import type { EvidenceProvider, EvidenceRecord } from '@/lib/research-integrations/types';

export type ProviderStatus = {
  provider: EvidenceProvider;
  status: 'ok' | 'not_configured' | 'error';
  returned: number;
  total: number | null;
  next_cursor: string | null;
  error?: { code: string; retryable: boolean };
};

function failed(provider: EvidenceProvider, error: unknown): ProviderStatus {
  const external = error instanceof ExternalServiceError ? error : null;
  return {
    provider,
    status: 'error',
    returned: 0,
    total: null,
    next_cursor: null,
    error: { code: external?.status === 429 ? 'rate_limited' : 'provider_unavailable', retryable: external?.retryable ?? true },
  };
}

export async function discoverEvidence(options: {
  query: string;
  providers: EvidenceProvider[];
  limit: number;
  europe_pmc_cursor?: string | null;
  crossref_cursor?: string | null;
  datacite_cursor?: string | null;
  crossref_from_update_date?: string | null;
  crossref_from_index_date?: string | null;
}) {
  const tasks = options.providers.map(async (provider) => {
    if (provider === 'europe_pmc') {
      try {
        const page = await searchEuropePmc({
          query: options.query,
          page_size: options.limit,
          cursor_mark: options.europe_pmc_cursor,
          result_type: 'core',
          email: process.env.RESEARCH_API_CONTACT_EMAIL || 'contact@healthrenewal.org',
        });
        return { records: page.records, status: { provider, status: 'ok', returned: page.records.length, total: page.total, next_cursor: page.next_cursor } as ProviderStatus };
      } catch (error) {
        return { records: [] as EvidenceRecord[], status: failed(provider, error) };
      }
    }

    if (provider === 'crossref') {
      try {
        const page = await searchCrossref({
          query: options.query,
          rows: Math.min(options.limit, 100),
          cursor: options.crossref_cursor,
          mailto: process.env.RESEARCH_API_CONTACT_EMAIL || 'contact@healthrenewal.org',
          from_update_date: options.crossref_from_update_date,
          from_index_date: options.crossref_from_index_date,
        });
        return { records: page.records, status: { provider, status: 'ok', returned: page.records.length, total: page.total, next_cursor: page.next_cursor } as ProviderStatus };
      } catch (error) {
        return { records: [] as EvidenceRecord[], status: failed(provider, error) };
      }
    }

    if (provider === 'datacite') {
      try {
        const page = await searchDataCite({
          query: options.query,
          page_size: Math.min(options.limit, 100),
          cursor: options.datacite_cursor,
          contact_email: process.env.RESEARCH_API_CONTACT_EMAIL || 'contact@healthrenewal.org',
        });
        return { records: page.records, status: { provider, status: 'ok', returned: page.records.length, total: page.total, next_cursor: page.next_cursor } as ProviderStatus };
      } catch (error) {
        return { records: [] as EvidenceRecord[], status: failed(provider, error) };
      }
    }

    const token = process.env.LENS_SCHOLARLY_API_TOKEN?.trim();
    if (!token) return { records: [] as EvidenceRecord[], status: { provider, status: 'not_configured', returned: 0, total: null, next_cursor: null } as ProviderStatus };
    try {
      const page = await searchLensScholarly({ token, query: options.query, size: Math.min(options.limit, 100), query_description: options.query, sort: [{ year_published: 'desc' }] });
      return { records: page.records, status: { provider, status: 'ok', returned: page.records.length, total: page.total, next_cursor: null } as ProviderStatus };
    } catch (error) {
      return { records: [] as EvidenceRecord[], status: failed(provider, error) };
    }
  });

  const results = await Promise.all(tasks);
  return { records: deduplicateEvidence(results.flatMap((result) => result.records)).slice(0, options.limit), providers: results.map((result) => result.status) };
}
