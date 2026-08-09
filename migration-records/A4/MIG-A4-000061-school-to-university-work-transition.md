# MIG-A4-000061 — الانتقال من المدرسة إلى الجامعة أو العمل

- **Agent:** A4 — الطفل والأسرة والمدرسة
- **Claim:** #175
- **Canonical key / slug:** `school-to-university-work-transition`
- **Canonical:** `/content/school-to-university-work-transition`
- **Legacy source:** `/sectors/youth/guides/school-to-university-work-transition/` (`sectors/youth/guides/school-to-university-work-transition/index.html` in `khaledaltheeb/healthrenewal.org`)
- **Final status:** Published / QA PASS

## Scope decision

هذه الصفحة مورد عام للشباب واليافعين وأسرهم ومدارسهم حول الانتقال من المدرسة إلى الجامعة أو التعليم والتدريب التقني والمهني أو العمل. لا تجعل الإعاقة أو حالة من ذوي الاحتياجات الخاصة موضوعها المركزي، ولا تقدم تشخيصًا نفسيًا؛ لذلك بقيت ضمن A4. تم فصلها صراحة عن Canonicals المتخصصة المنشورة في الانتقال الدامج أو الانتقال المدعوم إلى الرشد، والتي تخدم نطاقات مختلفة وتتقاطع مع A3/A5.

قبل Claim تم البحث عن الـslug والـCanonical والمرادفات العربية والإنجليزية في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وحالة Supabase الموثوقة. لم يوجد Claim مفتوح/مغلق أو Canonical مطابق. أظهر Supabase صفحات انتقال أخرى متخصصة، لكن لا توجد مطابقة لنية البحث العامة `school → university/work`.

## Legacy audit

تم فحص الصفحة الحالية وتاريخ المسار في `khaledaltheeb/healthrenewal.org`. النسخة القديمة كانت صفحة قطاعية مبنية بمحرك محتوى عام v406 وتضمنت طبقات الهوية والمنصة وGTM/GA، عبارات مراجعة داخلية، تحذيرات عامة وقوالب تشغيل لا تنتمي إلى المعرفة الأساسية. أظهر تاريخ المسار تعديلات جماعية لاحقة للهوية، تطبيع platform shell، وإضافة Google Tag Manager. لم تُنقل هذه الطبقات إلى الـCanonical الجديدة.

أُعيد بناء المحتوى من الصفر حول قرار الانتقال نفسه: استكشاف الخيارات، الجامعة، التعليم والتدريب التقني والمهني، التدريب المهني، العمل المباشر، المهارات القابلة للنقل، الخبرة المبكرة، خطة السنة الأخيرة، أول أسابيع الجامعة أو العمل، دور المدرسة والأسرة، مقارنة العروض، البدائل، السلامة والاستغلال، العمل أثناء الدراسة، ومؤشرات المراجعة.

## Evidence base

1. International Labour Organization — Challenges and opportunities of school to work transition
2. ILOSTAT / International Labour Organization — Youth Labour Market Statistics (YouthSTATS database)
3. International Labour Organization — Apprenticeships
4. UNICEF — Transitions from school to work
5. UNICEF — Transition of adolescents and young people from education to decent and productive work
6. UNESCO — Transforming technical and vocational education and training for successful and just transitions: UNESCO strategy 2022–2029
7. OECD — Career guidance
8. OECD — The State of Global Teenage Career Preparation

## Internal links

تم التحقق من أن جميع الأهداف التالية منشورة قبل الإغلاق:

- `/content/shared-family-decisions`
- `/content/family-strengths-map`
- `/content/school-family-partnership`
- `/content/monthly-family-review`
- `/content/family-help-seeking`
- `/content/exam-stress`

## SEO / E-E-A-T / accessibility

- SEO title: **43 chars**
- Meta description: **153 chars**
- Search intent: `informational`
- Primary keyword: `الانتقال من المدرسة إلى الجامعة أو العمل`
- Canonical واحد فقط
- Featured image: `https://healthrenewal.org/assets/brand/rawafid-social-card.jpg`
- Alt: `بطاقة منصة روافد المصاحبة لدليل الانتقال من المدرسة إلى الجامعة أو العمل`
- 8 official/primary references in `references_json`
- Author/reviewer metadata populated
- Educational planning disclaimer populated

## Final QA

- Arabic searchable words/tokens: **2910**
- Content blocks: **89**
- H1: **1** via page title
- H2: **23**
- H3 / FAQ: **10**
- Official/primary references: **8**
- Internal links: **6**, all targets published
- Tags: **5**
- Primary categories: **1**
- Content versions: **7**
- Audit events: **7**
- Canonical/slug/exact alias collisions: **0** (only this canonical returned by final collision query)
- TODO/FIXME/MIGRATION/agent/internal instructions in public body: **0**
- Status path: `draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

## Redirect

`/sectors/youth/guides/school-to-university-work-transition/` → `/content/school-to-university-work-transition` — **301 active**.

## Constraints respected

No changes were made to `main` or `docs/MIGRATION-PROGRESS.md`. Repository documentation for this page was written only to `migration-agent-4-child-family-education`.
