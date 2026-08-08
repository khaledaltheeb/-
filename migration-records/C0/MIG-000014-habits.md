# MIG-000014 — العادات

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **COMPLETE — PUBLISHED / POST-PUBLISH QA PASS**
- Canonical key: `habits`
- Canonical: `/content/habits`
- Content type: `glossary_term`
- Supabase content id: `6e592b09-4068-4107-9e78-4689a1b44d66`
- Final versions: **8**
- Audit events: **8**
- Database status: **published**
- Sector: `knowledge`
- Primary category: `motivation-behavior` — الدافعية والسلوك
- Published at: `2026-08-08T13:40:43Z`

## Taxonomy decision

Before building this page, C0 inspected the live knowledge-sector taxonomy. Only `cognitive-processes` and `research-evidence-learning` existed, neither of which was appropriate for a general habit construct. A new public category was therefore created and audited:

- slug: `motivation-behavior`
- name: `الدافعية والسلوك`
- id: `e5d4f285-7b76-4fc6-a419-050af1f2af0d`

It provides the correct home for general concepts such as habits, motivation, self-control and procrastination rather than forcing them into cognitive-process or research categories.

## Legacy evidence and canonical decision

The old encyclopedia generator (`scripts/scale_site_v8.py`) lists `العادات / Habits` as an independent domain in category `الدافعية والسلوك`. Literal repository search did not verify a standalone non-generated habit page; no direct old canonical URL is claimed.

The page is the general psychological habit construct. It does not consume addiction/substance-use canonicals, compulsive-behavior pages, motivation, self-control, routines or implementation intentions.

## Authoritative sources

1. APA Dictionary — Habit (2018).
2. APA Dictionary — Automaticity (2018).
3. Wood & Rünger — Psychology of Habit (Annual Review of Psychology, 2016).
4. Time to Form a Habit — systematic review/meta-analysis (2024).
5. Context Stability in Habit Building Increases Automaticity and Goal Attainment (2022).
6. Measuring context-response associations that drive habits (2023).
7. Webb & Sheeran — Does changing behavioral intentions engender behavior change? meta-analysis (2006).
8. What Makes a Habit? Investigating Potential Determinants of Habit Formation (2026).

All stored source URLs use HTTPS.

## Content coverage

- habit definition and cue-dependent automaticity
- habit versus intention versus routine
- habit versus addiction/compulsion
- automaticity without claiming loss of awareness or agency
- cue-response association learning
- types of contextual cues
- context stability
- repetition and behavioral complexity
- evidence against the “21-day rule”
- current habit-formation time evidence and its limitations
- goals and habits
- why unwanted habits persist after intentions change
- eight-step habit-building framework
- implementation intentions as a related planning tool, not a habit itself
- redesigning cues, friction and replacement responses
- habit strength measurement
- limits of apps/reminders as evidence of automaticity
- common misconceptions and 11 visible FAQ items

## Final content / SEO QA

Verified directly from Supabase before workflow:
- Searchable useful words: **1902**
- Structured blocks: **42**
- H2: **18**
- FAQ: **11**
- Tables: **2**
- Lists: **1**
- References: **8**, all HTTPS
- Tags: **7**
- Category relations: **1**
- Search aliases: **8**
- Duplicate canonical: **0**
- SEO title: `العادات: كيف تتكوّن ولماذا يصعب تغييرها` — **39 chars**
- Meta Description: **159 chars**

Internal/public-body scan:
- TODO: PASS
- FIXME: PASS
- Canonical/Redirect language: PASS
- migration/agent language: PASS
- banned term `معاقين`: PASS

## Workflow / Audit

The page passed in Supabase:
`Draft → Scientific Review → Editorial Review → SEO → Accessibility → Approved → Scheduled → Published`

No human reviewer identity or credentials were fabricated; reviewer fields remain null for this non-diagnostic glossary page.

Final database state:
- **8 versions**
- **8 audit events**
- status: **published**

## Post-publish QA

Search query `العادات` returns `/content/habits` first with score ~**5.3**.

Search query `الإدمان` remains correctly owned by the `/sectors/addiction-recovery` sector; `/content/habits` appears only as a low related result (~**0.4**) because the page explains the distinction.

- Duplicate canonical: **0**
- Redirect collisions from addiction/substance/compulsion/routine routes: **0**
- Tags/category relations: **PASS**
- Search: **PASS**

## Redirect decision

No verified standalone legacy habits URL exists, so no generated `concept-*` URL or unrelated behavioral route was redirected.

## Final result

**MIG-000014 is genuinely closed and canonicalized after database-backed QA.**
