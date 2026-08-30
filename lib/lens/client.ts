import 'server-only';

import type {
  LensScholarlySearchOptions,
  LensScholarlySearchResponse,
} from './types';

const LENS_SCHOLARLY_ENDPOINT = 'https://api.lens.org/scholarly/search';
const DEFAULT_INCLUDE = [
  'lens_id',
  'title',
  'publication_type',
  'year_published',
  'date_published',
  'languages',
  'source',
  'authors',
  'external_ids',
  'open_access',
  'scholarly_citations_count',
  'patent_citations_count',
  'references_count',
  'references_resolved_count',
  'fields_of_study',
  'keywords',
  'mesh_terms',
  'source_urls',
  'retraction_updates',
];

function getToken(): string {
  const token = process.env.LENS_SCHOLARLY_API_TOKEN?.trim();
  if (!token) {
    throw new Error('LENS_SCHOLARLY_API_TOKEN is not configured');
  }
  return token;
}

function clampSize(size?: number): number {
  if (!Number.isFinite(size)) return 20;
  return Math.max(1, Math.min(100, Math.trunc(size!)));
}

function clampFrom(from?: number): number {
  if (!Number.isFinite(from)) return 0;
  return Math.max(0, Math.trunc(from!));
}

function buildQuery(options: LensScholarlySearchOptions): unknown {
  const query = options.query.trim();
  if (query.length < 2) {
    throw new Error('Lens scholarly query must contain at least 2 characters');
  }

  const filter: unknown[] = [];

  if (options.yearFrom || options.yearTo) {
    filter.push({
      range: {
        year_published: {
          ...(options.yearFrom ? { gte: options.yearFrom } : {}),
          ...(options.yearTo ? { lte: options.yearTo } : {}),
        },
      },
    });
  }

  if (options.publicationTypes?.length) {
    filter.push({ terms: { publication_type: options.publicationTypes } });
  }

  if (options.openAccessOnly) {
    filter.push({ exists: { field: 'open_access' } });
  }

  const mustNot: unknown[] = [];
  if (!options.includeRetracted) {
    mustNot.push({ exists: { field: 'retraction_updates' } });
  }

  if (filter.length === 0 && mustNot.length === 0) return query;

  return {
    bool: {
      must: [
        {
          multi_match: {
            query,
            fields: ['title^4', 'abstract^2', 'keywords^2', 'fields_of_study', 'mesh_terms.mesh_heading'],
          },
        },
      ],
      ...(filter.length ? { filter } : {}),
      ...(mustNot.length ? { must_not: mustNot } : {}),
    },
  };
}

export async function searchLensScholarly(
  options: LensScholarlySearchOptions,
): Promise<LensScholarlySearchResponse> {
  const requestBody = {
    query: buildQuery(options),
    size: clampSize(options.size),
    from: clampFrom(options.from),
    include: DEFAULT_INCLUDE,
    sort: [{ year_published: 'desc' }],
  };

  const response = await fetch(LENS_SCHOLARLY_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestBody),
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });

  const rateLimitRemaining = response.headers.get('x-rate-limit-remaining-request-per-minute');
  const monthlyRequestRemaining = response.headers.get('x-rate-limit-remaining-request-per-month');
  const monthlyRecordRemaining = response.headers.get('x-rate-limit-remaining-record-per-month');
  const retryAfter = response.headers.get('x-rate-limit-retry-after-seconds');
  const raw = await response.text();

  if (!response.ok) {
    const error = new Error(`Lens scholarly request failed with HTTP ${response.status}`);
    Object.assign(error, {
      status: response.status,
      retryAfter,
      rateLimitRemaining,
      monthlyRequestRemaining,
      monthlyRecordRemaining,
      responseBody: raw.slice(0, 1000),
    });
    throw error;
  }

  const data = JSON.parse(raw) as LensScholarlySearchResponse;
  return {
    ...data,
    _rawafid: {
      source: 'The Lens',
      endpoint: 'scholarly/search',
      rate_limit_remaining_per_minute: rateLimitRemaining,
      rate_limit_remaining_per_month: monthlyRequestRemaining,
      record_limit_remaining_per_month: monthlyRecordRemaining,
    },
  };
}

export function isLensConfigured(): boolean {
  return Boolean(process.env.LENS_SCHOLARLY_API_TOKEN?.trim());
}
