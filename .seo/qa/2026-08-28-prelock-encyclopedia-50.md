# SEO QA — pre-lock encyclopedia batch — 2026-08-28

## Batch identification

- QA role: independent second-pass SEO assurance.
- Primary completed-batch manifest: not available for this set.
- Derivation: freeze the 50 `public.content` records captured immediately before the active SEO lock (`2026-08-28T14:28:26Z`) so later writes cannot silently change the QA sample.
- Initial update window: `2026-08-28T14:00:00Z` to `<2026-08-28T14:28:00Z`.
- Current primary-agent lock: `seo-20260828T1428Z-001`, status `acquired`; no QA merge/deploy while that lock remains active.
- Concurrent-write recheck: 2/50 frozen URLs (`chaining-instruction`, `cochlear-implant-classroom`) were modified after lock acquisition and are `BLOCKED` for content-level QA until the active batch finishes. QA did not write either row.
- QA branch: `seo-qa-20260828-trust-metadata`.
- QA pull request: `#448` (draft while the primary lock remains active).

## Independent findings

1. **CRITICAL / YMYL trust provenance — sitewide helper defect:** all 50 frozen records currently have `last_reviewed_at` but no `reviewer_display_name`. Production infers `فريق روافد` and can emit a visible reviewer plus `reviewedBy` structured data. A date does not prove reviewer identity.
2. **Arbitrary metadata hard-clamp — sitewide helper defect:** production character-count clipping cuts 4/50 titles and 28/50 descriptions in the middle of Arabic words. Current Google Search Central guidance does not impose a hard character limit for title links or meta descriptions; search presentation is truncated as needed by the result surface. QA therefore removes the arbitrary 60/160-character clamp instead of replacing it with another truncation rule.
3. **Stored metadata corruption — record-level:** `postsecondary-disability-services` has a stored `seo_title` ending in `موث`. Removing the renderer clamp correctly exposes this source-data defect; it must be corrected as one metadata record only after the active primary batch releases its lock.
4. **Metadata/query-map templating — editorial/SEO opportunity:** 49/50 titles use the exact `TITLE: دليل مختصر موثوق` pattern and 49/50 descriptions use the same generated prefix. After excluding the 2 concurrently edited rows, 47/48 stable pages retain the exact title/description template, 48/48 use `TITLE تعريف` and `TITLE دعم`, and 47/48 use `TITLE في التعليم`. The active agent has started enriching the two blocked rows with additional Arabic/English long-tail terms, so QA will not overwrite this active work.
5. **Contextual internal-linking gap — secondary:** 0/50 body JSON records contained contextual link fields or encyclopedia URLs in the stable snapshot. Shared crawlable template navigation prevents orphaning, but topic-specific contextual links should be added only through validated entity/cluster relationships, never by mass anchor insertion.

## Positive controls / checks passed

- 50/50 frozen URLs have the expected `/encyclopedia/{slug}/` canonical; canonical path mismatches: 0.
- Canonical collisions against published/indexable content for the reviewed URLs: 0.
- A production unique canonical-owner index now exists sitewide; this was added by another workflow and is not claimed as a QA fix.
- 50/50 are `robots_index=true` and `robots_follow=true`.
- Exact primary-keyword collisions against published content for the reviewed terms: 0.
- 50/50 primary keywords equal the page title and 50/50 have informational intent.
- All 50 are `glossary_term`, so the encyclopedia renderer uses `DefinedTerm` + `WebPage`, not `MedicalCondition`; no condition-schema overreach was found in this batch.
- 50/50 body JSON payloads were distinct and 250/250 paragraph blocks were textually distinct in the stable snapshot. Four H2 labels are template-shared, so structural consistency exists without exact body duplication.
- Corrected word-count measurement: `body_text` is about 131–175 words (avg ~152) and structured JSON content is about 260–335 tokens (avg ~296). An earlier SQL regex produced a false 1-word result and was discarded; it is not a thin-content finding.
- 50/50 contain a visible FAQ block; the renderer derives FAQ structured data from visible items. FAQ payloads are modest (~508–707 combined question/answer characters per page). No JSON-LD size regression was identified.
- 150/150 references in the stable snapshot had a title and HTTPS URL. There were 40 distinct source URLs and 21 distinct three-source sets. Reused source sets map to coherent clusters and are not treated as an error by repetition alone.
- 0/50 had a featured image in the stable snapshot; therefore no rendered featured-image alt defect exists in this set. The global social-card fallback is used for OG/Twitter.
- Repository template checks confirm Arabic `lang="ar"`, `dir="rtl"`, device-width viewport, production crawl rules, server-rendered metadata/schema, crawlable links, semantic headings, visible FAQ parity and encyclopedia sitemap ownership logic.
- Cannibalization scan found no proven same-intent collision inside the frozen 50. High-similarity pairs were definition/subtopic or parent/child distinctions.
- Live search discovery for individual new pages was unavailable during this pass; absence from search results is not used as an indexability verdict. Direct production HTML verification remains an exit criterion after deployment.

