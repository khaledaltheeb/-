# V7 critical guide rewrites — batch 001

## Scope

This batch rewrites two high-sensitivity V7 Care Guides that were held by the full-corpus template-duplication audit:

1. `care-guide-suicide-risk-conversation-safety-plan`
2. `care-guide-self-harm-family-safety-support`

The pages remain published and directly accessible, but `noindex,follow`. No redirects or deletions are introduced.

This is a stacked change on top of the Wave 004 hardening branch. Repository quality workflows are configured to run for pull requests targeting `main`, so the stacked PR may temporarily target `main` while its exact head is validated, then return to the Wave 004 base branch after the checks complete. The rewrite branch itself must be verified as `behind=0` relative to both its stacked base and current `main` at the final validation checkpoint.

## Editorial method

The useful topic-specific material that preceded the generic V7 tail was preserved. The repeated tail beginning at `إطار التنفيذ والمتابعة الموسّع` was removed and replaced with topic-specific crisis/safety material only.

The rewrite was grounded in official guidance and first-party health sources already present in the site evidence layer, with direct source checks against:

- NICE NG225 — Self-harm: assessment, management and preventing recurrence;
- NIMH — 5 Action Steps to Help Someone Having Thoughts of Suicide;
- NIMH — Frequently Asked Questions About Suicide;
- WHO mhGAP — Safety planning interventions / self-harm and suicide evidence resources;
- existing SAMHSA crisis/care-transition references where applicable.

No self-harm or suicide-method instructions were added. The public copy stays focused on recognition, direct conversation, urgent escalation, collaborative safety planning, continuity of care, privacy, and follow-up.

## Review provenance

Both source pages previously had `last_reviewed_at = 2026-08-14T10:37:38.687232+00:00`, which under project policy represents a completed review by فريق روافد.

Because this batch materially changes the public text, the new versions must not inherit that review claim. The rewrite migration therefore:

- stores the prior review timestamp in `schema_json.revision_provenance`;
- sets `last_reviewed_at = null` on the rewritten version;
- leaves the pages `noindex,follow`;
- sets the hold state to `rewrite_completed_pending_rawafid_review` after re-audit.

A fresh `lastReviewed` date must only be recorded after فريق روافد reviews the new text.

## Exact migration lineage and reproducibility

The live database history is preserved exactly rather than rewritten after the fact:

1. `20260816150925_rewrite_v7_critical_suicide_self_harm_guides.sql` — material rewrite, review reset and initial safety hold.
2. `20260816151133_finalize_v7_critical_rewrite_audit.sql` — the exact small finalization SQL that was actually applied under version `20260816151133`.
3. `20260816152739_reconcile_v7_critical_rewrite_reproducibility.sql` — idempotent reconciliation for the later source-key normalization, pre/post duplicate metrics and originality-report state that had initially been verified through targeted QA SQL.

The third migration exists specifically so a clean replay reaches the same state as live Supabase **without changing the contents of an already-applied historical migration**. It also asserts the release-safety invariants: both pages remain `noindex,follow`, have no current `last_reviewed_at`, carry `post_rewrite_verified`, and preserve the normalized WHO safety-planning evidence key where used.

## Full-corpus duplication re-audit

The exact algorithm from `20260816141217_hold_v7_template_duplicated_guides.sql` was rerun across the complete published V7 `care-guide`/`guide` corpus.

### Suicide-risk conversation / safety-plan guide

Before rewrite:

- substantive paragraphs: 35
- exact duplicate paragraph %: 22.9%
- normalized duplicate paragraph %: 51.4%
- normalized duplicate substantive-word %: **53.2%**

After rewrite:

- body words: **2,447**
- substantive paragraphs: 23
- exact duplicate paragraph %: **0.0%**
- normalized duplicate paragraph %: **0.0%**
- normalized duplicate substantive-word %: **0.0%**
- references: **9**
- claim-source mappings: **6**
- unresolved claim-source keys: **0**

### Self-harm family safety guide

Before rewrite:

- substantive paragraphs: 34
- exact duplicate paragraph %: 23.5%
- normalized duplicate paragraph %: 52.9%
- normalized duplicate substantive-word %: **59.5%**

After rewrite:

- body words: **2,328**
- substantive paragraphs: 24
- exact duplicate paragraph %: **0.0%**
- normalized duplicate paragraph %: **0.0%**
- normalized duplicate substantive-word %: **0.0%**
- references: **9**
- claim-source mappings: **7**
- unresolved claim-source keys: **0**

For both records, `body_json` / `body_text` synchronization passed, row-level disclaimer remains empty, and the central `/disclaimer` contract remains intact.

## Runtime regression gate

`scripts/v7-critical-guide-rewrites-001-smoke.mjs` is included in `npm run smoke` and requires, for both routes:

- direct HTTP 200;
- `noindex,follow` without `nofollow`;
- exact canonical;
- visible central disclaimer link;
- references section;
- topic-specific rewrite markers;
- absence of the removed `إطار التنفيذ والمتابعة الموسّع` marker;
- absence of `آخر مراجعة` / JSON-LD `lastReviewed` until a fresh Rawafid review is recorded.

## Release decision

**Do not re-index either page in this batch.**

The template-duplication defect has been repaired and re-audited, but the new versions still require a fresh review by فريق روافد. Re-indexing is a separate explicit release decision after that review.
