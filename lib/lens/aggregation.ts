import 'server-only';

const ENDPOINT = 'https://api.lens.org/scholarly/aggregate';

export type LensLandscapeDimension =
  | 'year'
  | 'field'
  | 'country'
  | 'institution'
  | 'publication_type'
  | 'open_access';

type LandscapeOptions = {
  query: string;
  dimension: LensLandscapeDimension;
  size?: number;
  yearFrom?: number;
  yearTo?: number;
};

function token(): string {
  const value = process.env.LENS_SCHOLARLY_API_TOKEN?.trim();
  if (!value) throw new Error('LENS_SCHOLARLY_API_TOKEN is not configured');
  return value;
}

function queryFor(options: LandscapeOptions): unknown {
  const q = options.query.trim();
  if (q.length < 2) throw new Error('Lens aggregation query must contain at least 2 characters');
  if (!options.yearFrom && !options.yearTo) return q;
  return {
    bool: {
      must: [{ multi_match: { query: q, fields: ['title^4', 'abstract^2', 'keyword^2', 'field_of_study'] } }],
      filter: [{
        range: {
          year_published: {
            ...(options.yearFrom ? { gte: options.yearFrom } : {}),
            ...(options.yearTo ? { lte: options.yearTo } : {}),
          },
        },
      }],
    },
  };
}

function aggregationFor(dimension: LensLandscapeDimension, size: number) {
  switch (dimension) {
    case 'year':
      return { timeline: { terms: { field: 'year_published', size, order: { field_value: 'asc' } } } };
    case 'field':
      return { fields: { terms: { field: 'field_of_study', size, order: { doc_count: 'desc' } } } };
    case 'country':
      return { countries: { terms: { field: 'author.affiliation.address.country_code', size, order: { doc_count: 'desc' } } } };
    case 'institution':
      return { institutions: { terms: { field: 'author.affiliation.name.exact', size, order: { doc_count: 'desc' } } } };
    case 'publication_type':
      return { publication_types: { terms: { field: 'publication_type', size, order: { doc_count: 'desc' } } } };
    case 'open_access':
      return { open_access: { terms: { field: 'open_access.colour', size, order: { doc_count: 'desc' } } } };
  }
}

export async function aggregateLensLandscape(options: LandscapeOptions) {
  const size = Math.max(1, Math.min(100, Math.trunc(options.size ?? 20)));
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token()}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: queryFor(options),
      aggregations: aggregationFor(options.dimension, size),
      size: 0,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(20_000),
  });

  const raw = await response.text();
  if (!response.ok) {
    const error = new Error(`Lens aggregation request failed with HTTP ${response.status}`);
    Object.assign(error, { status: response.status, responseBody: raw.slice(0, 1000) });
    throw error;
  }
  return JSON.parse(raw) as Record<string, unknown>;
}
