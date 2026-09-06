# Rehabilitation professions expansion — release record

Release date: 2026-09-06
Production category: `rehabilitation-professions`
Production site: https://healthrenewal.org

## Summary

Eight role-specific Arabic rehabilitation guides were added to production to complement the existing `multidisciplinary-rehabilitation-team` overview page. Each guide was created as an evidence-led original Arabic synthesis, staged as a draft, checked against the production content contract, and released through `private.content_release_gate_v6` before becoming indexable.

## Released role pages

1. `physiatrist-role-rehabilitation-guide`
2. `physical-therapy-role-rehabilitation-guide`
3. `occupational-therapy-role-rehabilitation-guide`
4. `speech-language-pathology-role-rehabilitation-guide`
5. `rehabilitation-nursing-role-guide`
6. `rehabilitation-psychology-neuropsychology-role-guide`
7. `rehabilitation-social-work-case-management-role-guide`
8. `prosthetics-orthotics-seating-assistive-technology-role-guide`

## Verified production state

A production assertion was executed after the final role release and succeeded with no exception. It verified that:

- all eight role pages are `published`;
- all eight have `robots_index=true`;
- all eight are primarily linked to `rehabilitation-professions` inside `rehabilitation-functioning`;
- all eight have at least five entries in `public.content_sources`;
- the category now contains exactly **9** published/indexable pages, including the pre-existing multidisciplinary-team overview.

## Evidence sources

The role library is anchored in authoritative professional and rehabilitation-system sources rather than generic career descriptions. Source families include:

- AAPM&R and WHO for PM&R/physiatry;
- APTA and World Physiotherapy for physical therapy;
- AOTA and WFOT for occupational therapy;
- ASHA for speech-language pathology, cognitive-communication, AAC and dysphagia;
- Association of Rehabilitation Nurses and ANA for rehabilitation nursing;
- APA Division 22, ABPP and AACN for rehabilitation psychology and neuropsychology;
- NASW and CMSA for social work and case management;
- WHO prosthetics/orthotics standards, WHO wheelchair guidelines, WHO assistive technology, and RESNA for devices and assistive technology;
- WHO Rehabilitation Competency Framework and ICF across the profession library.

## Editorial boundaries

The pages do not establish a universal legal scope of practice. Licensing, protected acts, referral rules and professional titles vary by jurisdiction and must be verified with official local regulators.

The pages also avoid republishing protected tests, scoring keys, proprietary competency tools, assessment forms or certification materials. Organization names identify evidence provenance only and do not imply endorsement, accreditation, certification or review of Rawafid/Health Renewal.

## Repository representation

- Gap map: `docs/research/2026-09-06-rehabilitation-professions-gap-map.md`
- Release record: `docs/releases/2026-09-06-rehabilitation-professions-expansion.md`
- Idempotent production linkage/assertion migration: `supabase/migrations/20260906033000_rehabilitation_professions_linkage.sql`

The migration intentionally does not seed editorial bodies. Production `public.content` remains the source of truth for the released text.