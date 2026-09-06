# Rehabilitation current state — V6 verified

Date: 2026-09-06
Production sector: `rehabilitation-functioning`
Production site: https://healthrenewal.org

## Verified production snapshot

The live rehabilitation sector currently contains:

- **135 unique published/indexable pages linked to the sector**.
- **85 canonically owned rehabilitation pages** (`content.sector_id = rehabilitation-functioning`).
- **50 intentional cross-sector links** from other sectors where an existing strong page is relevant to rehabilitation and should not be duplicated.
- **56 canonically owned rehabilitation pages created on 2026-09-06 (Asia/Amman)**.
- **Minimum linked-page Arabic depth: 2,500 words**.
- **Minimum linked-page reference count: 5**.
- **0 linked pages below the current quantitative gold floor**.

## Strong V6 verification

A full production re-validation was performed on **all 85 canonically owned rehabilitation pages in one database transaction** by re-triggering `private.content_release_gate_v6`.

Result: **85/85 passed**.

Before the successful run, the gate correctly rejected the transaction because one inherited TeleCaRe cancer telerehabilitation article still contained an old local `medical_disclaimer` field. That local field was removed while retaining the site-wide centralized `/disclaimer` route. The full 85-page transaction was then rerun and passed.

The institutional authorship guard behaved as designed: `author_display_name` is cleared after release and the institutional attribution is retained in `schema_json.legacy_author_display_name = "فريق تحرير منصة روافد"`.

## Current category coverage

| Category | Published/indexable pages linked |
| --- | ---: |
| Rehabilitation foundations | 5 |
| Rehabilitation service pathways | 5 |
| Rehabilitation professions and team | 9 |
| Measurement and outcomes | 6 |
| Neurological rehabilitation | 20 |
| Musculoskeletal rehabilitation | 16 |
| Cardiopulmonary rehabilitation | 10 |
| Developmental and pediatric rehabilitation | 9 |
| Sensory / hearing / vision rehabilitation | 9 |
| Cancer rehabilitation | 5 |
| Mental-health and psychosocial rehabilitation | 5 |
| Adult and geriatric rehabilitation | 16 |
| Assistive technology | 6 |
| Family rehabilitation | 9 |
| Community / educational / vocational rehabilitation | 12 |
| Telerehabilitation | 5 |
| Emergency / conflict / disaster rehabilitation | 5 |
| Jordan and MENA rehabilitation | 5 |

Every active category now has at least five published/indexable pages linked to it.

## Current editorial contract

New and upgraded canonical rehabilitation guides are released only after satisfying V6, including:

- >= 2,500 Arabic-token words;
- >= 8 H2 and >= 4 H3 headings;
- >= 6 FAQs;
- >= 8 explicit search-intent questions;
- >= 5 references and >= 5 claim-to-source mappings;
- valid SEO title/description ranges;
- taxonomy review and classification rationale;
- evidence-led rewrite + originality metadata;
- page-mechanism metadata;
- centralized disclaimer route;
- no inline warning/disclaimer callouts prohibited by the production contract.

## Important content-system rule

A page may be linked to rehabilitation through `public.content_categories` while retaining canonical ownership in another sector. This is intentional. Cross-linked pages should **not** be force-reclassified merely to make a sector audit appear uniform.

The correct audit distinction is:

- **Canonical-owned**: V6 must pass in the page's canonical sector/category.
- **Cross-linked**: quality is checked in the page's canonical ownership context, then the page may be surfaced secondarily in rehabilitation when it closes a real gap.

## Recent structural additions in the current production state

The current state includes durable reference guides for, among other areas:

- rehabilitation level-of-care selection;
- rehabilitation dose/intensity/frequency;
- motor learning and task-specific practice;
- selecting outcome measurement instruments using COSMIN/COMET principles;
- general telerehabilitation selection and implementation;
- community-based inclusive rehabilitation in Jordan;
- frailty, sarcopenia, and hip-fracture rehabilitation;
- vestibular rehabilitation;
- supported living in psychosocial rehabilitation;
- CRPS, fibromyalgia, and post-polio rehabilitation;
- stroke, TBI, SCI, multiple sclerosis, spasticity, Parkinson disease;
- cardiac, COPD, ILD, transplant, PAD, VTE, and venous/lymphedema rehabilitation;
- burn and polytrauma rehabilitation.

Where strong pages already existed elsewhere (for example cerebral palsy, SMA, spina bifida, DMD, pressure injury), the program upgraded and cross-linked those pages instead of creating duplicate rehabilitation copies.

## Source-of-truth boundary

Production editorial bodies live in `public.content` and remain the source of truth for text. This repository record documents the verified production state and methodology; it intentionally does not duplicate thousands of words of production editorial bodies in migrations.