# Rawafid / Health Renewal — Lens Labs implementation record

This document records the public implementation choices for integrating the Lens Scholarly API into Rawafid / Health Renewal.

## Project model

- Public-interest and free to end users.
- No Lens API credential is exposed to the browser or committed to the repository.
- Lens is an opt-in provider in the public evidence-discovery API rather than an automatic default provider.
- The open implementation is reviewable in this public repository.

## Public integration

Primary endpoint:

`GET https://healthrenewal.org/api/v1/evidence-discovery?q=<query>&providers=lens&limit=20`

The Lens provider remains `not_configured` until `LENS_SCHOLARLY_API_TOKEN` is present server-side.

Implementation files:

- `lib/research-integrations/lens.ts`
- `lib/research-integrations/evidence-discovery.ts`
- `app/api/v1/evidence-discovery/route.ts`
- `examples/lens-scholarly-demo/`

## Lens identity and attribution

Every normalized Lens result retains:

- `provider: lens`
- `provider_id: <Lens ID>`
- `identifiers.lens: <Lens ID>`
- a deep link to the original Lens scholarly record
- an explicit `attribution` object naming **The Lens**, linking to Lens.org and linking to the Lens attribution policy.

The public API response also exposes Lens attribution metadata whenever Lens is requested. Attribution is intentionally explicit and not hidden in generic legal text.

## Operational limits

The implementation documents the current limits communicated to Rawafid for the scholarly API route:

- 10 requests per minute
- 20,000 requests per month

Lens is opt-in to reduce accidental use of the Lens allocation by generic public searches. Short-lived public API caching further reduces repeated upstream queries.

## Data handling boundary

Rawafid uses Lens for evidence discovery and identifier reconciliation. It does not present API access as a license to redistribute Lens datasets or restricted full text.

The integration:

- stores Lens identifiers and normalized discovery metadata needed for traceability;
- links users back to Lens and primary scholarly records;
- keeps API credentials server-side;
- keeps provider provenance on normalized records;
- preserves source licensing boundaries;
- does not infer reuse permission from discoverability.

## Demo timing

The Lens team indicated that a demo would be useful. Rawafid will schedule the demo after the live API credential is active and a working Lens-backed public workflow can be shown, rather than presenting a non-live concept.

## Activation checklist

Before live Lens traffic is enabled in production:

1. Obtain approved Scholarly API trial/Lens Labs credential.
2. Store the credential only as the server-side `LENS_SCHOLARLY_API_TOKEN` secret.
3. Run repository research-integration contracts.
4. Validate one live Lens-only request and one mixed-provider request.
5. Confirm Lens ID preservation, deep link and attribution in returned records.
6. Confirm provider isolation if Lens is unavailable or rate-limited.
7. Confirm no credential appears in logs, HTML, API output or repository history.
8. Send the working public implementation links to Lens before scheduling the demo.

## Attribution references

- Lens: https://www.lens.org/
- Attribution policy: https://about.lens.org/policies/#attribution
- Lens Labs: https://www.lens.org/lens/labs
