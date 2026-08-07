# A5-000008 — مسارات التعلم والمشاركة وترجمة المعرفة

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#23**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key / slug: `learning-participation`
- Canonical: `/content/learning-participation`
- Content type: `resource`
- Supabase content id: `cbb8ff7e-3f5e-4b6b-a975-d7006790e484`
- Final CMS version: **v8**
- Taxonomy: `knowledge` → `research-evidence-learning`

## Legacy inspection / canonical decision

Confirmed legacy canonical and source file:
- `/cochrane/evidence-academy/learning-participation/`
- `cochrane/evidence-academy/learning-participation/index.html`

Git history found the authored origin commit:
- `dc273166668b6b29ced83c8a3d9d60df23c92cef` — `Add Arabic learning participation and translation pathways` — 2026-08-03.

Repository search also found only structural references in the academy index, sitemap/API outputs and normalization reports; these are not independent canonical content variants. The current file is the authored page plus later platform shell/branding/GTM layers. The rebuild therefore treated the content as one canonical cluster and excluded CSS/JS, GTM, generated shell, platform metadata boilerplate and any operational material.

The durable public intent was retained but rewritten from scratch: learning evidence by role, public/patient participation, research participation, knowledge translation, linguistic translation, course selection and competency measurement. The old page was not copied into the CMS.

## Current authoritative verification

1. **Cochrane — Evidence Essentials** — current official educational resource checked in 2026. It provides free introductory modules for patients/public, policy makers and healthcare teams covering evidence-based medicine, randomized trials, systematic reviews, understanding review findings, patient/public involvement and rapid-review appraisal. This is educational material, not an intervention trial demonstrating health outcomes.
2. **Cochrane Interactive Learning** — current official professional-learning resource checked in 2026. The systematic-review course is described as more than 20 hours across 14 core modules, with additional advanced topics. These are programme specifications, not evidence that one course alone confers independent review competence.
3. **Cochrane — Translate our evidence** — current official translation/participation page checked in 2026. It reports more than **61,000** plain-language-summary translations across **20 languages** as of **June 2026**, and provides an official volunteer route. These are operational activity figures, not measured health-impact estimates.
4. **Cochrane Membership / Cochrane Crowd** — current participation sources checked in 2026. Membership recognizes defined contributions, while Cochrane Crowd documentation updated in **April 2026** describes a structured citizen-science platform for classifying research. Participation does not by itself establish authorship, research independence or professional licensure.
5. **WHO global evidence map on interventions to improve evidence-informed decision-making** — **2024**, global living evidence map / methodological evidence synthesis. WHO reports screening **67,390** references and including **617** studies. It also reports important evidence gaps: concentration in health and high-income settings, and limited rigorous impact evaluations on ultimate outcomes. The page therefore does not claim that training or knowledge-translation interventions have uniform effects across contexts.
6. **WHO global research agenda for knowledge translation and evidence-informed policy-making** — published **11 March 2026**, global research-agenda / priority-setting publication. It was developed with experts from **38 countries** and identifies **19 research priorities**. It is used to demonstrate continuing research gaps, not as an intervention-effect study.

No primary source above is a diagnostic instrument or patient-level treatment trial. Where operational figures are cited, the rebuilt page explicitly labels them as activity/programme information rather than causal evidence of benefit.

## Content QA

- Useful Arabic word-like count: **2855**
- H1: **1** through page title
- H2: **19**
- H3: **7**
- FAQ: **8**
- References: **7**
- Tags: **5**
- Category relations: **1 primary**
- Internal TODO/FIXME/QA/agent markers: **0**
- Featured image: none; Alt **N/A**
- Diagnostic boundary: explicit — learning/participation resources do not diagnose psychological or health conditions.

## SEO / E-E-A-T

- Primary keyword: `مسارات تعلم الأدلة`
- SEO title: `مسارات التعلم والمشاركة وترجمة المعرفة` — **38 chars**
- Meta description: **150 chars**
- Canonical: `/content/learning-participation`
- Search intent: `informational`
- Search aliases cover Arabic and English variants including `ترجمة المعرفة`, `knowledge translation`, and `evidence participation`.
- Visible author: `فريق تحرير منصة روافد`
- Last review recorded in CMS on migration date.
- No human scientific reviewer, partnership, endorsement or formal Cochrane relationship was fabricated.
- Internal links: evidence literacy, systematic-review reading, certainty of evidence, guideline appraisal, source governance and the A5 section.

## Redirect

Verified legacy canonical:
`/cochrane/evidence-academy/learning-participation/`

301 → `/content/learning-participation`

No historical redirect was guessed from generator arithmetic.

## Workflow / post-publish QA

The authenticated CMS helper is intentionally user-session gated. The administrative migration connection does not carry an end-user `auth.uid()`, so the migration reproduced the same governed state sequence directly in one atomic database transaction while retaining the database release-gate trigger on accessibility/approval/publication and creating a snapshot + audit event for every stage:

`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

Review mode: **system-assisted migration QA; no human reviewer claimed**.

- Versions: **8**
- Audit events: **8**
- Status: **published**
- Canonical rows: **1 total (self only; extra duplicates = 0)**
- Redirect active: **1**
- Search `مسارات تعلم الأدلة`: **PASS — canonical ranks first**
- Internal marker scan: **PASS**
- Release gate: **PASS** at accessibility, approval and publication states

## Final result

**A5-000008 is closed, canonicalized, published, redirected, searchable, and post-publish QA passed.**
