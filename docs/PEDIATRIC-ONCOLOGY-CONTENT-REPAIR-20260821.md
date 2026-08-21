# Pediatric Oncology Content Repair — 2026-08-21

## Scope

This repair wave upgrades thin or template-contaminated pediatric-oncology care guides in the production content database while preserving the publication safety gate. No repaired guide was made indexable or publication-ready by this work.

## Release posture

All repaired pages remain:

- `status = scientific_review`
- `robots_index = false`
- `publication_ready = false`
- blocked by an independent qualified human-review release gate
- assigned to the active `pediatric-oncology` sector

The existing two-phase pediatric-oncology release guard remains authoritative for any later publication.

## Repaired guides

| Guide | Arabic words | References | Claim-source maps | Internal links | Max corpus similarity | Release state |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Pain family guide | 3467 | 10 | 7 | 4 | 0.5397 | independent medical review pending |
| School re-entry | 2841 | 11 | 6 | 5 | 0.5173 | clinical/educational review pending |
| Sleep and fatigue | 2697 | 8 | 6 | 4 | 0.5397 | clinical review pending |
| Peripheral neuropathy | 2705 | 8 | 6 | 4 | 0.5027 | medical review pending |
| Fever and neutropenia | 2959 | 8 | 6 | 4 | 0.4955 | pediatric oncology/infectious-disease review pending |
| Nausea and vomiting | 2770 | 6 | 6 | 5 | 0.5203 | pediatric supportive-care review pending |
| Oral mucositis | 2973 | 7 | 6 | 5 | 0.5012 | pediatric oncology/oral-care review pending |
| Nutrition and weight | 2971 | 8 | 6 | 5 | 0.5097 | pediatric oncology nutrition review pending |
| Hair, skin and nail changes | 2715 | 7 | 6 | 5 | 0.5006 | pediatric oncology/dermatology review pending |
| Constipation and diarrhea | 2715 | 8 | 6 | 5 | 0.5092 | pediatric oncology/GI supportive-care review pending |
| Chemotherapy family guide | 3093 | 10 | 6 | 8 | 0.5355 | pediatric oncologist/oncology-pharmacy review pending |

## What changed

### 1. Thin drafts were replaced with topic-specific evidence-led pages

The pain guide had remained a 614-word draft on `/content/`. It was rewritten into a standalone family-facing care guide, moved to the canonical `/care-guides/` route family, expanded with pediatric pain assessment, procedural pain, neuropathic pain, functional impact, opioid safety boundaries, palliative-care context, red flags, and structured claim-source mapping.

Peripheral neuropathy, febrile neutropenia, nausea/vomiting, oral mucositis, nutrition/weight, hair/skin/nails, constipation/diarrhea, and the chemotherapy family guide received the same treatment: substantive topic-specific replacement rather than generic template expansion.

The chemotherapy guide is now a treatment-pillar page rather than a side-effect list. It includes protocol/phase framing, laboratory monitoring, central venous access, infusion safety, oral antineoplastic medication management, missed/vomited-dose boundaries, hazardous-drug home-handling boundaries, adherence challenges, supportive-care routing, survivorship transition, and family medication-safety organization without providing patient-specific dosing.

### 2. Template contamination was removed

The school re-entry and sleep/fatigue pages previously failed full-body similarity checks because shared generic sections dominated the articles. Both were substantially rewritten around their actual search intents and evidence bases.

Post-rewrite maximum full-body `pg_trgm` similarity values are all approximately 0.50–0.54, well below the prior contamination range above 0.80.

### 3. Canonical and keyword collisions were checked

All eleven repaired guides were tested against the current content table for exact canonical-route and exact primary-keyword collisions.

Result: `0` exact canonical duplicates and `0` exact primary-keyword duplicates for every repaired guide.

### 4. Internal-link architecture was strengthened

Each guide now records four to eight editorial internal-link targets into nearby pediatric-oncology content. The treatment pillar routes families into fever/neutropenia, nausea/vomiting, oral mucositis, pain, neuropathy, school re-entry, skin/hair and bowel-support guides rather than duplicating those pages.

### 5. Search-intent cannibalization was reduced

The old thin standalone drafts:

- `pediatric-cancer-sleep-family-guide`
- `pediatric-cancer-fatigue-family-guide`

were preserved as source drafts but explicitly consolidated into the stronger pillar:

`/care-guides/pediatric-cancer-sleep-fatigue-during-treatment/`

They remain drafts, non-indexable, and blocked from separate publication.

## Evidence and safety controls

Each repaired guide now includes:

- recent evidence-review date metadata
- topic-specific limitations
- explicit red flags where clinically relevant
- structured `claim_source_map`
- independent human-review packet metadata
- central disclaimer contract
- no patient-specific dosing or prescribing
- medication-specific home-safety boundaries where relevant
- no unsupported local legal/benefit claims
- publication and indexing disabled until independent review

## Taxonomy verification

The repaired records are attached to the active `pediatric-oncology` sector.

Current category placement includes:

- `pediatric-cancer-symptom-support` — pain, sleep/fatigue, neuropathy, nausea/vomiting, oral mucositis, nutrition/weight, hair/skin/nails, constipation/diarrhea
- `pediatric-clinical-care-safety` — fever/neutropenia
- `school-reentry-childhood-cancer` — school re-entry
- `pediatric-chemo-targeted-immunotherapy` — chemotherapy family guide

## Remaining high-priority thin pediatric-oncology drafts

The next repair queue is now concentrated in deeper clinical reference material rather than the common supportive-care symptom layer. Priorities include:

- selected late-effects pages (hearing/ototoxicity, thyroid, pulmonary, growth/endocrine)
- AML and APL reference pages
- AML germline-predisposition content
- Li-Fraumeni / inherited cancer-predisposition content
- additional treatment and survivorship pages that remain below the current standalone-depth floor

These should remain unpublished until they receive the same evidence-depth, originality, safety, SEO, internal-link, and independent-review treatment.

## Important release constraint

Database-side enrichment is not a substitute for human medical review. The repaired guides are intentionally held at `scientific_review` with `robots_index = false` and `publication_ready = false`. A later release must record an independent qualified reviewer and pass the existing pediatric-oncology publication guard and post-publication route verification.
