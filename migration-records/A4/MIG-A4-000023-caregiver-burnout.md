# MIG-A4-000023 — إجهاد مقدم الرعاية داخل الأسرة

- Agent/lane: **A4 — الطفل والأسرة والمدرسة**
- Claim: **#69** `[MIG-CLAIM][A4][caregiver-burnout]`
- Canonical key / slug: `caregiver-burnout`
- Final canonical: `/content/caregiver-burnout`
- CMS content ID: `b452ae83-ce82-437c-98f3-4197fe654035`
- Final status: **published**
- Working branch: `migration-agent-4-child-family-education`

## Canonical and ownership decision

This page is an A4 family-system canonical about stress and depletion in **family/informal caregivers**. It is not a psychiatric diagnosis page and does not attempt to diagnose depression, anxiety, or a burnout disorder. Where a specific disability or special-needs condition is the central topic, that condition remains with A3; this page stays focused on the caregiver/family system.

Before continuing the existing Claim, GitHub Issues, the central `docs/MIGRATION-PROGRESS.md`, and Supabase were checked again for the Arabic title, slug, English synonyms and caregiver-stress variants. No competing canonical, slug, alias, redirect or open competing A4 claim was found. Claim #69 was therefore continued rather than creating a second claim.

## Legacy audit

Primary legacy source:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`
- The `caregiver-burnout` card is present in the file as introduced at commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` (2026-07-20).
- The legacy card contained only a short summary, three signals, four steps, two sample phrases and one avoid note.
- No verified standalone historical public route for this exact card was established through the available repository search. No guessed redirect was created.

The old card was not copied. The new canonical was rebuilt from scratch after extracting its useful intent and discarding card-template brevity, repetition, generic warnings and any internal/process material.

## Rebuild scope

The article now covers:

- a clear non-diagnostic definition of caregiver stress;
- who counts as a family/informal caregiver;
- why burden accumulates even in supportive families;
- early signs and system-level safety warning signs;
- rest as part of the care plan rather than a reward;
- task decomposition and redistribution across family members;
- shared care plans and continuity when another person takes over;
- how to ask for concrete help;
- family conflict about fairness and invisible caregiving labor;
- guilt and the difference between love and unsustainable self-sacrifice;
- sleep and caregiver physical health;
- protecting the original relationship with the person receiving care;
- respite care and safe handover;
- work and financial strain;
- parents caring for children with intensive needs, with A3 boundary explicitly preserved;
- preventing children and adolescents from taking adult-level caregiving roles;
- support groups, counselling and caregiver training;
- thresholds for health or mental-health assessment;
- a practical 24-hour / 72-hour / one-week / two-week rebalancing plan;
- 10 search-intent FAQs.

## Sources used for enrichment

1. National Institute on Aging — *Caregiving* — https://www.nia.nih.gov/health/caregiving
2. National Institute on Aging — *Taking Care of Yourself: Tips for Caregivers* — https://www.nia.nih.gov/health/caregiving/taking-care-yourself-tips-caregivers
3. U.S. Office on Women's Health — *Caregiver stress* — https://womenshealth.gov/a-z-topics/caregiver-stress
4. CDC — *Healthy Habits: Caring for Yourself When Caring for Another* — https://www.cdc.gov/caregiving/caring-for-yourself/index.html
5. CDC — *Steps for Creating and Maintaining a Care Plan* — https://www.cdc.gov/caregiving/guidelines/index.html
6. World Health Organization — *iSupport* — https://www.who.int/teams/mental-health-and-substance-use/treatment-care/isupport/
7. WHO Europe — *WHO launches new online course to support informal caregivers across Europe* (2025-10-27) — https://www.who.int/europe/news/item/27-10-2025-who-launches-new-online-course-to-support-informal-caregivers-across-europe
8. NHS — *Help for carers* — https://www.nhs.uk/mental-health/social-care-and-your-rights/help-for-carers/

## SEO / E-E-A-T

- SEO title: `إجهاد مقدم الرعاية | دليل عملي للأسرة` — 37 chars.
- Meta description: 151 chars.
- Primary keyword: `إجهاد مقدم الرعاية`.
- Search aliases include Arabic variants plus `caregiver stress`, `caregiver burnout`, `caregiver strain`, and `family caregiver stress`.
- Search intent: `informational`.
- Author display: `فريق تحرير منصة روافد`.
- Reviewer display: `مراجعة تحريرية وعلمية — منصة روافد`.
- Reviewer credentials describe source review only and do not fabricate an individual professional identity.
- Article schema uses a single `mainEntityOfPage`: `https://healthrenewal.org/content/caregiver-burnout`.
- No featured image is assigned, so Alt is N/A rather than fabricated.

## Internal links

The page links to five live Rawafid canonicals:

- `/content/healthy-boundaries`
- `/content/family-meetings`
- `/content/parenting-team`
- `/content/financial-stress`
- `/content/family-grief`

## Redirect decision

No verified historical standalone public route was established for this exact legacy card. **No guessed redirect was created.** Active redirect count to the canonical at closure: 0.

## Workflow and final QA

Workflow completed sequentially:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

Final post-publication QA:

- useful body word tokens: **2297**
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
- SEO title length: **37**
- meta description length: **151**
- search vector present: **yes**
- forbidden TODO/FIXME/QA/agent/internal-note markers: **0**
- featured image: none; Alt N/A

No modification was made to `main` or to `docs/MIGRATION-PROGRESS.md`.