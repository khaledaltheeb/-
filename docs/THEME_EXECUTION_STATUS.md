# Central Theme V5 — Execution Status

## V5 implemented

- Human-centered public homepage with search, guided starting paths, plain-language trust signals, dynamic sectors, recent published knowledge and professional participation calls to action.
- Simplified institutional navigation: Discover, sectors, providers/centers, tools and knowledge, plus a compact utility layer.
- Unified tributary identity mark across public chrome, authentication, admin, PWA and the root social card.
- Read-only homepage content adapter using the public Supabase boundary, RLS and five-minute revalidation.
- Task-led administrator overview with direct page creation, verification priority and frequent-action shortcuts.
- New `/admin/verification` hub aggregating specialists, centers, community members and private-document review signals without bypassing the existing decision RPCs.
- Readiness indicators in provider/community review cards and collapsed exceptional manual-entry forms.
- Correct community status totals when a filtered queue is open.
- Shared content templates for administrators and specialists, plus a visible four-step authoring path in the existing versioned block editor.
- Central V5 responsive, focus, reduced-motion, editorial, verification and authoring styles in `app/rawafid-theme.css`.
- Dedicated V5 regression contract added to the standard architecture and theme commands.

## V5 verification

- TypeScript: passed.
- ESLint with zero warnings: passed.
- Architecture, privacy, account, provider and theme contracts: passed.
- Next.js 16.3 production build: passed.
- OpenNext for Cloudflare 1.20.2 bundle: passed.
- Wrangler 4.120.0 deployment dry run: passed (48 assets; Worker bundle validated).
- Supabase project health, RLS coverage and security/performance advisors were reviewed before implementation; no schema change was required.
- Live HTTP smoke and Lighthouse remain staging-deployment checks and must not be marked complete before the new Worker version is published.

## V4 baseline preserved

### Implemented

- Single global theme entry point: `app/rawafid-theme.css`.
- Existing V3 CSS modules kept in their proven cascade order behind the central entry point instead of duplicating or rewriting them.
- Semantic `--rf-*` design tokens for the institutional palette, surfaces, typography, spacing, radii and elevation.
- Official visible brand contract: **منصة روافد**; «روافد» remains only a constrained short form where space requires it.
- Frontend sector-accent adapter (`lib/theme.ts`) so existing database values such as `teal` and `blue` do not require mass Supabase updates.
- Full-brand normalization in the global header, authentication surfaces and admin shell.
- Responsive hero hardening, including removal of the mobile no-wrap failure.
- Public module grid normalized to 3×2 / 2×N / 1×N behavior.
- Intent-first homepage entry paths using existing search, directory and service routes without new database structures.
- Attention-first admin section using values already read by the dashboard, with no additional Supabase queries.
- Centralized V4 admin/portal visual layer.
- Reduced-motion, `focus-visible`, print and mobile safe-area rules.
- Updated internal `/theme-preview` visual lab for V4.
- PWA theme color aligned with the central Platform Rawafid identity.
- Agent rules and architecture documentation preventing new duplicated global CSS patterns.
- Dedicated V4 regression contract and theme import-graph guard.

### Explicitly unchanged

- Supabase schema.
- Supabase rows/content.
- RLS policies.
- Existing routes and canonical architecture.
- CMS workflow and block editor behavior.
- Authentication and protected-route behavior.
- Existing compatibility CSS modules while they are still referenced.

### Historical verification

Pull-request quality run **#584** passed on the synthesized merge ref with the then-current `main`:

- architecture/privacy/PWA/content-readiness contract: passed;
- Central Theme V4 contract: passed;
- theme import graph: **27 unique modules, no duplicate or missing imports**;
- final hardening regression contract: passed;
- TypeScript: passed;
- ESLint with zero warnings allowed: passed;
- Next.js production build: passed;
- public/protected route HTTP smoke checks: passed;
- application + Supabase health check: passed;
- branded 404 check: passed;
- Lighthouse Accessibility: **1.00 / 1.00 / 1.00**;
- Lighthouse Best Practices: **1.00 / 1.00 / 1.00**;
- Lighthouse Performance: **0.64 / 0.90 / 0.90**, median **0.90**;
- CLS: **0** in all three runs;
- LCP: **3.6s / 3.5s / 3.5s**.

The first Lighthouse run showed a lab-only TBT outlier of 1.43s while runs two and three were 110ms and 80ms. The median performance gate remained 0.90; this variance is recorded rather than hidden.

### Merge policy

The branch is merged only after the final post-documentation PR gate is green and GitHub reports it mergeable against the current `main`. Because the implementation branch contains iterative setup commits, production integration must use **squash merge** so `main` receives one clean institutional-theme commit.
