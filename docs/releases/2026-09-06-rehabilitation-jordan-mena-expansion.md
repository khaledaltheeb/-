# Jordan and MENA rehabilitation expansion — release record

Release date: 2026-09-06
Production category: `rehabilitation-mena-jordan`
Production site: https://healthrenewal.org

## Summary

The Jordan/MENA rehabilitation category was expanded from **0** to **4** published/indexable evidence-led pages. The wave adds a local service-access layer, an assistive-technology pathway, a hospital-to-home continuity guide, and a regional rehabilitation-system framework.

The pages intentionally avoid two weak patterns:

- static facility lists with no verification date;
- generic translation of international clinical content presented as if it were Jordan-specific policy.

Jordan-specific service, funding, eligibility and legal details are treated as volatile facts that must be checked against official Jordanian sources at the time of use.

## Released pages

1. `jordan-rehabilitation-services-access-guide`
2. `jordan-assistive-technology-access-guide`
3. `jordan-rehabilitation-discharge-continuity-guide`
4. `mena-rehabilitation-system-strengthening-guide`

## Evidence model

Local verification sources include:
- Jordan Ministry of Health;
- Higher Council for the Rights of Persons with Disabilities (Jordan);
- WHO Jordan country information.

System and rehabilitation evidence includes:
- WHO Rehabilitation;
- Rehabilitation 2030;
- WHO rehabilitation workforce resources;
- Rehabilitation Competency Framework;
- ICF;
- WHO Assistive Technology;
- WHO/UNICEF Global Report on Assistive Technology;
- WHO Wheelchair Provision Guidelines 2023;
- WHO Standards for Prosthetics and Orthotics where relevant.

## Verified production state

A production assertion succeeded after the four releases and verified that:

- all 4 wave pages are `published`;
- all 4 have `robots_index=true`;
- all 4 are primarily linked to `rehabilitation-mena-jordan` within `rehabilitation-functioning`;
- all 4 have at least five entries in `public.content_sources`;
- the category contains exactly **4** published/indexable pages after the wave.

Every editorial page was released through `private.content_release_gate_v6` rather than bypassing the production quality contract.

## Repository representation

- Gap map: `docs/research/2026-09-06-rehabilitation-jordan-mena-gap-map.md`
- Release record: `docs/releases/2026-09-06-rehabilitation-jordan-mena-expansion.md`
- Idempotent taxonomy/assertion migration: `supabase/migrations/20260906043000_rehabilitation_jordan_mena_linkage.sql`

The migration intentionally does **not** seed the editorial bodies. Production `public.content` remains the source of truth for the released text.

## Content governance

### Volatile local information
Before publishing or updating specific provider, payer, eligibility, price, schedule, contact or legal-procedure facts, record:
- official/source URL;
- responsible entity;
- verification date;
- scope/geography;
- what was confirmed versus inferred.

### Rights and claims
Citing a government body, WHO or a professional organization is evidence provenance only and must not be presented as endorsement, accreditation, certification or review of Rawafid/Health Renewal.

### Protected content
Do not republish proprietary assessment instruments, scoring keys, certification materials or licensed clinical tools. Explain concepts and use licensed/authorized versions where appropriate.

## Next recommended wave

The next Jordan-specific content should focus on legal/rights access only after mapping the exact current HCD and Jordanian legal sources. A provider directory should be built as verified structured data with dated evidence rather than free-text recommendations.