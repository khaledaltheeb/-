# MIG-A4-000051 — shared-family-decisions

## Canonical
- Title: القرارات الأسرية المشتركة: كيف نُشرك الطفل ونحسم القرار بوضوح
- Slug: `shared-family-decisions`
- Canonical URL: `/content/shared-family-decisions`
- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #163
- Final status: `published`
- Supabase content id: `8dae2130-d9ad-4794-a8a2-157d0ac39e21`

## Scope boundary
صفحة A4 عامة عن صنع القرار داخل الأسرة، وإشراك الطفل أو المراهق بدرجة مناسبة للعمر والموضوع، ووضوح سلطة الوالدين وحدود السلامة والتنفيذ والمراجعة. لا تنافس Canonical `decision-making` التي تشرح المفهوم المعرفي العام، ولا دليل supported decision-making المتخصص بالانتقال والدعم. القرارات النفسية التشخيصية تبقى A1، والقرارات المرتبطة بحالة ذوي احتياجات خاصة كموضوع مركزي تبقى A3.

## Pre-claim dedupe
قبل Claim #163 تم البحث عن العنوان والـslug والمرادفات العربية والإنجليزية في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وفي Supabase. ظهرت صفحات مجاورة فقط: `/content/decision-making` للمفهوم العام و`/evidence-guides/supported-decision-making-transition-guide/` للدعم والانتقال، ولم يظهر Canonical يملك نية البحث الأسرية العامة.

## Legacy inventory/history
Verified predecessor:
- `/sectors/family/guides/shared-family-decisions/`
- `sectors/family/guides/shared-family-decisions/index.html`

فُحصت النسخة الحالية وسجل Git للمسار. الصفحة القديمة كانت دليل v403 بعنوان «قرارات أسرية مشتركة وميسرة» مع طبقات GTM/brand/platform shell، ملاحظة مراجعة داخلية، قالب وظيفي عام وتحذيرات لا تخص كل موضع. سجل المسار يربط النسخة الموضوعية بدفعة أدلة الأسرة في 2026-08-01، ثم تحديثات SEO والهوية والمنصة وGTM. لم تُنقل طبقات القالب أو تعليمات المراجعة.

## Rebuild/enrichment
أعيد البناء من الصفر حول:
- تعريف القرار الأسري المشترك وحدود سلطة الوالدين؛
- متى تفيد المشاركة ومتى تكون السلامة غير قابلة للتفاوض؛
- تحديد السؤال والخيارات والقيود؛
- مشاركة المعلومات بلغة مفهومة؛
- سماع الرأي قبل الإقناع؛
- مشاركة الطفل الصغير والمراهق بصورة مختلفة؛
- منع المشاركة الشكلية؛
- اجتماع أسري قصير وقواعد الحديث؛
- التفريق بين التفضيل والحاجة والعبء؛
- اختلاف الوالدين واختلاف الطفل والوالد؛
- القرارات المدرسية والصحية والمالية؛
- توزيع الأدوار والتجربة والمراجعة؛
- متى يلزم مختص أو مسار حماية؛
- نموذج قرار من سبعة أسطر؛
- 11 سؤال نية بحث.

المصادر المخزنة في CMS تشمل اتفاقية حقوق الطفل ومواد UNICEF حول مشاركة المراهقين والوالدية، إطار Head Start للمشاركة الأسرية، CDC للبنية والروتين، وAAP لصنع القرار المشترك والشراكة المتمحورة حول الطفل والأسرة.

## Internal links
Verified published targets include:
- `/content/school-family-partnership`
- `/content/family-care-plan`
- `/content/family-strengths-map`
- `/content/service-navigation`
- `/content/decision-making`

## Final QA
- Searchable word units: 1801
- Structured blocks: 74
- H1: one via title/template
- H2: 26
- H3 / FAQ: 11
- References: 8
- Internal link occurrences: 6; all targets verified published
- Primary categories: 1
- Tags: 5
- Active redirects: 1
- Canonical collisions: 0
- Forbidden internal markers: 0
- SEO title: 36 characters
- Meta description: 155 characters
- Content versions: 7
- Audit events: 7
- Featured image: none; image alt not applicable
- Final CMS status: `published`

## Redirect
Active 301:
- `/sectors/family/guides/shared-family-decisions/` → `/content/shared-family-decisions`

## Workflow
Completed sequentially:
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

`main` and `docs/MIGRATION-PROGRESS.md` were not modified.