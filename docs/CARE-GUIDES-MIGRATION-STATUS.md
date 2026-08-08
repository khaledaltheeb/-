# Care Guides migration — working register

## Scope and source of truth

Target public section: `/care-guides/` and descendants.

Legacy content source: `khaledaltheeb/healthrenewal.org`.
Destination: `khaledaltheeb/-` (Rawafid V3).

The legacy repository is a content and historical-URL source only. Theme, CSS, components, headers, footers, layouts, and runtime scripts are not migrated.

## Verified legacy inventory

The dedicated audit checks out the legacy repository read-only and deterministically verifies:

- 14 unique guides from `content/v18/care-guides*.json`.
- 87 unique institutional topics from `scripts/care_guides_topics_v246_*.py`.
- 0 overlapping slugs between those source groups.
- **101 unique legacy care-guide sources total**.

CI fails if the institutional count differs from 87 or the total differs from 101.

## Migration contract

Each legacy source must be classified as `new`, `merge`, `redirect`, `retain-separate`, or `reject-placeholder` after checking existing V3 content by intent, title, audience, concepts, and practical scope.

Rules:

1. Preserve useful legacy information and provenance.
2. Never copy the legacy visual/runtime layer.
3. Prefer one strong canonical over competing thin pages.
4. Target at least 1,500 Arabic words where the topic genuinely supports that depth, without filler.
5. Add useful search intent, semantic terms, audience, evidence references, internal links, and clear safety/content boundaries.
6. Preserve historical URLs with permanent redirects when a source is merged into another canonical.
7. Keep new `/care-guides/` records in `draft` until public deployment of the dedicated route is independently verified.

## V3 route foundation

Merged to `main` in commit `3985ba4d76d39ead9361421bd9c1588699ee0aab` after the Rawafid Quality Gate and the 101-source care-guides inventory gate passed.

Implemented:

- `app/care-guides/page.tsx` — hub.
- `app/care-guides/[...slug]/page.tsx` — nested guide route.
- `lib/care-guides.ts` — central content lookup and semantic related-content resolution.
- `components/care-guide-page.tsx` — V3 renderer with breadcrumbs, metadata, Article/CollectionPage JSON-LD, visible FAQ schema, references, audience, disclaimers, and related links.
- `components/care-guide-page.module.css` — scoped responsive styling.
- `scripts/care_guides_legacy_audit.py` and `.github/workflows/care-guides-legacy-audit.yml` — deterministic inventory gate.

## Current progress — batch 003

- Legacy inventory: **101**.
- Legacy sources fully processed: **12 / 101**.
- New enriched `/care-guides/` drafts: **10**.
- Sources merged into stronger existing V3 canonicals: **2**.
- Section hub draft: **1**.
- Database records currently using `/care-guides/` canonicals: **11** (hub + 10 guides).
- All 11 remain `draft` pending independent production-route verification.

## New `/care-guides/` drafts processed so far

