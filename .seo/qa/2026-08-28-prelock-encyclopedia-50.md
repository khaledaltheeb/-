# SEO QA — pre-lock encyclopedia batch — 2026-08-28

## Batch identification

- QA role: independent second-pass SEO assurance.
- Primary batch manifest: not available for this completed set.
- Derivation: the 50 `public.content` records captured immediately before the active SEO lock (`2026-08-28T14:28:26Z`). The slug list below is frozen so later writes cannot silently change the QA sample.
- Initial update window: `2026-08-28T14:00:00Z` to `<2026-08-28T14:28:00Z`.
- Current primary-agent lock: `seo-20260828T1428Z-001`, status `acquired`; no merge/deploy from this QA branch while that lock remains active.
- Concurrent-write recheck: 2/50 frozen URLs (`chaining-instruction`, `cochlear-implant-classroom`) were modified after the lock and are therefore `BLOCKED` for content-level QA until the active batch finishes. No QA data/content write was made to either row.
- QA branch: `seo-qa-20260828-trust-metadata`.
- QA pull request: `#448` (draft while the primary lock remains active).

## Independent findings

1. **CRITICAL / YMYL trust provenance — systemic:** all 50 frozen records currently have `last_reviewed_at` but no `reviewer_display_name`. The production helper infers `فريق روافد` and emits a visible reviewer plus `reviewedBy` structured data. Reviewer identity must not be inferred from a date alone.
2. **Metadata truncation — systemic:** current character-count truncation cuts 4/50 titles and 28/50 descriptions in the middle of a word.
3. **Stored metadata corruption — record-level:** `postsecondary-disability-services` has a stored `seo_title` ending in `موث`; this requires a one-record metadata correction after the active primary batch releases its lock.
4. **Metadata/query-map templating — editorial/SEO opportunity:** 49/50 titles use the exact `TITLE: دليل مختصر موثوق` pattern and 49/50 descriptions use the same generated prefix. At the initial snapshot the query map was also mechanically scaffolded (`TITLE تعريف`, `TITLE دعم`, `TITLE في التعليم`, plus a common semantic scaffold). The active agent has since started enriching two of these pages with additional Arabic/English long-tail terms, confirming this is an active-work area; QA will not overwrite it.
5. **Contextual internal-linking gap — secondary:** 0/50 body JSON records contained contextual link fields or encyclopedia URLs at the stable snapshot. The shared page template supplies crawlable navigation, so these pages are not treated as orphans, but topic-specific contextual links should be added only through validated entity/cluster relationships rather than automatic anchor insertion.

## Positive controls / checks passed at data and template level

- 50/50 frozen URLs have the expected `/encyclopedia/{slug}/` canonical; canonical path mismatches: 0.
- Canonical collisions against published/indexable content for the reviewed URLs: 0.
- 50/50 are `robots_index=true` and `robots_follow=true`.
- Exact primary-keyword collisions against published content for the reviewed terms: 0.
- 50/50 primary keywords equal the page title and 50/50 have informational intent.
- All 50 are `glossary_term`, so the encyclopedia renderer uses `DefinedTerm` + `WebPage`, not `MedicalCondition`; no condition-schema overreach was found in this batch.
- 50/50 body JSON payloads were distinct and 250/250 paragraph blocks were textually distinct in the stable snapshot. The four H2 labels are template-shared, so structural consistency exists without exact body duplication.
- 50/50 contain a visible FAQ block; the renderer derives FAQ structured data from those visible items.
- 150/150 references in the stable snapshot had a title and HTTPS URL. There were 40 distinct source URLs and 21 distinct three-source sets. Reused source sets followed coherent topic clusters (transition, AAC, hearing, visual access, math, behavior, instructional practice), so repetition alone is not treated as an error.
- 0/50 had a featured image at the stable snapshot; therefore there was no missing-alt defect on a rendered featured image in this set. The global social-card fallback remains the relevant OG path.
- FAQ payloads are modest (about 508–707 combined question/answer characters per page in the sampled batch); no SEO-induced JSON-LD size regression was identified.
- Repository template checks confirm Arabic `lang="ar"`, `dir="rtl"`, device-width viewport, production crawl rules, and encyclopedia sitemap ownership logic.
- Live search discovery for the individual new pages was not available during this pass; absence from search results is not used as an indexability verdict. Batch-level live HTML verification remains an exit criterion after deploy.

## Fixes staged on QA branch

