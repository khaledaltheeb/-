# Performance hardening notes

- Public header optimization removes request-time `cookies()` / Supabase auth reads from shared public rendering.
- UI-only member navigation uses a hydration-safe external-store snapshot. Authorization remains enforced by the existing server proxy and Supabase claims/MFA checks.
- Internal navigation uses `next/link` with prefetch disabled for member-state links to avoid accidental authenticated-route prefetch work.
- No sitemap, canonical, robots, route, content, or database mutation is part of this change.
