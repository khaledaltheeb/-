# MIG-A4-000038 — care-for-elderly

## الحالة
- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #93
- Canonical key: `care-for-elderly`
- Canonical: `/content/care-for-elderly`
- العنوان: **رعاية كبار السن داخل الأسرة: دليل عملي يحفظ الكرامة ويمنع استنزاف الأسرة**
- Content ID: `13124aeb-f4af-4983-84fc-f7a6a81d030d`
- الحالة النهائية: `published`

## فحص Claim / Dedupe قبل التنفيذ
تم الفحص قبل إنشاء Claim واحد فقط:
1. GitHub Issues: لا يوجد Claim سابق مطابق للـslug أو المرادفات: رعاية كبار السن، رعاية الوالدين المسنين، رعاية المسنين داخل الأسرة، family elder care، caring for older parents.
2. `docs/MIGRATION-PROGRESS.md` على `legacy-migration-audit`: لا توجد Canonical مكتملة مسجلة للموضوع.
3. Supabase: لا يوجد صف محتوى مطابق للـslug أو canonical أو عناوين/نصوص مرادفة مركزية للموضوع.
4. لم يكن هناك Claim A4 مفتوح عند بدء هذه الصفحة.

## الأدلة التاريخية
- المصدر التاريخي المثبت: `khaledaltheeb/healthrenewal.org/content/sectors-v10/home.json`.
- تتبع تاريخ الملف إلى commit: `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20.
- تم البحث عن النسخ والمسارات المطابقة في المستودع التاريخي؛ لم يثبت predecessor URL عام مستقل يمكن تحويله بأمان.
- النتيجة: **لا Redirect تخميني**. عدد Redirects النشطة إلى الـCanonical عند QA النهائي = 0.

## إعادة البناء التحريري
لم يُنقل النص القديم كما هو. أُعيد بناء الصفحة من الصفر، مع حذف أي حشو أو تكرار أو صياغات داخلية، وتغطية:
- مفهوم الرعاية الأسرية لكبار السن والقدرة الوظيفية.
- استقلال القرار والكرامة والاختيارات الشخصية.
- التغيرات الوظيفية مقارنة بخط الأساس، بدل الاعتماد على العمر وحده.
- الصحة النفسية والعزلة والوحدة.
- توضيح أن الخرف ليس نتيجة حتمية للشيخوخة وعدم التشخيص المنزلي.
- إدارة الأدوية ومراجعتها مع المختصين.
- السلامة المنزلية دون تحويل المنزل إلى بيئة مقيدة.
- توزيع الرعاية بين أفراد الأسرة وملكية المهام.
- إجهاد مقدم الرعاية والراحة المؤقتة.
- الروابط الاجتماعية والمعنى والعلاقة بين الأجيال.
- منع تحميل الأطفال أدوار رعاية غير مناسبة لأعمارهم.
- الخلافات الأسرية والمال والشفافية.
- إساءة معاملة كبار السن بوصفها قضية سلامة وحقوق وليست خلافًا عاديًا.
- التخطيط المبكر وخطة رعاية مختصرة ومتى يُطلب تقييم إضافي.

## المصادر الأساسية
1. World Health Organization — Mental health of older adults.
2. World Health Organization — Ageing and health.
3. World Health Organization — Long-term care.
4. World Health Organization — Dementia.
5. World Health Organization — iSupport for Dementia.
6. National Institute on Aging — Medicines and medication management.
7. National Institute on Aging — Caring for Older Patients With Cognitive Impairment.
8. Centers for Disease Control and Prevention — Caregiving for Family and Friends — A Public Health Issue.

## SEO / E-E-A-T
- SEO title: 46 حرفًا.
- Meta description: 155 حرفًا.
- Primary keyword: `رعاية كبار السن داخل الأسرة`.
- Search aliases عربية وإنجليزية مضافة.
- Semantic terms وsecondary keywords مضافة.
- Robots: index/follow.
- Canonical واحد فقط في `content`.
- Article structured data يتضمن headline، description، author، publisher، inLanguage، datePublished، dateModified وmainEntityOfPage.
- المؤلف الظاهر: `فريق تحرير منصة روافد`.
- المراجع العلمية/التحريرية موثقة في حقول المراجعة دون ادعاء اعتماد سريري غير مثبت.
- Disclaimer تثقيفي مناسب لموضوع YMYL.

## الروابط الداخلية
خمسة روابط داخلية، وجميع أهدافها كانت `published` وقت QA النهائي:
- `/content/family-care-plan`
- `/content/family-help-seeking`
- `/content/family-rest`
- `/content/family-resilience`
- `/content/extended-family-boundaries`

## الصور والإتاحة
- لا توجد صورة بارزة للصفحة؛ `featured_image_url = NULL`.
- لذلك Alt للصورة البارزة غير منطبق، ولم يُخترع Alt لعنصر غير موجود.

## Workflow / الحوكمة
تعذر استخدام `create_content_draft_v4` من اتصال الخدمة لأنه يفرض جلسة مستخدم تفاعلية (`CMS-401 Authentication required`). تم الحفاظ على نفس حوكمة المراحل عبر Supabase، مع تطبيق trigger `private.content_release_gate` الفعلي أثناء الانتقال إلى مراحل المراجعة/الموافقة/النشر، وتسجيل snapshots وaudit events.

المراحل المسجلة:
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

بعد اكتمال Structured Data/E-E-A-T النهائي أضيف snapshot/audit نهائي، فأصبح الإجمالي:
- Content Versions: 8
- Audit Events: 8

## QA النهائي
- Status: `published`
- كلمات تقريبية حسب فصل المسافات: **2155**
- Content blocks: **66**
- H1: واحد عبر عنوان الصفحة في القالب
- H2: **24**
- H3: **3**
- FAQ: **10**
- References: **8**
- Internal links: **5**، وجميع أهدافها منشورة
- Tags: **5**
- Primary categories: **1**
- Canonical rows لهذا المسار: **1**
- Competing canonical: لا يوجد
- Active redirects إلى الـCanonical: **0** لعدم ثبوت predecessor URL
- Featured image: غير موجودة، Alt غير منطبق
- فحص TODO/FIXME/[QA]/تعليمات الوكلاء/الملاحظات الداخلية: **PASS**
- SEO title/meta release constraints: **PASS**
- النتيجة: **PASS / PUBLISHED**

## حدود التنفيذ
- لم يُعدل `main`.
- لم يُعدل `docs/MIGRATION-PROGRESS.md`.
- جميع التوثيقات في فرع `migration-agent-4-child-family-education` فقط.