## Fixes staged on QA branch

- `lib/review-provenance.ts`: preserve a recorded review date but emit reviewer identity / `reviewedBy` only when an explicit reviewer is stored; omit `reviewedBy` when attribution is absent; treat explicitly stored `فريق روافد` as `Organization`, not `Person`.
- `scripts/review-provenance-contract.mjs`: fail if inferred reviewer fallback or serialized absent reviewer attribution returns.
- `lib/seo.ts`: normalize title/description whitespace and branding without arbitrary character truncation; preserve complete source metadata.
- `scripts/seo-metadata-truncation-contract.mjs`: despite its legacy filename, now enforces metadata preservation and rejects hard character clamps.
- `scripts/search-appearance-contract.mjs`: includes the metadata-preservation contract in the established search-appearance gate.
- `.seo/qa/opportunities-2026-08-28.md`: records non-destructive query-map, contextual-linking and out-of-batch cannibalization opportunities.

## Page classifications

`CRITICAL` means the stable page is affected by the proven trust/schema provenance defect and cannot pass until the fix is deployed and live-verified. `BLOCKED` is used for the two frozen URLs changed by the primary agent after lock acquisition. `metadata-hard-clamp` means the current production helper truncates the source value; the staged QA helper removes that clamp.

| # | URL | Classification | Additional issue |
|---:|---|---|---|
| 1 | `/encyclopedia/accessible-homework/` | CRITICAL | description metadata-hard-clamp |
| 2 | `/encyclopedia/accessible-school-transportation/` | CRITICAL | — |
| 3 | `/encyclopedia/accessible-science-labs/` | CRITICAL | — |
| 4 | `/encyclopedia/active-student-engagement/` | CRITICAL | description metadata-hard-clamp |
| 5 | `/encyclopedia/adapted-school-furniture/` | CRITICAL | — |
| 6 | `/encyclopedia/audio-description-education/` | CRITICAL | description metadata-hard-clamp |
| 7 | `/encyclopedia/behavior-specific-praise/` | CRITICAL | — |
| 8 | `/encyclopedia/braille-notetaker/` | CRITICAL | description metadata-hard-clamp |
| 9 | `/encyclopedia/career-exploration-counseling/` | CRITICAL | — |
| 10 | `/encyclopedia/chaining-instruction/` | BLOCKED | primary agent modified after lock; description metadata-hard-clamp |
| 11 | `/encyclopedia/cochlear-implant-classroom/` | BLOCKED | primary agent modified after lock; description metadata-hard-clamp |
| 12 | `/encyclopedia/cognitive-strategy-instruction/` | CRITICAL | description metadata-hard-clamp |
| 13 | `/encyclopedia/collaborative-consultation-special-education/` | CRITICAL | title + description metadata-hard-clamp |
| 14 | `/encyclopedia/corrective-feedback-instruction/` | CRITICAL | description metadata-hard-clamp |
| 15 | `/encyclopedia/cumulative-review/` | CRITICAL | — |
| 16 | `/encyclopedia/distributed-practice/` | CRITICAL | — |
| 17 | `/encyclopedia/educational-audiology/` | CRITICAL | — |
| 18 | `/encyclopedia/explicit-vocabulary-instruction/` | CRITICAL | description metadata-hard-clamp |
| 19 | `/encyclopedia/flexible-grouping-special-education/` | CRITICAL | description metadata-hard-clamp |
| 20 | `/encyclopedia/functional-vision-assessment/` | CRITICAL | — |
| 21 | `/encyclopedia/graphic-organizers-learning/` | CRITICAL | description metadata-hard-clamp |
| 22 | `/encyclopedia/guided-practice/` | CRITICAL | — |
| 23 | `/encyclopedia/intensive-intervention/` | CRITICAL | — |
| 24 | `/encyclopedia/intervention-adaptation/` | CRITICAL | — |
| 25 | `/encyclopedia/large-print-materials/` | CRITICAL | description metadata-hard-clamp |
| 26 | `/encyclopedia/learning-media-assessment/` | CRITICAL | — |
| 27 | `/encyclopedia/listening-fatigue-students/` | CRITICAL | description metadata-hard-clamp |
| 28 | `/encyclopedia/low-tech-aac/` | CRITICAL | title + description metadata-hard-clamp |
| 29 | `/encyclopedia/magnification-assistive-technology/` | CRITICAL | description metadata-hard-clamp |
| 30 | `/encyclopedia/mathematical-language-instruction/` | CRITICAL | — |
| 31 | `/encyclopedia/mathematical-representations/` | CRITICAL | — |
| 32 | `/encyclopedia/metacognitive-strategy-instruction/` | CRITICAL | title + description metadata-hard-clamp |
| 33 | `/encyclopedia/multisyllabic-word-decoding/` | CRITICAL | description metadata-hard-clamp |
| 34 | `/encyclopedia/number-line-instruction/` | CRITICAL | description metadata-hard-clamp |
| 35 | `/encyclopedia/opportunities-to-respond/` | CRITICAL | — |
| 36 | `/encyclopedia/personal-care-support-school/` | CRITICAL | description metadata-hard-clamp |
| 37 | `/encyclopedia/postsecondary-disability-services/` | CRITICAL | title + description metadata-hard-clamp; stored title itself ends `موث` |
| 38 | `/encyclopedia/pre-employment-transition-services/` | CRITICAL | description metadata-hard-clamp |
| 39 | `/encyclopedia/preference-assessment/` | CRITICAL | — |
| 40 | `/encyclopedia/scaffolded-instruction/` | CRITICAL | — |
| 41 | `/encyclopedia/sign-language-interpreter-education/` | CRITICAL | description metadata-hard-clamp |
| 42 | `/encyclopedia/speech-generating-device/` | CRITICAL | — |
| 43 | `/encyclopedia/student-led-transition-planning/` | CRITICAL | description metadata-hard-clamp |
| 44 | `/encyclopedia/transfer-support-school/` | CRITICAL | description metadata-hard-clamp |
| 45 | `/encyclopedia/visual-efficiency-skills/` | CRITICAL | — |
| 46 | `/encyclopedia/wait-time-communication/` | CRITICAL | description metadata-hard-clamp |
| 47 | `/encyclopedia/work-based-learning-disability/` | CRITICAL | description metadata-hard-clamp |
| 48 | `/encyclopedia/worked-examples/` | CRITICAL | — |
| 49 | `/encyclopedia/workplace-readiness-training/` | CRITICAL | — |
| 50 | `/encyclopedia/classroom-acoustics-accessibility/` | CRITICAL | description metadata-hard-clamp |

