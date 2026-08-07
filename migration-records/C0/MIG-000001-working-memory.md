# MIG-000001 — الذاكرة العاملة

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key: `working-memory`
- New slug: `working-memory`
- New canonical: `/content/working-memory`
- Content type: `glossary_term`
- Supabase content id: `e0528a72-13b9-4525-9874-d773d30e2079`
- Current version: **v9**
- Current database status: **published**
- Sector: `knowledge` — المعرفة والموسوعة
- Primary category: `cognitive-processes` — المصطلحات والعمليات المعرفية
- Audiences: الأفراد، الأسر، المعلمون، المختصون، المتدربون
- Tags: الذاكرة العاملة، الذاكرة، العمليات المعرفية، التعلم

## Canonical decision

الصفحة الجديدة تمثل **المفهوم العلمي العام للذاكرة العاملة (Working Memory)**.

المسار القديم `/cognitive-lab/working-memory-updating/` يمثل **أداة/مهمة تدريبية تفاعلية منفصلة** ولا يعد نسخة مكررة من صفحة المصطلح؛ لذلك لم يُحوّل إلى الصفحة الموسوعية. يجب ربط الأداة بالمفهوم سياقيًا لاحقًا عندما تُرحّل الأداة إلى Module الأدوات.

المرادفات البحثية المقبولة:

- الذاكرة العاملة
- الذاكرة التشغيلية
- Working Memory
- WM
- سعة الذاكرة العاملة

## Legacy material inspected

- `terms/index.html` — سياسة المعجم القديم وتصنيف الذاكرة العاملة كبناء نفسي/معرفي، مع استبعاد التنبيه العام المتكرر من الصفحة الجديدة.
- `scripts/publish_working_memory_updating_v205.py` — مادة الأداة القديمة وتعريف وضعها كتدريب غير تشخيصي، وملاحظة مهمة حول الفرق بين تحسن المهمة والانتقال العام.
- نتائج البحث المرتبطة بـ`upgrade_cognitive_batch1_v22.py` و`upgrade_cognitive_batch2_v22.py` و`cognitive-lab/index.html` وسكربتات/تقارير المختبر المعرفي.
- `scripts/rebuild_encyclopedia_v13.py` — مراجعة بنية الموسوعة المولدة القديمة وDefinedTerm pattern ومنهج توليد صفحات متعددة.
- بحث المستودع عن `الذاكرة العاملة` و`working-memory` و`working-memory/index.html` لتحديد المسارات المتقاربة ومنع الخلط بين المفهوم والأداة.

## Material explicitly excluded

- كود التوليد والنشر نفسه.
- أرقام الإصدارات وحالة CI/Artifact القديمة.
- تعليمات التطوير والاختبار.
- التنبيهات العامة المتكررة في الثيم القديم.
- أي صياغة توحي أن نتيجة أداة واحدة تشخّص اضطرابًا أو تقيس الذكاء العام.
- أي ادعاء بأن تدريب الذاكرة العاملة يرفع الذكاء أو التحصيل بصورة مضمونة.

## Authoritative sources used

1. National Institute of Mental Health (NIMH), RDoC — Working Memory construct. لا تُسند له سنة نشر غير ظاهرة في المصدر.
2. American Psychological Association — APA Dictionary of Psychology: Working Memory — updated 2018-04-19.
3. Baddeley A. Working memory. Science. 1992.
4. Cowan N. Working Memory Underpins Cognitive Development, Learning, and Education. 2014.
5. Cowan N. What are the differences between long-term, short-term, and working memory? 2008.
6. Working Memory Training Does Not Improve Performance on Measures of Intelligence or Other Measures of Far Transfer. 2016.
7. Examining Working Memory Training for Healthy Adults — A Second-Order Meta-Analysis. 2024.
8. Exploring the n-back task: insights, applications, and future directions. 2025.

All stored reference URLs use HTTPS.

## New page structure

- H1: الذاكرة العاملة
- تعريف علمي مباشر + الترجمة/المرادفات
- الفرق عن الذاكرة قصيرة المدى والذاكرة طويلة المدى
- نموذج بادلي وهيتش
  - الحلقة الفونولوجية
  - المفكرة البصرية المكانية
  - المنفذ المركزي
  - المخزن العرضي
- صياغة NIMH/RDoC
- السعة المحدودة والتجميع
- العلاقة بالانتباه والوظائف التنفيذية
- التعلم والحياة اليومية
- تخفيف الحمل على الذاكرة العاملة
- طرق القياس ومحدودية كل مهمة
- التدريب: الانتقال القريب مقابل الانتقال البعيد
- متى تكون الصعوبة مهمة وظيفيًا
- جدول الأخطاء الشائعة وتصحيحها
- 11 سؤالًا وجوابًا مبنيًا على نوايا البحث
- خلاصة

## Content QA

- Arabic word count: **2240**
- Structured blocks: **44**
- H2: **13**
- H3: **4**
- FAQ blocks: **1**
- FAQ questions: **11**
- Tables: **1**
- References: **8**
- All stored reference URLs HTTPS: **PASS**
- Duplicate title/slug/canonical in new Supabase: **0**
- Wrong redirect from working-memory-updating tool: **0**
- Forbidden/internal text scan:
  - TODO: PASS
  - FIXME: PASS
  - agent/worker instructions: PASS
  - private plan language: PASS
  - banned term «معاقين»: PASS

## SEO

- Primary keyword/entity: `الذاكرة العاملة`
- SEO title: `الذاكرة العاملة: التعريف والوظائف والفروق`
- SEO title length: **41 chars**
- Meta description length: **152 chars**
- Search aliases: **5**
- Search intent: `informational`
- Canonical: `/content/working-memory`
- FAQ schema: generated only from visible FAQ block
- Glossary schema: `DefinedTerm` generated for `glossary_term`
- Breadcrumbs: sector → category → content
- Search verification: query `الذاكرة العاملة` returns this canonical content result with destination `/content/working-memory`.

## Workflow and audit

The page passed the platform sequence:

`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

The migration workflow audit explicitly records that this was **system-assisted migration QA and no human reviewer was claimed**. `reviewer_display_name` was not fabricated.

- Final content versions: **9**
- Final audit events: **9**
- Published at: `2026-08-07T20:51:28Z`

## Redirect decision

No redirect was created from `/cognitive-lab/working-memory-updating/` because it is a distinct tool.

Repository searches did not verify a separate historical standalone canonical URL for the general working-memory concept. No redirect was guessed.

## Platform QA before publish

The hardened `main` commit `08fc03b8420e44cfdb36904f98efa72e450e533f` passed the full Rawafid Quality Gate after central analytics and DefinedTerm schema were added:

- Architecture/privacy/PWA contract: PASS
- Final content-readiness hardening: PASS
- TypeScript: PASS
- ESLint: PASS
- Production build: PASS
- HTTP smoke: PASS
- Lighthouse lab gate: PASS

## Final result

**MIG-000001 is closed and canonicalized. The next C0 page may now start.**
