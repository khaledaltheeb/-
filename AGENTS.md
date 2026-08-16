# Rawafid V3 Agent Rules

- Build the new platform independently from the legacy repository.
- Do not copy legacy theme, CSS, components, headers, footers, layouts, or scripts.
- Legacy repository is a future content source only.
- Keep Arabic RTL first-class and responsive from the first commit.
- Public UI: bright institutional Off-white + Rawafid teal with controlled sector accents.
- The official public brand name is **منصة روافد**. Use «روافد» alone only as a constrained short form where space requires it.
- Treat `app/rawafid-theme.css` as the single global theme entry point. Add new global visual rules there or in an explicitly scoped module imported by it; do not add new page-global CSS imports directly to `app/layout.tsx`.
- Prefer semantic design tokens and reusable components over hard-coded visual values or duplicated page styles.
- Sector colors are accents only; the institutional Platform Rawafid identity remains constant across public modules.
- Admin and specialist portals are functional systems, not cosmetic dashboards.
- Database changes must be migrations and all exposed tables must use RLS.
- The shared Supabase project uses `main` as the database-migration authority. New migrations must be merged to `main` before `cloudflare-workers-deploy` may mirror them, and mirrored migration files must match `main` exactly.
- Applied migration history is append-only: never modify, delete, or rename an existing migration file; use a new forward migration instead.
- Staging-only work must never be the first source of a live Supabase migration.
- Never merge a pull request targeting `cloudflare-workers-deploy` when the `Staging Shared DB Migration Guard` check is failing.
- Never expose Supabase secret/service keys to the browser.
- Content migration begins only after the empty platform passes functional, security, SEO, accessibility, and deployment checks.
