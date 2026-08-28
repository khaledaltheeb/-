# SEO QA — pre-lock encyclopedia batch — 2026-08-28

## Batch identification

- QA role: independent second-pass SEO assurance.
- Primary batch manifest: not available for this completed set.
- Derivation: latest stable 50 `public.content` records updated immediately before the active SEO lock (`2026-08-28T14:28:26Z`).
- Derived update window: `2026-08-28T14:00:00Z` to `<2026-08-28T14:28:00Z`.
- Current primary-agent lock: `seo-20260828T1428Z-001`, status `acquired`; no merge/deploy from this QA branch while that lock remains active.
- QA branch: `seo-qa-20260828-trust-metadata`.

## Independent findings

1. **CRITICAL / YMYL trust provenance — systemic:** all 50 records have `last_reviewed_at` but no `reviewer_display_name`. The production helper infers `فريق روافد` and emits a visible reviewer plus `reviewedBy` structured data. Reviewer identity must not be inferred from a date alone.
2. **Metadata truncation — systemic:** current character-count truncation cuts 4/50 titles and 28/50 descriptions in the middle of a word.
3. **Stored metadata corruption — record-level:** `postsecondary-disability-services` has a stored `seo_title` ending in `موث`; this requires a one-record metadata correction after the active primary batch releases its lock.
4. **Indexability baseline:** 50/50 have canonical values, 50/50 are index/follow, 50/50 titles are unique, and 50/50 descriptions are unique in the reviewed set.
5. **Content/FAQ/reference baseline:** 50/50 have at least 8 body blocks, 50/50 include a visible FAQ block, and the reviewed set has 3 references per page. No scientific body was changed by QA.

## Fixes staged on QA branch

- `lib/review-provenance.ts`: preserve a recorded review date but emit reviewer identity / `reviewedBy` only when an explicit reviewer is stored; treat the explicit name `فريق روافد` as `Organization`, not `Person`.
- `scripts/review-provenance-contract.mjs`: fail if inferred reviewer fallback returns.
- `lib/seo.ts`: central word-boundary truncation for title/description instead of arbitrary character cuts.
- `scripts/seo-metadata-truncation-contract.mjs`: regression contract for word-safe truncation.
- `scripts/search-appearance-contract.mjs`: includes the metadata truncation contract in the established SEO search-appearance gate.

## Page classifications

Production classification remains **CRITICAL** for every page below until the provenance fix is merged, deployed, and verified live. `metadata-cut` is an additional issue flag, not a separate classification.

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
| 10 | `/encyclopedia/chaining-instruction/` | CRITICAL | description metadata-cut |
| 11 | `/encyclopedia/cochlear-implant-classroom/` | CRITICAL | description metadata-cut |
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
- NEEDS_EDITORIAL: 0/50 proven in this pass; no scientific claims were invented or rewritten.
- BLOCKED: 0/50 as the primary classification; deployment itself is blocked by the active primary-agent lock.
- CRITICAL: 50/50 due to inferred reviewer identity on YMYL/public pages.
- Current-title mid-word cuts: 4/50.
- Current-description mid-word cuts: 28/50.
- Stored truncated title records: 1/50.
- Critical systemic issues: 1 trust/schema provenance issue.
- Other systemic issues: 1 metadata truncation helper issue.

## Exit criteria

Do not mark this batch FIXED/PASS until all of the following are true:

1. Active primary SEO lock is released or replaced by an explicit completed state.
2. QA branch is rebased/compared against the then-current `main` without conflicting primary-agent changes.
3. Build, lint, typecheck, `review-provenance:validate`, `search-appearance:validate`, sitemap/SEO gates pass.
4. `postsecondary-disability-services` stored title is corrected without changing its URL or scientific body.
5. Production deploy completes successfully.
6. Live pages confirm no inferred reviewer, valid self-canonical/indexability, word-safe title/description output, valid JSON-LD, visible FAQ parity, and no regression.

## SYSTEMIC ISSUE status

This is the first independently logged QA batch for these two patterns; neither is yet eligible for the "repeated in 3+ QA batches" label. Continue counting in subsequent QA logs.
