# Rawafid SEO audit state

This directory is an internal, non-user-facing SEO control plane. It must never be rendered into page HTML or used as hidden keyword text.

## Operating rules

- Every run starts from the current production inventory and latest repository head.
- Process 50 published pages per batch: unreviewed first, then oldest successful audit.
- A page is complete only after validation and, when code changes are required, successful release verification.
- Published unique editorial URLs remain index/follow and self-canonical. Technical duplicates may be handled separately without deleting editorial content.
- Query variants, misspellings, transliterations, regional wording and secondary intents live here for planning; they are not injected as hidden text or meta-keywords.
- No fabricated author, reviewer, source, partner, citation, sameAs or review date.
- `dateModified` and sitemap `lastmod` must only be emitted from verified substantive-change provenance, never from a generic technical `updated_at` timestamp.
- Content gaps are queued for editorial agents rather than auto-published by the SEO process.

## Persistent files

- `inventory.json`: round cursor, totals and site-level diagnostics.
- `batches/*.md`: immutable human-readable batch reports.
- `locks/*.json`: batch ownership/status to prevent concurrent processing of the same URLs.
- `query-map.ndjson`: audited primary query-to-URL ownership and topic-cluster records.
- `opportunities.md`: editorial and technical opportunities that must not be auto-published by SEO runs.

## Per-page minimum ledger fields

URL, page type, topic cluster, primary intent, primary query, secondary intents, entity set, vocabulary/query variants when verified, last audit time, fields changed, validation result, warnings, editorial opportunities, and internal-link actions.
