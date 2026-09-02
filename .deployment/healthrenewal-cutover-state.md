# healthrenewal.org production cutover

- Canonical hostname: `https://healthrenewal.org`
- Production Worker: `rawafid-platform-production`
- Staging Worker: `rawafid-platform-staging`
- `www.healthrenewal.org`: permanent redirect to canonical hostname
- Production must be indexable and must not emit `workers.dev` canonical or sitemap URLs.
