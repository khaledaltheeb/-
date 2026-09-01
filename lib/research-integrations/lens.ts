import { requestJson } from '@/lib/research-integrations/http';
import type { EvidenceAffiliation, EvidenceAuthor, EvidenceRecord, EvidenceSearchPage } from '@/lib/research-integrations/types';
import { normalizeRorId } from '@/lib/research-integrations/ror';

const LENS_SCHOLARLY_ENDPOINT = 'https://api.lens.org/scholarly/search';

type JsonRecord = Record<string, unknown>;
function record(value: unknown): JsonRecord | null { return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null; }
function text(value: unknown) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function asArray(value: unknown) { return Array.isArray(value) ? value : []; }
function integer(value: unknown) { const parsed = Number(value); return Number.isFinite(parsed) ? Math.trunc(parsed) : null; }

function ids(value: unknown) {
  const result: Record<string, string> = {};
  for (const item of asArray(value)) {
    const row = record(item);
    const type = text(row?.type)?.toLowerCase();
    const id = text(row?.value);
    if (type && id && !result[type]) result[type] = id;
  }
  return result;
}

function affiliations(value: unknown): EvidenceAffiliation[] {
  return asArray(value).flatMap((item) => {
    const row = record(item);
    const name = text(row?.name) || text(row?.name_original);
    if (!row || !name) return [];
    const identifiers = ids(row.ids);
    let rorId: string | null = null;
    if (identifiers.ror) {
      try { rorId = normalizeRorId(identifiers.ror); } catch { rorId = null; }
    }
    return [{ name, original: text(row.name_original), ror_id: rorId, country_code: text(row.country_code) }];
  });
}

function authors(value: unknown): EvidenceAuthor[] {
  return asArray(value).flatMap((item) => {
    const row = record(item);
    if (!row) return [];
    const display = text(row.display_name) || [text(row.first_name), text(row.last_name)].filter(Boolean).join(' ');
    if (!display) return [];
    const identifiers = ids(row.ids);
    return [{ display_name: display, orcid: identifiers.orcid || null, affiliations: affiliations(row.affiliations) }];
  });
}

function normalizeLensResult(value: unknown, retrievedAt: string, queryDescription: string | null): EvidenceRecord | null {
  const row = record(value);
  const lensId = text(row?.lens_id);
  if (!row || !lensId) return null;
  const external = ids(row.external_ids);
  const source = record(row.source);
  const openAccess = record(row.open_access);
  const retractions = asArray(row.retraction_updates);
  return {
    provider: 'lens',
    provider_id: lensId,
    title: text(row.title),
    abstract: text(row.abstract),
    publication_type: text(row.publication_type),
    publication_year: integer(row.year_published),
    publication_date: text(row.date_published),
    journal: text(source?.title),
    publisher: text(source?.publisher),
    authors: authors(row.authors),
    identifiers: { doi: external.doi, pmid: external.pmid, pmcid: external.pmcid, openalex: external.openalex, lens: lensId },
    cited_by_count: integer(row.scholarly_citations_count),
    is_open_access: typeof row.is_open_access === 'boolean' ? row.is_open_access : openAccess ? true : null,
    is_retracted: retractions.length ? true : false,
    url: `https://www.lens.org/lens/scholar/article/${encodeURIComponent(lensId)}`,
    provenance: { retrieved_at: retrievedAt, endpoint: LENS_SCHOLARLY_ENDPOINT, query: queryDescription },
  };
}

export type LensSearchOptions = {
  token: string;
  query: unknown;
  size?: number;
  from?: number;
  sort?: unknown[];
  include?: string[];
  query_description?: string | null;
};

export async function searchLensScholarly(options: LensSearchOptions): Promise<EvidenceSearchPage> {
  const token = options.token.trim();
  if (!token) throw new TypeError('Lens Scholarly API token is required.');
  const size = Math.max(1, Math.min(100, options.size ?? 25));
  const from = Math.max(0, Math.min(10_000, options.from ?? 0));
  const include = options.include ?? [
    'lens_id', 'title', 'abstract', 'publication_type', 'year_published', 'date_published',
    'external_ids', 'authors', 'source', 'open_access', 'is_open_access',
    'scholarly_citations_count', 'retraction_updates',
  ];
  const payload: JsonRecord = { query: options.query, size, from, include };
  if (options.sort?.length) payload.sort = options.sort;
  const response = await requestJson<JsonRecord>({
    provider: 'Lens Scholarly API',
    url: LENS_SCHOLARLY_ENDPOINT,
    init: {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    },
  });
  const retrievedAt = new Date().toISOString();
  return {
    records: asArray(response.data).map((item) => normalizeLensResult(item, retrievedAt, options.query_description ?? null)).filter((item): item is EvidenceRecord => Boolean(item)),
    total: integer(response.total),
    next_cursor: null,
    provider_version: null,
  };
}
