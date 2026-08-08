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

كما وُجد تعريف موضوعي ثانٍ غير منشور كCanonical مستقل داخل `scripts/care_guides_topics_v246_2.py` بالـslug المقترح `child-grief-family-school-support` وعنوان «دليل دعم الطفل بعد الوفاة أو الفقد». هذا تعريف توليدي/خطة محتوى لا route منشورًا منافسًا، لكنه جرى فحصه ودمج نيته المفيدة في Canonical الحالي بدل إنشاء صفحة ثانية.

البحث عن العنوان والـslug لم يُظهر route عامًا موثقًا للنسخة الثانية؛ لذلك لم يُنشأ Redirect تخميني.

## Rebuild

أعيد بناء الصفحة من الصفر لتغطي: معنى الحزن وتذبذبه، شرح الموت بكلمات مباشرة، الأسئلة المتكررة لدى الصغار، احتياجات طفل المدرسة والمراهق، الخوف من موت الوالدين، عدم فرض طريقة واحدة للحزن، الروتين، الذكريات، الجنازات والمراسم، حزن الوالد وكيف يبقى داعمًا، دور المدرسة، وفاة زميل أو معلم، موت الحيوان الأليف والفقد غير المرتبط بالموت، علامات الحاجة إلى دعم أكبر، السلامة عند الحديث عن الموت، مراعاة الثقافة والدين، وخطة دعم خلال الأسابيع الأولى.

أزيلت الصياغات المبهمة مثل «نام للأبد» بوصفها نصيحة، والحشو، والتشخيصات الذاتية، وأي TODO/QA أو تعليمات وكلاء. لا توجد صورة تحريرية في Canonical الجديد، لذلك لا توجد صورة بلا Alt.

## Evidence base

المراجع المثبتة في `references_json` وعددها 8:

1. AAP / HealthyChildren.org — Grief & Loss in Childhood: How to Help Your Child Cope — https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/Grieving-Whats-Normal-When-to-Worry.aspx
2. AAP / HealthyChildren.org — How Children Understand Death: What to Say When a Loved One Dies — https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/How-Children-Understand-Death-What-You-Should-Say.aspx
3. AAP / HealthyChildren.org — Supporting a Family After the Death of a Child or Adolescent — https://www.healthychildren.org/English/news/Pages/supporting-a-family-after-the-death-of-a-child-or-adolescent.aspx
4. AAP / HealthyChildren.org — Coping With a Child’s Death: AAP Policy Explained — https://www.healthychildren.org/English/family-life/family-dynamics/Pages/coping-with-a-childs-death-aap-policy-explained.aspx
5. Child Bereavement UK — Managing bereavement: A guide for schools — https://www.childbereavementuk.org/managing-bereavement-a-guide-for-primary-schools
6. National Child Traumatic Stress Network — Childhood Traumatic Grief — https://www.nctsn.org/what-is-child-trauma/trauma-types/traumatic-grief
7. National Child Traumatic Stress Network — Traumatic Grief Resources — https://www.nctsn.org/resources/all-nctsn-resources?search=grief
8. AAP / HealthyChildren.org — Healthy Mental & Emotional Development — https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/healthy-mental-and-emotional-development-in-children-key-building-blocks.aspx

## SEO / E-E-A-T

- Primary keyword: `حزن الطفل بعد الفقد`
- Search intent: `informational`
- SEO title: `حزن الطفل بعد الفقد: دليل عملي للأسرة` — 37 chars
- Meta description: 157 chars
- Canonical matches: 1
- Robots: index/follow
- Visible author: فريق تحرير منصة روافد
- Reviewer metadata: present
- Last reviewed: 2026-08-08
- References: 8
- Search aliases: Arabic + English
- Schema: Article JSON-LD

## Structure and final QA

- Status: `published`
- Useful Arabic body tokens: **1652**
- Structured blocks: **55**
- Body H1: **0**; renderer title is the single page H1
- H2: **20**
- H3: **4**
- FAQ: **10**
- Resource blocks: **11** — 8 external + 3 internal
- Tags: **5**
- Primary category relations: **1**
- Internal links: `/content/emotion-coaching`, `/content/child-sleep`, `/content/friendships`
- Canonical matches: **1**
- Active redirects: **0** — no verified public legacy route
- Internal TODO/FIXME/QA/agent markers: **0**
- Malformed heading blocks: **0**
- Content versions: **8**
- Audit events: **8**

## Workflow

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

Post-publication structural QA found the first H3 in the early-weeks support plan embedded in its parent H2 due source segmentation. It was split into a proper H2 + H3 + paragraph and the correction received a separate version and audit event before closure.

## Redirect decision

No Redirect was created. `child-grief-family-school-support` was found only as a content-generation topic definition, not a verified public route, and the migration runbook prohibits guessed redirects.

## Repository scope

This record is committed only to `migration-agent-4-child-family-education`. No change was made to `main` or `docs/MIGRATION-PROGRESS.md`.