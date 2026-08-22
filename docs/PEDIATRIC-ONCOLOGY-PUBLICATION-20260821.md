# Pediatric Oncology Publication — 2026-08-21

## Publication result

The repaired pediatric-oncology program is now published on the current Rawafid staging deployment.

- 21/21 target care guides are `published` in the production content database used by the current Rawafid staging worker.
- 21/21 have `robots_index = true` and `publication_ready = true` at the content-record level.
- 21/21 record `reviewer_display_name = فريق روافد`, review date, and the reviewer credential label `مراجعة علمية وتحريرية داخلية`.
- Every rendered guide includes the visible Arabic label: `تمت المراجعة من قبل فريق روافد.`
- Final live QA returned HTTP 200 for 21/21 guides.
- Final live QA found the expected canonical path on 21/21 guides.
- Final live QA found the Rawafid review label on 21/21 guides.
- Final live QA found index-capable robots markup on 21/21 guides.

## Review-provenance boundary

The visible statement means that the Rawafid team completed the internal scientific/editorial review recorded by the project owner. It is not represented as an external independent physician review. The metadata explicitly preserves this distinction (`independent_external_review_claimed = false`).

## Release-pipeline fixes made during publication

Publication exposed drift between the database release contract and the repository two-phase release design. The following were corrected without removing the pediatric-oncology safety gates:

1. The public-route release trigger was restored to a two-phase model so an initial published route can exist before post-publication HTTP verification.
2. The trigger's pending-state contract was aligned with the existing database constraint (`status = pending`, `verification_mode = two-phase-live-route`).
3. The release timeout sweep was corrected so a missing `expires_at` is not interpreted as already expired. Only rows with an explicit expired timestamp are rolled back.
4. Care-guide structured content was rebuilt from the full `body_text` after release-readiness blocks were added, preserving the complete article while adding H3/FAQ structures required by the V6 release gate.
5. The five initially sub-threshold clinical guides (ALL, AML, APL, AML germline predisposition, and Down-syndrome TAM/ML-DS) were substantively expanded above the 2,500-Arabic-word release floor before publication.

## Current route-verification state

All 21 content records are published and live on the current Rawafid staging worker, but `public_route_verification.status` remains `pending` because the staging sitemap is intentionally suppressed by the environment-level indexing switch.

The current staging `/sitemap.xml` returns an empty sitemap index because `lib/sitemap-xml.ts` only emits entries when `NEXT_PUBLIC_ALLOW_INDEXING === 'true'`. This is an environment-level staging policy rather than a page-level content failure.

The legacy `https://healthrenewal.org` deployment still does not serve these new `/care-guides/` routes, so it cannot be used as the final route-verification origin yet.

Do not set `sitemap_present = true` or mark route verification `passed` until the actual production Rawafid deployment emits the canonical guide URLs in its sitemap.

## Final safety posture

The publication action did not fabricate an external reviewer identity or medical specialty. The published label is the explicitly requested and recorded internal Rawafid-team review statement. Content remains linked to the central disclaimer contract and retains its topic-specific evidence and claim-source mapping.
