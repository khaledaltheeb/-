# Capabilities / لنرتقي بقدراتهم — Gold Standard Completion

**Date:** 2026-09-06  
**Status:** Production verification complete  
**Scope:** `/capabilities/` program only

## Purpose

This document is the completion addendum to `docs/research/2026-09-06-page-by-page-content-specificity-audit.md`.

The earlier audit was the baseline and classified the Capabilities program as:

- 24 DEEP condition pages;
- 26 ENRICH condition pages;
- 105 STRONG condition pages;
- 4 CENTRAL methodology/hub pages;
- 1 INTERNAL review bundle.

This addendum records the work completed after that audit and supersedes the **open-work status** of the DEEP/ENRICH classifications for Capabilities. The original audit remains useful as provenance showing where the work started and why each class existed.

## Final production status

Production QA against `public.content` completed successfully after the enrichment and verification pass:

- **160 / 160** Capabilities records carry the internal Gold Standard verification flag.
- **160 / 160** were reviewed on 2026-09-06.
- **160 / 160** contain at least 1,500 useful body words after rendered-content cleanup.
- **160 / 160** contain at least 20 structured body blocks.
- **160 / 160** contain at least 3 direct references.
- **159 / 160** are indexable public pages.
- **1 / 160** is intentionally `noindex`: `capabilities-selective-mutism-multilingual-review-bundle`.
- **No final QA failures remained.**

The numeric thresholds above are **minimum structural floors, not evidence of quality by themselves**. Gold verification also required the page-specificity audit and condition-role review described below.

## What changed

### 1. DEEP — 24 / 24 closed

All 24 DEEP pages received substantive condition-specific work rather than additional generic methodology. Their upgrades emphasize, as applicable:

- the functional phenotype and meaningful within-condition variability;
- medical, sensory, motor, communication, sleep, pain or metabolic factors that can hide capability;
- condition-specific safety gates and escalation boundaries;
- reversible, low-risk hypothesis tests that distinguish access problems from conceptual difficulty;
- measurement validity, including floor effects and motor/speech confounding;
- life-stage transitions, progression and treatment-era bias;
- Arabic/MENA applicability where supportable;
- a concrete decision rule: what result would actually change the plan?

Examples include state mapping for CACNA1A, communication/motor endpoints beyond seizure count in KCNQ2-DEE, speech-language-cognition separation in Kleefstra and SATB2, treatment-era interpretation in Menkes/MPS II/Pompe, metabolic-state validity in MSUD, and safe-predictability measurement in Coffin-Lowry.

### 2. ENRICH — 26 / 26 closed

All 26 ENRICH pages received targeted enrichment using direct condition evidence and current evidence where materially important.

Representative upgrades include:

- MLD: post-gene-therapy multi-domain follow-up and treatment-window interpretation;
- Sanfilippo/MPS III: `slow growth → plateau → regression` and capability preservation;
- BPAN: communication continuity before later dystonia/parkinsonism;
- GRIN2B, SCN2A, SCN8A and KCNT1: functional-variant biology separated from individual capability and from prescribing decisions;
- SYNGAP1: language/fine-motor/sensory outcomes beyond seizure count;
- Dravet and Lennox-Gastaut: net-benefit assessment including alertness, communication, sleep, behavior and adaptive function;
- CDKL5: micro-communication, vision/movement/alertness access, and floor-resistant measurement;
- STXBP1: seizure trajectory separated from developmental and movement trajectories;
- MPS I, Niemann-Pick C and Wilson disease: treatment-era or progression-aware longitudinal assessment;
- Fabry and CBS-homocystinuria: symptom/metabolic burden separated from cognitive capability.

### 3. STRONG — 105 / 105 verified

The original audit had already found these pages to have adequate direct evidence and no material template dependence for their current scope.

They were not rewritten merely to increase length.

Verification added:

- production structural-contract check;
- direct-reference recency check;
- review of any page whose newest stored reference was older than the main cohort;
- preservation of condition-specific content instead of introducing shared filler.

Reference-recency results before the final freshness fixes:

- 100 pages already contained a 2025 or 2026 reference;
- 4 pages had newest references from 2024;
- 1 page, cerebral palsy, had newest references from 2023;
- 0 pages lacked reference-year metadata.

Targeted freshness work was then completed for cerebral palsy, Cornelia de Lange syndrome, severe food allergy and stroke. Direct searching found the 2024 multidisciplinary Moebius syndrome management protocol remained the strongest direct peer-reviewed management source identified during the 2026-09-06 freshness check; it was retained rather than replaced by a weaker source purely for recency.

### 4. CENTRAL — 4 / 4 verified in their correct role

The following were verified as intentional shared methodology rather than forced into a condition-page contract:

- `capabilities-hub`
- `capabilities-methodology`
- `capabilities-protocol`
- `capabilities-registry`

Shared methodology is legitimate on these pages and should **not** be copied back into every condition page.

### 5. INTERNAL — 1 / 1 verified and kept noindex

`capabilities-selective-mutism-multilingual-review-bundle` remains an internal review/research bundle and intentionally remains `noindex`.

## Gold Standard interpretation

`gold_standard_upgrade=true` is an **internal scientific/editorial quality status**. It is not external accreditation, regulatory approval, medical certification, or independent clinical endorsement.

The production metadata explicitly records `gold_standard_external_endorsement=false` where the Gold Standard enrichment/verification metadata is applied.

## Evidence principles enforced

1. **Current evidence is not the same as a current publication year.** A strong authoritative guideline is retained when it remains the best source; a newer but weaker source is not substituted solely for recency.
2. **Treatment approval is not proof of recovery.** Biomarkers, surrogate endpoints, gait scales or seizure counts are kept distinct from communication, cognition, adaptive function and participation.
3. **Genotype/functional class is not an IQ score.** Molecular information informs risks, biology and trial readiness, not a fixed ceiling for the individual.
4. **Access validity precedes interpretation.** Hearing, vision, motor output, speech, sleep, pain, breathing, metabolic state, seizure recovery and psychiatric state are treated as possible confounders when relevant to the condition.
5. **Standard scores can hide growth.** Raw skills, growth values, independence, cue level, generalization and meaningful `inchstones` are retained when conventional instruments have floor effects or when the age gap expands despite skill acquisition.
6. **Progressive disorders require domain-specific trajectories.** Loss of walking, speech, eye movement or hand control is not automatically interpreted as simultaneous loss of knowledge.
7. **Arabic/MENA limitations must be explicit.** Unvalidated translated tools are not described as locally standardized tests.
8. **Research signals remain research signals.** Small open-label trials, preclinical CRISPR/gene therapy work, individualized n-of-1 therapies and case reports are labeled with their evidence limits and are not converted into prescribing recommendations.

## Publication safety / preservation

The Gold Standard work preserved:

- existing public canonical URLs;
- publication status;
- indexing for public pages;
- intentional `noindex` for the internal review bundle;
- content-render parity enforced by the database guard;
- the existing quality guard rather than weakening it to allow short pages.

During final QA, two pages fell below the minimum body-word floor after the rendered-content cleanup:

- Coffin-Lowry syndrome: 1,329 words;
- Landau-Kleffner syndrome: 1,484 words.

They were expanded with condition-specific content rather than lowering the guard. Final minimum across all 160 records became **1,507 words**.

## Final conclusion

The Capabilities / لنرتقي بقدراتهم section is no longer in the baseline state of `24 DEEP + 26 ENRICH + 105 STRONG` as an open task list.

As of 2026-09-06:

- all 155 public condition pages have completed Gold Standard enrichment or verification;
- all 4 central methodology pages have been verified in their intended role;
- the 1 internal bundle has been verified while remaining intentionally noindex;
- final production QA is **160 / 160 with zero contract failures**.

Future work should therefore be **maintenance and evidence surveillance**, not indiscriminate length expansion. New research should trigger targeted condition updates only when it materially changes safety, assessment validity, access, prognosis interpretation, treatment-era context, or what would change a functional decision.
