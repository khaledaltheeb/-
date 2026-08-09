# MIG-A4-000053 — exam-stress

## Canonical
- Title: توتر الامتحانات لدى الطالب: دليل عملي للأسرة والمدرسة
- Slug: `exam-stress`
- Canonical URL: `/content/exam-stress`
- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #168
- Final status: `published`
- Supabase content id: `a862bcd0-c65e-4e31-948c-e981240a91ab`

## Scope boundary
الصفحة مورد تربوي عام عن الضغط المرتبط بالامتحانات لدى الأطفال والمراهقين ودور الطالب والأسرة والمدرسة في الاستعداد والتنظيم والدعم. لا تُعرِّف قلق الامتحان كتشخيص مستقل، ولا تشخّص اضطراب قلق. إذا كانت الأعراض شديدة أو مستمرة خارج سياق الاختبارات أو تعطل مجالات متعددة، تنتقل الحاجة إلى تقييم مهني؛ التشخيص النفسي البحت يبقى ضمن A1.

## Pre-claim dedupe
قبل Claim #168 جرى البحث عن `exam-stress` والعنوان العربي ومرادفات مثل «توتر الامتحان»، «قلق الامتحان»، «ضغط الامتحانات»، `test anxiety` و`exam anxiety` في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم يظهر Claim منافس أو Canonical مطابق. قبل النشر أعيد فحص Supabase: Canonical matches = 1، slug matches = 1، alias collisions = 0.

## Legacy inventory/history
Verified predecessor:
- `/quick-info/exam-stress/`
- `quick-info/exam-stress/index.html`

فُحصت النسخة الحالية وسجل Git للمسار، بما في ذلك نسخة ما قبل إثراء 8 أغسطس ثم طبقة long-form وتحديثات shell/GTM والبيانات الوصفية. النسخة القديمة كانت بعنوان «كيف تقلل التوتر قبل الامتحان دون وعود سحرية؟» وبدأت كصفحة Quick Information قصيرة ذات خطوات عامة ومصادر محدودة وFAQ عامة، ثم أضيفت إليها طبقات long-form آلية وقياس وواجهة. لم تُنقل أكواد GTM/GA أو CSS/JS أو platform shell أو التعليقات الداخلية أو النصوص القالبية، ولم يُفترض أن آخر تعديل تقني يمثل أفضل نسخة معرفية.

## Rebuild/enrichment
أُعيد بناء الصفحة من الصفر حول نية بحث الطالب والأسرة والمدرسة، وتشمل:
- معنى الضغط المرتبط بالامتحان والفرق بين التوتر المتوقع والتعطل الوظيفي؛
- تحديد مصدر الضغط بدل معاملته كسبب واحد؛
- فصل قيمة الطفل عن الدرجة؛
- خطة مراجعة واقعية والاسترجاع النشط والتدرب على شكل الاختبار؛
- النوم المناسب للعمر والطعام والكافيين والحركة؛
- التعامل مع لحظة «فراغ الذهن» وتثبيت الانتباه؛
- خطة يوم الامتحان؛
- دور الأسرة قبل الاختبار وبعده؛
- دور المدرسة ووضوح الإجراءات؛
- الطالب المتفوق والطالب المتجنب أو المؤجل؛
- حدود التشخيص ومتى يحتاج القلق إلى تقييم أوسع؛
- التعامل مع تجنب المدرسة أو الامتحان دون وصم أو افتراض العناد؛
- خطة سبعة أيام وخطة أسرية لموسم الامتحانات؛
- 10 FAQ تخدم نوايا البحث؛
- روابط داخلية لمحتوى منشور ذي صلة.

جرى إثراء الصفحة والتحقق من الادعاءات بمصادر مؤسسية رسمية وموثوقة، منها WHO وNHS وCDC وUNICEF. استُخدمت توصيات النوم المناسبة للعمر من CDC، وإرشادات NHS حول ضغط الامتحانات والاستعداد، وإطار WHO لإدارة الضغط. حُفظ الفصل بين تثقيف الطالب والأسرة وبين التشخيص النفسي.

## Internal links
جميع الأهداف التالية تحققت في Supabase بوصفها منشورة وقت QA:
- `/content/attention-support`
- `/content/child-sleep`
- `/content/active-listening`
- `/content/school-family-partnership`
- `/content/when-child-needs-help`
- `/content/family-emotional-language`

## Final QA
- Searchable word units: 2233
- Structured blocks: 86
- H1: one via title/template
- H2: 23
- H3 / FAQ: 10
- References: 8
- Internal link occurrences: 6; all targets verified published
- Primary categories: 1
- Tags: 5
- Active redirects: 1
- Canonical matches: 1
- Slug matches: 1
- Search-alias collisions: 0
- Forbidden internal markers (TODO/FIXME/QA/MIGRATION/agent instructions): 0
- SEO title: 36 characters
- Meta description: 153 characters
- Content versions: 7
- Audit events: 7
- Featured image: none; image alt not applicable in the new CMS record
- Final CMS status: `published`

## Redirect
Active 301:
- `/quick-info/exam-stress/` → `/content/exam-stress`

## Workflow
Completed sequentially:
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

`main` and `docs/MIGRATION-PROGRESS.md` were not modified.