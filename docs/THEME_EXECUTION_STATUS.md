# Central Theme V4 — Execution Status

This document tracks only work implemented on the theme branch. It is not a completion claim until CI and visual checks pass.

## Implemented

- Central theme entry point: `app/rawafid-theme.css`.
- Semantic `--rf-*` design tokens for brand, surfaces, typography, spacing, radii and elevation.
- Institutional brand name contract: **منصة روافد**.
- Frontend sector accent adapter (`lib/theme.ts`) to avoid database rewrites.
- Header brand normalization.
- Responsive hero hardening, including removal of the mobile no-wrap failure.
- Public grid normalization to 3×2 / 2×N / 1×N behavior.
- Reduced-motion, focus-visible, print and mobile safe-area rules.
- Updated internal theme preview for V4.
- Agent rules and architecture documentation to prevent new duplicated global CSS patterns.
- Theme V4 regression script.
- Theme import-graph guard.

## Explicitly unchanged

- Supabase schema.
- Supabase rows/content.
- RLS policies.
- Existing routes and canonical architecture.
- CMS workflow and block editor behavior.
- Authentication and protected-route behavior.
- Existing compatibility CSS modules while they are still referenced.

## Completion gate

Before this branch can be called complete it must pass:

1. central theme import wiring in root layout;
2. architecture/theme regression scripts;
3. TypeScript;
4. ESLint;
5. production build;
6. HTTP smoke checks;
7. Lighthouse/accessibility checks;
8. desktop/mobile visual review;
9. rebase or merge with current `main` without losing concurrent content work.
