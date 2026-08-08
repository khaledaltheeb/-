# A6 Migration Record — safe-trainee-volunteer-practice

## Canonical

- Title: `التدريب والتطوع المسؤول في الدعم النفسي والمجتمعي`
- Slug: `safe-trainee-volunteer-practice`
- Destination: `/content/safe-trainee-volunteer-practice`
- Supabase content ID: `8735ae0e-c3b6-4fd3-afdf-a168927cf8f2`
- Sector: `trainees-volunteers` — المتدربون والمتطوعون
- Category: `safe-practice-supervision` — الممارسة الآمنة والإشراف
- Claim: #68

## Canonical boundary

This page is limited to trainee/volunteer role definition, competency, supervision, safeguarding, privacy, referral/escalation, role boundaries and volunteer/trainee wellbeing in psychosocial/community-support settings.

It does **not** duplicate `/content/learning-participation`, which remains the canonical for evidence learning, participation and knowledge translation. It does not duplicate specialist profiles or licensing; people-directory data remains in `community_profiles`, while licensed specialists remain in the specialist directory.

## Legacy source material inspected

- `content/v184/audience-resource-pathways-ar.json`
- `cochrane/evidence-academy/learning-participation/index.html`
- `api/v1/cochrane-evidence-academy.json`
- repository search results for learning paths, supervision, trainees and volunteering

The legacy fragments were treated as source material only. Theme, HTML shell, navigation, scripts and legacy layout were not migrated.

## Authoritative enrichment sources

1. WHO & UNICEF — *Foundational helping skills training manual: a competency-based approach for training helpers to support adults* (2025).
2. WHO & UNICEF — *Ensuring Quality in Psychosocial and Mental Health Care (EQUIP): compendium of competency assessment tools* (2026).
3. WHO / War Trauma Foundation / World Vision — *Psychological first aid: Guide for field workers*.
4. IFRC Reference Centre for Psychosocial Support — *Caring for Volunteers: A Psychosocial Support Toolkit* (Arabic).
5. UNICEF — *Policy on Safeguarding* (2025).
6. UNICEF Youth-Led Action — *Code of Conduct and Safeguarding*.
7. WHO — *Mental health in emergencies*.
8. WHO — *Psychological self-help interventions: delivering self-help for individuals* (2026).

## Quality result

- Useful Arabic words: `2872`
- H2: `19`
- H3: `6`
- Search-intent FAQ: `10`
- References: `8`
- Tags: `6`
- Category relations: `1` primary relation
- Content versions: `8`
- Audit records: `8`
- Duplicate canonical found before write: `0`
- Banned terminology scan (`معاقين`): `0`
- Status: `published`
- Robots: `index,follow`
- SEO title length: `39`
- SEO description length: `159`

## Database architecture decision

The trainees/volunteers domain uses two separate layers by design:

1. **Knowledge taxonomy**: sector `trainees-volunteers` and its content categories/pages.
2. **People directory**: `/community` backed by `community_profiles`, restricted to `trainee|volunteer`, with public visibility only for `verified + active` profiles under RLS.

No schema/RLS/function was modified for this migration. Only taxonomy/content data was added.

## Special-needs boundary

The page contains a concise cross-reference for respectful, accessible work with persons with special needs, but detailed condition/intervention content remains canonical in `special-needs-inclusion`. This prevents A6 from duplicating A3 content while keeping the sector visible and linked.