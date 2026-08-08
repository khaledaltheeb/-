# MIG-A4-000024 — التكيف الأسري مع المرض المزمن

- Agent/lane: **A4 — الطفل والأسرة والمدرسة**
- Claim: **#70** `[MIG-CLAIM][A4][chronic-illness-family]`
- Canonical key / slug: `chronic-illness-family`
- Final canonical: `/content/chronic-illness-family`
- CMS content ID: `df2a5877-c5db-4ebe-b296-8f24a83d3303`
- Final status: **published**
- Working branch: `migration-agent-4-child-family-education`

## Canonical and ownership decision

This is an A4 family-system canonical about adapting family life, caregiving, schooling, work, routines and shared responsibilities around a chronic health condition. It is not a diagnosis page and does not define or treat a specific psychiatric disorder. If a specific disability/special-needs condition is the central subject, that condition remains with A3; if a pure psychiatric diagnosis is the central subject, it belongs to A1.

Before continuing the existing Claim, GitHub Issues, the central `docs/MIGRATION-PROGRESS.md`, and Supabase were rechecked for the Arabic title, proposed slug, English names, and major synonyms. No competing canonical, slug, alias, redirect, or open competing A4 Claim was found. Because Claim #70 was already open, it was continued rather than creating another Claim.

## Legacy audit

Verified legacy material includes:

- `khaledaltheeb/healthrenewal.org/content/sectors-v10/family.json`
- The family content layer was introduced at commit `9a7e7444acbca06bc50dbcbadeb3119398abd61b` on 2026-07-20.
- Repository search also found the slug/topic in legacy generator/enrichment layers, including `scripts/expand_v12_direct_legacy_v1.py`; Arabic-title searches surfaced additional generator/library layers such as `care_guides_topics_v246_4.py` and `publish_academic_library_v326.py`.
- The legacy family card is a short template-level item rather than a sufficient canonical article.
- No verified standalone historical public URL for this exact card was established from the available repository evidence. Therefore no redirect was guessed from generator arithmetic or presumed legacy routing.

The legacy card and generator material were used only for topic discovery and useful intent. They were not copied into the new article. Template brevity, repetition, process material, generic warnings and internal/generator text were excluded.

## Rebuild and enrichment scope

The canonical was rebuilt and expanded to cover:

- a non-diagnostic definition of chronic/long-term conditions and family adaptation;
- obtaining condition-specific information from the treating team and authoritative sources;
- one shared medication/appointment/contact record and continuity when the primary caregiver is unavailable;
- supported self-management without abandoning professional care;
- preserving identity, autonomy, privacy and dignity outside the illness role;
- person-centred goals based on what matters to the individual as well as clinical tasks;
- shared decision-making appropriate to age and capacity;
- distributing visible and invisible caregiving work across adults;
- a family information coordinator without making one person responsible for everything;
- communication with children at an age-appropriate level;
- gradual participation of a child/adolescent with a chronic condition in understanding and managing care;
- school participation, learning, attendance, privacy and a clear point of contact;
- protecting siblings from becoming invisible or taking adult-level caregiving roles;
- flexible routines and separate ordinary-day versus exacerbation plans;
- condition-specific crisis planning based on instructions from the actual care team rather than generic internet advice;
- work, finances and administrative load;
- couple/adult relationships outside the caregiving role;
- caregiver health and respite/backup planning;
- rehabilitation framed around functioning and participation;
- digital-information quality and avoiding treatment changes based on anecdotal online claims;
- reducing social isolation through adapted participation;
- transition planning between hospital/home, schools and child/adult services;
- concrete, delegable social-support requests;
- periodic family-system indicators to detect deterioration before crisis;
- the boundary between family support and professional care;
- a four-week practical family reorganisation plan;
- 10 search-intent FAQs.

## Authoritative sources used

1. Centers for Disease Control and Prevention — *Living with a Chronic Condition* — https://www.cdc.gov/chronic-disease/living-with/index.html
2. World Health Organization — *Self-care for health and well-being* — https://www.who.int/news-room/questions-and-answers/item/self-care-for-health-and-well-being
3. World Health Organization — *Rehabilitation* — https://www.who.int/health-topics/rehabilitation
4. American Academy of Pediatrics / HealthyChildren.org — *How Chronic Illness or Disability Affects a Family* — https://www.healthychildren.org/english/health-issues/conditions/chronic/pages/how%20chronic-illness-affects-the-family.aspx
5. American Academy of Pediatrics / HealthyChildren.org — *Living with a Chronic Illness or Disability* — https://www.healthychildren.org/English/health-issues/conditions/chronic/Pages/coping-with-chronic-illness.aspx
6. NHS England — *Supported self-management* — https://www.england.nhs.uk/personalisedcare/supported-self-management/
7. NHS England — *Long term conditions* — https://www.england.nhs.uk/ourwork/clinical-policy/ltc/
8. NHS England — *Personalised care and support planning* — https://www.england.nhs.uk/personalisedcare/pcsp/

## SEO / E-E-A-T

- SEO title: `التكيف الأسري مع المرض المزمن | دليل عملي` — 41 chars.
- Meta description: 150 chars.
- Primary keyword: `التكيف الأسري مع المرض المزمن`.
- Search aliases include Arabic variants plus `chronic illness family`, `family adaptation to chronic illness`, `family coping with chronic disease`, and `chronic disease family support`.
- Search intent: `informational`.
- Author display: `فريق تحرير منصة روافد`.
- Reviewer display: `مراجعة تحريرية وعلمية — منصة روافد`.
- Reviewer credentials describe source review and do not fabricate an individual professional identity.
- Canonical count in CMS at closure: **1**.
- Search vector present: **yes**.
- No featured image is assigned, so image Alt is N/A rather than fabricated.

## Internal links

The page links to five live Rawafid canonicals:

- `/content/caregiver-burnout`
- `/content/family-meetings`
- `/content/active-listening`
- `/content/financial-stress`
- `/content/healthy-boundaries`

## Redirect decision

No verified standalone historical public route for this exact legacy card was established. **No guessed redirect was created.** Active redirect count to the canonical at closure: 0.

## Workflow and final QA

Workflow completed sequentially:

`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

Final post-publication QA:

- useful body word tokens: **2062**
- structured blocks: **87**
- page H1: **1** via the page title; body-level H1 blocks: **0**
- H2: **34**
- H3: **4**
- FAQs: **10**
- authoritative references: **8**
- internal links: **5**
- canonical matches: **1**
- active redirects: **0**
- tags: **5**
- category relations: **1**
- content versions: **8**
- audit events: **8**
- SEO title length: **41**
- meta description length: **150**
- search vector present: **yes**
- forbidden TODO/FIXME/QA/agent/internal-note markers: **0**
- featured image: none; Alt N/A

No modification was made to `main` or to `docs/MIGRATION-PROGRESS.md`.