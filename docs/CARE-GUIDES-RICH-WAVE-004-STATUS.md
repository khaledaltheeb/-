# Care Guides rich expansion — Wave 004

## Scope

Wave 004 contains exactly **50 distinct evidence-led search intents** selected from measured zero- and low-coverage taxonomy gaps. It covers 12 cognitive-process guides, 12 motivation/behavior guides, 10 assessment/inclusive-learning guides, 8 communication/hearing/mobility/vision access guides, and 8 self-advocacy/transition/participation guides.

The old `healthrenewal.org` repository remains read-only provenance/content input. This wave is implemented only in the Rawafid V3 repository and Supabase content pipeline.

## Current Supabase checkpoint — 2026-08-16

The live database audit reports:

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
- **0 duplicate reference IDs within a page**
- **0 unresolved claim-source identifiers**
- **0 body-json/body-text heading/paragraph synchronization gaps**
- **0 exact cross-page duplicate substantive paragraphs** in the current automated audit
- SEO descriptions: **150–160 characters** across the 12 current records
- **12/12 use the required central disclaimer route and label**
- row-level `medical_disclaimer` is empty/null across the 12 records

The first 11 records had been grandfathered into an older `published + indexable + publication_ready=true` state before the stricter Wave 004 review policy. The 2026-08-16 quality audit placed those 11 under a conservative hold because they lacked genuine recorded human review and initially sat below the current 3,000-word Wave 004 editorial target.

The hold remains in force even though the quantitative depth floor has now been crossed. Word count and automated evidence checks are not release authorization and do not substitute for rendered-page QA or genuine independent human review.

The hold preserves direct access and existing links while preventing search indexing:

- `robots_index=false`
- `robots_follow=true`
- `schema_json.publication_ready=false`
- `status=published` retained for the 11 previously published records
- canonical URLs retained
- no page deleted or redirected

## Evidence remediation and topic-level audit

The 12 materialized records have now completed the **automated source-layer** audit. This was not a count-inflation exercise: no prose or references were added when the existing evidence already matched the substantive claims. Direct sources were added only where a claim-to-source gap or boundary-condition gap was identified.

### Cognitive flexibility / task switching

`care-guide-cognitive-flexibility-switching-plan` now has:

- **3,973 useful Arabic words**
- **83 structured blocks**
- **11 references**
- **11 claim-to-source mappings**
- **0 duplicate paragraph groups**
- **0 unresolved claim-source identifiers**
- SEO description: **153 characters**
- `published + noindex + follow`
- `publication_ready=false`

The source layer was strengthened around task-switch cost, advance preparation, interruption/resumption and context-dependent flexibility. It explicitly avoids interpreting a laboratory switch-cost measure as a fixed individual diagnosis. The automated evidence audit records the added task-switching/interruption sources and retains `human_review_required=true`.

### Working memory / task breakdown

`care-guide-working-memory-task-breakdown` now has:

- **3,677 useful Arabic words**
- **75 structured blocks**
- **10 references**
- **10 claim-to-source mappings**
- **0 duplicate paragraph groups**
- **0 unresolved claim-source identifiers**
- SEO description: **160 characters**
- `published + noindex + follow`
- `publication_ready=false`

The source layer covers working-memory models, capacity caveats, chunking, external representations and cognitive offloading. The page explicitly avoids turning a laboratory estimate such as an approximate number of chunks into a fixed task-design rule or an informal diagnosis.

### Learning and metacognition pages

- `care-guide-metacognition-study-review-card` — direct judgment-of-learning accuracy evidence plus monitoring/control evidence are mapped; **8 references / 8 claims**.
- `care-guide-retrieval-practice-study-plan` — transfer evidence and a direct boundary-condition study/meta-analysis were added so retrieval practice is not framed as universally superior for every reasoning task; **8 references / 7 claims**.
- `care-guide-spaced-practice-study-calendar` — a direct long-retention study was added to support the point that useful spacing depends on the intended retention interval rather than one universal interval; **7 references / 6 claims**.

No additional prose was required for these evidence-map corrections.

### Attention, executive-function and instruction pages

- `care-guide-cognitive-load-instruction-audit` — direct instructional-material/cognitive-load evidence was rechecked and found adequate; **6 references / 6 claims**.
- `care-guide-inhibitory-control-pause-plan` — inhibition/shifting/updating evidence was rechecked and practical pause/reversibility guidance remains framed as testable design heuristics rather than treatment; **6 references / 6 claims**.
- `care-guide-selective-attention-distraction-audit` — distractor-suppression evidence is supplemented by direct interruption/resumption evidence for the page's return-to-task guidance; **8 references / 7 claims**.
- `care-guide-prospective-memory-external-cues` — prospective-memory implementation-intention and intention-offloading evidence was rechecked and found adequate; **7 references / 7 claims**.
- `care-guide-processing-speed-accuracy-balance` — the speed-accuracy tradeoff is covered by a direct review and remains separated from access/input-time barriers; **6 references / 6 claims**.
- `care-guide-sustained-attention-work-interval` — vigilance-decrement and self-scheduled-break evidence directly cover the substantive work-interval claims; **7 references / 7 claims**.

These pages remain non-indexable and not publication-ready. Automated topic-specific source review is complete; human review is not.

