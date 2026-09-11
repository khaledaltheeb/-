# ABI + Inclusive Education Systems — Wave 2 Release Record

Date: 2026-09-11
Production: https://healthrenewal.org

## Outcome

This continuation wave released six new gold-standard Arabic guides across the Acquired Brain Injury and Inclusive Education Systems specialist centers, fixed two release-pipeline defects discovered by the quality gates, prevented one cannibalizing duplicate page, reconciled backlog state, and preserved indexability invariants.

## Production integrity after the wave

- Published content: **8,742**
- Published with `robots_index=false`: **0**
- Published with missing/blank canonical URL: **0**
- `acquired-brain-injury-recovery`: **14** visible published/indexable items
- `inclusive-education-practice-systems`: **20** visible published/indexable items

Anonymous-role verification confirmed all six new rows are visible as `published`, `robots_index=true`, with their expected canonical paths.

External HTTP verification from the execution container could not be completed because that runtime could not resolve `healthrenewal.org`; web search also had not indexed these just-published URLs yet. This is recorded as a verification-environment limitation, not interpreted as a site failure. Database/RLS public-read verification passed.

## New published guides

### 1. Post-traumatic amnesia (PTA)

- slug: `post-traumatic-amnesia-recovery-guide`
- canonical: `/content/post-traumatic-amnesia-recovery-guide`
- Arabic words: 2,903
- H2: 17
- H3: 5
- FAQs: 8
- references: 8
- exact long-paragraph matches: 0
- max title similarity: 0.294118
- max body similarity: 0.462491

Evidence anchors include INCOG 2.0 PTA and overview guidance, ACS early TBI rehabilitation recommendations, Action Collaborative TBI guidance, a PTA severity meta-analysis, a non-pharmacological PTA systematic review, and MSKTC recovery resources.

### 2. Family engagement in inclusive education

- slug: `family-engagement-inclusive-education-system`
- canonical: `/content/family-engagement-inclusive-education-system`
- Arabic words: 2,796
- H2: 19
- H3: 4
- FAQs: 8
- references: 9
- exact long-paragraph matches: 0
- max title similarity: 0.373134
- max body similarity: 0.457930

Evidence anchors include UNICEF caregiver/school guides, UNESCO inclusion and equity guidance, Jordan's inclusion/diversity framework, DISES family-engagement resources including its August 2026 professional-learning activity, and CAST UDL 3.0.

### 3. Attention after acquired brain injury

- slug: `attention-after-acquired-brain-injury`
- canonical: `/content/attention-after-acquired-brain-injury`
- Arabic words: 3,464
- H2: 18
- H3: 5
- FAQs: 8
- references: 7
- exact long-paragraph matches: 0
- max title similarity: 0.292135
- max body similarity: 0.460801

The guide separates attention from processing speed, memory and executive function; covers sleep, fatigue, pain, sensory and medication confounders; emphasizes metacognitive and task-specific strategies; and treats computerized attention training as an adjunct whose real-world transfer must be measured.

### 4. Inclusive academic practices schoolwide

- slug: `inclusive-academic-practices-schoolwide`
- canonical: `/content/inclusive-academic-practices-schoolwide`
- Arabic words: 3,151
- H2: 19
- H3: 5
- FAQs: 8
- references: 9
- exact long-paragraph matches: 0
- max title similarity: 0.284091
- max body similarity: 0.471503

The guide integrates the current High-Leverage Practices framework with UDL 3.0, explicit instruction, scaffolding, flexible grouping, feedback, data-based planning, intervention intensification, accommodations vs modifications, accessibility/assistive technology, collaboration, culture/language and schoolwide quality measurement.

### 5. Processing speed after acquired brain injury

- slug: `processing-speed-after-acquired-brain-injury`
- canonical: `/content/processing-speed-after-acquired-brain-injury`
- Arabic words: 2,854
- H2: 17
- H3: 4
- FAQs: 8
- references: 7
- exact long-paragraph matches: 0
- max title similarity: 0.233129
- max body similarity: 0.476103

