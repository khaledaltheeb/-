# MIG-A4-000020 — الغيرة والمنافسة بين الإخوة

- Agent/lane: A4 — الطفل والأسرة والمدرسة
- Claim: #65
- Canonical key: `sibling-jealousy`
- Final canonical: `/content/sibling-jealousy`
- CMS content ID: `8d017356-b9a9-4980-af26-8a98f094eb8f`
- Final status: `published`
- Migration date: 2026-08-08

## Pre-claim / collision audit

The active Claim was already #65 and no second A4 Claim was opened. Before CMS creation, GitHub Issues, the C0-owned `docs/MIGRATION-PROGRESS.md` snapshot, and Supabase were checked for the canonical key, slug, Arabic synonyms, and English synonyms. Supabase returned no competing content row for `sibling-jealousy`, `/content/sibling-jealousy`, or the principal Arabic aliases.

Aliases reviewed: الغيرة بين الإخوة، المنافسة بين الإخوة، صراع الإخوة، شجار الإخوة، الغيرة بين الأشقاء، sibling jealousy, sibling rivalry, sibling competition, sibling conflict.

## Legacy audit

The original A4 seed exists in `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`. Its useful substance was limited to a short summary, three signals, four steps, two suggested phrases, and one avoid note. File history shows that this family source was introduced in commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` on 2026-07-20 and has no earlier content revision for this seed.

A wider repository search for `sibling` was performed so that generated and adjacent pages were not missed. It found, among others:

- `content/sectors-v10/sibling-and-family-balance.json` and `/evidence-guides/sibling-and-family-balance/`: primarily about siblings in families where a child has developmental delay/disability, caregiver burden, privacy, transition, and sibling inclusion. This is special-needs-centered context and is not merged into this general A4 canonical; central special-needs ownership belongs to A3.
- `/sectors/family/guides/sibling-wellbeing/`: a broad generated wellbeing/planning page with a different information architecture and intent. It is related context, not a verified URL-equivalent of the jealousy/rivalry canonical.
- `scripts/family_sector_content_v249.py`: derived family-sector generation layer; `sibling` is included in the communication profile, but it does not establish a separate exact canonical for `sibling-jealousy`.

No public legacy URL was verified as an exact semantic predecessor of the final jealousy/rivalry page. Therefore no guessed redirect was created. Related but distinct sibling pages were deliberately not redirected.

## Rebuild decision

The old seed was not copied. The page was rebuilt from scratch and expanded around the actual search intent: what sibling jealousy/rivalry means, why it arises, fairness versus identical treatment, comparisons, one-to-one attention, privacy, family rules, when parents should step in, the difference between ordinary conflict and recurrent harm, conflict language, problem solving and repair, a new baby, age differences, family coalitions, repeated trigger patterns, school spillover, and escalation criteria.

Internal filler, automated-template prose, internal review notes, TODO/QA markers, agent instructions, and unnecessary generic warnings were excluded.

## Evidence enrichment

Primary/professional sources used in the CMS reference set:

1. American Academy of Pediatrics / HealthyChildren — *Sibling Relationships: How to Help Your Kids Build Healthy Bonds* — updated 2026-04-06.
2. American Academy of Pediatrics / HealthyChildren — *Preparing Your Older Child for a New Baby: How to Help Siblings Adjust* — updated 2026-02-10.
3. American Academy of Pediatrics / HealthyChildren — *Family Arguments* — updated 2025-12-16.
4. American Academy of Pediatrics / HealthyChildren — *Stepsiblings*.
5. UNICEF Uruguay — *Las peleas entre hermanos: algunas claves para evitarlas y gestionarlas* — 2025-12-02.
6. CDC — *Tips for Creating Rules*.
7. CDC — *Tips for Creating Structure and Rules*.
8. WHO — *WHO guidelines on parenting interventions*.

The page does not present sibling jealousy as a psychiatric diagnosis. Safety language is limited to distinguishing ordinary conflict from violence, fear, injury, threats, and persistent impairment.

## Content / SEO / E-E-A-T

- Visible H1 is supplied by the CMS title: `الغيرة والمنافسة بين الإخوة: دليل عملي للأسرة`.
- Structured body: 27 H2 and 7 H3.
- Useful body/search text: 2270 whitespace tokens in final CMS QA.
- FAQ: 10 intent-driven questions.
- References: 8.
- Internal links: 4 (`parenting-team`, `emotion-coaching`, `discipline-vs-punishment`, `family-meetings`).
- SEO title: `الغيرة بين الإخوة والمنافسة | دليل عملي للأسرة` — 46 characters.
- Meta description: 158 characters.
- Canonical: exactly one `/content/sibling-jealousy`.
- Search aliases, primary keyword, secondary keywords, semantic terms, audience, Article schema, visible editorial author, source-review label/credentials, and last-reviewed date are populated.
- No featured image was added; image Alt is therefore N/A rather than fabricated.
- Medical/safety disclaimer is short and specific to recurrent violence, fear, injuries, or persistent functional impact.

## CMS workflow

The page completed the required workflow sequentially:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

A content version and audit event were recorded for creation and every workflow state.

## Final QA

Verified after publication:

- status: `published`
- word tokens: 2270
- structured blocks: 78
- H2: 27
- H3: 7
- FAQ: 10
- scientific/professional references: 8
- internal links: 4
- tags: 5
- primary category relations: 1
- canonical matches in CMS: 1
- content versions: 7
- audit events: 7
- active redirects to canonical: 0 (intentional; no verified equivalent legacy route)
- SEO title length: 46
- meta description length: 158
- TODO/FIXME/QA/agent/internal instruction marker hits: 0

## Governance

Only the agent branch `migration-agent-4-child-family-education` is modified by this record. `main` and the C0-owned central progress ledger were not modified.
