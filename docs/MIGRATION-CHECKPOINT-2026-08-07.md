# Rawafid Migration Checkpoint — 2026-08-07

## Verified total at this checkpoint

**11 canonical pages published and independently coordinator-validated.**

- C0 completed/published: **10**
- Validated agent pages: **1 (A4)**
- High-stakes agent drafts blocked pending qualified scientific review are **not** counted as complete.

## C0 completed

1. MIG-000001 — الذاكرة العاملة — `/content/working-memory`
2. MIG-000002 — الانتباه — `/content/attention`
3. MIG-000003 — الإدراك — `/content/perception`
4. MIG-000004 — الذاكرة — `/content/memory`
5. MIG-000005 — اللغة — `/content/language`
6. MIG-000006 — الوظائف التنفيذية — `/content/executive-functions`
7. MIG-000007 — الاستدلال — `/content/reasoning`
8. MIG-000008 — حل المشكلات — `/content/problem-solving`
9. MIG-000009 — اتخاذ القرار — `/content/decision-making`
10. MIG-000010 — الإبداع — `/content/creativity`

Every C0 page passed a PostgreSQL publication guard requiring at minimum:
- >=1500 useful Arabic words
- SEO title <=60 chars
- Meta Description 150–160 chars
- >=5 authoritative HTTPS references
- no duplicate slug/title/canonical
- no TODO/FIXME/agent/private-plan/banned internal text

Then each passed:
`Draft → Scientific Review → Editorial → SEO → Accessibility → Approved → Scheduled → Published`
with version snapshots and Audit Log entries at every transition. No human reviewer identity was fabricated.

## Validated agent page

### A4-000001 — الانضباط الإيجابي أم العقاب؟

Canonical: `/content/discipline-vs-punishment`

A4 created a strong 2673-word page with 10 FAQ, 8 sources and a verified 301 redirect from the legacy quick-info page. Coordinator audit found governance drift in the initial agent publication: one version only, zero audit events, zero tags, and zero `content_categories` relation. C0 transparently reopened the same content, preserved the text/SEO/references/redirect, added 5 tags + primary category relation, and reran the full workflow.

Final state: **9 versions, 8 audit events, 5 tags, 1 category relation, duplicate 0, redirect/search QA pass.**

## Active agent Claims at the latest coordinator checks

- A1 — `depression`: enriched 2800+ word draft; intentionally blocked at scientific review because there is no registered qualified human reviewer. Do not fabricate reviewer identity.
- A3 — `autism`: active Claim. C0 must not touch autism while claimed.
- A5 — `accessible-fair-multimodal-assessment`: active Claim.
- A5 premature second Claim `evidence-literacy` was closed by C0 to enforce one open page per lane.
- A4 first page is closed and validated; a next Claim is allowed only after global duplicate/claim checks.
- A2 had no verified active Claim at the last checkpoint.

## Coordinator rule discovered during monitoring

Agent completion reports are **not accepted at face value**. C0 independently verifies:
- useful word count and structured headings/FAQ
- sources and HTTPS references
- SEO lengths/canonical
- duplicate candidates
- forbidden/internal text
- redirects
- tags and category relations
- version snapshots
- Audit Log events
- search result after publication

If any governance layer is missing, the page is reopened and corrected before being counted complete.

## Next C0 page

`MIG-000011` candidate: **الإحساس (Sensation)**, only after a fresh global Claim check. It must remain distinct from perception, sensory-processing disorders, autism, modality-specific hearing/vision content and sensory assessment tools.
