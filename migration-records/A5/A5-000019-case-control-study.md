# A5-000019 — دراسة الحالات والشواهد

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#41**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical: `/content/case-control-study`
- Supabase content id: `4a497968-3478-4104-a9e3-26520baa54c8`
- Final CMS version: **v8**

## Legacy / canonical
Verified legacy entry `case-control-study` / «دراسة الحالات والشواهد» / `Case-Control Study` in `scripts/publish_academic_library_v326.py` at original v326 source commit `367186ccdd188e991f811a6210483b443dc3cd59`; generated legacy route `/library/research/case-control-study/`. Legacy text was discovery-only; canonical content was rebuilt from scratch after duplicate checks in GitHub Issues, coordinator progress ledger and Supabase.

## Evidence verification
- CDC Field Epidemiology Manual: controls should represent the source population, be selected independently of exposure, and overmatching should be avoided.
- STROBE case-control checklist: reporting of eligibility, case ascertainment, control selection, matching, measurements, bias, missing data and analysis; treated as reporting guidance, not a quality score.
- Setia 2016, `Methodology Series Module 2: Case-control Studies`, PMID `27057012`: methodological review covering outcome-based selection, case definition, study base, controls and matching.
- Labrecque et al. 2021, `Do Case-Control Studies Always Estimate Odds Ratios?`, PMID `32889542`: supports design-specific interpretation of effect measures.
- Pearce 1993, `What does the odds ratio estimate in a case-control study?`, PMID `8144304`: foundational explanation of control-sampling schemes and rate/risk/odds estimands; rare-disease assumption is not used as a universal shortcut.

## Rebuild scope
Definition and use cases; source population/study base; incident versus prevalent cases; case definition; population/hospital controls; controls-per-case; matching and overmatching; exposure ascertainment; recall/interviewer/information bias; confounding; interpretation of odds ratios; rare-disease assumption; risk-set/base/survivor sampling; nested case-control studies; sample size; matched/unmatched analysis; missing data; detection/referral bias; rare outcomes and multiple exposures; suitability limits; STROBE reporting; critical appraisal; implementation workflow; common errors; internal links and FAQ.

## QA
- Word-like count: **2026**
- H1: **1** via title
- H2: **29**
- H3: **1**
- FAQ: **8**
- References: **5**
- Tags: **5**
- Category relations: **1**
- Versions: **8**
- Audit events: **8**
- Active redirects: **1**
- Canonical rows: **1**
- Slug rows: **1**
- Internal TODO/FIXME/QA/agent markers: **0**
- SEO title: **39 chars**
- Meta description: **154 chars**
- Featured image: none; Alt N/A
- Explicit boundary: screening/health/psychological measures do not independently diagnose.

The first release attempt was transactionally blocked because the SEO title exceeded the branded-title contract. No partial publication or bypass occurred. The SEO title was shortened to 39 characters and the full workflow was rerun successfully.

## Redirect
`/library/research/case-control-study/` 301 → `/content/case-control-study`

## Workflow
`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

Review mode: system-assisted migration QA; no human reviewer or credential fabricated.

**A5-000019 is closed, rebuilt, canonicalized, published, redirected, documented and post-publish QA passed.**