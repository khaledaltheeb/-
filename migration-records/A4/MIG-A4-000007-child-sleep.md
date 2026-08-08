# MIG-A4-000007 — نوم الطفل والصحة النفسية

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #44
- Status: COMPLETED
- Canonical: `/content/child-sleep`
- Legacy slug: `child-sleep`
- Final title: `نوم الطفل والصحة النفسية: دليل عملي للأسرة`
- Final CMS status: `published`
- Supabase content id: `254110b0-0c57-4f55-8373-66650334f7ff`

## Pre-claim collision checks

تم البحث قبل الـClaim عن `child-sleep` و«نوم الطفل والصحة النفسية» و«نوم الأطفال» و«روتين نوم الطفل» والمرادفات الإنجليزية في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم يوجد Claim منافس ولا Canonical/slug/alias قائم. أُنشئ Claim واحد فقط: #44.

الموضوع ضمن A4 كدليل أسري/مدرسي عام للنوم الصحي. الاضطرابات التشخيصية النفسية أو النمائية لا تُشخّص هنا، والحالات المتخصصة تُحال إلى مساراتها المالكة.

## Legacy cluster and history

تم فحص نسختين موضوعيتين مباشرتين:

1. `content/sectors-v10/child.json` — بذرة قصيرة بالـslug `child-sleep`.
2. `quick-info/child-sleep-evaluation/index.html` — صفحة منشورة على المسار العام المؤكد `/quick-info/child-sleep-evaluation/` بعنوان «هل يحتاج نوم طفلك إلى تقييم؟ مؤشرات تتجاوز مقاومة موعد النوم».

تم فحص تاريخ صفحة Quick Info من إنشائها في commit `813a8bdec53c02ec1c9125d075a75e269460c96d` بتاريخ 2026-08-04، إضافة إلى تعديلات SEO/shell/GTM اللاحقة. النسخة الأصلية والحالية كانت قالب فحص عام سطحيًا، وفيها أسئلة عامة لا تخص النوم تحديدًا، وتحذير طوارئ واسع، ومراجع غير متطابقة مع الموضوع إلى ADHD والتوحد. لم تُنقل هذه المراجع إلى الصفحة الجديدة.

لأن `/quick-info/child-sleep-evaluation/` مسار عام موثق ونيته متداخلة مباشرة مع Canonical الجديد، أُنشئ Redirect دائم 301 إلى `/content/child-sleep` بدل إبقاء صفحتين متنافستين.

## Rebuild

أعيد بناء الصفحة من الصفر لتغطي: أهمية النوم للنمو والصحة النفسية، نطاقات الساعات حسب العمر، بناء الجدول من وقت الاستيقاظ، روتين المساء، الضوء والشاشات، مقاومة النوم، الاستيقاظ الليلي، الشخير والتنفس أثناء النوم، أثر النوم في السلوك والتركيز المدرسي، القيلولة، نوم المراهق، بيئة غرفة النوم، المخاوف وقت النوم، الأدوية والميلاتونين، التفريق بين نصائح الطفل الأكبر وسلامة نوم الرضيع، مؤشرات التقييم المهني، وخطة عملية لمدة أسبوعين.

أزيلت أسئلة الفحص العامة غير النوعية، مراجع ADHD والتوحد غير المرتبطة، الحشو، التحذيرات غير الضرورية، وأي TODO/QA أو تعليمات تشغيلية. لا توجد صورة تحريرية في Canonical الجديد، لذا لا توجد صورة بلا Alt.

## Evidence base

المراجع المثبتة في `references_json` وعددها 8:

1. AAP / HealthyChildren.org — Healthy Sleep Habits: How Many Hours Does Your Child Need? — https://www.healthychildren.org/English/healthy-living/sleep/Pages/healthy-sleep-habits-how-many-hours-does-your-child-need.aspx
2. AAP / HealthyChildren.org — Sleep and Health — https://www.healthychildren.org/english/healthy-living/sleep/pages/sleep-and-mental-health.aspx
3. AAP / HealthyChildren.org — Toddler Bedtime Trouble — https://www.healthychildren.org/English/healthy-living/sleep/Pages/bedtime-trouble.aspx
4. AAP / HealthyChildren.org — Bedtime Routines for School-Aged Children — https://www.healthychildren.org/English/healthy-living/sleep/Pages/Bedtime-Routines-for-School-Aged-Children.aspx
5. American Academy of Sleep Medicine — Child Sleep Duration Health Advisory — https://aasm.org/advocacy/position-statements/child-sleep-duration-health-advisory/
6. CDC — About Sleep — https://www.cdc.gov/sleep/about/index.html
7. NHLBI / NIH — Sleep Apnea in Children — https://www.nhlbi.nih.gov/health/sleep-apnea/children
8. NHLBI / NIH — Sleep Apnea Symptoms — https://www.nhlbi.nih.gov/health/sleep-apnea/symptoms

## SEO / E-E-A-T

- Primary keyword: `نوم الطفل`
- Search intent: `informational`
- SEO title: `نوم الطفل والصحة النفسية: دليل عملي` — 35 chars
- Meta description: 153 chars
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
- Useful Arabic body tokens: **1677**
- Structured blocks: **52**
- Body H1: **0**; renderer title is the single page H1
- H2: **19**
- H3: **4**
- FAQ: **10**
- Resource blocks: **10** — 8 external + 2 internal
- Tags: **5**
- Primary category relations: **1**
- Internal links: `/content/emotion-coaching`, `/content/tantrums`
- Canonical matches: **1**
- Active Redirects to canonical: **1**
- Internal TODO/FIXME/QA/agent markers: **0**
- Malformed heading blocks: **0**
- Content versions: **8**
- Audit events: **8**

## Workflow

The CMS page passed:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

Post-publication structural QA found the first H3 in the two-week plan embedded in its parent H2 because the source had only a single newline between those elements. The block was split into a real H2 + H3 + paragraph and the correction received a separate content version and audit event before closure.

## Redirect

`/quick-info/child-sleep-evaluation/` → `/content/child-sleep` — HTTP 301, active.

The Redirect is evidence-backed from a verified public legacy path in the repository; it was not inferred from a slug.

## Repository scope

This record is committed only to branch `migration-agent-4-child-family-education`. No modification was made to `main` or `docs/MIGRATION-PROGRESS.md`.