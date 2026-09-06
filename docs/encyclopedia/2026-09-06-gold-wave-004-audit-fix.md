# Wave 004 — Audit-driven correction record

Date: 2026-09-06

The first PR production audit correctly failed with four critical pages. The release was **not** merged and the audit standard was not relaxed.

## Exact first-pass findings

- `avoidant-restrictive-food-intake-disorder`: `surveillance/reassessment is not explicit`
- `functional-neurological-symptom-disorder`: `surveillance/reassessment is not explicit`
- `hoarding-disorder`: `surveillance/reassessment is not explicit`
- `prolonged-grief-disorder`: `surveillance/reassessment is not explicit`

The audit also identified non-critical anti-overclaim/variability warnings across the Wave 004 pages.

## Production corrections

The content itself was strengthened instead of changing the gate:

- explicit `إعادة التقييم والمتابعة` sections were added to ARFID, FND, PGD and hoarding;
- explicit `حدود الدليل والتباين` sections were added to all five Wave 004 pages, including catatonia;
- reassessment is tied to clinical/functional targets rather than automatic repeated testing;
- evidence limits and individual heterogeneity are now explicit rather than implicit.

## Current top-level structured rendered text

| Page | Structured words | Blocks |
| --- | ---: | ---: |
| ARFID | 1,541 | 84 |
| Catatonia | 1,332 | 68 |
| FND | 1,430 | 78 |
| Hoarding disorder | 1,525 | 86 |
| Prolonged grief disorder | 1,455 | 80 |

All five remain above the 1,200-word Gold `condition_reference` floor without an evidence-limited exception.

This record intentionally changes `docs/encyclopedia/**` so the production scientific audit runs again on the corrected production state. Wave 004 must remain unmerged until the rerun is green.
