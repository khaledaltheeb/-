import { requestJson } from '@/lib/research-integrations/http';
import type { EvidenceAffiliation, EvidenceAuthor, EvidenceRecord, EvidenceRelation, EvidenceSearchPage } from '@/lib/research-integrations/types';

const DATACITE_API_BASE = 'https://api.datacite.org/dois';
const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/i;
const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i;
const ROR_PATTERN = /^0[a-hj-km-np-tv-z0-9]{6}[0-9]{2}$/i;

type JsonRecord = Record<string, unknown>;

type DataCiteResponse = {
  data?: unknown[];
  meta?: { total?: number };
  links?: { next?: string | null };
};

function record(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}
function array(value: unknown) { return Array.isArray(value) ? value : []; }
function text(value: unknown) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function integer(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}
function stripMarkup(value: string | null) {
  return value ? value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || null : null;
}

export function normalizeDataCiteDoi(value: string) {
  const doi = value.trim().replace(/^doi:\s*/i, '').replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '').replace(/[\s]+/g, '');
  if (!DOI_PATTERN.test(doi)) throw new TypeError('Invalid DOI.');
  return doi.toLowerCase();
}

function normalizeOrcid(value: unknown) {
  const raw = text(value)?.replace(/^https?:\/\/(?:www\.)?orcid\.org\//i, '') || null;
  return raw && ORCID_PATTERN.test(raw) ? `https://orcid.org/${raw.toUpperCase()}` : null;
}

function normalizeRor(value: unknown) {
  const raw = text(value)?.replace(/^https?:\/\/(?:www\.)?ror\.org\//i, '').replace(/\/$/, '') || null;
  return raw && ROR_PATTERN.test(raw) ? `https://ror.org/${raw.toLowerCase()}` : null;
}

function nameIdentifier(person: JsonRecord) {
  for (const value of array(person.nameIdentifiers)) {
    const item = record(value);
    if (!item) continue;
    const scheme = text(item.nameIdentifierScheme)?.toLowerCase();
    const uri = text(item.schemeUri)?.toLowerCase();
    if (scheme === 'orcid' || uri?.includes('orcid.org')) {
      const normalized = normalizeOrcid(item.nameIdentifier);
      if (normalized) return normalized;
    }
  }
  return null;
}

function affiliations(value: unknown): EvidenceAffiliation[] {
  return array(value).flatMap((entry) => {
    if (typeof entry === 'string') return entry.trim() ? [{ name: entry.trim(), original: entry.trim(), ror_id: null, country_code: null }] : [];
    const item = record(entry);
    if (!item) return [];
    const name = text(item.name) || text(item.affiliation);
    if (!name) return [];
    const scheme = text(item.affiliationIdentifierScheme)?.toLowerCase();
    const schemeUri = text(item.schemeUri)?.toLowerCase();
    const ror = scheme === 'ror' || schemeUri?.includes('ror.org') ? normalizeRor(item.affiliationIdentifier) : null;
    return [{ name, original: name, ror_id: ror, country_code: null }];
  });
}

function authors(attributes: JsonRecord): EvidenceAuthor[] {
  const people = [...array(attributes.creators), ...array(attributes.contributors)];
  const seen = new Set<string>();
  const result: EvidenceAuthor[] = [];
  for (const value of people) {
    const person = record(value);
    if (!person) continue;
    const display = text(person.name) || [text(person.givenName), text(person.familyName)].filter(Boolean).join(' ');
    if (!display) continue;
    const orcid = nameIdentifier(person);
    const key = `${display.toLocaleLowerCase('en')}|${orcid || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ display_name: display, orcid, affiliations: affiliations(person.affiliation) });
  }
  return result;
}

function relatedIdentifiers(attributes: JsonRecord): EvidenceRelation[] {
  return array(attributes.relatedIdentifiers).flatMap((value) => {
    const item = record(value);
    if (!item) return [];
    const identifier = text(item.relatedIdentifier);
    const relationType = text(item.relationType);
    if (!identifier || !relationType) return [];
    return [{
      relation_type: relationType,
      identifier,
      identifier_type: text(item.relatedIdentifierType),
      source: 'datacite.relatedIdentifiers',
    }];
  });
}

function publicationDate(attributes: JsonRecord) {
  const preferred = ['Issued', 'Available', 'Created', 'Submitted', 'Accepted'];
  const dates = array(attributes.dates).map(record).filter((value): value is JsonRecord => Boolean(value));
  for (const kind of preferred) {
    const found = dates.find((item) => text(item.dateType) === kind);
    const date = text(found?.date);
    if (date) return date;
  }
  return text(attributes.published);
}

function publisher(attributes: JsonRecord) {
  const value = attributes.publisher;
  if (typeof value === 'string') return text(value);
  return text(record(value)?.name);
}

function isOpenAccess(attributes: JsonRecord) {
  const rights = array(attributes.rightsList).map(record).filter((value): value is JsonRecord => Boolean(value));
  if (!rights.length) return null;
  const open = rights.some((item) => {
    const id = `${text(item.rightsIdentifier) || ''} ${text(item.rightsUri) || ''} ${text(item.rights) || ''}`.toLowerCase();
    return /creativecommons|creativecommons\.org|\bcc0\b|\bcc-by\b|public domain|open access/.test(id);
  });
  return open ? true : null;
}

function nextCursor(link: string | null | undefined) {
  if (!link) return null;
  try { return new URL(link).searchParams.get('page[cursor]'); } catch { return null; }
}

export function normalizeDataCiteRecord(value: unknown, query: string | null): EvidenceRecord | null {
  const row = record(value);
  const attributes = record(row?.attributes);
  if (!row || !attributes) return null;
  const rawDoi = text(attributes.doi) || text(row.id);
  if (!rawDoi) return null;
  let doi: string;
  try { doi = normalizeDataCiteDoi(rawDoi); } catch { return null; }
  const titles = array(attributes.titles).map(record).filter((item): item is JsonRecord => Boolean(item));
  const descriptions = array(attributes.descriptions).map(record).filter((item): item is JsonRecord => Boolean(item));
  const abstract = descriptions.find((item) => text(item.descriptionType) === 'Abstract') || descriptions[0] || null;
  const types = record(attributes.types);
  const container = record(attributes.container);
  const schemaVersion = text(attributes.schemaVersion);
  const endpoint = `${DATACITE_API_BASE}/${encodeURIComponent(doi)}?affiliation=true&publisher=true&detail=true`;
  return {
    provider: 'datacite',
    provider_id: doi,
    title: text(titles[0]?.title),
    abstract: stripMarkup(text(abstract?.description)),
    publication_type: text(types?.resourceTypeGeneral) || text(types?.resourceType),
    publication_year: integer(attributes.publicationYear),
    publication_date: publicationDate(attributes),
    journal: text(container?.title),
    publisher: publisher(attributes),
    authors: authors(attributes),
    identifiers: { doi },
    relations: relatedIdentifiers(attributes),
    cited_by_count: integer(attributes.citationCount),
    is_open_access: isOpenAccess(attributes),
    is_retracted: null,
    url: text(attributes.url) || `https://doi.org/${doi}`,
    provenance: {
      retrieved_at: new Date().toISOString(),
      endpoint,
      provider_version: schemaVersion ? `REST API v2 / Metadata Schema ${schemaVersion}` : 'REST API v2',
      query,
    },
  };
}

export async function searchDataCite(options: {
  query: string;
  page_size?: number;
  cursor?: string | null;
  contact_email?: string | null;
}): Promise<EvidenceSearchPage> {
  const query = options.query.trim();
  if (query.length < 2 || query.length > 500) throw new TypeError('DataCite query must contain 2-500 characters.');
  const pageSize = Math.max(1, Math.min(100, options.page_size ?? 20));
  const params = new URLSearchParams({
    query,
    'page[size]': String(pageSize),
    'page[cursor]': options.cursor?.trim() || '1',
    affiliation: 'true',
    publisher: 'true',
    detail: 'true',
  });
  const email = options.contact_email?.trim() || 'contact@healthrenewal.org';
  const endpoint = `${DATACITE_API_BASE}?${params.toString()}`;
  const response = await requestJson<DataCiteResponse>({
    provider: 'DataCite',
    url: endpoint,
    init: {
      headers: {
        Accept: 'application/vnd.api+json',
        'User-Agent': `Rawafid/1.2 (https://healthrenewal.org; mailto:${email})`,
      },
    },
  });
  const records = array(response.data).flatMap((item) => {
    const normalized = normalizeDataCiteRecord(item, query);
    if (!normalized) return [];
    normalized.provenance.endpoint = endpoint;
    return [normalized];
  });
  return {
    records,
    total: Number.isFinite(Number(response.meta?.total)) ? Number(response.meta?.total) : null,
    next_cursor: nextCursor(response.links?.next),
    provider_version: 'REST API v2',
  };
}

export async function getDataCiteDoi(doiValue: string, contactEmail?: string | null): Promise<EvidenceRecord | null> {
  const doi = normalizeDataCiteDoi(doiValue);
  const params = new URLSearchParams({ affiliation: 'true', publisher: 'true', detail: 'true' });
  const endpoint = `${DATACITE_API_BASE}/${encodeURIComponent(doi)}?${params.toString()}`;
  const email = contactEmail?.trim() || 'contact@healthrenewal.org';
  const response = await requestJson<{ data?: unknown }>({
    provider: 'DataCite',
    url: endpoint,
    init: { headers: { Accept: 'application/vnd.api+json', 'User-Agent': `Rawafid/1.2 (https://healthrenewal.org; mailto:${email})` } },
  });
  const normalized = normalizeDataCiteRecord(response.data, doi);
  if (normalized) normalized.provenance.endpoint = endpoint;
  return normalized;
}
