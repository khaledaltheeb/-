export type OpenBookProvider = 'doab' | 'oapen';

export type OpenBookRecord = {
  provider: OpenBookProvider;
  uuid?: string;
  handle?: string;
  title: string;
  subtitle?: string;
  creators: string[];
  publisher?: string;
  issued?: string;
  language?: string;
  license?: string;
  doi?: string;
  isbn: string[];
  subjects: string[];
  recordUrl: string;
};

export type PeerReviewRecord = {
  found: boolean;
  provider: 'doab-prism';
  doi?: string;
  isbn?: string;
  rawCount: number;
  entities: unknown[];
};

const PROVIDERS: Record<OpenBookProvider, { label: string; endpoint: string; recordBase: string }> = {
  doab: {
    label: 'DOAB',
    endpoint: 'https://directory.doabooks.org/rest/search',
    recordBase: 'https://directory.doabooks.org/handle/',
  },
  oapen: {
    label: 'OAPEN Library',
    endpoint: 'https://library.oapen.org/rest/search',
    recordBase: 'https://library.oapen.org/handle/',
  },
};

function safeQuery(input: string) {
  return input.replace(/[<>\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180);
}

function metadataEntries(item: unknown): Array<{ key: string; value: string }> {
  if (!item || typeof item !== 'object') return [];
  const candidate = (item as { metadata?: unknown }).metadata;
  if (!candidate) return [];

  if (Array.isArray(candidate)) {
    return candidate.flatMap((entry) => {
      if (!entry || typeof entry !== 'object') return [];
      const key = String((entry as { key?: unknown }).key ?? '');
      const value = String((entry as { value?: unknown }).value ?? '');
      return key && value ? [{ key, value }] : [];
    });
  }

  if (typeof candidate === 'object') {
    return Object.entries(candidate as Record<string, unknown>).flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.flatMap((entry) => {
          if (typeof entry === 'string') return [{ key, value: entry }];
          if (entry && typeof entry === 'object' && 'value' in entry) {
            return [{ key, value: String((entry as { value?: unknown }).value ?? '') }];
          }
          return [];
        });
      }
      if (typeof value === 'string') return [{ key, value }];
      return [];
    });
  }

  return [];
}

function values(meta: Array<{ key: string; value: string }>, ...keys: string[]) {
  const wanted = new Set(keys);
  return meta.filter((entry) => wanted.has(entry.key)).map((entry) => entry.value).filter(Boolean);
}

function first(meta: Array<{ key: string; value: string }>, ...keys: string[]) {
  return values(meta, ...keys)[0];
}

function findDoi(meta: Array<{ key: string; value: string }>) {
  const candidates = values(meta, 'dc.identifier.doi', 'oapen.identifier.doi', 'dc.identifier');
  for (const value of candidates) {
    const match = value.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
    if (match) return match[0].replace(/[).,;]+$/, '');
  }
  return undefined;
}

function normalizeItem(provider: OpenBookProvider, item: unknown): OpenBookRecord | null {
  if (!item || typeof item !== 'object') return null;
  const raw = item as { uuid?: unknown; handle?: unknown; name?: unknown };
  const meta = metadataEntries(item);
  const handle = typeof raw.handle === 'string' ? raw.handle : first(meta, 'dc.identifier.uri')?.match(/handle\/(.+)$/)?.[1];
  const title = first(meta, 'dc.title') || (typeof raw.name === 'string' ? raw.name : '');
  if (!title) return null;

  const providerConfig = PROVIDERS[provider];
  const creators = values(meta, 'dc.contributor.author', 'dc.creator', 'dc.contributor.editor');
  const isbn = values(meta, 'dc.identifier.isbn', 'oapen.identifier.isbn');
  const subjects = values(meta, 'dc.subject', 'dc.subject.other', 'dc.subject.classification').slice(0, 8);
  const recordUrl = handle ? `${providerConfig.recordBase}${handle}` : providerConfig.endpoint;

  return {
    provider,
    uuid: typeof raw.uuid === 'string' ? raw.uuid : undefined,
    handle,
    title,
    subtitle: first(meta, 'dc.title.alternative'),
    creators: [...new Set(creators)].slice(0, 8),
    publisher: first(meta, 'dc.publisher', 'publisher.name'),
    issued: first(meta, 'dc.date.issued'),
    language: first(meta, 'dc.language', 'dc.language.iso'),
    license: first(meta, 'dc.rights', 'dc.rights.uri', 'dcterms.accessRights'),
    doi: findDoi(meta),
    isbn: [...new Set(isbn)].slice(0, 6),
    subjects: [...new Set(subjects)],
    recordUrl,
  };
}

function payloadItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  const object = payload as Record<string, unknown>;
  if (Array.isArray(object.items)) return object.items;
  if (Array.isArray(object.results)) return object.results;
  if (object._embedded && typeof object._embedded === 'object') {
    const embedded = object._embedded as Record<string, unknown>;
    for (const value of Object.values(embedded)) {
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

export async function searchOpenBooks(provider: OpenBookProvider, rawQuery: string, limit = 20) {
  const query = safeQuery(rawQuery);
  if (!query) return [] as OpenBookRecord[];
  const safeLimit = Math.min(Math.max(limit, 1), 40);
  const config = PROVIDERS[provider];
  const url = new URL(config.endpoint);
  url.searchParams.set('query', query);
  url.searchParams.set('expand', 'metadata');
  url.searchParams.set('limit', String(safeLimit));

  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'HealthRenewal-OpenBookDiscovery/1.0' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`${config.label} search failed with HTTP ${response.status}`);
  const payload = (await response.json()) as unknown;
  return payloadItems(payload).map((item) => normalizeItem(provider, item)).filter((item): item is OpenBookRecord => Boolean(item)).slice(0, safeLimit);
}

export async function lookupDoabPeerReview(identifier: { doi?: string; isbn?: string }): Promise<PeerReviewRecord> {
  const doi = identifier.doi?.trim().slice(0, 160);
  const isbn = identifier.isbn?.replace(/[^0-9Xx-]/g, '').slice(0, 24);
  if (!doi && !isbn) return { found: false, provider: 'doab-prism', rawCount: 0, entities: [] };

  const url = new URL('https://directory.doabooks.org/rest/peerReviews');
  if (doi) url.searchParams.set('doi', doi);
  else if (isbn) url.searchParams.set('isbn', isbn);

  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'HealthRenewal-OpenBookDiscovery/1.0' },
    cache: 'no-store',
  });
  if (response.status === 404) return { found: false, provider: 'doab-prism', doi, isbn, rawCount: 0, entities: [] };
  if (!response.ok) throw new Error(`DOAB PRISM lookup failed with HTTP ${response.status}`);
  const payload = (await response.json()) as unknown;
  const entities = Array.isArray(payload) ? payload : payloadItems(payload);
  return { found: entities.length > 0, provider: 'doab-prism', doi, isbn, rawCount: entities.length, entities };
}

export const OPEN_BOOK_SOURCE_INFO = {
  doab: {
    label: 'Directory of Open Access Books (DOAB)',
    metadata: 'https://www.doabooks.org/en/resources/metadata-harvesting-and-content-dissemination',
    api: 'https://www.doabooks.org/en/article/api-search-doab',
  },
  oapen: {
    label: 'OAPEN Library',
    metadata: 'https://www.oapen.org/librarians/15635975-metadata',
    api: 'https://www.oapen.org/article/8185269-search-using-a-rest-api',
  },
} as const;
