# MIG-A4-000012 — علامات تستدعي الانتباه لإساءة معاملة الطفل

- Agent: A4 — الطفل والأسرة والمدرسة
- Claim: #56
- Status: COMPLETED
- Canonical: `/content/abuse-warning-signs`
- Legacy slug: `abuse-warning-signs`
- Final title: `علامات إساءة معاملة الطفل: دليل ملاحظة وحماية للأسرة والمدرسة`
- Final CMS status: `published`
- Supabase content id: `8cb546d0-ae54-4536-ab1c-09be044d3353`

## Pre-claim checks
تم البحث في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase عن slug والـCanonical والمرادفات العربية والإنجليزية قبل إنشاء Claim. لم يظهر Claim أو Canonical أو alias أو redirect منافس. Claim الوحيد هو #56.

الموضوع ضمن A4 بوصفه حماية طفل واستجابة أسرية/مدرسية، لا تشخيصًا نفسيًا. أي تشخيص نفسي بحت يبقى لـA1 وأي حالة ذوي احتياجات خاصة مركزية تبقى لـA3.

## Legacy audit
المصدر المباشر هو `content/sectors-v10/child.json` وفيه `abuse-warning-signs` بعنوان «علامات تستدعي الانتباه لإساءة معاملة الطفل». البذرة القديمة أشارت إلى الخوف غير المعتاد من شخص، الإصابات المتكررة بتفسيرات غير متسقة، السلوك أو المعرفة الجنسية غير المناسبة للعمر، والاستماع دون أسئلة موجهة، وإخبار الطفل أنه غير مذنب، وحمايته من الخطر والتواصل مع الجهات المختصة. تاريخ ملف القطاع يعود إلى commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` بتاريخ 2026-07-20. البحث عن slug والعنوان في المستودع لم يثبت Canonical مستقلًا آخر.

لم يثبت route عام قديم يمكن توثيقه بثقة، لذلك لم يُنشأ Redirect تخميني.

## Rebuild
أعيد بناء الصفحة من الصفر. التغطية تشمل التعريف الرسمي لإساءة معاملة الأطفال، الفرق بين العلامة والدليل، مؤشرات الإساءة البدنية والعاطفية والإهمال والاعتداء/الاستغلال الجنسي، الاستغلال الرقمي، الاستجابة لإفصاح الطفل، عدم الوعد بالسرية المطلقة، تجنب الأسئلة الموجهة والتحقيق الشخصي، عدم مواجهة المشتبه به إذا كان ذلك يزيد الخطر، التوثيق الموضوعي، حالات التصرف العاجل، اختلاف قوانين الإبلاغ، دور المدرسة، الاشتباه داخل الأسرة، احتياجات الأطفال ذوي طرق التواصل المختلفة، الفرق بين الفقر والإهمال، الدعم بعد الإبلاغ، الوقاية المؤسسية، وقائمة تصرف مختصرة.

الصفحة تؤكد صراحة أن علامة منفردة لا تثبت الإساءة وأن القوانين ومسارات الإبلاغ تختلف بين البلدان، ولا تحول القارئ إلى محقق.

## Evidence base
المراجع المثبتة وعددها 8:
1. WHO — إساءة معاملة الأطفال — https://www.who.int/ar/news-room/fact-sheets/detail/child-maltreatment
2. WHO — Violence against children — https://www.who.int/news-room/fact-sheets/detail/violence-against-children
3. CDC — About Child Abuse and Neglect — https://www.cdc.gov/child-abuse-neglect/about/index.html
4. CDC — Preventing Child Abuse and Neglect — https://www.cdc.gov/child-abuse-neglect/prevention/index.html
5. CDC — Risk and Protective Factors — https://www.cdc.gov/child-abuse-neglect/risk-factors/index.html
6. NSPCC — What to do if a child reveals abuse — https://www.nspcc.org.uk/keeping-children-safe/reporting-abuse/what-to-do-child-reveals-abuse/
7. NSPCC — What to do if you suspect child abuse — https://www.nspcc.org.uk/keeping-children-safe/reporting-abuse/what-if-suspect-abuse/
8. UNICEF — Responding to child protection concerns — https://www.unicef.org/adolescentkit/reports/tool-responding-child-protection-concerns

WHO Arabic fact sheet was freshly verified at its 2026-05-08 update. NSPCC guidance supports listening carefully, telling the child they did the right thing, stating the abuse is not their fault, avoiding confrontation with the alleged abuser, explaining next steps, and reporting promptly through the appropriate route.

## SEO / E-E-A-T
- Primary keyword: `علامات إساءة معاملة الطفل`
- Search intent: `informational`
- SEO title: `علامات إساءة معاملة الطفل: ماذا تفعل؟` — 37 chars
- Meta description: 153 chars
- Canonical: `/content/abuse-warning-signs`
- Robots: index/follow
- Search aliases: Arabic + English
- Visible author: فريق تحرير منصة روافد
- Reviewer metadata: institutional/source-based; no fabricated licensed reviewer
- Last reviewed: 2026-08-08
- References: 8 HTTPS
- Schema: Article JSON-LD

## Final QA
- Status: `published`
- Useful body word tokens: **1617**
- Structured blocks: **66**
- Renderer title is the single H1; body H1 = **0**
- H2: **25**
- H3: **3**
- FAQ: **10**
- Internal links: **4** — `/content/child-trauma`, `/content/bullying`, `/content/discipline-vs-punishment`, `/content/emotion-coaching`
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

## Release-gate correction
The first review-transition attempt was blocked by the CMS release gate because the meta description was 145 characters while the enforced range is 150–160. No state transition was accepted. The description was corrected to 153 characters, schema description updated, and the full review sequence rerun successfully.

## Workflow
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

## Repository scope
This record is committed only to `migration-agent-4-child-family-education`. `main` and `docs/MIGRATION-PROGRESS.md` were not modified.