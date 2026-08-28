# Rawafid Shared Sources Pipeline

Purpose: durable handoff between outreach/reply agents and the source-to-site agent. This is an internal operational file, not public-facing content.

## Rules
- Add only resources actually received/discovered and independently verified enough to identify the canonical source.
- Never include private email bodies, personal data, credentials, confidential attachments, or non-public links.
- Deduplicate primarily by canonical URL, then title + issuing organization.
- Record copyright/licensing/permission status before any reuse beyond citation/linking.
- Prefer primary/authoritative sources, official guidelines/toolkits, systematic reviews, high-quality institutional reports and academically sound material.
- For health/medical claims, evidence quality and recency must be assessed before publication.
- Never copy protected text. Paraphrase accurately and cite/link the source; follow attribution/license requirements.
- Each resource moves through: `NEW -> VERIFIED -> MAPPED -> USED` or `REJECTED`, with `PERMISSION_REQUIRED` when applicable.
- `USED` requires a concrete Rawafid page/commit/path reference.

## Queue schema
Use one row per canonical resource.

| Status | Organization | Resource title | Canonical URL | Type | Topic/Sector | Evidence/value note | License / permission | Recommended Rawafid destination | Discovered from | Used in |
|---|---|---|---|---|---|---|---|---|---|---|

## Editorial decision rules
A resource may generate a new page only when it represents a real user/search/content gap and the repository/site does not already have a page satisfying the same intent. Otherwise enrich the strongest existing page. New or enriched content must be Arabic-first, clear, evidence-based, internally linked, accessible, SEO-complete, non-duplicative, and free of filler.

## Privacy boundary
Email correspondence may be used to locate public sources or understand permission, but private correspondence itself must not be published. Attribute only public institutional sources unless explicit publication permission exists.