- `lib/review-provenance.ts`: preserve a recorded review date but emit reviewer identity / `reviewedBy` only when an explicit reviewer is stored; omit `reviewedBy` entirely when attribution is absent; treat the explicit name `فريق روافد` as `Organization`, not `Person`.
- `scripts/review-provenance-contract.mjs`: fail if inferred reviewer fallback or serialized absent reviewer attribution returns.
- `lib/seo.ts`: central word-boundary truncation for title/description instead of arbitrary character cuts.
- `scripts/seo-metadata-truncation-contract.mjs`: regression contract for word-safe truncation.
- `scripts/search-appearance-contract.mjs`: includes the metadata truncation contract in the established SEO search-appearance gate.

## Page classifications

`CRITICAL` here means the stable page is affected by the proven trust/schema provenance defect and cannot be passed until the fix is deployed and live-verified. `BLOCKED` is used for the two frozen URLs that the primary agent modified after its lock was acquired; QA does not compete with those writes. `metadata-cut` is an additional issue flag.

| # | URL | Classification | Additional issue |
|---:|---|---|---|
| 1 | `/encyclopedia/accessible-homework/` | CRITICAL | description metadata-cut |
| 2 | `/encyclopedia/accessible-school-transportation/` | CRITICAL | — |
| 3 | `/encyclopedia/accessible-science-labs/` | CRITICAL | — |
| 4 | `/encyclopedia/active-student-engagement/` | CRITICAL | description metadata-cut |
| 5 | `/encyclopedia/adapted-school-furniture/` | CRITICAL | — |
| 6 | `/encyclopedia/audio-description-education/` | CRITICAL | description metadata-cut |
| 7 | `/encyclopedia/behavior-specific-praise/` | CRITICAL | — |
| 8 | `/encyclopedia/braille-notetaker/` | CRITICAL | description metadata-cut |
| 9 | `/encyclopedia/career-exploration-counseling/` | CRITICAL | — |
| 10 | `/encyclopedia/chaining-instruction/` | BLOCKED | primary agent modified after lock; description metadata-cut |
| 11 | `/encyclopedia/cochlear-implant-classroom/` | BLOCKED | primary agent modified after lock; description metadata-cut |
| 12 | `/encyclopedia/cognitive-strategy-instruction/` | CRITICAL | description metadata-cut |
| 13 | `/encyclopedia/collaborative-consultation-special-education/` | CRITICAL | title + description metadata-cut |
| 14 | `/encyclopedia/corrective-feedback-instruction/` | CRITICAL | description metadata-cut |
| 15 | `/encyclopedia/cumulative-review/` | CRITICAL | — |
| 16 | `/encyclopedia/distributed-practice/` | CRITICAL | — |
| 17 | `/encyclopedia/educational-audiology/` | CRITICAL | — |
| 18 | `/encyclopedia/explicit-vocabulary-instruction/` | CRITICAL | description metadata-cut |
| 19 | `/encyclopedia/flexible-grouping-special-education/` | CRITICAL | description metadata-cut |
| 20 | `/encyclopedia/functional-vision-assessment/` | CRITICAL | — |
| 21 | `/encyclopedia/graphic-organizers-learning/` | CRITICAL | description metadata-cut |
| 22 | `/encyclopedia/guided-practice/` | CRITICAL | — |
| 23 | `/encyclopedia/intensive-intervention/` | CRITICAL | — |
| 24 | `/encyclopedia/intervention-adaptation/` | CRITICAL | — |
| 25 | `/encyclopedia/large-print-materials/` | CRITICAL | description metadata-cut |
| 26 | `/encyclopedia/learning-media-assessment/` | CRITICAL | — |
| 27 | `/encyclopedia/listening-fatigue-students/` | CRITICAL | description metadata-cut |
| 28 | `/encyclopedia/low-tech-aac/` | CRITICAL | title + description metadata-cut |
| 29 | `/encyclopedia/magnification-assistive-technology/` | CRITICAL | description metadata-cut |
| 30 | `/encyclopedia/mathematical-language-instruction/` | CRITICAL | — |
| 31 | `/encyclopedia/mathematical-representations/` | CRITICAL | — |
| 32 | `/encyclopedia/metacognitive-strategy-instruction/` | CRITICAL | title + description metadata-cut |
| 33 | `/encyclopedia/multisyllabic-word-decoding/` | CRITICAL | description metadata-cut |
| 34 | `/encyclopedia/number-line-instruction/` | CRITICAL | description metadata-cut |
| 35 | `/encyclopedia/opportunities-to-respond/` | CRITICAL | — |
| 36 | `/encyclopedia/personal-care-support-school/` | CRITICAL | description metadata-cut |
| 37 | `/encyclopedia/postsecondary-disability-services/` | CRITICAL | title + description metadata-cut; stored title ends `موث` |
| 38 | `/encyclopedia/pre-employment-transition-services/` | CRITICAL | description metadata-cut |
| 39 | `/encyclopedia/preference-assessment/` | CRITICAL | — |
| 40 | `/encyclopedia/scaffolded-instruction/` | CRITICAL | — |
| 41 | `/encyclopedia/sign-language-interpreter-education/` | CRITICAL | description metadata-cut |
| 42 | `/encyclopedia/speech-generating-device/` | CRITICAL | — |
| 43 | `/encyclopedia/student-led-transition-planning/` | CRITICAL | description metadata-cut |
| 44 | `/encyclopedia/transfer-support-school/` | CRITICAL | description metadata-cut |
| 45 | `/encyclopedia/visual-efficiency-skills/` | CRITICAL | — |
| 46 | `/encyclopedia/wait-time-communication/` | CRITICAL | description metadata-cut |
| 47 | `/encyclopedia/work-based-learning-disability/` | CRITICAL | description metadata-cut |
| 48 | `/encyclopedia/worked-examples/` | CRITICAL | — |
| 49 | `/encyclopedia/workplace-readiness-training/` | CRITICAL | — |
| 50 | `/encyclopedia/classroom-acoustics-accessibility/` | CRITICAL | description metadata-cut |

