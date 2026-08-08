# MIG-A4-000039 — دعم الانتباه والوظائف التنفيذية لدى الطفل

- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #115
- Canonical key: `attention-support`
- Canonical: `/content/attention-support`
- Final status: **PUBLISHED / QA PASS**
- Supabase content ID: `ff45eb6a-a6a3-49b4-b427-9342dd2dac32`

## Ownership / canonical boundary

هذه الصفحة دليل تطبيقي للطفل والأسرة والمدرسة: بدء المهام، استمرار الانتباه، الانتقالات، التخطيط، المراجعة الذاتية، بيئة الدراسة والصف، النوم والحركة والتعاون مع المدرسة. وهي مستقلة عن الصفحات الموسوعية العامة المنشورة `/content/attention` و`/content/executive-functions` و`/content/working-memory`؛ تم ربطها بها داخليًا بدل إعادة تعريفها أو منافستها. لا تعالج تشخيص ADHD ولا اضطرابات التعلم بوصفها موضوعًا مركزيًا.

## Pre-claim dedupe

تم قبل إنشاء Claim البحث عن `attention-support` والعنوان والمرادفات العربية والإنجليزية في:

- GitHub Issues: لا يوجد Claim A4 منافس؛ ظهر فقط C0 `executive-functions` ككيان موسوعي عام مختلف.
- `docs/MIGRATION-PROGRESS.md`: لا توجد Canonical مكتملة بهذا المفتاح.
- Supabase: لا يوجد صف مطابق للـslug أو canonical أو العنوان/alias قبل الإنشاء. الصفحات العامة `attention`, `executive-functions`, `working-memory`, `concentration` موجودة وتبقى مستقلة.

تم إنشاء Claim واحد فقط: **#115**.

## Legacy / history audit

المصدر القديم المثبت:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/child.json`
- slug القديم داخل طبقة المحتوى: `attention-support`
- العنوان القديم: «دعم الانتباه والوظائف التنفيذية»
- المادة القديمة كانت مختصرة: تهيئة البيئة، تعليمات خطوة واحدة، قائمة مرئية، تقسيم المهمة، حركة منظمة، وتجنب التوبيخ.
- تاريخ الملف يثبت إدخاله في commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20.

لم يثبت URL عام تاريخي مستقل لهذا المدخل؛ لذلك لم يتم إنشاء Redirect تخميني.

## Rebuild / exclusions

أعيد بناء الصفحة من الصفر. لم تُنقل الملاحظات الداخلية أو تعليمات الوكلاء أو TODO/QA أو نصوص توليد، ولم تُستخدم الصياغة القديمة القصيرة كصفحة منشورة. تم توسيع الموضوع إلى دليل عملي يشرح حدود المفهوم ثم يركز على البيئة، التعليمات، الذاكرة العاملة، تقسيم المهام، الانتقالات، المشتتات، الوقت، الاستراحات، النوم، التخطيط، المراجعة الذاتية، التعزيز، الصف، الواجب، تمييز صعوبة التنظيم عن صعوبة المهارة، مؤشرات التقييم وخطة تطبيق أسبوعين.

## Evidence used

1. Center on the Developing Child at Harvard University — A Guide to Executive Function.
2. Center on the Developing Child at Harvard University — Activities Guide: Enhancing and Practicing Executive Function Skills.
3. Institute of Education Sciences — Executive Function: Implications for Education.
4. CDC — Health Benefits of Physical Activity for Children.
5. CDC — Sleep in Middle and High School Students.
6. American Academy of Pediatrics / HealthyChildren.org — Developing Good Homework Habits.
7. Institute of Education Sciences — Classroom Environment, Allocation of Attention, and Learning Outcomes in K–4 Students.
8. CDC — Physical Activity, Fitness, Cognitive Function, and Academic Achievement in Children: A Systematic Review.

تم تجنب تحويل الارتباط بين النشاط والانتباه إلى ادعاء علاجي، وتجنب الادعاء بأن تطبيقات «تدريب الدماغ» تنقل أثرها تلقائيًا إلى الأداء المدرسي.

## SEO / E-E-A-T

- H1: عنوان الصفحة فقط، واحد.
- SEO title: `دعم الانتباه لدى الطفل: دليل عملي | روافد` — 41 حرفًا.
- Meta description: 157 حرفًا.
- Primary keyword: `دعم الانتباه لدى الطفل`.
- Search aliases وsecondary keywords تشمل الوظائف التنفيذية ودعم التركيز والتنظيم بالعربية والإنجليزية دون حشو.
- Canonical واحد: `/content/attention-support`.
- Article schema مرتبط بـ`mainEntityOfPage` الصحيح.
- المؤلف: فريق تحرير منصة روافد.
- المراجع/المراجع العلمي والتحريري موضحان مؤسسيًا دون اختلاق شخص مرخص.
- تنبيه قصير فقط يوضح أن الصفحة لا تشخّص ADHD أو صعوبات التعلم.
- لا توجد صورة بارزة؛ Alt غير منطبق حاليًا.

## Internal links

خمسة روابط داخلية، وجميع أهدافها منشورة:

- `/content/attention`
- `/content/executive-functions`
- `/content/working-memory`
- `/content/home-study-space`
- `/content/child-sleep`

## Workflow

تمت المراحل تسلسليًا مع نسخة وسجل تدقيق لكل مرحلة:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

## Final QA

- Status: `published`
- Useful/searchable words: **2327**
- Structured blocks: **70**
- H2: **24**
- H3: **5**
- FAQ: **10**
- References: **8**
- Internal links: **5 / 5 targets published**
- Tags: **5**
- Primary category relations: **1**
- Canonical matches: **1**
- Content versions: **7**
- Audit events: **7**
- Forbidden internal markers (TODO/FIXME/QA/agent/internal notes): **0**
- Featured image: none; Alt: N/A
- Redirects: **0** because no independently verified public predecessor route was established.

## Branch discipline

تم التوثيق على `migration-agent-4-child-family-education` فقط. لم يتم تعديل `main` أو `docs/MIGRATION-PROGRESS.md`.