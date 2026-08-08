# MIG-000014 — العادات

- Lane: C0 — الموسوعة والمصطلحات العامة
- Status: **DRAFT QA PASS — WORKFLOW / POST-PUBLISH QA PENDING**
- Canonical key: `habits`
- Canonical: `/content/habits`
- Content type: `glossary_term`
- Supabase content id: `6e592b09-4068-4107-9e78-4689a1b44d66`
- Current version: **v1**
- Database status: `draft`
- Sector: `knowledge`
- Primary category: `motivation-behavior` — الدافعية والسلوك

## Taxonomy decision

Before building this page, C0 inspected the live knowledge-sector taxonomy. Only `cognitive-processes` and `research-evidence-learning` existed, neither of which was appropriate for a general habit construct. A new public category was therefore created:

- slug: `motivation-behavior`
- name: `الدافعية والسلوك`
- id: `e5d4f285-7b76-4fc6-a419-050af1f2af0d`

The category creation/upsert was recorded in the audit log. It is intended to host general concepts such as habits, motivation, self-control and procrastination rather than forcing them into cognitive-process or research categories.

## Legacy evidence and canonical decision

The old encyclopedia generator (`scripts/scale_site_v8.py`) lists `العادات / Habits` as an independent domain in category `الدافعية والسلوك`. Literal repository search did not verify a standalone non-generated habit page; no direct old canonical URL is claimed.

The page is the general psychological habit construct. It does not consume:
- addiction/substance-use canonicals,
- compulsive-behavior pages,
- motivation,
- self-control,
- routines,
- implementation intentions.

These are related concepts but not synonyms.

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

## Draft QA — verified directly from Supabase

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
- Versions before workflow: **1**

Internal/public-body scan:
- TODO: PASS
- FIXME: PASS
- Canonical/Redirect language: PASS
- migration/agent language: PASS
- banned term `معاقين`: PASS

## SEO

- Primary entity: `العادات`
- SEO title: `العادات: كيف تتكوّن ولماذا يصعب تغييرها`
- SEO title length: **39 chars**
- Meta Description length: **159 chars**
- Canonical: `/content/habits`
- Search intent: `informational`
- Visible FAQ → FAQPage schema
- `glossary_term` → DefinedTerm schema

## Redirect decision

No verified standalone legacy habits URL exists, so no generated `concept-*` URL or unrelated behavioral route is redirected.

## Remaining before COMPLETE

1. Run the actual workflow through Scheduled → Published.
2. Verify search `العادات` ranks this canonical first.
3. Verify addiction-related search remains owned by addiction canonicals and habit does not cannibalize it.
4. Confirm duplicate canonical and addiction/routine redirect collisions are zero.
5. Close Claim #101 and update the central ledger.
