# A5-000012 — تحليل البيانات المفقودة

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#29**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key / slug: `missing-data`
- Canonical: `/content/missing-data`
- Content type: `resource`
- Supabase content id: `4803f155-ca69-4f7d-a7f2-6e4c11bbb829`
- Final CMS version: **v8**
- Taxonomy: `knowledge` → `research-evidence-learning`

## Legacy inspection / canonical decision

Verified legacy source cluster:
- generator: `scripts/publish_academic_library_v326.py`
- original v326 source commit: `367186ccdd188e991f811a6210483b443dc3cd59` — 2026-07-27/28
- legacy section: `research` — «مناهج البحث والقياس»
- legacy entry key: `missing-data` / «تحليل البيانات المفقودة» / `Missing Data Analysis`
- verified generator route contract: `/library/research/missing-data/`

The legacy entry correctly identified the need to investigate who is missing and why, and mentioned multiple imputation/maximum likelihood and sensitivity analysis, but it was intentionally not copied. Its generic summary was rebuilt into a complete methodological resource. Generator notes, production shell text, generic warnings and internal instructions were excluded.

Before Claim creation, GitHub Issues, `docs/MIGRATION-PROGRESS.md`, Supabase content slugs/canonicals/aliases and redirects were searched using `missing-data`, Arabic variants and English synonyms. No matching Claim or canonical existed.

## Source and evidence verification

1. **Rubin, Biometrika (1976), DOI 10.1093/biomet/63.3.581** — foundational statistical journal article. Used for the formal roots of ignorability and missing-at-random reasoning. It is theoretical work and does not identify a universally best method for every dataset.
2. **National Research Council / National Academies (2010), DOI 10.17226/12955** — expert consensus study report on prevention and treatment of missing data in clinical trials. Used for prevention, continued follow-up, explicit assumptions and sensitivity analysis. Its principal scope is confirmatory clinical trials, so it is not generalized mechanically to all observational research.
3. **Sterne et al., BMJ (2009), DOI 10.1136/bmj.b2393** — methods review on multiple imputation, its potential and pitfalls. Used to explain MI, compatibility and reporting; not treated as evidence that MI is optimal in every design.
4. **Cochrane Handbook current Chapter 10** — current systematic-review methods guidance checked in 2026. Used for types of missing data, explicit assumptions, contacting investigators and sensitivity analyses.
5. **Cochrane Handbook current Chapter 8** — current risk-of-bias guidance checked in 2026. Used to establish that the proportion of missing outcomes alone does not determine bias; outcome frequency, mechanism and relationship to true values matter.
6. **ICH E9(R1), legally effective 2020 via EMA** — regulatory statistical guideline. Used to distinguish missing measurements from intercurrent events, link analysis to the estimand, and explain the role of sensitivity analysis. Its clinical-trial framework is bounded to its scope.
7. **CONSORT 2025, BMJ 2025, DOI 10.1136/bmj-2024-081123** — current randomized-trial reporting guideline. Used for item 21c requiring authors to report how missing data were handled. It is a reporting standard, not a trial comparing missing-data methods.

The page explicitly avoids claiming that MAR can usually be proven from observed data, that a missingness percentage is automatically safe, or that multiple imputation removes all bias.

## Rebuild scope

The canonical now covers:
- definition and levels of missing data;
- loss of precision versus risk of bias;
- why missingness percentage alone is insufficient;
- defining the research question and estimand first;
- MCAR, MAR and MNAR with limits on testability;
- descriptive missingness diagnostics;
- complete-case analysis and its conditions/limitations;
- single-imputation pitfalls;
- multiple imputation, model contents and compatibility;
- likelihood-based and repeated-measure approaches;
- inverse-probability weighting;
- sensitivity analysis, including delta/pattern-mixture/selection/tipping-point concepts;
- trial-specific prevention and continued follow-up;
- distinction between intention-to-treat and handling missing measurements;
- CONSORT 2025 reporting requirements;
- observational-study considerations;
- missing data in systematic reviews/meta-analysis;
- why MAR/MNAR are not established by a single test;
- common mistakes;
- practical pre-collection, analysis and reporting workflow;
- reader appraisal checklist;
- internal links and search-oriented FAQ.

## Content QA

- Useful word-like count in CMS: **2822**
- H1: **1** through page title
- H2: **24**
- H3: **9**
- FAQ: **8 visible FAQ blocks**
- References: **7**
- Tags: **5**
- Primary category relations: **1**
- Internal TODO/FIXME/QA/agent/built-not-published marker scan: **0 hits**
- Featured image: none; Alt **N/A**
- Diagnostic boundary: methodological educational resource; no psychological or medical diagnosis is produced.

## SEO / E-E-A-T

- Primary keyword: `تحليل البيانات المفقودة`
- SEO title: `البيانات المفقودة: MAR وMNAR وطرق التحليل` — **41 chars**
- Meta description: **153 chars**
- Canonical: `/content/missing-data`
- Search intent: `informational`
- Search aliases include Arabic missing-data variants, `missing data`, `missing data analysis`, `missing values`, `multiple imputation`, `MCAR`, `MAR` and `MNAR`.
- Visible author: `فريق تحرير منصة روافد`
- No fabricated human scientific reviewer, qualification, partnership or endorsement.
- Structured `Article` metadata is stored and aligned with visible metadata.
- Internal links connect study-design/bias, preregistration, Registered Reports, evidence literacy, systematic reviews, certainty of evidence and the A5 section.

## Release-gate correction

The first workflow attempt was correctly rejected by the CMS release gate because the SEO meta description was **148 characters**, below the required 150–160 range. The transaction rolled back cleanly to draft with one version/one audit and no taxonomy writes. The meta description and matching structured-data description were corrected to **153 characters**, then the complete workflow was rerun from the draft state. No release gate was bypassed.

## Redirect

Verified from the v326 generator route contract:

`/library/research/missing-data/`

301 → `/content/missing-data`

## Workflow / post-publish QA

`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

Review mode: **system-assisted migration QA; no human reviewer claimed**.

- Versions: **8**
- Audit events: **8**
- Status: **published**
- Canonical rows: **1 total**
- Slug rows: **1 total**
- Active redirects to canonical: **1**
- Tags: **5**
- Category relations: **1**
- Release gate: **PASS after correction**
- Internal marker scan: **PASS**

## Final result

**A5-000012 is closed, rebuilt, canonicalized, published, redirected, documented and post-publish QA passed.**
