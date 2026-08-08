# A5-000014 — التحليل العاملي

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#32**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key / slug: `factor-analysis`
- Canonical: `/content/factor-analysis`
- Content type: `resource`
- Supabase content id: `7af145ce-b2bb-4182-bb39-f6b1a1802666`
- Final CMS version: **v8**
- Taxonomy: `knowledge` → `research-evidence-learning`

## Legacy inspection / canonical decision

Verified legacy source cluster:
- generator: `scripts/publish_academic_library_v326.py`
- original v326 source commit: `367186ccdd188e991f811a6210483b443dc3cd59` — 2026-07-27/28
- legacy section: `research` — «مناهج البحث والقياس»
- legacy entry key: `factor-analysis` / «التحليل العاملي» / `Factor Analysis`
- verified generator route contract: `/library/research/factor-analysis/`

The legacy entry correctly distinguished exploratory/confirmatory factor analysis, warned that PCA is not automatically factor analysis, rejected a single fixed sample-size rule, and stated that good fit does not prove the true model. It was used only as a discovery map; the new canonical was rebuilt from scratch.

Pre-claim checks covered GitHub Issues, `docs/MIGRATION-PROGRESS.md`, Supabase content slugs/canonicals/aliases and redirects using Arabic/English synonyms. No matching canonical or Claim existed.

## Source and evidence verification

1. **COSMIN Reporting Guideline 2.0 (2024), Structural Validity** — current consensus reporting guidance for measurement-property studies. Used for the EFA/CFA distinction, rationale, tested model, estimator, correlation matrix and fit reporting. Scope is primarily health outcome measurement/PROM studies.
2. **COSMIN Explanation & Elaboration (2024)** — current detailed guidance. Used to establish that factor analysis for structural validity assumes a reflective measurement model and that EFA versus CFA should follow the study objective and prior theory.
3. **Fabrigar, Wegener, MacCallum & Strahan, Psychological Methods (1999), DOI 10.1037/1082-989X.4.3.272** — methodological review with empirical illustrations. Used for extraction, factor-number and rotation decisions and the risks of questionable defaults. Historical methodological source, not a current regulatory rule.
4. **Horn, Psychometrika (1965), DOI 10.1007/BF02289447** — original methodological paper for parallel analysis. Used for provenance and principle; parallel analysis is not presented as infallible.
5. **MacCallum et al., Psychological Methods (1999), DOI 10.1037/1082-989X.4.1.84** — theoretical/simulation study demonstrating that sample-size requirements depend on communalities and factor overdetermination rather than a universal participant:item ratio.
6. **Flora & Curran, Psychological Methods (2004), DOI 10.1037/1082-989X.9.4.466** — simulation study of CFA estimation with ordinal indicators. Used to explain polychoric/WLS-style estimation and its conditions; not generalized as one universally superior estimator.

The page treats fit-index cutoffs as context-dependent diagnostics rather than universal laws and does not claim that statistical fit proves a causal latent entity.

## Rebuild scope

The canonical now covers EFA/CFA, the distinction from PCA, reflective-versus-formative measurement, data quality, Pearson versus polychoric correlations, extraction, number-of-factor decisions and parallel analysis, rotation, loadings/cross-loadings, communalities, sample-size reasoning, CFA fit and residuals, fit-index cutoff limitations, modification indices/overfitting, wording/method effects, higher-order/bifactor models, internal consistency versus dimensionality, ordinal indicators, missing data, structural interpretation limits, cross-group validation, EFA/CFA operational checklists, common errors and reader appraisal.

## Content QA

- Useful word-like count in CMS: **2646**
- H1: **1** through page title
- H2: **31**
- H3: **6**
- FAQ: **8 visible FAQ blocks**
- References: **6**
- Tags: **5**
- Primary category relations: **1**
- Internal TODO/FIXME/QA/agent/built-not-published marker scan: **0 hits**
- Featured image: none; Alt **N/A**
- Diagnostic boundary: educational psychometric resource; no health or psychological diagnosis is produced.

## SEO / E-E-A-T

- Primary keyword: `التحليل العاملي`
- SEO title: `التحليل العاملي: EFA وCFA وبنية المقياس` — **39 chars**
- Meta description: **153 chars**
- Canonical: `/content/factor-analysis`
- Search intent: `informational`
- Search aliases include Arabic variants plus `factor analysis`, `EFA`, `CFA`, `exploratory factor analysis`, `confirmatory factor analysis` and `latent factor model`.
- Visible author: `فريق تحرير منصة روافد`
- No fabricated human reviewer, qualification, partnership or endorsement.
- Structured Article metadata matches visible metadata.
- Internal links connect missing data, study design/bias, preregistration, evidence literacy, citation/update transparency and the A5 section.

## Redirect

Verified from the v326 generator route contract:

`/library/research/factor-analysis/`

301 → `/content/factor-analysis`

## Workflow / post-publish QA

`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

Review mode: **system-assisted migration QA; no human reviewer claimed**.

- Versions: **8**
- Audit events: **8**
- Status: **published**
- Canonical rows: **1**
- Slug rows: **1**
- Active redirects: **1**
- Tags: **5**
- Category relations: **1**
- Release gate: **PASS**
- Internal marker scan: **PASS**

## Final result

**A5-000014 is closed, rebuilt, canonicalized, published, redirected, documented and post-publish QA passed.**
