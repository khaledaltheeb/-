import { requestArrayBuffer, requestJson, requestText } from '@/lib/research-integrations/http';
import { normalizeRorId } from '@/lib/research-integrations/ror';
import type { EvidenceAffiliation, EvidenceAuthor, EvidenceRecord, EvidenceSearchPage } from '@/lib/research-integrations/types';

const EUROPE_PMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
const EUROPE_PMC_WEB = 'https://europepmc.org/article';
const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-[\dX]{4}$/i;

export type EuropePmcSearchOptions = {
  query: string;
  page_size?: number;
  cursor_mark?: string | null;
  result_type?: 'lite' | 'core';
  synonym?: boolean;
  email?: string | null;
};

type JsonRecord = Record<string, unknown>;
function record(value: unknown): JsonRecord | null { return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null; }
function text(value: unknown) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function integer(value: unknown) { const parsed = typeof value === 'number' ? value : Number(value); return Number.isFinite(parsed) ? Math.trunc(parsed) : null; }
function bool(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  if (['y', 'yes', 'true', '1'].includes(normalized)) return true;
  if (['n', 'no', 'false', '0'].includes(normalized)) return false;
  return null;
}
function asArray(value: unknown) { return Array.isArray(value) ? value : []; }

function typedIdentifier(value: unknown, expectedType?: string) {
  if (typeof value === 'string') return value.trim() || null;
  const row = record(value);
  if (!row) return null;
  const type = text(row.type)?.toUpperCase() || null;
  if (expectedType && type && type !== expectedType.toUpperCase()) return null;
  return text(row.value) || text(row.id) || text(row.identifier);
}

