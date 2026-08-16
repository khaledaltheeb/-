# Care Guides rich expansion — Wave 004

## Scope

Wave 004 contains exactly **50 distinct evidence-led search intents** selected from measured zero- and low-coverage taxonomy gaps. It covers 12 cognitive-process guides, 12 motivation/behavior guides, 10 assessment/inclusive-learning guides, 8 communication/hearing/mobility/vision access guides, and 8 self-advocacy/transition/participation guides.

The old `healthrenewal.org` repository remains read-only provenance/content input. This wave is implemented only in the Rawafid V3 repository and Supabase content pipeline.

## Current Supabase checkpoint — 2026-08-16

The live database audit now reports:

- **12/50 records materialized**
- **11 published + noindex + follow under a quality hold**
- **1 draft + noindex + follow**: `/care-guides/care-guide-dual-task-attention-limit/`
- **38 not yet materialized**
- **0 indexable Wave 004 records**
- **0 records marked `publication_ready=true`**
- **0/12 with a recorded human reviewer, reviewer credentials or review date**
- **12/12 with an explicit automated evidence-audit record and `human_review_required=true`**
- content depth across the 12 records: **3,020–3,973 useful Arabic words** using the release-gate counting method
- references: **6–11 per page**
- claim-to-source mappings: **5–11 per page**
- **0 duplicate paragraph groups**
- **0 duplicate heading groups**
- **0 duplicate reference IDs**
- **0 unresolved claim-source identifiers**
- **0 body-json/body-text heading/paragraph synchronization gaps**
- **0 exact cross-page duplicate substantive paragraphs** in the current automated audit
- SEO descriptions: **150–160 characters** across the 12 current records
- **12/12 use the required central disclaimer route and label**
- row-level `medical_disclaimer` is empty/null across the 12 records, as required by the central-disclaimer contract

The first 11 records had been grandfathered into an older `published + indexable + publication_ready=true` state before the stricter Wave 004 review policy. The 2026-08-16 quality audit placed those 11 under a conservative hold because they lacked genuine recorded human review and initially sat below the current 3,000-word Wave 004 editorial target.

The hold remains in force even though the current quantitative depth floor has now been crossed. Word count and automated evidence checks are not release authorization and do not substitute for rendered-page QA or genuine independent human review.

The hold preserves direct access and existing links while preventing search indexing:

- `robots_index=false`
- `robots_follow=true`
- `schema_json.publication_ready=false`
- `status=published` retained for the 11 previously published records
- canonical URLs retained
- no page deleted or redirected

## Remediation progress

### Cognitive flexibility / task switching

`care-guide-cognitive-flexibility-switching-plan` received focused evidence-led remediation rather than word-count padding. The current record is:

- **3,973 useful Arabic words**
- **83 structured blocks**
- **11 references**
- **11 claim-to-source mappings**
- **0 duplicate paragraph groups**
- **0 unresolved claim-source identifiers**
- SEO description: **153 characters**
- `published + noindex + follow`
- `publication_ready=false`
- no reviewer identity, credentials or review date fabricated

The evidence layer covers switch cost, advance preparation, interruption/resumption, contextual flexibility and the limits of treating laboratory switch-cost measures as an individual diagnosis. Its automated source-layer audit is recorded as complete while retaining `human_review_required=true`.

### Working memory / task breakdown

`care-guide-working-memory-task-breakdown` was strengthened after a concurrent expansion had already pushed it beyond 3,000 words. The source remediation targeted the actual evidence gap—working-memory models, capacity caveats, chunking, external representations and cognitive offloading—rather than adding generic prose. The current record is:

- **3,677 useful Arabic words**
- **75 structured blocks**
- **10 references**
- **10 claim-to-source mappings**
- **0 duplicate paragraph groups**
- **0 unresolved claim-source identifiers**
- SEO description: **160 characters**
- `published + noindex + follow`
- `publication_ready=false`
- no reviewer identity, credentials or review date fabricated

The page explicitly avoids turning a laboratory estimate such as an approximate number of chunks into a fixed design rule or an informal diagnosis. Its current source layer includes direct working-memory models, chunking evidence, external-representation evidence and a 2026 cognitive-offloading meta-analysis.

