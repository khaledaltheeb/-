# MIG-000005 — اللغة

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: DRAFT BUILT — FINAL WORKFLOW / POST-PUBLISH QA PENDING
- Canonical key: `language`
- New canonical: `/content/language`
- Content type: `glossary_term`
- Supabase content id: `19279f71-abfc-42eb-b839-2ca08775e0b0`
- Database status: `draft`
- Sector/category: `knowledge` / `cognitive-processes`

## Canonical decision

هذه الصفحة تمثل المفهوم العام **اللغة (Language)** كنظام رمزي منظم يدعم التفكير والتواصل.

الكيانات التالية تبقى مستقلة:
- الكلام Speech والصوت Voice عندما تكون لهما صفحات مفاهيمية مستقلة.
- اضطرابات الكلام واللغة وDLD والاضطرابات السريرية.
- ADHD language guide — دليل لغة غير وصمية حول ADHD وليس صفحة عن اللغة بوصفها بناءً معرفيًا.
- Selective mutism — حالة/دليل مستقل.
- AAC — نظام/أداة دعم تواصل مستقل.
- صفحات التواصل في التوحد وذوي الاحتياجات الخاصة.
- الموارد التربوية/التعليمية الخاصة باللغة.

لغات الإشارة تعامل كلغات طبيعية كاملة، لا كإيماءات أو «بديل أدنى» للكلام.

## Legacy material inspected

- `terms/index.html` — منهج المعجم القديم وسياسة الفرق بين المصطلحات.
- `scripts/enrich_term_pages_v224.py` وطبقات توليد/إثراء المصطلحات.
- `adhd/language-guide/index.html` — محتوى متخصص في لغة الحديث عن ADHD؛ استُبعد من Canonical العام.
- `evidence-guides/selective-mutism-safe-guide/index.html` — كيان مستقل.
- صفحات AAC/autism/provider-assessment/special-education التي تذكر اللغة في سياق خدمات أو حالات متخصصة.
- بحث المستودع العام عن `اللغة` لكشف تداخلات المحتوى وعدم دمج الملاحظات والوثائق الداخلية.

تم استبعاد ملفات التخطيط والتدقيق والـSEO agent docs والمولدات والقوالب وأكواد GTM المكررة وكل الملاحظات الداخلية.

## Authoritative sources

1. NIMH — Language Behavior, RDoC Construct.
2. NIDCD — Speech and Language Developmental Milestones / distinction between voice, speech and language.
3. APA Dictionary — Grammar (2018).
4. APA Dictionary — Lexicon (2018).
5. Bilingualism in the Early Years: What the Science Says (2018).
6. Input and Language Development in Bilingually Developing Children (2013).
7. New Perspectives on the Neurobiology of Sign Languages (2022).
8. ASHA — Spoken Language Disorders, Cultural and Linguistic Considerations.

## Content QA

- Useful Arabic words: **1891**
- Structured blocks: **46**
- H2: **15**
- H3: **4**
- FAQ: **11**
- Tables: **2**
- Lists: **1**
- References: **8**, all HTTPS
- Tags: **7**
- Categories: **1**
- Duplicate candidates: **0**
- TODO/FIXME/agent/private-plan text: **0**
- banned term «معاقين»: **0**

## Core corrections from legacy ambiguity

- اللغة ≠ الكلام.
- التواصل أوسع من اللغة.
- لغات الإشارة لغات طبيعية كاملة.
- الثنائية/التعدد اللغوي لا يسبب اضطراب لغة بذاته.
- اللهجة واللكنة والمزج اللغوي ليست اضطرابًا لمجرد اختلافها عن لغة الاختبار.
- تقييم الطفل متعدد اللغات يحتاج تاريخ التعرض والأداء عبر لغاته ومصادر متعددة، لا اختبارًا أحادي اللغة فقط.

## SEO

- Primary entity: `اللغة`
- SEO title: `اللغة: مكوناتها وتطورها والفرق عن الكلام`
- SEO title length: **40**
- Meta description length: **152**
- Canonical: `/content/language`
- Search aliases: اللغة، language، النظام اللغوي، التطور اللغوي، اللغة الاستقبالية، اللغة التعبيرية، لغة الإشارة
- Visible FAQ → FAQPage schema
- `glossary_term` → DefinedTerm schema

## Redirect decision

لا تُحوّل صفحات ADHD language guide أو selective mutism أو AAC أو autism communication أو special education إلى `/content/language` لأنها كيانات ذات نوايا مستقلة. لا يتم تخمين أي `concept-*` URL من المولدات القديمة.

## Remaining before COMPLETE

1. Full workflow → Scheduled → Published.
2. Post-publish search/duplicate/taxonomy validation.
3. Confirm no redirect collision from specialized language/communication pages.
4. Close Claim Issue #9 and update central ledger.
