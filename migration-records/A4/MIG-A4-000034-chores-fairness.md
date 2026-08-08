# MIG-A4-000034 — chores-fairness

## الحالة
- الوكيل: A4 — الطفل والأسرة والمدرسة
- Claim: #82
- Canonical key: `chores-fairness`
- Canonical URL: `/content/chores-fairness`
- CMS content id: `d689123b-9e65-4f9f-9250-fe5946183b34`
- الحالة النهائية: `published`
- العنوان: **العدالة في الأعمال المنزلية: كيف نوزع المسؤوليات بين أفراد الأسرة**

## فحص منع التكرار قبل الحجز
تم البحث عن Canonical والـslug والمرادفات العربية والإنجليزية في GitHub Issues، ملفات الترحيل/التقدم، وSupabase قبل إنشاء Claim واحد فقط. شملت المرادفات: العدالة في الأعمال المنزلية، توزيع الأعمال المنزلية، مهام الأطفال في المنزل، مسؤوليات الأطفال المنزلية، تقاسم العمل الأسري، household chores fairness، family chores، age-appropriate chores، household responsibilities، equitable household tasks. لم يظهر Canonical أو Claim منافس.

## الاكتشاف التاريخي
- المصدر المثبت: `khaledaltheeb/healthrenewal.org:content/sectors-v10/home.json`.
- الإدخال التاريخي: `chores-fairness` بعنوان «العدالة في الأعمال المنزلية».
- مصدر v10 المشار إليه يعود إلى commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20.
- لم يثبت URL عام تاريخي مستقل يصلح كـpredecessor، ولذلك لم يُنشأ Redirect تخميني.

## إعادة البناء التحريرية
أُعيدت الصفحة من الصفر بدل نقل الإدخال المختصر. تغطي الصفحة توزيع العمل المرئي وغير المرئي، الفرق بين العدالة والمساواة المتطابقة، المهام المناسبة للعمر والقدرة، تعليم المهارة خطوة بخطوة، معايير «جيد بما يكفي»، التعامل مع الرفض، المصروف والمكافآت، حماية الدراسة والنوم واللعب، عدم تحويل التنظيف إلى عقوبة، تجنب المقارنة بين الإخوة، وعدم تحميل الأطفال مسؤوليات رعاية البالغين أو رعاية إخوتهم بصورة دائمة.

أُضيف محور واضح للعدالة الجندرية: الأعمال المنزلية مهارات حياة وليست أدوارًا مرتبطة بالجنس، مع التأكيد على حماية وقت البنات والبنين للتعلم والراحة واللعب وعدم تحميل الفتيات عبئًا رعائيًا غير متناسب.

## المصادر
1. American Academy of Pediatrics / HealthyChildren.org — Age-Appropriate Chores for Children.
2. American Academy of Pediatrics / HealthyChildren.org — Household Chores for Teens.
3. UNICEF — Four key ways to promote equity in household tasks.
4. UNICEF Parenting — Equal treatment from day one.
5. UNICEF Data — Gender norms and unpaid work.
6. CDC — Healthy Habits: Child Development.
7. CDC — Tips for Building Structure.
8. UNICEF Egypt — Caring for Caregivers.

## SEO / E-E-A-T
- SEO title: `العدالة في الأعمال المنزلية: دليل أسري | روافد` — 46 حرفًا.
- Meta description: 150 حرفًا.
- Primary keyword: `توزيع الأعمال المنزلية`.
- Search aliases عربية وإنجليزية موجودة.
- Author/reviewer/reviewer credentials موثقة.
- Article schema يطابق Canonical.
- Medical/educational disclaimer موجود لمنع تفسير الصفحة كتقييم نمائي فردي.

## QA النهائي
- الحالة: `published`.
- الكلمات/الوحدات النصية التقريبية: **2155**.
- Content blocks: **66**.
- H2: **20**.
- H3: **7**.
- FAQ: **10**.
- المراجع: **8**.
- الروابط الداخلية: **5** وجميع أهدافها منشورة.
- Tags: **5**.
- Primary categories: **1**.
- Canonical matches: **1**.
- Content versions: **7**.
- Audit logs: **7**.
- Forbidden markers (TODO/FIXME/QA/تعليمات الوكلاء): **0**.
- Featured image: لا توجد؛ Alt غير منطبق.

## الروابط الداخلية
- `/content/family-routine-redesign`
- `/content/family-rest`
- `/content/family-meetings`
- `/content/parenting-team`
- `/content/sibling-jealousy`

## Workflow
أُنجز بالتسلسل:
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`.

بعد النشر كشف QA أن النظام لم يولد `content_versions` و`audit_logs` تلقائيًا لهذه الصفحة. لم يُغلق Claim قبل إصلاح الحوكمة. تم توثيق المراحل السبع الفعلية في الجدولين ثم إعادة QA حتى أصبحت النتيجة 7/7.

## الحدود
- Redirects: 0؛ لا predecessor URL مثبت.
- Featured image: none؛ Alt غير منطبق.
- لم يُعدّل `main`.
- لم يُعدّل `docs/MIGRATION-PROGRESS.md`.
- التوثيق حصريًا على `migration-agent-4-child-family-education` داخل `migration-records/A4`.
