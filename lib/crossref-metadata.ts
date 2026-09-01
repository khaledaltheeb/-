const CROSSREF_API = 'https://api.crossref.org/v1';
const CONTACT_EMAIL = 'contact@healthrenewal.org';
const USER_AGENT = 'Rawafid-Metadata/1.0 (+https://healthrenewal.org/developers; mailto:contact@healthrenewal.org)';

export type CrossrefWork = Record<string, unknown>;

export function normalizeDoi(value: string) {
  const doi = value.trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .toLowerCase();
  if (!/^10\.\d{4,9}\/[\x21-\x7e]+$/i.test(doi) || doi.length > 300) return null;
  return doi;
}

function titleOf(work: CrossrefWork) {
  const title = Array.isArray(work.title) ? work.title.find((item) => typeof item === 'string') : null;
  return typeof title === 'string' ? title.trim() : '';
}

function people(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 100).flatMap((person) => {
    if (!person || typeof person !== 'object' || Array.isArray(person)) return [];
    const row = person as Record<string, unknown>;
    return [{
      given: typeof row.given === 'string' ? row.given : null,
      family: typeof row.family === 'string' ? row.family : null,
      orcid: typeof row.ORCID === 'string' ? row.ORCID : null,
      sequence: typeof row.sequence === 'string' ? row.sequence : null,
      authenticated_orcid: row.authenticated_orcid === true,
    }];
  });
}

function dates(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const parts = (value as Record<string, unknown>)['date-parts'];
  return Array.isArray(parts) && Array.isArray(parts[0]) ? parts[0] : null;
}

export function serializeCrossrefWork(work: CrossrefWork) {
  const doi = normalizeDoi(typeof work.DOI === 'string' ? work.DOI : '');
  const relation = work.relation && typeof work.relation === 'object' && !Array.isArray(work.relation) ? work.relation : {};
  const updates = Array.isArray(work.update_to) ? work.update_to : [];
  return {
    doi,
    doi_url: doi ? `https://doi.org/${doi}` : null,
    original_title: titleOf(work) || null,
    local_title_ar: null,
    local_title_policy: 'Arabic titles are stored separately by Rawafid and never overwrite the original Crossref title.',
    type: typeof work.type === 'string' ? work.type : null,
    subtype: typeof work.subtype === 'string' ? work.subtype : null,
    authors: people(work.author),
    editors: people(work.editor),
    container_title: Array.isArray(work['container-title']) ? work['container-title'] : [],
    publisher: typeof work.publisher === 'string' ? work.publisher : null,
    member_id: typeof work.member === 'string' ? work.member : null,
    prefix: typeof work.prefix === 'string' ? work.prefix : null,
    owner_note: 'The member/prefix fields identify the Crossref metadata record owner; Rawafid does not claim ownership or publisher status.',
    issued: dates(work.issued),
    published: dates(work.published),
    indexed: work.indexed ?? null,
    deposited: work.deposited ?? null,
    created: work.created ?? null,
    licenses: Array.isArray(work.license) ? work.license : [],
    relations: relation,
    updates,
    update_policy: typeof work['update-policy'] === 'string' ? work['update-policy'] : null,
    references_count: typeof work['reference-count'] === 'number' ? work['reference-count'] : null,
    cited_by_count: typeof work['is-referenced-by-count'] === 'number' ? work['is-referenced-by-count'] : null,
    source: 'Crossref REST API',
    source_url: doi ? `${CROSSREF_API}/works/${encodeURIComponent(doi)}` : CROSSREF_API,
    stewardship: 'Metadata retrieved from Crossref is stewarded by the Crossref community of members.',
    retrieved_fields_policy: 'Bibliographic metadata only; Rawafid does not retrieve or redistribute publisher full text or abstracts through this integration.',
  };
}

export async function fetchCrossrefWork(doi: string) {
  const url = new URL(`${CROSSREF_API}/works/${encodeURIComponent(doi)}`);
  url.searchParams.set('mailto', CONTACT_EMAIL);
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(12000),
  });
  if (response.status === 404) return { status: 404 as const, data: null, headers: response.headers };
  if (!response.ok) return { status: response.status, data: null, headers: response.headers };
  const payload = await response.json() as { message?: CrossrefWork };
  return { status: 200 as const, data: payload.message ? serializeCrossrefWork(payload.message) : null, headers: response.headers };
}

export const CROSSREF_OPERATIONAL_POLICY = {
  access: 'polite',
  contact_email: CONTACT_EMAIL,
  user_agent: USER_AGENT,
  cache_ttl_seconds: 86400,
  anonymous_concurrency: 1,
  max_rows_per_update_request: 20,
  backoff_statuses: [429, 500, 502, 503, 504],
  bulk_policy: 'Use the Crossref Public Data File for corpus-scale ingestion instead of high-volume REST traffic.',
  attribution: 'Metadata retrieved from Crossref is stewarded by the Crossref community of members.',
  original_title_immutable: true,
  protected_full_text_retrieval: false,
} as const;
