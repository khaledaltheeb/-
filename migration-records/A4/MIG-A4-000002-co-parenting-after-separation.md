# MIG-A4-000002 — الأبوة المشتركة بعد الانفصال

## الحالة

- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #25
- Canonical key: `co-parenting-after-separation`
- Canonical slug: `co-parenting-after-separation`
- Canonical path: `/content/co-parenting-after-separation`
- CMS content ID: `16258df5-e4d5-4f50-9c21-c1f01d624aa7`
- Final status: `published`
- Content versions: 9
- Audit events: 9

## فحص التعارض ومنع التكرار

قبل البدء بُحث عن العنوان والـslug والمرادفات العربية والإنجليزية في GitHub Issues و`docs/MIGRATION-PROGRESS.md` وSupabase. لم يوجد Claim أو Canonical منافس. المرادفات المستخدمة: الأبوة المشتركة بعد الانفصال، التربية المشتركة بعد الانفصال، التعاون الوالدي بعد الطلاق، تنظيم رعاية الطفل بعد الانفصال، co-parenting after separation، co-parenting after divorce، shared parenting، parenting after separation.

## النسخ القديمة التي فُحصت

- `khaledaltheeb/healthrenewal.org:quick-info/co-parenting-after-separation/index.html` — النسخة الحالية.
- النسخة الأصلية عند commit `813a8bdec53c02ec1c9125d075a75e269460c96d`.
- سجل commits للملف أظهر أن التغييرات اللاحقة كانت أساسًا SEO/platform shell/GTM، ولم تنشئ مادة موضوعية مستقلة.
- النسخة القديمة كانت قصيرة جدًا وتضم مواد عامة مولدة، FAQ تشخيصيًا غير مناسب، تنبيه طوارئ غير مرتبط بالموضوع، ومراجع غير صحيحة عن ADHD والتوحد.

## ما استُبعد من Legacy

لم يُنقل القالب أو CSS/JS أو Analytics. استُبعدت الإشارات التشخيصية العامة، التحذير الطارئ غير المتصل، العبارات المولدة مثل «صف السلوك وما يسبقه ويتبعه» عندما لا تخدم موضوع الانفصال، والمراجع غير المطابقة. أُعيد بناء الصفحة من الصفر.

## البناء الجديد

- 1996 كلمة عربية مفيدة في `body_text`.
- 40 content blocks.
- H1 واحد من عنوان الكيان.
- 17 H2 و7 H3.
- 8 أسئلة FAQ ظاهرة ضمن بنية H2/H3 وتخدم نوايا البحث.
- 8 مراجع رسمية/مهنية موثوقة.
- 2 روابط داخلية مؤكدة إلى قطاع الطفل والأسرة والمدرسة وصفحة الانضباط الإيجابي.
- 5 tags + 1 primary category relation.
- لا TODO/QA/تعليمات وكلاء أو نص داخلي منشور.

## المحاور التي أُضيفت

تعريف الأبوة المشتركة، أثر الصراع الوالدي، منع استخدام الطفل رسولًا أو حكمًا، التواصل العملي، خطة الأبوة، الانتقال بين منزلين، الاتساق بين المنزلين، المدرسة والقرارات التعليمية، كيفية الحديث مع الطفل، اختلاف أساليب التربية، حدود التعاون في حالات العنف أو السيطرة، إشارات الحاجة إلى دعم إضافي، أخطاء شائعة، وخطة عملية من ثماني خطوات.

## المصادر الأساسية

1. American Academy of Pediatrics / HealthyChildren.org — Divorce and Separation: How to Help Your Child Adjust.
2. UK Government / Department for Work and Pensions — Reducing Parental Conflict: what is parental conflict?
3. UK Government / Department for Work and Pensions — Reducing Parental Conflict: the impact on children.
4. Cafcass — Communicating with your child's other parent after a separation.
5. Cafcass — Resources to help you make arrangements that are in your child’s best interests.
6. Department of Justice Canada — Parenting Plan Checklist.
7. Department of Justice Canada — Parenting Plan Tool.
8. Department of Justice Canada — Parenting Arrangements.

## SEO / E-E-A-T

- Primary keyword: `الأبوة المشتركة بعد الانفصال`.
- SEO title length: 46 characters.
- Meta description length: 154 characters.
- Search intent: informational.
- Canonical واحد: `/content/co-parenting-after-separation`.
- Search aliases + secondary keywords + semantic terms مكتملة.
- Article structured data موجودة.
- المؤلف الظاهر: فريق تحرير منصة روافد.
- reviewer display: `فريق تحرير منصة روافد — مراجعة المصادر` مع توصيف دقيق بأنه تدقيق مرجعي لمصادر AAP/GOV.UK/Cafcass/Justice Canada وليس مراجعة سريرية فردية.
- آخر مراجعة علمية/مرجعية مسجلة.
- تنبيه قانوني مختصر فقط لأن قوانين الحضانة والزيارة تختلف محليًا.
- لا صورة مميزة في الكيان؛ لذلك لا يوجد عنصر صورة يحتاج Alt.

## Redirect

`/quick-info/co-parenting-after-separation/` → `/content/co-parenting-after-separation` — 301 active.

## Workflow / QA

مرّت الصفحة بالتسلسل:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → scheduled → published`

تعرضت محاولة الإدخال الأولى لرفض release gate بسبب قصر Meta Description، وتعرضت الثانية لرفض بوابة YMYL لعدم وجود reviewer display؛ كلتا المحاولتين رُجعتا بالكامل داخل transaction ولم تتركا صفوفًا جزئية. أُعيد الإدخال بعد تصحيح الحقلين وفق قواعد الـCMS دون اختلاق هوية مختص.

التحقق النهائي من قاعدة البيانات:

- words = 1996
- blocks = 40
- H2 = 17
- H3 = 7
- internal links = 2
- references = 8
- content versions = 9
- audit events = 9
- tags = 5
- category relations = 1
- competing canonical = 0
- internal TODO/QA/agent hits = 0
- redirect 301 active = 1
- status = published

لم يتم تعديل `main` ولم يتم تعديل `docs/MIGRATION-PROGRESS.md` المركزي.