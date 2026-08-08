# MIG-A4-000043 — قلق الانفصال لدى الطفل ودعم الوداع

- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #135
- Canonical key: `separation-anxiety-child`
- Canonical: `/content/separation-anxiety-child`
- CMS content id: `e1c6331a-386c-429d-a6e0-e1c2b8dc6c03`
- Final status: **PUBLISHED / QA PASS**
- Date: 2026-08-08

## Scope and ownership

هذه الصفحة تعالج قلق الانفصال وصعوبة الوداع بوصفهما خبرة نمائية وعملية انتقال بين الطفل والأسرة والحضانة/الروضة/المدرسة. لا تشخّص اضطراب قلق الانفصال؛ إذا أصبح التشخيص النفسي هو محور الصفحة فتعود الملكية إلى A1. وأي صفحة تكون فيها حالة من ذوي الاحتياجات الخاصة هي الموضوع المركزي تعود إلى A3.

## Claim / dedupe checks

قبل العمل فُحص GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase باستخدام slug وCanonical والمرادفات العربية والإنجليزية. لم توجد Canonical أو Claim منافسة. الموجود `/content/co-parenting-after-separation` موضوع مختلف خاص بانفصال الوالدين. Claim A4 الفعلي هو #135، ولم يُفتح Claim A4 ثانٍ أثناء العمل.

## Legacy discovery and history

المصدر التاريخي الأول المثبت هو إدخال `separation-anxiety` في:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/child.json`
- أول commit مثبت للملف: `9a7e7444acbca06bc50dbcbadeb3119398abd61b`
- التاريخ: 2026-07-20

كما وُجد موضوع تاريخي ثانٍ قريب جدًا داخل مولّد أدلة الرعاية:

- `scripts/care_guides_topics_v246_2.py`
- legacy topic: `separation-anxiety-school-transition`

قيمة النسختين المعرفية دُمجت في Canonical واحدة بدل إنشاء صفحة منافسة. بحث المستودع لم يثبت ملفًا عامًا منشورًا مستقلًا لمسار `separation-anxiety` أو `separation-anxiety-school-transition` يمكن اعتماده predecessor URL موثوقًا؛ لذلك لم يُنشأ Redirect تخميني.

## What was excluded

لم يُنقل النص القديم ميكانيكيًا. استُبعدت الصياغات المختصرة المولدة، التكرار، أي إيحاء تشخيصي يتجاوز نطاق A4، وأي تعليمات داخلية أو TODO/QA أو ملاحظات تشغيل. أُبقيت الفكرة الأساسية المفيدة: روتين وداع قصير ومتوقع، انتقال تدريجي، تعاون مع المدرسة، ومؤشرات واضحة للمراجعة.

## Rebuild and evidence

أعيد بناء الصفحة من الصفر حول: تعريف قلق الانفصال النمائي، الفرق بين الخبرة النمائية والاضطراب التشخيصي، عوامل تزيد صعوبة الوداع، التحضير قبل الحضانة والروضة، طقس وداع قصير وثابت، سبب تجنب المغادرة خلسة، دور المعلم بعد المغادرة، قراءة مسار الطفل بعد البكاء، الدعم حسب العمر، تنظيم مشاعر الوالد، ما لا يساعد، الأعراض الجسدية، شراكة البيت والمدرسة، النوم والروتين، خطة سبعة أيام، مؤشرات القياس، ومتى يلزم التقييم المهني.

المصادر الأساسية الموثقة في CMS، بإجمالي 8 مراجع: American Academy of Pediatrics / HealthyChildren.org، UNICEF Parenting، NHS، CDC، NAEYC، وHead Start. حُفظت صياغة حذرة تفصل بوضوح بين قلق الانفصال الشائع وبين اضطراب قلق الانفصال الذي يحتاج تقييمًا مهنيًا.

## SEO / E-E-A-T

- SEO title: `قلق الانفصال لدى الطفل: دليل عملي للوداع الآمن`
- SEO title length: 46
- Meta description length: 155
- Primary keyword: `قلق الانفصال لدى الطفل`
- Search intent: informational
- Search aliases: Arabic + English variants for child separation anxiety / separation distress / preschool separation anxiety.
- Author: فريق تحرير منصة روافد
- Reviewer: فريق المراجعة العلمية والتحريرية في روافد
- Medical/YMYL disclaimer: present
- Canonical count in Supabase after publish: 1
- Featured image: none; Alt therefore N/A.

## Internal links

خمسة روابط داخلية، وكل أهدافها منشورة:

1. `/content/school-family-partnership`
2. `/content/preschool-transition`
3. `/content/family-routine-redesign`
4. `/content/child-sleep`
5. `/content/home-calm-corner`

## Redirect

No verified predecessor public URL was proven after repository search. **No speculative redirect created.**

## Workflow

تم إنشاء المحتوى في `draft` ثم مر فعليًا بالتسلسل الكامل:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

اتصال الإدارة في Supabase لا يولد تلقائيًا سجلات `content_versions` و`audit_logs`، لذلك بعد اكتمال الانتقالات تم تسجيل المراحل الفعلية السبع في جدولي النسخ والتدقيق كتوثيق رجعي مطابق للتسلسل الذي نُفذ، دون اختلاق مرحلة إضافية. كما صُحح مرجع Claim داخل سجل التدقيق إلى #135 بعد كشف عدم تطابق رقم الإرجاع الأولي من موصل GitHub مع رقم القضية الفعلي.

## Final QA

- Status: **published**
- Approx. searchable Arabic words: **2660**
- Structured blocks: **78**
- H1: **1** through page title
- H2: **19**
- H3: **13** (including 10 FAQ questions)
- FAQ: **10**
- References: **8**
- Internal content links: **5 / 5 targets published**
- Tags: **5**
- Primary category relations: **1**
- Content versions: **7**
- Audit events: **7**
- Active legacy redirects: **0** (none verified)
- Canonical rows for canonical URL: **1**
- TODO/FIXME/QA/agent-instruction scan: **0 matches**
- Search vector: present
- Featured image: none / Alt N/A

## GitHub numbering incident

موصل GitHub أعاد في استجابة الإنشاء رقمًا غير متطابق مع القضية الفعلية. فحص البحث اللاحق أثبت أن Claim A4 الصحيح هو #135، بينما #123 قضية A3 مغلقة خاصة بـ`capabilities-cerebral-visual-impairment`. أُعيدت #123 إلى عنوانها ونطاقها وCanonical الصحيح وحالتها المغلقة، ثم صُحح هذا السجل وAudit metadata إلى #135 قبل الإغلاق النهائي.

## Governance

No change was made to `main` or `docs/MIGRATION-PROGRESS.md`. This record is written only on `migration-agent-4-child-family-education` for coordinator review.