# Public API v1 production verification

This runbook defines the live production contract for the Rawafid developer portal and Public & Partner API.

## Deployment identity

Live verification runs only after a successful `Deploy Production Fast` workflow and binds cache-busting and diagnostics to `workflow_run.head_sha`, so the SHA under test is the SHA that was deployed rather than an unrelated later default-branch SHA.

## Human documentation indexability

`/developers` and `/en/developers` are public human documentation and must remain canonical and indexable. Verification checks actual HTML robots metadata and the `X-Robots-Tag` response header. It deliberately does not treat documentation text containing the literal API policy `X-Robots-Tag: noindex, nofollow` as a page-level noindex directive.

Machine-readable JSON API responses may use robots exclusion headers because they are API payloads rather than search landing pages. That policy must not propagate to the human documentation routes.

## Production contract

The live workflow verifies:

- Arabic and English developer documentation, canonical URLs, indexability and expected API documentation markers.
- API discovery version/status and OpenAPI 3.1 publication.
- public content and article cursor pagination.
- ranked search mode.
- lossless change-stream cursor pagination.
- source and taxonomy pagination contracts.
- statistics and explicit opt-in Lens manifest semantics.
- browser CORS preflight behavior.
- ETag conditional requests returning HTTP 304.

A green live run is required before the Developer API work is treated as production-complete.
