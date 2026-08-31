const OAPEN_SEARCH = 'https://library.oapen.org/rest/search';
const DOAB_SEARCH = 'https://directory.doabooks.org/rest/search';
const DOAB_PEER_REVIEW = 'https://directory.doabooks.org/rest/peerReviews';
const CROSSREF_WORKS = 'https://api.crossref.org/works';
const CROSSREF_MAILTO = 'Contact@healthrenewal.org';
const USER_AGENT = 'HealthRenewal/1.0 (https://healthrenewal.org/; mailto:Contact@healthrenewal.org)';

export type BookSource = 'oapen' | 'doab';

export type OpenBookRecord = {
  source: BookSource;
  title: string;
  authors: string[];
  publisher?: string;
  language?: string;
  date?: string;
  doi?: string;
  isbn: string[];
  license?: string;
  subjects: string[];
  handle?: string;
  recordUrl?: string;
};

export type CrossrefRecord = {
  doi: string;
  title?: string;
  type?: string;
  publisher?: string;
  published?: string;
  authors: string[];
  containerTitle?: string;
  issn: string[];
  isbn: string[];
  licenses: string[];
  funders: string[];
  orcids: string[];
  rors: string[];
  referencesCount?: number;
  isReferencedByCount?: number;
  updateTo: Array<{ doi?: string; type?: string; label?: string }>;
  resourceUrl: string;
};

type DspaceMetadataEntry = { key?: string; value?: string; language?: string };
type DspaceItem = {
  uuid?: string;
  name?: string;
  handle?: string;
  metadata?: DspaceMetadataEntry[];
};

function cleanQuery(value: string) {
  return value.trim().replace(/[\u0000-\u001f]/g, ' ').slice(0, 240);
}

function metadataValues(item: DspaceItem, ...keys: string[]) {
  const wanted = new Set(keys);
  return (item.metadata ?? [])
    .filter((entry) => entry.key && wanted.has(entry.key) && entry.value)
    .map((entry) => entry.value!.trim())
    .filter(Boolean);
}

function first(item: DspaceItem, ...keys: string[]) {
  return metadataValues(item, ...keys)[0];
}

function normalizeDoi(value?: string) {
  if (!value) return undefined;
  const match = value.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  return match?.[0]?.replace(/[).,;]+$/, '');
}

function normalizeDspaceItem(source: BookSource, item: DspaceItem): OpenBookRecord {
  const doi = normalizeDoi(first(item, 'dc.identifier.doi', 'dc.identifier.uri'));
  const handle = item.handle ?? first(item, 'dc.identifier.uri')?.match(/20\.500\.\d+\/\d+/)?.[0];
  return {
    source,
    title: first(item, 'dc.title') ?? item.name ?? 'سجل بلا عنوان',
    authors: metadataValues(item, 'dc.contributor.author', 'dc.creator'),
    publisher: first(item, 'dc.publisher'),
    language: first(item, 'dc.language', 'dc.language.iso'),
    date: first(item, 'dc.date.issued', 'dc.date.available'),
    doi,
    isbn: metadataValues(item, 'dc.identifier.isbn'),
    license: first(item, 'dc.rights', 'dc.rights.uri', 'dc.rights.license'),
    subjects: metadataValues(item, 'dc.subject', 'dc.subject.other'),
    handle,
    recordUrl: handle
      ? source === 'oapen'
        ? `https://library.oapen.org/handle/${handle}`
        : `https://directory.doabooks.org/handle/${handle}`
      : undefined,
  };
}

async function fetchJson(url: URL, revalidate = 3600) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    next: { revalidate },
  });
  if (!response.ok) throw new Error(`External metadata request failed (${response.status})`);
  return response.json() as Promise<unknown>;
}

export async function searchOpenBooks(query: string, source: BookSource, limit = 12): Promise<OpenBookRecord[]> {
  const safe = cleanQuery(query);
  if (safe.length < 2) return [];
  const endpoint = source === 'oapen' ? OAPEN_SEARCH : DOAB_SEARCH;
  const url = new URL(endpoint);
  url.searchParams.set('query', safe);
  url.searchParams.set('expand', 'metadata');
  url.searchParams.set('limit', String(Math.max(1, Math.min(limit, 25))));
  const raw = await fetchJson(url);
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, limit).map((item) => normalizeDspaceItem(source, item as DspaceItem));
}

