# MIG-A4-000050 — family-strengths-map

## Canonical
- Title: خريطة نقاط قوة الأسرة ومواردها: دليل عملي للبناء على ما يعمل
- Slug: `family-strengths-map`
- Canonical URL: `/content/family-strengths-map`
- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #162
- Final status: `published`
- Supabase content id: `72475f66-98c7-414b-b657-99049897f4b4`

## Scope boundary
صفحة عامة للأسرة لتحديد المهارات والعلاقات والروتين والموارد والخدمات التي يمكن البناء عليها حول هدف عملي، ثم تحويلها إلى تجربة صغيرة قابلة للمتابعة. ليست أداة تشخيص أو مقياسًا معياريًا للأسرة. إذا كان التشخيص النفسي هو الموضوع المركزي فملكيته A1، وإذا كانت حالة من ذوي الاحتياجات الخاصة هي المحور الأساسي فملكيته A3.

## Pre-claim dedupe
قبل فتح Claim #162 تم البحث عن `family-strengths-map` والعنوان العربي والمرادفات الإنجليزية والعربية في GitHub Issues، و`docs/MIGRATION-PROGRESS.md` على `legacy-migration-audit`، وفي Supabase عبر slug/title/canonical/primary keyword والصفحات المتقاربة. لم يظهر Claim A4 مفتوح أو Canonical مطابق. الصفحات المجاورة مثل خطط الطوارئ، رفاه مقدم الرعاية، وخدمات الحالات المتخصصة احتفظت بنطاقاتها ولم تُعامل كنسخ من هذا الموضوع.

## Legacy inventory/history
Verified predecessor:
- `/sectors/family/guides/family-strengths-map/`
- `sectors/family/guides/family-strengths-map/index.html`

فُحصت النسخة الحالية وسجل Git للمسار. النسخة الموضوعية ظهرت ضمن commit `c184bed0a555f9e539a91e966921d0582bd92deb` بتاريخ 2026-08-01، ضمن نشر أدلة الأسرة الموضوعية. التغييرات اللاحقة شملت طبقات SEO والهوية وplatform shell وGTM، وليست Canonicals معرفية مستقلة. النسخة القديمة كانت مبنية على قالب v403 وتحتوي طبقات واجهة/تحليلات، عبارة مراجعة داخلية، وتحذيرات عامة وقالبًا وظيفيًا واسعًا؛ لم تُنقل هذه العناصر.

## Rebuild/enrichment
أُعيد بناء الصفحة من الصفر حول:
- معنى خريطة نقاط القوة وحدودها؛
- البدء بهدف واقعي بدل قائمة مشكلات؛
- مهارات أفراد الأسرة؛
- العلاقات الموثوقة وحدود المساعدة؛
- الروتين الذي يعمل؛
- الموارد المادية والرقمية ومدى استدامتها؛
- معرفة الوصول إلى الخدمات؛
- اللغة والثقافة والقيم دون افتراضات؛
- علاقة الطفل بالكبار المحيطين به؛
- جمع المعلومات دون استجواب؛
- إشراك الطفل والمراهق بما يناسب العمر؛
- التفريق بين القوة والعبء الخفي على مقدم الرعاية؛
- اكتشاف الموارد الموجودة غير المستخدمة؛
- تحويل الخريطة إلى تجربة صغيرة ومؤشرات متابعة؛
- استخدامها مع المدرسة وأثناء الأزمات والتغيرات؛
- متى تحتاج الأسرة دعمًا خارجيًا؛
- الخصوصية وما لا ينبغي تخزينه؛
- نموذج صفحة واحدة ومراجعة دورية؛
- 10 أسئلة شائعة تخدم نية البحث.

الإثراء استند إلى مصادر رسمية من Office of Head Start، CDC، WHO وUNICEF حول المشاركة الأسرية القائمة على القوة، العلاقات الإيجابية، الروتين والبنية، دعم الوالدين والخدمات المترابطة.

## Internal links
Five published targets were verified before final QA:
- `/content/family-care-plan`
- `/content/school-family-partnership`
- `/content/service-navigation`
- `/content/family-emergency-plan`
- `/content/child-health-visit`

## Final QA
- Searchable word units: 2029
- Structured blocks: 71
- H1: one via title/template
- H2: 25
- H3 / FAQ: 10
- References: 8
- Internal links: 5; published targets: 5/5
- Primary categories: 1
- Tags: 5
- Active redirects: 1
- Canonical matches: 1
- Canonical collisions: 0
- Forbidden internal markers: 0
- SEO title: 41 characters
- Meta description: 156 characters
- Content versions: 7
- Audit events: 7
- Featured image: none; image alt not applicable
- Final CMS status: `published`

## Redirect
Active 301:
- `/sectors/family/guides/family-strengths-map/` → `/content/family-strengths-map`

## Workflow
Completed sequentially:
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

`main` and `docs/MIGRATION-PROGRESS.md` were not modified.