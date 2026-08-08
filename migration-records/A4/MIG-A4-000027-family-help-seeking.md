# MIG-A4-000027 — متى وكيف تطلب الأسرة مساعدة مهنية

- **Agent / lane:** A4 — الطفل والأسرة والمدرسة
- **Branch:** `migration-agent-4-child-family-education`
- **Claim:** #73 — `[MIG-CLAIM][A4][family-help-seeking]`
- **Canonical key / slug:** `family-help-seeking`
- **Canonical URL:** `/content/family-help-seeking`
- **Final title:** متى وكيف تطلب الأسرة مساعدة مهنية: دليل عملي لاختيار الدعم المناسب
- **Final status:** `published`
- **Completed:** 2026-08-08

## Pre-claim deduplication

Checked before opening the single claim:

1. GitHub Issues for canonical key, slug and Arabic/English synonyms — no competing claim found.
2. `docs/MIGRATION-PROGRESS.md` on `legacy-migration-audit` — no completed canonical for this topic.
3. Supabase `content` for canonical, slug, title and search aliases — no competing canonical found.

The page remains an A4 service-navigation/family-decision guide. It does not diagnose a psychiatric condition; diagnosis-specific content belongs to A1, and special-needs-central content remains A3.

## Legacy audit

Verified legacy source:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`
- Legacy slug: `family-help-seeking`
- Legacy title: `متى وكيف تطلب الأسرة مساعدة مهنية`
- Legacy summary focused on choosing support and preparing for a first appointment.
- Legacy signals included functional disruption, safety risk and persistence despite serious home attempts.
- Legacy steps included preparing examples/dates, defining an initial goal, asking about qualifications/privacy and reviewing the plan.
- The source path history begins at commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` dated 2026-07-20.

The short legacy card was not copied forward as article body. The canonical was rebuilt from scratch around service selection, preparation, privacy, coordination, quality checks and follow-up.

No independently verified historical public URL for this exact topic was established. Therefore no speculative redirect was created.

## Editorial rebuild

The final page covers:

- deciding when help is reasonable using severity, persistence and functional impairment;
- describing the functional problem rather than self-diagnosing;
- choosing the first appropriate door: pediatric/primary care, school, mental-health specialist or family service;
- the school's role as a source of information and support rather than a replacement for health assessment;
- verifying credentials, scope, age group and treatment fit;
- preparing concise information for the first appointment;
- setting a measurable initial goal;
- explaining confidentiality and its safety/legal limits to children and adolescents;
- preparing a child for an assessment without framing it as punishment;
- responding when a child/adolescent resists help;
- reducing stigma around professional support;
- distinguishing support, assessment, diagnosis and treatment;
- reviewing progress and knowing when a second opinion is reasonable;
- addressing practical access barriers such as cost, transport and waiting lists;
- handling parental disagreement about seeking help;
- recognizing when the family system should be addressed alongside the individual;
- questions families can use to test service quality;
- separating urgent safety pathways from routine appointments;
- a five-step implementation plan.

The page deliberately avoids diagnosing any specific mental disorder and avoids converting general distress into pathology.

## Evidence base

Primary/reliable sources used in the published page:

1. CDC — *Treating Children's Mental Health with Therapy* — https://www.cdc.gov/children-mental-health/treatment/index.html
2. CDC — *About Children's Mental Health* — https://www.cdc.gov/children-mental-health/about/index.html
3. UNICEF — *When to help your teen find mental health support* — https://www.unicef.org/parenting/mental-health/when-help-your-teen-find-mental-health-support
4. UNICEF — *Mental health and well-being* — https://www.unicef.org/parenting/mental-health-and-well-being
5. UNICEF — *How to protect your family's mental health* — https://www.unicef.org/parenting/mental-health/how-to-protect-family-mental-health
6. UNICEF — *Support for parenting* — https://www.unicef.org/support-parenting
7. WHO Europe — *Addressing child and adolescent mental health* — https://www.who.int/europe/health-topics/mental-health/addressing-child-and-adolescent-mental-health
8. American Academy of Pediatrics / HealthyChildren.org — *Urgent Care, ER or Pediatrician? A Parent Guide* — https://www.healthychildren.org/English/family-life/health-management/Pages/urgent-care-ER-or-pediatrician-a-parent-guide.aspx

## SEO / E-E-A-T

- One CMS page title functions as the single H1.
- H2: 23.
- H3: 5.
- FAQ: 10 genuine intent-serving questions.
- SEO title: `طلب المساعدة المهنية للأسرة | دليل عملي` — 39 characters.
- Meta description: 153 characters.
- Primary keyword: `طلب المساعدة المهنية للأسرة`.
- Arabic and English search aliases populated.
- Author and scientific/editorial review attribution populated.
- `last_reviewed_at`, references, disclaimer, canonical, robots index/follow and schema.org Article metadata populated.
- Search vector generated successfully.

## Internal links / media / redirects

Five internal links were added:

- `/content/when-child-needs-help`
- `/content/emotional-safety`
- `/content/caregiver-burnout`
- `/content/family-meetings`
- `/content/family-resilience`

No featured image is assigned; image alt is therefore not applicable.

No redirect was created because no verified standalone historical public route for this topic was established. Guessed redirects are prohibited by the migration runbook.

## Final QA

Supabase verification after publication:

- status: `published`
- canonical: `/content/family-help-seeking`
- canonical matches: **1**
- useful Arabic word-like tokens: **2387**
- content blocks: **67**
- H2: **23**
- H3: **5**
- FAQ: **10**
- references: **8**
- internal links: **5**
- tags: **5**
- category relations: **1**
- content versions: **7**
- audit events: **7**
- active redirects to canonical: **0** (intentional; no verified legacy public route)
- TODO/FIXME/QA/agent/internal-note patterns: **0**
- search vector: ready
- schema `mainEntityOfPage`: `https://healthrenewal.org/content/family-help-seeking`

Workflow completed sequentially: `draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`.

## Governance

- No change to `main`.
- No change to `docs/MIGRATION-PROGRESS.md`.
- Documentation is confined to `migration-records/A4` on the owned A4 branch.
