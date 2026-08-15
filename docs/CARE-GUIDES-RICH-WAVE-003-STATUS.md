# Care Guides rich expansion — Wave 003

## Scope

Wave 003 is fixed at **50 distinct search intents** selected from measured low-coverage taxonomy gaps rather than arbitrary article ideas. The batch spans trainee/volunteer practice, Universal Design for Learning and accessibility, withdrawal-care navigation and evidence governance, and OCD-related practical navigation.

The legacy `khaledaltheeb/healthrenewal.org` repository remains a read-only content/provenance source. No legacy runtime, theme, CSS, layout or deployment code is copied into Rawafid V3.

## Current release state — 2026-08-15

**30 of 50 candidates are published + indexable in Supabase.** The remaining 20 are not counted as published until they independently pass the V8 database release gate.

This is not a simple first-30 sequence. The database currently contains the first 25 configured intents plus five later volunteer-governance intents that were completed early: handover continuity, feedback conversation, trainee learning objectives, boundary-breach response, and safeguarding information minimization.

### Published canonicals

1. `/care-guides/volunteer-role-boundaries-support/`
2. `/care-guides/trainee-confidentiality-consent-practice/`
3. `/care-guides/volunteer-dual-relationship-boundaries/`
4. `/care-guides/volunteer-ethical-notes-recording/`
5. `/care-guides/trainee-first-supervision-meeting/`
6. `/care-guides/supervision-escalation-decision-map/`
7. `/care-guides/competency-before-independent-task/`
8. `/care-guides/safeguarding-concern-reporting-volunteer/`
9. `/care-guides/volunteer-digital-privacy-messaging/`
10. `/care-guides/photo-story-consent-volunteer/`
11. `/care-guides/volunteer-onboarding-quality-checklist/`
12. `/care-guides/volunteer-incident-learning-review/`
13. `/care-guides/reflective-practice-learning-log-trainee/`
14. `/care-guides/field-competency-observation-checklist/`
15. `/care-guides/psychological-first-aid-not-therapy/`
16. `/care-guides/volunteer-crisis-referral-boundaries/`
17. `/care-guides/volunteer-suicide-concern-escalation/`
18. `/care-guides/volunteer-secondary-stress-support/`
19. `/care-guides/volunteer-post-shift-decompression/`
20. `/care-guides/volunteer-burnout-workload-boundaries/`
21. `/care-guides/udl-accessible-assessment-design/`
22. `/care-guides/udl-digital-learning-materials-access/`
23. `/care-guides/udl-choice-autonomy-learning-goals/`
24. `/care-guides/udl-classroom-routine-predictability/`
25. `/care-guides/udl-multilingual-disability-inclusion/`
26. `/care-guides/volunteer-handovers-continuity-record/`
27. `/care-guides/volunteer-feedback-conversation-plan/`
28. `/care-guides/trainee-learning-objectives-supervision-plan/`
29. `/care-guides/volunteer-boundary-breach-response/`
30. `/care-guides/safeguarding-information-minimization-record/`

## Verified quality at the 30-page checkpoint

A live-database aggregate after publication returned exactly **30 `published` + `robots_index=true` Wave 003 records**. Arabic word counts are **2,500–3,022 words per page**. Every page has at least **five references**; current SEO-description lengths are **150–158 characters**. The published-canonical duplicate query returns **zero duplicate indexable canonicals**.

The V8 release gate is the authoritative publication control. It blocks promotion when the content contract is incomplete, including minimum Arabic depth, heading hierarchy, FAQ/search-intent coverage, semantic terms, claim-to-source mapping, source-version review, evidence-led rewrite/originality metadata, active taxonomy, page mechanism and the central-disclaimer contract. During this wave it rejected pages for insufficient H3 depth, short SEO metadata and forbidden inline disclaimer/warning vocabulary; those pages were repaired before publication rather than bypassing the gate.

## Editorial coverage now published

The released set includes:

- volunteer role boundaries, confidentiality, dual relationships, documentation and first supervision;
- escalation, competency, safeguarding, digital privacy, consent for photos/stories and programme onboarding;
- incident learning, reflective practice, field-competency observation, handovers, feedback and learning objectives;
- boundary-breach response and minimum-data safeguarding records;
- psychological first aid as support rather than therapy, crisis referral boundaries and suicide-concern escalation;
- secondary stress, post-shift transition and workload/burnout boundaries;
- UDL assessment design, digital learning-material accessibility, meaningful choice/autonomy, predictable flexible routines, and multilingual/disability inclusion.

The pages are not treated as one template with changed nouns. Each has a distinct search intent, mechanism, artifact or decision workflow, and source map.

## Sources

The source registry prioritises official policies, guidelines, standards and institutional evidence from IFRC, WHO, IASC, UN Volunteers, CAST, UNICEF, WHO ICF, the UN CRPD, NICE, SAMHSA, NIMH and NHS. The registry was refreshed on **2026-08-15** to include the current WHO/IASC suicide sources and the WHO/IFRC wellbeing sources already used by the newly published volunteer pages.

High-stakes withdrawal, suicide and OCD pages are deliberately scoped to education, preparation, safety and care navigation. They do **not** provide individualized diagnosis, medication doses, unsupervised taper schedules, or self-directed specialist treatment protocols.

## Remaining 20

The remaining configured intents are exactly:

1. `care-guide-capability-environment-fit-map`
2. `care-guide-participation-goal-setting-icf`
3. `care-guide-reasonable-accommodation-conversation-guide`
4. `care-guide-alcohol-withdrawal-care-navigation`
5. `care-guide-opioid-withdrawal-care-navigation`
6. `care-guide-benzodiazepine-withdrawal-care-navigation`
7. `care-guide-multiple-substance-withdrawal-risk-navigation`
8. `care-guide-evaluate-addiction-treatment-claims`
9. `care-guide-addiction-treatment-outcomes-review`
10. `care-guide-ocd-first-assessment-preparation`
11. `care-guide-ocd-erp-therapy-preparation`
12. `care-guide-ocd-workplace-function-support`
13. `care-guide-hoarding-family-communication-safety-plan`
14. `care-guide-trichotillomania-habit-tracking-help-seeking`
15. `care-guide-skin-picking-habit-tracking-skin-safety`
16. `care-guide-udl-small-group-instruction-design`
17. `care-guide-udl-homework-accessibility-review`
18. `care-guide-accessible-meeting-participation-plan`
19. `care-guide-body-focused-repetitive-behavior-appointment-prep`
20. `care-guide-ocd-family-accommodation-clinician-discussion`

No remaining record is promoted merely because it is listed in the configuration. Each must be collision-checked against the current published corpus, written for its own intent, verified against the appropriate current sources, accepted by V8, and receive its own publication/audit decision.

## Repository state

Wave 002 was merged only after its current head passed `Rawafid Quality Gate`, `Cloudflare Workers Validate` and `Validate Legacy Migration Payload`. Wave 003 stays on the clean branch `agent/care-guides-rich-wave-003-clean`; the original checkpoint CI was fully green before this 30-page documentation/source refresh.
