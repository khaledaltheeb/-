# A5-000020 — المراجعة الشاملة للمراجعات

- Claim: **#40**
- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical: `/content/umbrella-review`
- Supabase content id: `6df7a0e1-24d4-4eba-888d-069717af60ab`
- Final CMS version: **v8**

## Legacy / canonical decision

Verified legacy source:
- `scripts/publish_academic_library_v326.py`
- original v326 source commit `367186ccdd188e991f811a6210483b443dc3cd59`
- legacy entry `umbrella-review` / «المراجعة الشاملة للمراجعات» / `Umbrella Review`
- verified generated route `/library/research/umbrella-review/`

Before Claim creation, GitHub Issues, `docs/MIGRATION-PROGRESS.md`, Supabase content slugs/canonicals/search aliases and redirects were searched using Arabic and English synonyms including `umbrella review`, `overview of reviews`, and `review of reviews`. No matching Claim or canonical existed. The compact legacy entry was used for discovery only; the canonical was rebuilt from scratch.

## Source and evidence verification

1. **Cochrane Handbook Chapter V: Overviews of Reviews, Handbook v6.5 (2024)** — current methodological handbook chapter. Used for the definition of an Overview, review-level searching/inclusion, eligibility, overlap decisions, citation matrices, double-counting risk, appraisal, data extraction, certainty and update logic. Cochrane explicitly treats the systematic review as the primary unit of searching/inclusion/analysis and warns that overlapping reviews can give duplicated primary-study data excessive statistical weight and overly precise estimates.
2. **JBI Manual for Evidence Synthesis (2024), Umbrella Reviews chapter** — current JBI methodological manual covering protocol, PICO, search, critical appraisal, extraction, synthesis and conclusions. JBI and Cochrane are treated as distinct methodological frameworks rather than blended as interchangeable rules.
3. **Gates et al., BMJ (2022), DOI 10.1136/bmj-2022-070849 — PRIOR statement** — evidence- and consensus-based reporting guideline for overviews of healthcare intervention reviews. The finalized checklist has 27 main items and 19 sub-items. It is treated as reporting guidance, not proof of methodological quality and not automatically generalized to every diagnostic/qualitative/prognostic overview.
4. **Shea et al., BMJ (2017), DOI 10.1136/bmj.j4008 — AMSTAR 2** — critical appraisal tool for systematic reviews of randomized and/or non-randomized healthcare intervention studies. The page explicitly rejects converting AMSTAR 2 into a naive arithmetic score and preserves the distinction between critical and non-critical domains and overall confidence.
5. **Pieper et al., Journal of Clinical Epidemiology (2014), PMID 24581293** — systematic methodological study of overlap reporting in 60 overviews. Only 32 mentioned overlap; median CCA was 4.0. Used as historical empirical evidence that overlap was frequently underreported, not as a universal threshold for review quality.
6. **Hennessy & Johnson, Research Synthesis Methods (2020), DOI 10.1002/jrsm.1390** — methodological guidance for CCA. Used to explain that CCA quantifies overlap but does not itself solve the non-independence caused by repeated primary studies.

## Rebuild scope

The canonical now covers:
- definition and terminology of Umbrella/Overview/Review of Reviews;
- when this design is appropriate and when a new systematic review or scoping review is better;
- systematic review as the inclusion unit;
- question and eligibility definition;
- protocol and deviations;
- searching for systematic reviews and review currency;
- overlapping reviews and pre-specified prioritization strategies;
- primary-study overlap, citation matrices and CCA;
- double-counting and false precision;
- methodological quality/risk-of-bias appraisal;
- AMSTAR 2 critical domains and scoring limitations;
- ROBIS as an alternative risk-of-bias framework in applicable questions;
- distinction between review quality and primary-study risk of bias;
- result extraction and when returning to primary studies changes the design burden;
- collecting versus reassessing data;
- discordant reviews and why vote counting is invalid;
- GRADE versus AMSTAR 2;
- inherited missing evidence/publication bias;
- review currency and outdated searches;
- PRIOR 2022 versus PRISMA;
- JBI methodological boundaries;
- why network meta-analysis should not be improvised from overlapping review-level data;
- statistical dependence among reviews;
- overview updating;
- practical planning/execution/reporting workflow;
- common errors, reader appraisal and FAQ.

## Content QA

- Useful word-like count: **2701**
- H1: **1** via title
- H2: **36**
- H3: **3**
- FAQ: **8**
- References: **6**
- Tags: **5**
- Primary category relations: **1**
- Versions: **8**
- Audit events: **8**
- Active redirects: **1**
- Canonical rows: **1**
- Slug rows: **1**
- Internal TODO/FIXME/QA/agent/built-not-published markers: **0**
- SEO title: **47 chars**
- Meta description: **152 chars**
- Featured image: none; Alt **N/A**

## SEO / E-E-A-T

- Primary keyword: `المراجعة الشاملة للمراجعات`
- Search aliases include Arabic variants plus `umbrella review`, `overview of reviews`, `overview of systematic reviews`, `review of reviews`, `CCA` and `PRIOR`.
- Search intent: informational.
- Visible author: `فريق تحرير منصة روافد`.
- No fabricated human reviewer, qualification, partnership or endorsement.
- Structured Article metadata matches visible metadata.
- Internal links connect systematic-review reading, meta-analysis, scoping reviews, certainty of evidence, preregistration, evidence literacy and the A5 section.

## Redirect

`/library/research/umbrella-review/` 301 → `/content/umbrella-review`

## Workflow / post-publish QA

`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

Review mode: system-assisted migration QA; no human reviewer claimed.

- Release gate: **PASS**
- Canonical/slug uniqueness: **PASS**
- Internal-marker scan: **PASS**
- Double-counting/overlap limitations explicitly documented: **PASS**

**A5-000020 is closed, rebuilt, canonicalized, published, redirected, documented and post-publish QA passed.**