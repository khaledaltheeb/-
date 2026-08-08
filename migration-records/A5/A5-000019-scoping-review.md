# A5-000019 — المراجعة الاستكشافية

- Claim: **#39**
- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical: `/content/scoping-review`
- Supabase content id: `02dea3df-b744-4366-9050-6880d3a71263`
- Final CMS version: **v9**

## Legacy / canonical decision

Verified legacy source:
- `scripts/publish_academic_library_v326.py`
- original v326 source commit `367186ccdd188e991f811a6210483b443dc3cd59`
- legacy key `scoping-review` / «المراجعة الاستكشافية» / `Scoping Review`
- verified generated route `/library/research/scoping-review/`

Before Claim creation, GitHub Issues, `docs/MIGRATION-PROGRESS.md`, Supabase content slugs/canonicals/search aliases and redirects were checked using Arabic and English synonyms. No matching Claim or canonical was found. The short legacy entry was used only for discovery; the canonical was rebuilt from scratch.

## Source and evidence verification

1. **Peters et al., JBI Evidence Synthesis (2020), DOI 10.11124/JBIES-20-00167** — updated methodological guidance for conducting scoping reviews. Used for purpose, broad evidence-source eligibility, selection, charting, analysis and presentation. It is methodological guidance, not an effectiveness study.
2. **Munn et al., BMC Medical Research Methodology (2018), DOI 10.1186/s12874-018-0611-x** — methodological guidance distinguishing systematic versus scoping review purposes and question types.
3. **Tricco et al., Annals of Internal Medicine (2018), DOI 10.7326/M18-0850 — PRISMA-ScR** — reporting guideline for scoping reviews/evidence maps. Treated as reporting guidance, not a quality score or risk-of-bias tool.
4. **Pollock et al., JBI Evidence Synthesis (2023), DOI 10.11124/JBIES-22-00123** — methodological guidance for extraction/charting, analysis and presentation.
5. **Tricco et al., Journal of Clinical Epidemiology (2026), DOI 10.1016/j.jclinepi.2026.112314** — scoping review informing the ongoing PRISMA-ScR update. It screened 8,265 records, included 43 unique documents and identified 37 potential reporting items. The page explicitly states that these are inputs to an update process, not a finalized replacement guideline.

## Rebuild scope

The canonical covers:
- when a scoping review is appropriate;
- distinction from systematic and narrative reviews;
- PCC framing;
- protocol and preregistration;
- search strategy and iterative searching;
- grey literature;
- study/source selection;
- data charting;
- when critical appraisal is or is not necessary;
- limits of claims about evidence gaps;
- visual/evidence mapping;
- descriptive and qualitative synthesis;
- stakeholder involvement;
- PRISMA-ScR reporting boundaries;
- the 2026 PRISMA-ScR update process without presenting proposed items as final standards;
- automation/AI documentation and human verification;
- language/time restrictions;
- duplicate/multiple reports;
- research-priority limits;
- transition to narrower systematic reviews;
- operational workflow, common errors, reader appraisal and FAQ.

## QA

- Useful word-like count: **1665**
- H1: **1** via title
- H2: **29**
- H3: **3**
- FAQ: **8**
- References: **5**
- Tags: **5**
- Category relations: **1**
- Versions: **9**
- Audit events: **9**
- Active redirects: **1**
- Canonical rows: **1**
- Slug rows: **1**
- Internal TODO/FIXME/QA/agent/built-not-published markers: **0**
- SEO title: **41 chars**
- Meta description: **154 chars**
- Featured image: none; Alt N/A

### Post-publish cleanup

The initial post-publish marker scan detected one literal `QA` token in a reader-facing sentence about validating automated outputs. It was not an internal instruction, but the migration standard excludes internal QA terminology. It was replaced with `مراجعة جودة`; content version **v9** and audit event **#9** record the cleanup. Final marker scan = **0**. No release gate or audit history was bypassed.

## SEO / E-E-A-T

Primary keyword: `المراجعة الاستكشافية`. Search aliases include `Scoping Review`, Arabic scoping/mapping variants, `PCC`, `PRISMA-ScR`, evidence mapping and charting terms. Visible author: `فريق تحرير منصة روافد`; no fabricated reviewer identity, qualification, partnership or endorsement. Internal links connect systematic reviews, meta-analysis, preregistration, source/update transparency, evidence literacy and the A5 section.

## Redirect

`/library/research/scoping-review/` 301 → `/content/scoping-review`

## Workflow

`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published → post-publish marker cleanup`

Review mode: system-assisted migration QA; no human reviewer claimed.

**A5-000019 is closed, rebuilt, canonicalized, published, redirected, documented and post-publish QA passed.**