const CROSSREF_WORKS_API = 'https://api.crossref.org/works';
const CONTACT_EMAIL = 'contact@healthrenewal.org';
const USER_AGENT = 'Rawafid-Crossref/1.0 (+https://healthrenewal.org/developers; mailto:contact@healthrenewal.org)';

type JsonRecord = Record<string, unknown>;

function record(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null;
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

export function normalizeCrossrefDoi(value: string) {
  const doi = value.trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .toLowerCase();
  if (!/^10\.\d{4,9}\/[\x21-\x7e]+$/i.test(doi) || doi.length > 300) return null;
  return doi;
}

function firstTitle(value: unknown) {
  const candidate = asArray(value).find((item) => typeof item === 'string' && item.trim());
  return typeof candidate === 'string' ? candidate.trim() : null;
}

function people(value: unknown) {
  return asArray(value).slice(0, 100).flatMap((entry) => {
    const person = record(entry);
    if (!person) return [];
    return [{
      given: text(person.given),
      family: text(person.family),
      orcid: text(person.ORCID),
      sequence: text(person.sequence),
      authenticated_orcid: person.authenticated_orcid === true,
    }];
  });
}

function dateParts(value: unknown) {
  const outer = record(value);
  const parts = asArray(outer?.['date-parts'])[0];
  return Array.isArray(parts) ? parts : null;
}

function relations(value: unknown) {
  const source = record(value);
  if (!source) return {};
  return Object.fromEntries(Object.entries(source).map(([key, items]) => [key, asArray(items).slice(0, 100)]));
}

export function serializeCrossrefWork(work: JsonRecord) {
  const doi = normalizeCrossrefDoi(text(work.DOI) || '');
  return {
    doi,
    doi_url: doi ? `https://doi.org/${doi}` : null,
    original_title: firstTitle(work.title),
    local_title_ar: null,
    local_title_policy: 'Arabic local titles, when curated by Rawafid, must remain separate and must never overwrite the original Crossref title.',
    type: text(work.type),
    subtype: text(work.subtype),
    authors: people(work.author),
    editors: people(work.editor),
    container_title: asArray(work['container-title']).filter((item): item is string => typeof item === 'string'),
    publisher: text(work.publisher),
    member_id: text(work.member),
    prefix: text(work.prefix),
    ownership_note: 'Crossref member and prefix fields describe metadata-record ownership/stewardship; Rawafid does not claim publisher or record ownership.',
    issued: dateParts(work.issued),
    published: dateParts(work.published),
    indexed: work.indexed ?? null,
    deposited: work.deposited ?? null,
    created: work.created ?? null,
    licenses: asArray(work.license).slice(0, 50),
    relations: relations(work.relation),
    updates: asArray(work['update-to']).slice(0, 100),
    update_policy: text(work['update-policy']),
    references_count: typeof work['reference-count'] === 'number' ? work['reference-count'] : null,
    cited_by_count: typeof work['is-referenced-by-count'] === 'number' ? work['is-referenced-by-count'] : null,
    source: 'Crossref REST API',
    source_url: doi ? `${CROSSREF_WORKS_API}/${encodeURIComponent(doi)}` : CROSSREF_WORKS_API,
    stewardship: 'Metadata is retrieved from Crossref and remains attributable to Crossref and its member community.',
    rights_boundary: 'This endpoint exposes bibliographic metadata only. It does not retrieve or redistribute publisher full text, and it does not assume that metadata availability grants rights to reuse the underlying work.',
  };
}

export async function fetchCrossrefWorkMetadata(doi: string) {
  const normalized = normalizeCrossrefDoi(doi);
  if (!normalized) throw new TypeError('Invalid DOI.');
  const url = new URL(`${CROSSREF_WORKS_API}/${encodeURIComponent(normalized)}`);
  url.searchParams.set('mailto', CONTACT_EMAIL);
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(12000),
  });
  if (response.status === 404) return { status: 404 as const, data: null, headers: response.headers };
  if (!response.ok) return { status: response.status, data: null, headers: response.headers };
  const payload = await response.json() as JsonRecord;
  const message = record(payload.message);
  return { status: 200 as const, data: message ? serializeCrossrefWork(message) : null, headers: response.headers };
}

export const CROSSREF_WORK_OPERATIONAL_POLICY = {
  access_mode: 'identified-rest',
  contact_email: CONTACT_EMAIL,
  user_agent: USER_AGENT,
  cache_ttl_seconds: 86400,
  bulk_policy: 'Use the Crossref Public Data File or an agreed bulk workflow for corpus-scale ingestion instead of saturating the REST API.',
  original_title_immutable: true,
  protected_full_text_retrieval: false,
  preserve_relations_updates_licenses_and_record_timestamps: true,
} as const;
