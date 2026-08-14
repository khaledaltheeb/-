# Care Guides rich expansion — Wave 001

## Release outcome

Wave 001 was released in the Rawafid V3 Supabase CMS on 2026-08-14 only after the database V6 publication gate passed.

Final outcome:

- **7 net-new guides** were promoted through `approved` to `published` and `robots_index=true`.
- **3 overlapping candidates were not published as competing URLs**. Their unique value was merged into stronger existing canonicals.
- The three rejected candidate rows are `archived` and `noindex`.
- No scientific reviewer identity or credential was fabricated. The recorded review is structural, source, taxonomy, originality and publication-gate review.

## Net-new published guides

| # | Canonical | V3 category |
|---|---|---|
| 1 | `/care-guides/aac-communication-partner-training/` | التواصل المعزز والبديل AAC |
| 2 | `/care-guides/assistive-technology-trial-follow-up/` | التقنيات المساعدة |
| 3 | `/care-guides/first-developmental-services-referral/` | دعم الأسرة والتنقل بين الخدمات |
| 4 | `/care-guides/inclusive-school-field-trip-plan/` | التعليم الدامج والمشاركة الصفية |
| 5 | `/care-guides/multidisciplinary-assessment-preparation/` | التنسيق متعدد التخصصات |
| 6 | `/care-guides/pediatric-to-adult-healthcare-transition/` | الانتقال إلى الرشد |
| 7 | `/care-guides/public-transport-independence-training/` | الحياة اليومية والاستقلال |

## Canonical upgrades instead of duplicate publication

| Candidate rejected as duplicate | Canonical retained and upgraded | Decision |
|---|---|---|
| `/care-guides/school-accommodation-trial-review/` | `/content/classroom-accommodations` | unique trial/review methodology merged into the established school-accommodations canonical |
| `/care-guides/accessible-dental-visit-disability/` | `/care-guides/sensory-friendly-dental-visit/` | existing dental canonical expanded to cover sensory, communication and physical access |
| `/care-guides/supported-decision-making-disability/` | `/care-guides/supported-decision-making-special-needs/` | existing supported-decision canonical replaced with the richer evidence-led version |

This preserves one canonical destination per intent rather than publishing thin or competing variants.

## V6 publication contract passed

Before release, the rich guides were brought above the database-enforced thresholds, including:

- at least 2,500 Arabic words;
- at least 8 H2 and 4 H3 headings;
- at least 6 structured FAQ items;
- at least 8 explicit search-intent questions;
- at least 5 secondary keywords and 8 semantic terms;
- at least 5 references, including the required authoritative/primary/guideline/systematic-review coverage;
- at least 5 explicit claim-to-source mappings;
- source-version provenance;
- `evidence-led-rewrite` and a passing originality record;
- reviewed taxonomy, classification confidence >= 0.9 and a substantive rationale;
- a documented page mechanism covering purpose, audience, interaction model and content model;
- the central `/disclaimer` contract instead of duplicate inline disclaimer copy;
- active category/sector integrity;
- canonical and SEO metadata within the release limits.

Final candidate measurements were approximately **2,635–2,917 Arabic words** before publication, with **6–8 references** in the new candidates and four or more level-3 subsections in every released/upgrade source page.

## Evidence model

Bibliographies are topic-specific rather than copied as one universal source bundle. The wave uses combinations of WHO, UNICEF, UN CRPD resources, CDC, AAP, ASHA, NHS England, CAST, Got Transition, U.S. Department of Education and World Bank material, plus peer-reviewed systematic reviews or research where they materially strengthen the topic.

Reference records were normalized with stable IDs, source types and authority tiers. `schema_json.claim_source_map` links substantive claims to the source records used by each page.

## Deduplication method

Publication decisions combined exact collision checks with semantic similarity review against the current published Rawafid corpus. Exact canonical/title/primary-keyword collisions were zero at candidate creation. Semantic review then identified the three intent-level overlaps above and forced canonical upgrades instead of new indexed URLs.

## Application exposure

Rawafid's care-guide detail route is dynamic and resolves an exact `/care-guides/.../` canonical only when the CMS row is `published` and its publication time has arrived. The content sitemap independently selects `published` + `robots_index=true` records. The seven new guides satisfy those database states.

Direct browser/HTTP verification of the `workers.dev` staging host could not be completed from the execution environment because the host could not be fetched/resolved there. CMS state, the V6 database release gate, route contract and sitemap contract were verified instead.

## Audit trail

Supabase `audit_logs` records:

- original rich-draft creation/review records;
- `rich_wave_publish` for the seven new pages;
- `canonical_content_upgrade` for the three retained canonicals;
- `deduplication_merge` for the rejected candidate routes.

## Rule for the next wave

Future pages continue from measured taxonomy/search gaps. A candidate must prove a distinct user/search intent and canonical destination first, then meet the same source, depth, originality, SEO, accessibility and V6 release contracts before publication.
