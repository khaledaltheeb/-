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
- Legacy guides migrated into enriched V3 draft records: **5 / 101**.
- Section hub draft: **1**.
- Total records currently under `/care-guides/`: **6**.
- All six records remain `draft` until production deployment of the new route is independently verified.

### `care-guides-hub`

- Canonical: `/care-guides/`
- State: `draft`
- Approximate Arabic word count: 1,814
- SEO title: 29 characters
- Meta description: 153 characters
- Role: `hub`

### `care-guide-support-person-in-distress`

- Legacy slug: `support-person-in-distress`
- Canonical: `/care-guides/support-person-in-distress/`
- State: `draft`
- Approximate Arabic word count: 2,423
- SEO title: 29 characters
- Meta description: 152 characters
- Authoritative references: 4
- Expanded scope: immediate safety, first conversation, practical support, self-harm/suicide risk, privacy, children/adolescents, disability/communication needs, caregiver boundaries, escalation, follow-up, and visible search-intent FAQ.

### `care-guide-panic-attack-immediate-support`

- Legacy slug: `panic-attack-immediate-support`
- Canonical: `/care-guides/panic-attack-immediate-support/`
- State: `draft`
- Approximate Arabic word count: 2,160
- SEO title: 29 characters
- Meta description: 151 characters
- Authoritative references: 4 (NICE, NHS, NIMH).
- Scope decision: `retain-separate` from `/comparisons/panic-attack-vs-panic-disorder/`; immediate-action intent is materially different from comparison/differential intent.

### `care-guide-suicide-risk-conversation-safety-plan`

- Legacy slug: `suicide-risk-conversation-safety-plan`
- Canonical: `/care-guides/suicide-risk-conversation-safety-plan/`
- State: `draft`
- Approximate Arabic word count: 2,131
- SEO title: 32 characters
- Meta description: 156 characters
- Authoritative references: 4 (NIMH, NICE, WHO).
- Expanded scope: direct asking, imminent-risk escalation, collaborative safety planning, safer environment, confidentiality boundaries, children/adolescents, communication needs, substance/psychosis context, follow-up, and supporter boundaries.

### `care-guide-agitation-aggression-deescalation`

- Legacy slug: `agitation-aggression-deescalation`
- Canonical: `/care-guides/agitation-aggression-deescalation/`
- State: `draft`
- Approximate Arabic word count: 2,253
- SEO title: 31 characters
- Meta description: 153 characters
- Authoritative references: 3 (NICE NG10).
- Scope decision: `retain-separate` from assertiveness/aggression comparison and nonviolent-communication content; this page answers immediate de-escalation and safety intent.
- Safety boundary: does not teach physical restraint, weapon disarming, or unsupervised medication use.

### `care-guide-first-72-hours-after-traumatic-event`

- Legacy slug: `first-72-hours-after-traumatic-event`
- Canonical: `/care-guides/first-72-hours-after-traumatic-event/`
- State: `draft`
- Approximate Arabic word count: 2,352
- SEO title: 24 characters
- Meta description: 153 characters
- Authoritative references: 5 (WHO, VA National Center for PTSD, NICE).
- Scope decision: `retain-separate` from `/comparisons/trauma-vs-ptsd/`; the care guide answers immediate post-event support rather than diagnostic/conceptual differentiation.
- Safety/evidence boundary: prioritizes physical safety and practical assistance, does not force trauma narration, and distinguishes early stress reactions from a PTSD diagnosis.

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

The dedicated route code is now in `main`, but public deployment has not yet been independently verified. GitHub currently exposes no repository deployment records and there is no deployment workflow in the repository that establishes the public target.

Therefore all six records remain drafts intentionally. Publishing them prematurely could expose `/care-guides/` canonicals to the content sitemap before the public application is confirmed to serve those routes. Production route verification must precede the status transition to `published`.
