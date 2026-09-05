# Sitewide sector and section audit — 2026-09-06

Scope: active public taxonomy and published content in production Supabase plus the current `main` routing implementation.

## Executive inventory

- Active public sectors: 13
- Active categories/sections: 236
- Root sections: 106
- Total content records: 10,329
- Published: 8,307
- Indexed: 8,267
- Not published: 2,022
- Duplicate published canonicals: 0
- Published content with sector/category mismatch: 0
- Published records without a primary category: 31, all currently noindex encyclopedia candidates
- Published noindex records: 40
- Published absolute canonicals: 20

The taxonomy is broad and internally consistent, but quality is not uniform. The highest-priority problems are architectural alignment of the capabilities sector, thin/high-volume legacy content in the short encyclopedia and parts of mental health/special education, stale review clusters, and a large unpublished backlog in knowledge and mental health.

## Routing behavior verified

`/sectors/` dynamically reads all active public sectors and categories from Supabase and should display the current 13-sector map. `/sections/` likewise reads the complete category taxonomy and groups it by sector. `/sections/[slug]` renders editorial content when available, child-category cards, and linked indexed content using `content_categories`. `/sectors/[slug]` gathers all category-linked content under the sector.

Important exception: the `capabilities` sector has zero taxonomy categories, while capability pages live in a separate `/capabilities/*` content system. Because `/sectors/[slug]` only aggregates content through sector categories, `/sectors/capabilities` has no category/content library even though the capability system contains 140 published pages. This is an information-architecture mismatch, not a content shortage.

## Sector scorecard

### 1. المعرفة والموسوعة (`knowledge`) — B-

Metrics: 1,520 published / 1,518 indexed; 4 root sections; average ~8.2k characters and 5 references; 1,250 non-published records (1,194 drafts, 56 archived).

Root sections:
- البحث والأدلة والتعلم — 403 linked indexed pages; editorial landing exists. High volume, but average depth/reference density is lower than the strongest sectors and public samples show repeated structural boilerplate. Requires similarity/originality review rather than more volume.
- الدافعية والسلوك — 104 pages. Useful coverage but ~5.2k characters / 3 refs average: needs depth uplift.
- المصطلحات والعمليات المعرفية — about 1,002 linked indexed pages. Broad and valuable, but volume demands deduplication and intent-collision control.
- علوم القرار الطبي — 12 pages, deeper (~15k chars / 5 refs). Strong seed, under-expanded.

Priority: stop bulk expansion temporarily; process the 1,194-draft backlog only after duplicate/search-intent review; strengthen references and differentiation in research-evidence and motivation content.

### 2. سرطان الأطفال (`pediatric-oncology`) — A-

Metrics: 141 published/indexed; 35 categories; 9 roots; ~15.8k chars / 7 refs; no stale >30d.

Root coverage (subtree): research/evidence 10; types/diagnosis 18; daily life/school 6; psychosocial/family 39; theses 16; palliative/bereavement 8; supportive rehab 9; treatment/clinical care 4; survivorship/late effects 31.

Strengths: excellent depth, references, survivorship and psychosocial coverage, current review state.

Gap: eight root landings have child sections but no linked indexed content and no editorial landing. They are navigational shells rather than rich section hubs. Treatment/clinical care is relatively underrepresented compared with psychosocial/survivorship.

Priority: add concise editorial landing content to root categories and expand treatment-care, diagnostics pathways, supportive-care protocols, and research/trials without duplicating child pages.

### 3. الرعاية التلطيفية (`palliative-care`) — A-

Metrics: 50 published/indexed; 10 roots; ~16.4k chars / 7 refs; no stale pages.

Sections: basics 3; evidence/resources 1; medicines/safety 1; family/caregivers 3; symptoms/QoL 15; communication/decisions 6; services/professionals 5; by-condition 9; children 4; home/community 3.

Strengths: high depth, good evidence density, clinically coherent taxonomy.

Gaps: medicines/safety and global evidence/resources are too thin as sections; home/community and family/caregiver coverage could be richer; no need for more categories yet.

Priority: enrich the thin sections and add practical symptom-management and service-delivery pathways.

