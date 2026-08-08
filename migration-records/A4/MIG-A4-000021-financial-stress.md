# MIG-A4-000021 — الضغط المالي وتأثيره النفسي على الأسرة

- Agent/lane: A4 — الطفل والأسرة والمدرسة
- Claim: #66
- Canonical key: `financial-stress`
- Final canonical: `/content/financial-stress`
- CMS content ID: `fd5ce20f-2017-4967-84cc-17a938646675`
- Final status: `published`
- Migration date: 2026-08-08

## Collision and legacy audit

Before the Claim, GitHub Issues, the C0-owned migration progress snapshot, and Supabase were searched for the slug, canonical, Arabic synonyms (الضغط المالي على الأسرة، التوتر المالي، الضائقة المالية الأسرية، القلق المالي للأسرة، المشكلات المالية والأسرة) and English synonyms (family financial stress, financial strain, financial hardship, money stress, economic stress family). No competing Claim or CMS canonical was found.

The original seed was audited in `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`. It contained only a short summary, three signals, four steps, two phrases and one avoid note. A wider repository search for the Arabic phrase found the family-sector collection page and the v249 family generation/upgrade layer, plus unrelated money/stress mentions. No exact standalone public legacy URL equivalent to the final canonical was verified, so no redirect was guessed.

## Rebuild

The seed was not copied. The page was rebuilt around the actual family search intent: definition of family financial stress, how children perceive it, poverty versus personal blame, age-appropriate disclosure, avoiding parentification/financial mediation, adult money meetings, prioritising essentials, creating one shared financial picture, couple conflict, protecting routines, handling children’s purchase requests, school barriers, shame and social comparison, low-cost family connection, shock planning, early support, caregiver mental health, child warning signs, a two-week decision plan, privacy versus secrecy, and escalation to trusted financial/social/legal or mental-health support when needed.

The page explicitly avoids personalised investment, debt, legal or financial instructions. It is educational family content, not financial advice.

## Evidence set

1. American Psychological Association — *Are your kids stressed about family finances?*.
2. American Psychological Association — *Money*.
3. UNICEF — *The State of the World’s Children 2025: Ending child poverty*.
4. UNICEF Innocenti — *Unequal Chances: Children and economic inequality* (May 2026).
5. UNICEF — *Support for parenting*.
6. Consumer Financial Protection Bureau — *Why financial well-being?*.
7. CDC — *Risk and Protective Factors — Adverse Childhood Experiences*.
8. American Academy of Pediatrics / HealthyChildren — *Helping Children Handle Stress*.

## SEO / content / E-E-A-T

- H1: `الضغط المالي وتأثيره النفسي على الأسرة: دليل عملي` (CMS title).
- final useful body/search text: 2014 whitespace tokens.
- structured blocks: 67.
- H2: 24.
- H3: 4.
- FAQ: 10.
- references: 8.
- internal links: 4 (`family-meetings`, `parenting-team`, `emotional-safety`, `active-listening`).
- SEO title: `الضغط المالي والأسرة | دليل عملي لحماية الأطفال` — 47 characters.
- meta description: 150 characters.
- canonical matches in CMS: 1.
- search aliases, primary keyword, secondary keywords, semantic terms, Article schema, audience, visible editorial author, source-review credentials and review date are populated.
- featured image: none; Alt therefore N/A rather than fabricated.
- disclaimer is limited to educational scope and directs users to appropriate local services when essentials, housing, safety, legal or financial issues require specialised help.

## QA correction

The first post-publication structural QA returned 1942 word tokens and H3=0. The page was **not closed** at that point. A four-part H3 decision hierarchy was added under the two-week plan, followed by another QA. Final QA returned 2014 word tokens, H2=24 and H3=4. This enrichment produced one additional content version and audit event.

## Workflow and final QA

Workflow completed sequentially:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

Final verification:

- status: `published`
- canonical: `/content/financial-stress`
- canonical matches: 1
- word tokens: 2014
- blocks: 67
- H2/H3: 24 / 4
- FAQ: 10
- references: 8
- internal links: 4
- tags: 5
- primary category relation: 1
- content versions: 8
- audit events: 8
- SEO title: 47 characters
- meta description: 150 characters
- TODO/FIXME/QA/agent/internal marker hits: 0
- redirect: none, intentionally, because no exact legacy public predecessor was verified

## Governance

Only `migration-agent-4-child-family-education` is modified by this migration record. `main` and `docs/MIGRATION-PROGRESS.md` were not modified.
