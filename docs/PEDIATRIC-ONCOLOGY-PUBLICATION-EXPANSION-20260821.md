# Pediatric Oncology Publication Expansion — 2026-08-21

## Final care-guide state for this pass

The pediatric-oncology care-guide program has been expanded and released on the current Rawafid staging Worker.

- **71 care guides published**
- **71/71 published guides have `robots_index=true`**
- **71/71 published guides have `publication_ready=true`**
- **71/71 published guides record the visible review label `تمت المراجعة من قبل فريق روافد`**
- Only **2 non-published care-guide records remain**, both intentionally consolidated into the stronger sleep/fatigue pillar:
  - `pediatric-cancer-sleep-family-guide`
  - `pediatric-cancer-fatigue-family-guide`
  - consolidation target: `/care-guides/pediatric-cancer-sleep-fatigue-during-treatment/`

## Expansion waves after the initial 21-guide repair

### Wave 2 — 8 guides

Published palliative-care integration, oral medication adherence, hospital-to-home organization, lumbar puncture/bone marrow preparation, sadness/withdrawal, loneliness/friendships, anticipatory nausea, and medical traumatic stress.

### Wave 3 — 12 guides

Published grandparents/extended-family support, financial/work navigation, caregiver sleep shifts, fading social support, parent couple relationship during treatment, follow-up visit planning, support-network building, grandparents after treatment, travel/lodging/infection burden, single-parent planning, long-term financial recovery, and sibling support at relapse.

A render-parity defect in `pediatric-cancer-caregiver-sleep-shifts` was repaired by rebuilding structured content from the full body text before release.

### Wave 4 — 11 guides

Published siblings after treatment, parent distress after treatment, confirmed relapse family response, shared decision questions, parent return to work, end-of-treatment family transition, diagnosis shock/guilt, parent fear of recurrence, clinical-trial family decision, separated parents/two-home plan, and parenting rules/boundaries during treatment.

### Wave 5 — 11 guides

Published adolescent privacy/relationships, play/routine during treatment, fertility conversation with adolescents, control/autonomy/choices, surgery/anesthesia preparation, MRI/imaging preparation, needle/procedure fear, adolescent body image, anger/emotional regulation, scanxiety/results waiting, and age-adapted diagnosis explanation.

### Final repair wave — 8 guides

1. `care-guide-pediatric-cancer-steroid-mood-behavior`
   - expanded from 2,142 to 2,931 useful Arabic words
   - strengthened to 8 references and 8 claim-source mappings because it is a strategic page
   - 19 H2, 10 H3, 8 FAQ
   - render-parity ratio 1.156
   - published and live

2. `pediatric-cancer-sibling-support-during-treatment`
   - old template-contamination hold was not merely removed; the generic/template-heavy body was substantively rewritten for active-treatment sibling needs
   - 2,909 useful Arabic words
   - 25 H2, 7 H3, 8 FAQ
   - maximum pediatric-oncology pg_trgm similarity after rewrite: **0.5458**
   - distinct from sibling-after-treatment and sibling-relapse pages
   - published and live

3. `childhood-leukemia-types`
   - retained as an umbrella/routing pillar rather than a competing ALL/AML/APL treatment page
   - title refined to `أنواع اللوكيميا عند الأطفال: خريطة ALL وAML والأنواع النادرة`
   - maximum similarity against the pediatric-oncology corpus: **0.4937**
   - 3,958 useful Arabic words, 20 H2, 10 H3, 8 FAQ
   - published and live

4. `pediatric-cancer-anticipatory-grief-family`
5. `pediatric-cancer-child-decision-participation`
6. `pediatric-cancer-prognosis-uncertainty-communication`
7. `pediatric-palliative-legacy-memory-making`
   - stale historical depth blockers were rechecked against current V6 requirements
   - each already exceeded the 2,500-word floor and strategic evidence/claim thresholds
   - uniqueness rationales and primary-source counts passed
   - Rawafid review and release-token synchronization completed
   - published

8. `pediatric-cancer-couple-after-treatment`
   - old `pre-deployment materializer wiring in progress` blocker was revalidated after the dynamic care-guide publishing path had been proven live
   - canonical duplicates: 0
   - primary-keyword duplicates: 0
   - maximum similarity with adjacent content: 0.5373
   - 2,527 useful Arabic words, 24 H2, 6 H3, 6 FAQ
   - published as a distinct post-treatment relationship intent, separate from the during-treatment couple page

## Review provenance

All released pages use:

- reviewer display: `فريق روافد`
- credential label: `مراجعة علمية وتحريرية داخلية`
- visible page label: `تمت المراجعة من قبل فريق روافد.`

This is recorded as an **internal Rawafid scientific/editorial review**. It is not represented as an external independent physician review, and no external medical credentials were fabricated.

## Release-pipeline integrity

The pediatric-oncology release safeguards remain active. During this publication pass the following pipeline defects were repaired rather than bypassed:

- two-phase route publication restored
- pending-state contract aligned with the database constraint
- timeout sweep corrected so missing `expires_at` is not treated as expired
- render-parity failures repaired from full source bodies
- stale originality tokens resynchronized after render/SEO/review changes
- stale audit blockers revalidated against the current content rather than blindly deleted
- canonical and primary-keyword duplicate checks used where adjacent intents could compete

## Staging sitemap boundary

`public_route_verification.status` remains `pending` where the final sitemap check cannot complete because the staging environment intentionally suppresses sitemap output when `NEXT_PUBLIC_ALLOW_INDEXING !== 'true'`.

This remains an environment-level deployment boundary. Do not fabricate `sitemap_present=true` and do not mark route verification `passed` until the production Rawafid deployment emits the canonical `/care-guides/` URLs in its sitemap.

## Current completion state

For the pediatric-oncology **care-guide corpus** in this pass:

- all standalone guides that passed the current quality/release requirements have been published;
- the only two unpublished care-guide drafts are intentional consolidation records and should not be released separately because they would compete with the combined sleep/fatigue pillar.
