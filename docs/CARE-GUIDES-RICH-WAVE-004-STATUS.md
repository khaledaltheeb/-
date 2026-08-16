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
- content depth across the 12 records: **2,509–3,280 Arabic words**
- references: **5–7 per page**

The first 11 records were grandfathered into an older `published + indexable + publication_ready=true` state before the current strict YMYL/editorial gate. A 2026-08-16 audit found that all 11 lacked a recorded human reviewer/date, lacked a medical disclaimer, and remained below the project's current 3,000-word editorial target at **2,509–2,614 words**.

A conservative quality hold was therefore applied in Supabase to those 11 records:

- `robots_index=false`
- `robots_follow=true`
- `schema_json.publication_ready=false`
- `status=published` retained
- canonical URLs retained
- no page deleted or redirected

This preserves direct access and existing links while preventing search indexing until each page is substantively remediated and receives genuine human scientific/editorial review. The hold is a safety correction, not a final quality sign-off and not a substitute for review.

## Page 12 quality checkpoint

`care-guide-dual-task-attention-limit` remains **draft + noindex + follow** and is not counted as published. Database verification returned:

- 3,280 body words
- 61 structured blocks
- 29 substantive paragraphs
- 8 topic-specific FAQs
- 7 unique references
- 5 claim-to-source mappings
- one primary category link
- one unique slug, canonical and primary keyword
- `publication_ready=false`
- no fabricated reviewer name, credentials or review date

The content distinguishes simultaneous activity, task switching and interruption; explains bottlenecks, reconfiguration and resumption costs cautiously; and provides education, workplace, family, service, accessibility and safety applications. Publication remains blocked pending an independent human scientific review and final rendered-page QA.

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

For the 11 held pages, the next sequence is: substantive evidence-led remediation without filler, completion of the current YMYL requirements, rendered-page QA, genuine human scientific/editorial review, and only then an explicit re-index decision. Raising word count alone is insufficient.

For page 12, publication remains blocked by the same human-review and rendered-QA requirements. The remaining 38 intents stay unmaterialized until the remediation queue is under control; planning records must not be treated as published content.

This pull request remains Draft. Technical CI may validate mechanics and SEO behavior, but it cannot authorize YMYL publication or replace human review.
