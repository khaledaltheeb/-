# Pediatric Oncology Clinical-Reference Repair — 2026-08-21

## Scope

This repair wave upgrades four high-risk pediatric hematology/genetics reference guides from thin or incomplete drafts into evidence-led clinical-reference pages while preserving the independent human-review release gate.

Repaired records:

- `childhood-acute-myeloid-leukemia`
- `pediatric-acute-promyelocytic-leukemia`
- `pediatric-aml-germline-predisposition`
- `li-fraumeni-syndrome-childhood-cancer`

All four remain `scientific_review`, `robots_index=false`, and `publication_ready=false`.

## Computed release-quality gate

The batch was accepted into the repair audit only after a database assertion verified every page had:

- a passing substantive topic-specific content-quality audit
- at least the project standalone depth floor
- sufficient authoritative references
- sufficient structured claim-source mappings
- sufficient editorial internal-link targets
- pediatric-oncology corpus similarity below the project contamination threshold
- zero exact canonical-route collisions
- zero exact primary-keyword collisions
- active `pediatric-oncology` sector assignment
- an active category assignment
- `/care-guides/` canonical routing
- publication and indexing disabled

The assertion passed for all four records.

## Childhood AML

The AML reference was rebuilt around modern pediatric molecular classification rather than FAB morphology alone.

It now distinguishes:

- WHO HAEM5 and ICC disease definitions
- pediatric versus adult genomic landscapes
- flow cytometry, cytogenetics and molecular testing
- core-binding-factor AML
- KMT2A and NUP98 rearrangements
- FLT3, NPM1 and CEBPA context
- Down-syndrome-associated myeloid disease and APL as separate entities
- measurable residual disease (MRD)
- protocol-specific risk stratification
- induction/consolidation principles
- targeted-therapy and HSCT decision boundaries
- inherited myeloid-predisposition triggers

The page explicitly prevents applying adult ELN risk rules or a single mutation as a substitute for the pediatric treatment protocol and MRD response.

## Pediatric APL

APL is treated as a separate clinical emergency because early hemorrhagic/coagulopathic mortality risk and PML::RARA-directed therapy make it fundamentally different from other pediatric AML.

The repaired guide covers:

- PML::RARA confirmation and rare RARA-rearranged mimics
- immediate hospital-level ATRA initiation when strongly suspected, framed explicitly as a clinician action rather than home treatment
- aggressive coagulopathy support
- ATRA + arsenic trioxide pediatric treatment principles
- COG AAML1331 chemotherapy-reduction evidence
- differentiation syndrome
- ATRA-associated intracranial hypertension
- ATO QT/electrolyte and liver monitoring
- phase-appropriate molecular PML::RARA monitoring
- molecular remission and relapse principles

No dosing, transfusion threshold or patient-specific treatment algorithm is provided.

## Germline predisposition to pediatric AML/MDS

The germline reference separates leukemia-acquired somatic variants from constitutional/germline predisposition.

It covers major pediatric-relevant syndrome families including GATA2, RUNX1, CEBPA, ANKRD26, ETV6, SAMD9/SAMD9L, inherited bone-marrow-failure/DNA-repair/telomere disorders, and broader cancer-predisposition syndromes.

Critical safety boundaries include:

- a leukemia blood/marrow variant is not automatically germline
- appropriate non-hematopoietic confirmation may be required
- VUS findings must not drive irreversible treatment/family decisions
- related HSCT donors require syndrome-aware assessment when a familial pathogenic variant is known
- conditioning may need syndrome-specific modification in selected inherited marrow-failure/DNA-repair disorders
- post-HSCT surveillance does not erase non-hematologic germline cancer risks

## Li-Fraumeni / heritable TP53-related cancer syndrome

The TP53 page was rebuilt as a surveillance-program guide rather than a broad list of associated cancers.

It covers:

- germline TP53 confirmation and the somatic/VUS boundary
- autosomal-dominant inheritance and de novo disease
- Chompret/testing indications
- childhood tumor spectrum including adrenocortical carcinoma, sarcoma and CNS tumors
- prospective surveillance evidence
- annual whole-body MRI
- periodic brain MRI
- frequent childhood physical review and abdominal/pelvic ultrasound for ACC risk
- false-positive/incidental findings and scanxiety
- radiation minimization without withholding medically necessary CT or radiotherapy
- cascade testing and testing of minors where childhood surveillance changes care
- transition to adult lifelong surveillance

The page explicitly avoids the unsafe simplification that ionizing radiation is universally forbidden in TP53 carriers; the rule is to minimize avoidable exposure while preserving necessary diagnosis and cancer control.

## Primary evidence families

The repaired reference layer is anchored to:

- NCI childhood AML and childhood cancer genomics PDQ summaries
- WHO HAEM5
- International Consensus Classification of myeloid neoplasms and acute leukemias
- the pediatric AML genomic landscape literature
- European LeukemiaNet APL recommendations
- COG AAML1331 pediatric APL evidence
- GeneReviews Li-Fraumeni Syndrome
- European heritable TP53/Li-Fraumeni guidance
- AACR cancer-predisposition surveillance recommendations
- prospective Toronto-protocol surveillance data
- whole-body MRI meta-analysis evidence

## Release posture

These pages are mechanically and editorially repaired but **not medically released**. Each has a topic-specific independent-review gate. Publication still requires the existing pediatric-oncology release guard, qualified reviewer metadata, and post-publication route verification.
