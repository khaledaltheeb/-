# Rawafid V3 — Library Migration Plan

## Scope

This workstream owns the legacy knowledge library at `https://healthrenewal.org/library/` and every historical descendant route that belongs to that section.

The source repository is `khaledaltheeb/healthrenewal.org`. The destination repository is `khaledaltheeb/-`. The source is read-only for migration purposes: text, semantic structure, references, metadata and historical URL evidence may be extracted; legacy theme, CSS, JavaScript, headers, footers, layouts and components must not be copied.

## Migration objective

The objective is not a 1:1 file copy. The library becomes a coherent knowledge collection on Rawafid V3 backed by the central `content` entity, dynamic taxonomy, search, related-content relations and the redirect registry.

Every historical library URL must end in exactly one reviewed state:

1. preserved as a canonical destination;
2. merged into a stronger canonical content entity with a 301 redirect;
3. expanded before import because the source is too weak;
4. recovered from a structured historical source when generated HTML is missing;
5. retained as a non-HTML resource with an explicit destination policy; or
6. rejected from publication with a documented reason.

No historical page may silently disappear.

## Baseline observed on 2026-08-08

The live legacy section is internally inconsistent: the library hub exposes counters that do not match the current collection pages. The collection pages currently report at least:

- `branches`: 45 entries;
- `therapies`: 47 entries;
- `research`: 48 entries;
- `evidence-literacy`: a separate evidence-reading collection whose authoritative count must come from the generated inventory rather than a hard-coded UI number.

The branches, therapies and research collections also expose modern descriptive entries alongside older “foundational” entries. Some historical entries use numeric-style slugs and overlap semantically with newer descriptive routes. These are merge/redirect candidates, not pages to duplicate in V3.

The destination database already contains 22 active `301` redirects whose source is under `/library/`. All 22 destinations are published `/content/...` entities. A database quality check on this protected subset found:

- minimum body depth: 1,571 words;
- average body depth: approximately 2,100 words;
- maximum body depth: 2,920 words;
- pages below 1,500 words: 0;
- pages without references: 0;
- pages with incomplete core SEO fields: 0.

These 22 routes are treated as a protected migrated subset. They must not be recreated under competing slugs or have their redirects replaced without a specific canonical review.

## Canonical URL policy

Rawafid V3 uses one canonical content entity per topic.

- Already migrated library entries that canonicalize to `/content/{slug}` keep that canonical unless a later SEO migration decision proves a change is necessary.
- Historical `/library/...` item URLs may redirect to the canonical content entity.
- `/library/` remains a first-class knowledge hub/collection route in the new information architecture, not a duplicate article store.
- Collection landing pages such as branches, therapies, research and evidence literacy may be implemented as searchable/filterable hubs that reference canonical content entities.
- A canonical URL must resolve to a real destination before any redirect is activated.
- Redirect chains and redirects to unpublished content are prohibited.

This policy preserves historical URL equity while avoiding two indexable copies of the same article.

## Content quality gate

The migration audit flags individual knowledge pages below 1,500 words for expansion. This is a quality review threshold, not a filler target. A page may exceed the threshold substantially when the search intent requires it.

Before a library content entity can be released, verify:

- the page answers a defined user/search intent;
- useful information from all genuine historical variants has been merged;
- no exact or near-duplicate canonical entity remains;
- title, H1, SEO title and meta description are deliberate and non-spammy;
- primary keyword, secondary terms and semantic terms are coherent;
- references are present and appropriate for the claims;
- health/psychology claims meet the platform editorial and review policy;
- structured content renders correctly on mobile and desktop;
- canonical URL resolves successfully;
- historical source URLs are stored in the migration record and redirect map;
- `robots_index` remains disabled until the page and redirect mapping pass release checks.

## Automated audit

`scripts/library_migration_audit.py` consumes the semantic inventory produced by `scripts/legacy_content_extract.py` and filters the scope to `/library/`.

It reports:

- collection counts discovered from source URLs;
- missing or structurally recoverable pages;
- pages below the configured content-depth floor;
- legacy `noindex` pages;
- numeric/foundational route candidates;
- legacy canonical mismatches;
- exact normalized body duplicates;
- duplicate H1/title clusters;
- a per-page recommended review action.

The audit is intentionally read-only. Duplicate detection produces review candidates; it never performs an automatic merge or publication.

Outputs:

- `artifacts/library-migration-plan.json`
- `artifacts/library-migration-report.md`

The GitHub workflow uploads these files with the full legacy inventory and destination coverage report.

## Execution phases

### Phase 1 — Inventory and protection

- Generate a deterministic inventory of every discoverable `/library/` URL.
- Protect the 22 already migrated routes from accidental duplication/regression.
- Identify missing HTML with recoverable structured sources.
- Record stale hub counters as presentation defects; never use them as migration truth.

### Phase 2 — Deduplication and canonical mapping

- Cluster exact duplicates first.
- Review title/H1 collisions and semantically overlapping foundational/modern entries.
- Select one canonical content entity for each genuine topic.
- Build a source URL → destination URL map with no redirect chains.

### Phase 3 — Editorial upgrade

For every page not already protected as migrated:

- retain all unique useful source information;
- remove obsolete duplication and template filler;
- expand weak pages according to actual intent;
- strengthen references and evidence framing;
- create useful headings, FAQ blocks only when warranted, internal relations and semantic metadata;
- verify mobile readability and accessibility in the V3 renderer.

### Phase 4 — Dry run

- Import into a non-public/draft state only after the global V3 migration gate permits content import.
- Validate taxonomy, source history, redirects, SEO fields, structured blocks and rendering.
- Compare destination coverage against the complete source inventory.

### Phase 5 — Release

- Publish only reviewed canonical entities.
- Activate corresponding redirects atomically.
- expose `/library/` and collection hubs only when their destination dataset is complete enough to be useful;
- verify 200/301/404 behavior, canonical tags, sitemap inclusion, robots state and internal links;
- monitor indexation/coverage after domain cutover.

## Non-negotiable rules

- No blind copy of legacy HTML.
- No duplicate canonical pages for the same topic.
- No deletion of unique useful information during consolidation.
- No 301 to a missing, draft or irrelevant destination.
- No publication merely because a build succeeds.
- No hard-coded library counts when the source inventory can compute them.
- No weakening of the 22 already migrated pages.
- No claim that the library migration is complete until source coverage and destination routing reach a reviewed 100% state.
