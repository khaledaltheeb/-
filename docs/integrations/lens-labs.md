# Rawafid / Health Renewal — Lens Labs implementation record

This document records the public implementation choices for integrating the Lens Scholarly API into Rawafid / Health Renewal.

## Project model

- Public-interest and free to end users.
- No Lens API credential is exposed to the browser or committed to the repository.
- Lens is an opt-in provider in the public evidence-discovery API rather than an automatic default provider.
- The open implementation is reviewable in this public repository.
- Lens failure, quota exhaustion or credential absence is isolated from Europe PMC, Crossref and DataCite.

## Public integration

Primary endpoint:

`GET https://healthrenewal.org/api/v1/evidence-discovery?q=<query>&providers=lens&limit=20`

The Lens provider remains `not_configured` until `LENS_SCHOLARLY_API_TOKEN` is present server-side.

Implementation files:

- `lib/research-integrations/lens.ts`
- `lib/research-integrations/lens-quota.ts`
- `lib/research-integrations/evidence-discovery.ts`
- `app/api/v1/evidence-discovery/route.ts`
- `supabase/migrations/20260907114800_lens_scholarly_quota_guard.sql`
- `examples/lens-scholarly-demo/`

## Lens identity and attribution

Every normalized Lens result retains:

- `provider: lens`
- `provider_id: <Lens ID>`
- `identifiers.lens: <Lens ID>`
- a deep link to the original Lens scholarly record
- an explicit `attribution` object naming **The Lens**, linking to Lens.org and linking to the Lens attribution policy.

The attribution label used by the integration is **Data Sourced from The Lens**. The public API response also exposes the same attribution metadata whenever Lens is requested. Attribution is intentionally explicit and not hidden in generic legal text. Any user-facing Lens-derived results view should render this attribution at the point where the Lens-derived data is shown.

## Operational quota enforcement

The current limits communicated to Rawafid for the scholarly API route are:

- 10 requests per minute
- 20,000 requests per month

These limits are not documentation-only. Production reservations are enforced atomically in PostgreSQL before an upstream Lens request is made:

- all horizontally scaled app instances share one authoritative counter;
- a transaction-scoped advisory lock serializes reservations;
- minute and UTC-month windows are enforced independently;
- Lens fails closed if the quota guard cannot be reached or returns an invalid state;
- the quota guard is deliberately designed to **fail closed** rather than permit unmetered Lens traffic;
- a denied reservation produces a provider-level rate-limit failure without calling Lens;
- the Lens HTTP client uses one upstream attempt (`attempts: 1`) so a single user action cannot silently multiply Lens consumption through automatic retries;
- Lens remains opt-in so generic evidence searches do not consume the allocation;
- short-lived public API caching reduces repeated equivalent upstream requests.

The counter is intentionally consumed before the upstream request. This is conservative: an upstream timeout still consumes the reserved request, preventing races or retry behavior from exceeding the contractual allocation.

## Data handling boundary

Rawafid uses Lens for evidence discovery and identifier reconciliation. It does not present API access as a license to redistribute Lens datasets or restricted full text.

The integration:

- stores Lens identifiers and normalized discovery metadata needed for traceability;
- links users back to Lens and primary scholarly records;
- keeps API credentials server-side;
- keeps provider provenance on normalized records;
- preserves source licensing boundaries;
- does not infer reuse permission from discoverability;
- does not expose a bulk Lens proxy or raw Lens dataset endpoint.

## Failure behavior

Lens is treated as an optional upstream provider. If Lens is not configured, unavailable, quota-limited or returns an error, its provider status reflects that condition while successful providers continue to return evidence. No Lens credential or upstream response headers containing credentials are surfaced to clients.

## Demo timing

The Lens team indicated that a demo would be useful. Rawafid will schedule the demo after the live API credential is active and a working Lens-backed public workflow can be shown, rather than presenting a non-live concept.

## Activation checklist

Before live Lens traffic is enabled in production:

1. Obtain approved Scholarly API trial/Lens Labs credential.
2. Store the credential only as the server-side `LENS_SCHOLARLY_API_TOKEN` secret.
3. Apply the distributed Lens quota migration in production.
4. Confirm the service-role backend can execute `acquire_lens_scholarly_quota()` while public/anon/authenticated roles cannot.
5. Run repository research-integration contracts and the full quality/build gates.
6. Validate one live Lens-only request and one mixed-provider request.
7. Confirm Lens ID preservation, deep link and **Data Sourced from The Lens** attribution in returned records.
8. Confirm provider isolation if Lens is unavailable or rate-limited.
9. Confirm quota denial prevents the upstream Lens request.
10. Confirm no credential appears in logs, HTML, API output or repository history.
11. Confirm a user-facing Lens-derived results view displays Lens attribution at the data presentation point before public promotion of the Lens-backed feature.
12. Send the working public implementation links to Lens before scheduling the demo.

## Attribution references

- Lens: https://www.lens.org/
- Attribution policy: https://about.lens.org/policies/#attribution
- Lens Labs: https://www.lens.org/lens/labs
