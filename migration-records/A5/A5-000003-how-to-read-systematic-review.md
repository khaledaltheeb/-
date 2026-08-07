# A5-000003 — كيف تقرأ مراجعة منهجية وتحليلًا تلويًا؟

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#14**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key / slug: `how-to-read-systematic-review`
- Canonical: `/content/how-to-read-systematic-review`
- Content type: `resource` — مورد تثقيفي غير تشخيصي
- Supabase content id: `64dd883d-7868-4d79-a7d7-d38c73a51dc0`
- Final CMS version: **v8**
- Sector: `knowledge`
- Primary category: `research-evidence-learning`

## Canonical decision and historical inspection

The topic has a distinct search intent from the general `evidence-literacy` hub: this canonical is a step-by-step appraisal guide specifically for systematic reviews and meta-analyses.

Historical evidence inspected:
- `docs/EVIDENCE_LITERACY_LIBRARY_V322_AR.md` explicitly lists the historical route `/library/evidence-literacy/how-to-read-systematic-review/` as one of four guides in the v322 evidence-literacy library.
- `content/v322/evidence-literacy-library-ar.json` contains the guide object with slug `how-to-read-systematic-review`, title `كيف تقرأ مراجعة منهجية وتحليلًا تلويًا دون أن يخدعك العنوان؟`, its own meta description, lead, sections and source mapping.
- Historical source commit: `178041007047ad4c3084bb811d2577d54534d2ec` (v322 source layer, 2026-07-27).
- The rendered route is retired from current `main` and returns 404; it was not treated as absent content because the source bundle and migration documentation preserve the canonical route and guide entity.
- GitHub code search found source/docs/audit references, not a competing current canonical page.

Generator code, retired publishing shell, QA/test artifacts, internal review labels, repeated warnings and deployment notes were excluded. The page was rebuilt from scratch around appraisal intent.

## Authoritative sources and evidence limits

1. **Cochrane Handbook — Chapter 1: Starting a review** — 2024 methodological handbook chapter; protocol/question/planning. No patient sample because it is a methods reference.
2. **Cochrane Handbook — Chapter 8: Assessing risk of bias in a randomized trial** — 2024 methods chapter; RoB 2. No clinical sample.
3. **Cochrane Handbook — Chapter 10: Analysing data and undertaking meta-analyses** — Handbook v6.5 (2024); methods for meta-analysis, heterogeneity, models, prediction intervals and sensitivity analyses. No clinical sample.
4. **Cochrane Handbook — Chapter 13: Missing evidence in meta-analysis** — updated 2024; methods for non-reporting bias and limits of funnel-plot interpretation. No clinical sample.
5. **Cochrane Handbook — Chapter 14: Summary of findings / GRADE** — chapter update May 2025 within Handbook v6.5.1; certainty by outcome, relative/absolute effects and Summary of Findings. No clinical sample.
6. **PRISMA 2020 Statement** — reporting guideline, statement paper 2021; explicitly treated as reporting guidance, not a methodological-quality certificate. No patient sample.
7. **AMSTAR 2 — BMJ 2017;358:j4008** — methodological critical-appraisal tool-development paper for reviews containing randomized and/or non-randomized intervention studies; not a therapeutic trial and no traditional patient sample.

The page explicitly distinguishes systematic review from meta-analysis, reporting quality from methodological quality, precision from bias, statistical significance from practical importance, heterogeneity from automatic I² thresholds, and effect magnitude from certainty of evidence.

## Content QA

- Useful Arabic word-like count: **1867**
- Structured blocks: **57**
- H1: **1** through page title only
- H2: **21**
- H3: **0** — intentional flat structure; each appraisal domain is an independent H2 and no artificial subhierarchy was introduced
- FAQ: **8**
- References: **7**
- Tags: **6**
- Internal TODO/FIXME/agent marker score: **0**
- Featured image: none; Alt **N/A**
- Diagnostic boundary: explicit; guide appraises research and does not prescribe or diagnose.

## SEO / E-E-A-T

- Primary keyword: `قراءة المراجعة المنهجية`
- SEO title: `قراءة المراجعة المنهجية والتحليل التلوي` — **39** chars
- Meta description: **153** chars
- Canonical: `/content/how-to-read-systematic-review`
- Search intent: `informational`
- Search aliases cover Arabic and English variants.
- Visible author: `فريق تحرير منصة روافد`
- No human scientific reviewer identity fabricated.
- Classified as non-diagnostic `resource`, consistent with purpose and release-gate semantics.
- Internal links: `/content/evidence-literacy` and `/sections/research-evidence-learning`.

## Redirect

Confirmed historical v322 route:
- `/library/evidence-literacy/how-to-read-systematic-review/`

301 → `/content/how-to-read-systematic-review`

No redirects were created from source JSON, docs, audit scripts or test artifacts.

## Workflow / audit

`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

Review mode: **system-assisted migration QA; no human reviewer claimed**.

- Versions: **8**
- Audit events: **8**

## Post-publish QA

- Status: **published**
- Canonical rows: **1 total (self only; extra duplicates = 0)**
- Confirmed redirect: **1**
- Search `قراءة المراجعة المنهجية`: **PASS — this canonical ranks first**, ahead of the general evidence-literacy resource.
- Tags/taxonomy: **PASS**
- Internal marker scan: **PASS**

## Final result

**A5-000003 is closed, canonicalized, published, redirected, and post-publish QA passed.**
