# Rehabilitation sector — production audit at 117 linked pages

Date: 2026-09-06
Production: https://healthrenewal.org
Sector slug: `rehabilitation-functioning`

## Verified current state

Production currently contains **117 unique published/indexable pages linked to rehabilitation categories**.

Ownership matters:

- **67** pages are canonically owned by the rehabilitation sector (`public.content.sector_id = rehabilitation-functioning`).
- **50** are intentionally cross-linked from other canonical sectors because their existing pages also answer a rehabilitation need.
- Cross-linked pages retain their original primary sector/category ownership; rehabilitation is a secondary taxonomy relationship rather than a duplicate page.

Across all 117 linked pages:

- minimum Arabic-word count: **2,500**;
- minimum reference count: **5**;
- pages below either numeric floor: **0**.

## Strongest production verification: 67/67 actual V6 passes

A complete no-op release revalidation was run against every canonically rehabilitation-owned published/indexable page in a single transaction:

- `status = status` was used to trigger the live production release gate;
- `author_display_name = فريق تحرير منصة روافد` was supplied at release time;
- `private.content_release_gate_v6` executed on every row;
- the transaction committed without an exception after one legacy disclaimer field was corrected.

Final result: **67/67 canonical rehabilitation-owned pages passed the actual production V6 gate.**

### Legacy issue discovered by the full pass

The first 67-page transaction correctly stopped on one older page:

- `magazine-cancer-telerehab-telecare-rct-2026`

Its only V6 conflict was a persisted `medical_disclaimer` field. All other page requirements already passed. The local disclaimer was removed because production uses the centralized `/disclaimer` route and exact label `إخلاء المسؤولية والتنبيهات`. After this correction, the complete 67-page transaction passed.

## Institutional authorship behavior

Production has an institutional-authorship guard after the V6 check:

- trigger: `y_content_institutional_authorship_guard`
- function: `private.enforce_rawafid_institutional_authorship()`

The intended sequence is:

1. V6 validates the visible release-time author.
2. The authorship guard stores the value in `schema_json.legacy_author_display_name`.
3. It clears persisted `author_display_name` on the published row.

After the 67-page revalidation:

- all **67** store `فريق تحرير منصة روافد` in `schema_json.legacy_author_display_name`;
- all **67** have the direct display field cleared by the institutional guard as designed.

Therefore, a future audit must not misclassify a NULL persisted `author_display_name` as a release-gate failure.

## Current category coverage

| Rehabilitation category | Published/indexable linked pages |
| --- | ---: |
| Foundations of rehabilitation and functioning | 4 |
| Rehabilitation service pathways | 3 |
| Rehabilitation professions and team | 9 |
| Measurement and rehabilitation outcomes | 4 |
| Neurological rehabilitation | 17 |
| Musculoskeletal rehabilitation | 12 |
| Cardiopulmonary rehabilitation | 10 |
| Developmental and pediatric rehabilitation | 9 |
| Sensory rehabilitation | 8 |
| Cancer rehabilitation | 5 |
| Mental-health and psychosocial rehabilitation | 3 |
| Adult and geriatric rehabilitation | 11 |
| Assistive-technology rehabilitation | 6 |
| Family rehabilitation | 9 |
| Community, educational, and vocational rehabilitation | 9 |
| Telerehabilitation | 4 |
| Emergency, conflict, and disaster rehabilitation | 5 |
| Rehabilitation in Jordan and MENA | 4 |

Category totals include legitimate cross-links, so their sum is intentionally larger than the unique-page total.

## Growth from the original production baseline

Initial production baseline for this project: **74** linked rehabilitation pages.

Current state: **117** linked rehabilitation pages.

The increase of **43 linked pages** was achieved through two mechanisms:

1. **38 new durable pages** created for genuine missing pathways.
2. **5 existing pages** from other sectors upgraded to the gold standard and newly cross-linked instead of creating duplicates.

This distinction is central to the editorial strategy: a taxonomy becomes richer without forcing every topic to exist as a second canonical article.

## Five existing pages upgraded and cross-linked instead of duplicated

### 1. Cerebral palsy

Existing page: `special-ed-encyclopedia-cerebral-palsy`

- retained special-needs/inclusion ownership;
- already met the deep-content standard;
- AAPM&R Cerebral Palsy added to its strong CDC/AACPDM/WHO/ASHA/UNICEF evidence family;
- **8** central sources;
- linked to `developmental-rehabilitation`.

### 2. Pressure-injury prevention

Existing page: `legacy-special-needs-guides-mobility-at-pressure-injury-prevention`

- old template-like content was rebuilt first;
- evidence base updated with AAPM&R Pressure Injury Management in CNS Disorders (2026), the International Pressure Injury Living Guideline modules from 2025–2026, WHO Wheelchair Provision Guidelines, and WHO ICF;
- final: **2,789** Arabic words, **21 H2**, **4 H3**, **8 FAQs**, **10 sources**, **8 claim mappings**;
- actual V6 revalidation passed;
- linked to neurological and assistive-technology rehabilitation.

### 3. Spinal muscular atrophy (SMA)

Existing page: `capabilities-spinal-muscular-atrophy`

