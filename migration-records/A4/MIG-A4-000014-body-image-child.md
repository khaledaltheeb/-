# MIG-A4-000014 — صورة الجسد لدى الأطفال والمراهقين

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #58
- Status: COMPLETED
- Canonical: `/content/body-image-child`
- Legacy slug: `body-image-child`
- Final title: `صورة الجسد لدى الأطفال والمراهقين: دليل للأسرة والمدرسة`
- Final CMS status: `published`
- Supabase content id: `98740d23-1da2-4c2d-8c17-f71186c4cd85`

## Pre-claim / ownership
تم فحص GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase للـslug والـCanonical والمرادفات العربية والإنجليزية ولم يظهر Claim أو Canonical أو alias أو redirect منافس. Claim الوحيد #58. الصفحة تثقيف أسري/مدرسي عام عن صورة الجسد؛ تشخيص اضطرابات الأكل وعلاجها خارج A4 ويحال إلى A1/المسار السريري.

## Legacy audit
المصدر المباشر `content/sectors-v10/child.json`، slug `body-image-child` بعنوان «صورة الجسد لدى الأطفال والمراهقين». البذرة القديمة ركزت على تقليل التركيز على الشكل، احترام الجسد ووظائفه وتنوعه، ملاحظة التعليقات القاسية عن الوزن وتجنب الطعام أو الصور والمقارنة بالمؤثرين، وإيقاف تعليقات الوزن ومراجعة المحتوى الرقمي. جرى التعامل مع نسخ العرض/الفهرسة والمواد المجاورة باعتبارها غير Canonical. لم يثبت route عام قديم موثق بثقة، لذلك لم يُنشأ Redirect تخميني.

## Rebuild
أعيد بناء الصفحة من الصفر لتغطي: تعريف صورة الجسد، تنوع البلوغ، لغة الأسرة، القيمة غير المرتبطة بالوزن، المديح خارج المظهر، التنمر المرتبط بالوزن، دور المدرسة، الفلاتر والخوارزميات، الحركة للمتعة والقدرة، لغة الطعام غير الأخلاقية، الحوار عند نقد الجسد، تجنب الوزن والمقارنات المنزلية، الفتيان والعضلات، الخصوصية في البلوغ، الملابس والصور، العلاقة مع تقدير الذات، الحديث الطبي عن النمو، الوجبات العائلية، التسويق والمؤثرين، صور قبل/بعد، قدوة البالغين، مؤشرات طلب التقييم، والفصل الصريح بين هذه الصفحة وبين تشخيص اضطرابات الأكل.

## Evidence base
8 مراجع مثبتة من UNICEF وAAP/HealthyChildren وCDC. تحقق حديث شمل UNICEF `Teens and body image`، AAP عن التنمر المرتبط بالوزن، AAP عن اختلاف توقيت البلوغ، وAAP body positivity 2026.

## SEO / E-E-A-T
- Primary keyword: `صورة الجسد لدى الأطفال`
- Search intent: `informational`
- SEO title: 33 chars
- Meta description: 152 chars
- Canonical: `/content/body-image-child`
- Robots: index/follow
- Author: فريق تحرير منصة روافد
- Reviewer metadata: institutional/source-based
- Last reviewed: 2026-08-08
- References: 8 HTTPS
- Schema: Article JSON-LD

## Final QA
- Status: `published`
- Useful body tokens: **1679**
- Blocks: **70**
- Body H1: **0**; renderer title is single H1
- H2: **28**
- H3: **2**
- FAQ: **10**
- Internal links: **4** — `/content/child-self-esteem`, `/content/bullying`, `/content/screens-child`, `/content/friendships`
- References: **8**
- Tags: **5**
- Primary category relations: **1**
- Canonical matches: **1**
- Active redirects: **0**
- Multiline headings: **0**
- Markdown headings embedded in paragraphs: **0**
- Internal TODO/FIXME/QA/agent markers: **0**
- Featured image: none; therefore no missing Alt
- Content versions: **8**
- Audit events: **8**

## Quality-floor correction
النسخة الأولى بلغت 1312 كلمة فقط ولم تنتقل إلى المراجعات. أضيفت أقسام عملية نوعية حتى بلغ النص 1679 كلمة مفيدة، ثم فقط مر بالتسلسل الكامل للمراجعة والنشر.

## Workflow
`draft → enrichment → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

## Repository scope
هذا السجل على `migration-agent-4-child-family-education` فقط. لم يُعدل `main` أو `docs/MIGRATION-PROGRESS.md`.