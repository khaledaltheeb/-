# Rehabilitation sector — current production audit

Date: 2026-09-06
Production: https://healthrenewal.org
Sector: `rehabilitation-functioning`

## Executive checkpoint

Current production has:

- **123** unique published/indexable pages linked to rehabilitation categories;
- **73** pages canonically owned by the rehabilitation sector;
- **50** intentional cross-sector links that keep their original canonical ownership;
- minimum Arabic-word depth across the linked corpus: **2,500**;
- minimum reference count across the linked corpus: **5**;
- linked pages below either floor: **0**.

## Live V6 verification

All **73/73 canonically rehabilitation-owned published pages** were re-submitted through the live `private.content_release_gate_v6` in one production transaction.

The first attempt correctly stopped because `magazine-cancer-telerehab-telecare-rct-2026` had acquired a residual local `medical_disclaimer` again while the sector was being edited concurrently. The field was removed because production uses the centralized `/disclaimer` contract. The full 73-page transaction was then rerun and committed successfully.

Result: **73/73 passed the live production release gate. No release gate was disabled, bypassed, or weakened.**

The institutional-authorship guard subsequently performed its intended normalization:

- `schema_json.legacy_author_display_name = "فريق تحرير منصة روافد"` on all 73 canonical rehabilitation pages;
- persisted `author_display_name` cleared on all 73 published rows by design.

## Growth from the original rehabilitation baseline

The broad rehabilitation program started from **74** linked/indexable pages.

Current topology is explained by:

- **+44 new durable gap-led guides**;
- **+5 existing pages upgraded and cross-linked rather than duplicated**;
- current total: **123 linked/indexable pages**.

The five existing pages upgraded/cross-linked instead of duplicated are:

1. cerebral palsy;
2. pressure-injury prevention;
3. spinal muscular atrophy (SMA);
4. spina bifida;
5. Duchenne muscular dystrophy (DMD).

## Latest gap-led guides after the 117-page checkpoint

### Complex regional pain syndrome (CRPS)

`complex-regional-pain-syndrome-rehabilitation-guide`

- 2,802 Arabic words;
- 10 central sources;
- 23 H2, 4 H3, 8 structured FAQs;
- covers functional restoration, graded use/loading, desensitization, motor imagery, sleep/pacing, home programming, devices, pediatric/school issues and escalation;
- V6 passed in production.

### Fibromyalgia rehabilitation

`fibromyalgia-rehabilitation-guide`

- 2,549 Arabic words;
- 10 central sources;
- 30 H2, 4 H3, 8 structured FAQs;
- separates diagnosis from function and integrates individualized exercise, sleep, fatigue, pacing, CBT, work, cognitive fog, flare planning and long-term adherence;
- primary: musculoskeletal rehabilitation; secondary: adult/geriatric rehabilitation;
- V6 passed in production.

### Post-polio syndrome rehabilitation

`post-polio-syndrome-rehabilitation-guide`

- 2,502 Arabic words;
- 7 central sources;
- 29 H2, 4 H3, 8 structured FAQs;
- differentiates stable muscles from new weakness/atrophy/pain, uses non-fatiguing exercise logic, energy conservation, orthoses, mobility, respiratory/swallowing review, work, transfers and longitudinal follow-up;
- primary: neurological rehabilitation; secondary: adult/geriatric rehabilitation;
- V6 passed in production.

### Rehabilitation level-of-care selection

`rehabilitation-level-of-care-selection-guide`

- 2,658 Arabic words;
- 7 central sources;
- 29 H2, 4 H3, 10 structured FAQs;
- decision framework for specialized inpatient, day/intensive outpatient, routine outpatient, primary-care, home, community and hybrid/telerehabilitation settings;
- includes medical stability, functional complexity, therapy intensity, caregiver capacity, home access, transport, equity/financing, step-up/step-down and staged discharge;
- primary: rehabilitation service pathways;
- V6 passed in production.

### Interpreting rehabilitation change scores

`rehabilitation-change-score-interpretation-guide`

- 2,602 Arabic words;
- 9 central sources;
- 34 H2, 4 H3, 10 structured FAQs;
- separates SEM, MDC/SDC, MIC/MCID/MID, responsiveness, interpretability, statistical significance, floor/ceiling effects, individual vs group change and IRT score-specific error;
- provides a seven-step interpretation protocol and practical documentation examples;
- primary: rehabilitation measurement and outcomes;
- V6 passed in production.

### Supported education and mental-health rehabilitation

`supported-education-mental-health-rehabilitation-guide`

- 2,594 Arabic words;
- 8 central sources;
- 33 H2, 4 H3, 10 structured FAQs;
- maintains evidence transparency: supported education is promising but its evidence is weaker and less consistent than IPS employment evidence;
- covers school/university return, accommodations, privacy/disclosure, cognition/organization, sleep, medication burden, family, remote learning, financing, peers, examinations, crisis plans and outcome separation between education and employment;
- primary: psychosocial rehabilitation; secondary: community/educational/vocational rehabilitation;
- V6 passed in production.

## Current category coverage

| Category | Published/indexable linked pages |
| --- | ---: |
| Foundations of rehabilitation and functioning | 4 |
| Rehabilitation service pathways | 4 |
| Rehabilitation professions and team | 9 |
| Measurement and rehabilitation outcomes | 5 |
| Neurological rehabilitation | 18 |
| Musculoskeletal rehabilitation | 14 |
| Cardiopulmonary rehabilitation | 10 |
| Developmental and pediatric rehabilitation | 9 |
| Sensory rehabilitation | 8 |
| Cancer rehabilitation | 5 |
| Mental-health and psychosocial rehabilitation | 4 |
| Adult and geriatric rehabilitation | 13 |
| Assistive-technology rehabilitation | 6 |
| Family rehabilitation | 9 |
| Community, educational and vocational rehabilitation | 10 |
| Telerehabilitation | 4 |
| Emergency, conflict and disaster rehabilitation | 5 |
| Rehabilitation in Jordan and MENA | 4 |

Category counts intentionally include valid cross-links; they are not canonical ownership totals.

## Quality interpretation

The current checkpoint is not a page-count claim alone. The production corpus was tested against the actual V6 trigger, and the linked corpus has no page below the 2,500-word / five-reference numeric floor.

Future rehabilitation expansion should remain **gap-led**:

- upgrade an existing durable page before creating a duplicate;
- cross-link strong pages across sectors while preserving canonical ownership;
- add new pages only for a material clinical, service-delivery, measurement, psychosocial, local/regional or evidence-update gap;
- rerun the live release gate after material expansion to catch concurrent regressions.