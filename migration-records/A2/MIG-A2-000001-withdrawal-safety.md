# MIG-A2-000001 — withdrawal-safety

## الحالة

- الوكيل: A2 — الإدمان والتعافي
- Claim: #22 — `[MIG-CLAIM][A2][withdrawal-safety] سلامة الانسحاب من المواد`
- Canonical key: `withdrawal-safety`
- Canonical path: `/content/withdrawal-safety`
- CMS content id: `68b913ec-d6e8-45f1-b4c4-bf12f77c9aec`
- CMS status: `scientific_review`
- الفهرسة أثناء المراجعة: `robots_index=false`
- حالة الإغلاق: **BLOCKED — SCIENTIFIC REVIEW**
- سبب عدم الإغلاق: لا يوجد أي ملف مستخدم/مراجع علمي مؤهل مسجل في `public.profiles` وقت هذا التشغيل، ولا يجوز اختلاق هوية مراجع أو اعتماد طبي صوري.

## التحقق قبل الـClaim

تم البحث قبل الحجز في:

1. GitHub Issues عن `withdrawal-safety` و«سلامة الانسحاب» و«انسحاب المواد» و«متلازمة الانسحاب» و`substance withdrawal` ولم يظهر Claim/Canonical متعارض.
2. `docs/MIGRATION-PROGRESS.md` من فرع `legacy-migration-audit`؛ لم تكن الصفحة مسجلة كمكتملة أو محجوزة لـA2.
3. Supabase `public.content` في `slug/title/search_aliases`؛ لم يوجد Canonical مطابق أو مرادف منافس.

أُنشئ Claim واحد فقط: Issue #22.

## فحص النسخ الحالية والتاريخية

### النسخة المطابقة

- Legacy URL: `/addiction/withdrawal-safety/`
- Legacy file: `addiction/withdrawal-safety/index.html`
- أول إنشاء معرفي واضح: commit `99948bf235ba8ac2fa9362022572dff9858f99e4` بتاريخ 2026-08-03، ضمن نشر مركز الإدمان والتعافي.
- التعديلات اللاحقة كانت في معظمها Shell/SEO/Brand/GTM وليست نسخًا معرفية مستقلة؛ لذلك لم يُفترض أن أحدث HTML هو أفضل مصدر للمادة.

### مرادفات مسار تم فحصها واستبعادها من الـCluster

- `/quick-info/calm-vs-withdrawal/`: موضوعه «هدوء أم انسحاب نفسي؟» أي الانسحاب النفسي/الاجتماعي، وليس انسحاب مادة.
- `/quick-info/sudden-withdrawal-reasons/`: موضوعه «خمس أسباب تجعل شخصًا ينسحب فجأة من الناس»، وليس متلازمة انسحاب مادة.

النتيجة: لا Redirect لهذين المسارين. الـRedirect الوحيد المثبت لهذا Canonical هو المسار القديم `/addiction/withdrawal-safety/`.

## ما تم حذفه من النسخة القديمة

أُعيد بناء المحتوى من الصفر بدل نسخ HTML القديم. استُبعدت طبقات GTM والـCSS والـplatform shell، وأي صياغة قابلة للتكرار أو تحذير زائد أو عناصر تقنية لا تخص القارئ. لم تُنقل جداول جرعات أو تعليمات علاج ذاتي. جرى الحفاظ فقط على الأسئلة والحقائق المفيدة بعد التحقق منها وإعادة صياغتها ضمن بنية جديدة.

## البنية الجديدة ونوايا الجمهور

الصفحة تغطي بصورة مترابطة:

- تعريف متلازمة الانسحاب والفرق بين الاعتماد الجسدي واضطراب استخدام المادة.
- علامات الطوارئ دون لغة تخويف.
- اختلاف الخطورة بين الكحول، البنزوديازيبينات/المهدئات، الأفيونات، المنشطات، القنب، النيكوتين، والمستنشقات/المواد غير المعروفة.
- كيفية تقدير مستوى الرعاية.
- مسار الشخص الذي يستعد للتوقف أو الخفض.
- مسار الأسرة ومقدم الرعاية.
- مسار المختص.
- مسار الباحث عن مركز أو برنامج.
- أخطاء شائعة، خطة أمان عامة فقط بعد موافقة المختص، والاستمرارية بعد مرحلة الانسحاب.
- 10 أسئلة بحثية شائعة وإجابات مباشرة.
- رابطان داخليان: قطاع الإدمان والتعافي، ودليل المراكز والخدمات.

## المصادر المرجعية

تم إثراء الصفحة والتحقق من claims الرئيسية عبر مصادر رسمية/مهنية أصلية:

1. World Health Organization — Management of alcohol withdrawal.
2. American Society of Addiction Medicine — The ASAM Clinical Practice Guideline on Alcohol Withdrawal Management (2020).
3. American Society of Addiction Medicine — Joint Clinical Practice Guideline on Benzodiazepine Tapering (2025).
4. World Health Organization — Management of drug withdrawal.
5. ASAM / American Academy of Addiction Psychiatry — Clinical Practice Guideline on the Management of Stimulant Use Disorder (2024).
6. Centers for Disease Control and Prevention — Opioid Use Disorder: Treating.
7. Centers for Disease Control and Prevention — Assess Risks and Potential Harms of Opioid Use.
8. World Health Organization — ASSIST self-help strategies for cutting down or stopping substance use.

## CMS / Taxonomy

كان قطاع `addiction-recovery` غير موجود أصلًا في `public.sectors` رغم تخصيص A2 له في نظام الوكلاء. أضيف تعريف قطاع idempotent باسم «الإدمان والتعافي»، ثم فئة `withdrawal-management` باسم «الانسحاب وإدارة الأعراض» حتى لا تُسجل الصفحة في قطاع خاطئ.

- Sector id: `1088b29a-fe97-483f-a2e6-b6715a7e58a0`
- Category id: `dbc70576-b2ed-4c90-bbe9-2e65b7c5d66d`
- Content/category primary relation: 1
- Tags: 6 (`withdrawal`, `alcohol-withdrawal`, `benzodiazepine-withdrawal`, `opioid-use-disorder`, `harm-reduction`, `recovery`)

## SEO / E-E-A-T / Accessibility

- SEO title length: 38 characters.
- Meta description length: 150 characters بعد إصلاحه ليتوافق مع Release Gate (150–160).
- Canonical rows: 1.
- Primary keyword: `سلامة الانسحاب`.
- Search aliases: العربية والإنجليزية الأساسية للموضوع.
- Search intent: `informational` وفق constraint النظام.
- Schema: `MedicalWebPage`.
- Author display: `فريق تحرير منصة روافد`.
- Scientific reviewer: **غير مُعين**؛ لم تُختلق هوية أو اعتماد.
- Featured image: غير معين، لذلك `featured_image_alt` غير مطلوب حاليًا. إذا أضيفت صورة لاحقًا يجب إضافة Alt قبل الاعتماد وفق Release Gate.
- Medical disclaimer: تنبيه واحد موجز مخصص للمخاطر الفعلية، لا إخلاءات متكررة.

## Redirects

- `301 /addiction/withdrawal-safety/` → `/content/withdrawal-safety`
- لا Redirect للصفحات النفسية/الاجتماعية التي تحتوي كلمة withdrawal في slug لأنها ليست Duplicate موضوعيًا.

## QA المنفذ

- Arabic/whitespace word count: **2374**.
- H1: واحد، مصدره عنوان الصفحة في قالب المحتوى.
- H2: **14**.
- H3: **7**.
- FAQ: **10**.
- Official/professional references: **8**.
- Internal resource blocks: **2**.
- Canonical rows: **1**.
- Active verified redirect: **1**.
- Tags linked: **6**.
- Primary category relations: **1**.
- Possible duplicate content rows by canonical title/aliases: **0**.
- Version snapshots: **2** (draft reconstruction + scientific-review snapshot).
- Audit entries: **3** قبل التوثيق النهائي.
- Registered profiles/reviewers in Supabase: **0**.

## حاجز الإصدار وما يلزم المنسق

المحتوى والتحرير وSEO والـdedupe والـredirect وQA الفني مكتملة، لكن الصفحة **لا تعد مكتملة Canonical ولا تُنشر** قبل مراجعة علمية فعلية. الحالة وُضعت في `scientific_review` مع `robots_index=false`.

الإجراء التالي للمنسق/المراجعة:

1. تسجيل/تعيين مراجع علمي مؤهل حقيقي في النظام.
2. إجراء المراجعة وتوثيق اسم المراجع ومؤهلاته و`last_reviewed_at` بصورة صحيحة.
3. الانتقال عبر بقية workflow gates ثم تشغيل QA النهائي والفهرسة.
4. عند الإغلاق فقط، يدمج C0 السجل في `docs/MIGRATION-PROGRESS.md`؛ A2 لم يعدل سجل التقدم المركزي.

بسبب قاعدة «صفحة واحدة مفتوحة فقط لكل وكيل»، لم يفتح A2 صفحة ثانية أثناء بقاء هذا Claim محجوزًا عند بوابة المراجعة العلمية.