| Legacy source | Canonical | Approx. Arabic words | Meta chars | Evidence / scope |
|---|---|---:|---:|---|
| `support-person-in-distress` | `/care-guides/support-person-in-distress/` | 2,423 | 152 | WHO, NIMH; first support, risk, privacy, children, disability, caregiver boundaries |
| `panic-attack-immediate-support` | `/care-guides/panic-attack-immediate-support/` | 2,160 | 151 | NICE, NHS, NIMH; immediate-action intent, separate from panic comparison |
| `suicide-risk-conversation-safety-plan` | `/care-guides/suicide-risk-conversation-safety-plan/` | 2,131 | 156 | NIMH, NICE, WHO; direct asking, imminent risk, collaborative safety planning |
| `agitation-aggression-deescalation` | `/care-guides/agitation-aggression-deescalation/` | 2,253 | 153 | NICE NG10; no restraint, weapon-disarming, or unsupervised medication instructions |
| `first-72-hours-after-traumatic-event` | `/care-guides/first-72-hours-after-traumatic-event/` | 2,352 | 153 | WHO, VA PTSD Center, NICE; immediate post-event support, no forced trauma narration |
| `support-psychosis-family` | `/care-guides/support-psychosis-family/` | 2,146 | 154 | NICE; family action, early referral, relapse planning, non-confrontational communication |
| `dissociation-flashback-grounding-support` | `/care-guides/dissociation-flashback-grounding-support/` | 2,013 | 153 | VA PTSD Center, NICE; optional grounding with medical/neurological red flags |
| `family-support-depression` | `/care-guides/family-support-depression/` | 2,167 | 153 | NICE NG222, WHO, NIMH; family support intent separate from the depression condition page |
| `family-ocd-support` | `/care-guides/family-ocd-support/` | 1,877 | 153 | NICE CG31, NIMH; family accommodation, reassurance, rituals, and safe support for ERP |
| `family-anxiety-panic-support` | `/care-guides/family-anxiety-panic-support/` | 1,995 | 151 | NICE CG113, NIMH; family reassurance/avoidance and gradual return intent, separate from acute panic guide |

The hub `/care-guides/` remains a draft at approximately 1,814 Arabic words with a 153-character meta description.

## Merge / redirect decisions

### 1. `family-mental-health-crisis-plan` → `/content/family-care-plan`

V3 already had a strong published `family-care-plan` canonical with the same core intent. Unique legacy material was merged instead of creating another page:

- crisis card built during stable periods;
- early-warning signs;
- one primary family contact;
- prescribed medicines/allergies summary without family dose changes;
- communication/privacy preferences;
- service and fallback contacts;
- three escalation levels: structured home support, prompt professional contact, urgent/emergency care.

The existing canonical increased from about 1,948 to about **2,143 words** and records the merged legacy slug. Permanent redirect:

`/care-guides/family-mental-health-crisis-plan` → `/content/family-care-plan`

### 2. `caregiver-self-care-boundaries` → `/content/caregiver-burnout`

V3 already had a strong published caregiver-stress canonical (about 2,297 words) covering workload, respite, task distribution, caregiver health, and care planning. The legacy boundary-specific value was merged rather than duplicated:

- distinguish tasks that can be done regularly, occasionally, or only by another person/service;
- explicit limits around time, money, sleep, driving, physical handling, medical decisions, and 24/7 availability;
- boundaries for abusive or unsafe behaviour;
- specific boundary language plus realistic alternatives;
- handling guilt after setting a safe limit.

The canonical is now about **2,480 words** and records `caregiver-self-care-boundaries` in merged provenance. Permanent redirect added in batch 003:

`/care-guides/caregiver-self-care-boundaries` → `/content/caregiver-burnout`

This follows current CDC and NIA caregiver guidance emphasizing consistent breaks, caregiver health, shared responsibilities, and maintained care plans.

## Overlap screening

`pg_trgm` is used only as a candidate generator. Similarity never authorizes an automatic merge.

Examples still requiring scope-level review:

- `developmental-coordination-disorder-support` ↔ `/capabilities/developmental-coordination-disorder/`
- `developmental-language-disorder-communication` ↔ `/capabilities/developmental-language-disorder/`
- `fragile-x-family-support` ↔ `/capabilities/fragile-x-syndrome/`
- `chronic-illness-adjustment-support` ↔ `/content/chronic-illness-family`
- `executive-function-daily-support` ↔ `/content/executive-functions`
- `separation-anxiety-school-transition` ↔ `/content/separation-anxiety-child`

A care guide remains separate when it answers an actionable care/search intent that an existing condition, glossary, capability, comparison, or general article does not answer.

## Publication guard

The route code is in `main`, but public deployment of the new Next.js route has not yet been independently established from repository deployment records or a deployment workflow that identifies the public target.

Therefore all new `/care-guides/` records stay `draft`. Publishing them before production-route verification could expose canonicals in the content sitemap before the public application is confirmed to serve them.
