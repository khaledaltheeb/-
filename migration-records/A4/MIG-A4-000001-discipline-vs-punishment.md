# MIG-A4-000001 — الانضباط الإيجابي أم العقاب؟

## الحالة

- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #6
- Canonical key: `discipline-vs-punishment`
- Canonical slug: `discipline-vs-punishment`
- Canonical path: `/content/discipline-vs-punishment`
- CMS content ID: `2bfa55ef-02e8-49fa-8ce7-59658ae49651`
- Final status: `published`
- Content version: 1

## فحص التعارض ومنع التكرار

قبل البدء تم البحث عن الـClaim والـCanonical والـslug والمرادفات العربية والإنجليزية في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم يوجد Canonical منافس أو Claim سابق. بعد البناء أعيد فحص Supabase وكانت نتيجة المحتوى المنافس: 0.

مرادفات البحث المستخدمة: الانضباط الإيجابي، التأديب الإيجابي، الفرق بين الانضباط والعقاب، العقاب عند الأطفال، تربية الطفل بدون ضرب، positive discipline، discipline vs punishment، child discipline.

## النسخ القديمة التي فُحصت

- `khaledaltheeb/healthrenewal.org:quick-info/discipline-vs-punishment/index.html` — النسخة الحالية.
- النسخة التاريخية عند commit `813a8bdec53c02ec1c9125d075a75e269460c96d` — أول إنشاء ظاهر للصفحة.
- راجعت أيضًا سجل commits للملف؛ التغييرات اللاحقة كانت في معظمها shell/SEO/GTM ولم تضف مادة موضوعية معتبرة تستحق إنشاء Canonical منفصل.
- مراجع sitemap/API/generator للـslug اعتبرت مشتقات تقنية وليست نسخ محتوى مستقلة.

## ما استُبعد من Legacy

أعيد بناء الصفحة من الصفر ولم يُنسخ القالب القديم. استُبعدت المقارنات العامة المولدة آليًا، FAQ التشخيصي غير المتصل بالموضوع، تحذير الطوارئ العام غير الضروري، والمراجع غير المطابقة للموضوع التي كانت تشير إلى ADHD والتوحد. لم تُنقل CSS أو JavaScript أو Analytics أو تعليمات بناء قديمة.

## البناء الجديد

- 2673 كلمة عربية مفيدة محسوبة من `body_text`.
- 54 content blocks.
- H1 واحد من عنوان الكيان، و16 H2 و4 H3 داخل body.
- 10 أسئلة FAQ مرتبطة مباشرة بنوايا البحث.
- جدول يفرق بين الانضباط الإيجابي والعقاب القاسي/المهين.
- تقسيم تطبيقي حسب العمر: الرضع وصغار الأطفال، ما قبل المدرسة، سن المدرسة، المراهقة.
- مسار خاص للمدرسة وإدارة الصف والتنسيق بين الأسرة والمدرسة.
- خطة عملية من سبع خطوات للأسرة.
- لا TODO/QA/تعليمات وكلاء أو كتل نصية مكررة حرفيًا.

## المصادر العلمية

تمت المراجعة مقابل مصادر أصلية ورسمية، وأضيفت 8 مراجع في `references_json`، أهمها:

1. WHO — Guidelines on parenting interventions to prevent maltreatment and enhance parent–child relationships with children aged 0–17 years (2023).
2. WHO — Corporal punishment of children and health (2026).
3. WHO — Child maltreatment (2026).
4. CDC — Positive Parenting Tips (2026).
5. CDC — Healthy Habits: Child Development (2026).
6. CDC — Practice Parenting Skills: Discipline and Consequences.
7. American Academy of Pediatrics — Effective Discipline to Raise Healthy Children.
8. American Academy of Pediatrics — Corporal Punishment in Schools.

## SEO / E-E-A-T

- Primary keyword: `الانضباط الإيجابي`
- SEO title: `الانضباط الإيجابي والعقاب: دليل عملي للأهل` — 42 حرفًا.
- Meta description: 150 حرفًا.
- Search intent: informational.
- Canonical واحد: `/content/discipline-vs-punishment`.
- Search aliases + secondary keywords + semantic terms مكتملة.
- Article structured data مضافة.
- المؤلف الظاهر: فريق تحرير منصة روافد.
- تمت مراجعة المصادر مقابل WHO/AAP/CDC وسُجل تاريخ آخر مراجعة.
- أضيف تنبيه تثقيفي مختصر فقط، بلا تكرار تحذيرات.
- لا توجد صورة مميزة في الكيان؛ لذلك لا يوجد عنصر صورة يحتاج Alt. جميع روابط المصادر والروابط الداخلية المضافة نصية.
- روابط داخلية: قطاع الطفل والأسرة والمدرسة + صفحة الذاكرة العاملة.

## Redirects

تم إنشاء Redirect دائم 301:

`/quick-info/discipline-vs-punishment/` → `/content/discipline-vs-punishment`

## Workflow / QA

مرت الصفحة بالتسلسل: `draft` → `scientific_review` → `editorial_review` → `seo_review` → `accessibility_review` → `approved` → `published`.

تحقق ما بعد البناء:

- words = 2673
- blocks = 54
- H2 = 16
- H3 = 4
- FAQ = 10
- references = 8
- exact duplicate blocks = 0
- internal note/TODO/QA hits = 0
- competing Supabase canonical/content = 0
- 301 redirect active = true
- content version 1 snapshot created

لم يتم تعديل `main` ولم يتم تعديل `docs/MIGRATION-PROGRESS.md` المركزي.