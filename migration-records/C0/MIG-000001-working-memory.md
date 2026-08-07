# MIG-000001 — الذاكرة العاملة

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: DRAFT BUILT — FINAL QA / PUBLISH PENDING
- Canonical key: `working-memory`
- New slug: `working-memory`
- New canonical: `/content/working-memory`
- Content type: `glossary_term`
- Supabase content id: `e0528a72-13b9-4525-9874-d773d30e2079`
- Current version: v1
- Current database status: `draft`
- Sector: `knowledge` — المعرفة والموسوعة
- Primary category: `cognitive-processes` — المصطلحات والعمليات المعرفية
- Audiences: الأفراد، الأسر، المعلمون، المختصون، المتدربون
- Tags: الذاكرة العاملة، الذاكرة، العمليات المعرفية، التعلم

## Canonical decision

الصفحة الجديدة تمثل **المفهوم العلمي العام للذاكرة العاملة (Working Memory)**.

المسار القديم `/cognitive-lab/working-memory-updating/` يمثل **أداة/مهمة تدريبية تفاعلية منفصلة** ولا يعد نسخة مكررة من صفحة المصطلح؛ لذلك لا يُحوّل إلى الصفحة الموسوعية. يجب ربط الأداة بالمفهوم سياقيًا لاحقًا عندما تُرحّل الأداة إلى Module الأدوات.

المرادفات البحثية المقبولة:

- الذاكرة العاملة
- الذاكرة التشغيلية
- Working Memory
- WM
- سعة الذاكرة العاملة

## Legacy material inspected

- `terms/index.html` — سياسة المعجم القديم وتصنيف الذاكرة العاملة كبناء نفسي/معرفي، مع ملاحظة وجود تنبيه عام متكرر لا يُنقل إلى الصفحة الجديدة.
- `scripts/publish_working_memory_updating_v205.py` — مادة الأداة القديمة وتعريف وضعها كتدريب غير تشخيصي، وملاحظة مهمة حول الفرق بين تحسن المهمة والانتقال العام.
- نتائج البحث المرتبطة بـ`upgrade_cognitive_batch1_v22.py` و`upgrade_cognitive_batch2_v22.py` و`cognitive-lab/index.html` وسكربتات/تقارير المختبر المعرفي.
- بحث المستودع عن `الذاكرة العاملة` و`working-memory` لتحديد المسارات المتقاربة ومنع الخلط بين المفهوم والأداة.

## Material explicitly excluded

- كود التوليد والنشر نفسه.
- أرقام الإصدارات وحالة CI/Artifact القديمة.
- تعليمات التطوير والاختبار.
- التنبيهات العامة المتكررة في الثيم القديم.
- أي صياغة توحي أن نتيجة أداة واحدة تشخّص اضطرابًا أو تقيس الذكاء العام.
- أي ادعاء بأن تدريب الذاكرة العاملة يرفع الذكاء أو التحصيل بصورة مضمونة.

## Authoritative sources used

1. National Institute of Mental Health (NIMH), RDoC — Working Memory construct.
2. American Psychological Association — APA Dictionary of Psychology: Working Memory.
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
- Duplicate title/slug in new Supabase: **none**
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
- Glossary schema: platform hardening adds `DefinedTerm` for `glossary_term`
- Breadcrumbs: sector → category → content

## Redirect decision

No redirect has been created from `/cognitive-lab/working-memory-updating/` because it is a distinct tool, not a duplicate.

No verified old standalone canonical URL for the concept itself has yet been identified; further historical evidence must be checked before creating any redirect. Redirects are never guessed.

## Remaining before COMPLETE

1. Final-hardening Quality Gate must pass after adding `DefinedTerm` schema and centralized analytics changes.
2. Verify no additional historical standalone working-memory canonical exists.
3. Promote through the content workflow without claiming a human scientific reviewer who did not review it.
4. Verify published page query, search result, relations and sitemap eligibility.
5. Close the GitHub claim only after final QA.
