# A5-000015 — نظرية استجابة البند

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#33**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key / slug: `item-response-theory`
- Canonical: `/content/item-response-theory`
- Content type: `resource`
- Supabase content id: `fab0050e-e4c2-4249-a684-61ea96e21ded`
- Final CMS version: **v8**
- Taxonomy: `knowledge` → `research-evidence-learning`

## Legacy inspection / canonical decision

Verified legacy source cluster:
- generator: `scripts/publish_academic_library_v326.py`
- original v326 source commit: `367186ccdd188e991f811a6210483b443dc3cd59` — 2026-07-27/28
- legacy section: `research` — «مناهج البحث والقياس»
- legacy entry key: `item-response-theory` / «نظرية استجابة البند» / `Item Response Theory`
- verified generator route contract: `/library/research/item-response-theory/`

The legacy entry identified item difficulty/discrimination, conditional measurement information, Rasch/parameterized models, CAT/item banks and DIF. It was used only as a discovery source; the current canonical was rebuilt from scratch and removes generic generator notes and internal production text.

Before Claim creation, GitHub Issues, `docs/MIGRATION-PROGRESS.md`, Supabase slugs/canonicals/search aliases and redirects were checked using Arabic/English synonyms including IRT, Rasch and DIF. No matching Claim or canonical existed.

## Source and evidence verification

1. **COSMIN Reporting Guideline 2.0 (2024), IRT/Rasch structural validity** — current consensus reporting guideline used for model/estimator reporting, dimensionality, local independence, item/model fit and item parameters. Scope is primarily PROM measurement-property research and is not generalized as a universal cutoff system.
2. **COSMIN Explanation & Elaboration (2024)** — current detailed guidance used for recommended IRT/Rasch outputs, item characteristic curves, person-item mapping and information functions, with explicit assumption reporting.
3. **Cella et al., Journal of Clinical Epidemiology (2010), DOI 10.1016/j.jclinepi.2010.04.011** — large-scale evaluation/calibration study of PROMIS. Fourteen item pools were tested; 11 item banks were calibrated using graded-response IRT on 21,133 U.S. participants. Used as an applied example, with explicit limits on transfer to new languages/populations.
4. **NIH Common Fund PROMIS publication index** — current official program index checked in 2026 for provenance of PROMIS publications; not treated as independent effectiveness evidence.
5. **ETS, Moses (2017), A Review of Developments and Applications in Item Analysis** — scholarly methods review used for item analysis, difficulty/discrimination, IRT and DIF context.
6. **Oxford Academic, Fairness in Educational Measurement (2026), DIF section** — current scholarly handbook treatment used to distinguish statistical DIF from causal item bias/unfairness. DIF is treated as a flag requiring substantive investigation, not as a verdict by itself.

The page explicitly states that IRT is a measurement model, not a diagnostic method; that model complexity does not guarantee validity; and that detected DIF does not by itself establish unfairness or its cause.

## Rebuild scope

The canonical now covers:
- IRT definition and latent trait θ;
- relation to Classical Test Theory;
- item/category characteristic curves;
- 1PL, 2PL and 3PL;
- Rasch relationship and limitations of treating it as a synonym;
- polytomous models including graded-response and partial-credit families;
- unidimensionality;
- local independence;
- monotonicity;
- item/model fit;
- item location/difficulty and discrimination;
- item/test information and conditional standard error;
- calibration sample coverage and sample-size limitations;
- PROMIS as a bounded empirical implementation example;
- item banks and short forms;
- computerized adaptive testing, stopping/content/exposure constraints;
- DIF, uniform/nonuniform interpretation and fairness boundaries;
- linking/equating;
- multidimensional IRT;
- relation to factor analysis;
- missing-data considerations;
- translation/cross-cultural validation;
- θ/T-score interpretation;
- non-diagnostic boundary for health/psychological tools;
- common errors;
- practical development/calibration/validation workflow;
- reporting requirements and reader appraisal;
- internal links and FAQ.

## Content QA

- Useful word-like count in CMS: **2919**
- H1: **1** through page title
- H2: **34**
- H3: **3**
- FAQ: **8 visible FAQ blocks**
- References: **6**
- Tags: **5**
- Primary category relations: **1**
- Versions: **8**
- Audit events: **8**
- Active redirect: **1**
- Canonical rows: **1**
- Slug rows: **1**
- Internal TODO/FIXME/QA/agent/built-not-published marker scan: **0 hits**
- Featured image: none; Alt **N/A**
- Medical/diagnostic boundary: explicit non-diagnostic disclaimer stored; IRT scores are described as measurement outputs, not diagnoses.

## SEO / E-E-A-T

- Primary keyword: `نظرية استجابة البند`
- SEO title: `نظرية استجابة البند IRT: النماذج والتطبيق` — **41 chars**
- Meta description: **153 chars**
- Canonical: `/content/item-response-theory`
- Search intent: `informational`
- Search aliases include Arabic variants plus `item response theory`, `IRT`, `Rasch model`, `item characteristic curve`, `DIF`, `CAT` and item information terms.
- Visible author: `فريق تحرير منصة روافد`
- No fabricated human reviewer, qualification, partnership or endorsement.
- Structured Article metadata matches visible metadata.
- Internal links connect factor analysis, missing data, preregistration, evidence literacy, citation/update transparency and the A5 section.

## Redirect

Verified from the v326 generator route contract:

`/library/research/item-response-theory/`

301 → `/content/item-response-theory`

## Workflow / post-publish QA

`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

Review mode: **system-assisted migration QA; no human reviewer claimed**.

- Release gate: **PASS**
- Post-publish canonical/slug uniqueness: **PASS**
- Internal marker scan: **PASS**

## Final result

**A5-000015 is closed, rebuilt, canonicalized, published, redirected, documented and post-publish QA passed.**