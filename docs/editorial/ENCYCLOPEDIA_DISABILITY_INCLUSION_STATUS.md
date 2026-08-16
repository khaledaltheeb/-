# حالة تنفيذ موسوعة الإعاقة والدمج

**تاريخ اللقطة:** 2026-08-15  
**المسار الموحد:** `/encyclopedia/`  
**الحالة:** بنية ومحتوى تحت المراجعة العلمية؛ لا نشر تلقائي ولا فهرسة لمسودات هذا المسار.

## 1. الاسترداد من المستودع التاريخي

- مصادر تاريخية مستردة: **150** (100 من v280 + 50 من v281).
- مرشحو Canonical بعد الاسترداد: **150**.
- الهدف التخطيطي طويل المدى: **5000 صفحة Canonical** ضمن 12 عائلة موضوعية.
- المرادفات والأسئلة وصيغ «الأعراض/العلاج/عند الأطفال» لا تُحسب صفحات مستقلة لمجرد زيادة العدد.

## 2. الصفحات الجديدة في `scientific_review`

| Canonical | الحالة | مراجع | FAQ |
|---|---|---:|---:|
| `/encyclopedia/autism-spectrum-disorder/` | اضطراب طيف التوحد | 7 | 10 |
| `/encyclopedia/cerebral-palsy/` | الشلل الدماغي | 7 | 10 |
| `/encyclopedia/down-syndrome/` | متلازمة داون | 6 | 10 |
| `/encyclopedia/fragile-x-syndrome/` | متلازمة X الهش | 6 | 10 |
| `/encyclopedia/hearing-loss/` | فقدان السمع وضعفه | 6 | 10 |
| `/encyclopedia/intellectual-developmental-disorder/` | اضطراب النمو الذهني/الإعاقة الذهنية | 7 | 10 |
| `/encyclopedia/rett-syndrome/` | متلازمة ريت | 6 | 10 |

جميع هذه الصفحات:

- `publication_ready=false`
- `robots_index=false`
- `published_at=null` في payloads المولدة
- أكثر من 2000 كلمة/وحدة نصية في payload النهائي
- H2/H3 إلزامية
- 10 روابط claim→source على الأقل لكل صفحة
- disclaimer طبي/تحريري واضح
- تحتاج مراجعة بشرية علمية/تحريرية قبل أي نشر أو فهرسة

## 3. Canonical متبنّى بدل إنشاء صفحة منافسة

ثلاثة موضوعات لها مالك موجود في الموسوعة الموحدة، لذلك تُحفظ المادة التخصصية كإثراء فقط:

1. **ADHD** → `/encyclopedia/attention-deficit-hyperactivity-disorder/`
2. **عسر القراءة** → `/encyclopedia/dyslexia/`
3. **اضطراب اللغة النمائي DLD** → `/encyclopedia/developmental-language-disorder/`

القرارات موثقة في `data/encyclopedia/canonical-adoptions-v1.json` ويجب أن تبقى `import_as_new_record=false`.

## 4. حزم البحث

### Batch 01

التوحد، ADHD، متلازمة داون، الشلل الدماغي، وعسر القراءة.

### Batch 02

متلازمة X الهش، متلازمة ريت، فقدان السمع، اضطراب النمو الذهني، وDLD كإثراء للصفحة الموجودة.

بوابة البحث لا تعتمد رقم الدفعة. كل `batch-*-source-plan.json` يمر بنفس العقد، ويحتاج لكل موضوع إلى مصادر متعددة الأدوار ومن نطاقات مستقلة قبل مرحلة المسودة.

## 5. خط الإنتاج

1. استرداد السجل التاريخي وإسناد provenance.
2. قرار Canonical/merge/adopt قبل الكتابة.
3. خطة بحث ونية بحث ومخطط عناوين ومصادر.
4. مسودة `scientific_review` فقط.
5. تحقق من العمق وH2/H3 وFAQ والمراجع وclaim→source.
6. materialization حتمي إلى review payload مع SHA-256.
7. فحص المحفظة للتكرار والتشابه وتنوع المصادر.
8. dry-run للاستيراد مع منع overwrite وupsert والنشر.
9. مراجعة علمية وتحريرية وSEO ووصولية بشرية قبل تغيير حالة النشر.

## 6. منع السباقات والتعارضات

- `resolve_encyclopedia_research_plan.py` يحدد خطة البحث الوحيدة المالكة لكل draft تلقائيًا.
- Portfolio workflow يولد payloads محليًا قبل التحقق؛ لا يعتمد على ترتيب Workflow آخر.
- Canonical ownership gate يقارن الموسوعة النفسية والمسودات التخصصية وmanifest التبنّي.
- Review importer يحسب عدد المسودات الجديدة ديناميكيًا ولا يحتاج تعديل رقم يدوي عند إضافة صفحة.

## 7. مقاييس المحفظة الحالية

- psychological canonicals في `main`: **50**
- specialty new review canonicals: **7**
- adopted shared canonicals: **3**
- unresolved canonical collisions: **0**
- source drafts / generated review payloads: **7 / 7**
- aggregate source domains: **14**
- max pairwise body 5-gram Jaccard: **0.00185**
- حد منع التشابه: **0.35**

هذه الأرقام تصف لقطة التنفيذ في 2026-08-15، وليست بديلًا عن إعادة تشغيل بوابات CI عند كل تغيير لاحق.

## 8. ما لا يُعتبر مكتملًا بعد

- لا توجد موافقة علمية بشرية نهائية على الصفحات السبع.
- لا يوجد إذن بنشر أو فهرسة هذه المسودات.
- لا تُعد 150 حالة التاريخية صفحات جاهزة؛ هي سجل مرشحين يحتاج كل كيان منه إلى بحث حديث ومراجعة مستقلة.
- الوصول إلى 5000 صفحة هدف موسوعي طويل المدى مشروط بالقيمة والاستقلال العلمي، وليس حصة عددية تُملأ آليًا.
