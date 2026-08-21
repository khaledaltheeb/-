# Rawafid V3 — Legacy Migration Closeout Audit

Status date: 2026-08-21

## Scope and source of truth

This closeout audit covers the validated production corpus imported from `khaledaltheeb/healthrenewal.org` into Rawafid V3.

Validated production source:

- Artifact: `validated-production-site`
- Artifact ID: `9238517196`
- Legacy source SHA: `5a48c4bc4abb1b63b05fac64580a3463759b41b5`
- Artifact digest: `sha256:e657d2cde228c281d6fca80f130f15f06fc2791d344724d929d897cf2590158f`
- Production HTML pages: **5,642**

Preservation and publication remain separate decisions. A source can be fully preserved without being published or indexable.

## Database preservation result

The current Supabase audit records show:

- legacy migration items: **5,642 / 5,642**;
- missing source SHA: **0**;
- missing migration decision: **0**;
- open `*_REVIEW` migration decisions: **0**;
- legacy merge blocks accounted for: **5,702 / 5,702**;
- unresolved merge blocks: **0**.

The previous apparent merge backlog was re-audited rather than blindly appended. Blocks were closed only where preservation could be demonstrated through an existing destination content version or explicit `MERGE_PRESERVED` provenance.

## Page-route preservation

Meaningful historical page routes have an explicit representation through the legacy route registry or an active redirect. The closeout route audit found no meaningful page route left without a representation decision.

Five additional evidence-backed redirects were added during closeout:

- `/mental-health` → `/terms/mental-health/`
- `/research` → `/library/research/`
- `/psychology/adhd` → `/adhd/`
- `/specialists-partners/index.html` → `/specialists-partners/`
- `/about/editorial-policy` → `/editorial-methodology/`

The intentionally archived Quick Info route `/quick-info/explain-mental-health-to-child/` remains excluded from the generic legacy fallback and redirects to `/content/talking-to-child-about-mental-health`.

## Internal-link preservation

The final cross-system link audit covers **39,795 / 39,795** internal references.

Resolution sources include:

- the legacy page-route registry;
- active redirects;
- exact dynamic application routes;
- deterministic materialization of validated production machine-readable assets.

Final unresolved internal references: **0**.

## Machine-readable legacy assets

Twenty-six historical JSON/CSV/XML-style URLs are preserved by the application contract:

- **22** exact static assets are reconstructed from the validated production artifact;
- **4** URLs are served by existing exact Next.js route handlers.

The 22 static assets are stored as a chunked Base64 preservation bundle under `data/legacy-static-assets-v1.chunk*.b64`. Build materialization performs all of the following before writing files:

1. verifies all ten chunks are present;
2. verifies concatenated Base64 length;
3. verifies compressed byte length;
4. verifies compressed SHA-256 `6c6173efdd93eca467af3c34ac3a4396cea7960a2f0e528606cbaaa6f5490bd9`;
5. verifies validated production artifact ID `9238517196`;
6. verifies the exact 22-path manifest;
7. verifies every materialized asset SHA-256 and byte size.

The materializer runs before development/build/OpenNext operations, and `architecture-check` enforces the static-asset preservation contract.

## Pediatric-oncology research expansion

During the same audit cycle, **15** additional doctoral-thesis source records were added to the pediatric-oncology research category from verified UMC Utrecht institutional repository records.

Safety state of the batch:

- status `draft`: **15 / 15**;
- published: **0**;
- indexable: **0**;
- robots follow enabled: **0**;
- missing source identity: **0**;
- missing persistent identifier: **0**;
- duplicate slugs / persistent identifiers / source URLs: **0**.

These records intentionally remain unpublished until each page is substantively expanded and independently passes the evidence-digest release contract, including depth, source mapping, taxonomy, originality, review and public-route checks.

## CI and repository state

The preservation repair is tracked in draft pull request **#287** on branch `fix/legacy-static-asset-preservation-20260821`.

The current PR head was checked after replacing the connector-sensitive binary bundle with deterministic UTF-8 Base64 chunks. GitHub checks on that head completed without a failing or pending check.

This document does **not** claim that PR #287 has been merged or deployed to production. Production closeout requires merge/deployment followed by live-route verification.

## Completion interpretation

The migration knowledge-preservation phase is now closed at the audit/data-contract level:

- every validated production source item has provenance and a disposition;
- every recorded merge block is accounted for;
- page-route coverage has no unresolved meaningful legacy route;
- internal-link coverage has no unresolved reference when application routes and preserved machine-readable assets are included;
- the missing static asset family has a deterministic, checksum-verified build path.

The remaining boundary is operational release, not missing knowledge: merge PR #287, deploy it, then verify the 22 static URLs and representative legacy routes against the live origin before declaring production deployment complete.
