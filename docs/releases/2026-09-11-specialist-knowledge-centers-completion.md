# Specialist Knowledge Centers Completion — 2026-09-11

Production: https://healthrenewal.org

## Executive result

This release closes the planned specialist expansion and enrichment wave for two knowledge centers:

1. **Acquired Brain Injury: cognition, behaviour and recovery** (`acquired-brain-injury-recovery`)
2. **Inclusive Education Practice, Leadership and Systems** (`inclusive-education-practice-systems`)

The expansion backlog is closed with:

- **29 new gold-standard pages published**
- **3 candidates merged instead of creating competing pages**
- **12 existing high-value pages enriched in place** through zero-downtime versioned updates
- a bidirectional **related-content knowledge graph** connecting hubs, parent guides and specialist pages
- zero intentional `noindex` changes and no canonical replacement of existing published pages

A production assertion verified that all specialist backlog items are now either `published` or `merged`, all 29 published specialist pages remain visible to the anonymous role, and no published content on the site has a missing canonical URL or `robots_index=false`.

## Architectural decision

No new top-level sector was created. Existing sector ownership remains authoritative:

- ABI center lives under `rehabilitation-functioning` → `neurological-rehabilitation`
- Inclusive systems center lives under `special-needs-inclusion` → `inclusion-accommodations`

The purpose was to deepen the existing architecture, not fragment it.

## New ABI specialist pages

The ABI center now includes dedicated guides for:

- ABI vs TBI vs stroke vs hypoxic injury
- post-traumatic amnesia (PTA)
- attention
- information-processing speed
- memory
- executive functions and self-awareness
- cognitive-communication
- fatigue
- sleep
- emotional and behavioural change
- mental health
- family/caregiver support
- return to school/university
- return to work
- identity and adjustment
- relationships and intimacy
- driving, independence and community mobility

Each page was authored as original Arabic synthesis, passed the V6 editorial gate, includes structured FAQs and search-intent metadata, uses claim-to-source mappings, and was checked against the published corpus for exact long-paragraph reuse and excessive similarity.

## New inclusive-education systems pages

The inclusive systems center now includes dedicated guides for:

- inclusive school leadership and implementation
- family engagement
- schoolwide inclusive academic practice
- inclusive social-emotional-behavioural supports
- assessment governance
- multidisciplinary collaboration
- schoolwide accessibility and assistive technology lifecycle
- implementation fidelity
- inclusive-education quality indicators
- teacher professional learning
- inclusive-education data, monitoring and continuous improvement
- culturally and linguistically responsive inclusive education in the Arab context

## Candidates deliberately merged instead of published

Three candidates were not turned into new pages because an existing canonical already served the same or substantially overlapping search intent:

- `abi-recovery-continuum-hospital-home-community` → enriched `rehabilitation-care-pathway`
- `transition-to-adulthood-inclusive-education-system` → existing transition content
- `school-belonging-participation-inclusion` → existing belonging content

This preserves search-intent ownership and avoids SEO cannibalization.

## Existing pages enriched in place

The following existing published assets were expanded without unpublishing or changing their canonical identity:

1. `traumatic-brain-injury-rehabilitation-guide`
   - added a specialist navigation layer into PTA, cognitive, behavioural, family, education, work, identity, intimacy and driving pathways
   - added current INCOG / CAN-TBI / Action Collaborative / Headway evidence context

2. `stroke-rehabilitation-guide`
   - added cognitive, psychological, family and participation pathways
   - added a localization boundary for Stroke Foundation Australia resources

3. `spinal-cord-injury-rehabilitation-guide`
   - added the Arabic SCI physical-activity guideline as a regional-language/context layer
   - explicitly prevents using that source as the sole authority for exercise prescription
   - triangulates against SCIRE and WHO rehabilitation principles

4. `rehabilitation-care-pathway`
   - absorbed the merged hospital-to-home-to-community candidate
   - added discharge readiness, teach-back/handover, caregiver readiness, backup planning and return-to-role logic

5. `legacy-family-guide-conditions-acquired-brain-injury`
   - added a return-to-learning pathway and family workload boundary

6. `/library/branches/clinical-neuropsychology`
   - added profession/terminology governance
   - added multilingual/cultural test-interpretation boundaries
   - linked the page to specialist cognitive ABI guides

7. `legacy-learning-path-evidence-guided-inclusive-education-foundations`
   - turned the existing foundations asset into an operating map for the inclusive systems center
   - differentiates the roles of CRPD, UDL, HLP/DISES and Jordan policy context

8. `inclusive-school-self-evaluation`
   - connected self-evaluation to implementation fidelity, quality indicators, data and measurable improvement cycles

