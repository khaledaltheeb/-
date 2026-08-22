# Pediatric Oncology Clinical Expansion — Wave 2 — 2026-08-21

## Scope

This audit documents a new evidence-led expansion of the Rawafid pediatric-oncology sector beyond the earlier psychosocial/supportive-care corpus. The wave focuses on major solid tumors, CNS tumors, hematopoietic stem-cell transplantation, radiotherapy, and cardiac late effects.

## New published care guides

Eight new standalone guides were created, quality-gated, published, and live-tested on the current Rawafid staging Worker:

1. `pediatric-neuroblastoma-clinical-guide`
   - Neuroblastoma: diagnosis, INRGSS, IDRF, MYCN, risk groups, multimodality treatment, high-risk autologous rescue, anti-GD2, MIBG, relapse, ALK/PHOX2B, survivorship.
   - Final preflight: 2,583 Arabic words; 19 H2; 6 H3; 8 FAQ; 10 references; 8 claim-source mappings.

2. `pediatric-wilms-tumor-clinical-guide`
   - Wilms tumor and childhood kidney tumors: imaging, pathology, stages I–V, COG vs SIOP approaches, lymph-node sampling, nephron-sparing surgery, bilateral disease, predisposition, renal survivorship.
   - Final preflight: 2,619 Arabic words; 21 H2; 5 H3; 8 FAQ; 10 references; 8 claim-source mappings.

3. `pediatric-brain-cns-tumors-clinical-guide`
   - Pediatric brain/CNS tumor umbrella reference: MRI, surgery, integrated WHO CNS diagnosis, glioma, medulloblastoma, ependymoma, ATRT, germ-cell tumors, craniopharyngioma, molecular classification, neurocognitive/endocrine late effects.
   - Final preflight: 2,577 Arabic words; 23 H2; 4 H3; 8 FAQ; 10 references; 8 claim-source mappings.
   - Strategic uniqueness gate passed after explicitly defining the page as an umbrella/routing reference rather than a competitor to future entity-specific pages.

4. `pediatric-osteosarcoma-clinical-guide`
   - Osteosarcoma: biopsy planning with orthopedic oncology, staging, MAP concept without patient-specific dosing, limb-sparing surgery vs amputation, histologic necrosis, pulmonary disease, relapse, reconstruction, rehabilitation, fertility, survivorship.
   - Final preflight: 2,616 Arabic words; 25 H2; 4 H3; 8 FAQ; 8 references; 8 claim-source mappings.

5. `pediatric-ewing-sarcoma-clinical-guide`
   - Ewing sarcoma: FET–ETS/EWSR1::FLI1 diagnosis, differential from CIC/BCOR round-cell sarcomas, staging, systemic therapy, surgery/radiotherapy local control, pelvic/chest-wall disease, pulmonary/bone metastases, relapse, investigational targeted therapy, survivorship.
   - Final preflight: 2,638 Arabic words; 32 H2; 4 H3; 8 FAQ; 10 references; 8 claim-source mappings.

6. `pediatric-stem-cell-transplant-cancer-guide`
   - Pediatric HCT: autologous vs allogeneic transplant, HLA donor selection, marrow/PBSC/cord sources, conditioning, Day 0, engraftment, chimerism, infection/immune reconstitution, GVHD, graft-versus-leukemia, MRD, relapse, CAR-T relationship, vaccines and long-term survivorship.
   - Final preflight: 2,760 Arabic words; 34 H2; 4 H3; 8 FAQ; 9 references; 8 claim-source mappings.

7. `pediatric-cancer-radiotherapy-clinical-guide`
   - Pediatric radiotherapy: simulation, immobilization/anesthesia, GTV/CTV/PTV, fractionation, photons/protons/electrons, craniospinal irradiation, TBI, image guidance, motion/adaptive planning, organ-specific acute/late effects, re-irradiation, second malignancy uncertainty, survivorship dose records.
   - Final preflight: 2,657 Arabic words; 31 H2; 4 H3; 8 FAQ; 10 references; 8 claim-source mappings; SEO description length 156.
   - Proton therapy is described with evidence boundaries: lower normal-tissue dose is a physical advantage, but the magnitude of reduction in second-malignancy risk is not presented as proven.

8. `childhood-cancer-cardiac-heart-late-effects`
   - Cardiac late effects: anthracycline equivalent dose, heart-exposing radiotherapy, IGHG 2023 cardiomyopathy surveillance, coronary/valvular/pericardial/conduction disease, echocardiography, strain, risk-factor control, dexrazoxane evidence, pregnancy, transition to adult cardio-oncology.
   - Final preflight: 2,813 Arabic words; 35 H2; 5 H3; 8 FAQ; 9 references; 8 claim-source mappings; SEO description length 152.

## Authoritative source base

The wave uses a hierarchy of official and peer-reviewed sources including:

- National Cancer Institute PDQ health-professional and patient summaries.
- WHO/IARC Classification of Paediatric Tumours and WHO CNS / Soft Tissue and Bone volumes.
- The EBMT Handbook, 8th edition (2024), including pediatric HCT, ALL, HSC collection, and infectious-support chapters.
- Children’s Oncology Group Long-Term Follow-Up Guidelines v6.
- International Late Effects of Childhood Cancer Guideline Harmonization Group (IGHG) cardiomyopathy, coronary-disease, pregnancy, and dexrazoxane recommendations.
- Pediatric Normal Tissue Effects in the Clinic (PENTEC) radiation late-effects framework.
- Recent systematic reviews, meta-analyses, clinical-practice guidelines, consensus recommendations, and major peer-reviewed reviews from PubMed.

## Publication QA

A unified live QA check was run for the eight new pages after publication and after the pediatric-oncology timeout sweep:

- 8/8 status = `published`
- 8/8 `robots_index=true`
- 8/8 `publication_ready=true`
- 8/8 HTTP 200 on the current Rawafid staging Worker
- 8/8 visible `تمت المراجعة من قبل فريق روافد.`
- 8/8 route token present in rendered HTML
- 8/8 canonical tag present

The recorded review provenance remains internal Rawafid scientific/editorial review. No external physician or independent reviewer credential was fabricated.

## Steroid mood/behavior route repair

`care-guide-pediatric-cancer-steroid-mood-behavior` was found to have been rolled back to draft by an old route-verification failure record (`frontend care-guide route metadata and sitemap contract repair in progress`) even though its content preflight remained fully ready (2,931 words, 8 refs, 8 claims, no blockers). The stale failed route state was removed, the page was republished through the current two-phase guard, and its route state returned to `pending` rather than being falsely marked passed.

## Current aggregate after repair

- 79 pediatric-oncology care guides published.
- 79/79 published guides are indexable at the record level and record Rawafid review metadata.
- Only two non-published guide records remain: the intentionally consolidated sleep-only and fatigue-only drafts pointing to the combined sleep/fatigue pillar.

## Sitemap boundary

As in the previous audit, final public-route verification remains `pending` where staging cannot satisfy the sitemap check because indexing/sitemap emission is intentionally disabled by environment configuration. Do not fabricate sitemap verification. Final route verification should be completed only after the intended production deployment emits the current `/care-guides/` canonicals in its sitemap.
