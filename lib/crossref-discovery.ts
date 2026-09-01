const CROSSREF_WORKS = 'https://api.crossref.org/works';
const CROSSREF_MAILTO = 'Contact@healthrenewal.org';
const USER_AGENT = 'HealthRenewal/1.0 (https://healthrenewal.org/; mailto:Contact@healthrenewal.org)';

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

function normalizeDoi(value?: string) {
  if (!value) return undefined;
  const match = value.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
  return match?.[0]?.replace(/[).,;]+$/, '');
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
