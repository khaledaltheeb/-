# Rehabilitation evidence expansion — release record

Release date: 2026-09-06
Production sector: `rehabilitation-functioning`
Production site: https://healthrenewal.org

## Release summary

Eight durable Arabic rehabilitation guides were added to production after a live taxonomy/content gap review. Editorial bodies were released directly through the production content system and individually passed `private.content_release_gate_v6` before being made indexable.

This repository change records the release and its taxonomy linkage. It does not duplicate production editorial bodies in migrations.

## Released pages

| Category | Slug | Arabic words | Source-registry links |
| --- | --- | ---: | ---: |
| Neurological | `stroke-rehabilitation-guide` | 2,573 | 7 |
| Neurological | `traumatic-brain-injury-rehabilitation-guide` | 2,536 | 7 |
| Neurological | `spinal-cord-injury-rehabilitation-guide` | 2,533 | 7 |
| Neurological | `multiple-sclerosis-rehabilitation-guide` | 2,555 | 7 |
| Neurological | `spasticity-rehabilitation-management-guide` | 2,501 | 7 |
| Cardiopulmonary | `cardiac-rehabilitation-guide` | 2,514 | 6 |
| Cardiopulmonary | `copd-pulmonary-rehabilitation-guide` | 2,500 | 6 |
| Musculoskeletal | `knee-osteoarthritis-rehabilitation-guide` | 2,631 | 6 |

All eight were verified in production with:

- `status='published'`;
- `robots_index=true`;
- canonical `/content/<slug>` URLs;
- active primary taxonomy linkage;
- 6–7 entries in the central source registry per page.

## Sector impact

Production rehabilitation pages increased from **74 to 82** unique published/indexable pages.

Category changes driven by this release:

- Neurological rehabilitation: **7 → 12**.
- Cardiopulmonary rehabilitation: **2 → 4**.
- Musculoskeletal rehabilitation: **6 → 7**.

The largest remaining structural gaps are:

- Rehabilitation professions: **1** published page.
- Rehabilitation in Jordan and the Arab/MENA region: **0** published pages.

See `docs/research/2026-09-06-aapmr-rehabilitation-gap-map.md` for the full gap map and wave-2 priorities.

## Evidence families used

The expansion uses AAPM&R / PM&R KnowledgeNow as a specialty reference anchor and triangulates with current authoritative sources appropriate to each pathway, including:

- Canadian Stroke Best Practices 7th Edition 2025;
- NICE stroke rehabilitation NG236;
- VA/DoD post-acute mild TBI guidance;
- INCOG 2.0 cognitive rehabilitation guidance;
- Consortium for Spinal Cord Medicine / PVA guidelines;
- SCIRE systematic evidence modules;
- ASIA ISNCSCI 9th Edition 2026 resources;
- NICE multiple sclerosis NG220 reviewed in June 2026;
- AAPM&R Clinical Guidance on Spasticity 2024;
- AHA/AACVPR Core Components of Cardiac Rehabilitation 2024;
- American Thoracic Society pulmonary rehabilitation guideline;
- GOLD 2026 COPD report;
- NICE NG226, ACR/Arthritis Foundation, and OARSI osteoarthritis guidance;
- WHO rehabilitation and ICF frameworks.

## Editorial / rights boundary

This release is an evidence synthesis, not an endorsement claim. Organization names identify evidence provenance only.

No full proprietary patient handouts, measurement instruments, scoring sheets, or protected worksheets are republished. Where an official tool has reuse restrictions — notably ASIA ISNCSCI materials — the page explains the purpose and links to the official resource instead of reproducing it.

## Release-gate status

Every page was staged as a draft, checked against V6 metadata/content requirements, then published through the normal production gate. The gate was not disabled or weakened for this release.

The release therefore preserves the site-wide contract for minimum Arabic depth, heading structure, FAQs, search intents, secondary/semantic keywords, references, claim-to-source mappings, taxonomy review, originality declaration, evidence-led rewrite metadata, and centralized disclaimer handling.

## Repository representation

- Research/gap map: `docs/research/2026-09-06-aapmr-rehabilitation-gap-map.md`
- Release record: `docs/releases/2026-09-06-rehabilitation-aapmr-expansion.md`
- Idempotent taxonomy/assertion migration: `supabase/migrations/20260906023500_rehabilitation_aapmr_expansion_linkage.sql`

The migration intentionally does not seed editorial bodies because those bodies are already present and released in the production `public.content` store.