### 4. الصرع والنوبات (`epilepsy`) — A-/B+

Metrics: 33 published; 32 indexed by primary mapping; 16 roots; ~16.1k chars / 8 refs; no stale pages. Using `content_categories`, all roots have displayed indexed content, including syndromes (14), tools (5), SUDEP (3), children (6), daily life (7), research (8), emergency (6), diagnosis (5), treatment (3), drug-resistant epilepsy (5).

Strengths: strong evidence density and current review status; comprehensive topic map.

Gap: root `epilepsy-start` contains a high-quality noindex cornerstone and should be checked for intentional noindex/canonical logic. Several sections have only 2–3 displayed pages, but are not empty.

Priority: keep taxonomy stable; deepen reproductive health, treatment, SUDEP and misconceptions; verify start-page indexing intent.

### 5. الاحتياجات الخاصة والتربية الدامجة (`special-needs-inclusion`) — B

Metrics: 1,339 published / 1,337 indexed; 78 categories; 10 roots; ~10.8k chars / 6 refs; 175 stale >30d.

Root sections:
- الأسرة والخدمات والرعاية — 10 linked indexed root-level pages plus children; strong.
- التعلم والتعليم الدامج — 46 root-linked; child areas include dyslexia, dyscalculia, writing and educational assessment. High stale cluster.
- التواصل واللغة وAAC — 36 root-linked; AAC itself strong; developmental-language has a large stale cluster.
- التوحد والنمو العصبي — 26 root-linked; autism 105, ADHD 88, developmental conditions 120. High volume, lower average depth and the largest refresh burden.
- الحس والحركة والتقنيات المساعدة — 12 root-linked; sensory-processing is relatively thin.
- الحقوق والانتقال والمشاركة المجتمعية — 6 root-linked; coherent but can expand MENA/legal implementation.
- الدمج والتسهيلات وإتاحة التعلم — 5 root-linked; needs editorial strengthening.
- القدرات ونقاط القوة والوصول — 270 root-linked, mature cross-functional content.
- متلازمة X الهشّة — 45 indexed + one noindex root editorial; excellent depth (~18k chars / ~10 refs), currently one of the strongest specialist centers.
- موسوعة التربية الخاصة — 543 linked indexed items but uneven depth; some subareas remain very thin and stale.

Critical refresh clusters: special-ed assessment (56.7% stale), educational assessment (40.7%), writing (42.9%), developmental language (39.4%), autism root (30.8%), special-ed behavior/mental health (30.4%), dyslexia (29.4%), autism (27.6%), learning disabilities (25%), speech/fluency (25%), ADHD (23.9%).

Priority: refresh/upgrade before adding volume; merge or deepen thin special-education encyclopedia pages; preserve Fragile X as model for future syndrome centers.

### 6. الصحة النفسية (`mental-health`) — C+/B-

Metrics: 1,172 published / 1,170 indexed; 18 categories / 13 roots; ~6.4k chars / 4 refs; 66 stale; 468 non-published (420 drafts, 48 archived).

Roots: personality 21; anxiety 149; depression/mood 105; dissociative 4; services/treatment/decision 477; cognitive aging 28; child/adolescent 159 linked; infant/early-childhood 12; trauma/stress/loss 101; somatic/health anxiety 4; sleep 81; OCD-related 41; emotional regulation 46.

Strengths: excellent breadth and strong new infant/early-childhood architecture. Child/adolescent is strategically important.

Weaknesses: average page depth/reference density are low relative to medical specialty sectors; very large services category risks search-intent overlap; depression has 21% stale; infant/early-childhood subcategories have some stale cross-linked content despite strong new pages; 420 drafts indicate unresolved pipeline debt.

Priority: no bulk publishing until services-care is decomposed by intent, stale/high-value pages are refreshed, and low-reference pages are upgraded. Infant/early-childhood should become the quality model for future mental-health sections.

### 7. لنرتقي بقدراتهم (`capabilities`) — content A-, architecture D

Taxonomy metrics: sector row exists, but 0 categories and 0 sector-linked content.

Actual capability system: 140 published pages, 139 indexed, ~12.5k chars / 10 refs average, only 1 stale. Content quality is strong.

