# MIG-000004 — الذاكرة

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: DRAFT BUILT — FINAL WORKFLOW / POST-PUBLISH QA PENDING
- Canonical key: `memory`
- New canonical: `/content/memory`
- Content type: `glossary_term`
- Supabase content id: `56ca6aae-21e6-409f-ae82-92b0fe55718b`
- Database status: `draft`
- Sector/category: `knowledge` / `cognitive-processes`

## Canonical decision

هذه الصفحة للمفهوم العام «الذاكرة». تبقى `/content/working-memory` Canonical مستقلة للذاكرة العاملة. كما تبقى أدوات associative binding، change detection، working-memory updating وغيرها أدوات مستقلة، وتبقى اضطرابات الذاكرة/فقد الذاكرة كيانات سريرية مستقلة.

## Legacy material inspected

- `scripts/scale_site_v8.py` — الذاكرة كموضوع مولد متعدد Facets.
- `terms/index.html` — المعجم العام القديم.
- `cognitive-lab/index.html` و`upgrade_cognitive_batch1_v22.py` و`upgrade_cognitive_batch2_v22.py` — أدوات معرفية منفصلة.
- `publish_associative_binding_v207.py`, `publish_visual_change_detection_v210.py`, `publish_working_memory_updating_v205.py` — مهام مستقلة لا تُدمج في الصفحة العامة.
- طبقات الإثراء والموسوعة التاريخية.

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
- Categories: **1**
- Duplicate candidates: **0**
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

## Redirect decision

المولدات القديمة تثبت تعدد صفحات/Facets مرتبطة بالذاكرة لكنها لا تثبت وحدها URL منشورًا بعينه. لا يتم تخمين `concept-*` redirects. الأدوات والذاكرة العاملة ليست نسخًا مكررة.

## Remaining

- Full workflow → Scheduled → Published.
- Search/canonical/taxonomy post-publish QA.
- Close Claim Issue #4 and update central ledger.
