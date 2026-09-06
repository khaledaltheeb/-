# Rehabilitation sector — final V6 audit

Date: 2026-09-06
Production: https://healthrenewal.org
Sector slug: `rehabilitation-functioning`

## Executive result

The rehabilitation expansion and consistency pass is complete for the current production state.

### Production topology

- **107** unique published/indexable pages are linked to at least one rehabilitation category.
- **62** of those pages are canonically owned by the rehabilitation sector (`public.content.sector_id = rehabilitation-functioning`).
- **45** are legitimate cross-links from other canonical sectors. Their primary ownership must not be forcibly moved into rehabilitation merely to satisfy a sector-count audit.

### Gold numeric floor across all 107 linked pages

- Minimum Arabic-word count: **2,500**.
- Minimum reference count: **5**.
- Pages below either floor: **0**.

### Actual V6 release-gate validation

All **62/62 canonically rehabilitation-owned published pages** were re-submitted through `private.content_release_gate_v6` in one production transaction by updating `status=status` while supplying the institutional author temporarily.

The transaction committed without any exception. This is stronger evidence than a synthetic SQL checklist because the production trigger itself executed every V6 rule.

Result: **62/62 passed the actual production V6 release gate.**

## Important authorship-guard behavior

A future audit must not treat a persisted `author_display_name IS NULL` on a published page as an automatic V6 failure.

Production has a separate trigger:

- `y_content_institutional_authorship_guard`
- function: `private.enforce_rawafid_institutional_authorship()`

Its intended behavior is:

1. V6 sees a visible author during approval/release and validates it.
2. The institutional-authorship guard stores that value in `schema_json.legacy_author_display_name`.
3. The guard then clears `author_display_name` on the published row.

After the final sector revalidation:

- all **62** rehabilitation-owned pages have `schema_json.legacy_author_display_name = "فريق تحرير منصة روافد"`;
- all **62** have the published `author_display_name` field cleared by design.

Therefore, audits must distinguish **release-time author validation** from the **persisted institutional authorship representation**.

## V6 rules exercised by the production gate

For ordinary editorial pages, `private.content_release_gate_v6` validates, among other rules:

- branded SEO title present and no longer than 47 characters;
- meta description between 150 and 160 characters;
- primary keyword and canonical URL;
- visible release-time author;
- image alt text where a featured image exists;
- `content_contract_version >= 6`;
- at least 2,500 Arabic words, except the explicit Quick Info variant;
- at least 8 H2 and 4 H3 headings;
- at least 6 structured FAQs;
- at least 8 explicit search-intent questions;
- at least 5 secondary keywords and 8 semantic terms;
- no inline warning/danger callouts or duplicated disclaimer language;
- empty `medical_disclaimer`, with the centralized `/disclaimer` route and exact label;
- valid active canonical sector/category ownership;
- taxonomy review, confidence >= 0.9, and a classification rationale of sufficient depth;
- authoritative reference floor and at least two primary/guideline/systematic-review/official sources;
- claim-to-source mapping floor;
- reviewed source-version metadata;
- `rewrite_method = evidence-led-rewrite` and passing originality metadata;
- a documented page mechanism with purpose, audience, interaction model, and content model.

The final 62-page no-op release transaction passed these checks without disabling or weakening any gate.

## Category coverage after the expansion

| Rehabilitation category | Published/indexable linked pages |
| --- | ---: |
| Foundations of rehabilitation and functioning | 4 |
| Rehabilitation service pathways | 3 |
| Rehabilitation professions and team | 9 |
| Measurement and rehabilitation outcomes | 4 |
| Neurological rehabilitation | 13 |
| Musculoskeletal rehabilitation | 11 |
| Cardiopulmonary rehabilitation | 8 |
| Developmental and pediatric rehabilitation | 5 |
| Sensory rehabilitation | 8 |
| Cancer rehabilitation | 4 |
| Mental-health and psychosocial rehabilitation | 3 |
| Adult and geriatric rehabilitation | 7 |
| Assistive-technology rehabilitation | 5 |
| Family rehabilitation | 9 |
| Community, educational, and vocational rehabilitation | 8 |
| Telerehabilitation | 4 |
| Emergency, conflict, and disaster rehabilitation | 5 |
| Rehabilitation in Jordan and MENA | 4 |

Category totals intentionally include cross-linked pages where a page has real relevance to more than one domain. They should not be interpreted as canonical ownership totals.

## Legacy pages upgraded during the final consistency pass

The final audit deliberately stopped adding pages long enough to repair older published material that remained below the new gold standard.

### Psychosocial and vocational mental health

- `legacy-library-therapies-therapies-19`
  - upgraded from ~560 words to **2,653**;
  - rebuilt around person-centred, rights-based psychosocial rehabilitation, work/education, housing, peer support, family, and recovery-oriented outcomes;
  - **9** central source links.

