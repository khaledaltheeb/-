# MIG-A4-000011 — مساندة الطفل بعد تجربة صادمة

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #54
- Status: COMPLETED
- Canonical: `/content/child-trauma`
- Legacy slug: `child-trauma`
- Final title: `مساندة الطفل بعد تجربة صادمة: دليل للأسرة والمدرسة`
- Final CMS status: `published`
- Supabase content id: `7f29a776-0808-43a9-a2dd-3c1e6a716831`

## Pre-claim collision checks
قبل إنشاء Claim جرى البحث في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase عن `child-trauma` و«مساندة الطفل بعد تجربة صادمة» و«صدمة الطفل» و«دعم الطفل بعد الصدمة» و`child trauma` و`child traumatic stress` ومرادفاتها. لم يظهر Claim منافس ولا Canonical/slug/alias/redirect مطابق. أُنشئ Claim واحد فقط: #54.

حد الملكية واضح: هذه الصفحة دعم أسري ومدرسي عام بعد حدث صادم، وليست صفحة تشخيص PTSD. أي Canonical تشخيصي لاضطراب ما بعد الصدمة يبقى من اختصاص A1، وأي حالة ذوي احتياجات خاصة تصبح الموضوع المركزي تُحال إلى A3.

## Legacy cluster and history
المصدر المباشر المؤكد هو `content/sectors-v10/child.json`، article slug `child-trauma` بعنوان «مساندة الطفل بعد تجربة صادمة». البذرة القديمة كانت قصيرة: ملخص عن استعادة الأمان والروتين، إشارات مثل الكوابيس والفزع والتجنب، وخطوات أساسية هي الأمان والمعلومات المحدودة وعدم الضغط على سرد التفاصيل وطلب دعم متخصص عند التعطل. تاريخ ملف القطاع يعود إلى commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20.

بحث المستودع أظهر إشارات أو مواد مشتقة/مجاورة في `content/v15/tips-details-v15.json` و`content/v18/care-guides-ar.json` و`scripts/publish_academic_library_v326.py` وبعض سجلات المصادر. لم يثبت أنها Canonical منشور مستقل منافس لنفس وحدة المعرفة؛ عوملت بوصفها مواد إرشادية أو توليدية/فهرسية، ودُمجت النية المفيدة بدل إنشاء صفحة ثانية.

لم يثبت URL عام قديم مستقل للـslug يمكن توثيقه بثقة، لذلك لم يُنشأ Redirect تخميني.

## Rebuild
أعيد بناء الصفحة من الصفر. التغطية النهائية تشمل: تعريف التجربة الصادمة دون تحويلها إلى تشخيص، أولوية الأمان، ما يفعل في الأيام الأولى، منع الضغط على الطفل لسرد التفاصيل، الفروق العمرية، استعادة الإحساس بالتحكم، الروتين، التنظيم المشترك، النوم والكوابيس، تقليل إعادة التعرض للصور والأخبار، عبارات عملية للوالدين، اللعب والرسم، خطة العودة إلى المدرسة، المحفزات، دور مقدم الرعاية، اختلاف استجابة الإخوة، الصدمة الطبية، الكوارث والنزوح والعنف المجتمعي، مؤشرات التقييم المهني، قاعدة سلامة مختصرة عند الحديث عن الموت أو الأذى، وخطة دعم لمدة أسبوعين.

أزيل الحشو والتشخيص الذاتي وأي TODO/QA أو تعليمات وكلاء. لا توجد صورة تحريرية في Canonical الحالي، وبالتالي لا توجد صورة بلا Alt.

## Evidence base
المراجع المثبتة وعددها 8:
1. SAMHSA — Understanding Child Trauma — https://www.samhsa.gov/mental-health/trauma-violence/child-trauma
2. American Academy of Pediatrics / HealthyChildren.org — Childhood Trauma: 3 Ways to Help Kids Cope — https://www.healthychildren.org/English/healthy-living/emotional-wellness/Building-Resilience/Pages/Childhood-Trauma-3-Ways-to-Help-Kids-Cope.aspx
3. National Child Traumatic Stress Network — Families and Caregivers — https://www.nctsn.org/audiences/families-and-caregivers
4. SAMHSA — Restoring a Sense of Well-Being in Children After a Traumatic Event — https://www.samhsa.gov/resource/dbhis/restoring-sense-well-being-children-after-traumatic-event-tips-parents-caregivers
5. SAMHSA — Children and Disasters — https://www.samhsa.gov/technical-assistance/dtac/disaster-survivors/children
6. National Child Traumatic Stress Network — PFA-S: Helping Your Family Cope — https://www.nctsn.org/resources/pfa-s-helping-your-family-cope-parents
7. National Child Traumatic Stress Network — Child and Family Traumatic Stress Intervention (CFTSI) — https://www.nctsn.org/node/597
8. UNICEF — How parents can support their children following distressing events — https://www.unicef.org/eca/stories/how-parents-can-support-their-children-and-themselves-following-distressing-events

Fresh verification on 2026-08-08 confirmed that SAMHSA states not every exposed child develops traumatic stress and that caregiver response, safety and stable routines are central to recovery; AAP’s HealthyChildren article, last updated 2026-03-27, summarizes the practical approach as reassure, return to routine and regulate; NCTSN emphasizes the essential role of caregivers and age-related reactions.

## SEO / E-E-A-T
- Primary keyword: `دعم الطفل بعد الصدمة`
- Search intent: `informational`
- SEO title: `صدمة الطفل: كيف تدعمه الأسرة والمدرسة` — 37 chars
- Meta description: 151 chars
- Canonical: `/content/child-trauma`
- Robots: index/follow
- Search aliases: Arabic + English
- Visible author: فريق تحرير منصة روافد
- Reviewer metadata: institutional/source-based review; no fabricated licensed reviewer
- Last reviewed: 2026-08-08
- References: 8 HTTPS
- Schema: Article JSON-LD

## Structure and final QA
- Status: `published`
- Useful body word tokens: **1696**
- Structured blocks: **71**
- Renderer title is the single H1; body H1 = **0**
- H2: **24**
- H3: **6**
- FAQ: **10**
- Internal links: **5** — `/content/child-sleep`, `/content/emotion-coaching`, `/content/school-attendance-distress`, `/content/bullying`, `/content/child-grief`
- References: **8**
- Tags: **5**
- Primary category relations: **1**
- Canonical matches in Supabase: **1**
- Active redirects: **0** — no verified public legacy route
- Multiline headings: **0**
- Markdown headings embedded in paragraphs: **0**
- Internal TODO/FIXME/QA/agent markers: **0**
- Featured image: none; therefore no missing Alt
- Content versions: **7**
- Audit events: **7**

## Workflow
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

The first CMS write created the structured JSON correctly but did not populate `body_text`; this was detected while the page was still in draft. `body_text` was derived from the approved heading/paragraph blocks, taxonomy was attached, and version/audit logging was established before any review transition. The page was not advanced until the draft QA showed 1696 useful tokens, one canonical, complete taxonomy and zero internal markers.

## Redirect decision
No Redirect was created because no verified public legacy route for this unit was established. The runbook prohibits guessed redirects.

## Repository scope
This record is committed only to `migration-agent-4-child-family-education`. No change was made to `main` or `docs/MIGRATION-PROGRESS.md`.