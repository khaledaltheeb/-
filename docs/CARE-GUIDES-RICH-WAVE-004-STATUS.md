# Care Guides rich expansion — Wave 004

## Scope

Wave 004 is a 50-intent expansion selected from measured zero- and low-coverage taxonomy gaps in Rawafid. The largest initial gaps were `knowledge/cognitive-processes` and `knowledge/motivation-behavior`, both of which had **zero published guides** before this wave. The remaining intents extend educational assessment, inclusive learning, communication access, mobility/vision access, self-advocacy and transition without repeating existing Wave 003 pages.

The old `healthrenewal.org` repository remains read-only provenance/content input. This wave is implemented only in the new Rawafid V3 repository and Supabase content pipeline.

## Current Supabase publication checkpoint — 2026-08-15

**5 of 50 candidates are published + indexable + `publication_ready=true`.**

Published canonicals:

1. `/care-guides/working-memory-task-breakdown/`
2. `/care-guides/cognitive-flexibility-switching-plan/`
3. `/care-guides/inhibitory-control-pause-plan/`
4. `/care-guides/sustained-attention-work-interval/`
5. `/care-guides/selective-attention-distraction-audit/`

The live database audit after publishing the fifth page returned:

- 5/5 Wave 004 records `published`
- 5/5 `robots_index=true`
- 5/5 `publication_ready=true`
- Arabic depth: **2,508–2,606 words per page**
- references: **5 per page**
- SEO descriptions: **152–160 characters**
- **0 duplicate published/indexable canonicals across the site**

## Editorial distinction of the first five

- **Working memory / task breakdown** externalizes multi-step state, decision boundaries, resume points and handoffs rather than diagnosing memory.
- **Cognitive flexibility / switching** separates planned transitions, rule changes, interruptions and return-to-plan costs.
- **Inhibitory control / pause plan** models `signal → short pause → alternative response` and audits whether the environment makes the better action usable.
- **Sustained attention / work interval** calibrates work and rest around task type and observed quality, not a universal timer rule.
- **Selective attention / distraction audit** separates auditory, visual, digital, social, task-ambiguity and internal competition, then tests one environmental change at a time.

These pages intentionally avoid converting cognitive constructs into individual diagnoses. They describe observable tasks, environments and supports, with specialist assessment left to qualified professionals when broader impairment or clinical concerns exist.

## Wave 004 plan

The configuration contains exactly **50 distinct intents**:

- 12 cognitive-process guides
- 12 motivation/behavior guides
- 10 assessment/inclusive-learning guides
- 8 communication/hearing/mobility/vision access guides
- 8 self-advocacy/transition/participation guides

A direct collision check against current slugs, canonicals and primary keywords returned zero collisions. Three initially close intents were replaced before the configuration was committed to prevent semantic competition with existing AAC, UDL-autonomy and school-to-university pages.

## Source policy

The source registry combines official frameworks/standards (CAST UDL 3.0, WHO ICF, UN CRPD, UNICEF, ASHA, WHO hearing/wheelchair guidance, W3C WCAG 2.2) with peer-reviewed reviews/meta-analyses for executive functions, cognitive load, retrieval practice, spacing, self-determination, self-efficacy, implementation intentions and reward effects.

Each page must independently pass the V8 database release gate before promotion. Listing an intent in the configuration does not count it as published.

## Next

Continue cognitive-process pages 6–12, then open the motivation/behavior gap. The pull request remains draft until the entire 50-page wave is complete and the final repository/CI checkpoint is green.
