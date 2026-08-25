# V7 critical guide rewrites — batch 001

## Current checkpoint — 2026-08-25

This batch contains two high-sensitivity V7 Care Guides:

1. `care-guide-suicide-risk-conversation-safety-plan`
2. `care-guide-self-harm-family-safety-support`

Both pages remain published at their existing canonical URLs with their rewritten topic-specific content preserved. The post-rewrite corpus audit remains clean: exact and normalized duplicate-paragraph metrics are 0%, the central disclaimer contract remains intact, and both pages retain their source/claim mappings.

Production had already moved both records to `index,follow` while their 2026-08-16 review-hold provenance still described them as pending review. On 2026-08-25 the release metadata was normalized after the Rawafid team review checkpoint:

- reviewer: `فريق روافد`
- reviewer credentials: `فريق التدقيق والتحرير المؤسسي — منصة روافد`
- fresh `last_reviewed_at` recorded
- `content_quality_hold.status = released_after_fresh_rawafid_review`
- `robots_index=true`, `robots_follow=true`
- `review_visibility=metadata_only`

The `metadata_only` visibility rule is deliberate: review provenance is available to structured data and technical SEO, but the hidden-SEO pass does not add review badges, review dates, or reviewer labels to the visible page. No public body text, CSS, route, canonical, or page layout is changed by this release normalization.

## Historical 2026-08-16 checkpoint

The two pages were originally held after a full-corpus V7 template-duplication audit. Their generic V7 operational-template tail was removed and replaced with topic-specific safety/follow-up material. Because that was a substantive rewrite, the then-current Rawafid review timestamp was reset and the records were intentionally held as `noindex,follow` pending a fresh review.

That historical hold is preserved in migration lineage and `revision_provenance`, but it is superseded by the 2026-08-25 reviewed release state.

## Rewrite quality evidence

### Suicide-risk conversation / safety-plan guide

- body words: **2,447**
- substantive paragraphs: **23**
- exact duplicate paragraph %: **0.0%**
- normalized duplicate paragraph %: **0.0%**
- normalized duplicate substantive-word %: **0.0%**
- references: **9**
- claim-source mappings: **6**
- unresolved claim-source keys: **0**

### Self-harm family safety guide

- body words: **2,328**
- substantive paragraphs: **24**
- exact duplicate paragraph %: **0.0%**
- normalized duplicate paragraph %: **0.0%**
- normalized duplicate substantive-word %: **0.0%**
- references: **9**
- claim-source mappings: **7**
- unresolved claim-source keys: **0**

For both records, `body_json` / `body_text` synchronization had already passed and the row-level disclaimer remains empty in favor of the central `/disclaimer` contract.

## Migration lineage

1. `20260816150925_rewrite_v7_critical_suicide_self_harm_guides.sql` — material rewrite and review reset.
2. `20260816151133_finalize_v7_critical_rewrite_audit.sql` — post-rewrite quality hold and metrics.
3. `20260816152739_reconcile_v7_critical_rewrite_reproducibility.sql` — reproducibility/evidence-key reconciliation.
4. `20260825012519_release_reviewed_v7_critical_guides_20260825.sql` — reviewed release metadata normalization.
5. `20260825012635_preserve_care_guide_visual_review_parity_20260825.sql` — metadata-only review visibility for visual parity.

## Runtime regression gate

`scripts/v7-critical-guide-rewrites-001-smoke.mjs` now requires, for both routes:

- direct HTTP 200;
- `index,follow` without `noindex/nofollow`;
- exact canonical;
- central disclaimer and references;
- topic-specific rewrite markers;
- absence of the removed generic V7 template marker;
- structured `lastReviewed` and `reviewedBy` provenance;
- no leakage of metadata-only review labels/dates into the visible page.

## Release decision

Both rewritten pages are now reviewed, released, canonical and indexable. The historical noindex hold remains documented as audit history only.
