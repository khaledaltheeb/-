# MIG-A4-000058 — انتهاء صداقة المراهق

- **Lane:** A4 — الطفل والأسرة والمدرسة
- **Claim:** #171
- **Canonical:** `/content/teen-friendship-loss`
- **Status:** Published / QA PASS
- **Supabase content id:** `aaeb864b-fe10-46e8-8de3-aa10fc9bc8b3`
- **Legacy source:** `/quick-info/help-teen-friendship-breakup/` (`quick-info/help-teen-friendship-breakup/index.html`)
- **Redirect:** `/quick-info/help-teen-friendship-breakup/` → `/content/teen-friendship-loss` — 301 active

## Scope decision

This page is an A4 family/school resource about supporting an adolescent after a meaningful friendship ends: validating the loss, listening without interrogation, deciding whether repair is safe and mutual, respecting the other person's boundary, handling school-group changes, distinguishing a friendship ending from bullying, reducing compulsive digital monitoring, protecting privacy, maintaining routine, and recognizing functional deterioration that warrants professional support. It does **not** diagnose a mental disorder; pure psychiatric diagnosis remains A1.

The nearby canonical `/content/friendships` was checked before claiming. It covers general friendship formation, social skills, ordinary conflict and rejection. The new canonical is limited to coping and recovery after an established meaningful friendship has actually ended, so it serves a separate search intent rather than duplicating the general guide.

## Legacy audit

The current legacy page and its Git history were inspected. The old Quick Information page contained a short generic template, platform/GTM/GA shell, generic emergency language, and irrelevant citations to ADHD and autism. These were not migrated as content. The useful intent — acknowledging the depth of friendship loss and supporting the adolescent without forcing immediate reconciliation — was retained and rebuilt from scratch.

Git history for the legacy path shows bulk Quick Information long-form, shell/metadata and GTM updates on 2026-08-08; these were treated as technical/template revisions rather than independent canonical content versions.

## Evidence base

Eight authoritative sources were registered in `references_json`, including WHO guidance on adolescent mental health and social connection, WHO adolescent indicators for having someone to talk to, UNICEF guidance for supporting teens during stressful periods, CDC material on peer connection and classroom social dynamics, and American Academy of Pediatrics / HealthyChildren guidance on supporting friendships.

Key evidence applied: adolescence is a formative period in which peer relationships and supportive family/school environments matter for mental well-being; social connection is protective; adolescents benefit from having someone they can talk to; schools can strengthen peer connection and support isolated students; parents can stay available and supportive without taking over the teen's friendships.

## Content / SEO / accessibility

- Title/H1: `انتهاء صداقة المراهق: دليل عملي للأسرة والمدرسة`
- SEO title length: 43
- Meta description length: 153
- Canonical count: 1
- Featured image: legacy Quick Information card retained
- Featured image alt: `رسم توضيحي لمراهق يمر بانتهاء صداقة مهمة مع وجود دعم هادئ من الأسرة`
- Search aliases include Arabic and English variants of teen/adolescent friendship breakup/loss.
- Primary keyword: `انتهاء صداقة المراهق`
- Search intent: informational
- Internal links: 6, all targets published (`bullying`, `digital-home`, `friendships`, `child-sleep`, `when-child-needs-help`, `teen-privacy-vs-withdrawal`).

## Final QA

- Arabic searchable tokens/words: **2444**
- Content blocks: **72**
- H1: **1** (page title)
- H2: **18**
- H3 / FAQ questions: **10**
- Authoritative references: **8**
- Tags: **5**
- Primary categories: **1**
- Content versions: **7**
- Audit events: **7**
- Redirects: **1 active 301**
- Forbidden public markers (`TODO`, `FIXME`, `QA`, `MIGRATION`, agent instructions): **0**
- Canonical/slug collision after publication: none detected
- Final status: **published**

Workflow recorded in order: `draft → scientific_review → editorial_review → seo_review → accessibility_review → approved → published`.

No edits were made to `main` or `docs/MIGRATION-PROGRESS.md`.