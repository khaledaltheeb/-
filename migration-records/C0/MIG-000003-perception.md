# MIG-000003 — الإدراك

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: DRAFT BUILT — FINAL WORKFLOW / POST-PUBLISH QA PENDING
- Canonical key: `perception`
- New slug: `perception`
- New canonical: `/content/perception`
- Content type: `glossary_term`
- Supabase content id: `364348af-98a5-4407-9663-0e0bb5eb9354`
- Current version: v1
- Current database status: `draft`
- Sector: `knowledge` — المعرفة والموسوعة
- Primary category: `cognitive-processes` — المصطلحات والعمليات المعرفية
- Audiences: الأفراد، الأسر، المعلمون، المختصون، المتدربون
- Tags: الإدراك، المعالجة الحسية، الإدراك متعدد الحواس، العمليات المعرفية، التعلم

## Canonical decision

هذه الصفحة تمثل المفهوم المعرفي العام **الإدراك (Perception)**. لا تبتلع الصفحات المستقلة عن اضطرابات الإدراك أو الهلوسات، التوحد/المعالجة الحسية، الأدوات الحسية، أو المحتوى المتخصص في الإدراك البصري/السمعي عندما تكون له نية مستقلة قوية.

## Legacy material inspected

- `scripts/scale_site_v8.py` — يثبت وجود الإدراك كموضوع موسوعي متعدد Facets في البنية القديمة.
- `scripts/enrich_term_pages_v224.py` — يوضح أن الصفحات المعرفية القديمة كانت تتلقى طبقات إثراء عامة وقوالب قياس، وليس بالضرورة محتوى متخصصًا فريدًا لكل مصطلح.
- `scripts/publish_encyclopedia_topic_hubs_v2.py` وطبقات الموسوعة.
- نتائج البحث في صفحات حسية/سريرية/ذوي الاحتياجات الخاصة حيث يرد الإدراك كمفهوم ثانوي.

تم استبعاد كود التوليد، القوالب العامة، ملاحظات التطوير، والتنبيهات المتكررة. لم تُدمج الصفحات السريرية أو الحسية المتخصصة داخل Canonical العام.

## Authoritative sources used

1. NIMH — Perception, RDoC Construct.
2. APA Dictionary of Psychology — Perception (2018).
3. APA Dictionary of Psychology — Sensation (2018).
4. Multisensory perception constrains the formation of object categories (2023).
5. Evaluating the neurophysiological evidence for predictive processing as a model of perception (2020).
6. Prediction, perception and agency (2012).
7. Visual Influences on Auditory Behavioral, Neural, and Perceptual Processes: A Review (2021).
8. Review of visual illusion perception (2017) used narrowly to explain illusions as research tools, not to generalize clinical claims.

## Content QA

- Useful Arabic words: **1905**
- Structured blocks: **47**
- H2: **16**
- H3: **4**
- FAQ: **11**
- Tables: **1**
- Lists: **1**
- References: **8**, all HTTPS
- Tags: **5**
- Categories: **1**
- Duplicate candidates in Supabase: **0**
- TODO/FIXME/agent/private-plan text: **0**
- banned term «معاقين»: **0**

## SEO

- Primary entity: `الإدراك`
- SEO title: `الإدراك: التعريف والأنواع وكيف نبني المعنى`
- SEO title length: **42**
- Meta description length: **153**
- Canonical: `/content/perception`
- Search aliases: **6**
- Search intent: `informational`
- Visible FAQ → FAQPage schema
- `glossary_term` → DefinedTerm schema

## Redirect decision

Old generator logic proves that perception was expanded into multiple generated facets, but no standalone old URL has been verified strongly enough to create a redirect. No `concept-*` redirect is guessed from arithmetic alone.

## Remaining before COMPLETE

1. Pass full workflow without fabricating a human reviewer.
2. Publish through Scheduled.
3. Post-publish search/duplicate/taxonomy validation.
4. Confirm no redirect collision from distinct sensory/clinical pages.
5. Close Claim Issue #3 and update central ledger.
