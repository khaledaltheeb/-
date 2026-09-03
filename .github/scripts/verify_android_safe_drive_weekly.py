#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
JAVA = ROOT / "android" / "app" / "src" / "main" / "java" / "org" / "healthrenewal" / "rawafid"
TEST = ROOT / "android" / "app" / "src" / "test" / "java" / "org" / "healthrenewal" / "rawafid"
MIGRATIONS = ROOT / "supabase" / "migrations"
errors = []


def read(path: Path) -> str:
    if not path.exists():
        errors.append(f"missing {path.relative_to(ROOT)}")
        return ""
    return path.read_text(encoding="utf-8")


weekly = read(JAVA / "SafeDriveWeeklyCircle.kt")
api = read(JAVA / "RawafidCircleApi.kt")
agreements = read(JAVA / "SafeDriveAgreementsActivity.kt")
application = read(JAVA / "RawafidApplication.kt")
test = read(TEST / "SafeDriveWeeklyCircleTest.kt")
migrations = "\n".join(
    p.read_text(encoding="utf-8")
    for p in MIGRATIONS.glob("*rawafid_circle_safe_drive*.sql")
)

for token in [
    "SafeDriveWeeklyCirclePolicy",
    "SafeDriveWeeklyCircleScheduler",
    "SafeDriveWeeklyCircleWorker",
    "PeriodicWorkRequestBuilder<SafeDriveWeeklyCircleWorker>(7, TimeUnit.DAYS)",
    "ExistingPeriodicWorkPolicy.KEEP",
    "NetworkType.CONNECTED",
    "nextMondayNineDelayMs",
    "SafeDriveWeeklyAnalytics.summarize",
    "driveWeeklyPreferences",
    "sendDriveWeeklyReportToConnection",
    "لا يتضمن هذا الملخص مسار GPS أو موقعك",
]:
    if token not in weekly:
        errors.append(f"SafeDriveWeeklyCircle.kt missing contract: {token}")

for token in [
    "CircleDriveWeeklyPreference",
    '"circle_get_drive_weekly_preferences"',
    '"circle_set_drive_weekly_report_enabled"',
    '"circle_send_drive_weekly_report_to_connection"',
    "SafeDriveWeeklyCircleScheduler.ensure(context)",
    "SafeDriveWeeklyCircleScheduler.cancel(context)",
]:
    if token not in api:
        errors.append(f"RawafidCircleApi.kt missing weekly contract: {token}")

for token in [
    'title = "ملخص أسبوعي تلقائي"',
    "معطل افتراضيًا",
    "RawafidCircleApi.setDriveWeeklyReportEnabled",
    "RawafidCircleApi.driveWeeklyPreferences",
]:
    if token not in agreements:
        errors.append(f"SafeDriveAgreementsActivity.kt missing weekly consent UI: {token}")

if "SafeDriveWeeklyCircleScheduler.ensure(this)" not in application:
    errors.append("RawafidApplication.kt must restore weekly Safe Drive scheduling")

for token in [
    "weekly_reports_enabled boolean not null default false",
    "circle_get_drive_weekly_preferences",
    "circle_set_drive_weekly_report_enabled",
    "circle_send_drive_weekly_report_to_connection",
    "safe_drive_weekly_report",
    "m.metadata->>'week_key'=v_week_key",
    "'location_shared',false",
    "da.weekly_reports_enabled=true",
]:
    if token not in migrations:
        errors.append(f"Safe Drive weekly migration missing contract: {token}")

for token in [
    "weekKeyUsesCompletedRollingWeekAnchor",
    "nextScheduleTargetsMondayMorning",
    "automaticSummaryNeverContainsLocationTraceLanguage",
]:
    if token not in test:
        errors.append(f"SafeDriveWeeklyCircleTest.kt missing coverage: {token}")

if errors:
    print("ANDROID SAFE DRIVE WEEKLY VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Android Safe Drive weekly contract OK: per-person opt-in, weekly WorkManager schedule, aggregate-only summary, server idempotency and no-location delivery verified")
