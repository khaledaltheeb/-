# Rawafid Lens Scholarly API prototype

Small open prototype for **Rawafid / منصة روافد** (`https://healthrenewal.org`), founded by **Khaled Altheeb / خالد الذيب**.

The prototype performs a limited Lens Scholarly API metadata query and emits only the fields needed for evidence discovery and identifier reconciliation, including ROR identifiers present in affiliation metadata. It does not redistribute a Lens dataset and never stores an API token in the repository.

## Run

```bash
export LENS_SCHOLARLY_API_TOKEN='...'
node examples/lens-scholarly-demo/lens-demo.mjs "autism evidence-based intervention"
```

## Intended use

- discover scholarly records supporting Arabic public-interest educational content;
- reconcile DOI/PMID/PMCID/Lens identifiers;
- retain source-level provenance;
- reconcile organizational affiliations through ROR identifiers;
- link users to the original scholarly record rather than republishing restricted content.

## Lens Labs implementation boundary

Production Lens access is intentionally **opt-in**, not a default provider for every public evidence query. This reduces accidental consumption of the Lens allocation and makes every Lens-backed request explicit.

Every normalized Lens record in production retains the Lens ID and a deep link to the original Lens record, and carries explicit attribution metadata naming **The Lens**.

Current operational limits communicated for the scholarly API route are documented as:

- 10 requests per minute;
- 20,000 requests per month.

## Access and attribution

A Lens Scholarly API trial or other approved API access is required. Use is subject to current Lens API terms, rate limits, and attribution requirements. Production code keeps the token server-side in `LENS_SCHOLARLY_API_TOKEN`.

Attribution policy: https://about.lens.org/policies/#attribution

Lens: https://www.lens.org/

Main implementation: `lib/research-integrations/lens.ts` and `app/api/v1/evidence-discovery/route.ts`.

Detailed implementation record: `docs/integrations/lens-labs.md`.
