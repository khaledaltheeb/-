# MIG-A4-000028 — خطة العناية النفسية للأسرة

- Agent: **A4 — الطفل والأسرة والمدرسة**
- Claim: **#75** `[MIG-CLAIM][A4][family-care-plan]`
- Canonical key: `family-care-plan`
- Canonical: `/content/family-care-plan`
- Final title: `خطة العناية النفسية للأسرة: دليل عملي لتنظيم الدعم والرعاية`
- CMS content ID: `7c6e2b1d-90ef-4c48-9383-20452f34216b`
- Content type: `article`
- Final status: **PUBLISHED / A4 QA PASS**

## 1. Scope and ownership

الموضوع أداة أسرية عملية لتنظيم الروتين والأدوار وشبكة الدعم والتواصل مع المدرسة والخدمات، وتحديد العلامات المبكرة ومسار التصعيد ومواعيد المراجعة. لا يقدم تشخيصًا نفسيًا ولا يجعل حالة من ذوي الاحتياجات الخاصة محور الصفحة، لذلك يبقى ضمن A4 ولا يُحال إلى A1 أو A3.

## 2. Pre-claim collision checks

قبل إنشاء Claim تم البحث عن `family-care-plan` و«خطة عناية نفسية للأسرة» و«خطة رعاية أسرية» و«خطة دعم الأسرة» ومرادفاتها الإنجليزية في:

- GitHub Issues: لا Claim منافس.
- `docs/MIGRATION-PROGRESS.md` على `legacy-migration-audit`: لا Canonical مركزي مكتمل لهذا الموضوع.
- Supabase: لا slug/canonical/title/alias مطابق، ولا Redirect إلى Canonical المقترح.

أُنشئ Claim واحد فقط: #75.

## 3. Legacy audit and history

المصدر القديم المباشر:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`
- legacy slug: `family-care-plan`
- legacy title: `خطة عناية نفسية للأسرة`

البذرة القديمة كانت قصيرة جدًا وتدور حول تحويل النوايا إلى اتفاق مكتوب، تسجيل جهات الدعم، تحديد علامات الإنذار، بدائل الرعاية، والمراجعة الدورية. استُخدمت فقط لتحديد نية الصفحة ولم تُنسخ كصفحة نهائية.

فحص تاريخ الملف عبر GitHub أظهر commit واحدًا ذا صلة: `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20 (`Launch luminous v10 design and mental health sectors`). لم تظهر طبقات تاريخية مستقلة أخرى لهذا المدخل تحتاج دمجًا.

بحث المستودع أظهر مواد عامة عن السلامة والرعاية وبعض أدلة حالات متخصصة، لكنها ليست نسخًا Canonical مستقلة للموضوع الأسري العام؛ مواد الحالات التشخيصية/ذوي الاحتياجات الخاصة لم تُدمج في A4.

## 4. Rewrite decision

أعيد بناء الصفحة من الصفر. حُذفت فكرة الصفحة البطاقة/المختصرة وأُنشئ دليل مستقل يركز على الوظيفة اليومية. لا توجد ملاحظات داخلية أو تعليمات وكلاء أو TODO/FIXME/QA داخل النص النهائي.

التغطية تشمل:

- الفرق بين خطة العناية الأسرية وخطة العلاج المهنية.
- بناء الخطة من الوظائف اليومية بدل أسماء التشخيصات.
- الروتين الأساسي الذي يجب حمايته.
- توزيع الأدوار ووضع بدائل حتى لا يصبح مقدم رعاية واحد نقطة فشل.
- شبكة الدعم وتحديد نوع المساعدة التي يقدمها كل طرف.
- العلامات المبكرة وربطها بإجراءات قابلة للتنفيذ.
- مسار التصعيد والسلامة دون نسخ أرقام طوارئ أجنبية.
- ما يحتاج الأطفال إلى معرفته دون تحميلهم مسؤوليات الكبار.
- مشاركة المراهق والخصوصية المتدرجة.
- التكامل مع المدرسة بقدر المعلومات الضرورية.
- حماية المعلومات والكرامة وعدم تحويل الخطة إلى أداة رقابة.
- اختبار الخطة عمليًا ومراجعتها دوريًا.
- خطة بدء سريعة وأمثلة تطبيقية.

## 5. Evidence base

أُثريت الصفحة من 8 مصادر مؤسسية رسمية:

