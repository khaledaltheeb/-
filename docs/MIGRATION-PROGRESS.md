# Rawafid — Migration Progress Ledger

Last updated: 2026-08-07

## Current phase

**PAGE-BY-PAGE LEGACY MIGRATION — ACTIVE**

No legacy page is considered migrated unless it has its own completed record in this ledger.

## Mandatory operating rule

Migration proceeds **one canonical page at a time per lane**. A lane does not start a second page until the current page has completed:

`Discovery → Variant history → Dedupe cluster → Exclusions → Source verification → Rewrite → SEO/E-E-A-T → CMS draft → Review → Redirect map → QA → Final status`

If there is uncertainty that the next candidate is a duplicate/synonym/older version of the current topic, work stops and the relationship is resolved before another page is created.

## Parallel lanes

- C0 — الموسوعة والمصطلحات العامة + التنسيق المركزي
- A1 — الصحة النفسية
- A2 — الإدمان والتعافي
- A3 — ذوو الاحتياجات الخاصة والدمج والتمكين
- A4 — الطفل والأسرة والمدرسة
- A5 — البحث والأدلة والأدوات والتعلم

Each lane handles one page at a time. Claims are coordinated through GitHub Issues to prevent duplicate canonicals across lanes.

## Platform readiness verified before legacy migration

- New platform uses a dynamic Supabase taxonomy and structured CMS; no legacy theme/CSS/layout is imported.
- Structured content supports headings, paragraphs, lists, tables, callouts, quotes, external sources, inline images with Alt, and FAQ blocks.
- `glossary_term` pages emit DefinedTerm structured data in addition to the page schema.
- SEO/E-E-A-T fields and release gates exist before approval/publishing.
- Version history and audit trail exist.
- Tags and multi-category relations are supported.
- Scheduled publishing and version restore are implemented.
- Sitemap architecture is hardened for large content volumes.
- GTM/GA4 are centralized at the root layout and are not copied into each migrated page.
- Supabase Security Advisor reported no active security lints after the latest database hardening.

## Legacy repository audit facts verified

Source repository: `khaledaltheeb/healthrenewal.org`

- Large generated/static repository with version-like and enrichment/generator directories.
- GitHub code search reports hundreds/thousands of generated artifacts and pages; raw file count is **not** treated as unique-page count.
- The old encyclopedia was generated in multiple layers/facets, so generated pages may represent variants of one canonical topic and must be clustered before migration.
- Historical Git history and generated layers must be inspected per topic because multiple files/commits may represent the same page.
- Internal planning files, workflow artifacts, agent instructions, TODO/QA notes, generator fragments, and development discussions are **not publishable content**.

## Per-page record template

### MIG-XXXXXX — [Canonical topic/title]
- Status: NOT STARTED
- Lane:
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
- Useful word count:
- Old URLs requiring redirect:
- New CMS content id:
- Versions:
- Scientific/source review:
- Editorial review:
- SEO review:
- Accessibility review:
- Published/scheduled status:
- Post-build QA:
- Notes:

## Completed pages

### MIG-000001 — الذاكرة العاملة
- Lane: C0
- Canonical: `/content/working-memory`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Useful Arabic words: **2240**
- FAQ: **11**
- References: **8**
- Versions: **9**
- Duplicate canonicals after publish: **0**
- Search validation: **PASS**
- Incorrect redirect from related working-memory-updating tool: **0**
- Full record: `migration-records/C0/MIG-000001-working-memory.md`
- Claim: GitHub Issue #1 — CLOSED / COMPLETED

### MIG-000002 — الانتباه
- Lane: C0
- Canonical: `/content/attention`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Useful Arabic words: **2017**
- FAQ: **11**
- References: **8**
- Versions: **8**
- Duplicate canonicals after publish: **0**
- Search validation: **PASS — first result for الانتباه**
- Incorrect redirects from attention quick-info/tools: **0**
- Full record: `migration-records/C0/MIG-000002-attention.md`
- Claim: GitHub Issue #2 — CLOSED / COMPLETED

### MIG-000003 — الإدراك
- Lane: C0
- Canonical: `/content/perception`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Useful Arabic words: **1905**
- FAQ: **11**
- References: **8**
- Versions: **8**
- Duplicate canonicals after publish: **0**
- Search validation: **PASS — first result for الإدراك**
- Guessed redirects: **0**
- Full record: `migration-records/C0/MIG-000003-perception.md`
- Claim: GitHub Issue #3 — CLOSED / COMPLETED

### MIG-000004 — الذاكرة
- Lane: C0
- Canonical: `/content/memory`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Useful Arabic words: **1808**
- FAQ: **11**
- References: **8**
- Versions: **8**
- Duplicate canonicals after publish: **0**
- Search validation: **PASS — first result for الذاكرة; working memory remains distinct**
- Incorrect redirect collision with working-memory/tool: **0**
- Full record: `migration-records/C0/MIG-000004-memory.md`
- Claim: GitHub Issue #4 — CLOSED / COMPLETED

### MIG-000005 — اللغة
- Lane: C0
- Canonical: `/content/language`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Useful Arabic words: **1891**
- FAQ: **11**
- References: **8**
- Versions: **8**
- Duplicate canonicals after publish: **0**
- Search validation: **PASS — first result for اللغة**
- Specialized redirect collisions from ADHD/selective mutism/AAC/autism: **0**
- Full record: `migration-records/C0/MIG-000005-language.md`
- Claim: GitHub Issue #9 — CLOSED / COMPLETED

## Totals

- Completed canonical pages: **5**
- Published canonical pages: **5**
- C0 completed: **5**
- A1–A5 completed recorded in central ledger: **0**

## Next action

C0 may start **MIG-000006** only after checking all open agent Claims and selecting a general encyclopedia topic that is not owned by A1–A5.