- `concept-1918`
  - upgraded from ~630 words to **2,679**;
  - rebuilt around staying at work, return-to-work planning, supported employment/IPS, reasonable accommodation, disclosure/privacy, relapse planning, and occupational participation;
  - **8** central source links.

### Functioning and goal systems

- `legacy-special-needs-guides-assessment-icf-functioning-participation`
  - repetitive legacy text replaced with a real ICF functioning profile;
  - **2,602** words and **7** central sources;
  - clarified functioning vs diagnosis, performance vs capacity, environmental factors, participation, strengths, and ethical coding boundaries.

- `legacy-special-needs-guides-system-quality-rehabilitation-goal-review`
  - repetitive legacy text replaced with a goal-review decision system;
  - **2,599** words and **9** central sources;
  - uses a continue / modify / stop / replace decision cycle with current NICE rehabilitation guidance and goal-attainment evidence.

### Family and early intervention

- `child-safety-vs-overprotection`
  - upgraded to **2,750** words and **10** central sources;
  - added the risk-vs-hazard distinction, developing autonomy, disability-inclusive play, and structured FAQ/claim mapping.

- `legacy-special-needs-science-family-centered-rehabilitation`
  - upgraded from ~744 words to **2,523**;
  - **10** central sources;
  - rebuilt around family partnership, child/person voice, coaching, burden, transitions, MPOC 2.0 boundaries, and Jordan early-intervention procedures.

- `legacy-special-needs-early-intervention-motor-development-routines`
  - upgraded from ~871 words to **2,579**;
  - **10** central sources;
  - rebuilt around active motor learning, task-specific practice, routines, caregiver coaching, environmental design, mobility, and dose without inventing a universal dose.

- `legacy-special-needs-early-intervention-social-emotional-routines`
  - upgraded from ~1,467 words to **2,660**;
  - **10** central sources;
  - rebuilt around responsive relationships, co-regulation, communication, peer/community participation, autonomy, neurodiversity, and caregiver-child relationship outcomes.

- `legacy-special-needs-early-intervention-transition-to-preschool-school`
  - upgraded from ~1,022 words to **2,573**;
  - **9** central sources;
  - rebuilt as a real transition pathway with receiving/sending-team coordination, functional transition file, transport, sensory readiness, assistive-device continuity, first-30-days monitoring, and Jordan 2025–2026 inclusion/education context.

### Neuropsychological rehabilitation

- `concept-1809`
  - upgraded from ~481 words to **2,586**;
  - **10** central sources;
  - rebuilt around standardized + functional assessment, attention, memory, executive function, metacognition, fatigue, real-life money/medication/appointments, school/children, and transfer of strategies across contexts.

### Parkinson-capabilities body-text repair

- `capabilities-parkinson-disease`
  - body JSON already contained meaningful callout/list content that an earlier text-sync query had omitted;
  - text synchronization was corrected to include callout and list payloads;
  - final count: **2,517** Arabic words with **8** central sources.

### Limb difference across the lifespan

- `legacy-outside-box-limb-difference-amputation`
  - apparent 71-word audit result was caused by stale `body_text`; the JSON contained useful but structurally weak material;
  - rebuilt into a distinct page rather than duplicating the clinical post-amputation guide;
  - final: **2,678** words, **24 H2**, **6 H3**, **8 FAQs**, **9** central sources;
  - unique scope: congenital vs acquired limb difference, childhood growth, prosthesis choice/non-use, natural strategies, school, sport, identity, body image, transitions, work, and user-defined outcomes.

## New high-value clinical pathway added during the final pass

- `polytrauma-rehabilitation-guide`
  - **2,521** words;
  - **8** central sources;
  - built from AAPM&R Polytrauma, NICE major trauma, ERATIC 2025, WHO emergency rehabilitation, and related guidance;
  - spans acute trauma, ICU/ward rehabilitation, weight-bearing precautions, cognition/brain injury, respiratory burden, pain, devices, caregiver preparation, discharge, community return, and vocational participation.

## What “complete” means at this checkpoint

For the current production corpus, the rehabilitation sector is no longer being expanded merely to increase page count.

The checkpoint is:

- no linked/indexable rehabilitation page below 2,500 Arabic words;
- no linked/indexable rehabilitation page below five references;
- all canonical rehabilitation-owned published pages have passed the actual V6 trigger in production;
- cross-linked pages retain canonical ownership in their correct original sectors;
- major legacy pages discovered by the audit were rebuilt rather than cosmetically relabeled.

Future rehabilitation work should therefore be **gap-led and evidence-led**, not quota-led. New pages should be added only when they close a material clinical, service-system, local/regional, professional, or research gap that is not already covered by an existing durable guide.