# MIG-A4-000013 — تقدير الذات لدى الطفل

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #57
- Status: COMPLETED
- Canonical: `/content/child-self-esteem`
- Legacy slug: `child-self-esteem`
- Final title: `تقدير الذات لدى الطفل: دليل عملي للأسرة والمدرسة`
- Final CMS status: `published`
- Supabase content id: `d6759c9d-d855-41e3-9667-40e0ef01d1ed`

## Pre-claim checks
تم البحث في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase عن slug والـCanonical والمرادفات العربية والإنجليزية. لم يوجد Claim أو Canonical أو alias أو redirect منافس، وأنشئ Claim واحد فقط #57.

## Legacy audit
المصدر المباشر `content/sectors-v10/child.json` بعنوان «تقدير الذات لدى الطفل». البذرة القديمة ركزت على المقارنة، الانسحاب خوفًا من الخطأ، طلب المدح، وصف الجهد، المسؤوليات المناسبة، تجنب المقارنات، وتحمل الخطأ الصغير. البحث التاريخي أظهر مواد عرض/فهرسة ومراجع سياقية في `sectors/child/index.html` و`magazine/index.html` و`build_quick_info.py` ومواد أخرى، دون إثبات Canonical مستقل منافس. لم يُنشأ Redirect تخميني.

## Rebuild
أعيد بناء الصفحة من الصفر لتغطي معنى تقدير الذات، الفرق بين القيمة والمديح، الانتماء، الكفاءة الواقعية، التوقعات المناسبة، مؤشرات انخفاض تقدير الذات، الحديث الداخلي، المقارنات، المسؤوليات والاختيار، المديح المحدد، تحمل الأخطاء، دور المدرسة والصداقة والهوايات، صورة الجسد والمقارنة الرقمية، دعم الطفل مع اختلافات التعلم، الخصوصية في التصحيح، الحب غير المشروط مع حدود السلوك، التعاون بين البيت والمدرسة، خطة أربعة أسابيع، ومتى يلزم دعم إضافي. لا تُعرض الصفحة كتدخل تشخيصي.

## Evidence base
المراجع المثبتة وعددها 8 من American Academy of Pediatrics / HealthyChildren.org وCDC وUNICEF، وتشمل Building Blocks for Healthy Self Esteem in Kids، Signs of Low Self-Esteem in Children & Teens، Age-Appropriate Chores for Children، Positive Parenting Tips، والاستماع إلى صوت الطفل والانتماء المدرسي.

## SEO / E-E-A-T
- Primary keyword: `تقدير الذات لدى الطفل`
- Search intent: `informational`
- SEO title: `تقدير الذات لدى الطفل: دليل عملي` — 32 chars
- Meta description: 158 chars
- Canonical: `/content/child-self-esteem`
- Robots: index/follow
- Visible author: فريق تحرير منصة روافد
- Reviewer metadata: institutional/source-based review
- Last reviewed: 2026-08-08
- References: 8 HTTPS
- Schema: Article JSON-LD

## Final QA
- Status: `published`
- Useful body word tokens: **1573**
- Structured blocks: **72**
- Body H1: **0**; renderer title is the single H1
- H2: **28**
- H3: **3**
- FAQ: **10**
- Internal links: **4** — `/content/friendships`, `/content/emotion-coaching`, `/content/bullying`, `/content/discipline-vs-punishment`
- References: **8**
- Tags: **5**
- Primary category relations: **1**
- Canonical matches: **1**
- Active redirects: **0** — no verified public legacy route
- Multiline headings: **0**
- Markdown headings embedded in paragraphs: **0**
- Internal TODO/FIXME/QA/agent markers: **0**
- Featured image: none; therefore no missing Alt
- Content versions: **7**
- Audit events: **7**

## Release-gate check
Draft QA showed 1573 useful tokens but the initial meta description was 147 characters. It was corrected to 158 characters and schema description synchronized before any review transition.

## Workflow
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

## Repository scope
This record is committed only to `migration-agent-4-child-family-education`. `main` and `docs/MIGRATION-PROGRESS.md` were not modified.