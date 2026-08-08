# A5 blocker — safe-screening-tools

- Lane: A5 — البحث والأدلة والأدوات والتعلم
- Canonical key: `safe-screening-tools`
- Proposed canonical: `/content/safe-screening-tools`
- Claim: #62
- Status: BLOCKED BEFORE CMS DRAFT

## Discovery and dedupe

Checked GitHub Issues for the canonical key, Arabic/English synonyms and screening terminology; no competing A5 Claim was found. `docs/MIGRATION-PROGRESS.md` on `legacy-migration-audit` contains no completed canonical for this topic. Supabase preflight found no `safe-screening-tools` slug/canonical; the only screen-related result was the unrelated child screen-time page `screens-child`.

## Legacy cluster audited

Verified current legacy route and source:

- `/evidence-guides/safe-screening-tools/`
- `content/sectors-v10/safe-screening-tools.json`

Verified historical source introduced by commit `3f32dd0c4c25931981e9e20a255faad8adc8d50d`:

- `content/sectors-v10/safe-screening-tools-explainer.json`

The historical/current variants overlap strongly and should merge into one canonical. Internal shell/style/generator material is excluded. Useful themes retained for a from-scratch rewrite: screening is not diagnosis; construct/purpose fit; validity/reliability/measurement error; sensitivity/specificity and cutoffs; Arabic-version validation; licensing/copyright; privacy; digital administration/accessibility; response to safety items; interpretation and next-step decision making.

## External evidence verification completed

Primary/current sources checked before drafting:

1. COSMIN — selecting outcome measurement instruments: selection should be based on the construct and evidence for measurement quality including validity, reliability, responsiveness and feasibility.
2. Neulinger et al., 2024, *European Journal of General Practice*, systematic review, PMID 39441668 — screening tools for mental illness in primary care; useful for current scope and heterogeneity of available screening instruments.
3. NICE NG197, published 17 June 2021 — shared decision making and communication of uncertainty, tests, risks, benefits and consequences.
4. FDA final Level 1 guidance, October 2025 — selecting/developing/modifying fit-for-purpose Clinical Outcome Assessments; supports fit-for-purpose measurement rather than treating an instrument name as universal validation.
5. WHO mhGAP guideline, third edition (2023) retained from the legacy source cluster as an official mental-health guideline reference; no diagnostic claim is assigned to a screening score alone.

Evidence limits planned for the page: psychometric properties are population/version/purpose dependent; cutoffs are contextual; translation alone is not validation; a screening result cannot independently establish or exclude a diagnosis; measurement properties do not transfer automatically to a modified Arabic/digital version.

## CMS blocker

A full 1500+ word Arabic rebuild was prepared for insertion through the governed CMS function `public.create_content_draft_v4`. The call failed before any row was created with:

`P0001: authentication required`

The failure comes from the private governed CMS function and therefore cannot be bypassed safely with direct table inserts. Direct SQL insertion would bypass the required version/audit/release-gate workflow, so it was intentionally not used.

No `main` change and no `docs/MIGRATION-PROGRESS.md` change were made. No second page was claimed.