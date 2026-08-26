# ترقية «لنرتقي بقدراتهم» — الموجة السابعة — 2026-08-27

هذه الموجة تكمل Wave 6 مع فصل واضح بين `reviewed_passed` وبين Gold-3 الصريح. لا تُرفع صفحة Gold-1/Gold-2 إلى Gold-3 بمجرد metadata؛ يلزم تطوير علمي ووظيفي حقيقي ثم مقارنة مع `private.capabilities_upgrade_snapshot_20260826`.

## Gold-3 — متلازمة X الهش
`capabilities-fragile-x-syndrome` — legacy rank 19
- قبل الجولة: 10,223 حرفًا، 39 كتلة، 16 مرجعًا، Gold-2/passed.
- snapshot الأصلي: 9,614 حرفًا، 43 كتلة، 10 مراجع.
- final: 15,947 حرفًا، 2,654 كلمة، 77 كتلة، 16 مرجعًا، FAQ واحد بـ12 سؤالًا.
- لم تُضف مراجع غير متحققة؛ استُخدمت المراجع الموثقة الموجودة أصلًا: GeneReviews، CDC 2026، مراجعة التواصل، مراجعة العلاجات 2024، دراسة التواصل البراغماتي 2025، ودراسات التدخل اللغوي/الأسري.
- أضيفت طبقات: الفهم مقابل التعبير، التواصل البراغماتي، AAC، القلق وفرط الاستثارة، التواصل البصري، الوظائف التنفيذية، التكرار اللفظي، القراءة والكتابة، السلوك التكيفي، المدرسة، الانتقال للرشد والعمل.
- بوابة عدم الفقد: 15,947 >= 9,614 حرفًا؛ 77 >= 43 كتلة؛ 16 >= 10 مراجع؛ canonical ثابت؛ published/index/follow محفوظة؛ 0 مراجع مكررة؛ 12 FAQ.
- `quality_upgrade_version=2026-08-27-gold-3` و`rawafid_review_status=passed`.

## Gold-3 — متلازمة رِت
`capabilities-rett-syndrome` — legacy rank 20
- قبل الجولة: 12,185 حرفًا، 55 كتلة، 18 مرجعًا، Gold-2/passed.
- snapshot الأصلي: 9,957 حرفًا، 44 كتلة، 9 مراجع.
- final: 17,897 حرفًا، 2,974 كلمة، 93 كتلة، 18 مرجعًا، FAQ واحد بـ12 سؤالًا.
- استندت الترقية إلى المراجع الموثقة الموجودة: GeneReviews MECP2 2025، مراجعة التواصل 2025، إرشادات التواصل التوافقية، مراجعة تدخلات التواصل، دراسات eye-gaze والمفردات 2024، ميتا-تحليل trofinetide 2024، توصيات الجهاز الهضمي، والميتا-تحليل العظمي 2024.
- أضيفت طبقات: فقد الكلام ≠ فقد الفهم، eye-gaze كوسيلة وصول لا اختبار ذكاء، اختبار موثوقية نعم/لا فوق الصدفة، AAC وتدريب الشريك، حركات اليد، الوضعية والجنف، الألم، التنفس، النوبات، الجهاز الهضمي، حدود trofinetide، القراءة والكتابة، المدرسة، الرشد واتخاذ القرار المدعوم.
- بوابة عدم الفقد: 17,897 >= 9,957 حرفًا؛ 93 >= 44 كتلة؛ 18 >= 9 مراجع؛ canonical ثابت؛ published/index/follow محفوظة؛ 0 مراجع مكررة؛ 12 FAQ.
- `quality_upgrade_version=2026-08-27-gold-3` و`rawafid_review_status=passed`.

## القياس العام بعد هذه الجولة
- snapshot rows: 104.
- condition pages (`legacy_rank`): 100.
- published + index + follow: 104/104.
- distinct ranks: 100.
- V7: 85/100.
- `rawafid_review_status=passed`: 58/100.
- Gold-3 الصريح + passed: 42/100.
- duplicate canonical: 0.
- missing baseline rows: 0.

## ملاحظة تحقق المصادر
تعذر البحث الخارجي اللحظي في بداية الجولة بسبب خطأ خدمة 503، لذلك لم تُخترع أو تُضاف مراجع جديدة غير متحققة. استُخدمت فقط المصادر الموجودة في `references_json` والمثبتة في قاعدة البيانات، مع الإبقاء على `source_verified_through=2026-08-26` بدل الادعاء بتحقق أحدث غير منفذ.

## التالي حسب الاستعلام الفعلي
1. `capabilities-noonan-syndrome` — rank 26 — Gold-2/passed
2. `capabilities-22q11-deletion-syndrome` — rank 29 — Gold-2/passed
3. `capabilities-sotos-syndrome` — rank 31 — Gold-2/passed
4. `capabilities-neurofibromatosis-type-1` — rank 38 — Gold-2/passed
5. `capabilities-congenital-hypothyroidism` — rank 40 — Gold-1/passed
6. `capabilities-mitochondrial-diseases` — rank 41 — غير Gold
7. `capabilities-cerebral-palsy` — rank 42 — عقد قديم
8. `capabilities-spina-bifida` — rank 43 — عقد قديم

يجب إعادة الاستعلام قبل كل تعديل لاحق لأن حالة القاعدة قد تتغير بالتوازي.
