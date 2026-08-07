# MIG-000002 — الانتباه

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key: `attention`
- New slug: `attention`
- New canonical: `/content/attention`
- Content type: `glossary_term`
- Supabase content id: `6668b64f-3d43-4737-90c9-8c90c43cb7b3`
- Final version: **v8**
- Database status: **published**
- Sector: `knowledge` — المعرفة والموسوعة
- Primary category: `cognitive-processes` — المصطلحات والعمليات المعرفية
- Audiences: الأفراد، الأسر، المعلمون، المختصون، المتدربون
- Tags: الانتباه، التركيز، التحكم التنفيذي، العمليات المعرفية، التعلم

## Canonical decision

هذه الصفحة هي Canonical للمفهوم المعرفي العام **الانتباه (Attention)**.

الكيانات التالية بقيت مستقلة عمدًا:
- ADHD: حالة/اضطراب مستقل، والتشتت لا يساوي تشخيص ADHD.
- `/quick-info/attention-distraction-factors/`: مقالة فرعية عن عوامل تشتت الانتباه.
- أدوات `sustained-attention`, `selective-attention`, `divided-attention`, `attention-switch`: أدوات/مهام مستقلة.
- «التركيز»: مصطلح قريب في الاستخدام اليومي لكنه ليس مرادفًا علميًا كاملًا، ويحتاج Canonical مستقل عند ترحيله.

## Legacy material inspected

- `quick-info/attention-distraction-factors/index.html`
- `scripts/complete_cognitive_remaining_v24.py`
- `scripts/scale_site_v8.py`
- `scripts/rebuild_encyclopedia_v13.py`
- نتائج البحث عبر ADHD والمعلومات السريعة والمختبر المعرفي وطبقات الموسوعة.

تم استبعاد القالب القديم، أكواد GTM/GA المكررة، التنبيهات العامة المتكررة، تعليمات التطوير، وأي صياغة تخلط التشتت بالتشخيص.

## Redirect decision

المولدات القديمة تثبت وجود طبقات/Facets متعددة للانتباه، لكنها لا تكفي وحدها لإثبات أن رقم `concept-*` معين كان URL منشورًا فعليًا. لم يُنشأ أي Redirect تخميني.

لم تُحوّل المقالة الفرعية أو أدوات الانتباه إلى الصفحة العامة. Post-publish QA أثبت أن عدد التحويلات الخاطئة لهذه الكيانات إلى `/content/attention` = **0**.

## Authoritative sources used

1. NIMH — RDoC Attention construct.
2. APA Dictionary of Psychology — Attention (2018).
3. Petersen & Posner — The Attention System of the Human Brain: 20 Years After (2012).
4. Changes in the Networks of Attention across the Lifespan: A Graphical Meta-Analysis (2024).
5. Sleep deprivation, vigilant attention, and brain function: a review (2019).
6. NIMH — Dorsal attention network.
7. APA Dictionary — Divided Attention (2018).
8. APA Dictionary — Attentional Capture (2018).

All stored reference URLs use HTTPS.

## Content QA

- Arabic useful word count: **2017**
- Structured blocks: **50**
- H2: **15**
- H3: **4**
- FAQ: **11**
- Tables: **2**
- Lists: **1**
- References: **8**
- Tags: **5**
- Primary category relations: **1**
- Duplicate canonical after publish: **0**
- TODO/FIXME/internal agent/private-plan text: **0**
- banned term «معاقين»: **0**

## SEO

- Primary entity: `الانتباه`
- SEO title: `الانتباه: التعريف والأنواع والعوامل المؤثرة`
- SEO title length: **43**
- Meta description length: **155**
- Search aliases: **6**
- Search intent: `informational`
- Canonical: `/content/attention`
- Visible FAQ → FAQPage schema
- `glossary_term` → DefinedTerm schema
- Breadcrumbs: sector → category → content

## Workflow / Audit

The page passed:
`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

No human reviewer identity was fabricated. Audit records describe the review as system-assisted migration QA with source verification.

- Versions: **8**
- Audit events: **8**
- Published at: `2026-08-07T21:02:55Z`

## Post-publish QA

Search query `الانتباه` returns this page first with destination `/content/attention` and score 13. The already published `working-memory` appears as a weaker semantically related result, which is expected.

- Duplicate canonical: **0**
- Wrong redirects from distinct attention tools/article: **0**
- Search: **PASS**
- Taxonomy/tags: **PASS**

## Final result

**MIG-000002 is closed and canonicalized.**
