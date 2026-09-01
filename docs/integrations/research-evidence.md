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
- provider failures remain isolated from the other providers;
- repeated discovery responses are edge-cacheable for a short period, while large-scale recurring ingestion should use a controlled local synchronization/snapshot strategy instead of unnecessary repeated upstream calls.

Implementation: `lib/research-integrations/crossref.ts`.

## DataCite — DOI metadata and connection metadata provider

DataCite is a first-class default discovery provider in Public API v1.2. Rawafid uses the public DataCite REST API v2 and does not require member credentials for retrieval.

The implementation:

- uses `page[cursor]` pagination with `1` only as the initial cursor and follows the opaque cursor returned in `links.next`;
- requests `affiliation=true`, `publisher=true` and `detail=true` so affiliation identifiers, publisher identifiers and expanded record details are available when DataCite supplies them;
- normalizes DOI identity;
- reads creators and contributors;
- normalizes ORCID from DataCite `nameIdentifiers` only when a valid ORCID is actually supplied;
- normalizes ROR from affiliation identifiers only when the record supplies a valid ROR identity;
- preserves `relatedIdentifiers` as typed evidence relationships;
- carries retrieval endpoint, API/schema version and query provenance;
- does not invent negative retraction status or infer ORCID/ROR from names alone.

Implementation: `lib/research-integrations/datacite.ts`.

## Lens Scholarly API — optional extended provider

Lens is enabled only when `LENS_SCHOLARLY_API_TOKEN` is configured server-side. A missing token does not break Europe PMC, Crossref or DataCite discovery; the response reports Lens as `not_configured`.

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

## DataCite-compatible source connection metadata

The source registry has first-class connection metadata rather than storing work relationships inside unstructured JSON:

- `public.source_related_identifiers` stores a related identifier, its identifier type, relation type and optional scheme metadata;
- `public.source_contributors` stores named creators/contributors with canonical ORCID URLs when available;
- `public.source_contributor_organizations` links a contributor to a canonical ROR organization;
- all three tables have RLS enabled and direct `anon`/`authenticated` table access revoked;
- `GET /api/v1/sources/{id}` returns only the public projection for sources that are actually cited by published, indexable Rawafid content.

Published Rawafid citations are now materialized as DataCite-compatible `IsReferencedBy` relationships from the cited source to the canonical Rawafid page URL. A database trigger keeps these relationships synchronized when `content_sources` changes or when publication/indexability/canonical URL state changes. The production backfill materialized 32,137 such relationships across 10,114 sources and 8,170 published pages; all generated relationship URLs are canonical `https://healthrenewal.org/...` URLs.

The database deliberately does not enforce a frozen enum of DataCite relation types. `relation_type` remains explicit and provenance-bearing so future DataCite additions can be accepted without a destructive schema migration.

Implementation: `supabase/migrations/20260901212203_source_connection_metadata_v1.sql` and `supabase/migrations/20260901223500_datacite_content_relations_v1.sql`.

## Rights profiles — discoverability is not reuse permission

The source registry separates the visibility of a source from the legal/contractual ability to reuse its metadata or content. This prevents a public or discoverable record from being treated automatically as reusable.

`public.source_rights_profiles` can describe rights at source level or for a specific source version. It records independently:

- metadata access status and metadata reuse status;
- metadata license and terms URL;
- content/data access status and content/data reuse status;
- content license and terms URL;
- the basis for the rights assertion (`provider_terms`, `record_license`, direct permission, public domain or another documented basis);
- a verification timestamp and internal provenance.

Unknown remains the conservative default. The API does not infer `allowed` merely because a record is public. Existing source-level license strings were projected into structured profiles only as `record_license` evidence with `content_reuse_status=unknown`; no reuse permission was inferred. Direct table access is denied to `anon` and `authenticated`; the bounded source-detail projection exposes the verified structured profile when one exists.

## Translation provenance — multilingual metadata without false attribution

For translated or localized source metadata, `public.source_translation_provenance` records how each translated field was produced rather than mixing the Arabic value into upstream metadata without provenance.

The record includes source/target language, field path, translation method (`human`, `machine`, `hybrid`, `unknown`), tool and version for machine-assisted work, translator identity and ORCID/ROR affiliation when available, reviewer identity and review status, review time, and an optional SHA-256 fingerprint of the translated value.

Database constraints prevent claiming a human/hybrid translation without a translator name, prevent machine/hybrid translation without a named tool, and prevent a reviewed/approved state without reviewer identity and review time. This supports auditability while keeping original-provider metadata distinguishable from Rawafid localization.

