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

1. `lib/lens/client.ts` calls `POST https://api.lens.org/scholarly/search`.
2. `lib/lens/aggregation.ts` prepares guarded landscape queries for `POST https://api.lens.org/scholarly/aggregate`.
3. `lib/evidence/types.ts` defines the provider-neutral Rawafid evidence model.
4. `lib/evidence/normalize-lens.ts` maps Lens records into that model.
5. `lib/evidence/dedupe.ts` prioritizes DOI, then PMID, then provider ID when eliminating duplicates.
6. `/api/evidence/lens/scholarly` provides normalized scholarly results.
7. `/api/evidence/lens/landscape` exposes only predefined safe aggregation dimensions; it is not a generic Lens proxy.
8. Responses are `no-store` and `noindex` by default while licensing/caching policy is being confirmed.

## Supported landscape dimensions

- `year`
- `field`
- `country`
- `institution`
- `publication_type`
- `open_access`

Example:

```text
GET /api/evidence/lens/landscape?q=autism&dimension=year&year_from=2015&year_to=2026
```

## Existing Rawafid research catalog

Production already contains `public.research_catalog`, currently centered on OpenAlex records. It has DOI, publication metadata, authors, journal, citations, open-access state, Rawafid cluster fields and JSON metadata.

Do not create a duplicate Lens-only catalog. The intended migration is to make the existing catalog provider-neutral while preserving all existing OpenAlex rows. The migration must not be applied until Lens confirms what metadata/identifiers may be persisted and for how long.

Proposed provider-neutral additions after approval:

- nullable `openalex_id` for legacy compatibility;
- `source_api` remains the provider marker;
- provider record ID stored in metadata or a dedicated `provider_record_id` column;
- optional PMID and other identifiers;
- DOI remains the strongest cross-provider deduplication key;
- Lens-only metadata is persisted only to the extent expressly permitted by Lens.

## Trial validation checklist

- verify connectivity with an approved Lens token;
- fetch `/schema/scholarly` and compare schema version;
- test Arabic and English search queries;
- validate DOI, PMID and Lens identifier extraction;
- verify citation/reference fields;
- verify retraction/update handling;
- test Open Access fields and original-source URLs;
- record rate-limit headers and retry behavior;
- test each guarded aggregation dimension;
- verify Lens attribution/logo requirements before any public launch.

## Evidence Observatory plan

Once access and persistence rules are confirmed, Rawafid can build Arabic evidence landscapes for psychology, disability, inclusive education, rehabilitation, addiction recovery and other sectors.

Potential surfaces:

- latest scholarly works;
- systematic reviews and meta-analyses;
- publication trends by year;
- institutions and countries;
- fields of study;
- citation indicators;
- patent-to-scholar citation signals;
- open-access indicators;
- DOI / PMID / Lens ID resolution;
- links to original scholarly sources.

## Licensing and data-governance guardrails

Until Lens confirms the long-term arrangement:

- do not bulk redistribute Lens datasets;
- do not expose API tokens;
- do not create a public mirror of Lens metadata;
- do not persist Lens API results in the production research catalog;
- keep API responses uncached by default;
- link users to traceable Lens/original records;
- preserve required Lens attribution;
- treat identifier/metadata persistence policy as pending Lens confirmation.

## Attribution

The current provisional attribution is:

> Data sourced from The Lens

Lens documentation also states that the Lens logo should be visible when Lens data are used on a website. Final wording/logo treatment will be updated after the Lens team replies.

## Validation contract

Run:

```text
node scripts/lens-evidence-contract.mjs
```

The contract fails if the Lens token becomes public, no-store/noindex guards are removed, attribution disappears, or expected evidence-normalization/deduplication files are missing.
