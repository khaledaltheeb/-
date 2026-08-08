# Care Guides migration — working register

## Scope

Target public section: `/care-guides/` and descendants.

Legacy source repository: `khaledaltheeb/healthrenewal.org`.
Destination repository: `khaledaltheeb/-` (Rawafid V3).

The legacy repository is a content and historical-URL source only. Theme, CSS, layout, page chrome, and scripts are not migrated.

## Baseline discovered before import

- Legacy care-guides publisher declares 101 source guides in total.
- The legacy institutional catalog declares 87 generated/institutional guide topics; the remaining legacy source set is handled from the `content/v18/care-guides*.json` files.
- Rawafid V3 already contained 142 rows with `content_type = guide` before this migration started.
- Rawafid V3 contained zero rows with a canonical URL under `/care-guides/` before this migration started.
- Existing V3 guides under other dedicated modules are not automatically duplicated into `/care-guides/`. Matching and canonical decisions come first.

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

Branch: `agent/care-guides-foundation`

- `app/care-guides/page.tsx` — dedicated hub route.
- `app/care-guides/[...slug]/page.tsx` — nested guide routes, including compatibility with historically nested branches when retained.
- `lib/care-guides.ts` — canonical lookup and care-guide data access from the central `content` entity.
- `components/care-guide-page.tsx` — V3 renderer using the institutional header/footer, ContentRenderer, breadcrumbs, Article/CollectionPage JSON-LD, visible FAQ JSON-LD, references, audience tags, and disclaimer.
- `components/care-guide-page.module.css` — scoped responsive styling only; no legacy visual code copied.

## Content migrated so far

### `care-guides-hub`

- Canonical: `/care-guides/`
- State: `draft`
- Approximate Arabic word count at import: 1,814
- SEO title: 29 characters
- Meta description: 153 characters
- Role: `hub`

### `care-guide-support-person-in-distress`

- Legacy slug: `support-person-in-distress`
- Canonical: `/care-guides/support-person-in-distress/`
- State: `draft`
- Approximate Arabic word count at import: 2,423
- SEO title: 29 characters
- Meta description: 152 characters
- Authoritative references recorded: 4
- Expanded scope: immediate safety, first conversation, practical support, self-harm/suicide risk, privacy, children/adolescents, disability/communication needs, caregiver boundaries, escalation, follow-up, and visible search-intent FAQ.

## Publication guard

The two records above remain drafts intentionally. Publishing them before the `/care-guides/` route is merged and deployed would allow the existing content sitemap to expose canonical URLs that the production application cannot yet serve. Route deployment and validation must therefore precede status transition to `published`.
