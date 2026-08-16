# Legacy migration closure — 2026-08-16

This document records the closure state for the production-baseline legacy migration. It distinguishes preservation from publication and does not treat an editorial hold as a successful scientific/editorial review.

## Baseline

- Production HTML items preserved in the private migration ledger: **5,642**.
- Active migration redirects from preserved production URLs: **0**.
- Pending review-style migration decisions (`UNRESOLVED`, `MATCH_EXISTING`, `MERGE_REVIEW`, `LANDING_REVIEW`, `INTERACTIVE_REVIEW`, `ASSET_REVIEW`): **0**.
- Open migration quality issues: **0**.
- Legacy rows bulk-published by this migration closure: **0**.

## Final migration dispositions

| Decision | Count | Meaning |
|---|---:|---|
| `PROMOTED_DRAFT` | 4,334 | Migrated draft candidate; publication still requires the release gates and explicit authorization. |
| `SOURCE_PRESERVED_NOT_PUBLISHED` | 565 | Production source preserved, but intentionally withheld from publication/indexing. |
| `MATCH_VERIFIED` | 312 | Verified against an existing destination. |
| `FUNCTION_PRESERVED` | 218 | Interactive/function parity preserved in V3; not a legacy content-release candidate. |
| `MERGE_PRESERVED` | 107 | Legacy value preserved through an explicit merge. |
| `LANDING_INTEGRATED` | 50 | Historical landing integrated in place without a migration redirect. |
| `EXCLUDE_DEVELOPMENT` | 29 | Development-only source excluded from public migration. |
| `EXCLUDE_OBSOLETE` | 15 | Obsolete source retained for provenance but excluded from release. |
| `ASSET_PRESERVED` | 12 | Historical asset/resource surface preserved as a real V3 route or current generated asset. |

Total: **5,642**.

## Quality-queue closure policy

Technical findings were closed only after runtime evidence:

- `functional_parity_required`: resolved after the current V3 functional-parity runtime smoke passed.
- `landing_route_integration_required`: resolved after the landing runtime smoke passed without migration redirects.

Editorial/YMYL findings were **not marked as remediated** when the source had not actually passed the editorial/scientific release standard. Instead, affected sources were moved to non-release dispositions (`SOURCE_PRESERVED_NOT_PUBLISHED`, `FUNCTION_PRESERVED`, `LANDING_INTEGRATED`, or an explicit exclusion), and the corresponding findings were marked `superseded` with `not_remediated=true` and `publication_authorized=false` retained in their audit details.

This makes the migration queue closed without converting preservation into a false publication-quality claim.

## Runtime evidence

Validated commit before ledger closure: `7037c52a4d4fa528af0bf2a80dcbdf60fe522da2`.

GitHub Actions run `31940098709` passed the complete Rawafid Quality Gate, including:

- architecture, release-hardening, TypeScript, lint and production build;
- real in-place historical routing with no migration redirects/rewrites;
- branded true 404 responses for invented routes;
- 150 daily tools + 3 historical assessments + 8 cognitive-test routes rendered in place;
- 44 substantial landing routes rendered in place without migration redirects;
- full sitemap SEO audit: 1,961 pages, 2,085 unique internal links, 0 failures;
- Lighthouse runs: performance 0.90 / 0.90 / 0.88 (median 0.90), accessibility 1.00, best practices 1.00, SEO 1.00, CLS 0.

Cloudflare Workers validation, full legacy inventory, quick-info inventory, care-guides inventory, and psychological encyclopedia quality checks also passed on that head.

## Publication boundary

Migration completion does not authorize bulk publication. The release trigger continues to require exact private-ledger binding, an eligible promoted disposition/state, the current V6 content/release gates, provenance and taxonomy checks, and any content-type-specific authorization. Source-preserved, function-preserved, landing-integrated, asset-preserved, development-only and obsolete dispositions are not bulk publication states.
