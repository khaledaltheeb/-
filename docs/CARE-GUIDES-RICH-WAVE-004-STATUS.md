# Care Guides rich expansion — Wave 004

## Scope

Wave 004 contains exactly **50 distinct evidence-led search intents** selected from measured zero- and low-coverage taxonomy gaps. It covers 12 cognitive-process guides, 12 motivation/behavior guides, 10 assessment/inclusive-learning guides, 8 communication/hearing/mobility/vision access guides, and 8 self-advocacy/transition/participation guides.

The old `healthrenewal.org` repository remains read-only provenance/content input. This wave is implemented only in the Rawafid V3 repository and Supabase content pipeline.

## Current Supabase checkpoint — 2026-08-16

The live database audit reports:

- **12/50 records materialized**
- **11 published + indexable**
- **1 draft + noindex**: `/care-guides/care-guide-dual-task-attention-limit/`
- **38 not yet materialized**
- **11 records marked `publication_ready=true`**
- **12/12 without a recorded human review date**
- content depth across the 12 records: **2,509–3,280 Arabic words**
- references: **5–7 per page**
- **0 duplicate published/indexable canonicals site-wide**
- **2 duplicate published primary-keyword clusters site-wide**, both outside the new page and requiring an editorial merge/canonical decision

The 11 already-published records are below the project's current strict 3,000-word editorial target (2,509–2,614 words). They are therefore a remediation queue, not claimed as fully compliant with the stricter target. They must be enriched without filler and receive a genuine human scientific review before a final quality sign-off.

## Page 12 quality checkpoint

`care-guide-dual-task-attention-limit` was created as **draft + noindex + follow** and is not counted as published. Database verification returned:

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

The source registry now includes the integrative multitasking review, a task-switching/dual-tasking meta-analysis, Pashler's dual-task interference review, an academic media-multitasking review, the Sana classroom experiment, CAST UDL 3.0 and WHO ICF.

The local page audit found:

- 1,626 unique normalized tokens
- lexical diversity 0.496
- no exact duplicate paragraphs
- no repeated five-word sequence
- no unresolved claim-source identifiers
- no placeholders

These automated measures support originality and structure; they do not replace scientific or editorial review.

## Global collision hold

Two existing published primary-keyword conflicts were found:

1. `care-guide-gaming-disorder-family-plan` and `gaming-disorder` target **اضطراب الألعاب الرقمية**.
2. `comparisons-anxiety-vs-fear` and `evidence-guides-anxiety-fear-differences-guide` target **الفرق بين القلق والخوف**.

No automatic redirect or canonical change was applied because each cluster needs content comparison and an explicit merge/intent decision.

## Release rule and next work

Listing an intent in this configuration never counts as publication. A page may be promoted only after content depth, intent distinctiveness, authoritative references, claim mapping, SEO, accessibility, canonical uniqueness, rendered-page QA and genuine review evidence all pass.

Next: remediate the first 11 cognitive-process pages to the strict editorial target, obtain human review evidence, then continue the motivation/behavior group. This pull request remains Draft until all 50 pages and the final CI checkpoint pass.
