# Rawafid API versioning and deprecation policy

## Scope

This policy governs the public and institutional Partner API exposed under `/api/v1` at `healthrenewal.org`.

## Stability contract

`/api/v1` is the stable major-version boundary. Within v1, Rawafid may make backward-compatible additive changes, including new endpoints, optional query parameters, response fields, enum values where clients are expected to tolerate unknown values, and new response headers.

Rawafid will not intentionally make the following changes within v1 without a compatibility path: remove or rename an existing documented field; change a documented field to an incompatible type; change successful response semantics in a way that invalidates existing conforming integrations; remove a documented endpoint; or silently broaden access to unpublished/private content.

Clients must ignore unknown response fields and should not treat undocumented field ordering as stable.

## Deprecation

When a documented v1 capability needs replacement, Rawafid will prefer a staged deprecation:

1. mark the capability deprecated in OpenAPI and developer documentation;
2. provide the replacement and migration guidance before removal;
3. emit `Deprecation` and, when a date is known, `Sunset` response headers on affected endpoints;
4. keep the old capability available for a reasonable migration period unless urgent security, legal, privacy, or data-integrity risk requires faster action;
5. record material API changes in the repository and developer-facing changelog.

A security or privacy emergency may require accelerated mitigation. In that case Rawafid may restrict or disable affected behavior immediately and document the reason once it is safe to do so.

## Major versions

A future incompatible API will use a new major namespace such as `/api/v2`. v1 and v2 may coexist during migration. Partner credentials are not guaranteed to be valid for a future major version unless explicitly documented.

## Data and provenance

API version stability does not freeze editorial data. Published records, source relationships, review metadata, and rights metadata can legitimately change as the underlying knowledge base is corrected or updated. Integrators should use `updated_at`, `/api/v1/changes`, ETags, and conditional requests rather than assuming records are immutable.

The normalized source registry identifies source records and their relationships to published Rawafid content. It does not grant reuse rights beyond the explicit rights or licenses attached to the source/material.

## Availability and quotas

The anonymous public API is best-effort and no uptime SLA is currently promised. Institutional partner quotas are enforced according to each partner/key configuration and can return HTTP 429 with `Retry-After`. Any future contractual SLA will be documented separately and must not be inferred from this policy.

## Security expectations for integrators

Partner keys are server-side credentials. They must not be embedded in public JavaScript, mobile application source, public repositories, logs, screenshots, analytics payloads, or client-side storage. Compromised keys should be revoked and replaced through the Rawafid administration process.