The guide distinguishes processing speed from attention, memory, executive and motor demands; includes the speed–accuracy trade-off and measurement impurity problem; incorporates 2026 evidence on white-matter disruption, fatigue/sleep/cognition, and compensatory vs restorative cognitive rehabilitation; and focuses accommodations on functional task demands.

### 6. Inclusive social-emotional-behavioral supports schoolwide

- slug: `inclusive-social-emotional-behavioral-supports-schoolwide`
- canonical: `/content/inclusive-social-emotional-behavioral-supports-schoolwide`
- Arabic words: 2,991
- H2: 19
- H3: 4
- FAQs: 8
- references: 8
- exact long-paragraph matches: 0
- max title similarity: 0.361446
- max body similarity: 0.466442

The guide integrates HLP behavior/academic practices, PBIS Tier 1/2/3, FBA, positive feedback, belonging, exclusionary-discipline reduction, implementation fidelity, educator support systems, mental-health boundaries, family/student partnership, culture/equity and a schoolwide continuous-improvement dashboard. It preserves the evidence boundary: current review evidence supports a positive association between Tier 1 PBIS fidelity and lower exclusionary discipline for students with disabilities, but does not justify a universal causal claim.

## Total new editorial depth

The six guides add **18,159 Arabic words** of original, structured, source-linked content. Each page passed the duplicate/cannibalization preflight and the production V6 release gate.

## Release-pipeline fixes discovered by the gates

### Gold-standard guide publisher
Migration: `20260911130525_gold_standard_guide_publisher_v1`

Created `private.publish_gold_standard_guide_v1(...)`, service-role only. It performs slug/canonical/primary-keyword collision checks, structural depth checks, exact long-paragraph duplicate detection and corpus-wide title/body similarity checks before the normal production V6 release gate runs.

Repository commit: `01ffa9dd6ae7204283a9a1701491195d67ea788c`

### Exact word-count parity with V6
Migration: `20260911132215_gold_standard_guide_publisher_v1_word_count_parity`

A first attention-page attempt exposed that the publisher's Arabic token counter was more permissive than the V6 release gate. The page was blocked before publication. The publisher was corrected to use the exact same whitespace-token definition as V6, eliminating the possibility of a preflight/pass + V6/fail mismatch for minimum depth.

Repository commit: `52f526241359f3781967950328bfa962a213bff7`

### False-positive warning-language guard
Migration: `20260911132550_fix_v6_warning_language_false_positive`

A second attention-page attempt exposed a V6 false positive: any normal prose occurrence of the Arabic word `تنبيه` was being treated as a forbidden local warning/disclaimer. The guard was narrowed to structural warning/disclaimer headings while retaining the existing prohibition on warning/danger callout blocks and preserving the centralized disclaimer policy.

Repository commit: `8e0849c28c6a5a017adc28c942dd1f437c39ed31`

## Backlog decisions

- `inclusive-school-leadership-implementation` was reconciled from stale `ready` state to `published` because the live canonical had already been released in Wave 1.
- `abi-recovery-continuum-hospital-home-community` was changed to `merged / overlap` rather than authored as a new page. Its proposed intent substantially overlaps existing `rehabilitation-care-pathway`, so future work should enrich/crosslink the existing canonical instead of creating an SEO competitor.

## Security review

Supabase security advisor was rerun after the DDL changes. No new advisor category attributable to the new publisher or V6 fix appeared. Existing older findings remain in unrelated API/automation/source-registry/Auth areas and require separate least-privilege review rather than blind modification during an editorial wave.

## Remaining protected boundary

The pediatric-oncology terminology-only correction tracked in GitHub issue #857 remains intentionally protected by the reviewed pediatric-oncology revision/release-token workflow. No release guard was bypassed and no human/evidence-review attestation was fabricated.
