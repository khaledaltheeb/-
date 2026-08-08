# MIG-000013 — التحيزات المعرفية

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **DRAFT QA PASS — WORKFLOW / POST-PUBLISH QA PENDING**
- Canonical key: `cognitive-biases`
- Canonical: `/content/cognitive-biases`
- Content type: `glossary_term`
- Supabase content id: `f7f15fe4-5e03-4f2f-a6a3-0358baf039fd`
- Current version: **v1**
- Database status: `draft`
- Sector/category: `knowledge` / `cognitive-processes`

## Legacy evidence and canonical decision

`scripts/scale_site_v8.py` explicitly lists `التحيزات المعرفية / Cognitive Biases` as an independent encyclopedia domain in the old generated site. The old generator expanded the domain into generic numeric `concept-*` facets; no numeric route is inferred or redirected from arithmetic alone.

The parent page covers the general concept and major mechanisms. It does not consume independent canonicals for:
- reasoning
- decision making
- problem solving
- creativity
- confirmation bias
- anchoring bias
- availability heuristic
- framing effect
- hindsight bias
- other named biases when later evidence/search intent supports dedicated pages.

## Authoritative sources

1. Tversky & Kahneman — Judgment under Uncertainty: Heuristics and Biases (Science, 1974).
2. Tversky & Kahneman — The framing of decisions and the psychology of choice (Science, 1981).
3. APA Dictionary — Confirmation Bias (2018).
4. APA Dictionary — Anchoring Bias (2018).
5. APA Dictionary — Availability Heuristic (2023 update).
6. APA Dictionary — Hindsight Bias (2018).
7. APA Dictionary — Representativeness Heuristic (2018).
8. Systematic review and meta-analysis of educational approaches to reduce cognitive biases among students (Nature Human Behaviour, 2025).

All stored source URLs use HTTPS.

## Content coverage

- cognitive bias versus random error
- heuristic versus bias
- representativeness and base-rate neglect
- availability heuristic
- anchoring bias
- confirmation bias
- framing effect
- hindsight bias
- overconfidence/calibration
- memory, attention and attribution-related biases
- cognitive biases versus cognitive distortions
- expertise and bias
- how biases are measured rather than merely alleged
- limits of introspective labeling
- debiasing through process/environment design
- limits and transfer of debiasing training
- practical eight-step review process
- comparison table and 11 visible FAQ questions

## Draft QA — verified directly from Supabase

- Searchable useful words: **2021**
- Structured blocks: **44**
- H2: **17**
- FAQ: **11**
- Tables: **1**
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

- Primary entity: `التحيزات المعرفية`
- SEO title: `التحيزات المعرفية: كيف تؤثر في الحكم والقرار`
- SEO title length: **44 chars**
- Meta Description length: **154 chars**
- Canonical: `/content/cognitive-biases`
- Search intent: `informational`
- Visible FAQ → FAQPage schema
- `glossary_term` → DefinedTerm schema

## Redirect decision

No generated `concept-*` legacy URL is guessed. Named-bias pages remain separate when they have independent intent.

## Remaining before COMPLETE

1. Run the actual database workflow through Scheduled → Published.
2. Verify `التحيزات المعرفية` ranks this canonical first.
3. Verify `الاستدلال` and `اتخاذ القرار` still rank their own canonicals first and the parent bias page remains related rather than cannibalizing them.
4. Confirm duplicate canonical and related redirect collisions are zero.
5. Close Claim #97 and update the central ledger.
