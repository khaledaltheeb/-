# MIG-A4-000019 — إعادة تصميم روتين الأسرة

- **Agent:** A4 — الطفل والأسرة والمدرسة
- **Claim:** #64
- **Canonical key:** `family-routine-redesign`
- **Canonical:** `/content/family-routine-redesign`
- **Status:** COMPLETED / PUBLISHED
- **Supabase content id:** `f121a1bd-0e2e-4589-a9b8-a1076a739124`
- **Date:** 2026-08-08

## Scope and conflict checks

قبل إنشاء الـClaim تم البحث عن `family-routine-redesign` و«روتين الأسرة» و«الروتين الأسري» و«الروتين العائلي» و`family routine` في GitHub Issues، وسجل `docs/MIGRATION-PROGRESS.md` على `legacy-migration-audit`، وSupabase. لم يظهر Claim منافس أو Canonical/slug قائم. الموضوع أسري/تربوي عام وليس تشخيصًا نفسيًا بحتًا ولا حالة ذوي احتياجات خاصة مركزية، ولذلك يقع ضمن A4.

## Legacy inventory and history inspected

المسار العام المؤكد:

- `/sectors/family/guides/family-routine-redesign/`
- `sectors/family/guides/family-routine-redesign/index.html`

فُحصت النسخة الحالية وكذلك تاريخ الملف. النسخة الموضوعية الأصلية ظهرت ضمن commit `c184bed0a555f9e539a91e966921d0582bd92deb` بتاريخ 2026-08-01 ضمن دفعة صفحات مولدة، ثم لحقتها تعديلات SEO في `aeeab2b3eccdd7804757e622c3700102d346bb00` وتغييرات هوية/قشرة/GTM لاحقة (`c1dfe00c…`, `70d6a45e…`, `1a7546c…`, `93669ccc…`). لم تظهر نسخة موضوعية تاريخية مستقلة أخرى؛ التغييرات اللاحقة كانت في الغالب بنيوية/علامة/SEO.

## Legacy quality finding

النسخة القديمة كانت قالب v403 عامًا يعيد عبارات مثل «تقييم وظيفي»، «خط أساس»، «بروتوكول تنفيذ»، ICF، تحذيرات سلامة عامة، ومفردات خدمات/تكييفات لا تطابق نية البحث الأساسية لتنظيم روتين الأسرة. لم يُنقل هذا الحشو إلى الـCanonical الجديد. أُعيد بناء الصفحة من الصفر كدليل أسري عملي يركز على نقاط الاحتكاك الحقيقية: الصباح، العودة من المدرسة، النوم، الوجبات، توزيع المسؤوليات، الانتقالات، الشاشات، المرونة، والتنسيق بين مقدمي الرعاية.

## Evidence enrichment

المراجع الأساسية المستخدمة:

1. CDC — Tips for Building Structure.
2. CDC — Tips for Creating Rules.
3. CDC — Tips to Support Healthy Routines for Children and Teens (2026).
4. American Academy of Pediatrics / HealthyChildren — The Importance of Family Routines.
5. American Academy of Pediatrics / HealthyChildren — Age-Appropriate Chores for Children.
6. American Academy of Pediatrics / HealthyChildren — Your Family Rituals.
7. WHO — Guidelines on parenting interventions to prevent maltreatment and enhance parent–child relationships.
8. Head Start — Schedules and Routines at Home.

الرسالة العلمية المركزية المستخدمة: الروتين المفيد يجمع الاتساق وقابلية التوقع والمتابعة مع مرونة مناسبة للعمر، ويجب ألا يتحول إلى صرامة أو أداة سيطرة.

## Content rebuild

العنوان المنشور: **إعادة تصميم روتين الأسرة: دليل عملي ليوم أكثر هدوءًا ومرونة**.

البنية تغطي: تعريف الروتين المفيد؛ خريطة اليوم؛ نقاط الارتكاز؛ الصباح؛ ما بعد المدرسة؛ النوم؛ الوجبات؛ المهام المنزلية؛ توزيع المسؤوليات؛ الإشارات البصرية والبيئية؛ الاختيار؛ الانتقالات؛ الشاشات؛ نسخة اليوم الصعب؛ الإجازات وتغيير المدرسة؛ اختلاف الأعمار؛ حماية العلاقة؛ التعاون بين البالغين؛ قياس النجاح؛ المراجعة الأسبوعية؛ خطة سبع خطوات؛ متى تحتاج المشكلة إلى تقييم أوسع؛ وأسئلة شائعة تخدم نية البحث.

## SEO / E-E-A-T

- SEO title: `روتين الأسرة: تنظيم اليوم وتقليل الصدامات` — 41 حرفًا.
- Meta description: 159 حرفًا، ضمن Release Gate.
- Primary keyword: `روتين الأسرة`.
- 11 search aliases عربية/إنجليزية.
- Canonical واحد فقط.
- Robots index/follow مفعّلان.
- Article schema مع `mainEntityOfPage` الصحيح.
- مؤلف ظاهر: فريق تحرير منصة روافد.
- مراجعة المصادر موثقة دون ادعاء مؤهل مهني غير متحقق.
- 8 مراجع في `references_json` وفي المحتوى.
- لا توجد صورة مميزة مستوردة؛ لذلك لا توجد صورة محتوى تحتاج Alt. حقل الصورة المميزة بقي `NULL` بدل اختلاق صورة غير مرتبطة.

## Internal links and redirects

أضيفت روابط داخلية إلى:

- `/content/parenting-team`
- `/content/family-meetings`
- `/content/child-sleep`
- `/content/screens-child`

وأضيف Redirect دائم 301 مؤكد من:

- `/sectors/family/guides/family-routine-redesign/` → `/content/family-routine-redesign`

## CMS workflow

مرت الصفحة فعليًا بالحالات:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

وسُجلت 7 Content Versions و7 Audit Events.

## Final QA

- Status: `published`
- Useful body tokens: **1903**
- Blocks: **69**
- H1: واحد من عنوان الصفحة؛ لا يوجد H1 إضافي داخل body
- H2: **15**
- H3: **17**
- FAQ: **10**
- References: **8**
- Tags: **5**
- Primary categories: **1**
- Canonical duplicates: **0** (canonical count = 1)
- Active 301 redirects to canonical: **1**
- TODO/FIXME/QA/agent-instruction markers: **0**
- SEO title chars: **41**
- Meta description chars: **159**

لم يتم تعديل `main` أو `docs/MIGRATION-PROGRESS.md`.