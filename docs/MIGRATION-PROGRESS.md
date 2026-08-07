# Rawafid — Migration Progress Ledger

Last updated: 2026-08-07

## Current phase

**PAGE-BY-PAGE LEGACY AUDIT — ACTIVE**

No legacy page is considered migrated unless it has its own completed record in this ledger.

## Mandatory operating rule

Migration proceeds **one canonical page at a time**. A second page is not started until the current page has completed:

`Discovery → Variant history → Dedupe cluster → Exclusions → Source verification → Rewrite → SEO/E-E-A-T → CMS draft → Review → Redirect map → QA → Final status`

If there is uncertainty that the next candidate is a duplicate/synonym/older version of the current topic, work stops and the relationship is resolved before another page is created.

## Platform readiness verified before legacy migration

- New platform uses a dynamic Supabase taxonomy and structured CMS; no legacy theme/CSS/layout is imported.
- Structured content supports headings, paragraphs, lists, tables, callouts, quotes, external sources, inline images with Alt, and FAQ blocks.
- SEO/E-E-A-T fields and release gates exist before approval/publishing.
- Version history and audit trail exist.
- Tags and multi-category relations are supported.
- Scheduled publishing and version restore have been added in final hardening.
- Sitemap architecture has been hardened for large content volumes.
- Supabase Security Advisor reported no active security lints after the latest database hardening.

## Legacy repository audit facts verified

Source repository: `khaledaltheeb/healthrenewal.org`

- Large generated/static repository with version-like and enrichment/generator directories.
- GitHub code search on the current default branch reports hundreds of HTML/JSON/Markdown files, but this is **not** treated as the final unique-page count.
- Historical Git history and generated layers must be inspected for each topic because multiple files/commits may represent the same page.
- Internal planning files, workflow artifacts, agent instructions, TODO/QA notes, generator fragments, and development discussions are **not publishable content**.

## Per-page record template

### MIG-000001 — [Canonical topic/title]

- Status: NOT STARTED
- Candidate canonical slug:
- Intended content type:
- Sector:
- Primary category:
- Additional categories:
- Audience(s):
- Tags:
- Current legacy URLs/files inspected:
- Historical variants/commits inspected:
- Duplicate/synonym cluster:
- Internal/non-public text excluded:
- Useful legacy material retained as facts/ideas:
- Official/primary definition source:
- Additional authoritative references:
- Search intent:
- Primary keyword/entity:
- Secondary/semantic terms:
- Target questions/FAQ:
- H1:
- Planned H2/H3 structure:
- Estimated useful word count:
- Old URLs requiring redirect:
- New CMS content id:
- Version created:
- Scientific review:
- Editorial review:
- SEO review:
- Accessibility review:
- Published/scheduled status:
- Post-build QA:
- Notes:

## Completed pages

None yet.

## Next action

Select exactly one legacy topic/page, discover all its current and historical variants, and complete `MIG-000001` before selecting another topic.
