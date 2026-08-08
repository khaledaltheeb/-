# A5-000023 — مجموعات التركيز

- Lane: **A5 — البحث والأدلة والأدوات والتعلم**
- Claim: **#49**
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical: `/content/focus-groups`
- Supabase content id: `3e666a54-ef67-4a35-88d0-acd230f03861`
- Final CMS version: **v8**

## Legacy / canonical
فُحصت صفحة `focus-groups` في المصدر التاريخي `scripts/publish_academic_library_v326.py` عند أصل v326 (`367186ccdd188e991f811a6210483b443dc3cd59`) ثم النسخ اللاحقة من الملف حتى تحديث النطاق. بقيت المادة الجوهرية القديمة مدخلًا موجزًا يعرّف مجموعات التركيز كنقاشات جماعية ميسرة تستفيد من تفاعل المشاركين، مع إشارات مختصرة إلى تكوين المجموعة والتيسير والتحليل والسرية. لم تُنسخ المادة القديمة؛ استُخدمت للاكتشاف وبناء Cluster فقط، ثم أُعيد بناء الصفحة من الصفر.

المسار التاريخي المؤكد: `/library/research/focus-groups/`. فحوص Claim/slug/canonical/المرادفات في GitHub Issues وسجل التقدم المركزي وSupabase لم تكشف Canonical سابقًا عند فتح Claim. بعد البناء يوجد Canonical واحد فقط وslug واحد فقط.

## Evidence verification
- Kitzinger J. (1995), BMJ, PMID `7633241`, DOI `10.1136/bmj.311.7000.299`: مقال منهجي تأسيسي يشرح تكوين مجموعات التركيز وتشغيلها وتحليلها، ويؤكد أن تفاعل المشاركين جزء مميز من المنهج.
- Tong, Sainsbury & Craig (2007), PMID `17872937`, DOI `10.1093/intqhc/mzm042`: المصدر الأصلي لـCOREQ، قائمة إبلاغ من 32 بندًا للمقابلات ومجموعات التركيز. عوملت كإرشاد إبلاغ لا كدرجة جودة آلية.
- Barbour (2005), PMID `15960795`, DOI `10.1111/j.1365-2929.2005.02200.x`: مراجعة منهجية/تعليمية تطبيقية لمجموعات التركيز في التعليم الطبي، وتناقش التخطيط والأخلاقيات والتحليل والمزالق الشائعة.
- O'Brien et al. (2014), PMID `24979285`, DOI `10.1097/ACM.0000000000000388`: SRQR، إطار أوسع للإبلاغ عن البحث النوعي مع الحفاظ على المرونة بين المناهج.
- Hennink, Kaiser & Weber (2019), PMID `30628545`, DOI `10.1177/1049732318821692`: دراسة منهجية تجريبية استخدمت بيانات 10 مجموعات تركيز وميّزت بين code saturation وmeaning saturation. نتائجها لا تُعامل كقاعدة عددية عالمية؛ اختلاف السؤال والعينة والغرض التحليلي يظل حاسمًا.

## Rebuild scope
تعريف المنهج والتمييز عن المقابلة الجماعية؛ ملاءمة السؤال البحثي؛ تكوين المجموعة والعينة والتجنيد؛ حجم المجموعة وعدد المجموعات دون قواعد رقمية جامدة؛ دليل النقاش والأسئلة الافتتاحية والمتابعة؛ دور الميسّر؛ ديناميات السلطة والهيمنة والصمت والاختلاف؛ حدود السرية بين المشاركين؛ الموضوعات الصحية والنفسية الحساسة؛ الحضور مقابل الاتصال عن بعد؛ التسجيل وتحديد المتحدثين؛ التحليل الذي يحفظ السياق الجماعي؛ المقارنة داخل المجموعة وبين المجموعات؛ الانعكاسية؛ الاقتباسات؛ COREQ وSRQR وAPA JARS؛ متى تكون المقابلات الفردية أنسب؛ الأخطاء الشائعة؛ الروابط الداخلية؛ FAQ.

## QA
- Word-like count: **1722**
- H1: **1** via title
- H2: **27**
- H3: **4**
- FAQ: **8**
- References stored in CMS: **5**
- Tags: **5**
- Category relations: **1**
- Versions: **8**
- Audit events: **8**
- Active redirects: **1**
- Canonical rows: **1**
- Slug rows: **1**
- Internal TODO/FIXME/QA/agent markers: **0**
- SEO title: **42 chars**
- Meta description: **156 chars**
- Featured image: none; therefore no missing image Alt requirement.
- Explicit non-diagnostic boundary stored: مجموعات التركيز البحثية ليست علاجًا جماعيًا ولا تشخيصًا نفسيًا أو صحيًا فرديًا.

## SEO / E-E-A-T
Primary keyword: `مجموعات التركيز`. Search aliases include: `المجموعة البؤرية`، `المجموعات البؤرية`، `نقاشات مجموعات التركيز`، `focus groups`، `focus group discussion`، `group interview`. Search intent: informational. Visible author: `فريق تحرير منصة روافد`. لا توجد هوية مراجع بشري أو مؤهلات مختلقة. Structured data من نوع Article، canonical واحد، robots index/follow مفعّلان.

## Internal links
ترتبط الصفحة صراحة بـ`/content/qualitative-interviews` و`/content/mixed-methods` و`/content/preregistration` و`/content/evidence-literacy` و`/sections/research-evidence-learning`.

## Redirect
`/library/research/focus-groups/` **301** → `/content/focus-groups`

## Workflow
`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

Review mode: system-assisted migration QA; no human reviewer identity claimed.

**A5-000023 is closed, rebuilt, canonicalized, published, redirected, documented and post-publish QA passed.**
