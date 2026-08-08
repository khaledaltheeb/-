# MIG-A4-000017 — الاجتماع الأسري الأسبوعي

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #61
- Status: COMPLETED
- Canonical: `/content/family-meetings`
- Legacy slug: `family-meetings`
- Final title: `الاجتماع الأسري الأسبوعي: دليل عملي للتواصل وتنظيم الأسرة`
- CMS status: `published`
- Supabase id: `a308e25d-df8d-460b-9388-a042e31cd408`

## Collision / legacy
فحص GitHub Issues وMIGRATION-PROGRESS وSupabase لم يظهر منافسًا قبل Claim #61. المصدر المباشر `content/sectors-v10/family.json`: بذرة «الاجتماع الأسري الأسبوعي» التي ركزت على وقت ثابت وجدول قصير ومشكلة واحدة أو اثنتين وقرار واضح وعدم تحويل الاجتماع إلى جلسة توبيخ. أعيد البناء من الصفر. لا route عام قديم موثق، لذلك لا Redirect مخمّن.

## Rebuild
تغطية كاملة لاختيار الوقت، بدء الاجتماع بالإيجابيات، قواعد الحديث، جدول الأعمال، مشاركة الأطفال الصغار والمراهقين، الفرق بين المعلومات والقرارات، تحويل الشكوى إلى مشكلة، الاستماع والحلول، القرارات المحددة، الأعمال المنزلية، الانتقالات، الخصوصية، إدارة الشجار والصمت، المراجعة الأسبوعية، تدوير القيادة، سجل قرار مختصر، الغياب، والمتابعة الفردية بعد موضوع حساس.

## Evidence
8 مراجع من AAP/HealthyChildren وCDC وWHO وUNICEF. تحقق حديث شمل AAP `How to Have a Family Meeting` وCDC حول التواصل وبناء الروتين والقواعد والحوارات المتصلة.

## Final QA
- published
- useful body tokens: **1592**
- blocks: **84**
- body H1: 0; renderer H1 واحد
- H2: **33**
- H3: **4**
- FAQ: **10**
- references: **8**
- internal links: 4
- tags: 5
- primary category relation: 1
- canonical matches: 1
- internal markers: 0
- meta: 151 chars
- versions: **8**
- audits: **8**
- featured image: none
- redirects: 0 (no verified public legacy route)

Initial draft was 1351 words/meta 135 and was not advanced; enriched to 1592/meta 151 before review.

## Workflow
`draft → enrichment → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

## Repository scope
Only `migration-agent-4-child-family-education`; no change to `main` or central progress.