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

## Access and attribution

A Lens Scholarly API trial or other approved API access is required. Use is subject to current Lens API terms, rate limits, and attribution requirements. Production code keeps the token server-side in `LENS_SCHOLARLY_API_TOKEN`.

Main implementation: `lib/research-integrations/lens.ts` and `app/api/v1/evidence-discovery/route.ts`.
