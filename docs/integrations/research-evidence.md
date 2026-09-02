# Rawafid research-evidence integrations

**Platform:** Rawafid / منصة روافد  
**Public domain:** https://healthrenewal.org  
**Founder:** Khaled Altheeb / خالد الذيب  
**Contact:** contact@healthrenewal.org

This integration layer supports traceable evidence discovery without treating upstream metadata as locally authored evidence. Every normalized record carries provider, provider identifier, source URL and retrieval provenance.

## Europe PMC — production default

Europe PMC is the open default provider for the Rawafid evidence-discovery route. The client supports:

- REST search with `resultType=core`, `pageSize`, `cursorMark`, synonyms and contact email;
- DOI/PMID/PMCID normalization;
- references and citations endpoints;
- OA full-text XML retrieval by PMCID;
- supplementary-file retrieval;
- timeout, retry and upstream rate-limit handling.

Implementation: `lib/research-integrations/europe-pmc.ts`.

## Lens Scholarly API — optional extended provider

Lens is enabled only when `LENS_SCHOLARLY_API_TOKEN` is configured server-side. A missing token does not break Europe PMC discovery; the response reports Lens as `not_configured`.

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

## Unified endpoint

`GET /api/v1/evidence-discovery?q=<query>&providers=europe_pmc,lens&limit=20`

Optional Europe PMC continuation uses `cursor=<cursorMark>`. Anonymous requests are capped at 50 records. Authorized Rawafid Partner API clients with `search:read` may request up to 100. A provider failure is isolated and reported in `providers`; successful providers still return results.

Cross-provider de-duplication uses DOI, PMID, PMCID and Lens ID, with normalized title fallback only when no identifier exists.

## Rights and provenance boundary

Rawafid discovery metadata is not a license grant. Reuse of abstracts, full text, supplementary files and other record components remains governed by each upstream record/source license and the provider terms. The API therefore returns normalized discovery metadata and deep links rather than assuming redistribution rights.

## Focused partner questions after implementation

### Lens Labs

For an open public-interest app that stores only identifier-normalized discovery metadata/provenance in its source registry, deep-links to Lens/original records, and uses a short API-response cache, does Lens Labs prefer a specific maximum cache duration or a specific attribution field/logo placement in API-derived UI beyond the published Lens attribution requirements?

### ROR

When the ROR affiliation API returns no `chosen:true` result but the current ROR dataset yields exactly one exact-domain match for the same organization string/domain, does ROR recommend accepting that deterministic dataset-domain match automatically, or retaining the record as unresolved for human review because the affiliation service declined to choose?

### Europe PMC

No support question is currently necessary. Rawafid should return only when a reproducible implementation result reveals an actual API ambiguity or defect.