### Remaining materialized records

The previous nine-page evidence-audit queue is now closed at the **automated source-layer** level. It was not closed by accepting generic references: direct topic-specific evidence was added where the audit found a weak match.

The following pages received source strengthening in Supabase:

- `care-guide-cognitive-load-instruction-audit` — direct instructional-material/cognitive-load review added
- `care-guide-inhibitory-control-pause-plan` — inhibition/shifting/updating meta-analysis added
- `care-guide-metacognition-study-review-card` — metacognitive judgment-of-learning meta-analysis added
- `care-guide-processing-speed-accuracy-balance` — direct speed-accuracy review added
- `care-guide-prospective-memory-external-cues` — intention-offloading review and prospective-memory implementation-intention meta-analysis added
- `care-guide-selective-attention-distraction-audit` — direct distractor-suppression review added
- `care-guide-sustained-attention-work-interval` — vigilance meta-analysis and self-scheduled-breaks study added

`care-guide-retrieval-practice-study-plan` and `care-guide-spaced-practice-study-calendar` were reviewed against their existing retrieval-practice, spacing, applied-classroom and UDL evidence; no extra source was added merely to increase counts.

Across the complete 12-page materialized set, the live database now has **6–11 references** and **5–11 claim-source mappings** per page, with zero unresolved source IDs. Every page retains `human_review_required=true` in the automated evidence-audit record.

## Page 12 quality checkpoint

`care-guide-dual-task-attention-limit` remains **draft + noindex + follow** and is not counted as published. Current verification returned:

- **3,280 useful Arabic words**
- **61 structured blocks**
- **7 references**
- **5 claim-to-source mappings**
- **0 duplicate paragraph groups**
- **0 unresolved claim-source identifiers**
- SEO description repaired from 128 to **153 characters**
- one primary category link
- one unique slug, canonical and primary keyword from the prior collision audit
- `publication_ready=false`
- no fabricated reviewer name, credentials or review date
- exact central disclaimer URL/label
- row-level `medical_disclaimer` cleaned to `null`

The Koch 2018 reference title was normalized to the exact registry/paper title during the final source-layer audit. The previous row-level disclaimer blocker is closed. Publication remains blocked by independent human scientific/editorial review and final rendered-page QA.

## Database enforcement added and scoped

Three Supabase migrations are applied and mirrored in repository history:

1. `20260816105700_care_guides_indexability_review_guard`
2. `20260816105934_care_guides_indexability_state_invariants`
3. `20260816110822_scope_care_guides_v8_and_wave004_review_policy`

The third migration is the effective policy refinement. It corrects an over-broad intermediate reviewer requirement after auditing the documented V8 policy for earlier waves.

### Generic V8+ Care Guide invariants

For Care Guides using content contract V8 or later:

- an indexable record must remain `status=published`;
- an indexable record must remain `publication_ready=true`;
- activation/readiness and release-schema changes must preserve the exact central disclaimer contract;
- row-level `medical_disclaimer` must remain empty under that central-disclaimer model.

Older V7 records are not retroactively forced into V8 `publication_ready` metadata by this guard.

The guard **does not invent or retroactively impose a human-reviewer requirement on Wave 001–003**. Wave 003's documented release policy explicitly distinguishes automated/source-backed publication from a claim of specialist human clinical sign-off, and the guard preserves that contract.

### Wave 004 stricter release policy

Before any Wave 004 record can become ready/indexable it requires:

- a recorded human reviewer;
- reviewer credentials;
- a recorded review date that is not in the future;
- an independent reviewer distinct from the visible author;
- at least **3,000 useful Arabic words**;
- at least **5 references**;
- at least **5 claim-to-source mappings**;
- the V8 central disclaimer contract and empty row-level `medical_disclaimer`.

These Wave 004 minimums are revalidated when body text, references, review metadata or release schema change while a Wave 004 record is ready/indexable.

Live transaction-scoped/atomic tests verified the intended boundaries:

- restoring a held Wave 004 page to `robots_index=true + publication_ready=true` without a reviewer is rejected;
- an indexable Wave 003 V8 record with no named reviewer remains valid under its documented automated V8 policy;
- an indexable V7 record without V8 `publication_ready` metadata remains grandfathered rather than being frozen by a retroactive contract;
- changing an already-indexable V8 Care Guide from `published` to `draft` while leaving it indexable is rejected.

A broader read-only audit found **269 currently indexable Care Guides** outside the held Wave 004 set: 193 are V7, 75 are V8, and one predates those contract markers. No bulk noindex action was taken against those earlier guides.

## Source and originality controls

The Wave 004 source registry contains the shared official/institutional framework and peer-reviewed evidence used by the batch. Focused task-switching/interruption and working-memory sources were already mirrored into that registry during the concurrent remediation pass.

The additional sources applied during the final page-level source audit are recorded separately and reproducibly in:

`data/migration-batches/care-guides-rich-wave-004.evidence-audit-2026-08-16.json`

That audit artifact records nine direct topic-specific sources and the per-page decisions that used them. It is explicitly marked `publication_authorization=false` and `human_review_required=true`.

Automated current-state checks across all 12 materialized Wave 004 records found:

- **12/12 at or above 3,000 useful Arabic words**
- **0 duplicate paragraph groups**
- **0 duplicate heading groups**
- **0 duplicate reference IDs**
- **0 unresolved claim-source identifiers**
- **0 body-json/body-text text-block synchronization gaps**
- **0 exact cross-page duplicate substantive paragraphs**
- exact central disclaimer URL/label on all 12
- row-level disclaimer empty/null on all 12
- all 12 with `robots_index=false`
- all 12 with `publication_ready=false`
- all 12 with an automated evidence-audit record
- all 12 still requiring human review

These are structural, provenance and evidence-mapping checks. They do not replace a scientific/editorial reviewer or rendered-page inspection.

## Technical validation

The last fully completed technical baseline before the latest evidence-audit/document commits was head `c6731729d2c4a0a29d0aa2756af6f3485b8a0dfd`, where all required workflows passed:

- Validate Legacy Migration Payload: success
- Care Guides Legacy Inventory: success
- Cloudflare Workers Validate: success
- Rawafid Quality Gate: success
- Production HTTP smoke: success
- Full sitemap SEO audit: **1,950 sitemap URLs / 2,080 unique internal links / 0 failures**
- Lighthouse performance: **0.89 / 0.88 / 0.89**, median **0.89**
- Accessibility / Best Practices / SEO: **1.00** on all three Lighthouse runs
- CLS: **0** on all three runs

The sitemap count is exactly 11 lower than the pre-hold baseline of 1,961, confirming that the 11 held pages were excluded from the sitemap after `robots_index=false` was applied.

The latest evidence-audit artifact and checkpoint commit require a fresh CI cycle against the repository's current `main`; the earlier green result must not be treated as validation of a newer merge ref.

## Global collision hold

Two existing published primary-keyword conflicts were identified during the earlier Wave 004 audit:

1. `care-guide-gaming-disorder-family-plan` and `gaming-disorder` target **اضطراب الألعاب الرقمية**.
2. `comparisons-anxiety-vs-fear` and `evidence-guides-anxiety-fear-differences-guide` target **الفرق بين القلق والخوف**.

No automatic redirect or canonical change was applied because each cluster needs content comparison and an explicit merge/intent decision.

## Release rule and next work

Listing an intent in this configuration never counts as publication. A Wave 004 page may become indexable only after content depth, intent distinctiveness, authoritative references, claim mapping, SEO, accessibility, canonical uniqueness, rendered-page QA and genuine review evidence all pass.

The automated content-depth, structural, provenance and topic-specific evidence-source passes are now complete for the 12 materialized records. The next sequence is:

1. run rendered-page QA on the 12 materialized records without changing their indexability;
2. obtain genuine independent human scientific/editorial review and record real reviewer evidence;
3. only then make an explicit per-page re-index decision;
4. keep the remaining 38 intents unmaterialized until the current 12-page review queue is controlled.

This pull request remains Draft. Technical CI can validate mechanics, routing, SEO behavior and build integrity, but it cannot authorize Wave 004 YMYL publication or replace the review policy defined for this batch.