export async function searchBothBookIndexes(query: string, limitEach = 8) {
  const settled = await Promise.allSettled([
    searchOpenBooks(query, 'oapen', limitEach),
    searchOpenBooks(query, 'doab', limitEach),
  ]);
  return {
    oapen: settled[0].status === 'fulfilled' ? settled[0].value : [],
    doab: settled[1].status === 'fulfilled' ? settled[1].value : [],
    errors: settled.flatMap((result, index) => result.status === 'rejected' ? [index === 0 ? 'oapen' : 'doab'] : []),
  };
}

export async function getDoabPeerReview(params: { doi?: string; isbn?: string; publisher?: string }) {
  const entries = Object.entries(params).filter(([, value]) => Boolean(value));
  if (entries.length !== 1) return null;
  const [key, value] = entries[0];
  const url = new URL(DOAB_PEER_REVIEW);
  url.searchParams.set(key === 'publisher' ? 'title' : key, String(value));
  try {
    return await fetchJson(url, 86400);
  } catch {
    return null;
  }
}

function dateParts(value: unknown) {
  if (!value || typeof value !== 'object') return undefined;
  const parts = (value as { 'date-parts'?: unknown[] })['date-parts'];
  const firstParts = Array.isArray(parts) ? parts[0] : null;
  if (!Array.isArray(firstParts)) return undefined;
  return firstParts.filter((part) => typeof part === 'number').join('-');
}

export async function resolveCrossrefDoi(doiInput: string): Promise<CrossrefRecord | null> {
  const doi = normalizeDoi(doiInput);
  if (!doi) return null;
  const url = new URL(`${CROSSREF_WORKS}/${encodeURIComponent(doi)}`);
  url.searchParams.set('mailto', CROSSREF_MAILTO);
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    next: { revalidate: 86400 },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Crossref request failed (${response.status})`);
  const raw = await response.json() as { message?: Record<string, unknown> };
  const message = raw.message ?? {};
  const authors = Array.isArray(message.author) ? message.author : [];
  const licenses = Array.isArray(message.license) ? message.license : [];
  const funders = Array.isArray(message.funder) ? message.funder : [];
  const updates = Array.isArray(message['update-to']) ? message['update-to'] : [];
  return {
    doi,
    title: Array.isArray(message.title) ? String(message.title[0] ?? '') : undefined,
    type: typeof message.type === 'string' ? message.type : undefined,
    publisher: typeof message.publisher === 'string' ? message.publisher : undefined,
    published: dateParts(message.published ?? message['published-print'] ?? message['published-online']),
    authors: authors.map((author) => {
      const a = author as Record<string, unknown>;
      return [a.given, a.family].filter(Boolean).join(' ');
    }).filter(Boolean),
    containerTitle: Array.isArray(message['container-title']) ? String(message['container-title'][0] ?? '') : undefined,
    issn: Array.isArray(message.ISSN) ? message.ISSN.map(String) : [],
    isbn: Array.isArray(message.ISBN) ? message.ISBN.map(String) : [],
    licenses: licenses.map((entry) => String((entry as Record<string, unknown>).URL ?? '')).filter(Boolean),
    funders: funders.map((entry) => String((entry as Record<string, unknown>).name ?? '')).filter(Boolean),
    orcids: authors.map((author) => String((author as Record<string, unknown>).ORCID ?? '')).filter(Boolean),
    rors: funders.flatMap((funder) => {
      const ids = (funder as Record<string, unknown>).id;
      return Array.isArray(ids) ? ids.map(String).filter((id) => id.includes('ror.org')) : [];
    }),
    referencesCount: typeof message['references-count'] === 'number' ? message['references-count'] : undefined,
    isReferencedByCount: typeof message['is-referenced-by-count'] === 'number' ? message['is-referenced-by-count'] : undefined,
    updateTo: updates.map((entry) => {
      const u = entry as Record<string, unknown>;
      return {
        doi: typeof u.DOI === 'string' ? u.DOI : undefined,
        type: typeof u.type === 'string' ? u.type : undefined,
        label: typeof u.label === 'string' ? u.label : undefined,
      };
    }),
    resourceUrl: `https://doi.org/${doi}`,
  };
}
