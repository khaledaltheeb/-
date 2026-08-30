# Rawafid Lens Evidence Discovery

## Purpose

This module prepares Rawafid / Health Renewal to use The Lens Scholarly API as a traceable evidence-discovery layer for Arabic public-interest knowledge workflows.

## Current status

The integration is intentionally dormant until Lens API access is approved and a server-side token is configured.

Environment variable:

```text
LENS_SCHOLARLY_API_TOKEN=
```

Never expose this token to browser code or use a `NEXT_PUBLIC_` prefix.

## Server-side architecture

1. `lib/lens/client.ts` calls the official Lens Scholarly endpoint: `POST https://api.lens.org/scholarly/search`.
2. `app/api/evidence/lens/scholarly/route.ts` provides an internal Rawafid HTTP interface.
3. The endpoint returns explicit source attribution: `Data sourced from The Lens`.
4. Responses are `no-store` and `noindex` by default while the licensing/caching policy is being confirmed with Lens.
5. Search size is capped at 100 per request.
6. Rate-limit headers are observed and exposed only as integration metadata.

## Example internal request

```text
GET /api/evidence/lens/scholarly?q=autism&size=20&year_from=2024&year_to=2026
```

If the token has not been configured, the endpoint returns HTTP 503 with `status: not_configured` rather than silently failing or using another data source.

## Intended next phases

### Phase 1 — Trial validation

- Verify connectivity with an approved Lens Scholarly token.
- Validate actual response schema against the typed adapter.
- Test Arabic and English queries.
- Verify DOI / PMID / Lens identifier coverage.
- Capture rate-limit behaviour.

### Phase 2 — Evidence normalization

Normalize provider records into a provider-neutral Rawafid evidence model so Lens can coexist with DOI resolvers, PubMed and open-access primary-source links without coupling public pages to a single provider.

### Phase 3 — Evidence Observatory

After licensing/caching guidance is confirmed, build Arabic-facing evidence landscapes for topics such as psychology, disability, inclusive education, rehabilitation and addiction recovery.

Potential views include:

- recent scholarly works;
- systematic reviews and meta-analyses;
- publication trend by year;
- institutions and countries;
- citation indicators;
- open-access indicators;
- DOI / PMID / Lens ID links;
- links to the original scholarly source.

### Phase 4 — Aggregations

If Lens grants Scholarly Aggregation API access, add aggregated research-landscape endpoints. This should remain a separate adapter because the aggregation subscription and API limits may differ from the scholarly-search API.

## Licensing and data-governance guardrails

Until Lens confirms the long-term arrangement:

- do not bulk redistribute Lens datasets;
- do not expose API tokens;
- do not create a public mirror of Lens metadata;
- keep API responses uncached by default;
- link users to traceable Lens/original records;
- preserve required Lens attribution;
- treat stored identifiers/metadata policy as pending Lens confirmation.

## Attribution

Public UI that displays Lens-derived data must preserve the attribution agreed with The Lens. The current provisional string is:

> Data sourced from The Lens

This should be updated if the Lens team specifies a different wording/logo treatment.
