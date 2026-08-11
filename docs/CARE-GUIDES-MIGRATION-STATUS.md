# Care Guides migration — working register

## Scope

Target section: `/care-guides/` and descendants.

- Legacy content source: `khaledaltheeb/healthrenewal.org`.
- Destination: `khaledaltheeb/-` (Rawafid V3) + its Supabase content store.
- Direction is one-way. The legacy repository is read-only for this migration.
- Legacy theme, CSS, page chrome, scripts and deployment machinery are not migrated as content.

## Verified legacy inventory

The deterministic audit verifies:

- 14 unique structured guides from `content/v18/care-guides*.json`.
- 87 unique institutional topics from `scripts/care_guides_topics_v246_*.py`.
- 0 overlapping slugs between those groups.
- **101 unique legacy care-guide source records in total.**

The CI inventory gate must continue to fail if the institutional count differs from 87 or the combined total differs from 101.

## Migration contract

Each source is inspected against existing V3 content and classified as `new`, `merge`, `redirect`, `retain-separate`, or `reject-placeholder`.

Release-quality guides must preserve useful provenance, use one coherent canonical, avoid duplicate search intent, contain >=1,500 useful Arabic words where justified, use real H2/H3 hierarchy, >=5 search-intent FAQ items, unique authoritative references, compliant SEO metadata, a primary keyword and semantic/audience fields, concise topic-specific safety boundaries, and no material long-sentence reuse across the guide library. Reviewer identity or credentials are never fabricated.

When an existing V3 page already answers the same intent, unique legacy value is merged into that stronger canonical and the historical care-guide route is preserved with a permanent redirect.

## Route foundation

The dedicated V3 route foundation is in `main`:

- `app/care-guides/page.tsx`
- `app/care-guides/[...slug]/page.tsx`
- `lib/care-guides.ts`
- `components/care-guide-page.tsx`
- `components/care-guide-page.module.css`
- `scripts/care_guides_legacy_audit.py`
- `.github/workflows/care-guides-legacy-audit.yml`

The hub resolves published `care-guides-hub`; guide routes resolve published `guide` rows by their `/care-guides/.../` canonical URL.

## Current progress — 2026-08-08

- Legacy inventory: **101**.
- Legacy source records fully processed: **20 / 101**.
- Published `/care-guides/` canonical guides: **18**.
- Published section hub: **1**.
- Sources merged into stronger existing V3 canonicals: **2**.
- Remaining legacy source records: **81**.

All 18 published guide pages passed the care-guide content QA contract before CMS publication. Each publication has a content-version snapshot and a `care_guides_batch_published` audit entry.

### Published hub

- `care-guides-hub` → `/care-guides/`

### Published guides

1. `support-person-in-distress` → `/care-guides/support-person-in-distress/`
2. `panic-attack-immediate-support` → `/care-guides/panic-attack-immediate-support/`
3. `suicide-risk-conversation-safety-plan` → `/care-guides/suicide-risk-conversation-safety-plan/`
4. `agitation-aggression-deescalation` → `/care-guides/agitation-aggression-deescalation/`
5. `first-72-hours-after-traumatic-event` → `/care-guides/first-72-hours-after-traumatic-event/`
6. `support-psychosis-family` → `/care-guides/support-psychosis-family/`
7. `dissociation-flashback-grounding-support` → `/care-guides/dissociation-flashback-grounding-support/`
8. `adhd-family-practical-guide` → `/care-guides/adhd-family-practical-guide/`
9. `family-anxiety-panic-support` → `/care-guides/family-anxiety-panic-support/`
10. `family-ocd-support` → `/care-guides/family-ocd-support/`
11. `family-support-depression` → `/care-guides/family-support-depression/`
12. `self-harm-family-safety-support` → `/care-guides/self-harm-family-safety-support/`
13. `trauma-ptsd-family-support` → `/care-guides/trauma-ptsd-family-support/`
14. `eating-disorder-family-support` → `/care-guides/eating-disorder-family-support/`
15. `grief-support` → `/care-guides/grief-support/`
16. `bipolar-family-early-warning-plan` → `/care-guides/bipolar-family-early-warning-plan/`
17. `autism-family-practical-guide` → `/care-guides/autism-family-practical-guide/`
18. `child-emotional-change` → `/care-guides/child-emotional-change/`

The latest four (`grief-support`, `bipolar-family-early-warning-plan`, `autism-family-practical-guide`, `child-emotional-change`) each passed: >=1,700 words, 18 H2, 2 real H3, 6 FAQ items, 4–5 unique authoritative references, compliant SEO metadata, unique canonical/title, and zero long-sentence reuse at the internal >=4-page threshold.

## Merge / redirect decisions

### `family-mental-health-crisis-plan` → `/content/family-care-plan`

V3 already had the same core intent in the stronger `family-care-plan` canonical. Unique legacy value was merged: stable-period crisis card, early-warning signs, one primary family contact, medicine/allergy summary without family dose changes, privacy preferences, fallback contacts and escalation levels.

Permanent redirect:

`/care-guides/family-mental-health-crisis-plan` → `/content/family-care-plan`

### `caregiver-self-care-boundaries` → `/content/caregiver-burnout`

V3 already had a stronger caregiver-stress/burnout canonical. Unique boundary-specific value was merged: task limits, time/money/sleep/driving/physical-handling/medical-decision boundaries, 24/7 availability limits, unsafe-behaviour boundaries, concrete boundary language, alternatives, and handling guilt after a safe limit. The canonical grew from roughly 2,297 to roughly 2,480 Arabic words and records the legacy slug in merged provenance.

Permanent redirect added by batch 004:

`/care-guides/caregiver-self-care-boundaries` → `/content/caregiver-burnout`

## Completion of the 14 structured legacy guides

All **14 / 14** structured sources from `content/v18/care-guides*.json` are now substantively processed:

- **13** are published as dedicated `/care-guides/` canonicals because their care/support intent is distinct.
- **1**, `caregiver-self-care-boundaries`, is merged into `/content/caregiver-burnout` because V3 already served the same intent more strongly.

The remaining work is therefore the institutional topic inventory, while continuing intent-level overlap checks against existing V3 content.

## Overlap screening for the remaining 81 sources

Similarity is only a candidate signal, never an automatic merge decision. High-priority intersections include:

- `developmental-coordination-disorder-support` ↔ `/capabilities/developmental-coordination-disorder/`
- `developmental-language-disorder-communication` ↔ `/capabilities/developmental-language-disorder/`
- `fragile-x-family-support` ↔ `/capabilities/fragile-x-syndrome/`
- `chronic-illness-adjustment-support` ↔ `/content/chronic-illness-family`
- `executive-function-daily-support` ↔ `/content/executive-functions`
- `separation-anxiety-school-transition` ↔ `/content/separation-anxiety-child`

A care guide remains separate only when it answers a materially distinct actionable care/support intent.

## Publication state vs production deployment

- **CMS publication of the hub and 18 guides: verified.**
- **Route implementation in repository `main`: verified.**
- **Public production deployment/reachability: not independently verified from the connected GitHub deployment API.**

This deployment uncertainty does not block continued content migration and QA of the remaining 81 sources.
