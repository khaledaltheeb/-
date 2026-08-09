# A4 Conflict Record — sibling-wellbeing

- Legacy source: `khaledaltheeb/healthrenewal.org/sectors/family/guides/sibling-wellbeing/index.html`
- Legacy public URL: `/sectors/family/guides/sibling-wellbeing/`
- Lane reviewed: A4 — الطفل والأسرة والمدرسة
- Decision: **STOP — SECTOR / DUPLICATE BOUNDARY CONFLICT**
- Date reviewed: 2026-08-09

## Pre-claim checks

### GitHub Issues
Completed A4 Claim #65 (`sibling-jealousy`) documents a prior broad sibling audit that explicitly included this legacy path and `sibling-and-family-balance`. It keeps general jealousy/rivalry in A4 while treating special-needs-centered sibling/family-balance material as A3 context.

### MIGRATION-PROGRESS
The central ledger on `legacy-migration-audit` was reviewed and remains untouched. Its dedupe-before-claim and Supabase-authority rules were applied.

### Supabase
Two already-published destinations materially overlap this legacy page:
- `/content/sibling-jealousy` for general sibling conflict/jealousy/rivalry in A4.
- `/evidence-guides/sibling-and-family-balance/` (`الأشقاء وتوازن الأسرة: دعم عادل وآمن داخل المنزل`) for broader sibling/family balance.

## Legacy audit
The legacy page `دعم رفاه الإخوة والأخوات` focuses on age-appropriate information, private time, boundaries, expression, and support, and explicitly warns against loading a sibling with a caregiving role or neglecting their needs. That broader wellbeing/care-burden framing overlaps the existing sibling-and-family-balance evidence guide and the A3 boundary already documented in Claim #65, while ordinary sibling rivalry is already covered by `/content/sibling-jealousy`.

The file also contains broad functional/ICF boilerplate, internal review wording, safety/template text, and platform/GTM/CSS/JS shell. Path history is dominated by later bulk GTM, branding, and platform normalization rather than a separately evolving canonical.

## Coordinator action
Do not create a new A4 canonical for `sibling-wellbeing`. Coordinator/A3 should reconcile the verified legacy URL against the existing sibling-and-family-balance evidence guide and A3 ownership; general rivalry searches should continue to `/content/sibling-jealousy`.

No Claim was created, no redirect was written in this conflict-only pass, and no Supabase content was modified.