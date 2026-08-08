# Evidence Guides migration — 2026-08-09

## Scope
- Legacy source: `khaledaltheeb/healthrenewal.org/evidence-guides/`
- New repository: `khaledaltheeb/-`
- 37 evidence guides plus the `/evidence-guides/` collection page.

## Migration contract
- Preserve the legacy canonical route for every guide: `/evidence-guides/<slug>/`.
- Preserve all meaningful visible guide text; exclude navigation/theme markup and render sources through structured references.
- Preserve authoritative external references and safety/disclaimer text.
- Do not migrate the legacy static theme.
- Store source provenance and SHA-256 in `content.schema_json`.
- Publish through the existing `content_release_gate`; do not disable or bypass quality triggers.
- Render through the new Next.js/Supabase architecture with responsive layouts, canonical metadata, breadcrumbs and structured data.

## Verification completed before application merge
- Source inventory: 37 guide directories + 1 hub page.
- New-repository pre-migration canonical count for `/evidence-guides/`: 0.
- Near-title audit: no source guide reached 0.60 similarity against existing published content.
- Source completeness: 37/37 titles, excerpts and canonicals present; 37/37 had external authoritative references.
- Text integrity: 37/37 transformed guide bodies retained the exact source-body word count after markup removal (380–1694 words; average 769).
- Database release: 38 unique canonicals, 38 published records, 37/37 guides with references.
- Safety deduplication: the source safety notice is retained once through the dedicated `medical_disclaimer` field, not duplicated in body blocks.
- Structured body depth after safety deduplication: 54–164 blocks per guide.
- SEO release contract: title length 29–47; description length 151–158.

## Application routes
- `/evidence-guides/` — collection page grouped by editorial category.
- `/evidence-guides/[slug]/` — individual guide page.
- Existing content sitemap includes these published canonical URLs automatically.
- The global navigation exposes the collection directly as «الأدلة» so the section is not orphaned.
