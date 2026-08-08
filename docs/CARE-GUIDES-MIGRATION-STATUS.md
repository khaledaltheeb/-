# Care Guides migration — working register

## Scope

Target public section: `/care-guides/` and descendants.

Legacy source repository: `khaledaltheeb/healthrenewal.org`.
Destination repository: `khaledaltheeb/-` (Rawafid V3).

The legacy repository is a content and historical-URL source only. Theme, CSS, layout, page chrome, and scripts are not migrated.

## Verified legacy inventory

The care-guides-specific audit checks out the legacy repository read-only and parses the structured source files deterministically.

Verified result:

- 14 unique guides from `content/v18/care-guides*.json`.
- 87 unique institutional topics from `scripts/care_guides_topics_v246_*.py`.
- 0 overlapping slugs between those two source groups.
- 101 unique legacy care-guide source records in total.
- The CI gate fails if the institutional count differs from 87 or the total differs from 101.

Rawafid V3 already contained 142 rows with `content_type = guide` before this migration started, but zero rows with a canonical URL under `/care-guides/`. Existing V3 guides under other dedicated modules are not automatically duplicated into `/care-guides/`; matching and canonical decisions come first.

## Migration contract

For every historical guide or variant:

1. Identify every legacy source file and historical URL.
2. Compare the topic against existing V3 content by title, intent, concepts, audience, and practical scope.
3. Classify the source as `new`, `merge`, `redirect`, `retain-separate`, or `reject-placeholder`.
4. Preserve useful legacy information but rewrite it into V3 structured content blocks.
5. Expand pages to a complete practical answer; target at least 1,500 Arabic words where the topic supports that depth, without artificial filler.
6. Add a single canonical URL, search-intent fields, semantic terms, audience, evidence references where needed, and a clear content boundary/disclaimer.
7. Keep imported records in `draft` until the dedicated route exists on the deployed V3 application and validation passes.
8. Publish only after route, SEO, accessibility, structured data, internal links, mobile layout, and sitemap behavior are verified.
9. Preserve old URLs through redirects when a historical page is merged into a different canonical entity.
10. Never publish two pages that answer substantially the same search intent merely to preserve file count.

## Implemented V3 route foundation

The foundation was merged to `main` in commit `3985ba4d76d39ead9361421bd9c1588699ee0aab`.

- `app/care-guides/page.tsx` — dedicated hub route.
- `app/care-guides/[...slug]/page.tsx` — nested guide routes, including compatibility with historically nested branches when retained.
- `lib/care-guides.ts` — canonical lookup, care-guide data access, and canonical semantic-related-content resolution from the central `content` entity.
- `components/care-guide-page.tsx` — V3 renderer using the institutional header/footer, ContentRenderer, breadcrumbs, Article/CollectionPage JSON-LD, visible FAQ JSON-LD, references, audience tags, disclaimer, and semantic internal links.
- `components/care-guide-page.module.css` — scoped responsive styling only; no legacy visual code copied.
- `scripts/care_guides_legacy_audit.py` — deterministic 101-source inventory gate.
- `.github/workflows/care-guides-legacy-audit.yml` — read-only legacy checkout and artifact-producing inventory workflow.

The foundation passed the Rawafid Quality Gate and the care-guides 101-source inventory gate before merge.

## Current migration progress

- Legacy guide inventory: **101**.
- Legacy guide sources fully processed so far: **8 / 101**.
- Processed as enriched new `/care-guides/` drafts: **7**.
- Processed by merging into a stronger existing V3 canonical: **1**.
- Section hub draft: **1**.
- Total database records currently using `/care-guides/` canonicals: **8** (hub + 7 guides).
- All eight `/care-guides/` records remain `draft` until production deployment of the new route is independently verified.

### `care-guides-hub`

- Canonical: `/care-guides/`
- State: `draft`
- Approximate Arabic word count: 1,814
- SEO title: 29 characters
- Meta description: 153 characters

### `care-guide-support-person-in-distress`

- Legacy slug: `support-person-in-distress`
- Canonical: `/care-guides/support-person-in-distress/`
- State: `draft`
- Approximate Arabic word count: 2,423
- Meta description: 152 characters
- Authoritative references: 4

### `care-guide-panic-attack-immediate-support`

- Legacy slug: `panic-attack-immediate-support`
- Canonical: `/care-guides/panic-attack-immediate-support/`
- State: `draft`
- Approximate Arabic word count: 2,160
- Meta description: 151 characters
- Authoritative references: 4 (NICE, NHS, NIMH)
- Scope: `retain-separate` from `/comparisons/panic-attack-vs-panic-disorder/` because immediate-action intent differs from comparison intent.

