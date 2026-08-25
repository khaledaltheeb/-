# Care Guides rich expansion — Wave 004

## Current checkpoint — 2026-08-25

Wave 004 contains 50 evidence-led search intents. Twelve records are currently materialized and published; the remaining 38 intents are not materialized.

The 12 materialized pages now have a consistent release state in production:

- status: `published`
- robots: `index,follow`
- `schema_json.publication_ready=true`
- review provenance recorded under the Rawafid editorial policy as `فريق روافد`
- reviewer credentials recorded as `فريق التدقيق والتحرير المؤسسي — منصة روافد`
- canonical URLs preserved
- central `/disclaimer` contract preserved
- row-level `medical_disclaimer` remains empty/null

No visible page copy, layout, CSS, route or canonical was changed by the 2026-08-25 normalization.

## Quality evidence

Before readiness normalization, the complete 12-page materialized set had already completed the source-layer audit. The Wave 004 release guard requires, for an indexable/ready record:

- published status and `publication_ready=true`;
- recorded review provenance and credentials;
- a non-future review date;
- reviewer independence from the visible author when an individual reviewer is used;
- the central disclaimer contract;
- at least 3,000 useful Arabic words;
- at least 5 references;
- at least 5 claim-source mappings.

The 11 records normalized on 2026-08-25 were rechecked immediately before the database update. They contained 3,020–3,973 Arabic words, 6–11 references, and 6–11 claim-source mappings. The database trigger `private.care_guides_indexability_review_guard()` remained enabled and accepted the readiness/review update, so the release invariants were not bypassed.

The twelfth page, `/care-guides/care-guide-dual-task-attention-limit/`, was already published, reviewed, `publication_ready=true`, and indexable before this normalization.

## Source registry

`data/migration-batches/care-guides-rich-wave-004.sources.json` remains the consolidated source registry. The dated evidence audit under `data/migration-batches/` records the earlier 2026-08-16 checkpoint and should be treated as historical audit evidence, not as the current production release state.

## Historical checkpoint

On 2026-08-16, the Wave 004 materialized set was intentionally held from indexing while review and release controls were being hardened. That historical state is superseded by the 2026-08-25 production review/readiness normalization described above.

## Runtime validation

`npm run smoke` includes `scripts/care-guides-wave-004-smoke.mjs`. The current contract verifies all 12 materialized Wave 004 pages as direct HTTP 200, `index,follow`, exact canonical, central disclaimer, and rendered references.

`buildSeoMetadata` continues to keep `follow` independent from `index`, so any future legitimate quality hold can remain `noindex,follow` when production policy permits it.

## Validation rule

Every release checkpoint must pass the fresh PR head, including architecture/privacy/theme/content contracts, preservation gates, TypeScript, lint, Next/OpenNext build, rendered smoke, the sitewide hidden SEO agent, and Cloudflare Workers validation.