Routing problem: `/capabilities/[slug]` loads `capabilities-*` records directly, while `/sectors/capabilities` can only aggregate through categories and therefore renders an empty sector library. `/sections/` also reports it as a direct specialist path with no category layer.

Priority P0: either (A) formally make capabilities a cross-cutting standalone program and remove it from the sector taxonomy, or (B) create a category bridge/sector aggregation mechanism so `/sectors/capabilities` exposes the 140 pages. Do not duplicate the pages into new content records.

### 8. التأهيل والوظيفة والمشاركة (`rehabilitation-functioning`) — B+

Metrics: 29 primary published pages, but many additional pages are cross-linked into its sections; 18 roots; ~18k chars / 6 refs; no stale primary pages.

Displayed linked content by root: foundations 4; family 9; sensory 8; neurological 7; musculoskeletal 6; cardiopulmonary 2; community/vocational 8; psychosocial 3; developmental 5; telerehab 4; MENA/Jordan 0; emergency 3; cancer rehab 3; assistive tech 5; outcomes 4; adult/geriatric 6; service pathways 3; professions 1.

Strengths: very high page depth; coherent ICF-style functional framing; good cross-linking.

Gap: `rehabilitation-mena-jordan` is the only genuinely empty root section in this sector. Cardiopulmonary, professions and some service pathways are thin.

Priority: build the Jordan/MENA rehabilitation section first; then deepen professions, cardiopulmonary, community/vocational and pediatric/developmental implementation. AAPM&R resources are a good enrichment source rather than a reason to add more taxonomy.

### 9. الطفل والأسرة والمدرسة (`child-family-education`) — A-/B+

Metrics: 406 published/indexed; 20 categories; 2 roots; ~12.8k chars / 7 refs; 6 stale.

Roots:
- التربية والوالدية والأسرة — 256 linked indexed at root plus child taxonomy. Broad and useful; marital counseling has 45.5% stale.
- حماية الطفل والسلامة الرقمية — 117 linked indexed; ~19k chars / 9 refs in primary content; one of the strongest new areas.

True empty leaf sections: `family-counseling-by-condition` and `premarital-counseling` have no linked indexed content. Some digital-safety child categories have no direct mapping but the root has extensive content; they should be mapped or converted into real hubs only when there is distinct content.

Priority: fill or deactivate the two empty family-counseling leaves; refresh marital counseling; keep child-safety taxonomy tight and evidence/attribution-specific.

### 10. الأمراض النادرة (`rare-diseases`) — A-/B+

Metrics: 44 primary published/indexed; 10 roots; ~19.2k chars / 8 refs; no stale.

Displayed linked roots: start 4; family 7; MENA 9; research/trials 14; data/registries 14; diagnosis/genomics 17; care/treatment 13; life-course 6; patient/family navigation 5; condition library 74.

Strengths: exceptional depth and evidence density. The formerly apparently-empty condition library and life-course sections are actually populated through secondary mappings.

Priority: expand condition-level coverage carefully through one canonical condition page per entity; strengthen transition/life-course and MENA service navigation. Avoid creating duplicate rare-condition pages across encyclopedia/capabilities/special-needs.

### 11. المتدربون والمتطوعون (`trainees-volunteers`) — A-

Metrics: 33 published/indexed; 8 categories under one root; ~15.2k chars / 6 refs; no stale.

Root `safe-practice-supervision` has 3 root-linked pages plus seven child topics.

Strengths: focused, coherent, safe-practice framing.

Gap: smaller breadth is appropriate; needs stronger onboarding pathways, competency evidence, boundaries, supervision escalation and role-specific checklists rather than more general articles.

### 12. الموسوعة المختصرة (`short-encyclopedia`) — C

Metrics: 3,359 published; 3,327 indexed; 2 roots; average ~1.6k chars / 2 refs.

Roots: special-needs/inclusive education ~2,712 linked indexed; psychology terms ~1,202 linked indexed (cross-link counts overlap with broader taxonomy).

Purpose can justify short entries, but the current scale creates SEO/quality risk: thin pages, low reference density, overlap with the main encyclopedia and deep sector pages, and potential search-intent cannibalization.

