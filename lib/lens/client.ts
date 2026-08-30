import 'server-only';

import type {
  LensScholarlySearchOptions,
  LensScholarlySearchResponse,
} from './types';

const LENS_SCHOLARLY_ENDPOINT = 'https://api.lens.org/scholarly/search';
const DEFAULT_INCLUDE = [
  'lens_id',
  'title',
  'year_published',
  'date_published',
  'source',
  'authors',
  'external_ids',
  'open_access',
  'scholarly_citations_count',
  'references_count',
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

export async function searchLensScholarly(
  options: LensScholarlySearchOptions,
): Promise<LensScholarlySearchResponse> {
  const query = options.query.trim();
  if (query.length < 2) {
    throw new Error('Lens scholarly query must contain at least 2 characters');
  }

  const filters: unknown[] = [];
  if (options.yearFrom || options.yearTo) {
    filters.push({
      range: {
        year_published: {
          ...(options.yearFrom ? { gte: options.yearFrom } : {}),
          ...(options.yearTo ? { lte: options.yearTo } : {}),
        },
      },
    });
  }

  const requestBody = {
    query:
      filters.length > 0
        ? {
            bool: {
              must: [{ match: { title: query } }],
              filter: filters,
            },
          }
        : query,
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
  const retryAfter = response.headers.get('x-rate-limit-retry-after-seconds');
  const raw = await response.text();

  if (!response.ok) {
    const error = new Error(`Lens scholarly request failed with HTTP ${response.status}`);
    Object.assign(error, {
      status: response.status,
      retryAfter,
      rateLimitRemaining,
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
    },
  };
}

export function isLensConfigured(): boolean {
  return Boolean(process.env.LENS_SCHOLARLY_API_TOKEN?.trim());
}
