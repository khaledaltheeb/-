# Rawafid V3 — Legacy Taxonomy Map

## الغرض

هذه الوثيقة تسجل **بنية** المستودع القديم فقط لتصميم Taxonomy وModules المنصة الجديدة. لا تحتوي نصوص صفحات قديمة، ولا تعني بدء الترحيل.

> يمنع استيراد محتوى المستودع القديم قبل الأمر الصريح: «ابدأ سحب المحتوى».

## ما ظهر في المستودع القديم

### محاور جمهور / سياق

- Child — الطفل
- Family — الأسرة
- Home — البيت/العائلة
- Women — المرأة
- Youth — الشباب
- Schools — المدارس/البيئة التعليمية

هذه المحاور لا ينبغي نسخها جميعًا كقطاعات موضوعية منفصلة 1:1. كثير منها أنسب كـ `audience` أو `context` يمكن ربطه بمحتوى واحد دون إنشاء نسخ مكررة من الصفحة.

### مجالات موضوعية رئيسية

- Mental Health / المعرفة النفسية
- Addiction / الإدمان والتعافي
- Special Needs / الأشخاص ذوو الاحتياجات الخاصة والدمج والتمكين
- Research / Evidence / Cochrane
- Specialists & Centers
- Education / Learning
- Tools / Assessments
- Safety / Rights / Accessibility

هذه مرشحة لقطاعات أو Hubs موضوعية، مع حسمها لاحقًا من لوحة الإدارة الديناميكية وليس كمجلدات ثابتة في الكود.

### Modules متكررة اكتشفت في القطاعات

في الطفل والأسرة والبيت تكررت بنية:

- assessment
- guides
- interventions
- library

وفي قطاعات أخرى ظهرت أيضًا:

- daily-calendar / calendars
- courses
- learning-paths
- cognitive-tests
- assessment-lab
- guided-assessment
- magazine / blog / news
- resources / verified-resources
- specialist/provider platform

القرار المعماري: هذه **ليست أقسامًا يجب نسخها داخل كل قطاع**. تبنى كـ Modules أو Content Types مشتركة يمكن ربطها بأي قطاع/قسم/جمهور.

## Content Types المعتمدة في V3

يدعم مخطط Supabase الجديد حاليًا:

- article
- guide
- condition
- research
- comparison
- tool
- news
- sector_page
- landing_page
- assessment
- intervention
- protocol
- course
- learning_path
- resource
- calendar
- glossary_term
- faq
- directory_page

الهدف هو منع إنشاء بنية ملفات خاصة لكل نوع محتوى.

## النموذج المستهدف

`Content` ككيان مركزي، ويرتبط بـ:

- Primary Sector
- Primary Category
- Additional Categories عبر `content_categories`
- Audience[]
- Tags عبر `content_tags`
- Content Type
- Workflow Status
- Author / Reviewers
- SEO fields
- Search aliases/vector
- Versions
- Redirects
- Audit history

بهذا يمكن لمقال واحد مثل موضوع ADHD أن يظهر في سياقات الطفل والأسرة والمدرسة والمختص دون تكرار النص أو إنشاء URLs متنافسة.

## قواعد ترحيل مستقبلية

عند صدور أمر بدء سحب المحتوى:

1. Inventory لكل URL تاريخي وكل نسخة.
2. استخراج النص والبيانات فقط؛ لا CSS/Layout/JS قديم.
3. اكتشاف النسخ المتكررة والمتقاربة.
4. دمج أفضل المعلومات في Canonical Content Entity واحدة عند التطابق الحقيقي.
5. Mapping إلى Sector / Category / Audience / Tags / Content Type.
6. الاحتفاظ بسجل Source URLs لكل صفحة.
7. إنشاء Redirect Map من URLs القديمة إلى Canonical URL الجديدة.
8. Import Dry Run ثم Validation ثم Commit.
9. عدم نشر أي صفحة ناقصة أو مكررة تلقائيًا.
10. قياس فقدان/تحسن Coverage وIndexation بعد الانتقال.

## مبدأ ثابت

المستودع القديم **مصدر معلومات وتاريخ URLs**، وليس مصدر Architecture أو Theme للمنصة الجديدة.
