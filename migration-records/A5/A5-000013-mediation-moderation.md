# A5-000013 — تحليل الوساطة والتعديل

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#31**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key / slug: `mediation-moderation`
- Canonical: `/content/mediation-moderation`
- Content type: `resource`
- Supabase content id: `ef8fd57d-09a8-4fe3-9d05-8e2a25bf1560`
- Final CMS version: **v8**
- Taxonomy: `knowledge` → `research-evidence-learning`

## Legacy inspection / canonical decision

Verified legacy source cluster:
- generator: `scripts/publish_academic_library_v326.py`
- original v326 source commit: `367186ccdd188e991f811a6210483b443dc3cd59` — 2026-07-27/28
- legacy section: `research` — «مناهج البحث والقياس»
- legacy entry key: `mediation-moderation` / «تحليل الوساطة والتعديل» / `Mediation and Moderation Analysis`
- verified generator route contract: `/library/research/mediation-moderation/`

The legacy entry correctly separated mediation (how/through what) from moderation (for whom/under what conditions), noted temporal order and causal assumptions, and warned against cross-sectional causal claims. It was not copied. The canonical was rebuilt as a full research-methods resource with explicit distinctions between statistical association and causal identification.

Before Claim creation, GitHub Issues, `docs/MIGRATION-PROGRESS.md`, Supabase slugs/canonicals/aliases and redirects were searched using Arabic and English synonyms. No matching Claim or canonical existed.

## Current authoritative and academic verification

1. **Lee et al., JAMA (2021), DOI 10.1001/jama.2021.14075 — AGReMA Statement** — evidence- and consensus-based reporting guideline for mediation analyses in randomized and observational studies. Used for transparent reporting of design, causal assumptions, confounders, estimates and uncertainty. The guideline explicitly cautions that causal interpretation can fail even in randomized trials if mediator–outcome confounding is not adequately addressed.
2. **Imai, Keele & Tingley, Psychological Methods (2010), DOI 10.1037/a0020761** — methodological article defining causal mediation effects, identification, estimation and sensitivity analysis beyond simple linear structural-equation assumptions. Used for the causal-identification and sensitivity framework; it does not make every fitted mediation model causal.
3. **MacKinnon, Fairchild & Fritz, Annual Review of Psychology (2007), DOI 10.1146/annurev.psych.58.110405.085542** — scholarly review of mediation concepts and methods. Used for historical/methodological context and distinctions among mediator, moderator, confounder and covariate; later causal-inference developments are treated separately.
4. **Knol & VanderWeele, International Journal of Epidemiology (2012), DOI 10.1093/ije/dyr218** — methodological reporting recommendations for effect modification and interaction. Used to distinguish effect modification from interaction and to emphasize scale-specific effect estimates and confidence intervals.
5. **VanderWeele, Epidemiology (2014), DOI 10.1097/EDE.0000000000000121** — causal-methods article introducing a four-way decomposition unifying mediation and interaction. Used for advanced conceptual coverage under its stated causal assumptions; not presented as an automatic PROCESS/SEM recipe.
6. **Harvard T.H. Chan School of Public Health, VanderWeele Research Group tools/tutorials** — current academic methods resource checked in 2026 linking interaction and mediation tools to original methodological papers. Used for source discovery and current expansion paths, not as independent effectiveness evidence.

The page explicitly states that a statistically significant indirect effect, interaction term, bootstrap interval or software output does not establish a causal mechanism without the required design and identification assumptions.

## Rebuild scope

The canonical now covers:
- mediator versus moderator;
- why mediation is not merely a sequence of three regressions;
- direct and indirect effects and their definition dependence;
- temporal ordering;
- exposure–mediator, exposure–outcome and mediator–outcome confounding;
- post-exposure mediator–outcome confounders;
- causal diagrams and collider risk;
- identification assumptions and counterfactual limitations;
- mediation sensitivity analysis;
- moderation as interaction;
- additive versus multiplicative interaction scales;
- why significance in one subgroup but not another does not prove effect modification;
- centering/coding and interpretation of main effects in interaction models;
- simple slopes and Johnson–Neyman interpretation;
- moderated mediation and conditional indirect effects;
- four-way decomposition of mediation and interaction;
- bootstrap limitations;
- measurement error in mediators;
- nonlinear/binary/survival outcomes;
- sample size and power;
- multiple mediators/moderators;
- common mediation and moderation errors;
- design, analysis and reporting checklists;
- critical appraisal guidance;
- internal links and search-oriented FAQ.

## Content QA

- Useful word-like count in CMS: **2635**
- H1: **1** through page title
- H2: **27**
- H3: **3**
- FAQ: **8 visible FAQ blocks**
- References: **6**
- Tags: **5**
- Primary category relations: **1**
- Internal TODO/FIXME/QA/agent/built-not-published marker scan: **0 hits**
- Featured image: none; Alt **N/A**
- Diagnostic boundary: methodological educational resource; no psychological or medical diagnosis is produced.

## SEO / E-E-A-T

- Primary keyword: `تحليل الوساطة والتعديل`
- SEO title: `الوساطة والتعديل: Mediation وModeration` — **39 chars**
- Meta description: **156 chars**
- Canonical: `/content/mediation-moderation`
- Search intent: `informational`
- Search aliases include Arabic mediation/moderation variants plus `mediation analysis`, `moderation analysis`, `mediator`, `moderator`, `moderated mediation` and `conditional process analysis`.
- Visible author: `فريق تحرير منصة روافد`
- No fabricated human scientific reviewer, qualification, partnership or endorsement.
- Structured `Article` metadata matches visible metadata.
- Internal links connect study design/bias, missing data, preregistration, Registered Reports, evidence literacy, certainty of evidence and the A5 section.

## Redirect

Verified from the v326 generator route contract:

`/library/research/mediation-moderation/`

301 → `/content/mediation-moderation`

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

**A5-000013 is closed, rebuilt, canonicalized, published, redirected, documented and post-publish QA passed.**
