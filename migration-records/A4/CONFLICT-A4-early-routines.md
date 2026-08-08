# A4 conflict — early-routines

- Candidate legacy URL: `/sectors/child/guides/early-routines/`
- Legacy file: `sectors/child/guides/early-routines/index.html`
- Legacy title: «بناء روتين مبكر يدعم التعلم والاستقلال».
- Lane considered: A4 — الطفل والأسرة والمدرسة.
- Decision: **STOP / DUPLICATE-INTENT — coordinator review if a separate child-only canonical is ever required.**

## Pre-claim checks

- GitHub Issues: no existing exact `early-routines` Claim found.
- `docs/MIGRATION-PROGRESS.md`: no exact `early-routines` canonical entry.
- Supabase: no exact `early-routines` row, but two already-published canonicals occupy the same search intent and practical scope:
  - `/content/family-routine-redesign` — owns family/child routine design, morning, after-school, meals, bedtime, visual supports, gradual responsibility and independence.
  - `/content/daily-family-rhythm` — owns predictable daily anchors, transitions, school-day rhythm, meals, homework, bedtime and flexibility.

The legacy page centers on inserting communication, movement and choice opportunities into everyday routines across home, nursery, preschool and school. Its core value can be absorbed by the existing routine canonicals without creating a third competing routine page. Creating `/content/early-routines` now would risk keyword/canonical cannibalization around `روتين الطفل`, `تنظيم يوم الطفل`, `روتين الصباح`, `روتين ما بعد المدرسة`, and `روتين النوم`.

No Claim was opened and no CMS row or redirect was created because the collision was identified during the mandatory pre-claim dedupe step.

`main` and `docs/MIGRATION-PROGRESS.md` were not modified.