# MIG-A4-000022 — الحزن والفقد داخل الأسرة

- Agent/lane: **A4 — الطفل والأسرة والمدرسة**
- Claim: **#67** `[MIG-CLAIM][A4][family-grief]`
- Canonical key / slug: `family-grief`
- Final canonical: `/content/family-grief`
- CMS content ID: `5679f6d7-60cb-4f43-9b56-f10b4602f82f`
- Final status: **published**
- Working branch: `migration-agent-4-child-family-education`

## Canonical and ownership decision

This canonical covers **family-system bereavement after a death**: differences in grieving within one family, role redistribution, supporting children without parentification, routines, school coordination, memory/rituals, caregiver support, anniversaries, and thresholds for professional help.

It is intentionally distinct from the existing `/content/child-grief`, which is child-specific. GitHub Issues, `docs/MIGRATION-PROGRESS.md`, and Supabase were checked before Claim creation. No competing `family-grief` canonical, slug, alias, or redirect was found. Pure diagnostic treatment of prolonged grief disorder is outside this A4 page; the page mentions it only to prevent self-diagnosis and directs diagnostic assessment to qualified care.

## Legacy audit

Primary legacy source:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`
- The `family-grief` entry originated in commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` dated 2026-07-20.
- Git history for that file showed this as its introduction point; repository search did not establish a verified standalone historical public route for `family-grief`.

The legacy entry was a short card-level summary. It was not copied as the final article. The canonical was rebuilt from scratch, removing card-template brevity and avoiding generic warnings, internal notes, agent instructions, TODO/QA text, and duplicated child-grief material.

## Rebuild scope

The article was rebuilt around useful family intent, including:

- a clear distinction between grief/bereavement and a psychiatric diagnosis;
- why bereavement affects the family system, not only individual mood;
- different grief styles within one household;
- age-appropriate truthful communication with children;
- preventing children from becoming emotional caretakers for adults;
- maintaining predictable routines without pretending nothing changed;
- practical task and role redistribution after loss;
- memorial rituals without coercion;
- why grief “stages” should not be used as a mandatory linear timetable;
- conflict management between grieving relatives;
- school coordination for children and adolescents;
- common sleep, concentration, somatic and behavioral changes;
- traumatic or sudden loss as a reason for additional assessment when function is impaired;
- caregiver support and sibling needs;
- a phased family action plan for early weeks and following months;
- 10 search-intent FAQs.

## Sources used for enrichment

1. American Academy of Pediatrics — *Supporting the Grieving Child and Family: Clinical Report* — https://publications.aap.org/pediatrics/article/154/1/e2024067212/197497/Supporting-the-Grieving-Child-and-Family-Clinical
2. American Academy of Pediatrics — *Supporting the Family After the Death of a Child or Adolescent* — https://publications.aap.org/pediatrics/article/152/6/e2023064426/195659/Supporting-the-Family-After-the-Death-of-a-Child
3. UNICEF Parenting — *How to talk to your children about the death of a loved one* — https://www.unicef.org/parenting/child-care/how-talk-your-children-about-death-loved-one
4. SAMHSA — *Coping with Bereavement and Grief* — https://www.samhsa.gov/communities/coping-bereavement-grief
5. SAMHSA — *Fact Sheet for People Helping Children and Youth Survivors of Loss* — https://library.samhsa.gov/product/fact-sheet-people-helping-children-and-youth-survivors-loss/pep25-01-005
6. National Child Traumatic Stress Network — *The Power of Parenting: How to Help Your Child After a Parent or Caregiver Dies* — https://www.nctsn.org/node/1954
7. National Child Traumatic Stress Network — *Traumatic Grief — Effects* — https://www.nctsn.org/what-is-child-trauma/trauma-types/traumatic-grief/effects
8. NHS — *Get help with grief after bereavement or loss* — https://www.nhs.uk/mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/grief-bereavement-loss/

## SEO / E-E-A-T

- SEO title: `الحزن والفقد داخل الأسرة | دليل عملي للأسرة` — 43 chars.
- Meta description: 153 chars after release-gate correction.
- Search aliases include Arabic and English family-bereavement variants.
- Primary keyword: `الحزن والفقد داخل الأسرة`.
- Search intent: `informational`.
- Author display: `فريق تحرير منصة روافد`.
- Reviewer display: `مراجعة تحريرية وعلمية — منصة روافد`.
- Reviewer credentials explicitly describe source review of AAP, UNICEF, SAMHSA, NCTSN and NHS; no fabricated individual credential is asserted.
- Article schema uses one `mainEntityOfPage` at `https://healthrenewal.org/content/family-grief`.
- No featured image exists for this article, so image Alt is N/A rather than fabricated.

## Internal links

The page links to five live related Rawafid canonicals:

- `/content/child-grief`
- `/content/emotional-safety`
- `/content/active-listening`
- `/content/family-meetings`
- `/content/when-child-needs-help`

## Redirect decision

No verified historical standalone public route for this exact topic was established. **No guessed redirect was created.** Redirect count to this canonical at closure: 0.

## Workflow and final QA

Workflow completed sequentially:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

The release gate initially rejected the SEO transition because the draft meta description was 147 characters. The Claim remained open; the description was corrected to 153 characters, synchronized with Article schema, versioned/audited, and the full workflow then completed.

Final post-publication QA:

- useful body word tokens: **2263**
- structured blocks: **65**
- H1: **1** (page title)
- H2: **23**
- H3: **4**
- FAQs: **10**
- authoritative references: **8**
- internal links: **5**
- canonical matches: **1**
- active redirects: **0**
- tags: **5**
- primary category relations: **1**
- content versions: **8**
- audit events: **8**
- SEO title length: **43**
- meta description length: **153**
- forbidden TODO/FIXME/QA/agent/internal-note markers: **0**
- featured image: none; Alt N/A

No modification was made to `main` or to `docs/MIGRATION-PROGRESS.md`.