9. `legacy-special-needs-guides-education-inclusive-assessment-school`
   - connected classroom assessment accommodation to assessment governance, construct definition and disparity monitoring

10. `school-team-assistive-technology-training`
    - connected training to the full assistive-technology lifecycle, maintenance, backup and participation outcomes

11. `intervention-fidelity-education`
    - distinguishes fidelity of one intervention from fidelity of an inclusive school system

12. `culturally-responsive-family-partnership`
    - connects family partnership to wider school-level language, cultural, assessment and rights governance

For each enrichment, the production workflow verified that a previous version snapshot was created in `public.content_versions`, and the current page remained `published`, indexable and canonically stable.

## Terminology governance

The central terminology layer distinguishes:

- Psychologist → `اختصاصي علم النفس`
- Clinical Psychologist → `اختصاصي علم النفس السريري`
- Neuropsychologist → `اختصاصي علم النفس العصبي`
- Psychiatrist → `طبيب اختصاصي في الطب النفسي`
- Physiatrist → `طبيب اختصاصي في الطب الفيزيائي وإعادة التأهيل`
- Acquired Brain Injury → `إصابة الدماغ المكتسبة`
- Traumatic Brain Injury → `إصابة الدماغ الرضّية`
- Stroke → `السكتة الدماغية`

Professional/legal titles are explicitly treated as jurisdiction-dependent rather than assumed identical across Arab countries.

## Source-governance rules established in the content

### WFNR / Cleveland Clinic referral material

The referred sources were used as evidence and topic-discovery anchors, not as material for verbatim republication.

### Headway

Headway is used for topic discovery, lived-experience structure and patient/family pathways. Protected text is not copied or translated verbatim. Clinical claims are triangulated with guidelines and reviews.

### Stroke Foundation Australia

Arabic patient information is useful and linked as such. Australian phone numbers, services, pathways or regulatory assumptions are not presented as Jordanian or Arab-region services.

### Arabic SCI physical-activity guideline

The Arabic adaptation is treated as an important regional terminology/context source. It is not used as the sole authority for exercise dosage or individualized clinical prescription. SCI claims are triangulated with specialized evidence such as SCIRE and individualized professional assessment.

### CEC / DISES

DISES professional-learning resources are used to map implementation domains and identify gaps. The site does not imply CEC/DISES endorsement, accreditation or review of Rawafid unless explicitly granted.

### Jordan context

Jordan's National Framework for Inclusion and Diversity in Education and Education Strategic Plan 2026–2030 are used as policy context. Rawafid tools and checklists are not described as Ministry of Education instruments unless formally adopted.

## Knowledge graph

Related-content relationships now connect:

- specialist section hubs ↔ specialist pages
- TBI guide ↔ ABI specialist pages
- stroke guide ↔ relevant ABI cognitive/psychosocial/participation pages
- rehabilitation care pathway ↔ family/education/work return pathways
- child ABI guide ↔ return-to-education and caregiver support
- clinical neuropsychology ↔ cognitive ABI guides
- inclusive school leadership ↔ all systems-level inclusion guides
- existing self-evaluation / assessment / assistive-technology / fidelity / culturally responsive pages ↔ their deeper systems-level counterparts

This relationship graph is idempotently reproducible via repository migrations:

- `20260911143100_specialist_knowledge_graph_relations_20260911.sql`
- `20260911143200_specialist_knowledge_graph_hubs_20260911.sql`

## Publication safeguards retained

- V6 editorial gate remains active.
- The gold-standard publisher uses the exact V6 Arabic word-count definition.
- Structural warning/disclaimer protection remains active without blocking normal prose use of the word `تنبيه`.
- No human-review attestation is fabricated.
- No protected pediatric-oncology guard is bypassed.
- The remaining terminology-only pediatric oncology correction is still tracked in GitHub issue #857 through its reviewed revision workflow.

## Closure criteria passed

Production assertions completed without exception for:

- specialist backlog = 29 published / 3 merged
- no unfinished specialist backlog item
- all 29 published specialist pages visible to `anon`
- ABI and inclusive systems centers contain the expected published/indexable specialist inventory
- zero sitewide published content with `robots_index=false`
- zero sitewide published content with blank canonical URL
- recent published specialist pages have category mappings
- related-content graph has no missing endpoint or self-loop
- each targeted existing-page enrichment contains its expected enrichment block

## Next phase

The next phase should not be bulk page-count expansion. It should focus on:

1. front-end rendering and UX of the specialist knowledge graph;
2. source/provenance presentation and rights-aware citation UX;
3. navigation hierarchy, breadcrumbs and topic pathways;
4. schema/structured-data refinement for specialist hubs and guides;
5. search/discovery and internal-link quality measurement;
6. visual and mobile QA of the two centers.
