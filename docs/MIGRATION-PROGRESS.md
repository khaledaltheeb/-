# Rawafid — Migration Progress Ledger

Last updated: 2026-08-08

## Current phase

**PAGE-BY-PAGE LEGACY MIGRATION — ACTIVE**

No legacy page is considered migrated unless it has a completed record **and** the coordinator verifies the authoritative Supabase state, version history, audit trail, taxonomy, search and duplicate/redirect behavior.

## Mandatory operating rule

Migration proceeds **one canonical page at a time per lane**:

`Discovery → Variant history → Dedupe cluster → Exclusions → Source verification → Rewrite → SEO/E-E-A-T → CMS draft → Review → Redirect map → QA → Final status`

A lane does not open a second page while its current Claim remains open. GitHub records alone are never accepted as proof of publication; Supabase is authoritative for content status.

## Parallel lanes

- C0 — الموسوعة والمصطلحات العامة + التنسيق المركزي
- A1 — الصحة النفسية
- A2 — الإدمان والتعافي
- A3 — ذوو الاحتياجات الخاصة والدمج والتمكين
- A4 — الطفل والأسرة والمدرسة
- A5 — البحث والأدلة والأدوات والتعلم

## Completed C0 pages — authoritative checkpoint

### MIG-000001 — الذاكرة العاملة
- Canonical: `/content/working-memory`
- Status: **PUBLISHED / QA PASS**
- Words: **2240** | FAQ: **11** | References: **8**
- Versions/Audits: **9 / 9** | Tags: **4** | Categories: **1**
- Record: `migration-records/C0/MIG-000001-working-memory.md`

### MIG-000002 — الانتباه
- Canonical: `/content/attention`
- Status: **PUBLISHED / QA PASS**
- Words: **2017** | FAQ: **11** | References: **8**
- Versions/Audits: **9 / 9** | Tags: **5** | Categories: **1**
- Exact `التركيز` alias/secondary keyword was removed in a versioned boundary correction before the concentration canonical was published.
- Record: `migration-records/C0/MIG-000002-attention.md`

### MIG-000003 — الإدراك
- Canonical: `/content/perception`
- Status: **PUBLISHED / QA PASS**
- Words: **1905** | FAQ: **11** | References: **8**
- Versions/Audits: **8 / 8** | Tags: **5** | Categories: **1**
- Record: `migration-records/C0/MIG-000003-perception.md`

### MIG-000004 — الذاكرة
- Canonical: `/content/memory`
- Status: **PUBLISHED / QA PASS**
- Words: **1808** | FAQ: **11** | References: **8**
- Versions/Audits: **8 / 8** | Tags: **6** | Categories: **1**
- `/content/working-memory` remains a distinct related canonical.
- Record: `migration-records/C0/MIG-000004-memory.md`

### MIG-000005 — اللغة
- Canonical: `/content/language`
- Status: **PUBLISHED / QA PASS**
- Words: **1891** | FAQ: **11** | References: **8**
- Versions/Audits: **8 / 8** | Tags: **7** | Categories: **1**
- Record: `migration-records/C0/MIG-000005-language.md`

### MIG-000006 — الوظائف التنفيذية
- Canonical: `/content/executive-functions`
- Status: **PUBLISHED / QA PASS**
- Words: **1687** | FAQ: **11** | References: **8**
- Versions/Audits: **8 / 8** | Tags: **8** | Categories: **1**
- Record: `migration-records/C0/MIG-000006-executive-functions.md`

### MIG-000007 — الاستدلال
- Canonical: `/content/reasoning`
- Status: **PUBLISHED / POST-PUBLISH QA PASS**
- Words: **1917** | FAQ: **11** | References: **8**
- Versions/Audits: **9 / 9** | Tags: **8** | Categories: **1**
- Governance correction: previous record falsely claimed publication while DB was draft/1 version/1326 words. Claim reopened, depth completed, real workflow executed.
- Search `الاستدلال`: canonical first (~9.1) | Duplicate: **0** | related redirect collisions: **0**
- Record: `migration-records/C0/MIG-000007-reasoning.md`

### MIG-000008 — حل المشكلات
- Canonical: `/content/problem-solving`
- Status: **PUBLISHED / POST-PUBLISH QA PASS**
- Words: **2206** | FAQ: **11** | References: **8**
- Versions/Audits: **10 / 10** | Tags: **8** | Categories: **1**
- Governance correction: previous record falsely claimed publication while DB was draft/1 version/852 words/meta 163. Page expanded, meta corrected to 159, internal Canonical text removed, real workflow executed.
- Search `حل المشكلات`: canonical first (~7.71) | Duplicate: **0** | related redirect collisions: **0**
- Record: `migration-records/C0/MIG-000008-problem-solving.md`

