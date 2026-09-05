# Fragile X / FraXI alignment review — 2026-09-05

Program: `fragile-x-gold-standard`
Canonical section: `/sections/fragile-x-syndrome`
Production data store: Supabase `ghljwfwqsyfnthvlzxjy`

## Purpose

Align the existing Arabic Fragile X reference centre with current public Fragile X International (FraXI) resources and the open FraXI / FragilX Maroc relationship without inventing partner input, implying endorsement, or creating duplicate URLs.

## Public sources rechecked

- FraXI — About Fragile X / resource hub: https://fraxi.org/information/
- FraXI — Helping Someone with Fragile X Syndrome: https://fraxi.org/information/helping-someone-with-fragile-x-syndrome/
- FraXI — The Strengths of Fragile X Syndrome: https://fraxi.org/information/the-strengths-of-fragile-x-syndrome/
- FraXI — Our Research: https://fraxi.org/research/our-research/
- FraXI — Family Associations by Country: https://fraxi.org/about/family-associations/
- FraXI — Fragile X Clinics by Country: https://fraxi.org/information/fragile-x-clinics-by-country/
- Herring et al. (2024), *The joys of fragile X: Understanding the strengths of fragile X and delivering a diagnosis in a helpful, holistic way*: https://journals.sagepub.com/doi/10.1177/27546330241287685
- Johnson et al. (2024), *A holistic approach to fragile X syndrome integrated guidance for person-centred care*: https://onlinelibrary.wiley.com/doi/full/10.1111/jar.13214
- CDC — Healthcare Providers: Top 5 Things to Know About FXS (updated 2026-04-27): https://www.cdc.gov/fragile-x-syndrome/hcp/facts/index.html
- CDC — About Fragile X Syndrome (2026): https://www.cdc.gov/fragile-x-syndrome/about/index.html

## Findings before modification

The Fragile X section was already structurally strong: the 35-page cornerstone plan and Tier-2 operational expansion were published, the root reference centre passed the V6 release contract, and the MENA diagnostic page already distinguished FMR1 repeat-expansion testing from exome/microarray and already linked FraXI network directories.

The main gap was not missing disease coverage. It was partner/source alignment:

1. The root reference centre did not yet expose a FraXI resource map or clearly explain the role of stakeholder/community sources versus clinical standards.
2. Strengths-based, holistic diagnosis language existed in the post-diagnosis page but was not sufficiently visible at the root level.
3. Family support needed a more explicit method for deciding when to use family-network guidance versus clinical/genetic/legal sources.
4. The MENA diagnostic page needed a dated, precise reading of FraXI's public network directories and an explicit rule against inferring unavailable services from directory presence/absence.

## Production changes completed

All changes were applied to already-published content and therefore re-ran the existing `private.content_release_gate_v6()` trigger. The gate was not bypassed or weakened.

### `fragile-x-syndrome-reference-center`

Added:
- a FraXI resource-pathway map;
- a clear distinction between clinical/technical evidence, research evidence, and community/stakeholder resources;
- strengths-based assessment as part of the functional plan rather than decorative positive language;
- practical measurement of strengths as access strategies;
- person-centred, integrated life-course care aligned with the 2024 JARID paper.

Post-update verification:
- published; root editorial remains `robots_index=false` by design;
- 4,029 Arabic words;
- 21 H2 / 7 H3;
- 9 structured FAQ items;
- 15 references;
- 13 claim-source mappings;
- 12 explicit search-intent questions.

### `fragile-x-after-diagnosis-care-pathway`

Added:
- a concrete first-diagnosis conversation framework;
- language to avoid deterministic prognosis and the false inference that “no cure” means “nothing can be done”;
- direct mapping to the strengths/holistic FraXI literature.

Post-update verification:
- published and indexed;
- 2,949 Arabic words;
- 24 H2 / 6 H3;
- 8 structured FAQ items;
- 14 references;
- 10 claim-source mappings;
- 10 explicit search-intent questions.

### `fragile-x-family-siblings-caregiver-support`

Added:
- a source-selection framework for clinical, genetic and day-to-day family questions;
- a five-question verification ladder before acting on community advice;
- a two-layer model combining international family networks with local service verification.

Post-update verification:
- published and indexed;
- 2,981 Arabic words;
- 38 H2 / 5 H3;
- 8 structured FAQ items;
- 14 references;
- 10 claim-source mappings;
- 10 explicit search-intent questions.

### `fragile-x-mena-diagnostic-access`

Added a dated network layer (verified 2026-09-05):
- FraXI's public family-association directory lists Fragile X Maroc as a full member;
- Jordan is not listed in the currently published family-association directory;
- FraXI's clinic-by-country directory lists Morocco through Association Fragile Maroc and does not contain a Jordan entry in the reviewed version;
- absence from a directory is explicitly not treated as evidence that no local clinicians, laboratories, services or informal networks exist;
- directory membership, clinic availability and molecular-test capability are explicitly separated.

Post-update verification:
- published and indexed;
- 3,077 Arabic words;
- 80 H2 / 6 H3;
- 8 structured FAQ items;
- 11 references;
- 10 claim-source mappings;
- 10 explicit search-intent questions.

## Partner-attribution boundary

No content has been labelled as “reviewed by FragilX Maroc”, “approved by FraXI”, “family priorities from Morocco”, or equivalent. The current email relationship supports contact and an offer to help, but the requested Morocco-specific family questions, terminology, resources and review comments have not yet been supplied in substantive form.

Therefore:
- public FraXI sources may be cited and attributed precisely;
- public FraXI directory facts may be stated with a verification date;
- FragilX Maroc-specific priorities, terminology or service claims must wait for direct written or published evidence;
- review or endorsement status must never be inferred from correspondence or a reaction to an email.

## Anti-duplication decision

No new “strengths” URL was created in this pass. The existing reference centre, post-diagnosis, family and adulthood pages already own the relevant search intents, and the V6 anti-cannibalization rule favors enrichment until a genuinely distinct Arabic user decision is identified.

## Next partner-triggered implementation

When FragilX Maroc replies with substantive material, the next pass should:
1. classify each item as family priority, terminology, public resource, local-service fact, or review comment;
2. verify any service claim against a current public or direct source;
3. add only non-duplicative content to the correct existing page;
4. preserve exact attribution and permission status;
5. send FraXI / FragilX Maroc an Implementation Update containing the published URLs and a precise summary of what their material changed.
