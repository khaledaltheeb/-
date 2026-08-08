# MIG-A4-000008 — الشاشات وتنظيمها لدى الأطفال

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #45
- Status: COMPLETED
- Canonical: `/content/screens-child`
- Legacy slug: `screens-child`
- Final title: `الشاشات وتنظيمها لدى الأطفال: دليل عملي للأسرة`
- Final CMS status: `published`
- Supabase content id: `302cc07c-cd77-402b-938a-c31043406206`

## Pre-claim collision checks

تم البحث قبل Claim عن `screens-child` و«الشاشات والأطفال» و«الشاشات عند الأطفال» و«وقت الشاشة للأطفال» ومرادفات `screen time children` في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم يظهر Claim منافس أو Canonical/slug/alias/redirect قائم. أُنشئ Claim واحد فقط: #45.

الموضوع ضمن A4 لأنه إرشاد أسري/مدرسي عام لتنظيم البيئة الرقمية، وليس تشخيصًا نفسيًا أو حالة ذوي احتياجات خاصة.

## Legacy audit

المصدر المباشر هو `content/sectors-v10/child.json`، slug `screens-child` وعنوان «الشاشات وتنظيمها لدى الأطفال». النسخة كانت بذرة قصيرة جدًا حول الموازنة بين الفائدة والترفيه والنوم والحركة والعلاقات، مع إشارات لصعوبة التوقف والغضب وتراجع اللعب/النوم وأربع خطوات تطبيقية.

تم البحث في المستودع عن `screens-child` ومرادفات الشاشة/وقت الشاشة. ظهرت مواد سياقية مثل مقال مجلة عن ADHD ووقت الشاشة وصفحات حالات خاصة تحتوي إشارات إلى الشاشات، لكنها ليست Canonical عامًا منافسًا؛ مواد ADHD/الحالات الخاصة تبقى في A1/A3 بحسب الملكية ولم تُدمج كنسخ من الموضوع العام.

لم يثبت مسار عام قديم مستقل للـslug؛ لذلك لم يُنشأ Redirect تخميني.

## Rebuild

أعيد بناء الصفحة من الصفر لتغطي: لماذا لا يكفي رقم ساعات واحد، ما الاحتياجات التي يجب ألا تزاحمها الشاشة، توصيات WHO للأطفال دون الخامسة، المشاركة مع الطفل الصغير، إدارة الأولويات في سن المدرسة، الشراكة مع المراهق، الخطة الإعلامية الأسرية، الانتقال من الشاشة، استخدام الأجهزة كأداة لتنظيم المشاعر، النوم والطعام والواجبات، اختيار المحتوى، الخصوصية والسلامة الرقمية، دور المدرسة، علامات الحاجة إلى تعديل الخطة، متى يلزم دعم مهني، وخطة إعادة توازن أسبوعية.

في QA الأول بلغ النص 1485 فقط، فرفض A4 إغلاق الصفحة. أضيفت مادة عملية غير حشوية عن المشاهدة المشتركة مع الصغار والتدرج في تغيير القواعد الأسرية، حتى تجاوزت الصفحة 1500 كلمة مفيدة. كما صُحح H3 مدمج داخل H2 في خطة الأيام.

لا توجد صورة تحريرية في Canonical الجديد، لذا لا توجد صورة بلا Alt.

## Evidence base

المراجع المثبتة وعددها 8:

1. AAP / HealthyChildren.org — How to Make a Family Media Plan — https://www.healthychildren.org/English/family-life/Media/Pages/How-to-Make-a-Family-Media-Use-Plan.aspx
2. AAP / HealthyChildren.org — Screen Time & Temper Tantrums — https://www.healthychildren.org/English/family-life/Media/Pages/screen-time-and-temper-tantrums-helpful-tips-for-parents.aspx
3. AAP / HealthyChildren.org — Healthy Sleep Habits — https://www.healthychildren.org/English/healthy-living/sleep/Pages/healthy-sleep-habits-how-many-hours-does-your-child-need.aspx
4. WHO — Guidelines on physical activity, sedentary behaviour and sleep for children under 5 — https://www.who.int/publications/i/item/9789241550536
5. WHO — Guidelines on physical activity and sedentary behaviour — https://www.who.int/publications/b/55518
6. UNICEF — Digital parenting — https://www.unicef.org/parenting/digital-parenting
7. UNICEF — Parenting in the digital world — https://www.unicef.org/lac/en/parenting-lac/security-protection/digital-world-how-keep-your-child-safe-online
8. UNICEF — Screen-free activities for children — https://www.unicef.org/parenting/child-care/screen-free-activities

## SEO / E-E-A-T

- Primary keyword: `الشاشات والأطفال`
- Search intent: `informational`
- SEO title: `الشاشات والأطفال: دليل تنظيم عملي` — 33 chars
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
- Useful Arabic body tokens: **1661**
- Structured blocks: **54**
- Body H1: **0**; renderer title is the single H1
- H2: **19**
- H3: **4**
- FAQ: **10**
- Resource blocks: **11** — 8 external + 3 internal
- Tags: **5**
- Primary category relations: **1**
- Internal links: `/content/child-sleep`, `/content/tantrums`, `/content/emotion-coaching`
- Canonical matches: **1**
- Active redirects: **0** — no verified old public route
- Internal TODO/FIXME/QA/agent markers: **0**
- Malformed heading blocks: **0**
- Content versions: **8**
- Audit events: **8**

## Workflow

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

Post-publication QA was treated as a release blocker because the body was below 1500 tokens and one H3 marker was embedded in a parent H2. The content was deepened and the hierarchy fixed, then a new version and audit event were recorded before closure.

## Redirect decision

No Redirect was created. No public legacy route for `screens-child` was verified; the runbook prohibits inferred redirects.

## Repository scope

This record is committed only to `migration-agent-4-child-family-education`. No change was made to `main` or `docs/MIGRATION-PROGRESS.md`.