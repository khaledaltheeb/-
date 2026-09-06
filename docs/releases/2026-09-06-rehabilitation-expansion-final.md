# Rehabilitation expansion — final release record

Date: 2026-09-06
Production: https://healthrenewal.org
Sector: `rehabilitation-functioning`

## Release outcome

This work started from a production baseline of **74** unique published/indexable pages linked to rehabilitation categories.

Current production contains **107** unique published/indexable rehabilitation-linked pages.

Net expansion: **+33 durable pages**.

The expansion was accompanied by a separate legacy-consistency pass that rebuilt older pages rather than simply increasing the page count.

## 33 new durable pages added

### Wave 1 — core clinical gaps (8)

1. `stroke-rehabilitation-guide`
2. `traumatic-brain-injury-rehabilitation-guide`
3. `spinal-cord-injury-rehabilitation-guide`
4. `multiple-sclerosis-rehabilitation-guide`
5. `spasticity-rehabilitation-management-guide`
6. `cardiac-rehabilitation-guide`
7. `copd-pulmonary-rehabilitation-guide`
8. `knee-osteoarthritis-rehabilitation-guide`

### Wave 2 — rehabilitation professions (8)

9. `physiatrist-role-rehabilitation-guide`
10. `physical-therapy-role-rehabilitation-guide`
11. `occupational-therapy-role-rehabilitation-guide`
12. `speech-language-pathology-role-rehabilitation-guide`
13. `rehabilitation-nursing-role-guide`
14. `rehabilitation-psychology-neuropsychology-role-guide`
15. `rehabilitation-social-work-case-management-role-guide`
16. `prosthetics-orthotics-seating-assistive-technology-role-guide`

These pages complement the pre-existing multidisciplinary-team overview instead of duplicating it.

### Wave 3 — Jordan and MENA (4)

17. `jordan-rehabilitation-services-access-guide`
18. `jordan-assistive-technology-access-guide`
19. `jordan-rehabilitation-discharge-continuity-guide`
20. `mena-rehabilitation-system-strengthening-guide`

The Jordan pages are pathway-oriented rather than static provider lists so that the material does not become obsolete whenever one facility, phone number, or financing mechanism changes.

### Wave 4 — additional high-value clinical pathways (4)

21. `amputation-limb-loss-rehabilitation-guide`
22. `parkinson-disease-rehabilitation-guide`
23. `post-icu-critical-illness-rehabilitation-guide`
24. `cancer-rehabilitation-guide`

### Wave 5 — musculoskeletal and transplant pathways (4)

25. `low-back-pain-rehabilitation-guide`
26. `rotator-cuff-shoulder-rehabilitation-guide`
27. `hip-osteoarthritis-rehabilitation-guide`
28. `heart-transplant-rehabilitation-guide`

### Wave 6 — solid-organ and pulmonary transplant pathways (2)

29. `lung-transplant-rehabilitation-guide`
30. `liver-kidney-transplant-rehabilitation-guide`

### Wave 7 — pulmonary disease and emergency/trauma pathways (3)

31. `interstitial-lung-disease-rehabilitation-guide`
32. `burn-rehabilitation-guide`
33. `polytrauma-rehabilitation-guide`

## Evidence architecture

AAPM&R / PM&R KnowledgeNow was used as a specialty anchor where appropriate, but no page depends on AAPM&R alone. Pages were triangulated with authoritative sources appropriate to the topic, including families such as:

