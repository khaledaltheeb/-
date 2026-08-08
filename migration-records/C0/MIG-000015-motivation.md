# MIG-000015 — الدافعية

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **DRAFT QA PASS — WORKFLOW / POST-PUBLISH QA PENDING**
- Canonical key: `motivation`
- Canonical: `/content/motivation`
- Content type: `glossary_term`
- Supabase content id: `fbf11969-19d2-49d8-841d-ae0222d4fb48`
- Current version: **v1**
- Database status: `draft`
- Sector: `knowledge`
- Primary category: `motivation-behavior` — الدافعية والسلوك

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

## Draft QA — verified directly from Supabase

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
- Versions before workflow: **1**

Internal/public-body scan:
- TODO: PASS
- FIXME: PASS
- Canonical/Redirect language: PASS
- migration/agent language: PASS
- banned term `معاقين`: PASS

## SEO

- Primary entity: `الدافعية`
- SEO title: `الدافعية: كيف تبدأ السلوك وتحافظ على الجهد`
- SEO title length: **42 chars**
- Meta Description length: **157 chars**
- Canonical: `/content/motivation`
- Search intent: `informational`
- Visible FAQ → FAQPage schema
- `glossary_term` → DefinedTerm schema

## Redirect decision

No verified standalone non-generated legacy motivation URL has been identified, so no numeric `concept-*` route is guessed. Academic motivation remains a distinct future canonical.

## Remaining before COMPLETE

1. Run the actual database workflow through Scheduled → Published.
2. Verify search `الدافعية` ranks `/content/motivation` first.
3. Verify search `العادات` remains owned by `/content/habits`.
4. Verify `الدافعية الدراسية` does not get silently canonicalized into the general page; if no dedicated page exists yet, record that gap rather than inventing a redirect.
5. Confirm duplicate canonical and related redirect collisions are zero.
6. Close Claim #105 and update central ledger.
