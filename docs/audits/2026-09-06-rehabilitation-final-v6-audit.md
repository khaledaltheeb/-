# Rehabilitation sector — final V6 and gap-led audit

Date: 2026-09-06
Production: https://healthrenewal.org
Sector slug: `rehabilitation-functioning`

## Executive result

The broad rehabilitation expansion has moved from quota-led publishing to evidence-led gap maintenance.

### Current production topology

- **109** unique published/indexable pages are linked to at least one rehabilitation category.
- **62** pages are canonically owned by the rehabilitation sector (`public.content.sector_id = rehabilitation-functioning`).
- **47** are intentional cross-links from other canonical sectors.
- Cross-linked pages retain their original sector/category ownership; the rehabilitation relationship is secondary and must not be converted into primary ownership merely to simplify an audit.

### Gold floor across all 109 linked pages

- Minimum Arabic-word count: **2,500**.
- Minimum reference count: **5**.
- Pages below either floor: **0**.

## Actual V6 release-gate validation

All **62/62 canonically rehabilitation-owned published pages** were re-submitted through the real production `private.content_release_gate_v6` trigger in one transaction by updating `status=status` and providing the institutional release-time author.

The transaction committed without any exception. No gate was disabled or weakened.

Result: **62/62 canonical rehabilitation-owned pages passed the actual V6 release gate.**

## Institutional authorship guard

Future audits must not treat a persisted `author_display_name IS NULL` as an automatic failure.

Production has a separate trigger:

- `y_content_institutional_authorship_guard`
- function: `private.enforce_rawafid_institutional_authorship()`

Its design is:

1. V6 sees the visible author at release time and validates it.
2. The institutional-authorship guard stores that value in `schema_json.legacy_author_display_name`.
3. It then clears the published row's `author_display_name`.

After sector revalidation, all **62** canonical rehabilitation pages store `فريق تحرير منصة روافد` in `schema_json.legacy_author_display_name` and have the display field cleared by design.

## V6 rules exercised

For ordinary editorial pages, the production gate validates, among other conditions:

- SEO title present and no longer than 47 characters;
- meta description 150–160 characters;
- primary keyword and canonical URL;
- release-time visible author;
- featured-image alt text when applicable;
- `content_contract_version >= 6`;
- at least 2,500 Arabic words for ordinary editorial pages;
- at least 8 H2 and 4 H3 headings;
- at least 6 structured FAQs;
- at least 8 explicit search-intent questions;
- at least 5 secondary keywords and 8 semantic terms;
- no warning/danger callouts or duplicated inline disclaimer language;
- empty `medical_disclaimer` with the centralized `/disclaimer` route and exact label;
- valid active canonical sector/category ownership;
- taxonomy review, confidence >= 0.9, and a sufficiently detailed classification rationale;
- reference floor and at least two primary/guideline/systematic-review/official sources;
- claim-to-source mapping floor;
- reviewed source-version metadata;
- `rewrite_method = evidence-led-rewrite` and passing originality metadata;
- documented page mechanism: purpose, audience, interaction model, and content model.

## Category coverage after the latest gap-led links

| Rehabilitation category | Published/indexable linked pages |
| --- | ---: |
| Foundations of rehabilitation and functioning | 4 |
| Rehabilitation service pathways | 3 |
| Rehabilitation professions and team | 9 |
| Measurement and rehabilitation outcomes | 4 |
| Neurological rehabilitation | **14** |
| Musculoskeletal rehabilitation | 11 |
| Cardiopulmonary rehabilitation | 8 |
| Developmental and pediatric rehabilitation | **6** |
| Sensory rehabilitation | 8 |
| Cancer rehabilitation | 4 |
| Mental-health and psychosocial rehabilitation | 3 |
| Adult and geriatric rehabilitation | 7 |
| Assistive-technology rehabilitation | **6** |
| Family rehabilitation | 9 |
| Community, educational, and vocational rehabilitation | 8 |
| Telerehabilitation | 4 |
| Emergency, conflict, and disaster rehabilitation | 5 |
| Rehabilitation in Jordan and MENA | 4 |

