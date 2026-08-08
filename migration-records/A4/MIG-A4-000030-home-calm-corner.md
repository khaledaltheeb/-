# MIG-A4-000030 — زاوية هدوء منزلية

- **Lane:** A4 — الطفل والأسرة والمدرسة
- **Claim:** #78 — `[MIG-CLAIM][A4][home-calm-corner]`
- **Canonical key:** `home-calm-corner`
- **Canonical:** `/content/home-calm-corner`
- **Type:** `article`
- **Final status:** **PUBLISHED / QA PASS**
- **CMS content ID:** `3240ab7d-2610-4bfd-9556-8b11e282e5a9`

## Canonical / ownership decision

هذه الصفحة A4 عامة عن بناء مساحة منزلية آمنة للتنظيم والتهدئة لدى الطفل، وليست تشخيصًا نفسيًا ولا صفحة حالة من ذوي الاحتياجات الخاصة. تم فحص GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase قبل Claim؛ لم يوجد Claim أو Canonical أو slug أو alias منافس. الصفحة المنشورة `/content/family-routine-redesign` تتناول الروتين الأسري على مستوى اليوم كله ولا تملك نية البحث الخاصة بمساحة التهدئة، لذلك أبقيت Canonical مستقلة.

## Legacy discovery and history

- المصدر الأساسي: `khaledaltheeb/healthrenewal.org/content/sectors-v10/home.json`، article slug `home-calm-corner`، العنوان القديم «زاوية هدوء منزلية».
- تاريخ الملف يثبت أن `home.json` أُدخل في commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ **2026-07-20**، والنسخة في ذلك commit تحتوي بالفعل `home-calm-corner`.
- بحث المستودع عن «زاوية هدوء» أظهر طبقة نصائح مرتبطة في `content/v15/tips-details-v15.json`، لكن لم يثبت أنها Canonical مستقلة أو URL عام سابق للموضوع.
- لم يثبت وجود public legacy route مستقل يمكن تحويله بأمان، لذلك **لم يُنشأ Redirect تخميني**.

## Legacy exclusions / rebuild

المادة القديمة كانت بطاقة قصيرة: summary + signals + steps + phrases + avoid. لم تُنقل ميكانيكيًا. أُعيد بناء الصفحة من الصفر مع حذف أي تكرار أو لغة داخلية/توليدية، وعدم إدخال TODO/QA أو تعليمات وكلاء. جرى توسيع الموضوع ليشمل التنظيم الانفعالي والتنظيم المشترك، الفرق عن العقاب، اختيار المكان والأدوات والسلامة، التدريب قبل الأزمة، دور البالغ، العودة والإصلاح، تعديل البيئة، الفروق العمرية، الأسر محدودة المساحة، الإخوة، حدود الاستخدام، ومتى يلزم تقييم أوسع.

## Source verification / enrichment

المراجع المثبتة في CMS: 8 مصادر رسمية/مؤسسية موثوقة:

1. Head Start — *Building Positive Learning Environments for Young Children Starts with You*.
2. Head Start — *The Science Behind Social and Emotional Development*.
3. Head Start — *Infant and Toddler Behaviors That Can Challenge Adults*.
4. Head Start — *Approaches to Learning: Preschool*.
5. American Academy of Pediatrics / HealthyChildren — *Why Kids Act Out: Tips to Help Your Child Cope With Stress*.
6. American Academy of Pediatrics / HealthyChildren — *Screen Time & Temper Tantrums: Helpful Tips for Parents*.
7. Harvard Center on the Developing Child — *A Guide to Executive Function*.
8. UNICEF East Asia and Pacific — *How to stay calm during stressful parenting moments* (15 May 2026).

الصفحة لا تدّعي أن «زاوية الهدوء» علاج مستقل؛ تُقدّمها كأداة بيئية/تربوية للتنظيم مع التنظيم المشترك، وتوضح أن الحالات النمائية أو النفسية المركزية تحتاج خطة فردية ضمن نطاقها المناسب.

## Structure / search intent

- H1: عنوان الصفحة الوحيد عبر قالب CMS.
- H2: **23**.
- H3: **9**.
- FAQ ظاهرة: **10**، وتشمل الفرق عن Time-out، مدة الاستخدام، ترك الطفل منفردًا، اختيار الأدوات، رفض الطفل، الاستخدام المدرسي، الاحتياجات الخاصة، قياس النجاح ومتى تطلب الأسرة مساعدة.
- Internal links: **5** إلى صفحات منشورة: `emotion-coaching`, `tantrums`, `healthy-boundaries`, `family-routine-redesign`, `screens-child`.

## SEO / E-E-A-T

- SEO title: `زاوية هدوء للطفل في المنزل | دليل عملي` — **38 chars**.
- Meta description: **153 chars**.
- Primary keyword: `زاوية هدوء للطفل`.
- Search aliases: العربية + `home calm corner`, `calming corner`, `calm-down corner`, `regulation space`.
- Canonical: `/content/home-calm-corner`.
- `robots_index=true`, `robots_follow=true`.
- Article schema موجود مع `mainEntityOfPage` الصحيح.
- Visible author: `فريق تحرير منصة روافد`.
- Reviewer label: `مراجعة تحريرية وعلمية — منصة روافد` مع وصف واضح لمصادر المراجعة، دون اختلاق هوية مختص فردي.
- YMYL disclaimer موجود ومختصر.
- لا توجد featured image؛ Alt غير منطبق حتى وجود أصل وسائط فعلي.

## CMS workflow

تم تنفيذ التسلسل كاملًا:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

- Content versions: **7**.
- Audit events: **7**.
- Tags: **5**.
- Primary category relation: **1**.

## Final QA

- Useful body/search tokens by database whitespace count: **2393**.
- Structured blocks: **74**.
- H2: **23**.
- H3: **9**.
- FAQ: **10**.
- References: **8**.
- Internal links: **5 / 5 published targets**.
- Tags: **5**.
- Category relations: **1**.
- Canonical matches in Supabase: **1**.
- Active redirects to canonical: **0** because no verified predecessor route exists.
- Versions: **7**.
- Audit events: **7**.
- Forbidden internal markers (`TODO`, `FIXME`, `QA`, agent/internal-note markers): **0**.
- Featured image absent; image Alt gate therefore N/A/pass.
- Final CMS status: **published**.

## Governance

هذا السجل كُتب حصريًا على فرع `migration-agent-4-child-family-education`. لم يتم تعديل `main` أو `docs/MIGRATION-PROGRESS.md`.