## Page 12 quality checkpoint

`care-guide-dual-task-attention-limit` remains **draft + noindex + follow** and is not counted as published. Current verification returned:

- **3,280 useful Arabic words**
- **61 structured blocks**
- **7 references**
- **5 claim-to-source mappings**
- **0 duplicate paragraph groups**
- **0 unresolved claim-source identifiers**
- SEO description: **153 characters**
- one primary category link
- one unique slug, canonical and primary keyword from the prior collision audit
- `publication_ready=false`
- no fabricated reviewer name, credentials or review date
- exact central disclaimer URL/label
- row-level `medical_disclaimer=null`

The Koch 2018 title is normalized to the exact paper/registry title. `WHO-ICF` reference metadata is also normalized to the single canonical registry representation. The previous disclaimer and SEO-description blockers are closed. Publication remains blocked by independent human scientific/editorial review and final rendered-page QA.

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

Live atomic/boundary tests verified the intended scope:

- restoring a held Wave 004 page to `robots_index=true + publication_ready=true` without reviewer evidence is rejected;
- an indexable Wave 003 V8 record with no named reviewer remains valid under its documented automated V8 policy;
- an indexable V7 record without V8 `publication_ready` metadata remains grandfathered rather than being frozen by a retroactive contract;
- changing an already-indexable V8 Care Guide from `published` to `draft` while leaving it indexable is rejected.

A broader read-only audit found **269 currently indexable Care Guides** outside the held Wave 004 set: 193 are V7, 75 are V8, and one predates those contract markers. No bulk noindex action was taken against those earlier guides.

## Source registry and provenance reconciliation

`data/migration-batches/care-guides-rich-wave-004.sources.json` is now the consolidated Wave 004 source registry.

Current reconciliation:

- **40 unique Reference IDs** are used by the 12 materialized records;
- the registry retains **52 source records** because it also preserves authoritative sources planned for the remaining 38 intents;
- **0 live Reference IDs are missing from the registry**;
- **0 live Reference IDs have multiple metadata variants**;
- `WHO-ICF` was the only detected metadata-variant case and has been normalized;
- the Koch 2018 record uses the exact paper title with the same PMID.

The dated audit artifact is:

`data/migration-batches/care-guides-rich-wave-004.evidence-audit-2026-08-16.json`

It records the live checkpoint, registry reconciliation and per-page source decisions. It explicitly states:

- `publication_authorization=false`
- `human_review_required=true`

The artifact and the 12 Supabase `schema_json.evidence_audit` records now agree on the final automated source-layer decisions, including the later retrieval-practice, spacing, metacognition, interruption/resumption, task-switching and working-memory additions.

## Structural/current-state audit

Direct Supabase verification across all 12 materialized records found:

- **12/12 at or above 3,000 useful Arabic words**
- **0 duplicate paragraph groups**
- **0 duplicate heading groups**
- **0 duplicate reference-ID groups within pages**
- **0 unresolved claim-source identifiers**
- **0 body-json/body-text heading/paragraph synchronization gaps**
- **0 exact cross-page duplicate substantive paragraph groups**
- exact central disclaimer URL/label on all 12
- row-level disclaimer empty/null on all 12
- all 12 with `robots_index=false`
- all 12 with `publication_ready=false`
- **12/12 with an automated evidence-audit record**
- **12/12 evidence-audit records with `human_review_required=true`**
- **0 evidence-audit records with an unexpected status**

These are structural, provenance and evidence-mapping checks. They do not replace a scientific/editorial reviewer or rendered-page inspection.

## Technical validation

The last fully completed runtime baseline before the final registry/audit/checkpoint reconciliation was head `c6731729d2c4a0a29d0aa2756af6f3485b8a0dfd`, where all required workflows passed:

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

The newest source-registry, evidence-audit and checkpoint commits require a fresh CI cycle against current `main`; the older green result is not treated as validation of the current merge ref.

## Global collision hold

Two existing published primary-keyword conflicts were identified during the earlier Wave 004 audit:

1. `care-guide-gaming-disorder-family-plan` and `gaming-disorder` target **اضطراب الألعاب الرقمية**.
2. `comparisons-anxiety-vs-fear` and `evidence-guides-anxiety-fear-differences-guide` target **الفرق بين القلق والخوف**.

No automatic redirect or canonical change was applied because each cluster needs content comparison and an explicit merge/intent decision.

## Release rule and next work

Listing an intent in the Wave 004 configuration never counts as publication. A Wave 004 page may become indexable only after content depth, intent distinctiveness, authoritative references, claim mapping, SEO, accessibility, canonical uniqueness, rendered-page QA and genuine review evidence all pass.

The automated content-depth, structural, provenance and topic-specific source passes are complete for the 12 materialized records. The next sequence is:

1. run rendered-page QA on the 12 materialized records without changing indexability;
2. obtain genuine independent human scientific/editorial review and record real reviewer evidence;
3. only then make an explicit per-page re-index decision;
4. keep the remaining 38 intents unmaterialized until the current 12-page review queue is controlled.

This pull request remains Draft. Technical CI can validate mechanics, routing, SEO behavior and build integrity, but it cannot authorize Wave 004 YMYL publication or replace the review policy defined for this batch.
