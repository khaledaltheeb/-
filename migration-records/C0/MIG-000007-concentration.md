# MIG-000007 — التركيز

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key: `concentration`
- New canonical: `/content/concentration`
- Content type: `glossary_term`
- Supabase content id: `0c9e25ae-74ca-407e-850a-5558b2a75d11`
- Final version: **v9**
- Database status: **published**
- Sector/category: `knowledge` / `cognitive-processes`
- Published at: `2026-08-08T12:47:11Z`

## Canonical decision

`التركيز (Concentration)` هو توجيه/تثبيت الموارد الذهنية على هدف مركزي، بينما `الانتباه (Attention)` بناء معرفي أوسع يشمل الانتقاء والتوجيه والتقسيم والاستمرار والتحكم في التداخل.

قبل إنشاء هذه الصفحة أزيلت كلمة `التركيز` من `search_aliases` و`secondary_keywords` الخاصة بـ`/content/attention` لأن سجل الانتباه كان قد قرر أن التركيز مصطلح قريب وليس مرادفًا كاملًا. تم الإصلاح بطريقة Versioned وأصبحت صفحة الانتباه v9، مع Audit مستقل.

الكيانات المستقلة التي لم تُدمج:
- `/content/attention`
- أدوات sustained/selective/divided attention وattention-switch
- `/quick-info/focus-break-vs-digital-distraction/`
- صفحات ADHD أو الحالات الطبية/النمائية التي يرد فيها ضعف التركيز كعرض.

## Legacy material inspected

- مولد الموسوعة القديم الذي يسجل `التركيز / Concentration` كموضوع مستقل عن `الانتباه / Attention`.
- `quick-info/focus-break-vs-digital-distraction/index.html` — احتُفظ بفكرة الفرق بين الاستراحة المقصودة والتشتت الرقمي، وبقيت المقالة كنية بحث مستقلة.
- طبقات أدوات الانتباه والمختبر المعرفي للمقارنة بين المفهوم العام والمهام الاختبارية.

تم استبعاد GTM/GA4 المكرر، القالب، كود النشر، الملاحظات الداخلية، والتنبيهات العامة المكررة.

## Authoritative sources

1. APA Dictionary of Psychology — Concentration (updated 2018).
2. NIMH RDoC — Attention construct.
3. NIMH — Behavioral Assessment Methods for RDoC Constructs.
4. Mind-wandering increases in frequency over time during task performance — individual-participant meta-analysis (2024).
5. Impact of one night of sleep restriction on sleepiness and cognitive function — systematic review and meta-analysis (2024).
6. The metacognition of vigilance: Using self-scheduled breaks to improve sustained attention (2024).
7. How to refocus attention on working memory representations following interruptions (2022).
8. Sustaining attention to simple tasks — meta-analytic review (2013).

All stored URLs use HTTPS.

## Content QA

- Searchable useful words: **1766**
- Structured blocks: **49**
- H2: **15**
- H3: **4**
- FAQ: **11**
- Tables: **2**
- Lists: **1**
- References: **8**, all HTTPS
- Tags: **6**
- Categories: **1**
- Duplicate canonical: **0**
- Final versions: **9**
- Audit events: **9**
- Internal-language scan:
  - TODO: PASS
  - FIXME: PASS
  - Canonical/Redirect in public body: PASS
  - migration/agent language: PASS
  - banned term `معاقين`: PASS

The initial draft contained two internal canonicalization sentences. They were removed before workflow and recorded as v2 with an audit event.

## SEO

- Primary entity: `التركيز`
- SEO title: `التركيز: كيف نحافظ عليه وما الذي يشتته`
- SEO title length: **38**
- Meta description length: **151**
- Search aliases: **6**
- Canonical: `/content/concentration`
- Search intent: `informational`
- Visible FAQ → FAQPage schema
- `glossary_term` → DefinedTerm schema

## Workflow / Audit

Passed:
`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

No human reviewer identity or credentials were fabricated; reviewer fields remain null for this non-diagnostic glossary page.

## Post-publish QA

Search query `التركيز`:
1. `/content/concentration` — score ~9.3
2. `/content/focus-groups` — score ~4.6
3. `/content/attention` — score 1.0

Search query `الانتباه`:
1. `/content/attention` — score 13
2. `/content/concentration` — score ~2.9

This confirms bidirectional semantic separation without search cannibalization.

- Duplicate canonical: **0**
- Redirect collision from `/content/attention`: **0**
- Redirect collision from `/quick-info/focus-break-vs-digital-distraction/`: **0**
- Search: **PASS**
- Taxonomy/tags: **PASS**

## Redirect decision

No verified old standalone concentration canonical URL was found. No generated `concept-*` URL was guessed. The digital-focus quick-info page remains separate and receives no redirect.

## Renumbering note

This page was initially documented locally as `MIG-000006` while another parallel C0 process completed `الوظائف التنفيذية` and legitimately occupied `MIG-000006`. To preserve a unique migration ledger, this record was renumbered to **MIG-000007**. The published content id and canonical URL did not change.

## Final result

**MIG-000007 is closed and canonicalized.**
