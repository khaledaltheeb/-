# MIG-A4-000057 — family-stigma

- **Agent:** A4 — الطفل والأسرة والمدرسة
- **Claim:** #170
- **Canonical key:** `family-stigma`
- **Canonical URL:** `/content/family-stigma`
- **Final title:** مواجهة الوصمة النفسية داخل الأسرة: دليل عملي للدعم والخصوصية
- **Final status:** `published`
- **Supabase content id:** `718482ae-c0c7-4734-83b4-f60f0bf77f0a`

## Scope decision

الموضوع A4 لأنه يركز على اللغة والسلوك والقرارات الأسرية المحيطة بالصحة النفسية: الوصمة، الخصوصية، احترام الكرامة، الحديث مع الطفل والمراهق، مشاركة المعلومات مع المدرسة والأقارب، وتشجيع طلب المساعدة. لا يشرح أو يشخّص اضطرابًا نفسيًا بعينه؛ أي تشخيص نفسي بحت يبقى ضمن A1.

## Duplicate / claim checks

قبل فتح Claim تم البحث عن `family-stigma` والمرادفات العربية والإنجليزية في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم يوجد Canonical عام منشور أو Claim سابق لهذا الموضوع، كما أعاد فحص Supabase النهائي صفر تصادمات للـCanonical أو `search_aliases`.

خلال الفرز ظهر أن `chronic-illness-family` منشور أصلًا في Supabase رغم بقاء نص CLAIMED قديم داخل Issue تاريخية مغلقة؛ لذلك لم يُنشأ Claim أو Duplicate له.

## Legacy audit

المصدر التاريخي المثبت هو `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json` تحت المفتاح `family-stigma` بعنوان «مواجهة الوصمة النفسية داخل الأسرة». تاريخ المسار يربطه بحزمة القطاعات في commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20. فُحص مسارا `/family/family-stigma/index.html` و`/content/family-stigma/index.html` في المستودع الحالي ولم يثبت وجود صفحة HTML مستقلة؛ لذلك لم يُنشأ Redirect تخميني.

النسخة القديمة كانت مدخلًا قصيرًا يضم summary/signals/steps/phrases/avoid. لم تُنقل ميكانيكيًا؛ أُعيد بناء الصفحة من الصفر مع حذف الاختزال والتكرار وأي منطق قالب غير صالح كصفحة Canonical موسعة.

## Evidence base

اعتمدت الصفحة على 8 مراجع رسمية موثقة في `references_json` من WHO/WHO Europe وCDC/NIOSH وUNICEF، وتغطي: تعريف الوصمة وآثارها على طلب الرعاية، مكافحة الوصمة والتمييز، حقوق وكرامة الأشخاص، اللغة غير الوصمية، التواصل مع الأطفال حول الصحة النفسية، وتصحيح الخرافات.

## Content architecture

يغطي المحتوى: تعريف الوصمة داخل الأسرة؛ صورها الصريحة والخفية؛ أثرها على طلب المساعدة؛ الفرق بين الخصوصية والسرية المفروضة بالخجل؛ اللغة التي تحترم الشخص؛ تصحيح المعلومات دون إذلال؛ رفض العلاج بسبب «العيب»؛ الحديث مع الطفل والمراهق؛ مشاركة الحد الأدنى اللازم مع المدرسة والأقارب؛ منع الكشف القسري؛ خطة أسرية من ست خطوات؛ ما يجب تجنبه؛ طلب المساعدة؛ المعتقدات الاجتماعية والدينية؛ متى نحتاج مساعدة مهنية؛ وأسئلة شائعة تخدم نوايا البحث.

## SEO / E-E-A-T

- SEO title: 45 حرفًا.
- Meta description: 155 حرفًا.
- Primary keyword: `الوصمة النفسية داخل الأسرة`.
- Canonical واحد: `/content/family-stigma`.
- Search aliases: 10 مرادفات عربية/إنجليزية.
- Author/reviewer metadata populated.
- 8 official references.
- Medical disclaimer concise and scope-appropriate.
- No featured image is assigned; image alt is therefore not applicable rather than being fabricated.

## Internal linking

6 روابط داخلية فعلية إلى صفحات منشورة:

- `/content/teen-privacy-vs-withdrawal`
- `/content/nonviolent-communication`
- `/content/active-listening`
- `/content/family-help-seeking`
- `/content/emotional-safety`
- `/content/healthy-boundaries`

تم التحقق من أن جميع الأهداف الستة `published`.

## QA result

- Searchable Arabic words: **2345**
- Content blocks: **84**
- H1: **1** عبر عنوان الصفحة
- H2: **18**
- H3: **16**، منها 10 أسئلة شائعة و6 خطوات فرعية
- References: **8**
- Internal links: **6**
- Tags: **5**
- Primary categories: **1**
- Canonical/alias collisions: **0**
- TODO/FIXME/QA/MIGRATION/agent/internal instructions in public body: **0**
- Content versions: **8**
- Audit events: **8**
- Final status: **published**

أثناء الإدخال الأول تراجعت المعاملة بالكامل لأن مخطط `content_versions` الحالي لا يحتوي الحقل القديم `source_table`. تحقق الفحص من عدم بقاء صف جزئي، ثم أُعيدت العملية بالمخطط الفعلي. بعد النشر كشف QA أن H3 مخزنة بمستوى 3 لكن `type` لم يكن `heading` وأن الروابط الداخلية كانت أسماء غير مرتبطة؛ جرى تصحيح النوع وإضافة 6 روابط فعلية ثم إنشاء Version/Audit ثامن لتوثيق تصحيح ما بعد النشر. الفحص النهائي أعلاه هو الذي حُسمت عليه حالة PASS.

## Redirects

لا يوجد Redirect جديد. لم يثبت predecessor URL عام مستقل في المستودع، ولذلك لم يُخترع مسار قديم افتراضي.

## Protected files

لم يتم تعديل `main` ولم يتم تعديل `docs/MIGRATION-PROGRESS.md` أو أي سجل تقدم مركزي.