1. UNICEF — Mental health and well-being — https://www.unicef.org/parenting/mental-health-and-well-being
2. UNICEF — Support for parenting — https://www.unicef.org/support-parenting
3. CDC — Treating Children's Mental Health with Therapy — https://www.cdc.gov/children-mental-health/treatment/index.html
4. CDC — About Children's Mental Health — https://www.cdc.gov/children-mental-health/about/index.html
5. CDC — Before, During, and After an Emergency — https://www.cdc.gov/children-and-school-preparedness/before-during-after/index.html
6. CDC — Keeping Children Safe Away from Home — https://www.cdc.gov/children-and-school-preparedness/keeping-safe/index.html
7. WHO — Guidelines on parenting interventions — https://www.who.int/teams/social-determinants-of-health/violence-prevention/parenting-guidelines
8. WHO — Improving the health and wellbeing of children and adolescents: well-care visits — https://www.who.int/publications/i/item/9789240085336

## 6. Structure and search intent

- H1: يقدمه عنوان CMS مرة واحدة؛ لا H1 إضافي داخل body.
- H2: **18**.
- H3: **5**.
- FAQ: **10**.
- Structured blocks: **57**.
- Useful whitespace tokens/words: **1948**.
- Visible resource links: **13** = 5 داخلية + 8 مراجع خارجية.

الروابط الداخلية:

- `/content/family-help-seeking`
- `/content/family-meetings`
- `/content/caregiver-burnout`
- `/content/family-resilience`
- `/content/parenting-team`

## 7. SEO / E-E-A-T

- SEO title: `خطة العناية النفسية للأسرة | دليل عملي` — **38 حرفًا**.
- Meta description: **159 حرفًا**.
- Primary keyword: `خطة العناية النفسية للأسرة`.
- Search aliases: العربية والإنجليزية والمرادفات الأساسية.
- Search intent: `informational`.
- Canonical matches in CMS: **1**.
- Robots: index/follow.
- Schema: Article مع `mainEntityOfPage` الصحيح.
- Visible author: `فريق تحرير منصة روافد`.
- Reviewer metadata: موجود دون اختلاق هوية فردية.
- Last reviewed: 2026-08-08.
- References JSON: **8**.
- YMYL disclaimer: موجود ومحدد، بعد أن أوقفت بوابة الاعتماد المحاولة الأولى لغيابه.

## 8. Taxonomy

- Primary category: `parenting-family` — **1** relation.
- Tags: **5** — الأسرة، التربية والوالدية، التواصل، رفاه الطفل، التنظيم الذاتي.

## 9. Image / Alt

لا توجد صورة بارزة أو صورة legacy موثقة مرتبطة بالصفحة. `featured_image_url` و`featured_image_alt` كلاهما null؛ لذلك شرط Alt غير منطبق بدل اختلاق وصف لصورة غير موجودة.

## 10. Redirects

لم يُثبت URL عام تاريخي مستقل للـslug. لا يوجد Redirect نشط إلى Canonical الجديد، ولم يُنشأ Redirect تخميني من بنية JSON أو generator path.

## 11. Workflow

تم تنفيذ تسلسل الحالة:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

عند أول انتقال من `accessibility_review` إلى `approved` أوقفت Release Gate العملية لأن YMYL disclaimer كان مفقودًا. أُضيف تنبيه تثقيفي موجز ومتوافق مع نطاق الصفحة، ثم أُعيدت بوابة الاعتماد ونجحت قبل النشر.

Governance artifacts بعد الإغلاق:

- Content versions: **7**.
- Audit events: **7** (`created` + ست انتقالات workflow).

## 12. Final QA

- Status: **published**.
- Canonical: `/content/family-care-plan`.
- Canonical matches: **1**.
- Useful words/tokens: **1948**.
- Blocks: **57**.
- H2: **18**.
- H3: **5**.
- FAQ: **10**.
- References: **8**.
- Internal links: **5**.
- Tags: **5**.
- Primary category relations: **1**.
- Versions: **7**.
- Audit events: **7**.
- Active redirects: **0** — no verified old public route.
- TODO/FIXME/QA/agent/internal-note markers: **0**.
- Duplicate canonical: **0**.
- Featured image without Alt: **0**.

**Result: COMPLETED — ready for coordinator C0 independent QA.**

## Repository scope

هذا السجل ملتزم حصريًا على `migration-agent-4-child-family-education`. لم يُعدل `main` ولم يُعدل `docs/MIGRATION-PROGRESS.md`.