# Care Guides migration — working register

## Scope

Target section: `/care-guides/` and descendants.

- Legacy content source: `khaledaltheeb/healthrenewal.org`.
- Destination: `khaledaltheeb/-` (Rawafid V3) + its Supabase content store.
- Direction is one-way. The legacy repository is read-only for this migration.
- Theme, CSS, page chrome, scripts and legacy deployment machinery are not migrated as content.

## Verified legacy inventory

The deterministic legacy audit verifies:

- 14 unique structured guides from `content/v18/care-guides*.json`.
- 87 unique institutional topics from `scripts/care_guides_topics_v246_*.py`.
- 0 overlapping slugs between those source groups.
- **101 unique legacy care-guide source records in total.**

The CI inventory gate must continue to fail if the institutional count differs from 87 or the combined total differs from 101.

## Migration contract

For each historical guide/topic:

1. Inspect the legacy source and any relevant versions/variants.
2. Compare against existing V3 content by intent, audience, concepts and practical scope.
3. Classify as `new`, `merge`, `redirect`, `retain-separate`, or `reject-placeholder`.
4. Preserve unique useful knowledge while removing repetition, template filler and obsolete page chrome.
5. Build one coherent canonical; target at least 1,500 useful Arabic words where the topic supports that depth.
6. Use H1 from the page title, structured H2/H3 sections, search-intent FAQ, semantic terms and authoritative references.
7. Keep warnings concise and topic-specific; do not fill pages with repetitive medical disclaimers or fear-based language.
8. Scientific-review identity is not a mandatory publication gate. No reviewer identity or credential may be fabricated.
9. Never create two pages that substantially answer the same search intent simply to preserve historical file count.
10. When a legacy guide strengthens an existing canonical, merge the unique material and preserve the old URL through a redirect.

## Route foundation

The dedicated V3 route foundation is in `main`:

- `app/care-guides/page.tsx`
- `app/care-guides/[...slug]/page.tsx`
- `lib/care-guides.ts`
- `components/care-guide-page.tsx`
- `components/care-guide-page.module.css`
- `scripts/care_guides_legacy_audit.py`
- `.github/workflows/care-guides-legacy-audit.yml`

The hub lookup requires `care-guides-hub` to be `published`; child routes resolve published `guide` rows by their `/care-guides/.../` canonical URL.

## Current progress — 2026-08-08

- Legacy inventory: **101**.
- Legacy source records fully processed: **15 / 101**.
- Published `/care-guides/` canonical guides: **14**.
- Published section hub: **1**.
- Sources merged into a stronger existing canonical: **1**.
- Remaining legacy source records to classify/process: **86**.

All published care-guide pages in this completed batch passed the content QA contract before publication:

- >= 1,500 Arabic words.
- H2 + real H3 hierarchy.
- >= 5 search-intent FAQ items for guide pages.
- unique authoritative reference URLs (no duplicate reference rows counted as extra evidence).
- SEO title within the V3 branded-title contract.
- meta description 150–160 characters.
- a single `/care-guides/.../` canonical.
- no duplicate slug/title/canonical.
- no care-guide page exceeded the sentence-duplication threshold; the completed batch measured 0% long-sentence reuse at the internal >=4-page threshold.
- concise safety boundaries rather than repeated warning blocks.

### Published hub

- `care-guides-hub` → `/care-guides/`

### Published guides processed so far

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

## Merge/redirect decision

### `family-mental-health-crisis-plan` → `/content/family-care-plan`

A separate care-guide canonical was intentionally not created because V3 already had the same core intent in the stronger published `family-care-plan` canonical.

Unique legacy material was merged into that canonical, including:

- preparing the crisis card during a stable period;
- early-warning signs;
- one primary family contact;
- prescribed medicines/allergies without family dose changes;
- communication and confidentiality preferences;
- service and fallback contacts;
- escalation levels from structured home support to urgent/emergency care.

`next.config.ts` preserves the old route with a permanent redirect:

`/care-guides/family-mental-health-crisis-plan` → `/content/family-care-plan`

This remains the preferred pattern when an existing V3 canonical already answers the same search intent.

## Overlap screening rules for the remaining 86 sources

Similarity is only a candidate signal, never an automatic merge decision. Examples that require scope-level review include:

- `developmental-coordination-disorder-support` ↔ `/capabilities/developmental-coordination-disorder/`
- `developmental-language-disorder-communication` ↔ `/capabilities/developmental-language-disorder/`
- `fragile-x-family-support` ↔ `/capabilities/fragile-x-syndrome/`
- `chronic-illness-adjustment-support` ↔ `/content/chronic-illness-family`
- `executive-function-daily-support` ↔ `/content/executive-functions`
- `separation-anxiety-school-transition` ↔ `/content/separation-anxiety-child`

A care guide remains separate when it answers a distinct actionable care/support intent that the condition, comparison, capability or general article does not answer.

## Publication state vs production deployment

The Hub and 14 completed care guides are now **published in Supabase CMS** and have version/audit records.

The route implementation exists in repository `main`, but public production reachability has not been independently verified from the connected GitHub deployment API: the repository currently returns no GitHub deployment records. Search-engine discovery also does not establish route deployment. Therefore reports must distinguish:

- **CMS publication: verified.**
- **Route code in `main`: verified.**
- **Public production deployment/reachability: not independently verified yet.**

This distinction must not block continued content migration of the remaining 86 legacy source records.