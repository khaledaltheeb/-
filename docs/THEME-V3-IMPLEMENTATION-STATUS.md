# Rawafid V3 — Empty Theme Implementation Status

> Scope: GitHub Pro + Supabase. No legacy content migration is allowed in this phase.

## Non-negotiable release rule

Legacy content stays outside the new platform until the owner explicitly issues: `ابدأ سحب المحتوى`.

The empty theme must remain capable of running with zero sectors, categories, content, specialists, centers and demo users.

## Production origin contract

- Canonical production origin: `https://healthrenewal.org`
- Internal navigation: relative URLs only.
- Canonical, Schema and Sitemaps: generated from the centralized site origin.
- Search indexing: disabled while the theme is under construction.

## Implemented theme layers

- Responsive RTL public shell.
- Institutional header, discovery mega menu, hero and footer system.
- Mobile bottom navigation and responsive mobile menu.
- Dynamic sectors and sections from Supabase with empty states.
- Public search and verified specialist / center / community directories.
- Specialist, center and trainee/volunteer public profile templates.
- Account, specialist, center and owner/admin workspaces.
- Institutional admin shell.
- Structured CMS block editor and long-form content renderer.
- Versioned content workflow and safe draft deletion.
- SEO / E-E-A-T / YMYL release gate in PostgreSQL.
- SEO readiness dashboard.
- Messaging, notifications and appointments core.
- Audit, reports, redirects and integrity tooling.
- Supabase media bucket + media asset registry + required alt text.
- Featured media stored in the same version snapshot as content drafts.
- PWA manifest, service worker, offline fallback, share target and generated PNG icons.
- Branded 404, loading and error states.
- Application/Supabase health endpoint.

## Database guarantees in the empty-theme phase

- No demo content should be inserted.
- Public application tables use RLS.
- Sensitive communication tables are accessed through controlled RPC boundaries.
- Anonymous users cannot execute content-write or media-registration RPCs.
- Content cannot reach release stages without the required SEO / E-E-A-T contract.
- YMYL content requires reviewer, review date, references and medical disclaimer before approval.

## Still requiring final acceptance before legacy migration

- Latest head must pass the full GitHub Quality Gate after every theme batch.
- All owner/admin navigation surfaces must expose the final modules consistently.
- Media upload needs authenticated end-to-end validation with a real account before production use.
- Messaging/appointments need a two-real-user end-to-end validation before declaring them 100% production-complete.
- PWA installation/push behavior needs final real-device validation.
- Production Core Web Vitals require measurement on the final deployed origin; lab Lighthouse is not field CWV.
- Supabase Auth production redirect/site URL must be validated when the final domain is connected.

## Migration boundary

When legacy migration is explicitly authorized, migrate **content and useful data only**. Do not migrate the old theme, CSS, JS, layouts, header/footer or legacy structural errors.