## Metrics

- PASS: 0/50 pending production correction and live verification.
- FIXED: 0/50 live; systemic fixes are staged only.
- NEEDS_EDITORIAL: 0/50 as primary classification; metadata/query-map differentiation and contextual-linking are recorded as secondary editorial/SEO opportunities.
- BLOCKED: 2/50 due to confirmed concurrent primary-agent writes after lock acquisition.
- CRITICAL: 48/50 as the primary classification; the same provenance defect is also present on the two blocked rows, but concurrency takes precedence for QA ownership.
- Current-title mid-word cuts: 4/50.
- Current-description mid-word cuts: 28/50.
- Stored truncated title records: 1/50.
- Exact body duplicates at the stable snapshot: 0/50.
- Canonical collision rows: 0/50.
- Exact primary-query collision rows: 0/50.
- Body-level contextual-link coverage at the stable snapshot: 0/50.
- Exact title-template usage: 49/50.
- Exact description-template-prefix usage: 49/50.
- Critical systemic issues: 1 trust/schema provenance issue.
- Other systemic issues: 1 metadata truncation helper issue; query-map templating is tracked as a generator-quality opportunity pending recurrence evidence.

## Validation status

- Local clone/build was unavailable in the QA runtime because external GitHub DNS resolution failed; no local-pass claim is made.
- PR #448 CI is the authoritative validation path.
- `Cloudflare Workers Validate` passed on the PR head after code/contracts and again after the QA-log-only update path reached the same code state.
- `Canonical Ownership Gate` passed on the PR merge candidate after the sitewide canonical invariant was added to current `main`.
- `Rawafid Quality Gate` has already passed architecture, preservation, sitemap, content-readiness, typecheck and lint on the current QA code; final full-run status is checked separately before merge.
- No production deploy was attempted because the primary SEO lock remains active and production content is still changing.

## Exit criteria

Do not mark this batch FIXED/PASS until all of the following are true:

1. Active primary SEO lock is released or replaced by an explicit completed state.
2. The two concurrently modified frozen URLs stop changing and are re-audited from their final primary-agent state.
3. QA branch is rebased/compared against the then-current `main` without conflicting primary-agent changes.
4. Build, lint, typecheck, `review-provenance:validate`, `search-appearance:validate`, sitemap/SEO gates pass on the final merge candidate.
5. `postsecondary-disability-services` stored title is corrected without changing its URL or scientific body.
6. Production deploy completes successfully.
7. Live pages confirm no inferred reviewer, valid self-canonical/indexability, word-safe title/description output, valid JSON-LD, visible FAQ parity, and no regression.

## SYSTEMIC ISSUE status

This is the first independently logged QA batch for the reviewer-provenance and metadata-truncation patterns; neither is yet eligible for the formal "same error in 3+ QA batches" label. Continue counting in subsequent QA logs.
