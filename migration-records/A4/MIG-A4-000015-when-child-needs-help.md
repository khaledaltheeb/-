# MIG-A4-000015 — متى يحتاج الطفل إلى مختص نفسي

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #59
- Status: COMPLETED
- Canonical: `/content/when-child-needs-help`
- Legacy slug: `when-child-needs-help`
- Final title: `متى يحتاج الطفل إلى مختص نفسي؟ دليل للأسرة والمدرسة`
- CMS status: `published`
- Supabase content id: `17d1d173-4493-4e45-bbbd-0f879915c387`

## Pre-claim and ownership
فحص GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase لم يظهر Claim أو Canonical أو alias أو redirect منافس. Claim الوحيد #59. الصفحة للتوجيه إلى المساعدة والتقييم ولا تقدم تشخيصًا؛ التشخيصات المحددة لـA1 والحالات المركزية لذوي الاحتياجات الخاصة لـA3.

## Legacy audit
المصدر المباشر `content/sectors-v10/child.json`، slug `when-child-needs-help` بعنوان «متى يحتاج الطفل إلى مختص نفسي». البذرة القديمة ركزت على استمرار الأعراض أسابيع، تعطيل الدراسة/النوم/العلاقات، خطر النفس أو الآخرين، تدوين المدة والتكرار، استبعاد الأسباب الطبية، سؤال المدرسة، واختيار مختص مؤهل للأطفال. لم يثبت Canonical مستقل منافس أو route عام قديم موثق؛ لذلك لا Redirect تخميني.

## Rebuild
أعيد البناء من الصفر حول المدة والشدة والانتشار والتعطل، خط أساس الطفل، علامات الأعمار الصغيرة والمراهقين، الحوار مع الطفل والمدرسة، نقطة البداية لدى طبيب الأطفال، التحضير للتقييم، مكونات التقييم الشامل، اختيار المختص، أشكال العلاج ومشاركة الأسرة، دور المدرسة، استبعاد الأسباب الجسدية والنوم، رفض الطفل للموعد، خصوصية المراهق، التقييم العاجل والسلامة، السؤال المباشر عن إيذاء النفس، المراقبة المنظمة، قياس تقدم العلاج، قوائم الانتظار، الرأي الثاني، والتنسيق بين شبكة الدعم.

## Evidence base
8 مراجع مثبتة من NIMH وCDC وAAP/HealthyChildren وUNICEF. تحقق حديث شمل CDC `Treating Children's Mental Health with Therapy` بتاريخ 2026-05-12 وCDC `About Children's Mental Health` بتاريخ 2026-05-15، إضافة إلى NIMH وAAP.

## SEO / E-E-A-T
- Primary keyword: `متى يحتاج الطفل إلى مختص نفسي`
- Search intent: informational
- SEO title: 30 chars
- Meta: 154 chars
- Canonical: `/content/when-child-needs-help`
- Robots: index/follow
- Author: فريق تحرير منصة روافد
- Reviewer metadata: institutional/source-based
- Reviewed: 2026-08-08
- References: 8 HTTPS
- Schema: Article

## Final QA
- Status: published
- Useful body tokens: **1586**
- Blocks: **69**
- Body H1: 0; renderer title is the single H1
- H2: **29**
- H3: **0** (no nested subsection required; headings are flat peers by design)
- FAQ: **10**
- Internal links: **4** — `/content/emotion-coaching`, `/content/school-attendance-distress`, `/content/child-sleep`, `/content/child-trauma`
- References: **8**
- Tags: **5**
- Category relations: **1** primary
- Canonical matches: **1**
- Redirects: **0**
- Multiline headings: **0**
- Embedded Markdown headings: **0**
- Internal markers: **0**
- Featured image: none
- Versions: **8**
- Audits: **8**

## Quality-floor correction
Initial draft was 1391 words and meta 143 characters; it was not advanced. Added substantive sections about access delays, second opinions and coordinated support, and corrected meta to 154 before review.

## Workflow
`draft → enrichment → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

## Repository scope
Only `migration-agent-4-child-family-education`; no change to `main` or central progress.