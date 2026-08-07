# A5-000010 — التسجيل المسبق للبحث

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#27**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key / slug: `preregistration`
- Canonical: `/content/preregistration`
- Content type: `resource`
- Supabase content id: `bd30a524-609f-4308-9a88-7e9a48a22aa4`
- Final CMS version: **v8**
- Taxonomy: `knowledge` → `research-evidence-learning`

## Legacy inspection / canonical decision

Verified legacy source cluster:
- generator: `scripts/publish_academic_library_v326.py`
- v326 source commit: `367186ccdd188e991f811a6210483b443dc3cd59` — 2026-07-28
- legacy section: `research` — «مناهج البحث والقياس»
- generator route: `/library/research/preregistration/`
- legacy entry key: `preregistration` / «التسجيل المسبق» / `Preregistration`

Repository search found the preregistration entry in the academic-library generator and did not find a second standalone canonical copy. Before Claim creation, GitHub Issues, `MIGRATION-PROGRESS.md`, Supabase content aliases/slugs/canonicals and redirects were checked; no matching active or completed canonical existed.

The short legacy entry was not copied. Its useful core — recording hypotheses, methods and analyses before results, distinguishing confirmatory from exploratory work, and documenting deviations — was retained conceptually and rebuilt into a full standalone Arabic resource. Generator/review/production notes were excluded.

## Current authoritative and academic verification

1. **Center for Open Science / OSF — Registrations & Preregistrations** — current guidance checked in 2026. Used for the operational definition of a time-stamped read-only study plan, timing, templates, embargo and update mechanics. This is platform/method guidance, not evidence that preregistration alone improves study validity.
2. **ICMJE — Clinical Trials Registration** — current recommendations checked in 2026. Used to distinguish general preregistration from prospective public clinical-trial registration and its publication-policy requirements.
3. **Nosek et al., PNAS (2018), DOI 10.1073/pnas.1708274114** — methodological perspective explaining the confirmatory/exploratory distinction and the rationale for preregistration; not a randomized effectiveness study.
4. **Bosnjak et al., American Psychologist (2022), DOI 10.1037/amp0000879** — professional task-force template for quantitative psychology preregistration. Used for plan structure and specificity, not as causal evidence of improved outcomes.
5. **van den Akker et al., Psychological Methods (online 2024), DOI 10.1037/met0000687** — empirical meta-research examining preregistration producibility and preregistration-study consistency across psychology studies. Supports caution that registrations can be incomplete and deviations can be undisclosed; observational meta-research does not prove preregistration causally improves every study.
6. **Claesen et al., Royal Society Open Science (2021), DOI 10.1098/rsos.211037** — early empirical comparison of preregistered and published analyses. Useful for deviation/disclosure examples; limited sample and context constrain generalization.
7. **TARG Meta-Research Group, BMJ Open (2023), DOI 10.1136/bmjopen-2023-076264** — systematic review and meta-analyses of discrepancies between registrations and publications. Estimates were heterogeneous and many source studies could not fully establish disclosure, version choice or prospective timing.
8. **PRISMA protocol resources** — current protocol/reporting resource checked in 2026 for the distinction between preregistration and structured protocols for systematic reviews.

The page explicitly states that preregistration is a transparency and timing mechanism, not a certificate of methodological quality, absence of bias, absence of fraud, or correctness of the final inference.

## Rebuild scope

The canonical now covers:
- precise definition and timing;
- why researcher degrees of freedom matter;
- hypotheses and primary outcomes;
- sample size / stopping rules;
- analysis-plan specificity and contingency rules;
- deviations and transparent amendments;
- distinction from clinical-trial registration;
- distinction from Registered Reports;
- modern meta-research and its limits;
- what preregistration cannot guarantee;
- secondary/existing-data preregistration;
- systematic-review protocols;
- how readers compare a registration with a publication;
- versioning, timestamps, privacy and embargo;
- common mistakes and a practical checklist;
- internal links and search-oriented FAQ.

## Content QA

- Useful Arabic word-like count: **1927**
- H1: **1** through page title
- H2: **18**
- H3: **4**
- FAQ: **8 visible FAQ blocks**
- References: **8**
- Tags: **5**
- Primary category relations: **1**
- Internal TODO/FIXME/agent/review/built-not-published marker scan: **0 hits**
- Featured image: none; Alt **N/A**
- Diagnostic boundary: non-diagnostic research-method resource; no health or psychological diagnosis is produced.

## SEO / E-E-A-T

- Primary keyword: `التسجيل المسبق للبحث`
- SEO title: `التسجيل المسبق للبحث: التخطيط والشفافية` — **39 chars**
- Meta description: **154 chars**
- Canonical: `/content/preregistration`
- Search intent: `informational`
- Search aliases include Arabic preregistration variants and English `preregistration`, `pre-registration`, `research preregistration`, `preregistered study`.
- Visible author: `فريق تحرير منصة روافد`
- No fabricated human scientific reviewer, qualification, partnership or endorsement.
- Structured Article metadata stored in `schema_json` and matched to visible page metadata.
- Internal links connect study design/bias, evidence literacy, systematic-review reading, citation transparency, certainty of evidence, and the A5 section.

## Redirect

Verified from the v326 generator route contract:
`/library/research/preregistration/`

301 → `/content/preregistration`

## Workflow / post-publish QA

`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

Review mode: **system-assisted migration QA; no human reviewer claimed**.

- Versions: **8**
- Audit events: **8**
- Status: **published**
- Canonical rows: **1 total**
- Slug rows: **1 total**
- Redirect active: **1**
- Tags: **5**
- Category relations: **1**
- Release gate: **PASS**
- Internal marker scan: **PASS**

## Final result

**A5-000010 is closed, rebuilt, canonicalized, published, redirected, and post-publish QA passed.**
