# MIG-A4-000044 — الحركة المشتركة داخل الأسرة

- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #137
- Canonical key: `family-movement`
- Canonical: `/content/family-movement`
- CMS content id: `90dea586-8435-44fa-b1b6-f9de7f67e867`
- Final status: **PUBLISHED / QA PASS**
- Date: 2026-08-08

## Scope and ownership

هذه الصفحة تعالج الحركة والنشاط البدني بوصفهما ممارسة أسرية يومية للأطفال والمراهقين: اللعب النشط، المشي، الحركة بعد المدرسة، المشاركة العائلية، السلامة، الاستقلالية لدى المراهق، والتنسيق مع المدرسة. لا تحوّل النشاط إلى علاج نفسي أو برنامج وزن. إذا أصبحت حالة نفسية تشخيصية هي الموضوع المركزي فالملكية لـA1، وإذا أصبحت حالة من ذوي الاحتياجات الخاصة أو تكييفاتها العلاجية المتخصصة هي الموضوع المركزي فالملكية لـA3.

## Claim / dedupe checks

قبل الحجز فُحص GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase باستخدام `family-movement` و`/content/family-movement` والمرادفات العربية والإنجليزية، ومنها: الحركة المشتركة للعائلة، النشاط البدني الأسري، الحركة والمزاج، النشاط العائلي، family movement، family physical activity، active family time. لم توجد Canonical أو Claim منافسة. تم إنشاء Claim واحد فقط هو #137، ولم يُفتح Claim A4 ثانٍ أثناء العمل.

## Legacy discovery and history

المصدر التاريخي المثبت هو الإدخال `family-movement` في:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/home.json`
- Legacy title: `الحركة المشتركة والمزاج`
- Legacy summary: استخدام النشاط كفرصة اتصال وتنظيم لا كمشروع وزن.
- أول/الوحيد commit المثبت للملف في تاريخ المسار: `9a7e7444acbca06bc50dbcbadeb3119398abd61b`
- التاريخ: 2026-07-20

فُحص المستودع والسجل التاريخي وخريطة الموقع القديمة، ولم يثبت URL عام مستقل منشور لهذا الموضوع يمكن اعتباره predecessor موثوقًا. لذلك لم يُنشأ Redirect تخميني.

## What was excluded

لم يُنقل الإدخال القديم ميكانيكيًا. استُبعدت الصياغة المختصرة، أي تعميمات سببية عن «تحسين المزاج»، وأي لغة تربط الحركة بعقاب الطعام أو إنقاص الوزن أو المقارنة بين الأجسام. لا توجد تعليمات وكلاء أو TODO/FIXME/QA أو ملاحظات تشغيلية في الصفحة النهائية.

## Rebuild and evidence

أعيد بناء الصفحة من الصفر لتغطي: تعريف النشاط البدني، لماذا الحركة مهمة للصحة من دون ادعاء علاج نفسي، التوصيات حسب العمر، منع تحويل النشاط إلى مشروع وزن، الاختيار والمتعة، أنشطة منخفضة التكلفة، الحركة بعد المدرسة، الشاشات والجلوس، استقلالية المراهق، اختلاف القدرات داخل الأسرة، السلامة، دور المدرسة، القدوة لدى البالغين، مؤشرات نجاح الخطة، خطة أسبوع، وعشرة أسئلة شائعة.

المراجع الأساسية الموثقة في CMS، بإجمالي 8 مراجع رسمية:

1. World Health Organization — Physical activity: https://www.who.int/news-room/fact-sheets/detail/physical-activity
2. World Health Organization — WHO guidelines on physical activity and sedentary behaviour: https://www.who.int/publications/i/item/9789240014886
3. World Health Organization — Guidelines for children under 5: https://www.who.int/publications/i/item/9789241550536
4. CDC — Child Activity: An Overview: https://www.cdc.gov/physical-activity-basics/guidelines/children.html
5. CDC — Health Benefits of Physical Activity for Children: https://www.cdc.gov/physical-activity-basics/health-benefits/children.html
6. CDC — Making Physical Activity Part of a Child's Life: https://www.cdc.gov/physical-activity-basics/adding-children-adolescents/index.html
7. U.S. ODPHP / Move Your Way — Help your kids get more physical activity: https://odphp.health.gov/moveyourway/get-kids-active
8. American Academy of Pediatrics / HealthyChildren.org — Daily Physical Activity Recommendations: https://www.healthychildren.org/English/healthy-living/fitness/Pages/Energy-Out-Daily-Physical-Activity-Recommendations.aspx

## SEO / E-E-A-T

- Page title / H1: `الحركة المشتركة داخل الأسرة: دليل عملي لنشاط ممتع بلا ضغط وزن`
- SEO title: `الحركة العائلية: نشاط ممتع يدعم صحة الأسرة`
- SEO title length: **42**
- Meta description length: **152**
- Primary keyword: `الحركة العائلية`
- Search intent: informational
- Arabic + English search aliases present
- Author: فريق تحرير منصة روافد
- Reviewer: فريق المراجعة العلمية والتحريرية في روافد
- YMYL/medical disclaimer: present and scoped
- Schema.org Article: present
- Canonical rows after publish: **1**
- Featured image: none; Alt therefore N/A.

## Internal links

ستة روابط داخلية مستخدمة داخل النص. تم التحقق من أن أهدافها منشورة:

1. `/content/family-nature`
2. `/content/attention-support`
3. `/content/screens-child`
4. `/content/school-family-partnership`
5. `/content/family-rest`
6. `/content/child-sleep`

## Redirect

No verified predecessor public URL was proven after repository/history/sitemap checks. **No speculative redirect created.**

## Workflow

تم إنشاء المحتوى في `draft` ثم نُفذت الانتقالات فعليًا وبالترتيب:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

بعد اكتمال الانتقالات سُجلت المراحل الفعلية السبع في `content_versions` و`audit_logs` لأن الكتابة الإدارية المباشرة لا تنشئ هذين السجلين تلقائيًا. لم تُختلق مرحلة مراجعة إضافية.

## Final QA

- Status: **published**
- Approx. searchable Arabic words: **2341**
- Structured blocks: **69**
- H1: **1** through page title
- H2: **17**
- H3: **10**
- FAQ: **10**
- References: **8**
- Internal content links: **6**; targets published
- Tags: **5**
- Primary category relations: **1**
- Content versions: **7**
- Audit events: **7**
- Canonical rows: **1**
- Active legacy redirects: **0** because none verified
- TODO/FIXME/QA/agent-instruction scan: **0 matches**
- Search vector: present
- Featured image: none / Alt N/A

## Governance

No change was made to `main` or `docs/MIGRATION-PROGRESS.md`. This record is written only on `migration-agent-4-child-family-education` for coordinator review.