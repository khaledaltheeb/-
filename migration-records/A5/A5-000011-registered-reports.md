# A5-000011 — التقارير المسجلة في البحث العلمي

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#28**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key / slug: `registered-reports`
- Canonical: `/content/registered-reports`
- Content type: `resource`
- Supabase content id: `6795f5da-5771-47c6-9e98-6cdc24e41631`
- Final CMS version: **v8**
- Taxonomy: `knowledge` → `research-evidence-learning`

## Legacy inspection / canonical decision

Verified legacy source cluster:
- generator: `scripts/publish_academic_library_v326.py`
- original v326 source commit: `367186ccdd188e991f811a6210483b443dc3cd59` — 2026-07-27/28
- legacy section: `research` — «مناهج البحث والقياس»
- legacy entry key: `registered-reports` / «التقارير المسجلة» / `Registered Reports`
- verified generator route contract: `/library/research/registered-reports/`

The legacy generator entry defined Registered Reports as a publication model that reviews the question and methods before results and may grant in-principle acceptance that is relatively independent of result direction. It also identified publication-bias reduction, replication uses, protocol amendment/documentation and the dependence of quality on rigorous review. The short generated entry was treated only as a discovery source; it was not copied into the new page.

Before Claim creation, GitHub Issues, `docs/MIGRATION-PROGRESS.md`, Supabase content slugs/canonicals/aliases and redirects were checked using the Arabic title, English name and principal synonyms. No matching active or completed canonical existed. The existing `/content/preregistration` page was explicitly treated as a distinct related canonical rather than a duplicate.

The current `main` tree did not contain the generated standalone HTML artifact at `library/research/registered-reports/index.html`, but the route itself was verified from the v326 generator implementation, which constructs `/library/{section_slug}/{item.slug}/` for every section entry. No redirect was guessed from arithmetic or an unverified filename.

Internal generator/review notes, legacy site-shell content, generic warnings and production instructions were excluded from the new canonical.

## Current authoritative and academic verification

1. **Nature Communications — Registered Reports** — current author guidance checked in 2026. Used for the operational two-stage workflow, Stage 1 review, in-principle acceptance, Stage 2 review, outcome-independent publication principle and conditional nature of final publication. This is journal policy, not an effectiveness study.
2. **Scientific Reports — Registered Reports** — current journal policy checked in 2026. Used for Stage 1/Stage 2 detail, outcome-neutral quality checks, protocol deviations, data/code expectations and the distinction between result direction and publication criteria. This is editorial guidance, not causal evidence.
3. **Chambers, Cortex (2013), DOI 10.1016/j.cortex.2012.12.016** — original editorial introducing the modern Registered Reports initiative at Cortex. Used for historical provenance; it is an editorial, not a trial or effectiveness study.
4. **Chambers & Tzavella, Nature Human Behaviour (2022), DOI 10.1038/s41562-021-01193-7** — narrative review and practical guidance on the history, mechanisms, evidence and limitations of Registered Reports. Used as synthesis, not as proof that the format solves reproducibility universally.
5. **Scheel, Schijen & Lakens, Advances in Methods and Practices in Psychological Science (2021), DOI 10.1177/25152459211007467** — empirical observational meta-research comparing 71 published Registered Reports with 152 standard psychology studies. The first hypothesis was positive in 44% of Registered Reports versus 96% of standard reports. The comparison is consistent with reduced publication bias/type-I-error inflation but is non-randomized and cannot establish the format as the sole causal explanation.
6. **Soderberg et al., Nature Human Behaviour (2021), DOI 10.1038/s41562-021-01142-4** — observational comparative study in which 353 researchers evaluated papers drawn from 29 Registered Reports and 57 comparison articles. Registered Reports scored higher on several methodological/analysis quality dimensions, with no clear penalty to novelty/creativity. Selection, disciplinary concentration and non-random allocation limit causal/general claims.
7. **Nature — Registered Reports** — current policy checked in 2026 for the conditional IPA model and final review independent of whether results support the hypothesis. Used as current editorial policy, not as effect evidence.

The page explicitly distinguishes current journal policy from empirical evidence, and distinguishes observational meta-research from randomized causal evidence. It does not claim that Registered Reports eliminate publication bias, p-hacking, fraud or the reproducibility problem.

## Rebuild scope

The canonical was rebuilt from scratch to cover:
- precise definition of Registered Reports;
- historical origin of the modern format;
- how the model changes publication incentives;
- Stage 1 requirements;
- hypotheses and question specification;
- sample-size/power or alternative information-precision justification;
- outcome-neutral quality checks;
- In-Principle Acceptance (IPA), including its conditional nature;
- Stage 2 review and publication criteria;
- distinction from preregistration;
- distinction from study protocols and clinical-trial registration;
- empirical evidence on positive-result rates and its limitations;
- empirical evidence on research-quality ratings and its limitations;
- overall limits of the current evidence base;
- when Registered Reports are and are not suitable;
- secondary/existing-data eligibility boundaries;
- protocol deviations and amendments;
- exploratory/post-hoc analysis after Stage 1;
- reviewer responsibilities in Stage 1;
- researcher preparation before submission;
- reader appraisal after publication;
- common misconceptions;
- a practical suitability checklist;
- internal links and search-oriented FAQ.

## Content QA

- Useful word-like count in CMS: **2845**
- H1: **1** through page title
- H2: **23**
- H3: **5**
- FAQ: **8 visible FAQ blocks**
- References: **7**
- Tags: **5**
- Primary category relations: **1**
- Internal TODO/FIXME/QA/agent/built-not-published marker scan: **0 hits**
- Featured image: none; Alt **N/A**
- Diagnostic boundary: non-diagnostic research/publication-method resource; no psychological or health diagnosis is produced.

## SEO / E-E-A-T

- Primary keyword: `التقارير المسجلة`
- SEO title: `التقارير المسجلة: مراجعة البحث قبل النتائج` — **42 chars**
- Meta description: **157 chars**
- Canonical: `/content/registered-reports`
- Search intent: `informational`
- Search aliases include Arabic variants plus `Registered Reports`, `Registered Report`, `RR publishing format`, `in-principle acceptance`, `Stage 1 review` and `Stage 2 review`.
- Visible author: `فريق تحرير منصة روافد`
- No fabricated human scientific reviewer, qualification, partnership or endorsement.
- Structured `Article` metadata stored in `schema_json` and matched to visible metadata.
- Internal links connect preregistration, study design/bias, evidence literacy, citation/update transparency, certainty of evidence and the A5 section.

## Redirect

Verified from the v326 generator route contract:

`/library/research/registered-reports/`

301 → `/content/registered-reports`

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
- Release gate: **PASS**
- Internal marker scan: **PASS**

## Final result

**A5-000011 is closed, rebuilt, canonicalized, published, redirected, documented and post-publish QA passed.**
