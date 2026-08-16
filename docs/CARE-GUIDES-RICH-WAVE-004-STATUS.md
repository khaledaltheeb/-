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
- **12/12 without a recorded human review date**
- content depth across the 12 records: **2,508–3,280 useful Arabic words** using the release-gate counting method
- references: **5–7 per page**
- claim-to-source mappings: **5–6 per page**
- **12/12 use the required central disclaimer route and label**

The first 11 records were grandfathered into an older `published + indexable + publication_ready=true` state before the current strict Wave 004 review policy. A 2026-08-16 audit found that all 11 lacked a recorded human reviewer/date and remained below the project's current 3,000-word Wave 004 editorial target at **2,508–2,606 useful Arabic words**.

The current V6+/V8 release contract intentionally uses the central `/disclaimer` surface and requires row-level `medical_disclaimer` to remain empty for release. Therefore, an empty `medical_disclaimer` is **not** treated as a defect. All 12 Wave 004 records already carry the exact central disclaimer URL and label; page 12 still contains a legacy row-level disclaimer value that must be cleared during remediation before any release attempt.

A conservative quality hold was applied in Supabase to the 11 grandfathered Wave 004 records:

- `robots_index=false`
- `robots_follow=true`
- `schema_json.publication_ready=false`
- `status=published` retained
- canonical URLs retained
- no page deleted or redirected

This preserves direct access and existing links while preventing search indexing until each page is substantively remediated and receives the genuine human scientific/editorial review required specifically for Wave 004. The hold is a safety correction, not a final quality sign-off and not a substitute for review.

## Database enforcement added and scoped

Three Supabase migrations are applied and mirrored in this branch:

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

The guard **does not invent or retroactively impose a human-reviewer requirement on Wave 001–003**. Wave 003's documented release policy explicitly distinguishes automated/source-backed publication from a claim of specialist human clinical sign-off, and the guard now preserves that contract.

### Wave 004 stricter release policy

Wave 004 deliberately adds a stricter re-index/readiness gate. Before any Wave 004 record can become ready/indexable it requires:

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

A broader read-only audit found **269 currently indexable Care Guides** outside the held Wave 004 set: 193 are V7, 75 are V8, and one predates those contract markers. The audit was used to prevent Wave 004's stricter human-review rule from being incorrectly generalized to earlier release contracts; no bulk noindex action was taken against those earlier guides.

## Page 12 quality checkpoint

`care-guide-dual-task-attention-limit` remains **draft + noindex + follow** and is not counted as published. Database verification returned:

- 3,280 useful Arabic words
- 61 structured blocks
- 29 substantive paragraphs
- 8 topic-specific FAQs
- 7 unique references
- 5 claim-to-source mappings
- one primary category link
- one unique slug, canonical and primary keyword
- `publication_ready=false`
- no fabricated reviewer name, credentials or review date
- the correct central disclaimer URL/label
- one legacy row-level `medical_disclaimer` value that must be cleared before release under the current central-disclaimer contract

The content distinguishes simultaneous activity, task switching and interruption; explains bottlenecks, reconfiguration and resumption costs cautiously; and provides education, workplace, family, service, accessibility and safety applications. Publication remains blocked pending an independent human scientific review, final rendered-page QA, and clearance of the obsolete row-level disclaimer field.

## Source and originality controls

The source registry includes the integrative multitasking review, a task-switching/dual-tasking meta-analysis, Pashler's dual-task interference review, an academic media-multitasking review, the Sana classroom experiment, CAST UDL 3.0 and WHO ICF.

The local page audit for page 12 found:

- 1,626 unique normalized tokens
- lexical diversity 0.496
- no exact duplicate paragraphs
- no repeated five-word sequence
- no unresolved claim-source identifiers
- no placeholders

These automated measures support originality and structure; they do not replace scientific or editorial review.

## Global collision hold

Two existing published primary-keyword conflicts were identified during the earlier Wave 004 audit:

1. `care-guide-gaming-disorder-family-plan` and `gaming-disorder` target **اضطراب الألعاب الرقمية**.
2. `comparisons-anxiety-vs-fear` and `evidence-guides-anxiety-fear-differences-guide` target **الفرق بين القلق والخوف**.

No automatic redirect or canonical change was applied because each cluster needs content comparison and an explicit merge/intent decision.

## Release rule and next work

Listing an intent in this configuration never counts as publication. A Wave 004 page may become indexable only after content depth, intent distinctiveness, authoritative references, claim mapping, SEO, accessibility, canonical uniqueness, rendered-page QA and genuine review evidence all pass.

For the 11 held Wave 004 pages, the next sequence is: substantive evidence-led remediation without filler, completion of the current Wave 004 requirements, rendered-page QA, genuine human scientific/editorial review, and only then an explicit re-index decision. Raising word count alone is insufficient.

For page 12, publication remains blocked by the same Wave 004 human-review and rendered-QA requirements plus cleanup of the obsolete row-level disclaimer field. The remaining 38 intents stay unmaterialized until the remediation queue is under control; planning records must not be treated as published content.

This pull request remains Draft. Technical CI may validate mechanics and SEO behavior, but it cannot authorize Wave 004 YMYL publication or replace the review policy defined for this batch.