### `care-guide-suicide-risk-conversation-safety-plan`

- Legacy slug: `suicide-risk-conversation-safety-plan`
- Canonical: `/care-guides/suicide-risk-conversation-safety-plan/`
- State: `draft`
- Approximate Arabic word count: 2,131
- Meta description: 156 characters
- Authoritative references: 4 (NIMH, NICE, WHO)

### `care-guide-agitation-aggression-deescalation`

- Legacy slug: `agitation-aggression-deescalation`
- Canonical: `/care-guides/agitation-aggression-deescalation/`
- State: `draft`
- Approximate Arabic word count: 2,253
- Meta description: 153 characters
- Authoritative references: 3 (NICE NG10)
- Safety boundary: no restraint, weapon-disarming, or unsupervised medication instructions.

### `care-guide-first-72-hours-after-traumatic-event`

- Legacy slug: `first-72-hours-after-traumatic-event`
- Canonical: `/care-guides/first-72-hours-after-traumatic-event/`
- State: `draft`
- Approximate Arabic word count: 2,352
- Meta description: 153 characters
- Authoritative references: 5 (WHO, VA National Center for PTSD, NICE)
- Scope: `retain-separate` from `/comparisons/trauma-vs-ptsd/`; immediate post-event support differs from diagnostic/conceptual comparison.

### `care-guide-support-psychosis-family`

- Legacy slug: `support-psychosis-family`
- Canonical: `/care-guides/support-psychosis-family/`
- State: `draft`
- Approximate Arabic word count: 2,146
- Meta description: 154 characters
- Authoritative references: 4 (NICE adult and child/young-person psychosis guidance)
- Scope: `retain-separate` from `/comparisons/psychosis-vs-schizophrenia/`; the guide answers family action, early referral, safety, relapse planning, and communication intent.

### `care-guide-dissociation-flashback-grounding-support`

- Legacy slug: `dissociation-flashback-grounding-support`
- Canonical: `/care-guides/dissociation-flashback-grounding-support/`
- State: `draft`
- Approximate Arabic word count: 2,013
- Meta description: 153 characters
- Authoritative references: 4 (VA National Center for PTSD, NICE)
- Safety boundary: grounding is optional and stopped if it worsens distress; altered consciousness and neurological/medical red flags are escalated rather than labelled as dissociation.

## First merge/redirect decision

### `family-mental-health-crisis-plan` → `/content/family-care-plan`

The legacy source was **not** converted into another `/care-guides/` page because V3 already has a published canonical article with the same core intent: `family-care-plan` — “خطة العناية النفسية للأسرة”.

Unique legacy material was merged into that canonical instead:

- build the crisis card during a stable period;
- define early-warning signs;
- use one primary family contact to prevent conflicting instructions;
- include prescribed medications/allergies without family dose changes;
- record communication and confidentiality preferences;
- define service contacts and fallback contacts;
- define three escalation levels: structured home support, prompt professional contact, urgent/emergency care.

After the merge the existing canonical is approximately 2,143 Arabic words (up from ~1,948) and records `family-mental-health-crisis-plan` in its merged legacy provenance.

`next.config.ts` adds a permanent redirect:

`/care-guides/family-mental-health-crisis-plan` → `/content/family-care-plan`

This is the preferred pattern when the useful legacy material can strengthen an already adequate canonical rather than creating competing pages.

## Initial overlap screening

A first-pass `pg_trgm` similarity screen compares every legacy title/slug against the V3 content table. This is a candidate generator only, not an automatic merge rule.

Examples requiring scope-level review before migration:

- `developmental-coordination-disorder-support` ↔ `/capabilities/developmental-coordination-disorder/`
- `developmental-language-disorder-communication` ↔ `/capabilities/developmental-language-disorder/`
- `fragile-x-family-support` ↔ `/capabilities/fragile-x-syndrome/`
- `chronic-illness-adjustment-support` ↔ `/content/chronic-illness-family`
- `executive-function-daily-support` ↔ `/content/executive-functions`
- `separation-anxiety-school-transition` ↔ `/content/separation-anxiety-child`

Similarity alone never authorizes a merge. A care guide can remain separate where it answers an actionable care intent that the existing condition, glossary, capability, comparison, or general article does not answer.

## Publication guard

The dedicated route code is in `main`, but public deployment has not yet been independently verified. GitHub currently exposes no repository deployment records and the repository does not establish the public target through a deployment workflow.

Therefore all eight `/care-guides/` records remain drafts intentionally. Publishing them prematurely could expose `/care-guides/` canonicals to the content sitemap before the public application is confirmed to serve those routes. Production route verification must precede status transition to `published`.
