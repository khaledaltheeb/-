# Pediatric Oncology ALL / Down-Syndrome Myeloid Repair — 2026-08-21

## Scope

This follow-on clinical-reference wave repairs two high-value leukemia guides:

- `childhood-acute-lymphoblastic-leukemia`
- `down-syndrome-myeloid-leukemia-childhood`

Both were moved into the canonical `/care-guides/` family, rewritten around current pediatric disease biology and treatment-response concepts, and accepted only after the database quality assertion passed.

They remain `scientific_review`, `robots_index=false`, `publication_ready=false`, and blocked on independent qualified human review.

## Childhood ALL

The ALL reference now centers pediatric lineage, molecular classification and MRD rather than a generic chemotherapy overview.

Key boundaries and additions:

- B-ALL versus T-ALL are separated clinically and biologically.
- Modern B-ALL genomic entities are described, including ETV6::RUNX1, high hyperdiploidy, BCR::ABL1, Ph-like ALL, KMT2A rearrangement, iAMP21 and newer molecular groups.
- Age/WBC-based NCI risk is framed as an initial layer, not the final pediatric risk assignment.
- MRD is explicitly assay-, time-point- and protocol-specific.
- Pediatric protocols, not adult ALL rules, are authoritative for risk and treatment decisions.
- Steroid, vincristine, asparaginase, methotrexate and thiopurine safety boundaries are separated from protocol dosing.
- TPMT/NUDT15 are presented as pharmacogenetic tolerance variables, not leukemia-risk markers.
- Blinatumomab, inotuzumab, CAR T-cell therapy and TKIs are described only in protocol-/lineage-/disease-context-specific terms.
- HSCT is not presented as routine first-remission therapy for most children with newly diagnosed ALL.

## Down-syndrome TAM / ML-DS

The Down-syndrome myeloid guide now separates three concepts that are frequently conflated:

1. constitutional trisomy 21
2. acquired GATA1-mutant transient abnormal myelopoiesis (TAM) in the neonatal period
3. myeloid leukemia of Down syndrome (ML-DS)

Key additions and controls:

- early newborn CBC assessment is aligned to pediatric Down-syndrome health-supervision guidance
- most TAM is monitored rather than automatically treated
- organ-threatening TAM is distinguished from asymptomatic/low-burden disease
- low-dose cytarabine is framed strictly as specialist treatment for selected severe TAM, never as routine prophylaxis
- liver dysfunction, effusions/hydrops, hyperleukocytosis, respiratory compromise and coagulopathy are treated as neonatal severity signals
- GATA1 is explicitly described as an acquired clone-level alteration in TAM/ML-DS, not the inherited cause of Down syndrome
- ML-DS is treated as a separate WHO-recognized entity with distinctive chemotherapy sensitivity
- COG AAML0431 supports syndrome-specific reduced-intensity treatment rather than copying conventional non-DS AML therapy
- HSCT is not presented as routine first-remission treatment for most ML-DS
- Down-syndrome-associated ALL is explicitly separated from TAM/ML-DS

## Quality assertion

Both records passed the same computed database gate used for the clinical-reference program: depth, reference count, claim-source maps, internal-link targets, corpus originality, exact canonical collision check, exact primary-keyword collision check, active pediatric-oncology taxonomy, and locked release posture.

## Release posture

These pages are editorially and mechanically repaired only. They remain unavailable to public care-guide routing until independent pediatric hematology review is recorded and the existing pediatric-oncology release guard is satisfied.
