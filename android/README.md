# Rawafid Android

Android companion application for healthrenewal.org.

## Architecture

- Native launcher screen for app-only functions.
- Trusted Web Activity for the existing Health Renewal / Rawafid web platform.
- Local-only wellbeing reminders at approximately 08:00, 12:00, 16:00 and 20:00.
- Reminder scheduling uses Android AlarmManager and SharedPreferences; it does not require recurring Supabase or Cloudflare calls.
- Notification permission is requested only after the user explicitly enables reminders.
- Reminder state is restored after device reboot or app replacement.

## Privacy boundary

The reminder scheduler stores only an enabled/disabled flag locally. The four reminder messages are packaged in the APK. No reminder telemetry, mood answer, menstrual data, or notification interaction is transmitted by this Android layer.

## Build

Open the `android` directory in Android Studio with JDK 17 and build the `app` module. The project targets Android API 36 and supports Android 8.0+ (API 26+).

## Play release gate

Before production publishing, create the final Play signing identity and publish `/.well-known/assetlinks.json` on `https://healthrenewal.org` using the release SHA-256 certificate fingerprint. This is intentionally not committed with a fake fingerprint. The Trusted Web Activity can then be cryptographically verified against the production domain.

## Next functional wave

The web-side women calendar currently has a privacy-first local tracker. A richer historical implementation exists in the legacy repository branches and should be selectively ported only after reviewing the medical wording, especially any cycle/ovulation forecasting. Period estimates must remain estimates and must not be presented as contraception, fertility diagnosis, or pregnancy prediction.
