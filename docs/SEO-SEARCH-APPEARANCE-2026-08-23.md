# Rawafid Search Appearance Program — 2026-08-23

This document records the implementation contract for improving how منصة روافد is understood and presented by Google Search.

## Primary objectives

1. Make the official site name unambiguous: **منصة روافد**, with **روافد** as the short alternate name.
2. Keep the favicon URL stable and crawlable.
3. Put `WebSite` structured data on the home page and keep organization identity consistent site-wide.
4. Strengthen direct, indexable internal links to the platform's main hubs so Google can infer useful organic sitelinks.
5. Keep canonical URLs, robots directives, and sitemap discovery aligned with the public deployment host.
6. Avoid unsupported or deprecated search-result markup. In particular, the retired sitelinks search box is not treated as a target feature.

## Primary indexable hubs

- `/sectors/pediatric-oncology`
- `/sectors`
- `/sections`
- `/care-guides/`
- `/evidence-guides/`
- `/encyclopedia/`
- `/cognitive-lab`
- `/specialists`
- `/centers`

These URLs must remain reachable through normal HTML anchors from high-authority pages such as the home page, header, and footer.

## Deployment requirement

`NEXT_PUBLIC_SITE_URL` must always equal the public canonical hostname for the active environment. When a permanent custom domain replaces the current Workers hostname, update the environment variable first, then preserve redirects from the previous hostname long enough for search engines to transfer signals.

## Verification gates

After deployment, verify:

- the home page emits a crawlable `rel="icon"` with a stable URL;
- the home page contains exactly one canonical URL pointing to the configured site root;
- `Organization` and `WebSite` JSON-LD use the same canonical host and brand name;
- public hub links render as direct anchors rather than query-only search URLs;
- `/robots.txt` allows public crawling and references the sitemap index;
- `/sitemap.xml` exposes all sitemap families, including encyclopedia and quick-information pages;
- no public canonical page unexpectedly emits `noindex`.

## Search-result expectation

Organic sitelinks are selected algorithmically by Google. This implementation improves eligibility and signal clarity but does not attempt to force a specific search-result layout.
