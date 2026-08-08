# Rawafid — Migration Progress Ledger

Last updated: 2026-08-08

## Current phase

**PAGE-BY-PAGE LEGACY MIGRATION — ACTIVE**

No legacy page is considered migrated unless it has a completed record and passes coordinator QA.

## Mandatory operating rule

Migration proceeds **one canonical page at a time per lane**:

`Discovery → Variant history → Dedupe cluster → Exclusions → Source verification → Rewrite → SEO/E-E-A-T → CMS draft → Review → Redirect map → QA → Final status`

A lane does not open a second page while its current Claim remains open. Any possible duplicate/synonym/sector conflict stops that page until C0 resolves the canonical owner.

## Parallel lanes

- C0 — الموسوعة والمصطلحات العامة + التنسيق المركزي
- A1 — الصحة النفسية
- A2 — الإدمان والتعافي
- A3 — ذوو الاحتياجات الخاصة والدمج والتمكين
- A4 — الطفل والأسرة والمدرسة
- A5 — البحث والأدلة والأدوات والتعلم

## Platform readiness verified before migration

- Dynamic Supabase taxonomy and structured CMS; no legacy theme/CSS/layout imported.
- Structured content supports headings, paragraphs, lists, tables, callouts, quotes, external sources, inline images with Alt, and visible FAQ blocks.
- `glossary_term` emits DefinedTerm; visible FAQ emits FAQPage.
- SEO/E-E-A-T release gates, version history, audit trail, tags, multi-category relations, scheduled publishing and version restore are implemented.
- Large-scale sitemap architecture is sharded.
- GTM/GA4 are centralized in the root layout rather than copied into pages.
- Supabase security hardening remains in force.

## Legacy audit facts

Source repository: `khaledaltheeb/healthrenewal.org`

- Generated/static repository with many enrichment/generator/version layers.
- Raw file/page counts are not treated as unique canonicals.
- Generator facets, historical variants and old routes are clustered topic-by-topic.
- Internal planning, agent instructions, TODO/QA, generator code and development discussions are never publishable content.
- Redirects are created only from verified old routes; `concept-*` routes are never guessed from generator arithmetic.

## Completed pages

### MIG-000001 — الذاكرة العاملة
- Lane: C0
- Canonical: `/content/working-memory`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Words: **2240** | FAQ: **11** | References: **8** | Versions: **9**
- Duplicate canonical: **0** | Search: **PASS** | wrong tool redirect: **0**
- Record: `migration-records/C0/MIG-000001-working-memory.md`
- Claim #1: CLOSED / COMPLETED

### MIG-000002 — الانتباه
- Lane: C0
- Canonical: `/content/attention`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Words: **2017** | FAQ: **11** | References: **8** | Versions: **9**
- Duplicate canonical: **0** | Search: **PASS** | wrong quick-info/tool redirects: **0**
- Exact `التركيز` alias/secondary keyword was removed in a versioned canonical-boundary correction before publishing the separate concentration page.
- Record: `migration-records/C0/MIG-000002-attention.md`
- Claim #2: CLOSED / COMPLETED

### MIG-000003 — الإدراك
- Lane: C0
- Canonical: `/content/perception`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Words: **1905** | FAQ: **11** | References: **8** | Versions: **8**
- Duplicate canonical: **0** | Search: **PASS** | guessed redirects: **0**
- Record: `migration-records/C0/MIG-000003-perception.md`
- Claim #3: CLOSED / COMPLETED

### MIG-000004 — الذاكرة
- Lane: C0
- Canonical: `/content/memory`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Words: **1808** | FAQ: **11** | References: **8** | Versions: **8**
- Duplicate canonical: **0** | Search: **PASS**
- `/content/working-memory` remains a distinct related canonical.
- Record: `migration-records/C0/MIG-000004-memory.md`
- Claim #4: CLOSED / COMPLETED

### MIG-000005 — اللغة
- Lane: C0
- Canonical: `/content/language`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Words: **1891** | FAQ: **11** | References: **8** | Versions: **8**
- Duplicate canonical: **0** | Search: **PASS** | specialized redirect collisions: **0**
- Record: `migration-records/C0/MIG-000005-language.md`
- Claim #9: CLOSED / COMPLETED

### MIG-000006 — الوظائف التنفيذية
- Lane: C0
- Canonical: `/content/executive-functions`
- Type: `glossary_term`
- Status: **PUBLISHED / QA PASS**
- Words: **1687** | FAQ: **11** | References: **8** | Versions: **8**
- Duplicate canonical: **0** | Search: **PASS** | child/autism/ADHD redirect collisions: **0**
- Record: `migration-records/C0/MIG-000006-executive-functions.md`
- Claim #11: CLOSED / COMPLETED

### MIG-000007 — التركيز
- Lane: C0
- Canonical: `/content/concentration`
- Type: `glossary_term`
- Status: **PUBLISHED / POST-PUBLISH QA PASS**
- Words: **1766** | FAQ: **11** | References: **8** | Versions: **9**
- Tags: **6** | Category relations: **1** | Audit events: **9**
- Duplicate canonical: **0**
- Search `التركيز`: concentration first (~9.3), attention related lower (1.0).
- Search `الانتباه`: attention first (13), concentration related second (~2.9).
- Wrong redirect from attention: **0** | wrong redirect from focus-break quick-info: **0**
- Record: `migration-records/C0/MIG-000007-concentration.md`
- Claim #89: CLOSED / COMPLETED

### A4-000001 — الانضباط الإيجابي أم العقاب؟
- Lane: A4
- Canonical: `/content/discipline-vs-punishment`
- Type: `article`
- Status: **PUBLISHED / C0 QA PASS AFTER GOVERNANCE CORRECTION**
- Words: **2673** | FAQ: **10** | References: **8**
- SEO title: **42 chars** | Meta: **150 chars**
- Redirect: `/quick-info/discipline-vs-punishment/` → canonical, **301 active**
- Duplicate canonical: **0** | Search: **PASS**
- Initial agent publish had only 1 version, 0 audit events, 0 tags, and 0 `content_categories` relations.
- C0 reopened it transparently, preserved the accepted text/SEO/references/redirect, added **5 tags + 1 primary category relation**, and reran the full workflow.
- Final database state: **9 versions, 8 audit events, 5 tags, 1 category relation**.
- Claim #6: CLOSED / COMPLETED after C0 correction.
- Agent record: `migration-records/A4/MIG-A4-000001-discipline-vs-punishment.md`

## Active / pending lanes at this checkpoint

- A1: `depression` — enriched 2800+ word draft; intentionally blocked at scientific review because no qualified human reviewer is registered. No reviewer identity may be fabricated.
- A2: `withdrawal-safety` — high-stakes addiction page intentionally blocked at scientific review because no qualified human reviewer is registered.
- A3: `autism` — active Claim; C0 must not touch autism while claimed.
- A4: multiple family/home Claims active; C0 must not take those canonicals.
- A5: `safe-screening-tools` active plus other A5 work; C0 must not take those canonicals.
- C0: `sensation` and `creativity` Claims remain active in parallel; coordinator work must not duplicate them.

## Totals

- **Completed canonical pages after coordinator QA: 8**
- **Published canonical pages after coordinator QA: 8**
- C0 completed: **7**
- Validated agent pages: **1 (A4)**
- High-stakes pages blocked pending real qualified scientific review are not counted as complete.

## Next action

1. Continue C0 with the next unused migration number on a non-conflicting general encyclopedia concept.
2. Monitor all open Claims immediately before each new C0 topic.
3. Independently audit every agent-completed page for content quality **and** versions/audit/tags/category relations before adding it to this ledger.
