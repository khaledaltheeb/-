# Rawafid V3 — Full Legacy Migration Status

Status date: 2026-08-16

## Source of truth

The migration does not treat the legacy repository checkout alone as the production site. The primary source is the latest validated production artifact from `khaledaltheeb/healthrenewal.org`, with repository history retained as secondary provenance.

Validated production source used for the current run:

- Artifact: `validated-production-site`
- Artifact ID: `9238517196`
- Legacy source SHA: `5a48c4bc4abb1b63b05fac64580a3463759b41b5`
- Artifact digest: `sha256:e657d2cde228c281d6fca80f130f15f06fc2791d344724d929d897cf2590158f`
- HTML pages: **5,642**
- Encyclopedia detail pages: **2,000**
- Quick Info detail pages: **395** plus the Quick Info hub

## Preservation result

All **5,642 / 5,642** production HTML pages are preserved in the private Supabase migration ledger.

Validated invariants:

- family mismatches: **0**
- missing source identity/SHA: **0**
- duplicate `source_key`: **0**
- unresolved migration decisions: **0**

The private migration tables have RLS enabled and are not exposed to `anon` or `authenticated` clients.

## Current migration disposition

Every production page has an explicit disposition. Preservation and publication are separate decisions.

| Decision | Pages | Meaning |
|---|---:|---|
| `PROMOTED_DRAFT` | **4,744** | Knowledge is preserved in `public.content` as Draft + `robots_index=false`, or as a linked editorial landing Draft, with source provenance. |
| `MATCH_VERIFIED` | **211** | Existing V3 content has explicit provenance or all substantive legacy blocks were accounted for by exact/high-confidence comparison. |
| `MERGE_REVIEW` | **190** | Unique legacy knowledge or an intended consolidation still requires review/merge before closeout. |
| `LANDING_REVIEW` | **72** | Sector/category/hub/institutional landing knowledge still requires a deliberate V3 taxonomy/landing mapping. |
| `INTERACTIVE_REVIEW` | **375** | Assessment/tool/account/calendar/search functionality requires functional parity, not static text copying. |
| `ASSET_REVIEW` | **12** | Resource/download/worksheet surfaces require asset-level parity. |
| `EXCLUDE_DEVELOPMENT` | **29** | Engineering/demo/development surfaces; preserved privately, not public content. |
| `EXCLUDE_OBSOLETE` | **9** | Moved/updated/verification/obsolete wrappers; preserved privately, not standalone public content. |
| `EXCLUDE_BASELINE` | **0** | No real knowledge page remains excluded merely because the editorial subject contains the word `baseline`. |

Total: **5,642**.

## Important classifier correction

An early classifier treated `baseline` as a possible template/development signal. That was too broad and produced false positives in real medical/education content.

All five remaining cases were manually re-evaluated and restored as real knowledge, including the dementia baseline change record, IEP present-level baseline tool, measurable IEP baseline guide, classroom participation baseline guide, and PLAAFP baseline reference.

The rule is now: publication exclusions depend on page identity/function, never incidental editorial vocabulary.

## CMS promotion safety

Migrated content is not bulk-published. Newly promoted records use:

- `status = draft`;
- `robots_index = false`;
- preserved legacy canonical URL;
- semantic body blocks and body text;
- legacy SEO metadata;
- extracted references and legacy JSON-LD;
- source path, SHA, production artifact metadata and quality flags;
- `content_versions` versioning;
- the existing Rawafid release gate.

The reusable draft promoter also preserves legacy internal-link, image, source-URL and robots context in `schema_json` for future promotions. Existing release/originality/scientific guards were not disabled.

### Psychological encyclopedia

All **2,000** concept pages are preserved in the CMS as `glossary_term` Drafts, not as 2,000 diagnoses.

They remain noindex with `migration_phase = encyclopedia-last` and `encyclopedia_release_authorized = false` until encyclopedia-specific review/release is complete.

### Quick Info

- 395 legacy detail pages accounted for.
- 390 new entries promoted as noindex Draft articles.
- 5 existing V3 counterparts remain in merge comparison rather than being overwritten.
- Quick Info hub remains a landing-page review item, not a generic article.

### Care Guides

- 132 new guides promoted as noindex Drafts.
- existing V3 destinations were preserved rather than overwritten;
- unmatched legacy blocks are queued for merge review.

## Landing integration started

Rich legacy landing knowledge is being attached to the V3 taxonomy rather than recreated as duplicate sectors/categories.

Three confident mappings are already implemented as `landing_page` Drafts linked through `categories.editorial_content_id`:

1. `/sections/research-evidence-learning/` → category `research-evidence-learning`; legacy editorial body is about **12,301 words**.
2. `/sectors/child/` → category `child-adolescent-mental-health`.
3. `/sectors/family/` → category `parenting-family`.

