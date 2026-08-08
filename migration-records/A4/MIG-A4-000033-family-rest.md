# MIG-A4-000033 — family-rest

## الحالة
- الوكيل: A4 — الطفل والأسرة والمدرسة
- Claim: #81
- Canonical key: `family-rest`
- Canonical URL: `/content/family-rest`
- CMS content id: `dbcca426-52e5-4c3b-9cab-e318a39db353`
- الحالة النهائية: `published`
- العنوان: **الراحة الأسرية في المنزل: كيف نبني وقتًا للاسترداد دون تعطيل الحياة**

## فحص منع التكرار قبل الحجز
أُجري فحص Claim/Canonical/slug والمرادفات قبل إنشاء Claim واحد فقط. لم يوجد Claim مفتوح منافس، ولم يوجد سجل مطابق في `docs/MIGRATION-PROGRESS.md` على فرع `legacy-migration-audit`، ولم توجد صفحة في Supabase تطابق `family-rest` أو عنوان/مرادفات الموضوع. المرادفات التي فُحصت شملت: الراحة الأسرية، الراحة الجماعية في المنزل، وقت الراحة للعائلة، وقت الفراغ الأسري، الاستراحة العائلية، family rest، family downtime، family recharge، family recovery time، unstructured family time.

## الاكتشاف التاريخي
المصدر التاريخي الأساسي المثبت هو:
- `khaledaltheeb/healthrenewal.org:content/sectors-v10/home.json`
- الإدخال التاريخي: `family-rest` بعنوان «الراحة الجماعية في المنزل».
- الملف دخل التاريخ في commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20.

كما فُحص ظهور عبارة عامة مرتبطة بالراحة في `content/v18/care-guides-ar.json`، واتضح أنها طبقة دليل رعاية عامة وليست Canonical منافسة مستقلة.

لم يثبت URL عام تاريخي مستقل صالح كـpredecessor، لذلك لم يُنشأ Redirect تخميني.

## قرار التحرير وإعادة البناء
لم يُنقل النص القديم كما هو. أُعيد بناء الصفحة من الصفر، مع حذف الاختزال والحشو وأي لغة داخلية أو تعليمات تشغيل، وتوسيع الموضوع إلى دليل أسري تطبيقي يشرح:
- الفرق بين الراحة والنوم والوقت غير المنظم.
- لماذا لا يعني الوجود في المنزل أن الأسرة تستريح فعليًا.
- مؤشرات فرط الجدولة والإجهاد اليومي دون تحويلها إلى تشخيص.
- حاجة الطفل إلى اللعب والوقت غير المنظم والملل الآمن.
- احتياجات الوالد/مقدم الرعاية وتوزيع العبء غير المرئي.
- فترة الانتقال بعد المدرسة والهبوط التدريجي مساءً.
- الشاشات والفرق بين الترفيه والاسترداد.
- خصوصية المراهق والتمييز بين الوقت الفردي والعزلة المقلقة.
- العطلات، الظروف الاقتصادية، البيوت الصغيرة ونظام المناوبات.
- خطة أسبوعين عملية لإعادة التوازن.
- متى لا تكفي تعديلات الروتين ويصبح التقييم الصحي أو النفسي مناسبًا.

## المصادر المرجعية
استندت الصفحة إلى مصادر رسمية ومهنية، منها:
1. UNICEF Parenting — Self-care for parents.
2. UNICEF Parenting — How to reduce stress.
3. CDC — Tips to Support Healthy Routines for Children and Teens.
4. CDC — Healthy Habits: Child Development.
5. CDC/NCHS — Sleep Routines and Tiredness Among Children Ages 2–17 Years: United States, 2024.
6. American Academy of Pediatrics / HealthyChildren.org — Sleep and Health: Why Rest Matters for Your Child—and Your Whole Family.
7. American Academy of Pediatrics / HealthyChildren.org — School Breaks: Swap Screens for Play.
8. American Academy of Pediatrics / HealthyChildren.org — Challenges & Benefits of Shift Work for Families.

## SEO / E-E-A-T
- SEO title: `الراحة الأسرية في المنزل: دليل عملي | روافد` — 43 حرفًا.
- Meta description: 159 حرفًا.
- Primary keyword: `الراحة الأسرية`.
- Secondary keywords تشمل: وقت الراحة للعائلة، الراحة في المنزل، وقت غير منظم للأطفال، العناية بالنفس للوالدين، family downtime.
- Search aliases ثنائية اللغة مضافة.
- Author/reviewer/reviewer credentials موثقة في CMS.
- `medical_disclaimer` موجود لأن الصفحة تتناول الإرهاق والنوم والصحة النفسية بصورة تثقيفية.
- Schema Article موجود مع `mainEntityOfPage` للـCanonical نفسه.
- Canonical واحد فقط في CMS.

## البنية وجودة المحتوى
QA النهائي بعد النشر:
- الكلمات العربية/النصية التقريبية: **2104**.
- Content blocks: **58**.
- H2: **17**.
- H3: **6**.
- FAQ: **10**.
- المراجع: **8**.
- الروابط الداخلية: **5**.
- Tags: **5**.
- Primary categories: **1**.
- Canonical matches: **1**.
- Forbidden markers (TODO/FIXME/QA/تعليمات الوكلاء): **0**.
- Featured image: لا توجد صورة بارزة؛ لذلك Alt غير منطبق حاليًا.

الروابط الداخلية تذهب إلى صفحات منشورة:
- `/content/family-routine-redesign`
- `/content/family-rituals`
- `/content/shared-meals`
- `/content/home-calm-corner`
- `/content/financial-stress`

## سير المراجعة
أُغلقت المراحل بالتسلسل:
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

بعد الوصول إلى `published` كشف QA حوكمة أن `content_versions` و`audit_logs` لم يُنشآ تلقائيًا لهذه الصفحة. لم يُغلق Claim بهذه الحالة. تم توثيق المراحل السبع الفعلية في الجدولين، ثم أُعيد QA وأصبحت النتيجة:
- Content versions: **7**.
- Audit logs: **7**.

## Redirects والصور
- Redirects: **0**؛ لا يوجد predecessor URL عام مستقل مثبت، ومنعًا لإنشاء تحويل تخميني.
- Featured image: **none**؛ Alt غير منطبق.

## حدود العمل
- لم يُعدّل `main`.
- لم يُعدّل `docs/MIGRATION-PROGRESS.md`.
- التوثيق محصور في فرع `migration-agent-4-child-family-education` ومسار `migration-records/A4`.
