# MIG-A4-000040 — شراكة المدرسة والأسرة

- Lane: `A4`
- Canonical key: `school-family-partnership`
- Final canonical: `/content/school-family-partnership`
- Claim: #120
- CMS content ID: `106b2898-eeb9-429d-94cd-a654621f1df4`
- Final status: `published`
- Branch: `migration-agent-4-child-family-education`

## Canonical / ownership decision

هذه الصفحة هي الدليل العام لشراكة المدرسة والأسرة في التعليم العام: التواصل ثنائي الاتجاه، الأهداف المشتركة، الاجتماعات، صوت الطفل، الخصوصية، الحواجز اللغوية/الزمنية، المتابعة وقياس أثر الخطة.

لا تدمج الصفحة مسار `learning-paths/family-school-partnership-special-education/`؛ ذلك المسار مخصص للتربية الخاصة واتخاذ القرار والخدمات المرتبطة باحتياجات خاصة، ويبقى ضمن سياق A3. كما لا تستبدل الصفحة بوابة `/schools/` لأنها Collection/Portal أوسع، لا Canonical موضوعية مكافئة.

## Pre-claim dedupe

تم قبل إنشاء Claim البحث عن العنوان والـslug والمرادفات العربية والإنجليزية في:

- GitHub Issues: لا Claim منافس.
- `docs/MIGRATION-PROGRESS.md`: لا Canonical مطابقة.
- Supabase `content`: لا slug/title/canonical/search alias مطابق.
- Supabase `redirects`: لا source/destination مطابق.

أنشئ Claim واحد فقط: `#120`، ولم تكن هناك صفحة A4 أخرى مفتوحة أثناء التنفيذ.

## Legacy discovery and history

المواد القديمة/القريبة التي فُحصت:

1. `khaledaltheeb/healthrenewal.org/schools/index.html` — بوابة المدارس، وتحتوي صراحة على محور «شراكة المدرسة والأسرة» مع تنظيم التواصل وتحديد الأدوار والاستعداد للاجتماعات. سجل Git history للمسار يحتوي إدخالًا واحدًا مثبتًا في commit `ab295194f410a8e7bf798c4b13aedf6cf25d3fb1` بتاريخ 2026-08-06، لذلك لا توجد نسخ تاريخية أخرى للمسار نفسه تحتاج دمجًا.
2. `khaledaltheeb/healthrenewal.org/learning-paths/family-school-partnership-special-education/index.html` — فُحصت لأنها أقرب صفحة موضوعية بالاسم، لكنها متخصصة في التربية الخاصة واتخاذ القرار والخدمات والدعم المرتبط بالحالات، ولذلك لم تُدمج في Canonical A4 العامة.
3. بحث المستودع عن «شراكة المدرسة والأسرة» و«التواصل بين الأسرة والمدرسة» ومرادفاتهما لم يثبت predecessor عام مستقل مكافئ للـCanonical الجديدة.

### Redirect decision

لم يُنشأ Redirect تخميني. `/schools/` بوابة قائمة وليست predecessor مكافئًا، ومسار التربية الخاصة صفحة مستقلة ذات نية مختلفة. لذلك عدد Redirects للـCanonical الجديدة = 0.

## Rebuild / editorial decisions

أعيد بناء الصفحة من الصفر. لم يُنسخ HTML القديم ولم تُنقل التنبيهات أو قوالب الواجهة أو الملاحظات الداخلية. ركزت النسخة الجديدة على:

- تعريف عملي للشراكة بوصفها مسؤولية مشتركة.
- التواصل المبكر قبل الأزمة والتواصل ثنائي الاتجاه.
- أهداف قابلة للملاحظة بدل تبادل اللوم.
- ما تشاركه الأسرة وما تحتاج المدرسة إلى مشاركته.
- وصف السلوك/الأداء بدل الصفات الثابتة.
- التحضير لاجتماعات المدرسة من الطرفين.
- إشراك الطفل بما يناسب العمر.
- إدارة الخلاف دون تحويله إلى صراع شخصي.
- فصل الدعم المدرسي العام عن التشخيص والخدمات المتخصصة.
- الخصوصية وحدود مشاركة المعلومات وفق النظام المحلي.
- الحواجز الزمنية واللغوية والثقافية وخيارات المشاركة المرنة.
- تراجع الدرجات والحضور والسلوك والانتقالات بين الصفوف.
- خطة متابعة لمدة 30 يومًا ومؤشرات واضحة لنجاح الشراكة.
- 10 أسئلة شائعة مرتبطة بنية البحث الفعلية.

## Evidence / sources

اعتمد الإثراء على مصادر رسمية، أهمها:

- CDC — Parent Engagement in Schools.
- CDC — Overview of Parent Engagement.
- CDC — Information for Parents.
- CDC — Information for Teachers and Other School Staff.
- CDC — Information for School Districts and Administrators.
- CDC — Parents for Healthy Schools.
- CDC — Parents for Healthy Schools Resources.
- U.S. Department of Education — Family Partnership and Engagement (last reviewed 2026-02-26).

تمت صياغة الادعاءات بوصفها ارتباطات/ممارسات داعمة عند الحاجة، دون تحويل مشاركة الأسرة إلى وعد سببي بتحسين الدرجات أو إلى بديل عن التقييم المهني.

## SEO / E-E-A-T

- SEO title: `شراكة المدرسة والأسرة: دليل عملي | روافد` — 40 حرفًا.
- Meta description: 156 حرفًا.
- Primary keyword: `شراكة المدرسة والأسرة`.
- Search aliases: عربية وإنجليزية تشمل `family-school partnership` و`school-family partnership`.
- Visible author: `فريق تحرير منصة روافد`.
- Reviewer label: `فريق المراجعة العلمية والتحريرية في روافد`؛ لا يوجد ادعاء باسم مختص فردي أو اعتماد مختلق.
- References JSON: 8 مصادر رسمية.
- Canonical rows: 1.
- Robots: index/follow.
- Featured image: none; Alt غير منطبق حتى توجد صورة فعلية.

## Internal links

خمسة روابط داخلية، وكل أهدافها `published`:

- `/content/home-study-space`
- `/content/attention-support`
- `/content/bullying`
- `/content/school-attendance-distress`
- `/content/parenting-team`

## Workflow

أغلقت الصفحة بالتسلسل:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

تم تسجيل Snapshot وAudit Event لكل مرحلة.

## Final QA

- Status: `published`
- Useful/searchable word tokens: `2507`
- Structured blocks: `72`
- H1: `1` عبر عنوان الصفحة
- H2: `26`
- H3: `4`
- FAQ: `10`
- References: `8`
- Internal links: `5/5` إلى أهداف منشورة
- Tags: `5`
- Primary category relations: `1`
- Canonical matches: `1`
- Content versions: `7`
- Audit events: `7`
- Redirects: `0` — لا predecessor عام موثّق
- Forbidden TODO/FIXME/QA/agent/internal markers: `0`
- Featured image: none; Alt N/A
- SEO title length: `40`
- Meta description length: `156`

## Files not modified

- `main`: لم يُعدّل.
- `docs/MIGRATION-PROGRESS.md`: لم يُعدّل؛ تحديث السجل المركزي مسؤولية C0.