function normalizeOrcid(value: unknown) {
  const candidate = typedIdentifier(value, 'ORCID')?.replace(/^https?:\/\/(?:www\.)?orcid\.org\//i, '') || null;
  return candidate && ORCID_PATTERN.test(candidate) ? candidate.toUpperCase() : null;
}

function rorFromOrgIdentifier(value: unknown): string | null {
  const candidates: unknown[] = Array.isArray(value) ? value : [value];
  for (const candidate of candidates) {
    const raw = typedIdentifier(candidate);
    if (!raw) continue;
    try { return normalizeRorId(raw); } catch { /* Other persistent IDs are valid Europe PMC data but not ROR. */ }
  }
  return null;
}

function affiliationsFromAuthor(author: JsonRecord): EvidenceAffiliation[] {
  const details = record(author.authorAffiliationDetailsList);
  const rows = asArray(details?.authorAffiliation);
  const affiliations = rows.flatMap((item) => {
    const affiliation = record(item);
    if (!affiliation) return [];
    const name = text(affiliation.affiliation);
    const rorId = rorFromOrgIdentifier(affiliation.affiliationOrgId);
    if (!name && !rorId) return [];
    return [{ name: name || rorId as string, original: name, ror_id: rorId, country_code: null }];
  });
  if (affiliations.length) return affiliations;

  const legacyName = text(author.affiliation);
  const legacyRor = rorFromOrgIdentifier(author.affiliationOrgId);
  if (!legacyName && !legacyRor) return [];
  return [{ name: legacyName || legacyRor as string, original: legacyName, ror_id: legacyRor, country_code: null }];
}

function authorsFromResult(row: JsonRecord): EvidenceAuthor[] {
  const authorList = record(row.authorList);
  const authors = asArray(authorList?.author).flatMap((item) => {
    const author = record(item);
    if (!author) return [];
    const display = text(author.fullName) || [text(author.firstName), text(author.lastName)].filter(Boolean).join(' ');
    if (!display) return [];
    return [{ display_name: display, orcid: normalizeOrcid(author.authorId), affiliations: affiliationsFromAuthor(author) }];
  });
  if (authors.length) return authors;
  const authorString = text(row.authorString);
  if (!authorString) return [];
  return authorString.split(/,\s+(?=[A-Z])/u).map((display_name) => ({ display_name: display_name.trim() })).filter((item) => item.display_name);
}

function firstPubType(row: JsonRecord) {
  const list = record(row.pubTypeList);
  return asArray(list?.pubType).map(text).find(Boolean) || text(row.pubType) || null;
}

function normalizeEuropePmcResult(value: unknown, retrievedAt: string, query: string, version: string | null): EvidenceRecord | null {
  const row = record(value);
  if (!row) return null;
  const source = text(row.source);
  const id = text(row.id) || text(row.pmid) || text(row.pmcid);
  if (!id) return null;
  const journalInfo = record(row.journalInfo);
  const journal = record(journalInfo?.journal);
  const providerId = source ? `${source}:${id}` : id;
  return {
    provider: 'europe_pmc',
    provider_id: providerId,
    title: text(row.title),
    abstract: text(row.abstractText),
    publication_type: firstPubType(row),
    publication_year: integer(row.pubYear),
    publication_date: text(row.firstPublicationDate) || text(row.electronicPublicationDate),
    journal: text(row.journalTitle) || text(journal?.title),
    publisher: text(journal?.publisher),
    authors: authorsFromResult(row),
    identifiers: { doi: text(row.doi) || undefined, pmid: text(row.pmid) || undefined, pmcid: text(row.pmcid) || undefined },
    cited_by_count: integer(row.citedByCount),
    is_open_access: bool(row.isOpenAccess),
    is_retracted: bool(row.isRetracted),
    url: source ? `${EUROPE_PMC_WEB}/${encodeURIComponent(source)}/${encodeURIComponent(id)}` : null,
    provenance: { retrieved_at: retrievedAt, endpoint: `${EUROPE_PMC_BASE}/search`, provider_version: version, query },
  };
}

export async function searchEuropePmc(options: EuropePmcSearchOptions): Promise<EvidenceSearchPage> {
  const query = options.query.trim();
  if (query.length < 2 || query.length > 1_000) throw new TypeError('Europe PMC query must contain 2-1000 characters.');
  const pageSize = Math.max(1, Math.min(1_000, options.page_size ?? 25));
  const params = new URLSearchParams({ query, format: 'json', pageSize: String(pageSize), resultType: options.result_type ?? 'core', synonym: options.synonym ? 'true' : 'false' });
  if (options.cursor_mark) params.set('cursorMark', options.cursor_mark);
  if (options.email?.trim()) params.set('email', options.email.trim());
  const endpoint = `${EUROPE_PMC_BASE}/search?${params.toString()}`;
  const response = await requestJson<JsonRecord>({ provider: 'Europe PMC', url: endpoint });
  const version = text(response.version);
  const resultList = record(response.resultList);
  const retrievedAt = new Date().toISOString();
  return {
    records: asArray(resultList?.result).map((item) => normalizeEuropePmcResult(item, retrievedAt, query, version)).filter((item): item is EvidenceRecord => Boolean(item)),
    total: integer(response.hitCount),
    next_cursor: text(response.nextCursorMark),
    provider_version: version,
  };
}

export async function getEuropePmcReferences(source: string, id: string, options: { page_size?: number; cursor_mark?: string | null; email?: string | null } = {}) {
  return relationRequest('references', source, id, options);
}

export async function getEuropePmcCitations(source: string, id: string, options: { page_size?: number; cursor_mark?: string | null; email?: string | null } = {}) {
  return relationRequest('citations', source, id, options);
}

async function relationRequest(kind: 'references' | 'citations', source: string, id: string, options: { page_size?: number; cursor_mark?: string | null; email?: string | null }) {
  if (!/^[A-Z0-9_-]{2,20}$/i.test(source) || !/^[A-Z0-9_.:-]{1,120}$/i.test(id)) throw new TypeError('Invalid Europe PMC source or identifier.');
  const params = new URLSearchParams({ format: 'json', pageSize: String(Math.max(1, Math.min(1_000, options.page_size ?? 100))) });
  if (options.cursor_mark) params.set('cursorMark', options.cursor_mark);
  if (options.email?.trim()) params.set('email', options.email.trim());
  return requestJson<JsonRecord>({ provider: 'Europe PMC', url: `${EUROPE_PMC_BASE}/${encodeURIComponent(source)}/${encodeURIComponent(id)}/${kind}?${params.toString()}` });
}

export async function getEuropePmcFullTextXml(pmcid: string, email?: string | null) {
  const normalized = pmcid.trim().toUpperCase();
  if (!/^PMC\d+$/.test(normalized)) throw new TypeError('A valid PMCID is required.');
  const params = new URLSearchParams();
  if (email?.trim()) params.set('email', email.trim());
  const query = params.size ? `?${params.toString()}` : '';
  return requestText({ provider: 'Europe PMC', url: `${EUROPE_PMC_BASE}/${encodeURIComponent(normalized)}/fullTextXML${query}` });
}

export async function getEuropePmcSupplementaryFiles(pmcid: string, email?: string | null) {
  const normalized = pmcid.trim().toUpperCase();
  if (!/^PMC\d+$/.test(normalized)) throw new TypeError('A valid PMCID is required.');
  const params = new URLSearchParams();
  if (email?.trim()) params.set('email', email.trim());
  const query = params.size ? `?${params.toString()}` : '';
  return requestArrayBuffer({ provider: 'Europe PMC', url: `${EUROPE_PMC_BASE}/${encodeURIComponent(normalized)}/supplementaryFiles${query}`, timeout_ms: 30_000 });
}