- WHO rehabilitation, ICF, assistive technology, emergency rehabilitation, and system-strengthening resources;
- NICE rehabilitation, neurological, musculoskeletal, trauma, and mental-health guidance;
- Canadian Stroke Best Practices;
- VA/DoD rehabilitation guidance;
- INCOG cognitive-rehabilitation guidance;
- Consortium for Spinal Cord Medicine / PVA and SCIRE;
- ASIA ISNCSCI resources;
- AHA/AACVPR cardiac-rehabilitation guidance;
- American Thoracic Society pulmonary-rehabilitation guidance;
- GOLD COPD reports;
- ISHLT transplant guidance and 2026 lung-transplant frailty consensus;
- AAOS, ACR/Arthritis Foundation, OARSI, and WHO musculoskeletal guidance;
- NCI and ASCO cancer/survivorship/exercise resources;
- DEC / ECTA, NCPMI, WHO Caregiver Skills Training, UNICEF, and Jordan institutional sources for early intervention and participation;
- ASHA and professional role/scope resources for speech-language pathology and swallowing;
- rights-based sources including OHCHR/CRPD where participation and disability rights were directly relevant.

## Rights boundary

The expansion does **not** republish protected instruments or proprietary worksheets merely because they are clinically useful.

Examples:

- ISNCSCI is explained and linked to official ASIA material rather than reproduced.
- MPOC 2.0 is referenced as a service-experience measure but its questionnaire is not copied.
- protected cognitive/neuropsychological tests are not reproduced.
- organization names in references indicate evidence provenance only; they do not imply endorsement, accreditation, certification, or partnership.

## Legacy consistency repair

After the expansion, a sector-wide audit identified older published pages that did not yet meet the new depth and metadata contract. The work deliberately shifted from adding new pages to repairing those weak points.

Major upgrades included:

- psychosocial rehabilitation;
- psychosis and work;
- ICF functioning/participation profile;
- rehabilitation goal review;
- child safety vs overprotection;
- person/family-centred rehabilitation;
- early-intervention motor learning in routines;
- early-intervention social-emotional routines;
- transition from early intervention to preschool/school;
- neuropsychological rehabilitation for memory/attention/executive functioning;
- Parkinson-capabilities body-text synchronization;
- limb difference across the lifespan.

The legacy pages were rebuilt around current evidence and real functional decisions; repetitive or template-like legacy text was replaced where necessary.

## Final production verification

### Linked rehabilitation corpus

- 107 unique published/indexable linked pages.
- Minimum Arabic-word count: 2,500.
- Minimum references: 5.
- Pages below either numeric floor: 0.

### Canonical rehabilitation ownership

- 62 pages are canonically owned by the rehabilitation sector.
- 45 pages are intentionally cross-linked from other sectors and keep their original canonical ownership.

All **62/62 rehabilitation-owned published pages were revalidated through the live `private.content_release_gate_v6` trigger in one transaction**. No trigger was disabled, bypassed, or weakened.

The institutional authorship trigger then performed its intended post-validation normalization by moving the release-time author into `schema_json.legacy_author_display_name` and clearing `author_display_name` on the published row.

## Current category coverage

- Foundations: 4
- Service pathways: 3
- Professions/team: 9
- Measurement/outcomes: 4
- Neurological: 13
- Musculoskeletal: 11
- Cardiopulmonary: 8
- Developmental/pediatric: 5
- Sensory: 8
- Cancer: 4
- Psychosocial/mental-health rehabilitation: 3
- Adult/geriatric: 7
- Assistive technology: 5
- Family rehabilitation: 9
- Community/education/vocational: 8
- Telerehabilitation: 4
- Emergency/conflict/disaster: 5
- Jordan/MENA: 4

## Editorial decision after this release

The rehabilitation program should now switch from **volume expansion** to **gap-led maintenance**.

A new page should be added only when at least one of the following is true:

1. a clinically meaningful pathway is absent;
2. a new guideline or major evidence shift changes practice or decision-making;
3. Jordan/MENA-specific access, rights, workforce, or service-system evidence creates a locally important gap;
4. a cross-disciplinary topic cannot be adequately represented by an existing durable guide;
5. a legacy page is materially weaker than the current evidence standard and should be rebuilt instead of duplicated.

This release therefore marks the end of the broad AAPM&R-led rehabilitation expansion and the beginning of targeted maintenance, evidence surveillance, and high-value gap filling.