Priority P0/P1: define a strict role for the short encyclopedia (definition/brief orientation only), consolidate entries that answer the same intent as deep pages, use canonical/internal linking to a definitive page, and no longer treat raw page count as success.

### 13. الإدمان والتعافي (`addiction-recovery`) — B+

Metrics: 181 published / 180 indexed; 17 categories / 11 roots; ~11.2k chars / 5 refs; only 1 stale; 64 non-published (59 drafts, 5 archived).

Roots displayed: conditions 83; family 19; withdrawal 9; recovery 15; professional education 5 root-linked plus six children; treatment 26; special populations 12; community/peer systems 9; evidence/governance 6; prevention 5; harm reduction 6.

Strengths: strong interactive architecture (atlas/comparisons/interactions exposed by sector route), professional-education content is deep, evidence/governance has very high reference density.

Weaknesses: conditions cluster is relatively thin (~6.7k chars / 4 refs average); prevention, harm reduction, community systems and special populations have much less depth than the condition library.

Priority: rebalance toward prevention, harm reduction, overdose safety, service systems, women/pregnancy, adolescents, co-occurring disorders and recovery outcomes; strengthen condition pages before adding more substances.

## Cross-site section findings

### Only 11 active categories currently have zero linked indexed content

1. Pediatric oncology root shells with children but no root content/editorial: research/evidence, types/diagnosis, daily life/school, psychosocial/family, theses, palliative/bereavement, supportive rehab, treatment/clinical care.
2. Rehabilitation: `rehabilitation-mena-jordan` — true empty root.
3. Child/family: `family-counseling-by-condition` — true empty leaf.
4. Child/family: `premarital-counseling` — true empty leaf.

The pediatric oncology root shells are not dead ends because they have child cards; however, adding editorial hub content would materially improve their usefulness and SEO.

### Highest stale-review clusters

- special-ed assessment/measurement — 56.7%
- marital counseling — 45.5%
- writing/dysgraphia — 42.9%
- educational assessment — 40.7%
- inclusion/accommodations — 40%
- developmental language — 39.4%
- IECMH regulation/development — 36.4%
- autism-neurodevelopment root — 30.8%
- special-ed behavior/mental health — 30.4%
- IECMH caregiver/perinatal — 30%
- special-ed intervention/rehab — 30%
- dyslexia — 29.4%
- autism — 27.6%
- learning disabilities / speech-fluency — 25%
- ADHD — 23.9%
- dyscalculia — 22.2%
- depression/mood — 21%
- developmental conditions — 16.7%

### Backlog concentration

- Knowledge: 1,194 drafts
- Mental health: 420 drafts
- Special needs/inclusion: 94 drafts
- Addiction/recovery: 59 drafts
- Short encyclopedia: 42 drafts
- Child/family: 16 drafts

The backlog should not be bulk-published. It should be deduplicated against the 8,307 live pages, checked for search-intent ownership and routed through the current V6 quality contract.

## Sitewide priority order

P0 — Fix architecture/quality risk:
1. Capabilities sector vs standalone `/capabilities/*` mismatch.
2. Short encyclopedia role, consolidation and cannibalization controls.
3. Stale-review clusters in special education/autism/ADHD/language and mental health.

P1 — Fill real coverage gaps:
4. Rehabilitation Jordan/MENA.
5. Pediatric oncology root editorial hubs and treatment/clinical-care depth.
6. Child/family empty leaves: premarital counseling and counseling-by-condition.
7. Addiction prevention/harm reduction/community/special populations.

P2 — Improve depth and balance:
8. Mental-health services cluster decomposition and reference uplift.
9. Knowledge/research-evidence originality and template-similarity review.
10. Palliative evidence/resources and medicine safety expansion.
11. Rare-disease life-course/MENA navigation expansion.

## Bottom line

The site is no longer suffering from a shortage of pages. It has enough breadth to behave like a large knowledge platform. The next quality jump will come from taxonomy alignment, refresh discipline, deduplication, stronger editorial hubs, intentional ownership of search intent, and rebalancing weak sections—not from publishing another indiscriminate wave of pages.
