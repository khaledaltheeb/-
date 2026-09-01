# Rawafid research-evidence integrations

**Platform:** Rawafid / منصة روافد  
**Public domain:** https://healthrenewal.org  
**Founder:** Khaled Altheeb / خالد الذيب  
**Contact:** contact@healthrenewal.org

This integration layer supports traceable evidence discovery without treating upstream metadata as locally authored evidence. Every normalized record carries provider, provider identifier, source URL and retrieval provenance.

## Europe PMC — open biomedical provider

The client supports:

- REST search with `resultType=core`, `pageSize`, `cursorMark`, synonyms and contact email;
- DOI/PMID/PMCID normalization;
- typed ORCID normalization and ROR organization identifiers when Europe PMC supplies them;
- references and citations endpoints;
- OA full-text XML retrieval by PMCID;
- supplementary-file retrieval;
- timeout, retry and upstream rate-limit handling.

Implementation: `lib/research-integrations/europe-pmc.ts`.

## Crossref — open scholarly metadata provider

Crossref is a default discovery provider in Public API v1.2. The implementation follows the operational guidance received from Crossref and the current REST API conventions:

- requests identify Rawafid using both the `mailto` parameter and a descriptive `User-Agent`;
- deep pagination uses Crossref cursors rather than offsets;
- `crossref_from_update_date` and `crossref_from_index_date` support incremental discovery;
- DOI, title, publisher, publication date, journal, authors, ORCID and citation counts are normalized where supplied;
- Crossref `relation` and `update-to` metadata are preserved as normalized evidence relationships;
- provider failures remain isolated from Europe PMC and Lens.

Implementation: `lib/research-integrations/crossref.ts`.

## Lens Scholarly API — optional extended provider

Lens is enabled only when `LENS_SCHOLARLY_API_TOKEN` is configured server-side. A missing token does not break Europe PMC or Crossref discovery; the response reports Lens as `not_configured`.

The production client sends the token only in the server-to-server Bearer header and normalizes Lens IDs, DOI/PMID/PMCID/OpenAlex identifiers, citation counts, authors and affiliation ROR IDs. The repository contains an intentionally small open prototype under `examples/lens-scholarly-demo/` for Lens Labs review.

No Lens API token, user credential or paid dataset is committed to the repository.

## ROR — organization identity layer

ROR is not treated as a literature provider. It resolves organizational identity for the source registry and scholarly affiliations.

The implementation uses ROR API v2 and supports the 2026 single-search affiliation strategy. Automated API matching accepts only a result with `chosen: true`; confidence score or first-result position is never used as an automatic selector. Dataset resolution is restricted to unique exact normalized-name or exact-domain matches. Ambiguous records remain unresolved for review.

Production schema:

- `public.organizations`: canonical ROR identity and current ROR metadata;
- `public.source_organizations`: many-to-many links from source records to organizations, with relationship, resolution method, confidence metadata and verification timestamps;
- direct table access is denied to `anon` and `authenticated`; public source detail returns only the reviewed `chosen=true` organization projection.

Implementation: `lib/research-integrations/ror.ts` and `supabase/migrations/20260901190000_ror_source_registry_v1.sql`.

## DataCite-style connection metadata

The source registry now has first-class connection metadata rather than storing work relationships inside unstructured JSON:

- `public.source_related_identifiers` stores a related identifier, its identifier type, relation type and optional scheme metadata;
- `public.source_contributors` stores named creators/contributors with canonical ORCID URLs when available;
- `public.source_contributor_organizations` links a contributor to a canonical ROR organization;
- all three tables have RLS enabled and direct `anon`/`authenticated` table access revoked;
- `GET /api/v1/sources/{id}` returns only the public projection for sources that are actually cited by published, indexable Rawafid content.

The database deliberately does not enforce a frozen enum of DataCite relation types. `relation_type` remains explicit and provenance-bearing so future DataCite additions can be accepted without a destructive schema migration.

Implementation: `supabase/migrations/20260901212203_source_connection_metadata_v1.sql`.

## Unified endpoint

`GET /api/v1/evidence-discovery?q=<query>&providers=europe_pmc,crossref,lens&limit=20`

Provider continuation is independent:

- Europe PMC: `europe_pmc_cursor=<cursorMark>` (`cursor` remains a backward-compatible alias);
- Crossref: `crossref_cursor=<cursor>`;
- Lens: no continuation token is currently exposed by this normalized route.

Crossref incremental filters:

- `crossref_from_update_date=<ISO date>`;
- `crossref_from_index_date=<ISO date>`.

Anonymous requests are capped at 50 records. Authorized Rawafid Partner API clients with `search:read` may request up to 100. A provider failure is isolated and reported in `providers`; successful providers still return results.

Cross-provider de-duplication uses persistent identifiers first, with normalized title fallback only when no identifier exists.

## HTTP and cache boundary

The public API and feeds expose deterministic validators. API v1.2 honors both `If-None-Match` and `If-Modified-Since` for successful cacheable responses. RSS and JSON Feed return `503` with `Retry-After` if the canonical content catalog cannot be read, rather than emitting a successful but empty feed.

The evidence-discovery route is edge-cacheable for a short period. This reduces repeated upstream calls while keeping discovery metadata reasonably fresh.

## Rights and provenance boundary

Rawafid discovery metadata is not a license grant. Reuse of abstracts, full text, supplementary files and other record components remains governed by each upstream record/source license and the provider terms. The API therefore returns normalized discovery metadata and deep links rather than assuming redistribution rights.

## Focused partner questions after implementation

### Lens Labs

For an open public-interest app that stores only identifier-normalized discovery metadata/provenance in its source registry, deep-links to Lens/original records, and uses a short API-response cache, does Lens Labs prefer a specific maximum cache duration or a specific attribution field/logo placement in API-derived UI beyond the published Lens attribution requirements?

### ROR

When the ROR affiliation API returns no `chosen:true` result but the current ROR dataset yields exactly one exact-domain match for the same organization string/domain, does ROR recommend accepting that deterministic dataset-domain match automatically, or retaining the record as unresolved for human review because the affiliation service declined to choose?

### Europe PMC

No support question is currently necessary. Rawafid should return only when a reproducible implementation result reveals an actual API ambiguity or defect.

### Crossref

No generic support question is necessary after this implementation. Rawafid should contact Crossref again only with a reproducible ambiguity involving relationship semantics, incremental harvesting, or materially higher request volume.

### DataCite

The connection-metadata recommendation is now represented in the production source registry. A useful future follow-up should show concrete populated examples (RelatedIdentifier + ORCID + ROR) rather than asking another general schema question.
