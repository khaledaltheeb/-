# MIG-000009 — اتخاذ القرار

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical: `/content/decision-making`
- Content type: `glossary_term`
- Supabase content id: `c17e7ccf-0a24-4cb7-b945-bd6f94b8f3bc`
- Category: `cognitive-processes`
- Final versions: **10**
- Audit events: **10**
- Published at: `2026-08-08T13:07:46Z`

## Governance correction

GitHub Issue #15 title correctly referred to decision-making, but its previous body had been accidentally overwritten with creativity data and falsely marked complete. Direct Supabase verification showed the actual decision-making page was `draft`, with only **1 version and 1 audit event**, **670 searchable words**, and a **166-character** Meta Description.

The Claim was restored to the correct canonical and reopened. The draft was then expanded substantively with sections on:
- multi-criteria trade-offs,
- value of additional information,
- sensitivity analysis under uncertain estimates,
- reversible experiments for low-risk choices,
- decision journals and outcome bias,
- group disagreement over facts versus values,
- stopping rules for information search.

The Meta Description was corrected to **153 characters**.

The first workflow attempt was correctly blocked by the database release gate because the SEO title was **48 characters** while the branded contract permits at most **47** before the brand suffix. The transaction rolled back completely. The SEO title was corrected to **43 characters**, creating v3 before the successful workflow.

## Canonical decision

هذه الصفحة للمفهوم العام **اتخاذ القرار**. تبقى مستقلة عنها صفحات الاستدلال، حل المشكلات، التحيزات المعرفية، أدوات المخاطر، القرار السريري، والقرارات العامة/السياسات.

## Legacy audit

تم فحص طبقات المستودع القديم حول decision-making biases، risky choice، public-decision biases، صفحات reasoning/problem-solving ومولدات الموسوعة. لم تُنقل القوالب أو التعليمات الداخلية أو الملاحظات أو الصفحات ذات النية المستقلة.

## Sources

1. APA Dictionary — Decision Making.
2. APA Dictionary — Framing Effect.
3. APA Dictionary — Prospect Theory.
4. APA Dictionary — Risk.
5. APA Dictionary — Heuristic.
6. NIMH — Cognitive Control.
7. Diamond — Executive Functions.
8. Harvard Center on the Developing Child — Executive Function guide.

All stored URLs are HTTPS.

## Final content / SEO QA

Verified directly from Supabase:
- Searchable useful words: **2161**
- Structured blocks: **53**
- H2: **25**
- FAQ: **11**
- References: **8**, all HTTPS
- Tags: **8**
- Category relations: **1**
- SEO title: `اتخاذ القرار: المخاطر والاحتمالات والاختيار` — **43 chars**
- Meta Description: **153 chars**
- Duplicate canonical: **0**
- Forbidden/internal text: **0** for TODO, FIXME, Canonical, Redirect, migration/agent language and banned terminology.

## Content coverage

- options, outcomes, probabilities, values and constraints
- certainty, risk and uncertainty
- expected value and utility
- prospect theory / reference points / loss aversion
- framing effects
- base rates and conditional probability
- anchoring and availability
- emotion and decision state
- fast vs deliberate decisions
- outcome bias
- multi-criteria trade-offs
- value of information
- sensitivity analysis
- reversible vs irreversible choices
- decision journal
- group decision structure
- stopping rules
- shared decision making
- practical decision framework and decision table
- common errors and visible FAQ

## Workflow / Audit

The page actually passed in Supabase:
`Draft → Scientific Review → Editorial → SEO → Accessibility → Approved → Scheduled → Published`
with version and audit snapshots.

No human reviewer identity was fabricated.

Final database state:
- **10 versions**
- **10 audit events**
- status: **published**

## Post-publish QA

Search query `اتخاذ القرار` returns `/content/decision-making` first with score ~5.71.

Related results remain correctly separate:
- `/content/reasoning` lower (~0.51)
- `/content/problem-solving` lower (~0.22)

- Duplicate canonical: **0**
- Redirect collisions from reasoning/problem/bias routes: **0**
- Tags/category relations: **PASS**
- Search: **PASS**

## Redirect decision

No generated legacy `concept-*` URL was guessed. Distinct related pages remain separate.

## Final result

**MIG-000009 is now genuinely closed and canonicalized after database-backed QA.**