### MIG-000009 — اتخاذ القرار
- Canonical: `/content/decision-making`
- Status: **PUBLISHED / POST-PUBLISH QA PASS**
- Words: **2161** | FAQ: **11** | References: **8**
- Versions/Audits: **10 / 10** | Tags: **8** | Categories: **1**
- Governance correction: Issue #15 body had been overwritten with creativity data. Real DB page was draft/1 version/670 words/meta 166. Page expanded, meta corrected to 153. First workflow attempt was safely rejected because SEO title was 48 while release contract is <=47; title corrected to 43 and workflow rerun.
- Search `اتخاذ القرار`: canonical first (~5.71) | Duplicate: **0** | related redirect collisions: **0**
- Record: `migration-records/C0/MIG-000009-decision-making.md`

### MIG-000010 — الإبداع
- Canonical: `/content/creativity`
- Status: **PUBLISHED / POST-PUBLISH QA PASS**
- Searchable words: **1599** | FAQ: **11** | References: **8**
- Versions/Audits: **9 / 9** | Tags: **8** | Categories: **1**
- Governance correction: DB was draft/1 version. Stored `body_text` exposed only 557 words while structured `body_json` contained 1599 searchable words. Search text was rebuilt from structured blocks rather than padding the article.
- Search `الإبداع`: canonical first (~8.1) | Duplicate: **0** | related redirect collisions: **0**
- Record: `migration-records/C0/MIG-000010-creativity.md`

### MIG-000011 — التركيز
- Canonical: `/content/concentration`
- Status: **PUBLISHED / POST-PUBLISH QA PASS**
- Words: **1766** | FAQ: **11** | References: **8**
- Versions/Audits: **9 / 9** | Tags: **6** | Categories: **1**
- Search `التركيز`: concentration first (~9.3), attention lower (1.0).
- Search `الانتباه`: attention first (13), concentration lower (~2.9).
- Duplicate: **0** | redirect collision from attention/focus-break article: **0**
- Record: `migration-records/C0/MIG-000011-concentration.md`

### MIG-000012 — الإحساس
- Canonical: `/content/sensation`
- Status: **PUBLISHED / POST-PUBLISH QA PASS**
- Words: **2305** | FAQ: **11** | References: **8**
- Structured blocks: **52** | H2/H3: **16 / 4** | Tables: **3**
- Versions/Audits: **8 / 8** | Tags: **7** | Categories: **1**
- Legacy discovery found no standalone old sensation page; this is transparently documented as a synthesized parent glossary concept from the verified sensory/access legacy cluster plus authoritative sources.
- Search `الإحساس`: sensation first (~6.1), perception lower (1.5).
- Search `الإدراك`: perception first (~11.6), sensation lower (~0.7).
- Duplicate: **0** | perception redirect collision: **0** | specialized sensory redirect collisions: **0**
- Record: `migration-records/C0/MIG-000012-sensation.md`
- Claim #19: CLOSED / COMPLETED.

## Validated non-C0 page

### A4-000001 — الانضباط الإيجابي أم العقاب؟
- Canonical: `/content/discipline-vs-punishment`
- Status: **PUBLISHED / C0 QA PASS AFTER GOVERNANCE CORRECTION**
- Words: **2673** | FAQ: **10** | References: **8**
- SEO title: **42 chars** | Meta: **150 chars**
- Redirect: `/quick-info/discipline-vs-punishment/` → canonical, **301 active**
- Final database state: **9 versions, 8 audit events, 5 tags, 1 category relation**.
- Record: `migration-records/A4/MIG-A4-000001-discipline-vs-punishment.md`

## Open Claims verified at this checkpoint

Fresh GitHub claim scan after closing MIG-000012 returns:
- A4 — Issue #95: `care-for-elderly` — **رعاية كبار السن والصحة النفسية للعائلة**.
- A5 — Issue #62: `safe-screening-tools` — **الاستخدام الآمن للمقاييس وأدوات الفحص**.

No C0 Claim is currently open. Other agent outputs are not added to totals unless independently audited by C0.

## Totals

- **C0 completed and database-verified canonicals: 12**
- **Validated non-C0 canonicals in this ledger: 1**
- **Total completed canonicals after coordinator QA: 13**
- **Total published canonicals after coordinator QA: 13**

## Next action

Open `MIG-000013` only after checking the latest Claims again, then choose a general encyclopedia concept that does not overlap A4/A5 or an already published canonical. Continue independent agent-output audit before adding any non-C0 page to totals.
