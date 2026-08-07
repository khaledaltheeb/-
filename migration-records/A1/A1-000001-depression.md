# A1-000001 — الاكتئاب

- Lane: A1 — الصحة النفسية
- Claim: GitHub Issue #8 — `[MIG-CLAIM][A1][depression] الاكتئاب`
- Status: **SCIENTIFIC REVIEW — BLOCKED ON QUALIFIED REVIEWER**
- Candidate canonical slug: `depression`
- Canonical: `/content/depression`
- Intended content type: `condition`
- Sector: `mental-health` — الصحة النفسية
- Primary category: `depression-mood` — الاكتئاب واضطرابات المزاج
- CMS content id: `45da36ca-ea10-4ad2-a5f8-8b918840c77f`
- Audience: الأفراد، الأسر، المختصون، المتدربون

## Pre-claim duplicate checks

Before claiming the topic, A1 searched GitHub Issues for `depression`, `الاكتئاب`, the proposed slug and major Arabic/English synonyms; no matching open claim was found. `docs/MIGRATION-PROGRESS.md` on `legacy-migration-audit` contained no depression canonical. Supabase was searched by slug, title and `search_aliases`; no depression canonical existed before this migration. Claim #8 was then created as the single active A1 claim.

## Legacy discovery and variant cluster

Repository inspected: `khaledaltheeb/healthrenewal.org`.

Current/related legacy material inspected or classified during discovery included:

- `quick-info/sadness-vs-depression/index.html`
- `quick-info/sleepiness-vs-depression/index.html`
- `quick-info/breakup-grief-vs-depression/index.html`
- `quick-info/loss-of-pleasure-check/index.html`
- `quick-info/support-depressed-person/index.html`
- `quick-info/boredom-vs-low-mood/index.html`
- `content/sectors-v10/stress-burnout-depression-differences-guide.json`
- `evidence-guides/stress-burnout-depression-differences-guide/index.html`
- `sectors/youth/guides/depression-warning-response/index.html`
- depression-related magazine/research pages and generator/script layers returned by repository search.

Historical Git search was also performed. Commit `db826adeb57c74e3ff92fa9f6494bbb7fcbe7800` (`content: clarify stress burnout and depression differences (#398)`, 2026-07-27) was inspected to verify the historical depression/burnout comparison layer and its source metadata.

Searches for a direct legacy `depression-ar.json`, exact `"slug":"depression"`, and a direct `depression/index.html` canonical did not return a standalone page matching the new canonical. Therefore the comparison/support/quick-info URLs above are treated as **related pages, not duplicate canonicals**.

## Dedupe and redirect decision

No duplicate Supabase canonical exists for slug `/content/depression` after creation (duplicate check = 0).

No active redirect was created from the related comparison/support pages because they have distinct search intent and redirecting them to the general depression canonical would destroy useful intent. A direct old canonical duplicate was not identified in this run, so redirect mapping for the page is currently **none** rather than guessed.

## Material excluded

Excluded from the new page:

- legacy theme/CSS/layout and duplicated analytics snippets;
- generator artifacts and implementation notes;
- agent/developer instructions, TODO/QA text and planning language;
- repeated generic warnings and large disclaimers;
- duplicated descriptions of depression across comparison pages;
- unsupported claims and wording that could imply self-diagnosis;
- unrelated research/magazine content whose primary entity is not depression itself.

## Useful legacy material retained as ideas/facts

The rebuild retained only useful concepts after independent verification, including the distinction between sadness and depression, functional impact, the need to assess duration/context/safety, and the distinction between depression, stress and occupational burnout. No legacy page was copied into the CMS.

## External source verification

Primary and authoritative sources used for the rebuilt page:

1. World Health Organization — `Depressive disorder (depression)`, 29 Aug 2025 — https://www.who.int/news-room/fact-sheets/detail/depression
2. National Institute of Mental Health (NIMH) — `Depression`, last reviewed Dec 2024 — https://www.nimh.nih.gov/health/topics/depression
3. NICE — `Depression in adults: treatment and management (NG222)`, published 2022 and reviewed 30 Jan 2026 — https://www.nice.org.uk/guidance/ng222
4. NHS — `Overview - Depression in adults` — https://www.nhs.uk/mental-health/conditions/depression-in-adults/overview/
5. NIMH — `Depression`, NIH Publication No. 24-MH-8079, revised 2024 — https://www.nimh.nih.gov/health/publications/depression

