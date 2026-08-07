# MIG-000004 — الذاكرة

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key: `memory`
- New canonical: `/content/memory`
- Content type: `glossary_term`
- Supabase content id: `56ca6aae-21e6-409f-ae82-92b0fe55718b`
- Final version: **v8**
- Database status: **published**
- Sector/category: `knowledge` / `cognitive-processes`

## Canonical decision

هذه الصفحة هي Canonical للمفهوم العام «الذاكرة». تبقى `/content/working-memory` Canonical مستقلة للذاكرة العاملة. أدوات associative binding وchange detection وworking-memory updating وغيرها تبقى أدوات، واضطرابات الذاكرة/فقد الذاكرة تبقى كيانات سريرية مستقلة.

## Legacy material inspected

- `scripts/scale_site_v8.py`
- `terms/index.html`
- `cognitive-lab/index.html`
- `upgrade_cognitive_batch1_v22.py`, `upgrade_cognitive_batch2_v22.py`
- `publish_associative_binding_v207.py`, `publish_visual_change_detection_v210.py`, `publish_working_memory_updating_v205.py`
- طبقات الإثراء والموسوعة التاريخية.

تم استبعاد كود التوليد والقوالب العامة والملاحظات الداخلية والتحذيرات المتكررة، وعدم دمج الأدوات أو الذاكرة العاملة داخل الصفحة العامة.

## Authoritative sources

1. APA Dictionary — Memory (2018).
2. NIMH — Declarative Memory, RDoC.
3. NIMH — Working Memory, RDoC.
4. Squire & Wixted — The Cognitive Neuroscience of Human Memory Since H.M. (2011).
5. Interdependence of episodic and semantic memory (2010).
6. Elements of episodic memory: lessons from 40 years of research (2024).
7. Review of the Testing Effect / retrieval practice (2022).
8. Second-order meta-analysis of working-memory training (2024), used to constrain broad training claims.

## Content QA

- Useful Arabic words: **1808**
- Structured blocks: **47**
- H2: **14**
- H3: **6**
- FAQ: **11**
- Tables: **2**
- Lists: **1**
- References: **8**, all HTTPS
- Tags: **6**
- Primary category relations: **1**
- Duplicate canonical: **0**
- TODO/FIXME/agent/private-plan text: **0**
- banned term «معاقين»: **0**

## SEO

- Primary entity: `الذاكرة`
- SEO title: `الذاكرة: الأنواع والمراحل وكيف يعمل التذكر`
- SEO title length: **42**
- Meta description length: **153**
- Canonical: `/content/memory`
- Visible FAQ → FAQPage schema
- `glossary_term` → DefinedTerm schema

## Workflow / Audit

Passed:
`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

No human reviewer was fabricated; audit identifies system-assisted migration QA with source verification.

- Versions: **8**
- Audit events: **8**
- Published at: `2026-08-07T21:18:52Z`

## Post-publish QA

Search query `الذاكرة` returns `/content/memory` first with score 13. `/content/working-memory` appears second as a distinct highly related canonical, which is correct.

- Duplicate canonical: **0**
- Redirect collision with working-memory/tool: **0**
- Search: **PASS**
- Taxonomy/tags: **PASS**

## Redirect decision

No `concept-*` redirect was guessed from old generator arithmetic. Distinct tools and `/content/working-memory` were not redirected to this page.

## Final result

**MIG-000004 is closed and canonicalized.**
