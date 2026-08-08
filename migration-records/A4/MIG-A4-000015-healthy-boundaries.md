# MIG-A4-000015 — الحدود الصحية داخل الأسرة

- Lane: **A4 — الطفل والأسرة والمدرسة**
- Claim: **#55** `[MIG-CLAIM][A4][healthy-boundaries]`
- Canonical key: `healthy-boundaries`
- Canonical: `/content/healthy-boundaries`
- CMS content ID: `3954b159-2f3c-4626-b754-93e842b33c9f`
- Content type: `article`
- Final status: **PUBLISHED / A4 QA PASS**

## 1. Scope and ownership

الموضوع هو الحدود الصحية العامة داخل الأسرة: الخصوصية، المساحة الشخصية، قول «لا»، القواعد المنزلية، الاستقلال المتدرج، الحدود الرقمية، وحدود الوقت والمساعدة. لا يمثل تشخيصًا نفسيًا ولا حالة من ذوي الاحتياجات الخاصة، لذلك يبقى ضمن A4 ولا يتعارض مع A1/A3.

## 2. Pre-claim dedupe checks

قبل بدء العمل كان Claim #55 موجودًا بالفعل ومفتوحًا لهذا الموضوع، لذلك لم يُنشأ Claim ثانٍ. تمت مراجعة:

- GitHub Issues: لا Claim منافس لنفس canonical/slug أو المرادفات الرئيسية.
- `docs/MIGRATION-PROGRESS.md` على `legacy-migration-audit`: لا Canonical مركزي مكتمل لنفس الموضوع.
- Supabase: لم يوجد قبل الإنشاء صف يطابق `healthy-boundaries` أو `/content/healthy-boundaries` أو alias/redirect منافس.

## 3. Legacy cluster and history

المصدر القديم الأساسي:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`
- legacy slug: `healthy-boundaries`
- legacy title: `الحدود النفسية الصحية في الأسرة`

محتوى النسخة القديمة كان بطاقة قصيرة تتناول: الخصوصية، تحميل فرد مسؤولية مشاعر الجميع، الشعور بالذنب عند قول «لا»، تحديد الخاص والمشترك، وضوح الطلب، الاحترام المتبادل، ومراجعة الحدود مع العمر. تم استخدام هذه النقاط كإشارات موضوعية فقط، لا كصفحة تُنسخ.

تم فحص تاريخ الملف عبر GitHub. للملف commit تاريخي واحد ذي صلة: `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20، لذلك لا توجد طبقات تاريخية مستقلة إضافية لهذا المدخل تحتاج دمجًا.

لم يثبت وجود مسار legacy عام مستقل صالح لهذا المقال، ولذلك **لم يُنشأ Redirect تخميني**.

## 4. Exclusions and rewrite decision

أعيد بناء الصفحة من الصفر. لم يُنقل الحشو أو أي تعليمات تشغيلية أو TODO/QA أو ملاحظات وكلاء. كما لم تُستخدم كلمة «حدود» لتبرير الانسحاب أو الصمت العقابي؛ تم التفريق صراحة بين الحد المنظم والسيطرة أو العزل أو الإهمال.

## 5. Source enrichment

أُثريت الصفحة من مصادر مؤسسية أصلية وموثوقة، منها:

1. CDC — Tips for Creating Rules.
2. CDC — Tips for Building Structure.
3. American Academy of Pediatrics / HealthyChildren — Growing Independence.
4. American Academy of Pediatrics / HealthyChildren — Your Family Rituals.
5. American Academy of Pediatrics / HealthyChildren — Communicating With Teens.
6. UNICEF — Teens and risky behaviour.
7. UNICEF — Online privacy checklist for parents.
8. WHO — Parenting interventions guideline.

تغطي الصفحة بناء قواعد واضحة ومتسقة، الخصوصية الجسدية والرقمية، الاستقلال المتدرج، الحدود العاطفية، قول «لا»، اختلاف الحدود حسب العمر، اختبار الطفل للحد، اختلاف مقدمي الرعاية، حدود الإخوة، العلامات التي تجعل الحدود مسيطرة أو غير صحية، وخطة تطبيق عملية.

## 6. Structure and search intent

- H1: يقدمه عنوان CMS مرة واحدة.
- H2: **17**.
- H3: **0**؛ لم تُستخدم لأن المحاور الحالية مستقلة وواضحة ولا تحتاج مستوى ثالثًا شكليًا.
- FAQ: **10** أسئلة تخدم نوايا بحث مباشرة.
- Structured blocks: **58**.
- Useful Arabic whitespace tokens: **2255**.
- References: **8**.
- Internal links: **4**.

الروابط الداخلية:

- `/content/emotional-safety`
- `/content/active-listening`
- `/content/discipline-vs-punishment`
- `/content/screens-child`

## 7. SEO / E-E-A-T

- SEO title: `الحدود الصحية داخل الأسرة: دليل عملي للوالدين` — **45 حرفًا**.
- Meta description: **150 حرفًا**.
- Primary keyword: `الحدود الصحية داخل الأسرة`.
- Search aliases تغطي العربية والإنجليزية والمرادفات الرئيسية.
- Search intent: `informational`.
- Canonical matches in CMS: **1**.
- Robots: index/follow.
- Schema: Article مع `mainEntityOfPage` الصحيح.
- Author display: `فريق تحرير منصة روافد`.
- Reviewer display: `مراجعة تحريرية وعلمية — منصة روافد` دون اختلاق هوية فردية أو مؤهل شخصي.
- Last reviewed set on publish.

## 8. Taxonomy and relations

- Primary category relation: **1** — `parenting-family`.
- Tags: **5** — الأسرة، التربية والوالدية، التنظيم الذاتي، رفاه الطفل، نمو الطفل.

## 9. Image / Alt

لا توجد صورة بارزة أو صورة legacy موثقة مرتبطة بهذه الصفحة، لذلك لم تُضف صورة شكلية ولم يُنشأ Alt وهمي. شرط Alt غير منطبق حتى تضاف صورة فعلية.

## 10. Redirects

- Verified legacy public route: **none established**.
- Active redirects to canonical: **0**.
- Decision: عدم تخمين مسار من slug داخل JSON أو generator arithmetic.

## 11. Workflow

تم تنفيذ التسلسل على CMS:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

ثم أضيف final migration QA snapshot.

Final database governance:

- Content versions: **8**.
- Audit events: **8**.
- Tags: **5**.
- Category relations: **1**.

## 12. Final QA

- Status: **published**.
- Canonical: `/content/healthy-boundaries`.
- Canonical matches: **1**.
- Word tokens: **2255**.
- Blocks: **58**.
- H2: **17**.
- FAQ: **10**.
- References: **8**.
- Internal links: **4**.
- Malformed/multiline Markdown headings: **0**.
- TODO/FIXME/QA/agent/internal-note markers: **0**.
- Duplicate canonical: **0**.
- Redirect conflicts: **0**.

**Result: COMPLETED — ready for coordinator C0 independent QA.**
