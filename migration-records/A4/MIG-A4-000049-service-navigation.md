# MIG-A4-000049 — service-navigation

## Canonical
- Title: التنقل بين الخدمات والإحالات: دليل عملي للأسرة
- Slug: `service-navigation`
- Canonical URL: `/content/service-navigation`
- Lane: A4 — الطفل والأسرة والمدرسة
- Claim: #161
- Final status: `published`
- Supabase content id: `c1f217bd-9b6b-466e-b7a9-ed0e5f796351`

## Scope boundary
General family navigation across health, education and social-support services: define the need, identify service ownership, prepare documents/questions, track referrals and handoffs, close follow-up loops, coordinate with school/services and maintain a usable service map. The existing mental-health service-access evidence guide remains the mental-health-specific canonical. Disability-specific navigation remains A3 when disability/special needs are central.

## Pre-claim dedupe
Before opening #161, GitHub Issues, `docs/MIGRATION-PROGRESS.md` on `legacy-migration-audit`, and Supabase slug/title/canonical/search aliases were checked. The only adjacent published Supabase result was `/evidence-guides/service-access-guides/`, whose content is explicitly about mental-health service access, specialist selection, assessment/treatment boundaries and mental-health resource quality; it does not own broad family service coordination.

## Legacy inventory/history
Verified predecessor:
- `/sectors/family/guides/service-navigation/`
- `sectors/family/guides/service-navigation/index.html`

Both the current file and the original topic-specific version at commit `c184bed0a555f9e539a91e966921d0582bd92deb` were inspected. The legacy page was a generic v403 template with platform/GTM layers, internal review notation, repeated functional-protocol scaffolding and broad warnings. Those layers were not migrated.

## Rebuild/enrichment
Rebuilt from scratch around:
- defining the need before choosing an institution;
- a four-column service map;
- referral vs appointment vs follow-up;
- minimum-necessary information transfer;
- a one-page family summary;
- explicit ownership of next actions;
- comparing services by fit, eligibility, access and scope;
- handling rejected referrals and waitlists;
- hospital-to-home handoffs;
- health-school coordination;
- social/community service navigation;
- distributing coordination workload;
- measures of whether a service pathway is actually working;
- urgent escalation boundaries;
- a seven-line referral tracker.

References stored in the CMS include WHO integrated people-centred care/service integration/primary care, AHRQ care-coordination definitions/framework/discharge planning, and UNICEF cross-sector family/child case-management work.

## Final QA
- Searchable word units: 1895
- Structured blocks: 74
- H1: one via title/template
- H2: 18
- H3 / FAQ: 10
- References: 8
- Internal links: 4; published targets: 4/4
- Primary categories: 1
- Tags: 5
- Active redirects: 1
- Canonical collisions: 0
- Forbidden internal markers: 0
- SEO title: 41 characters
- Meta description: 158 characters
- Content versions: 7
- Audit events: 7
- Featured image: none; image alt not applicable
- Final CMS status: `published`

## Redirect
Active 301:
- `/sectors/family/guides/service-navigation/` → `/content/service-navigation`

## Workflow
Completed sequentially:
`draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`

`main` and `docs/MIGRATION-PROGRESS.md` were not modified.