import { requestJson } from '@/lib/research-integrations/http';
import type { EvidenceAuthor, EvidenceRecord, EvidenceRelation, EvidenceSearchPage } from '@/lib/research-integrations/types';

const CROSSREF_BASE = 'https://api.crossref.org/works';
const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-[\dX]{4}$/i;

type JsonRecord = Record<string, unknown>;

type CrossrefSearchOptions = {
  query: string;
  rows?: number;
  cursor?: string | null;
  mailto?: string | null;
  from_update_date?: string | null;
  from_index_date?: string | null;
};

function record(value: unknown): JsonRecord | null { return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null; }
function text(value: unknown) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function numberValue(value: unknown) { const parsed = typeof value === 'number' ? value : Number(value); return Number.isFinite(parsed) ? parsed : null; }
function asArray(value: unknown) { return Array.isArray(value) ? value : []; }
function firstText(value: unknown) { return asArray(value).map(text).find(Boolean) || text(value); }

function stripMarkup(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  return raw.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/\s+/g, ' ').trim() || null;
}

function normalizeOrcid(value: unknown) {
  const candidate = text(value)?.replace(/^https?:\/\/(?:www\.)?orcid\.org\//i, '') || null;
  return candidate && ORCID_PATTERN.test(candidate) ? candidate.toUpperCase() : null;
}

function authors(value: unknown): EvidenceAuthor[] {
  return asArray(value).flatMap((item) => {
    const author = record(item); if (!author) return [];
    const displayName = text(author.name) || [text(author.given), text(author.family)].filter(Boolean).join(' '); if (!displayName) return [];
    const affiliations = asArray(author.affiliation).flatMap((affiliation) => { const row = record(affiliation); const name = text(row?.name); return name ? [{ name, original: name, ror_id: null, country_code: null }] : []; });
    return [{ display_name: displayName, orcid: normalizeOrcid(author.ORCID), affiliations }];
  });
}

function dateParts(value: unknown) {
  const outer = record(value); const parts = asArray(outer?.['date-parts'])[0];
  if (!Array.isArray(parts) || !parts.length) return { date: null as string | null, year: null as number | null };
  const year = Number(parts[0]); if (!Number.isInteger(year) || year < 1000 || year > 3000) return { date: null, year: null };
  const month = Number.isInteger(Number(parts[1])) ? Math.max(1, Math.min(12, Number(parts[1]))) : 1;
  const day = Number.isInteger(Number(parts[2])) ? Math.max(1, Math.min(31, Number(parts[2]))) : 1;
  return { date: `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`, year };
}

function publicationDate(row: JsonRecord) {
  for (const key of ['published-online', 'published-print', 'published', 'issued', 'created']) { const parsed = dateParts(row[key]); if (parsed.year) return parsed; }
  return { date: null as string | null, year: null as number | null };
}

function relations(row: JsonRecord): EvidenceRelation[] {
  const output: EvidenceRelation[] = [];
  const relation = record(row.relation);
  if (relation) {
    for (const [relationType, values] of Object.entries(relation)) {
      for (const value of asArray(values)) {
        const item = record(value); const identifier = text(item?.id); if (!identifier) continue;
        output.push({ relation_type: relationType, identifier, identifier_type: text(item?.['id-type']), source: text(item?.['asserted-by']) || 'crossref' });
      }
    }
  }
  for (const value of asArray(row['update-to'])) {
    const item = record(value); const identifier = text(item?.DOI) || text(item?.doi); if (!identifier) continue;
    output.push({ relation_type: text(item?.type) || 'update-to', identifier, identifier_type: 'doi', source: text(item?.source) || 'crossref' });
  }
  return output;
}

function explicitRetractionState(row: JsonRecord, normalizedRelations: EvidenceRelation[]): boolean | null {
  if (normalizedRelations.some((relation) => relation.relation_type.toLowerCase().includes('retract'))) return true;
  if (asArray(row['update-to']).some((value) => text(record(value)?.type)?.toLowerCase() === 'retraction')) return true;
  return null;
}

function normalizeCrossrefResult(value: unknown, retrievedAt: string, query: string, version: string | null): EvidenceRecord | null {
  const row = record(value); if (!row) return null;
  const doi = text(row.DOI)?.toLowerCase() || null; const url = text(row.URL) || (doi ? `https://doi.org/${doi}` : null); if (!doi && !url) return null;
  const publication = publicationDate(row); const normalizedRelations = relations(row);
  return {
    provider: 'crossref', provider_id: doi || (url as string), title: firstText(row.title), abstract: stripMarkup(row.abstract), publication_type: text(row.type), publication_year: publication.year, publication_date: publication.date,
    journal: firstText(row['container-title']), publisher: text(row.publisher), authors: authors(row.author), identifiers: { doi: doi || undefined }, relations: normalizedRelations,
    cited_by_count: numberValue(row['is-referenced-by-count']), is_open_access: null, is_retracted: explicitRetractionState(row, normalizedRelations), url,
    provenance: { retrieved_at: retrievedAt, endpoint: CROSSREF_BASE, provider_version: version, query },
  };
}

function normalizeFilterDate(value: string | null | undefined) {
  if (!value) return null; const parsed = Date.parse(value); if (Number.isNaN(parsed)) throw new TypeError('Crossref filter dates must be valid ISO dates.'); return new Date(parsed).toISOString();
}

export async function searchCrossref(options: CrossrefSearchOptions): Promise<EvidenceSearchPage> {
  const query = options.query.trim(); if (query.length < 2 || query.length > 1_000) throw new TypeError('Crossref query must contain 2-1000 characters.');
  const rows = Math.max(1, Math.min(100, options.rows ?? 25)); const mailto = options.mailto?.trim() || 'contact@healthrenewal.org';
  const params = new URLSearchParams({ 'query.bibliographic': query, rows: String(rows), cursor: options.cursor?.trim() || '*', mailto });
  const filters: string[] = []; const fromUpdate = normalizeFilterDate(options.from_update_date); const fromIndex = normalizeFilterDate(options.from_index_date);
  if (fromUpdate) filters.push(`from-update-date:${fromUpdate}`); if (fromIndex) filters.push(`from-index-date:${fromIndex}`); if (filters.length) params.set('filter', filters.join(','));
  const endpoint = `${CROSSREF_BASE}?${params.toString()}`;
  const response = await requestJson<JsonRecord>({ provider: 'Crossref', url: endpoint, init: { headers: { Accept: 'application/json', 'User-Agent': `Rawafid/1.2 (+https://healthrenewal.org; mailto:${mailto})` } } });
  const message = record(response.message); const retrievedAt = new Date().toISOString(); const version = text(response['message-version']);
  return { records: asArray(message?.items).map((item) => normalizeCrossrefResult(item, retrievedAt, query, version)).filter((item): item is EvidenceRecord => Boolean(item)), total: numberValue(message?.['total-results']), next_cursor: text(message?.['next-cursor']), provider_version: version };
}
