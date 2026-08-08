# MIG-000006 — التركيز

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **DRAFT QA PASS — WORKFLOW / POST-PUBLISH QA PENDING**
- Canonical key: `concentration`
- New canonical: `/content/concentration`
- Content type: `glossary_term`
- Supabase content id: `0c9e25ae-74ca-407e-850a-5558b2a75d11`
- Current version: **v2**
- Database status: `draft`
- Sector/category: `knowledge` / `cognitive-processes`

## Canonical decision

`التركيز (Concentration)` هو توجيه/تثبيت الموارد الذهنية على هدف مركزي، بينما `الانتباه (Attention)` بناء معرفي أوسع يشمل الانتقاء والتوجيه والتقسيم والاستمرار والتحكم في التداخل.

قبل إنشاء هذه الصفحة أزيلت كلمة `التركيز` من `search_aliases` و`secondary_keywords` الخاصة بـ`/content/attention` لأن سجل MIG-000002 كان قد قرر سابقًا أن التركيز مصطلح قريب وليس مرادفًا كاملًا. تم الإصلاح بطريقة Versioned وأصبحت صفحة الانتباه v9.

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
- Versions before workflow: **2**
- Internal-language scan:
  - TODO: PASS
  - FIXME: PASS
  - Canonical/Redirect in public body: PASS (removed)
  - migration/agent language: PASS
  - banned term `معاقين`: PASS

The draft originally contained two internal canonicalization sentences. They were removed before workflow and recorded as v2 with an audit event.

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

## Redirect decision

No verified old standalone concentration canonical URL has been found. No generated `concept-*` URL is guessed. The digital-focus quick-info page remains separate and receives no redirect.

## Remaining before COMPLETE

1. Pass full workflow through Scheduled → Published.
2. Verify search ranking for `التركيز` and `الانتباه` in both directions.
3. Confirm duplicate canonical = 0 and no redirect collision with the quick-info page or attention tools.
4. Close Claim Issue #89.
5. Update central migration ledger.
