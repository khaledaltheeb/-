# MIG-A4-000010 — الحزن والفقد عند الطفل

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #50
- Status: COMPLETED
- Canonical: `/content/child-grief`
- Legacy slug: `child-grief`
- Final title: `الحزن والفقد عند الطفل: دليل عملي للأسرة والمدرسة`
- Final CMS status: `published`
- Supabase content id: `a2600361-b58f-42c5-a94b-96d5bb7538ff`

## Pre-claim collision checks
قبل إنشاء الـClaim تم البحث في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase عن `child-grief` و`childhood bereavement` و«الحزن والفقد عند الطفل» و«حزن الطفل» و«مساعدة الطفل بعد الوفاة». لم يوجد Claim منافس ولا Canonical/slug/alias/redirect مطابق. أُنشئ Claim واحد فقط: #50.

الموضوع ضمن A4 بوصفه دعمًا أسريًا ومدرسيًا عامًا بعد الوفاة والفقد، وليس تشخيصًا نفسيًا. الحالات التي يصبح فيها تشخيص نفسي هو الموضوع المركزي تُحال إلى A1، والحالات النمائية/ذوي الاحتياجات الخاصة إلى A3.

## Legacy cluster and history
تم فحص المصدر المباشر `content/sectors-v10/child.json` وفيه slug `child-grief` بعنوان «الحزن والفقد عند الطفل»، وبذرة مختصرة عن شرح الفقد بصدق مناسب للعمر وملاحظة الحزن في اللعب والسلوك. تاريخ ملف القطاع يرجع إلى commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20.

كما وُجد تعريف موضوعي ثانٍ غير منشور كCanonical مستقل داخل `scripts/care_guides_topics_v246_2.py` بالـslug المقترح `child-grief-family-school-support` وعنوان «دليل دعم الطفل بعد الوفاة أو الفقد». وظهرت إشارات/مخرجات مشتقة في فهارس الطفل وملفات build/test. عوملت هذه كتعريفات توليد/فهرسة أو سياقات مساندة لا Canonical مستقلة، ودُمجت النية المفيدة بدل إنشاء صفحة ثانية.

لم يثبت route عام قديم مستقل يمكن توثيقه بثقة، لذلك لم يُنشأ Redirect تخميني.

## Rebuild
أعيد بناء الصفحة من الصفر لتغطي: معنى الحزن وتذبذبه، شرح الموت بكلمات مباشرة، الأسئلة المتكررة لدى الصغار، احتياجات طفل المدرسة والمراهق، الخوف من موت الوالدين، عدم فرض طريقة واحدة للحزن، الروتين، الذكريات، الجنازات والمراسم، حزن الوالد وكيف يبقى داعمًا، دور المدرسة، وفاة زميل أو معلم، موت الحيوان الأليف والفقد غير المرتبط بالموت، علامات الحاجة إلى دعم أكبر، السلامة عند الحديث عن الموت، مراعاة الثقافة والدين، وخطة دعم خلال الأسابيع الأولى.

حُذفت الصياغات المربكة والحشو والتشخيص الذاتي وأي TODO/QA أو تعليمات وكلاء. لا توجد صورة تحريرية في Canonical الجديد، لذلك لا توجد صورة بلا Alt.

## Evidence base
المراجع المثبتة في `references_json` وعددها 8، وتشمل:
1. AAP / HealthyChildren.org — Grief & Loss in Childhood: How to Help Your Child Cope.
2. AAP / HealthyChildren.org — How Children Understand Death: What to Say When a Loved One Dies.
3. AAP / HealthyChildren.org — Supporting a Family After the Death of a Child or Adolescent.
4. AAP / HealthyChildren.org — Coping With a Child’s Death: AAP Policy Explained.
5. Child Bereavement UK — Managing bereavement: A guide for schools.
6. National Child Traumatic Stress Network — Childhood Traumatic Grief.
7. National Child Traumatic Stress Network — Traumatic Grief Resources.
8. AAP / HealthyChildren.org — Healthy Mental & Emotional Development.

## SEO / E-E-A-T
- Primary keyword: `حزن الطفل بعد الفقد`
- Search intent: `informational`
- SEO title: 37 chars
- Meta description: 157 chars
- Canonical matches: 1
- Robots: index/follow
- Visible author: فريق تحرير منصة روافد
- Reviewer metadata: present without fabricating a licensed reviewer
- Last reviewed: 2026-08-08
- References: 8 HTTPS
- Search aliases: Arabic + English
- Schema: Article JSON-LD

## Structure and final QA
- Status: `published`
- Useful Arabic body tokens: **1650**
- Structured blocks: **75**
- Body H1: **0**; renderer title is the single page H1
- H2: **21**
- H3: **4**
- FAQ: **10**
- Internal links: **3** — `/content/emotion-coaching`, `/content/child-sleep`, `/content/friendships`
- References: **8**
- Tags: **5**
- Primary category relations: **1**
- Canonical matches: **1**
- Active redirects: **0** — no verified public legacy route
- Internal TODO/FIXME/QA/agent markers: **0**
- Multiline heading blocks: **0**
- Markdown headings embedded in paragraph blocks: **0**
- Featured image: none; therefore no missing Alt
- Content versions: **10**
- Audit events: **10**

## Structural QA corrections before closure
لم تُغلق الصفحة عند أول نشر. الـQA كشف أولًا عناوين H3 تحمل فقرة الشرح داخل عنصر العنوان، ثم كشف الفحص الأعمق أن **19 عنصر heading** إضافيًا كان متعدد الأسطر وأن المقدمة تحمل H2 بصيغة Markdown داخل Paragraph. تم فصل كل عنوان عن فقرة شرحه وتحويل المقدمة إلى H2 دلالي حقيقي، ثم أزيلت علامة Markdown المتبقية. سُجلت الإصلاحات في Versions/Audit مستقلة حتى أصبحت `heading_multiline=0` و`markdown_heading_in_paragraph=0`.

## Workflow
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published → semantic structure QA fixes`

## Redirect decision
No Redirect was created. `child-grief-family-school-support` was found only as a content-generation topic definition, not a verified public route, and the runbook prohibits guessed redirects.

## Repository scope
This record is committed only to `migration-agent-4-child-family-education`. No change was made to `main` or `docs/MIGRATION-PROGRESS.md`.