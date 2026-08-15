# Care Guides rich expansion — Wave 003

## Scope

Wave 003 is fixed at **50 distinct search intents** selected from measured low-coverage taxonomy gaps rather than arbitrary article ideas. The batch spans trainee/volunteer practice, Universal Design for Learning and accessibility, withdrawal-care navigation and evidence governance, and OCD-related practical navigation.

The legacy `khaledaltheeb/healthrenewal.org` repository remains a read-only content/provenance source. No legacy runtime, theme, CSS, layout or deployment code is copied into Rawafid V3.

## Final release state — 2026-08-15

**50 of 50 configured candidates are published + indexable + `publication_ready=true` in Supabase.** The Wave 003 configuration file remains the authoritative list of the 50 intended slugs and search intents.

A final live-database aggregate after the last publication returned:

- **50** Wave 003 records;
- **50** with `status=published` and `robots_index=true`;
- **50** with `schema_json.publication_ready=true`;
- Arabic depth **2,500–3,022 words per page**;
- **5–7 references per page**;
- SEO-description length **150–160 characters**;
- **0 duplicate published/indexable canonicals** across the site;
- **0 duplicate Wave 003 slugs**.

Two older Wave 003 rows had already been published but still carried stale `publication_ready=false` metadata. They were reconciled to the same V8-ready state and recorded in the audit log; no content was duplicated or republished under a second canonical.

## V8 publication control

The V8 database release gate remained authoritative throughout the wave. It blocked promotion when the content contract was incomplete, including failures for:

- Arabic depth below 2,500 words;
- insufficient H3 hierarchy;
- SEO descriptions outside the 150–160-character contract;
- classification rationales that were too short;
- forbidden inline warning/disclaimer vocabulary where the platform requires the central disclaimer contract instead;
- incomplete publication-ready metadata.

Those pages were repaired and revalidated before publication rather than bypassing the gate.

One benzodiazepine-withdrawal draft suffered a transient JSON-shape error during an edit: its 83 content blocks remained intact but `body_json` was temporarily an array and `body_text` became null. The content was recovered by restoring the required `care_guide/blocks` wrapper and regenerating `body_text`; the page then passed a full structural recheck (2,743 words, 37 H2, 4 H3, 8 FAQ, valid sources/SEO) before publication.

## Published coverage

The completed 50-page wave now includes distinct, non-interchangeable intents across:

### Trainees, volunteers, safeguarding and programme quality

Role boundaries; confidentiality/consent; dual relationships; ethical notes; first supervision; escalation decisions; competency before independent work; safeguarding reporting; digital privacy; photo/story consent; onboarding quality; incident learning; reflective practice; field competency observation; handover continuity; feedback conversations; learning objectives; boundary-breach response; minimum-data safeguarding; psychological first aid boundaries; crisis referral; suicide-concern escalation; secondary stress; post-shift transition; and workload/burnout boundaries.

### UDL, participation and accessibility

Accessible assessment; accessible digital learning materials; meaningful choice/autonomy; predictable flexible routines; multilingual/disability inclusion; capability–environment fit; ICF-style participation goals; accommodation conversations; small-group instruction; homework accessibility; and accessible meeting participation.

### Addiction, withdrawal-care navigation and evidence governance

Alcohol-withdrawal care navigation; opioid-withdrawal care navigation; benzodiazepine-withdrawal care navigation; multiple-substance withdrawal-risk navigation; evaluating treatment claims; and reviewing treatment-program outcomes.

These pages are deliberately limited to preparation, safety, care navigation and evidence governance. They do **not** provide individualized medication doses, unsupervised taper schedules, detox protocols or a substitute for medical assessment.

### OCD and related disorders

First-assessment preparation; ERP-treatment preparation; workplace-function support; hoarding family communication/safety; trichotillomania tracking/help-seeking; skin-picking tracking/skin safety; BFRB appointment preparation; and clinician-guided discussion of family accommodation/reassurance/ritual participation.

These pages do **not** diagnose the reader or provide a self-directed ERP programme. Family-accommodation material explicitly routes reduction of reassurance/ritual participation through an OCD treatment plan rather than abrupt withdrawal of support.

## Sources and provenance

Each published record retains its own `references_json`, `claim_source_map`, `source_versions_reviewed`, taxonomy review and audit trail. The batch source registry is refreshed on **2026-08-15** and covers the official/institutional source families actually used across the wave, including IFRC, WHO, IASC, UN Volunteers, CAST, UNICEF, WHO ICF, the UN CRPD, NICE, MHRA, SAMHSA, NIAAA, NIMH and NHS/NHS specialist services.

For current high-stakes pages, source versions were rechecked immediately before publication where appropriate—for example WHO/IASC suicide guidance, NICE/MHRA dependence and withdrawal material, NIAAA/SAMHSA treatment-quality resources, and current NHS/NICE/NIMH OCD/hoarding/BFRB guidance.

No specialist reviewer identity or human clinical sign-off is fabricated. The pages are editorially source-backed and passed the platform's automated publication contract; that is distinct from a claim of individualized clinical review.

## Repository state

Wave 003 is recorded on the clean branch `agent/care-guides-rich-wave-003-clean` in PR #212. The final Supabase publication state is **50/50**. GitHub merge remains contingent on the current head passing all required CI checks; the PR must not be merged while any required gate is red.
