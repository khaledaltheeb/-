# MIG-A4-000025 — المرونة النفسية الأسرية بعد الأزمات

- Lane: A4 — الطفل والأسرة والمدرسة
- Canonical key: `family-resilience`
- Canonical: `/content/family-resilience`
- Type: `article`
- Final status: **PUBLISHED / A4 QA PASS**
- Claim: #71

## Discovery and dedupe

قبل العمل فُحص GitHub Issues وسجل `docs/MIGRATION-PROGRESS.md` وSupabase بالعنوان والـslug والمرادفات العربية والإنجليزية. لم يظهر Claim منافس أو Canonical آخر لنفس الموضوع. أثناء استئناف التشغيل وُجد أن Claim #71 ما يزال مفتوحًا بينما الصفحة نفسها وصلت بالفعل إلى `published`؛ لذلك لم يُفتح Claim ثانٍ، واستُكملت الصفحة الحالية فقط حتى الإغلاق والتوثيق.

المرادفات المفحوصة شملت: المرونة النفسية الأسرية، المرونة الأسرية، مرونة الأسرة، صمود الأسرة، التكيف الأسري بعد الأزمات، تعافي الأسرة بعد الأزمة، family resilience، family resilience after crisis، family coping after crisis، resilient families.

Supabase final dedupe check: canonical rows for `/content/family-resilience` = **1**.

## Legacy cluster reviewed

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json` — مدخل `family-resilience` ضمن طبقة الأسرة.
- `khaledaltheeb/healthrenewal.org/content/v15/tips-details-v15.json` — طبقة نصائح مرتبطة بموضوعات الأسرة والأزمات، فُحصت كطبقة توسعة وليست Canonical مستقلة.
- جرى التعامل مع المادة القديمة كمصدر اكتشاف فقط؛ لم تُنسخ الصفحة القديمة كما هي.

تم استبعاد الحشو، التكرار، الملاحظات الداخلية، تعليمات الوكلاء، TODO/QA، ورسائل التوليد أو التحذيرات العامة غير الضرورية. لم يُنشأ Redirect تخميني لأن الفحص لم يثبت URL عام قديمًا مستقلًا مطابقًا يمكن تحويله بأمان.

## Rebuild and evidence

أعيد بناء الصفحة كدليل عملي للأسرة بعد الأزمات، مع فصل واضح بين الأمان الفوري وإعادة البناء، وتغطية: المعلومة المناسبة للعمر، اختلاف استجابات أفراد الأسرة، الروتين المرن، توزيع الحمل، مشاركة الأطفال دون تحويلهم إلى مقدمي رعاية، دور المدرسة، الدعم الاجتماعي، الضغط المالي والفقد والأزمات الصحية كحالات تطبيقية، دعم مقدم الرعاية، حل المشكلات، التخطيط للموجات اللاحقة، مؤشرات التعافي، متى تُطلب مساعدة مهنية، وخطة عملية لأربعة أسابيع.

المصادر الأساسية الموثقة في الصفحة = **8**، وتشمل UNICEF وCDC وWHO وAmerican Academy of Pediatrics / HealthyChildren. أُعيد التحقق خارجيًا من المصادر الرسمية في 2026-08-08، ومنها:

1. UNICEF — Parenting in an emergency: `https://www.unicef.org/parenting/parenting-in-emergencies`
2. UNICEF — Parenting in emergency contexts: `https://www.unicef.org/lac/en/parenting-lac/security-protection/parenting-emergency-context-children-safety`
3. CDC — Preventing Adverse Childhood Experiences: `https://www.cdc.gov/aces/prevention/index.html`
4. CDC — Risk and Protective Factors: `https://www.cdc.gov/aces/risk-factors/index.html`
5. WHO — Psychological first aid: Guide for field workers: `https://www.who.int/publications-detail-redirect/9789241548205`
6. WHO — Psychological first aid: `https://www.who.int/publications/i/item/psychological-first-aid`
7. AAP / HealthyChildren — Talking With Children About Disasters: `https://www.healthychildren.org/English/healthy-living/emotional-wellness/Pages/Talking-to-Children-about-Disasters.aspx`
8. CDC — Child Abuse and Neglect: Risk and Protective Factors: `https://www.cdc.gov/child-abuse-neglect/risk-factors/index.html`

## SEO / E-E-A-T

- SEO title: `المرونة الأسرية بعد الأزمات | دليل عملي`
- Meta description فريدة ومباشرة.
- Primary keyword: `المرونة النفسية الأسرية`
- Search aliases: **10**
- Secondary keywords: **5**
- Semantic terms: **10**
- Canonical: واحد فقط.
- Robots: index = true / follow = true.
- Author display: `فريق تحرير منصة روافد`.
- Reviewer metadata موجود ويصف نطاق مراجعة المصادر المؤسسية.
- Featured image: لا توجد صورة بارزة؛ لذلك Alt غير منطبق ولا يوجد Alt مفقود لصورة منشورة.
- روابط داخلية: **5** إلى صفحات مرتبطة داخل روافد.

## Final QA

- Status: **published**
- Approx. Arabic words/tokens by DB whitespace count: **2566**
- Body characters: **15640**
- Structured blocks: **70**
- H2: **23**
- H3: **7**
- Visible FAQ: **10 questions** داخل block واحد
- References: **8**
- Internal links/resources: **5**
- Tags: **5**
- Category relations: **1**
- Content versions: **7**
- Audit events: **7**
- Active redirects to canonical: **0** — intentional; no verified legacy public route was established.
- Duplicate canonical rows: **0 competitors / 1 canonical row total**
- TODO/FIXME/QA/agent instructions in final user content: **none found**

## Final decision

**COMPLETED.** الصفحة تحقق معيار A4 من حيث النطاق، الحجم، البنية، FAQ، المصادر، SEO/E-E-A-T، الروابط الداخلية، وعدم وجود Canonical مكرر. لم يُعدّل `main` ولم يُعدّل `docs/MIGRATION-PROGRESS.md`; التوثيق محصور في فرع `migration-agent-4-child-family-education` وسجل A4 هذا.