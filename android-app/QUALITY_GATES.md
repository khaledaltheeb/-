# Rawafid Android production quality gates

A build is not release-ready until every mandatory gate below passes on the same commit.

## Automated blocking gates

- Android API 36 compile/target.
- Release manifest contains no `debuggable=true`.
- Cleartext HTTP disabled.
- WebView debugging disabled in application code.
- No known credential/private-key patterns committed in Android sources.
- JVM unit tests pass for notification schedules, trusted URLs, cycle calculations, message-bank uniqueness/anti-repeat, and mood-pattern safeguards.
- `bundleRelease` succeeds with R8 full mode and resource shrinking.
- `lintRelease` succeeds without ignored newly introduced correctness/security errors.
- AGP release R8 configuration analysis succeeds.
- Release AAB stays below the current 20 MiB engineering budget.
- Mobile-facing Next.js API contract passes repository TypeScript typecheck.

## Security/privacy gates

- Sensitive personal state uses Android Keystore-backed AES-256/GCM encryption.
- Reproductive-health, mood, name, notification preferences, followed topics and local cursors are excluded from cloud backup/device transfer.
- External/untrusted URLs never load in the embedded WebView.
- Embedded WebView accepts Rawafid HTTPS only; file/content access and third-party cookies are disabled.
- Notification permission is requested contextually, never on first launch.
- Personalized companion notification body is private on lock screen; public version is generic.
- Companion is opt-in by default.
- User can delete local personal data before production release.

## Device/emulator gates (next blocking stage)

Test at minimum:
- compact phone
- standard phone
- large phone
- 7–8 inch tablet
- 10+ inch tablet
- foldable/window-resize scenario
- light/dark theme
- Arabic RTL with large system font
- TalkBack focus order and labels
- Android back gesture from every native and embedded screen
- offline launch and network loss during content browsing
- notification denied/allowed/revoked flows
- Doze/background scheduling behavior
- process death/state restoration
- screen rotation/resizing
- Native app chrome respects Android status/navigation-bar insets and never overlaps system UI.
- Embedded pages do not expose a second fixed bottom navigation when the native app navigation is present.
- Light and reading-night surfaces maintain readable foreground, hint, placeholder, field and dialog contrast.
- Production-page screenshots are captured only after the real article H1 has rendered; loading or blank WebView frames never qualify as visual evidence.

## Functional regression gates

- All major Rawafid platform entry points open correctly.
- Live sectors catalog gracefully falls back offline.
- First content-alert sync creates a baseline without notification spam.
- Later newly published content is matched by real taxonomy, not URL guessing.
- Companion respects enabled state, active window, daily cap and minimum interval.
- Equal companion start/end means all-day window; overnight windows work.
- Manual companion message does not consume automatic daily quota.
- 1,000 companion messages are unique; recent exact repeats are suppressed.
- Future period start cannot be entered.
- Cycle/ovulation/fertility outputs are always described as estimates and never contraception/diagnosis.
- Mood-pattern insight requires minimum longitudinal data and does not claim menstrual causality.

## Google Play release gates

- Play App Signing/upload key configured outside source control.
- The Play artifact is produced only by the signed-release workflow and `jarsigner -verify` succeeds before upload.
- Unsigned CI validation bundles are labeled explicitly and must never be submitted to Play Console.
- `assetlinks.json` contains the final Play signing SHA-256 certificate fingerprint.
- Public HTTPS app privacy policy is live and matches actual behavior.
- Data Safety answers match actual collection/storage/sharing.
- Health Apps Declaration covers period tracking/reproductive health and mental wellbeing features accurately.
- IARC content rating completed accurately.
- Final 512x512 icon verified.
- Final feature graphic contains only verified typography or no text.
- Phone/tablet screenshots are captured from the real tested app, never AI-rendered interface text.
