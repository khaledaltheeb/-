# MIG-000015 — الدافعية

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key: `motivation`
- Canonical: `/content/motivation`
- Content type: `glossary_term`
- Supabase content id: `fbf11969-19d2-49d8-841d-ae0222d4fb48`
- Final versions: **8**
- Audit events: **8**
- Database status: **published**
- Sector: `knowledge`
- Primary category: `motivation-behavior` — الدافعية والسلوك
- Published at: `2026-08-08T13:49:43Z`

## Legacy evidence and canonical decision

The old encyclopedia generator (`scripts/scale_site_v8.py`) explicitly separates:
- `الدافعية / Motivation` under `الدافعية والسلوك`
- `الدافعية الدراسية / Academic Motivation` under educational psychology.

The general motivation canonical therefore does not consume academic motivation. It also remains separate from `/content/habits`, self-control, goals, rewards/reinforcement, implementation intentions and clinical low-motivation states.

## Authoritative sources

1. APA Dictionary — Motivation (2018).
2. APA Dictionary — Intrinsic Motivation (2018).
3. APA Dictionary — Extrinsic Motivation (2018).
4. Ryan & Deci — Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being (2000).
5. Wigfield & Eccles — Expectancy-Value Theory of Achievement Motivation (2000).
6. Salamone & Correa — The Neurobiology of Activational Aspects of Motivation: Exertion of Effort, Effort-Based Decision Making, and the Role of Dopamine (2024).
7. Deci, Koestner & Ryan — meta-analysis of extrinsic rewards and intrinsic motivation (1999).
8. Testing a continuum structure of self-determined motivation — meta-analysis (2018).

All stored source URLs use HTTPS.

## Content coverage

- motivation as direction, effort and persistence
- motive versus motivation versus intention
- motivation versus habit, discipline and skill
- intrinsic and extrinsic motivation without moralizing the distinction
- continuum of relative autonomy in self-determination theory
- autonomy, competence and relatedness as an SDT research framework
- expectancy, value and cost
- choice, effort and persistence as separable motivational outcomes
- goal selection versus goal implementation
- effort as a cost in motivational decisions
- dopamine and effort-related activation without “dopamine = motivation/reward chemical” simplification
- nuanced effects of external rewards and positive feedback
- social/environmental support and barriers
- intention-behavior gap
- low motivation as a non-specific description, not a diagnosis or character defect
- domain-specific measurement
- nine-step environment/goal design framework
- explicit separation of general and academic motivation
- common misconceptions and 11 visible FAQ items

## Final content / SEO QA

Verified directly from Supabase before workflow:
- Searchable useful words: **2385**
- Structured blocks: **51**
- H2: **19**
- FAQ: **11**
- Tables: **2**
- Lists: **1**
- References: **8**, all HTTPS
- Tags: **8**
- Category relations: **1**
- Search aliases: **6**
- Duplicate canonical: **0**
- SEO title: `الدافعية: كيف تبدأ السلوك وتحافظ على الجهد` — **42 chars**
- Meta Description: **157 chars**

Internal/public-body scan:
- TODO: PASS
- FIXME: PASS
- Canonical/Redirect language: PASS
- migration/agent language: PASS
- banned term `معاقين`: PASS

## Workflow / Audit

The page passed in Supabase:
`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

No human reviewer identity or credentials were fabricated; reviewer fields remain null for this non-diagnostic glossary page.

Final database state:
- **8 versions**
- **8 audit events**
- status: **published**

## Post-publish QA

Search query `الدافعية` returns `/content/motivation` first with score ~**11.9**.

Search query `العادات` remains correctly owned by `/content/habits` with score ~**5.3**; `/content/motivation` is only a lower related result (~**0.4**).

Search query `الدافعية الدراسية` currently has **no dedicated academic-motivation canonical** in Supabase. The general motivation page appears as the closest current result, but this is recorded as a **canonical gap for future migration**, not as a reason to merge or redirect the academic topic.

- Duplicate canonical: **0**
- Redirect collisions from habit/academic/reward/self-control routes: **0**
- Tags/category relations: **PASS**
- Search: **PASS**

## Redirect decision

No verified standalone non-generated legacy motivation URL has been identified, so no numeric `concept-*` route is guessed. Academic motivation remains a distinct future canonical.

## Final result

**MIG-000015 is genuinely closed and canonicalized after database-backed QA.**
