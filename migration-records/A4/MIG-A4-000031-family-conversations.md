# MIG-A4-000031 — حوارات عائلية حساسة

- **Lane:** A4 — الطفل والأسرة والمدرسة
- **Claim:** #79 — `[MIG-CLAIM][A4][family-conversations]`
- **Canonical:** `/content/family-conversations`
- **Final status:** **PUBLISHED / QA PASS**
- **CMS ID:** `a322582e-0eb6-42d0-9d48-eb1992a604ea`

## Ownership / dedupe
فُحص GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase قبل Claim، ولم يظهر Claim أو Canonical أو slug أو alias منافس. الموضوع A4 عام عن التواصل الأسري المناسب للعمر، وليس تشخيصًا نفسيًا أو حالة احتياجات خاصة مركزية.

## Legacy audit
- المصدر: `khaledaltheeb/healthrenewal.org/content/sectors-v10/home.json`، slug `family-conversations`.
- الملف موجود منذ commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ **2026-07-20**.
- المادة القديمة كانت بطاقة مختصرة عن موضوعات مثل الموت والمرض والمال، وليست صفحة طويلة مكتملة.
- لم يثبت URL عام تاريخي مستقل للبطاقة، لذلك **لم يُنشأ Redirect تخميني**.

## Rebuild
أُعيد بناء الصفحة من الصفر مع حذف منطق البطاقة القصيرة وعدم نقل أي حشو أو ملاحظات داخلية. تغطي الصفحة: البدء بما يعرفه الطفل، اختيار الوقت، الصدق المناسب للعمر، تصحيح المعلومات، الاعتراف بالمشاعر، تجنب الوعود غير المضمونة، فصل مسؤوليات الكبار عن الطفل، الفروق العمرية، الوفاة، المرض، الطلاق، المال، الأخبار والحرب، الصحة النفسية، التعامل مع عدم اليقين ورفض الحديث، إنهاء الحوار والمتابعة، ومتى يلزم دعم إضافي، مع خطة محادثة عملية من خمس مراحل.

## Sources
8 مراجع موثوقة في CMS، من بينها UNICEF Parenting والأكاديمية الأمريكية لطب الأطفال/HealthyChildren حول الحديث عن النزاعات والأخبار الصادمة، الصحة النفسية، الطلاق، وفهم الأطفال للموت، إضافة إلى إرشادات UNICEF الحديثة للأبوة الإيجابية.

## SEO / E-E-A-T
- SEO title: `الحوار مع الطفل عن الموضوعات الصعبة | دليل` — **42 chars**.
- Meta description: **151 chars**.
- Primary keyword: `الحوار مع الطفل عن الموضوعات الصعبة`.
- Canonical واحد: `/content/family-conversations`.
- Article schema + robots index/follow.
- مؤلف ظاهر: فريق تحرير منصة روافد.
- مراجعة تحريرية وعلمية موثقة بالمصادر دون اختلاق هوية مختص فردي.
- YMYL disclaimer موجود.
- لا featured image؛ Alt غير منطبق.

## Workflow / QA
التسلسل: `draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`.

النتيجة النهائية:
- **2084** كلمة/وحدة نصية مفيدة بحساب قاعدة البيانات.
- **74** كتلة.
- **24 H2** و**8 H3**.
- **10 FAQ**.
- **8 مراجع**.
- **5 روابط داخلية / 5 أهداف منشورة**.
- **5 Tags**.
- **1 category relation**.
- **1 canonical match**.
- **0 redirects** لعدم وجود predecessor موثق.
- **7 versions** و**7 audit events**.
- Forbidden internal markers: **0**.

## Governance
السجل حصريًا على `migration-agent-4-child-family-education`. لم يُعدّل `main` أو `docs/MIGRATION-PROGRESS.md`.