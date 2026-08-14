# Care Guides rich expansion — Wave 001

## Release outcome

Wave 001 is no longer a draft-only experiment. The evidence-led content review was completed in the Rawafid V3 Supabase CMS on 2026-08-14 and the release was allowed only after the database V6 publication gate passed.

Final outcome:

- 7 net-new care guides were promoted through `approved` to `published` and `robots_index=true`.
- 3 overlapping candidates were not published as competing URLs.
- Their unique value was merged into the stronger existing canonicals instead.
- All 10 intended subject areas therefore improved the live content system without creating 10 competing pages.
- No scientific specialist identity or credential was fabricated. The recorded review is structural, source, taxonomy, originality and publication-gate review only.

## Net-new published guides

| # | Canonical | V3 category | V6 result |
|---|---|---|---|
| 1 | `/care-guides/aac-communication-partner-training/` | التواصل المعزز والبديل AAC | published + indexable |
| 2 | `/care-guides/assistive-technology-trial-follow-up/` | التقنيات المساعدة | published + indexable |
| 3 | `/care-guides/first-developmental-services-referral/` | دعم الأسرة والتنقل بين الخدمات | published + indexable |
| 4 | `/care-guides/inclusive-school-field-trip-plan/` | التعليم الدامج والمشاركة الصفية | published + indexable |
| 5 | `/care-guides/multidisciplinary-assessment-preparation/` | التنسيق متعدد التخصصات | published + indexable |
| 6 | `/care-guides/pediatric-to-adult-healthcare-transition/` | الانتقال إلى الرشد | published + indexable |
| 7 | `/care-guides/public-transport-independence-training/` | الحياة اليومية والاستقلال | published + indexable |

## Canonical upgrades instead of duplicate publication

Three candidates were rejected as separate public pages after semantic/canonical review and their unique material was merged into existing stronger destinations:

| Candidate rejected as duplicate | Canonical retained and upgraded | Decision |
|---|---|---|
| `/care-guides/school-accommodation-trial-review/` | `/content/classroom-accommodations` | trial/review methodology merged into existing school-accommodations canonical |
| `/care-guides/accessible-dental-visit-disability/` | `/care-guides/sensory-friendly-dental-visit/` | existing dental canonical expanded to broader sensory, communication and physical-access guidance |
| `/care-guides/supported-decision-making-disability/` | `/care-guides/supported-decision-making-special-needs/` | existing supported-decision canonical replaced with the richer evidence-led version |

The three candidate rows are archived and non-indexable. Audit-log entries record the merge targets.

## V6 publication contract actually passed

Before publication, the active rich guides were brought above the database-enforced thresholds, including:

- at least 2,500 Arabic words per editorial page;
- at least 8 H2 and 4 H3 headings;
- at least 6 structured FAQ items;
- at least 8 explicit search-intent questions;
- at least 5 secondary keywords and 8 semantic terms;
- at least 5 authoritative references, with at least 2 primary/official/guideline/systematic-review sources;
- at least 5 explicit claim-to-source mappings;
- reviewed source-version provenance;
- `evidence-led-rewrite` and a passing originality record;
- reviewed taxonomy, classification confidence >= 0.9 and a substantive classification rationale;
- a documented page mechanism covering purpose, audience, interaction model and content model;
- the central `/disclaimer` contract rather than duplicated inline disclaimer language;
- active category/sector integrity;
- canonical and SEO metadata within release limits.

The final candidate measurements were approximately 2,635–2,917 Arabic words before publication, with 6–8 references and four or more level-3 subsections in every released/upgrade source page.

## Sources and evidence model

Bibliographies are topic-specific. The wave uses combinations of official and professional sources such as WHO, UNICEF, United Nations CRPD resources, CDC, AAP, ASHA, NHS England, CAST, Got Transition, U.S. Department of Education and World Bank, plus peer-reviewed systematic reviews or research where they materially strengthen the topic.

Reference records were normalized with stable IDs, source types and authority tiers before release. Claims in `schema_json.claim_source_map` are linked to the source records used for each page.

## Deduplication method

Publication decisions used both exact collision checks and semantic similarity checks against the current published corpus. Exact canonical/title/primary-keyword collisions were zero for the initial candidates. Semantic review then identified the three intent-level overlaps listed above. Those candidates were merged instead of indexed, preserving one canonical destination per intent.

## Application exposure

Rawafid's care-guide detail route is dynamic and resolves a guide by exact `/care-guides/.../` canonical only when the CMS row is `published` and its publication time has arrived. The content sitemap independently selects `published` + `robots_index=true` records. The seven new guides satisfy those database states.

External HTTP verification of the `workers.dev` staging host could not be completed from the execution environment because direct DNS/fetch access to that host failed. The CMS state, V6 database gate, route contract and sitemap contract were verified instead. A browser-level staging smoke check remains useful when the host is reachable from the verification environment.

## Audit trail

Supabase `audit_logs` now includes:

- the original draft-creation review records;
- `rich_wave_publish` entries for the seven new published guides;
- `canonical_content_upgrade` entries for the three retained canonicals;
- `deduplication_merge` entries for the three rejected candidate routes.

## Next expansion rule

Future waves should continue from measured taxonomy/search gaps, not arbitrary page quotas. Every candidate must first prove a distinct search/user intent and a canonical destination, then meet the same source, depth, originality, SEO, accessibility and V6 release contracts before publication.