Implementation: `supabase/migrations/20260901215918_source_governance_provenance_v1.sql`.

## Unified endpoint

`GET /api/v1/evidence-discovery?q=<query>&providers=europe_pmc,crossref,datacite,lens&limit=20`

Provider continuation is independent:

- Europe PMC: `europe_pmc_cursor=<cursorMark>` (`cursor` remains a backward-compatible alias);
- Crossref: `crossref_cursor=<cursor>`;
- DataCite: `datacite_cursor=<opaque page[cursor] token>`;
- Lens: no continuation token is currently exposed by this normalized route.

Crossref incremental filters:

- `crossref_from_update_date=<ISO date>`;
- `crossref_from_index_date=<ISO date>`.

Anonymous requests are capped at 50 records. Authorized Rawafid Partner API clients with `search:read` may request up to 100. A provider failure is isolated and reported in `providers`; successful providers still return results.

Cross-provider de-duplication uses persistent identifiers first, with normalized title fallback only when no identifier exists.

## HTTP and cache boundary

The public API and feeds expose deterministic validators. API v1.2 honors both `If-None-Match` and `If-Modified-Since` for successful cacheable responses. RSS and JSON Feed return `503` with `Retry-After` if the canonical content catalog cannot be read, rather than emitting a successful but empty feed.

The evidence-discovery route is edge-cacheable for a short period. This reduces repeated upstream calls while keeping discovery metadata reasonably fresh. For future high-volume harvesting, provider-specific synchronization state should preserve the provider cursor/watermark, retrieval time and provider version so ingestion can be resumed without using the public query endpoint as a bulk crawler. DataCite also exposes OAI-PMH for bulk metadata harvesting; that path should be considered when a true harvesting workload is required rather than overloading interactive search.

## Rights and provenance boundary

Rawafid discovery metadata is not a license grant. Reuse of abstracts, full text, supplementary files and other record components remains governed by each upstream record/source license and the provider terms. The API therefore returns normalized discovery metadata and deep links rather than assuming redistribution rights.

Public source detail exposes structured `rights_profiles` and `translations` in addition to related identifiers, ORCID/ROR connections, versions and citations. Empty arrays mean Rawafid has no structured assertion yet; they must not be interpreted as permission or as evidence that no translation occurred.

## Architecture boundaries from partner guidance

Not every useful external standard belongs inside the scholarly discovery endpoint:

- Hypothesis belongs to annotation/review workflows rather than becoming a literature provider.
- Open Referral belongs to provider/service-directory interoperability, where maintenance and human verification are as important as schema conformance.
- openEHR belongs to clinical-record architecture/archetype/template work, not the public evidence API.
- SNOMED CT remains a terminology/licensing track until the pending support route provides a precise permitted integration model.
- Orphanet remains a specialized rare-disease data/licensing integration rather than being silently mixed into general research discovery.

These boundaries keep Public API v1 stable and prevent incompatible rights or domain semantics from being hidden behind a generic provider label.

## Focused partner questions after implementation

### DataCite

Rawafid can now show a concrete implementation rather than a schema proposal: DataCite is a live normalized discovery provider; `relatedIdentifiers`, creator/contributor ORCID and affiliation ROR are normalized when actually supplied; and production Source Registry citations are materialized as `IsReferencedBy` relations with conservative rights and translation-provenance layers. A follow-up should include the published API/docs links and ask only for review of the relationship direction/semantics and any recommended provenance refinements.

### Lens Labs

For an open public-interest app that stores only identifier-normalized discovery metadata/provenance in its source registry, deep-links to Lens/original records, and uses a short API-response cache, does Lens Labs prefer a specific maximum cache duration or a specific attribution field/logo placement in API-derived UI beyond the published Lens attribution requirements?

### ROR

When the ROR affiliation API returns no `chosen:true` result but the current ROR dataset yields exactly one exact-domain match for the same organization string/domain, does ROR recommend accepting that deterministic dataset-domain match automatically, or retaining the record as unresolved for human review because the affiliation service declined to choose?

### Europe PMC

No support question is currently necessary. Rawafid should return only when a reproducible implementation result reveals an actual API ambiguity or defect.

### Crossref

No generic support question is necessary after this implementation. Rawafid should contact Crossref again only with a reproducible ambiguity involving relationship semantics, incremental harvesting, or materially higher request volume.
