# Encyclopedia Gold-Standard Wave 003 — Release Closure

Date: 2026-09-06

Wave 003 is closed.

## Repository closure

- Pull request: #768
- Merge method: squash
- Main merge commit: `66355346bac536f8b0d6b76e8c7cc35fc7701a7c`
- PR was mergeable at release time.
- Encyclopedia scientific quality audit: passed.
- Canonical Ownership Gate: passed.
- Rawafid Fast Quality Gate: passed, including lint, build and minimal runtime smoke.
- Canonical-consolidation contract: passed for protected Cluttering and CAS redirect variants.

## Production closure

The five Gold condition owners remain published/indexable:

- `/encyclopedia/childhood-apraxia-speech/`
- `/encyclopedia/wagr-spectrum-disorder/`
- `/encyclopedia/opitz-g-bbb-syndrome/`
- `/encyclopedia/waardenburg-syndrome/`
- `/encyclopedia/potocki-shaffer-syndrome/`

The two superseded CAS diagnostic/reference records remain fully preserved in production:

- `/content/special-ed-encyclopedia-childhood-apraxia-of-speech`
- `/special-needs/communication/childhood-apraxia-of-speech/`

Their state is intentionally:

- `status=published`
- `robots_index=false`
- `robots_follow=true`
- `content_quality_hold.status=safety_hold_pending_review`
- `content_quality_hold.content_preserved=true`
- `consolidation.phase=redirect_config_merged`

No published record was deleted or archived and no preservation guard was disabled.

## Recovery closure

Post-wave snapshots were written at `2026-09-06 15:18:37.005399+00` for all ten records touched by the wave. Each post snapshot includes taxonomy/tag relations and `_wave_snapshot.phase=post_change` with the main merge commit.

Current version counts after closure:

- `capabilities-childhood-apraxia-of-speech`: 5
- `childhood-apraxia-speech`: 2
- `childhood-apraxia-speech-school-support`: 2
- `legacy-outside-box-childhood-apraxia-of-speech`: 3
- `legacy-special-needs-communication-childhood-apraxia-of-speech`: 3
- `opitz-g-bbb-syndrome`: 2
- `potocki-shaffer-syndrome`: 2
- `special-ed-encyclopedia-childhood-apraxia-of-speech`: 2
- `waardenburg-syndrome`: 2
- `wagr-spectrum-disorder`: 2

## Verification boundary

The redirect configuration is merged to `main`, but external Cloudflare-edge redirect behavior was not independently observable from the current execution environment. Therefore the database correctly records `redirect_config_merged` rather than claiming external edge verification.
