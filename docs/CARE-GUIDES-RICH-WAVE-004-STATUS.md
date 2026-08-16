# Care Guides rich expansion — Wave 004

## Scope

Wave 004 contains exactly **50 evidence-led search intents**. The current materialized set remains intentionally small while quality, provenance, rendering and review controls are hardened.

The legacy repository is provenance/content input only. The active implementation is the Rawafid V3 repository plus Supabase.

## Current Wave 004 checkpoint — 2026-08-16

Live Supabase state:

- **12/50 records materialized**
- **11 published + noindex + follow** under the Wave 004 quality hold
- **1 draft + noindex + follow**: `/care-guides/care-guide-dual-task-attention-limit/`
- **38 intents unmaterialized**
- **0 indexable Wave 004 records**
- **0 records with `publication_ready=true`**
- **0/12 with `last_reviewed_at`, reviewer name or reviewer credentials**
- **12/12 with `schema_json.evidence_audit` and `human_review_required=true`**
- useful Arabic depth: **3,020–3,973 words**
- references: **6–11/page**
- claim-source mappings: **5–11/page**
- **0 duplicate paragraph groups**
- **0 duplicate heading groups**
- **0 duplicate reference-ID groups within pages**
- **0 unresolved claim-source IDs**
- **0 `body_json/body_text` heading/paragraph synchronization gaps**
- **0 exact cross-page duplicate substantive paragraph groups**
- SEO descriptions: **150–160 characters**
- exact central disclaimer contract on all 12
- row-level `medical_disclaimer` empty/null on all 12

The 11 previously published pages remain directly accessible. They are excluded from indexing without deletion or redirects, and their canonicals remain unchanged.

## Review provenance policy

Project policy is explicit:

- a non-null **`last_reviewed_at` means a completed review by فريق روافد**;
- when `reviewer_display_name` is recorded, that named reviewer is displayed and emitted as the reviewer;
- when no individual reviewer is recorded, the reviewer is emitted as the **Rawafid review team organization (`فريق روافد`)**;
- `lastReviewed` is not interpreted as a generic automated update timestamp.

The policy is centralized in `lib/review-provenance.ts` and enforced by `scripts/review-provenance-contract.mjs` across the main public content surfaces.

Supabase migration `20260816144830_document_rawafid_team_last_reviewed_policy` documents the same semantic contract directly on `public.content.last_reviewed_at`. It supersedes the temporary contrary assumption recorded in the earlier `20260816141759_remove_inferred_team_review_provenance` migration.

Current estate audit records **613 rows with `last_reviewed_at`**: **542** use the Rawafid-team organization fallback because no individual reviewer is named, and **71** have a named reviewer. Wave 004 remains unaffected because its 12 current records have no review date yet.

## Wave 004 evidence remediation

The complete 12-page materialized set has completed the automated source-layer audit. Sources and claim mappings were strengthened only where a real evidence or boundary-condition gap was found; pages were not padded to meet counts.

Key remediations include:

- cognitive flexibility/task switching: task-switch cost, advance preparation, interruption/resumption and context-dependent flexibility;
- working memory/task breakdown: working-memory models, capacity caveats, chunking, external representations and cognitive offloading;
- metacognition: delayed judgment-of-learning accuracy plus monitoring/control evidence;
- retrieval practice: transfer evidence plus a direct boundary-condition source;
- spaced practice: evidence that useful spacing depends on intended retention interval rather than one universal gap;
- selective attention: interruption/resumption evidence added to distractor-suppression sources;
- cognitive load, inhibitory control, prospective memory, speed/accuracy and sustained attention: direct topic-specific evidence rechecked and retained where adequate.

`care-guide-dual-task-attention-limit` remains Draft + Noindex. Its prior row-level disclaimer and SEO-description blockers are closed. Human review and final rendered-page inspection still block release.

## Source registry

`data/migration-batches/care-guides-rich-wave-004.sources.json` is the consolidated registry:

- **40 unique Reference IDs** used by the 12 materialized records
- **52 source records** retained, including authoritative sources for future intents
- **0 live Reference IDs missing from the registry**
- **0 live Reference IDs with multiple metadata variants**

The dated audit artifact is `data/migration-batches/care-guides-rich-wave-004.evidence-audit-2026-08-16.json`. It explicitly records `publication_authorization=false` and `human_review_required=true`.

## Wave 004 release enforcement

For V8+ Care Guides generally:

- `robots_index=true` requires `status=published` and `publication_ready=true`;
- release/readiness changes must preserve the central disclaimer contract;
- row-level `medical_disclaimer` remains empty under that model.

For Wave 004 specifically, readiness/re-indexing additionally requires:

- genuine recorded review evidence;
- reviewer credentials when an individual reviewer is used;
- a non-future review date;
- reviewer independence from the visible author for individual-review release decisions;
- at least **3,000 useful Arabic words**;
- at least **5 references**;
- at least **5 claim-source mappings**.

Automated checks cannot authorize YMYL publication. The current 12 records remain `publication_ready=false` and non-indexable.

## V7 template-duplication estate audit

A separate full-corpus audit found a material legacy quality problem in V7 Care/Evidence Guides: large groups reused substantial substantive prose with only topic substitutions.

The repository migration `20260816141217_hold_v7_template_duplicated_guides.sql` measures the **complete published V7 corpus**, not only currently indexable rows. A page is held when any of these high-confidence conditions is met:

- exact duplicate substantive paragraphs >= **40%**;
- primary-keyword-normalized duplicate substantive paragraphs >= **50%**;
- primary-keyword-normalized duplicate substantive-paragraph words >= **50%**.

Current live result:

- **150 V7 pages** carry `content_quality_hold.reason = full_v7_corpus_template_duplication`;
- **150/150 remain `status=published`**;
- **150/150 are `robots_index=false` + `robots_follow=true`**;
- **0 redirects** were introduced;
- content and canonical URLs are preserved in place.

This is a conservative quality hold, not deletion and not a claim that the remaining pages are perfect.

### Indexable Care Guides after the hold

Current indexable `/care-guides/` estate: **156 pages**:

- 75 V8 `care-guide` pages;
- 78 V7 `care-guide` pages;
- 1 V7 central childhood-OCD reference page;
- 1 V7 page without a page-role marker;
- 1 hub page.

For the remaining indexable V7 `care-guide` cohort, the latest normalized audit has no page at the high-confidence hold thresholds. The previously measured remaining cohort peaked at **28.1% normalized duplicate substantive paragraphs** and **21.9% normalized duplicate substantive-paragraph words**, so bulk noindex stops here and further work is page-level editorial improvement rather than another automatic purge.

### Evidence Guides after the hold

- indexable Evidence Guide detail pages: **0**;
- `/evidence-guides/` hub remains indexable: **1**.

The held detail pages remain directly accessible with `noindex,follow`.

## Keyword-intent collision audit

The two previously identified conflicts were resolved conservatively:

- the family Gaming Disorder page now targets a distinct family-intent primary keyword without changing its URL;
- the overlapping anxiety-vs-fear Evidence Guide is held out of the index rather than redirected or deleted.

Current audit across published indexable content reports **0 duplicate primary-keyword groups**.

## Rendered/runtime controls

`npm run smoke` includes `scripts/care-guides-wave-004-smoke.mjs`. Its contract covers the held Wave 004 routes that sitemap auditing cannot see:

- 11 published held Wave 004 routes must return HTTP 200;
- they must render `noindex,follow`;
- exact canonicals must remain present;
- the central `/disclaimer` link and references surface must render;
- `care-guide-dual-task-attention-limit` must remain unavailable while Draft.

`buildSeoMetadata` now keeps `follow` independent of `index`, preventing a `noindex,follow` database policy from collapsing into `nofollow` at render time.

## Validation rule

Every code or policy checkpoint must pass the fresh PR head, not an earlier green commit. Required checks include:

- Architecture/privacy/theme/content contracts;
- review-provenance contract;
- TypeScript;
- lint;
- Next/OpenNext build;
- Wave 004 rendered smoke;
- full sitemap/internal-link SEO gate;
- Lighthouse lab audit;
- Cloudflare Workers validation and branch deployment.

## Required gate / next work

**Keep PR #259 Draft.**

Wave 004 is not authorized for re-indexing. Before a Wave 004 page can be released it still needs:

1. final visual/manual rendered-page QA, including mobile/layout/accessibility inspection beyond automated HTML checks;
2. genuine recorded review under the Rawafid review policy;
3. explicit per-page release/re-index decision.

The remaining 38 Wave 004 intents stay unmaterialized until the current 12-page review queue is controlled.

The 150 held V7 template pages form a separate rewrite backlog. They should be rewritten for genuine topic specificity before any re-index decision; no automatic redirects or content deletion should be used as a substitute for that work.