## Rebuild summary

The page was rebuilt from scratch in structured CMS blocks. It covers:

- formal definition and distinction from transient sadness;
- symptom domains and loss of pleasure;
- biological, medical, psychological and social contributors;
- professional assessment, safety assessment and limits of screening tools;
- severity and functional impairment;
- evidence-based psychotherapy, antidepressant treatment and combined care;
- severe/treatment-resistant depression and the limited role of ECT in selected cases;
- practical self-support without presenting lifestyle advice as a substitute for treatment;
- family/friend support;
- work/study impact and practical accommodations;
- physical-health comorbidity and life-stage considerations;
- why bipolar history must be assessed;
- urgent-risk section limited to genuine safety situations;
- treatment monitoring and relapse prevention;
- common misconceptions;
- search-intent FAQ and conclusion.

Useful Arabic word count measured during build: approximately **2,800+** words (well above the 1,500-word quality floor without padding).

## Heading and search-intent structure

Rendered page title is the single H1: **الاكتئاب: الأعراض والأسباب والتقييم والعلاج**.

CMS body contains **20 H2** and **7 H3** headings. No H1 block is stored in `body_json`, preventing a duplicate H1 because the application renders the content title as H1.

FAQ: **10** user-visible questions covering definition, duration, sadness vs depression, atypical presentation, online screening, treatment options, when to seek help, recovery, non-response and family support.

## SEO / E-E-A-T

- Primary keyword: `الاكتئاب`
- Search intent: informational
- SEO title: `الاكتئاب: الأعراض والأسباب والعلاج` (**34 chars**)
- Meta description: **154 chars**, within the platform 150–160 character release contract
- Canonical: `/content/depression`
- Search aliases include Arabic and English diagnostic/search synonyms.
- `schema_json` includes `MedicalWebPage` / `Article` with `MedicalCondition` about entity.
- Visible author: `فريق تحرير منصة روافد`
- References stored in `references_json`: 5
- Medical disclaimer stored once, concise and non-repetitive.
- No featured image was attached; therefore no image asset exists that could legally/technically require Alt at this stage. The platform release gate will require Alt automatically if a featured image is later linked.
- Internal links: 2 resource blocks to `/content/attention` and `/content/working-memory` using the platform domain.

## QA completed

Supabase checks after draft creation:

- duplicate slug/canonical: **0**
- structured blocks: **82**
- FAQ blocks: **1**
- FAQ items: **10**
- H2: **20**
- H3: **7**
- internal resource links: **2**
- references: **5**
- internal terms scan (`TODO|FIXME|QA|agent|وكيل|تعليمات الوكلاء`): **false**
- canonical: `/content/depression`
- current workflow status: `scientific_review`

## Taxonomy bootstrap performed

The live Supabase taxonomy did not contain a mental-health sector before this migration. To avoid incorrectly assigning depression to `knowledge` or `special-needs-inclusion`, A1 added guarded dynamic taxonomy rows in Supabase:

- Sector `mental-health` / الصحة النفسية — id `a5b36a88-3ac7-4f08-ac17-e599a41db90e`
- Category `depression-mood` / الاكتئاب واضطرابات المزاج — id `4a3a9578-955b-454f-b3dc-157b88dceb67`

No shared migration document and no `main` branch file was modified.

## Blocking quality gate

The CMS release trigger requires a visible scientific reviewer for medical/YMYL content before approval/publishing. Supabase currently has **no profile with a scientific-reviewer/editor/admin/owner role available for this review**, and the content row has `reviewer_display_name = null` and `reviewer_credentials = null`.

A1 will not fabricate a reviewer name or credentials and will not self-certify a medical condition page as independently scientifically reviewed. Therefore this page is intentionally left at `scientific_review`, Claim #8 remains reserved, and A1 must not begin a second page until this one can complete the required review → editorial → SEO → accessibility → approval/publish → post-build QA path.

## Coordinator action required

Assign or create a real qualified scientific reviewer identity/profile for A1 medical/YMYL pages and complete the scientific review of CMS content id `45da36ca-ea10-4ad2-a5f8-8b918840c77f`. After that gate is satisfied, A1 can continue this page through remaining review states, activate any verified redirects if discovered, publish, perform post-build QA and close Claim #8.
