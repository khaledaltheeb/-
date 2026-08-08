# MIG-A4-000004 — التعامل مع التنمر

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #58
- Status: COMPLETED
- Canonical: `/content/bullying`
- Legacy slug: `bullying`
- Final title: `التعامل مع التنمر: دليل عملي لحماية الطفل في المدرسة وخارجها`
- Final CMS status: `published`
- Supabase content id: `962f9a42-7ea5-410d-9e07-5a2e88acc6f9`

## Pre-claim collision checks

تم البحث قبل إنشاء الـClaim عن `bullying` و«التنمر» و«التعامل مع التنمر» ومرادفاتها في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم يظهر Claim منافس أو Canonical/slug/redirect قائم. أُنشئ Claim واحد فقط: #58.

الموضوع يقع ضمن A4 لأنه موضوع حماية طفل/أسرة/مدرسة، وليس تشخيصًا نفسيًا بحتًا يحال إلى A1 ولا حالة ذوي احتياجات خاصة يكون التشخيص فيها هو الموضوع المركزي ليحال إلى A3.

## Legacy audit

المصدر الحالي المؤكد هو `khaledaltheeb/healthrenewal.org:content/sectors-v10/child.json`، حيث كانت الصفحة سجلًا قصيرًا داخل دليل الطفل بعنوان «التعامل مع التنمر»، يضم ملخصًا موجزًا وثلاث إشارات وأربع خطوات وعبارتين وتحذيرًا واحدًا. لم يوجد ملف HTML مستقل على المسار المتوقع `sectors/child/bullying/index.html` في الشجرة الحالية؛ المسار كان معتمدًا على بيانات القطاع/التوليد.

تم فحص تاريخ مسار `content/sectors-v10/child.json` والشجرة السابقة لإدخاله، ولم يظهر Canonical تاريخي مستقل أو صفحة أقدم موازية للتنمر تستحق الحفاظ عليها منفصلة. لذلك أُعيد بناء الموضوع من الصفر بدل تمديد البذرة المختصرة.

## Rebuild

أعيد بناء الصفحة حول نية البحث العملية للأسرة والمدرسة، وشملت: التعريف الرسمي وعناصر اختلال القوة والتكرار، الفرق بين التنمر والخلاف العادي، العلامات التي تستدعي السؤال، أول محادثة مع الطفل، خطة أول 24–48 ساعة، التعاون مع المدرسة، ما ينبغي تجنبه، التعامل مع الطفل الذي يمارس التنمر، دور الشاهد المساند، التنمر الإلكتروني، معايير التصعيد، الوقاية على مستوى المدرسة، مؤشرات نجاح الخطة، وFAQ بحثية.

حُذفت صياغات الحشو والملاحظات التشغيلية وأي TODO/QA/تعليمات وكلاء. لا توجد صورة تحريرية مستخدمة في الصفحة؛ لذلك لا يوجد أصل بصري يحتاج Alt ولا توجد صورة بلا وصف بديل.

## Evidence base

المراجع الرسمية/المؤسسية المستخدمة والمثبتة في `references_json`:

1. StopBullying.gov — What Is Bullying — https://www.stopbullying.gov/bullying/what-is-bullying
2. StopBullying.gov — What You Can Do — https://www.stopbullying.gov/resources/what-you-can-do
3. CDC — Bullying — https://www.cdc.gov/youth-violence/about/about-bullying.html
4. CDC — School Connectedness — https://www.cdc.gov/youth-behavior/school-connectedness/index.html
5. UNESCO — School violence and bullying — https://www.unesco.org/en/articles/what-you-need-know-about-school-violence-and-bullying
6. UNICEF Parenting — Bullying — https://www.unicef.org/parenting/child-care/bullying
7. UNICEF — Cyberbullying guide for parents — https://www.unicef.org/lac/en/parenting-lac/security-protection/cyberbullying-what-is-how-stop-guide-parents

## SEO / E-E-A-T

- Primary keyword: `التعامل مع التنمر`
- Search intent: `informational`
- SEO title: `التعامل مع التنمر: دليل حماية الطفل` — 35 chars
- Meta description: 151 chars
- Canonical count: 1
- Robots: index/follow
- Visible author: فريق تحرير منصة روافد
- Scientific/editorial reviewer metadata: present
- Last reviewed: 2026-08-08
- References: 7
- Search aliases: Arabic + English synonyms stored
- Schema: Article JSON-LD stored

## Structure and QA

Final database QA after publication:

- Content status: `published`
- Word tokens in `body_text`: 2851
- Structured blocks: 56
- Body H1 blocks: 0; renderer title is the sole page H1
- H2: 17
- H3: 1
- FAQ items: 10
- Resource blocks: 9
- Scientific/institutional references: 7
- Tags: 5
- Primary categories: 1
- Internal links: `/content/school-attendance-distress` and `/content/discipline-vs-punishment`
- Canonical duplicates: 0; exactly one `/content/bullying`
- Internal TODO/QA/agent markers: 0
- Content versions: 7
- Audit events: 7

## Redirect

Active permanent redirect:

- `/sectors/child/bullying/` → `/content/bullying` — HTTP 301

## Workflow

The CMS page passed the release workflow in order:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

The CMS release gate was not bypassed. During insertion it rejected an overlong SEO title and then a non-standard `search_intent`; both failed transactions left no partial published row. The metadata was corrected to the platform contract before the successful release.

## Repository scope

This record is committed only to branch `migration-agent-4-child-family-education`. No change was made to `main` or to `docs/MIGRATION-PROGRESS.md`.