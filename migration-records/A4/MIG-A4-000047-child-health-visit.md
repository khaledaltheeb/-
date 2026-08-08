# MIG-A4-000047 — child-health-visit

## Canonical
- Title: تحضير الطفل للزيارة الصحية: دليل عملي للبيت والعيادة
- Slug: `child-health-visit`
- Canonical URL: `/content/child-health-visit`
- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #158
- Final status: `published`
- Supabase content id: `49a72157-d570-42ff-b91d-59295e40d6f2`

## Scope boundary
This is a general child/family preparation guide for routine medical, hospital, vaccination, specialist and dental visits. It does not diagnose psychological disorders or prescribe medical treatment. Disability/special-needs-specific access plans remain A3 when the disability is the central subject.

## Dedupe / pre-claim checks
Before opening #158, GitHub Issues were searched for the canonical key, proposed slug, Arabic title/synonyms and English synonyms. `docs/MIGRATION-PROGRESS.md` on `legacy-migration-audit` was checked. Supabase was searched across slug/title/canonical/search aliases and redirects. No competing Claim or existing canonical was found.

## Legacy inventory and history
Verified predecessor:
- `/sectors/child/guides/child-health-visit/`
- `sectors/child/guides/child-health-visit/index.html`

The topic-specific page was introduced in `khaledaltheeb/healthrenewal.org` by commit `c184bed0a555f9e539a91e966921d0582bd92deb` on 2026-08-01. Later path history consists of broad sitewide SEO, brand, platform-shell and GTM changes rather than independent knowledge canonicals. Both the original topic version and current legacy version were inspected. The legacy shell, analytics markup, generic protocol/template language, internal review notes and non-topic filler were not migrated.

## Rebuild and enrichment
The page was rebuilt from scratch around:
- truthful age-appropriate preparation and expectations;
- what the parent should confirm before the appointment;
- timing and language of preparation;
- real choices versus false choices;
- records, medication lists and priority questions;
- waiting-room planning;
- child participation and adolescent voice;
- vaccination/needle comfort without false promises;
- dental-visit preparation;
- previous frightening medical experiences;
- distinguishing distress from misconduct;
- play/story preparation;
- minimal-necessary school coordination;
- after-visit follow-through;
- when to contact the clinic before a planned procedure;
- explicit boundary between planned-visit preparation and urgent care.

Primary/authoritative references stored in the CMS include WHO child-care quality standards, WHO 2025 adolescent quality standards, AAP/HealthyChildren appointment and anesthesia guidance, CDC vaccination preparation/comfort guidance, AAPD pediatric dental behavior guidance, and an NHS pediatric procedural-anxiety resource.

## SEO / E-E-A-T
- Primary keyword: `تحضير الطفل للزيارة الصحية`
- SEO title length: 44 characters
- Meta description length: 150 characters
- Visible author: فريق تحرير منصة روافد
- Visible reviewer: فريق المراجعة العلمية والتحريرية في روافد
- References: 8
- Search aliases: Arabic + English intent variants
- Schema: Article + FAQPage
- Canonical count/collision check: one canonical, zero collision

## Structure / QA after publication
- Searchable word units: 2860
- Structured blocks: 87
- H1: one, supplied by the content title/template
- H2: 23
- H3 / FAQ questions: 10
- Internal links: 6
- Published internal-link targets: 6/6
- References: 8
- Primary categories: 1
- Tags: 5
- Content versions: 7
- Audit events: 7
- Forbidden internal markers (`TODO`, `FIXME`, `QA`, migration/agent instructions): 0
- Featured image: none, therefore image alt is not applicable
- Final CMS status: `published`

## Redirect
Active 301 created:
- `/sectors/child/guides/child-health-visit/` → `/content/child-health-visit`

## Workflow
Completed sequentially:
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

The first database write attempt failed atomically because the audit-log identity column rejects explicit IDs. The transaction rolled back fully; a verification query confirmed no partial Content or Redirect existed. The corrected write then created the draft and the normal seven-stage version/audit trail.

`main` and `docs/MIGRATION-PROGRESS.md` were not modified.