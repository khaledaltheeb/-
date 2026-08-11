# عقد خريطة الطلب التحريري لمنصة روافد

## الهدف

تحويل ملفي الطلب البحثي إلى طبقة قرار تحريرية قابلة للتدقيق، من دون إنشاء صفحة لكل صف، ومن دون تجاوز المحتوى المنشور أو المسارات القديمة أو الـCanonicals الموجودة.

## النطاق المثبت

- **4000** نية بحث واحتياج: 2000 سؤال و2000 عبارة بحث.
- **100** موضوع مصدر بعد التجميع.
- **88** هدفًا Canonical مرشحًا.
- **10** موضوعات في الدفعة التخطيطية الأولى.
- **902** رابطًا في جرد المصدر الحالي مقابل **852** سجلًا في طابور V6؛ الفرق **50** ويبقي الإصدار محجوبًا.

## ملفات المراجعة

| المسار | الوظيفة |
|---|---|
| `data/editorial-demand/editorial-demand.v1.summary.json` | إحصاءات الإدخال، العقد الحاكم، وبصمات ملفات المصدر. |
| `data/editorial-demand/editorial-topic-crosswalk.v1.index.json` | فهرس موقّع لأجزاء خريطة الموضوعات. |
| `data/editorial-demand/crosswalk-parts/*.csv` | مئة صف قابلة للمراجعة، موزعة على خمسة ملفات من 20 صفًا. |
| `data/editorial-demand/special-needs-inclusive-batch-001.plan.json` | أول عشرة أهداف مع قرار المسار والتنسيق المطلوب. |
| `data/editorial-demand/legacy-inventory-reconciliation.v1.json` | قفل فرق الجرد ومنع ادعاء اكتمال الترحيل. |
| `data/editorial-demand/artifact-manifest.v1.json` | أحجام وبصمات SHA-256 لكل ملف داخل سطح المراجعة. |
| `scripts/validate_editorial_demand_manifest.py` | بوابة تحقق مستقلة لا تكتب إلى قاعدة البيانات. |

الحمولة الكاملة المضغوطة ومصنف التدقيق يحتفظ الـManifest ببصماتهما وأحجامهما، بينما يبقى سطح طلب السحب نصيًا وقابلًا للمراجعة.

## قواعد غير قابلة للتجاوز

1. صف الإكسل دليل طلب، وليس تفويضًا بإنشاء URL.
2. لا تنشأ صفحة قبل فحص المحتوى الحالي، المصدر القديم، الـRedirects، والـCanonical المنافس.
3. المرادفات والتهجئات المختلفة تندمج في Canonical واحد.
4. السؤال الذي لا يملك نية مستقلة يصبح قسمًا أو FAQ داخل صفحة أم.
5. روابط ملفات الطلب نقطة بدء للبحث، وليست ببليوغرافيا نهائية.
6. كل صفحة تحتاج Claim-to-Source Map ومراجعة علمية وتحريرية وSEO وإتاحة.
7. لا يسمح هذا المسار بأي Supabase DML أو نشر إنتاجي إلى Cloudflare.
8. تبقى بوابة الإصدار محجوبة حتى يصبح فرق الجرد صفرًا أو تكون جميع الفروقات مفسرة ومصنفة.

## أنواع القرارات

- `condition`: مرجع حالة أو اضطراب.
- `capability`: حالة نمائية أو إعاقة أو احتياج وظيفي ضمن نظام القدرات.
- `guide`: نية عملية مستقلة للمستخدم أو الأسرة أو المعلم أو المختص.
- `comparison`: فرق حقيقي بين مفهومين أو نظامين.
- `landing_page`: بوابة تنظيمية ذات وظيفة واضحة.
- `assessment`: أداة قياس موثقة لا تقدم نفسها كتشخيص.

## الدفعة الأولى

1. تجنب المطالب PDA/EDA.
2. ADHD لدى الفتيات والتشخيص المتأخر.
3. اجتماع التوحد وADHD.
4. الإخفاء أو التمويه التوحدي.
5. اضطراب اللغة النمائي ومهارات القراءة.
6. رفاه الطالب التوحدي في المدرسة.
7. التوحد وADHD والمعالجة الحسية.
8. الاحتراق التوحدي.
9. تدخلات اللغة الصفية في DLD.
10. التشخيص المتأخر للتوحد.

هذه أهداف بحث وفحص Canonical، وليست صفحات جاهزة للنشر.

## التحقق

```bash
python -m py_compile scripts/validate_editorial_demand_manifest.py
python scripts/validate_editorial_demand_manifest.py \
  --summary data/editorial-demand/editorial-demand.v1.summary.json \
  --crosswalk-index data/editorial-demand/editorial-topic-crosswalk.v1.index.json \
  --batch-plan data/editorial-demand/special-needs-inclusive-batch-001.plan.json \
  --reconciliation data/editorial-demand/legacy-inventory-reconciliation.v1.json \
  --artifact-manifest data/editorial-demand/artifact-manifest.v1.json
```

التحقق العادي يجب أن ينجح مع إظهار `release_gate: blocked`. أما إضافة `--require-reconciled` فيجب أن تفشل حاليًا، لأن الفرق ما زال 50.
