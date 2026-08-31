export type OpenBookSource = 'oapen' | 'doab';

export type OpenBookRecord = {
  id: string;
  source: OpenBookSource;
  title: string;
  authors: string[];
  publisher: string;
  issued: string;
  language: string;
  subjects: string[];
  doi: string;
  isbn: string[];
  license: string;
  handle: string;
  recordUrl: string;
  abstract: string;
  peerReviewLookupUrl?: string;
};

type DSpaceMetadata = { key?: string; value?: string };
type DSpaceItem = {
  uuid?: string;
  name?: string;
  handle?: string;
  metadata?: DSpaceMetadata[];
};

const SOURCES: Record<OpenBookSource, { label: string; rest: string; recordBase: string }> = {
  oapen: {
    label: 'OAPEN Library',
    rest: 'https://library.oapen.org/rest/search',
    recordBase: 'https://library.oapen.org/handle/',
  },
  doab: {
    label: 'DOAB',
    rest: 'https://directory.doabooks.org/rest/search',
    recordBase: 'https://directory.doabooks.org/handle/',
  },
};

function clean(value: unknown, max = 500) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function values(metadata: DSpaceMetadata[] | undefined, keys: string[]) {
  if (!Array.isArray(metadata)) return [];
  const wanted = new Set(keys);
  return metadata
    .filter((entry) => entry?.key && wanted.has(entry.key))
    .map((entry) => clean(entry.value, 2000))
    .filter(Boolean);
}

function first(metadata: DSpaceMetadata[] | undefined, keys: string[]) {
  return values(metadata, keys)[0] ?? '';
}

function doiFrom(metadata: DSpaceMetadata[] | undefined) {
  const candidates = values(metadata, [
    'dc.identifier.doi',
    'oapen.identifier.doi',
    'dc.identifier.uri',
    'dc.identifier',
  ]);
  for (const candidate of candidates) {
    const match = candidate.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
    if (match) return match[0].replace(/[).,;]+$/, '');
  }
  return '';
}

function isbnFrom(metadata: DSpaceMetadata[] | undefined) {
  const candidates = values(metadata, [
    'dc.identifier.isbn',
    'oapen.identifier.isbn',
    'dc.identifier',
  ]);
  const found = new Set<string>();
  for (const candidate of candidates) {
    for (const match of candidate.matchAll(/(?:97[89][- ]?)?\d[\dXx -]{8,16}\d/g)) {
      const normalized = match[0].replace(/[^0-9Xx]/g, '').toUpperCase();
      if (normalized.length === 10 || normalized.length === 13) found.add(normalized);
    }
  }
  return [...found].slice(0, 6);
}

function mapItem(source: OpenBookSource, item: DSpaceItem): OpenBookRecord {
  const metadata = Array.isArray(item.metadata) ? item.metadata : [];
  const handle = clean(item.handle, 160);
  const doi = doiFrom(metadata);
  const isbn = isbnFrom(metadata);
  const title = first(metadata, ['dc.title', 'dc.title.alternative']) || clean(item.name, 300) || 'سجل بلا عنوان';
  const authors = values(metadata, ['dc.contributor.author', 'dc.creator', 'dc.contributor.editor']).slice(0, 12);
  const publisher = first(metadata, ['dc.publisher', 'publisher.name', 'oapen.pages.publisher']);
  const issued = first(metadata, ['dc.date.issued', 'dc.date.available']);
  const language = first(metadata, ['dc.language', 'dc.language.iso']);
  const subjects = values(metadata, ['dc.subject', 'dc.subject.classification', 'dc.subject.other']).slice(0, 12);
  const license = first(metadata, ['dc.rights', 'dc.rights.uri', 'dc.rights.license', 'oapen.license']);
  const abstract = first(metadata, ['dc.description.abstract', 'dc.description']);
  const recordUrl = handle ? `${SOURCES[source].recordBase}${encodeURI(handle)}` : SOURCES[source].recordBase;
  const peerReviewLookupUrl = source === 'doab' && (doi || isbn[0])
    ? `https://directory.doabooks.org/rest/peerReviews?${doi ? `doi=${encodeURIComponent(doi)}` : `isbn=${encodeURIComponent(isbn[0])}`}`
    : undefined;

  return {
    id: clean(item.uuid, 160) || `${source}:${handle || title}`,
    source,
    title,
    authors,
    publisher,
    issued,
    language,
    subjects,
    doi,
    isbn,
    license,
    handle,
    recordUrl,
    abstract: abstract.slice(0, 1200),
    peerReviewLookupUrl,
  };
}

function safeQuery(raw: string) {
  return clean(raw, 180)
    .replace(/[+&|!(){}\[\]^~*?:\\]/g, ' ')
    .replace(/["']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchSource(source: OpenBookSource, query: string, limit: number): Promise<OpenBookRecord[]> {
  const q = safeQuery(query);
  if (!q) return [];
  const url = new URL(SOURCES[source].rest);
  url.searchParams.set('query', q);
  url.searchParams.set('expand', 'metadata');
  url.searchParams.set('limit', String(Math.min(Math.max(limit, 1), 20)));

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'HealthRenewal-OpenBooks/1.0 (+https://healthrenewal.org/)',
    },
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error(`${source}:${response.status}`);
  const payload: unknown = await response.json();
  const items = Array.isArray(payload)
    ? payload
    : (payload && typeof payload === 'object' && 'items' in payload && Array.isArray((payload as { items?: unknown[] }).items)
      ? (payload as { items: DSpaceItem[] }).items
      : []);
  return (items as DSpaceItem[]).slice(0, limit).map((item) => mapItem(source, item));
}

export async function searchOpenBooks(query: string, source: 'all' | OpenBookSource = 'all', perSource = 10) {
  const selected: OpenBookSource[] = source === 'all' ? ['doab', 'oapen'] : [source];
  const settled = await Promise.allSettled(selected.map((name) => searchSource(name, query, perSource)));
  const records: OpenBookRecord[] = [];
  const unavailable: OpenBookSource[] = [];
  settled.forEach((result, index) => {
    if (result.status === 'fulfilled') records.push(...result.value);
    else unavailable.push(selected[index]);
  });

  const deduped = new Map<string, OpenBookRecord>();
  for (const record of records) {
    const key = record.doi
      ? `doi:${record.doi.toLowerCase()}`
      : record.isbn[0]
        ? `isbn:${record.isbn[0]}`
        : `${record.title.toLowerCase()}|${record.publisher.toLowerCase()}`;
    const current = deduped.get(key);
    if (!current || (record.source === 'doab' && current.source !== 'doab')) deduped.set(key, record);
  }

  return { records: [...deduped.values()], unavailable };
}

export const OPEN_BOOKS_SOURCES = SOURCES;
