# MIG-A4-000006 — نوبات الغضب عند الأطفال

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #42
- Status: COMPLETED
- Canonical: `/content/tantrums`
- Legacy slug: `tantrums`
- Final title: `نوبات الغضب عند الأطفال: دليل عملي للتعامل والوقاية`
- Final CMS status: `published`
- Supabase content id: `80ff4428-2900-461e-bbe2-c451b01b51ca`

## Pre-claim collision checks

قبل إنشاء الـClaim تم البحث في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase عن `tantrums` و`temper tantrums` و«نوبات الغضب عند الأطفال» و«نوبات الغضب» والمرادفات القريبة. لم يظهر Claim منافس، Canonical مطابق، slug مطابق، alias مطابق، أو Redirect قائم. أُنشئ Claim واحد فقط: #42.

الموضوع يقع ضمن A4 بوصفه موضوعًا تربويًا/نمائيًا عامًا للأسرة والحضانة والمدرسة. لا تستخدم الصفحة النوبات لتشخيص حالة نفسية أو نمائية؛ إذا أصبحت حالة تشخيصية هي الموضوع المركزي فإنها تُحال إلى A1/A3 حسب الملكية.

## Legacy audit

المصدر الموضوعي المباشر المؤكد هو `content/sectors-v10/child.json`، وفيه سجل مختصر بعنوان «نوبات الغضب عند الأطفال» مع ملخص وثلاث إشارات وأربع خطوات وعبارتين وتحذير واحد. البحث عن `tantrums` في المستودع لم يُظهر Canonical موضوعيًا آخر. ظهر ذكر «نوبات الغضب» داخل صفحة متخصصة بمتلازمة برادر-ويلي، لكنه سياق تابع لحالة من نطاق A3 وليس نسخة من موضوع نوبات الغضب العامة، ولذلك لم يُدمج ولم يُعتبر تعارض Canonical.

تاريخ `content/sectors-v10/child.json` الذي فُحص في دورة A4 يُظهر إدخال هذه طبقة القطاع في commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20. البحث عن مسار عام مؤكد مثل `sectors/child/tantrums` لم يُظهر route قديمًا موثقًا؛ لذلك لم يُنشأ Redirect تخميني.

## Rebuild

أعيد بناء الصفحة من الصفر حول نية الأسرة العملية: تعريف النوبة ضمن السياق النمائي، أسباب شيوعها في الطفولة المبكرة، اكتشاف المحفزات، الروتين والتوقعات، السلامة أثناء الذروة، حدود استخدام التجاهل، الحدود دون عقاب انتقامي، التعلم بعد الهدوء، تعليم بدائل خارج الأزمة، المواقف العامة، نوبات إيقاف الشاشة، الفروق الفردية، دور الحضانة والمدرسة، الأخطاء الشائعة، مؤشرات التحسن، متى يحتاج الطفل إلى تقييم مهني، وخطة تطبيق من خمس مراحل.

تم حذف القالب المختصر والحشو واللغة الحكمية والتعميمات غير المدعومة، ولم تُنقل TODO/QA أو تعليمات وكلاء أو ملاحظات داخلية. لا توجد صورة تحريرية، لذا لا توجد صورة بلا Alt.

## Evidence base

المراجع المثبتة في `references_json` وعددها 8:

1. American Academy of Pediatrics / HealthyChildren.org — Top Tips for Surviving Tantrums — https://www.healthychildren.org/english/family-life/family-dynamics/communication-discipline/pages/temper-tantrums.aspx
2. American Academy of Pediatrics / HealthyChildren.org — Emotional Development: 2 Year Olds — https://www.healthychildren.org/English/ages-stages/toddler/Pages/Emotional-Development-2-Year-Olds.aspx
3. American Academy of Pediatrics / HealthyChildren.org — Screen Time & Temper Tantrums — https://www.healthychildren.org/English/family-life/Media/Pages/screen-time-and-temper-tantrums-helpful-tips-for-parents.aspx
4. American Academy of Pediatrics / HealthyChildren.org — Aggressive Behavior in Young Children — https://www.healthychildren.org/English/ages-stages/toddler/pages/Aggressive-Behavior.aspx
5. CDC — Essentials for Parenting Toddlers and Preschoolers — https://www.cdc.gov/parenting-toddlers/about/index.html
6. CDC — Positive Parenting Tips: Toddlers — https://www.cdc.gov/child-development/positive-parenting-tips/toddlers-2-3-years.html
7. NHS — Temper tantrums — https://www.nhs.uk/baby/babys-development/behaviour/temper-tantrums/
8. NHS — Help your toddler manage emotions — https://www.nhs.uk/best-start-in-life/toddler/help-your-toddler-with-their-emotions/

## SEO / E-E-A-T

- Primary keyword: `نوبات الغضب عند الأطفال`
- Search intent: `informational`
- SEO title: `نوبات الغضب عند الأطفال: دليل عملي` — 34 chars
- Meta description: 155 chars
- Canonical count: 1
- Robots: index/follow
- Visible author: فريق تحرير منصة روافد
- Reviewer metadata: present
- Last reviewed: 2026-08-08
- References: 8
- Search aliases: Arabic + English
- Schema: Article JSON-LD

## Structure and final QA

- Status: `published`
- Useful Arabic body tokens: **1857**
- Structured blocks: **57**
- Body H1 blocks: **0**; renderer title is the single page H1
- H2: **19**
- H3: **5**
- FAQ: **10**
- Resource blocks: **10** — 8 external + 2 internal
- Tags: **5**
- Primary category relations: **1**
- Internal links: `/content/emotion-coaching`, `/content/discipline-vs-punishment`
- Canonical matches: **1**
- Internal TODO/FIXME/QA/agent markers: **0**
- Malformed heading blocks: **0**
- Content versions: **8**
- Audit events: **8**
- Active redirects: **0**, intentionally because no verified public legacy route was found

## Workflow and release-gate behavior

The successful CMS release passed:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

An earlier transaction was rejected by the release gate because the initial Meta Description was outside the mandatory 150–160-character contract. The entire transaction rolled back, and a duplicate check confirmed zero `tantrums` rows before retrying. The Meta was corrected to 155 characters before the successful transaction. A subsequent structural QA detected that five H3 markers had been embedded inside one H2 block because of source segmentation; the block was normalized into a real H2 plus five H3/paragraph pairs and that correction received its own version and audit event.

## Redirect decision

No Redirect was invented from the slug. Repository search did not establish a verified old public route for this topic, and the migration runbook explicitly prohibits guessed redirects.

## Repository scope

This record is committed only to `migration-agent-4-child-family-education`. No change was made to `main` or `docs/MIGRATION-PROGRESS.md`.