- upgraded for the newborn-screening / early-treatment era;
- integrated AAPM&R SMA and 2026 motor-trajectory assessment consensus;
- final: **2,529** Arabic words, **25 H2**, **4 H3**, **12 FAQs**, **21 sources**, **7 claim mappings**;
- actual V6 revalidation passed;
- linked to neurological and developmental rehabilitation.

### 4. Spina bifida

Existing page: `capabilities-spina-bifida`

- upgraded with AAPM&R Myelomeningocele and Spina Bifida Association 2025 lifespan guidance on mobility, skin, self-management, transition, and care coordination;
- final: **2,866** Arabic words, **21 H2**, **9 H3**, **10 FAQs**, **15 sources**;
- actual V6 revalidation passed;
- linked to neurological and developmental rehabilitation.

### 5. Duchenne muscular dystrophy (DMD)

Existing page: `capabilities-duchenne-muscular-dystrophy`

- upgraded with AAPM&R, contemporary multidisciplinary guidance, 2025 rehabilitation evidence, and 2026 respiratory-rehabilitation consensus;
- final: **2,500** Arabic words, **26 H2**, **4 H3**, **12 FAQs**, **18 sources**, **7 claim mappings**;
- actual V6 revalidation passed;
- linked to neurological and developmental rehabilitation.

## New gap-led pathways added after the original 33-page expansion

The original broad expansion added 33 new durable guides. Five more genuinely absent pathways were added during the later whole-site gap audit, bringing the total new-page count to **38**.

### 34. General lymphedema rehabilitation

`lymphedema-rehabilitation-guide`

- first general lymphedema pathway on the site; previous content was mainly pediatric oncology-specific;
- distinguishes primary and secondary lymphedema;
- evidence includes AAPM&R, International Society of Lymphology 2023 consensus, APTA BCRL guidance, and 2025–2026 exercise/compression reviews;
- **2,604** words, **9 sources**;
- primary: adult/geriatric rehabilitation;
- secondary: cancer rehabilitation;
- actual V6 passed.

### 35. Chronic venous insufficiency and post-thrombotic syndrome

`chronic-venous-insufficiency-rehabilitation-guide`

- no pre-existing whole-site pathway;
- evidence includes AAPM&R updated 2026-03-26, ESVS guidance, Cochrane exercise evidence, and 2025 FITT-scoping work;
- **2,625** words, **8 sources**;
- focuses on compression, calf-muscle pump, walking, ankle mobility, skin, work, and realistic uncertainty about exercise dose;
- actual V6 passed.

### 36. Functional sports rehabilitation / return to sport

`functional-sports-rehabilitation-return-to-sport-guide`

- no general return-to-sport pathway existed;
- evidence includes AAPM&R Functional Rehabilitation updated 2026-05-07, Panther consensus, 2026 APKASS publication, 2026 football muscle-injury return-to-play systematic review, and psychological-readiness evidence;
- **2,637** words, **8 sources**;
- deliberately avoids a universal time, limb-symmetry cutoff, or single-test clearance rule;
- primary: musculoskeletal rehabilitation;
- secondary: community/vocational rehabilitation;
- actual V6 passed.

### 37. Peripheral artery disease (PAD)

`peripheral-artery-disease-rehabilitation-guide`

- whole-site search confirmed the pathway was absent;
- evidence includes the 2024 ACC/AHA Multisociety PAD Guideline, AAPM&R, 2025 home-based walking evidence, and 2026 network meta-analyses;
- distinguishes stable claudication from acute limb ischemia and chronic limb-threatening ischemia;
- emphasizes structured exercise therapy rather than a generic “walk more” instruction;
- **2,504** words, **10 sources**;
- primary: adult/geriatric rehabilitation;
- secondary: cardiopulmonary rehabilitation;
- actual V6 passed.

### 38. Venous thromboembolism (DVT/PE) recovery

`venous-thromboembolism-rehabilitation-guide`

- whole-site search confirmed no dedicated DVT/PE rehabilitation pathway;
- evidence includes AAPM&R VTE updated 2026-02-12, APTA VTE guidance, 2026 RCT systematic review of structured exercise after acute VTE, 2025–2026 post-PE rehabilitation evidence, CPET evidence, and anticoagulant guidance;
- explicitly separates acute medical evaluation/treatment from mobilization after treatment and stability;
- covers post-thrombotic symptoms, post-PE syndrome, anticoagulant/fall safety, ICU overlap, work, and travel;
- **2,599** words, **10 sources**;
- primary: adult/geriatric rehabilitation;
- secondary: cardiopulmonary rehabilitation;
- actual V6 passed.

## Editorial conclusion

The current system has reached a point where **page count is no longer the primary optimization target**.

The mandatory sequence for future rehabilitation work is now:

1. search the whole site for existing coverage;
2. inspect quality, sources, contract level, and current evidence;
3. rebuild or enrich the strongest existing page where it can carry the topic cleanly;
4. cross-link it into rehabilitation without changing canonical ownership when appropriate;
5. create a new durable guide only when a distinct semantic and clinical/service gap remains;
6. pass the actual production release gate before publication or secondary linkage.

This strategy reduces duplication, strengthens the whole platform, and lets rehabilitation function as a knowledge graph across sectors rather than an isolated silo.