## Metrics

- PASS: 0/50 pending production correction and live verification.
- FIXED: 0/50 live; fixes are staged only.
- NEEDS_EDITORIAL: 0/50 as primary classification; query-map differentiation and contextual-linking are secondary opportunities.
- BLOCKED: 2/50 due to confirmed concurrent primary-agent writes after lock acquisition.
- CRITICAL: 48/50 as primary classification; the same provenance defect is also present on the 2 blocked rows, but concurrency takes QA ownership precedence.
- Production hard-clamp affects 4/50 titles and 28/50 descriptions.
- Stored truncated title records: 1/50.
- Exact body duplicates at stable snapshot: 0/50.
- Canonical collision rows: 0/50.
- Exact primary-query collision rows: 0/50.
- Body-level contextual-link coverage at stable snapshot: 0/50.
- Exact title-template usage: 49/50 overall; 47/48 among stable non-concurrent rows.
- Exact description-template-prefix usage: 49/50 overall; 47/48 among stable non-concurrent rows.
- Proven sitewide helper defects in this QA batch: reviewer provenance + metadata hard clamp.
- Formal `SYSTEMIC ISSUE` recurrence counter: 1 QA batch; the user-defined 3-batch threshold has not yet been met.

## Validation status

- Local clone/build was unavailable in the QA runtime because external GitHub DNS resolution failed; no local-pass claim is made.
- PR #448 CI is the authoritative validation path.
- Earlier QA heads passed `Cloudflare Workers Validate`; current final-head validation must pass again after removal of the hard clamp.
- `Canonical Ownership Gate` has passed on QA merge candidates and the production unique canonical-owner index exists.
- `Rawafid Quality Gate` has demonstrated passing architecture, preservation, sitemap, content-readiness, typecheck, lint and build on the QA code lineage; the final head still requires its complete run before merge.
- No production deploy was attempted because the primary SEO lock remains active and production content is still changing.

## Exit criteria

Do not mark this batch FIXED/PASS until all of the following are true:

1. Active primary SEO lock is released or replaced by an explicit completed state.
2. The 2 concurrently modified frozen URLs stabilize and are re-audited from their final primary-agent state.
3. QA branch is refreshed against the then-current `main` without conflicting primary-agent changes.
4. Final-head build, lint, typecheck, review-provenance/search-appearance contracts, sitemap/SEO/rich-discovery/content/YMYL gates pass.
5. `postsecondary-disability-services` stored title is corrected without changing its URL or scientific body.
6. Production deploy completes successfully.
7. Live pages confirm no inferred reviewer, valid self-canonical/indexability, complete normalized title/description output, valid JSON-LD, visible FAQ parity, correct OG metadata, Arabic RTL and no regression.

## SYSTEMIC ISSUE status

This is the first independently logged QA batch for the reviewer-provenance and metadata-hard-clamp patterns. Both have sitewide helper scope, but neither is yet eligible for the formal `SYSTEMIC ISSUE` label that requires recurrence across 3 or more audited batches. Continue counting in subsequent QA logs.