`app/sections/[slug]/page.tsx` renders linked editorial content only after that content is actually Published. While the linked records remain Draft/noindex, there is no premature public change.

Old `home`, `women`, and `youth` landing pages have not been force-mapped because there is no sufficiently precise current taxonomy match yet.

## Content quality state

The promoted Draft set has no known accidental publication/indexing/canonical/duplicate-body failures:

- accidentally published migrated Drafts: **0**
- accidentally indexable migrated Drafts: **0**
- missing canonical URLs: **0**
- missing meta descriptions: **0**
- exact normalized body duplicate groups: **0**

A private quality queue is active. Current open classes include:

- `ymyl_missing_references`: **127** blocking pages;
- `scientific_review_required`: **50** blocking condition pages;
- `editorial_depth_insufficient`: **103** high-priority pages;
- `ymyl_reference_authority_review`: **39** high-priority pages whose references need authority review;
- `editorial_depth_insufficient`: **237** warning pages.

These are publication blockers/priorities, not deletion instructions.

### Evidence profile

For the current YMYL editorial set:

- YMYL pages evaluated: **1,996**
- no extracted references: **127**
- references present but no hit in the conservative recognized-authority set: **39**
- at least one recognized authoritative source: **1,830**

High-frequency source families include WHO, NIMH/NIH, CDC, Cochrane, APA, NICE, UNICEF, PubMed/NCBI and other official/scientific bodies. Presence of a source does not itself prove every claim; final scientific review remains required where the release contract demands it.

## Existing-content merge protection

Canonical equality alone is not proof that old knowledge was preserved.

Substantive legacy paragraphs/lists/tables/headings were compared against current V3 content. Unaccounted material is stored in `private.legacy_merge_candidates`.

High-confidence comparison uses exact matching or a conservative trigram similarity threshold of **0.90 or higher**. No lower threshold is auto-accepted.

Current comparison results:

- legacy blocks accounted for at high confidence: **350** across **97** pages;
- pages newly upgraded to verified by block-accounting: **86**;
- remaining candidate blocks: **5,352** across **150** pages;
- total pages still in `MERGE_REVIEW`: **190**.

The queue is deliberately conservative: a rewritten paragraph may remain a candidate even when its meaning is already represented, so candidates are reviewed rather than blindly appended.

## Media migration

Media was materialized from the same validated production artifact, not scraped from the live website.

- unique referenced image paths found: **400**
- images copied: **400**
- missing image files: **0**
- copied bytes: **18,335,048** (~17.5 MiB)
- paths are preserved under V3 `public/` so historical image URLs can remain valid.

Two image paths have no ordinary `<img alt>` value in the legacy markup; they are logo/decorative/metadata-backed cases and require accessibility semantics review rather than invented alt text.

## Internal-link preservation

The source ledger preserves internal-link targets separately from semantic text blocks. A private indexed route registry exists for exact historical-route accounting and link-integrity checks.

The first audit found **39,681** internal link references. The majority point to preserved historical targets. Remaining unknown/excluded targets require final classification against V3 static routes and intentionally retired wrappers before they can be called broken links.

Inline link/media semantics are not declared complete merely because text has been imported. They are incorporated and revalidated per release batch so normal content release triggers remain active; migration does not disable those triggers for bulk convenience.

## Repository and schema hygiene

The ~180 MB JSON migration payload shuttle was used only to transfer the validated production baseline into private Supabase staging. It was removed from the migration branch after successful ingestion.

Permanent repository state retains deterministic extract/materialize tools, migration policies/evidence, the 400 required media assets, and Supabase migrations for the audit infrastructure and secure ingest/promote functions.

The global catch-all legacy route experiment was removed because it interfered with strict 404 behavior. Legacy URL preservation will use specialized namespace/exact-known-route mechanisms only as each family becomes publication-ready.

## CI state

The migration branch has previously passed all three core checks together after the global catch-all was removed:

- Full Legacy Migration Inventory
- Cloudflare Workers Validate
- Rawafid Quality Gate

New schema/landing commits continue to be revalidated before merge.

## Completion definition

The source-preservation phase is complete. The full merger is **not** declared complete yet.

Final closeout requires all of the following:

1. remaining merge-review candidates resolved without silent information loss;
2. remaining landing-page knowledge mapped into the correct V3 sector/category/hub surfaces;
3. interactive surfaces rebuilt with functional parity or intentionally retired with a documented decision;
4. asset-review items resolved;
5. blocking YMYL/scientific/evidence issues resolved;
6. exact/namespace routing enabled for approved legacy canonicals;
7. internal-link audit closed;
8. release gates pass for every published batch;
9. indexing enabled only after canonical/sitemap/robots/route validation;
10. final coverage remains 100% with no unresolved migration decision.
