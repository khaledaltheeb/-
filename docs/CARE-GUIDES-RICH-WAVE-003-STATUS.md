# Care Guides rich expansion — Wave 003

## Scope

Wave 003 is the first Rawafid rich expansion wave explicitly fixed at **50 distinct search intents**. It is selected from measured low-coverage taxonomy gaps rather than from arbitrary article ideas. The batch prioritises the trainee/volunteer sector, Universal Design for Learning and accessibility, withdrawal-care navigation and evidence governance, and OCD-related practical navigation.

The legacy `khaledaltheeb/healthrenewal.org` repository remains a read-only content/provenance source. No legacy runtime, theme, CSS, layout or deployment code is copied into Rawafid V3.

## Current release state — 2026-08-14

**10 of 50 candidates are published + indexable in Supabase.** The remaining 40 stay defined in the Wave 003 configuration and are not counted as published until they independently pass the V8 database release gate.

Published canonicals:

1. `/care-guides/volunteer-role-boundaries-support/`
2. `/care-guides/trainee-confidentiality-consent-practice/`
3. `/care-guides/volunteer-dual-relationship-boundaries/`
4. `/care-guides/volunteer-ethical-notes-recording/`
5. `/care-guides/trainee-first-supervision-meeting/`
6. `/care-guides/supervision-escalation-decision-map/`
7. `/care-guides/competency-before-independent-task/`
8. `/care-guides/safeguarding-concern-reporting-volunteer/`
9. `/care-guides/volunteer-digital-privacy-messaging/`
10. `/care-guides/photo-story-consent-volunteer/`

## Verified quality of the first ten

The live database was queried after publication. All ten records are `published`, have `robots_index=true`, and have distinct `/care-guides/` canonicals. Arabic word counts are **2500–2606 words per page**. Each currently carries **five authoritative references** and a meta description within the **150–160 character** V8 contract.

The database V8 release gate also enforces the wider contract before a page can enter an approved/published state, including structured heading depth, FAQ/search-intent coverage, semantic-keyword coverage, claim-to-source mapping, source-version review, evidence-led rewrite/originality metadata, active taxonomy classification, page mechanism and the central disclaimer contract.

A published-canonical duplicate query returned **zero duplicate indexable canonicals** after this tranche.

## Editorial distinction of the first ten

The pages are not one template with changed nouns:

- role boundaries maps `execute / consult / escalate / stop` decisions and referral quality;
- trainee confidentiality separates purpose, minimum data, consent, supervision and information sharing;
- dual relationships focuses on power, prior relationships, gifts, money, social media and conflicts of interest;
- ethical notes focuses on fact/source/inference separation, correction, handover and record quality;
- first supervision meeting builds an explicit learning contract, competency baseline, supervision access and 30-day review;
- escalation decision map uses time, authority and consequence to choose the correct escalation level;
- competency before independent task uses observable critical behaviours and multiple performance evidence sources;
- safeguarding concern reporting separates listening and minimal recording from investigation, with an institutional handoff path;
- digital privacy messaging covers channels, BYOD, group chats, screenshots, backups, access and offboarding;
- photo/story consent treats consent as a content lifecycle from purpose and audience through storage, publication, reuse and withdrawal.

## Sources

The Wave 003 source registry prioritises official policies/guidelines and current institutional material, including IFRC, WHO, IASC, UN Volunteers, CAST, UNICEF, WHO ICF, the UN CRPD, NICE, SAMHSA, NIMH and NHS sources. High-stakes withdrawal and OCD pages are deliberately scoped as educational/navigation content: no individualized diagnosis, medication dosing, unsupervised taper schedule or self-directed specialist treatment protocol.

## Remaining 40

The configuration retains exactly 40 unpublished intents after this checkpoint. They continue across:

- supervision, competency, safeguarding and volunteer programme quality;
- psychological-first-aid and crisis-referral boundaries;
- volunteer secondary stress and workload sustainability;
- UDL, capability/environment fit and accessibility;
- alcohol/opioid/benzodiazepine/multiple-substance withdrawal care navigation and evidence governance;
- OCD assessment/therapy preparation, workplace function, hoarding-family communication, trichotillomania, skin picking and related appointment preparation.

No remaining record is promoted merely because it is listed in the configuration. Each must be written, checked against the current published corpus for semantic overlap, pass the same V8 database gate, and receive its own publication/audit decision.

## Repository state

Wave 002 was merged only after its current head passed `Rawafid Quality Gate`, `Cloudflare Workers Validate` and `Validate Legacy Migration Payload`. Wave 003 repository metadata is being carried on a clean branch from the current `main` to avoid inheriting the obsolete pre-squash Wave 002 history.