Category totals intentionally include legitimate multi-category links, so they are not canonical ownership totals.

## Gap-led cross-linking instead of duplication

After reaching the initial 107-page checkpoint, the next audit compared the site as a whole—not just the rehabilitation sector—with current AAPM&R/PM&R KnowledgeNow topic coverage. Two important gaps were closed by strengthening and linking existing pages instead of creating duplicates.

### Cerebral palsy

Existing high-quality page: `special-ed-encyclopedia-cerebral-palsy`.

Actions:

- kept canonical ownership in the special-needs/inclusion sector;
- confirmed the page already met the V6 depth standard: **2,535** Arabic words;
- added AAPM&R Cerebral Palsy as a specialty source alongside CDC, AACPDM care pathways, WHO/ICF, ASHA AAC, and UNICEF inclusive education;
- central source links increased to **8**;
- linked the page secondarily to `developmental-rehabilitation`.

Outcome: developmental/pediatric rehabilitation increased **5 → 6** without publishing a duplicate cerebral-palsy guide.

### Pressure-injury prevention

Existing legacy page: `legacy-special-needs-guides-mobility-at-pressure-injury-prevention`.

The page was not linked immediately because its legacy body contained repetitive template-like material despite having sufficient raw length. It was rebuilt first using:

- AAPM&R Pressure Injury Management in CNS Disorders, updated 2026-06-18;
- the Fourth Edition International Pressure Injury Guideline / Living Guideline, including 2025–2026 modules for skin/tissue assessment, repositioning and mobilization, seated individuals, support surfaces, nutrition, device-related pressure injuries, and healing;
- WHO Wheelchair Provision Guidelines;
- WHO ICF.

Final page state:

- **2,789** Arabic words;
- **21 H2**, **4 H3**, **8 structured FAQs**;
- **10** central source links;
- **8** claim-to-source mappings;
- V6 contract metadata completed;
- actual production V6 revalidation passed;
- no protected classification photographs or guideline diagrams were reproduced.

The page remains canonically owned by the special-needs/inclusion sector and is now cross-linked secondarily to:

- `neurological-rehabilitation`;
- `assistive-technology-rehabilitation`.

Outcome: neurological rehabilitation **13 → 14** and assistive-technology rehabilitation **5 → 6** without duplicating the pressure-injury topic.

## Major legacy-page upgrades already completed

The final consistency pass rebuilt weaker legacy material rather than cosmetically updating metadata. Major examples include:

- psychosocial rehabilitation: ~560 → **2,653** words;
- psychosis and work: ~630 → **2,679**;
- ICF functioning/participation profile: **2,602**;
- rehabilitation goal review: **2,599**;
- child safety vs overprotection: **2,750**;
- person/family-centred rehabilitation: **2,523**;
- early-intervention motor routines: **2,579**;
- early-intervention social-emotional routines: **2,660**;
- transition from early intervention to preschool/school: **2,573**;
- neuropsychological rehabilitation: **2,586**;
- Parkinson capabilities body-text synchronization: **2,517**;
- limb difference across the lifespan: **2,678**;
- pressure-injury prevention: **2,789**.

## New high-value clinical pathway in the final expansion pass

`polytrauma-rehabilitation-guide` was added as a distinct major-trauma rehabilitation pathway rather than treating post-ICU or burn rehabilitation as a substitute.

- **2,521** Arabic words;
- **8** central sources;
- evidence families include AAPM&R Polytrauma, NICE major trauma, ERATIC 2025, and WHO emergency rehabilitation.

## Audit decision

The rehabilitation program is now **gap-led, not quota-led**.

A future page should be added only when a whole-site audit shows that:

1. a clinically meaningful pathway is genuinely absent;
2. an existing page cannot cover the gap without becoming semantically confused;
3. new guidelines or high-impact evidence materially change a decision pathway;
4. Jordan/MENA-specific service, workforce, rights, access, or system evidence creates a local gap; or
5. a legacy page is materially weaker than the current evidence standard and should be rebuilt rather than duplicated.

The whole-site search is now part of the mandatory pre-publication workflow: **find existing content → evaluate quality → enrich/link when possible → create a new page only when necessary**.