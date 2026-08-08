# MIG-A4-000009 — صداقات الطفل ومهاراته الاجتماعية

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #48
- Status: COMPLETED
- Canonical: `/content/friendships`
- Legacy slug: `friendships`
- Final title: `صداقات الطفل ومهاراته الاجتماعية: دليل عملي للأسرة والمدرسة`
- Final CMS status: `published`
- Supabase content id: `46b5ba69-c26e-45a1-a2b2-49f26156d63c`

## Pre-claim collision checks

قبل إنشاء الـClaim تم البحث في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase عن `friendships` و`child friendships` و«صداقات الطفل» و«صداقات الأطفال» و«مهارات الطفل الاجتماعية» و«تكوين الصداقات». لم يوجد Claim منافس ولا Canonical/slug/alias/redirect مطابق. أُنشئ Claim واحد فقط: #48.

الموضوع ضمن A4 لأنه مهارة اجتماعية ونمائية عامة للأسرة والمدرسة. لا تستخدم الصفحة العزلة أو عدد الأصدقاء لتشخيص اضطراب نفسي أو نمائي؛ الحالات التشخيصية تُحال إلى A1/A3 حسب الملكية.

## Legacy audit and history

المصدر المباشر المؤكد هو `content/sectors-v10/child.json`، وفيه سجل `friendships` بعنوان «صداقات الطفل ومهاراته الاجتماعية» وبذرة قصيرة عن المبادرة والحدود وإصلاح الخلاف، مع إشارات للعزلة المتكررة والخلافات والخوف من الرفض، وأربع خطوات تطبيقية فقط. تاريخ ملف القطاع يرجع إلى commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20.

البحث عن `friendships` و«صداقات الطفل» و«تكوين الصداقات» لم يُظهر Canonical عامًا منافسًا أو route عامًا موثقًا للـslug. ظهرت إشارات إلى تكوين الصداقات داخل صفحات تشخيصية/حالات خاصة مثل دليل الصمت الانتقائي وبعض أدلة ذوي الاحتياجات الخاصة؛ هذه مواد سياقية مملوكة لـA1/A3 وليست نسخًا من الدليل العام، لذلك لم تُدمج ولم تُعتبر تعارضًا.

## Rebuild

أعيد بناء الصفحة من الصفر لتغطي: معنى الصداقة بوصفها مهارة لا اختبار شعبية، الفروق النمائية حسب العمر، الملاحظة بدل الملصقات، بدء الحديث والانضمام للعب، الاستماع والدور في الحوار، المشاركة والتعاون، الحدود وحق قول «لا»، إصلاح الخلاف، متى يتدخل الوالد، التعامل مع الرفض والإقصاء، الخجل والعزلة المستمرة، اختيار الفرص الاجتماعية، دور الأسرة دون إدارة العلاقات نيابة عن الطفل، دور المدرسة وديناميكيات الصف، الصداقات الرقمية، التفريق بين الخلاف والتنمر، متى يلزم دعم إضافي، وخطة تدريب لمدة أسبوعين.

حُذفت الاختزالات والحشو واللغة الحكمية وأي TODO/QA أو تعليمات وكلاء. لا توجد صورة تحريرية في Canonical الجديد؛ لذلك لا توجد صورة بلا Alt.

## Evidence base

المراجع المثبتة في `references_json` وعددها 8:

1. American Academy of Pediatrics / HealthyChildren.org — What Parents Can Do to Support Friendships — https://www.healthychildren.org/English/family-life/power-of-play/Pages/What-Parents-Can-Do-to-Support-Friendships.aspx
2. American Academy of Pediatrics / HealthyChildren.org — Getting to Know Your Child's Friends — https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/Pages/Getting-to-Know-Your-Childs-Friends.aspx
3. American Academy of Pediatrics / HealthyChildren.org — Problems With Peers — https://www.healthychildren.org/English/ages-stages/gradeschool/school/pages/Problems-With-Peers.aspx
4. American Academy of Pediatrics / HealthyChildren.org — Young Children Learn a Lot When They Play — https://www.healthychildren.org/English/family-life/power-of-play/Pages/young-children-learn-a-lot-when-they-play.aspx
5. CDC — Peer Connection and Support — https://www.cdc.gov/classroom-management/approaches/peer-connection-support.html
6. CDC — Management of Classroom Social Dynamics — https://www.cdc.gov/classroom-management/approaches/classroom-social-dynamics.html
7. CDC — School Connectedness Helps Students Thrive — https://www.cdc.gov/youth-behavior/school-connectedness/index.html
8. CDC — Behavior Management — https://www.cdc.gov/classroom-management/approaches/behavior-management.html

## SEO / E-E-A-T

- Primary keyword: `صداقات الطفل`
- Search intent: `informational`
- SEO title: `صداقات الطفل: دليل المهارات الاجتماعية` — 38 chars
- Meta description: 158 chars
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
- Useful Arabic body tokens: **1805**
- Structured blocks: **56**
- Body H1: **0**; renderer title is the single page H1
- H2: **20**
- H3: **4**
- FAQ: **10**
- Resource blocks: **12** — 8 external + 4 internal
- Tags: **5**
- Primary category relations: **1**
- Internal links: `/content/bullying`, `/content/emotion-coaching`, `/content/school-attendance-distress`, `/content/screens-child`
- Canonical matches: **1**
- Active redirects: **0** — no verified public legacy route
- Internal TODO/FIXME/QA/agent markers: **0**
- Malformed heading blocks: **0**
- Content versions: **8**
- Audit events: **8**

## Workflow

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

Post-publication QA identified the first H3 in the two-week plan embedded within its parent H2 because of source segmentation. It was split into a real H2 + H3 + paragraph and the correction received a separate version and audit event before closure.

## Redirect decision

No Redirect was created. No verified public legacy route for `friendships` was found; the runbook prohibits guessed redirects.

## Repository scope

This record is committed only to `migration-agent-4-child-family-education`. No change was made to `main` or `docs/MIGRATION-PROGRESS.md`.