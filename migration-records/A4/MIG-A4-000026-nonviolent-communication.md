# MIG-A4-000026 — التواصل غير العنيف في الأسرة

- **Agent / lane:** A4 — الطفل والأسرة والمدرسة
- **Branch:** `migration-agent-4-child-family-education`
- **Claim:** #72 — `[MIG-CLAIM][A4][nonviolent-communication]`
- **Canonical key / slug:** `nonviolent-communication`
- **Canonical URL:** `/content/nonviolent-communication`
- **Final title:** التواصل غير العنيف في الأسرة: دليل عملي لتقليل اللوم والتصعيد
- **Final status:** `published`
- **Completed:** 2026-08-08

## Pre-claim deduplication

Checked before creating the single claim:

1. GitHub Issues for slug, canonical key, Arabic/English synonyms — no competing claim found.
2. `docs/MIGRATION-PROGRESS.md` on `legacy-migration-audit` — no completed canonical for this topic.
3. Supabase `content` for canonical/slug/title/aliases — no competing canonical found.

Potential nearby topic `screens-child` was not merged with this topic; it concerns children's screen use rather than the general family communication framework.

## Legacy audit

Verified legacy source:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`
- Legacy article slug: `nonviolent-communication`
- Legacy title: `التواصل غير العنيف في البيت`
- Earliest and only commit affecting this source path found in repository history: `9a7e7444acbca06bc50dbcbadeb3119398abd61b`, 2026-07-20.

The legacy item was a short summary/signals/steps/phrases entry. It was not copied forward as body content. The new canonical was rebuilt from scratch. Repository search also surfaced a generated quick-info script layer, but no independently verified historical public URL for this exact topic was established.

## Editorial rebuild

Removed/avoided:

- generic filler and repeated advice;
- personality labels and intent-reading in examples;
- internal notes, TODO/FIXME/QA, agent instructions;
- excessive warnings;
- presenting Nonviolent Communication (NVC) as a validated standalone family therapy.

The rebuilt page distinguishes observation from judgment, feelings from accusations, needs from solutions, requests from limits, and listening from agreement. It includes age-specific applications for young children, school-age children, and adolescents, plus escalation timing, boundaries, safety, practical rewrites of conflict statements, implementation habits, and criteria for additional support.

## Evidence base

Primary/reliable sources used in the published page:

1. World Health Organization — *WHO guidelines on parenting interventions to prevent maltreatment and enhance parent–child relationships* — https://www.who.int/publications/i/item/9789240065505
2. World Health Organization — Parenting guidelines and handbook — https://www.who.int/teams/social-determinants-of-health/violence-prevention/parenting-guidelines
3. American Academy of Pediatrics / HealthyChildren.org — *Improving Family Communications* — https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/pages/Improving-Family-Communications.aspx
4. American Academy of Pediatrics / HealthyChildren.org — *Communication Dos and Don'ts* — https://www.healthychildren.org/english/family-life/family-dynamics/communication-discipline/pages/communication-dos-and-donts.aspx
5. American Academy of Pediatrics / HealthyChildren.org — *Communication Skills Start at Home* — https://www.healthychildren.org/English/family-life/family-dynamics/communication-discipline/Pages/Components-of-Good-Communication.aspx
6. CDC — *Tips for Communicating With Your Child* — https://www.cdc.gov/parenting-toddlers/communication/index.html
7. CDC — *Tips for Active Listening* — https://www.cdc.gov/parenting-toddlers/communication/active-listening.html
8. UNICEF — *Parenting of Adolescents Programming Guidance* — https://www.unicef.org/documents/parenting-adolescents-programming-guidance
9. UNICEF — *Care for Child Development* — https://www.unicef.org/documents/care-child-development
10. Center for Nonviolent Communication — *Certification Preparation Packet* — https://www.cnvc.org/images/pdf/certification/EN-Certification%20Preparation%20Packet.pdf

## SEO / E-E-A-T

- One page title acts as the single H1 in the CMS renderer.
- 24 H2 and 3 H3 blocks.
- 10 genuine FAQ items mapped to search intent.
- SEO title length: 40 characters.
- Meta description length: 155 characters.
- Primary keyword: `التواصل غير العنيف في الأسرة`.
- Arabic and English search aliases added.
- Visible author and scientific/editorial review attribution added.
- `last_reviewed_at`, references, schema.org Article metadata, canonical, robots index/follow, and disclaimer populated.
- Search vector generated successfully.

## Internal links / media / redirects

Five internal links were added to related published canonicals:

- `/content/active-listening`
- `/content/conflict-repair`
- `/content/healthy-boundaries`
- `/content/emotional-safety`
- `/content/family-meetings`

No featured image is assigned, therefore image alt is not applicable. No redirect was created because no verified standalone historical public URL for this exact topic was established; guessed redirects are prohibited by the runbook.

## Final QA

Supabase final verification after publication:

- status: `published`
- canonical matches: **1**
- useful Arabic word-like tokens in body: **2236**
- blocks: **67**
- H2: **24**
- H3: **3**
- FAQ: **10**
- scientific/reliable references: **10**
- internal links: **5**
- tags: **5**
- primary category relations: **1**
- content versions: **7**
- audit events: **7**
- active redirects to canonical: **0** (intentional; no verified legacy public route)
- TODO/FIXME/QA/agent/internal-note patterns: **0**
- search vector: ready
- schema `mainEntityOfPage`: `https://healthrenewal.org/content/nonviolent-communication`

Workflow completed sequentially: `draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`.

## Governance

- No change to `main`.
- No change to `docs/MIGRATION-PROGRESS.md`.
- Documentation is confined to `migration-records/A4` on the owned A4 branch.
