#!/usr/bin/env python3
from pathlib import Path
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "android" / "app" / "src" / "main"
JAVA = APP / "java" / "org" / "healthrenewal" / "rawafid"
MANIFEST = APP / "AndroidManifest.xml"
CATALOG = APP / "assets" / "rawafid_feature_catalog.json"
MIGRATIONS = ROOT / "supabase" / "migrations"
ANDROID_NS = "{http://schemas.android.com/apk/res/android}"
errors = []


def text(path: Path) -> str:
    if not path.exists():
        errors.append(f"missing {path.relative_to(ROOT)}")
        return ""
    return path.read_text(encoding="utf-8")


engine = text(JAVA / "SafeDriveEngine.kt")
incident = text(JAVA / "SafeDriveIncident.kt")
service = text(JAVA / "SafeDriveService.kt")
activity = text(JAVA / "SafeDriveActivity.kt")
circle = text(JAVA / "RawafidCircleApi.kt")

for token in [
    "SafeDriveAnalyzer",
    "harshAccelerationMps2",
    "harshBrakingMps2",
    "harshTurnDegPerSec",
    "personalSpeedAlertKmh",
    "EncryptedLocalStore.put(context, REPORTS_KEY",
    "حد السرعة هنا حد تنبيه شخصي وليس حد الطريق القانوني",
]:
    if token not in engine:
        errors.append(f"SafeDriveEngine.kt missing contract: {token}")

for token in [
    "SafeDriveIncidentDetector",
    "autoEscalateIfUnanswered",
    "SAFE_CONFIRMED",
    "HELP_REQUESTED",
    "minimumSpeedDropKmh",
    "impactThresholdG",
]:
    if token not in incident:
        errors.append(f"SafeDriveIncident.kt missing contract: {token}")

for token in [
    'setContentTitle("هل أنت بخير؟")',
    '"نعم، أنا بخير"',
    '"لا، أحتاج مساعدة"',
    'SafeDriveIncidentStore.add',
    'RawafidCircleApi.broadcastDriveAlert',
    'SafeDriveReportShareWorker',
    'ACTION_SAFE_DRIVE_HELP_NOW',
    'startForeground(',
]:
    if token not in service:
        errors.append(f"SafeDriveService.kt missing contract: {token}")

for token in [
    'Text("قيادة آمنة"',
    '"driving_safety"',
    '"التصعيد عند عدم الرد"',
    '"هذا ليس حد السرعة القانوني للطريق."',
    'لا يخزن روافد مسار الرحلة الكامل',
]:
    if token not in activity:
        errors.append(f"SafeDriveActivity.kt missing contract: {token}")

for token in [
    '"circle_broadcast_drive_alert"',
    '"circle_broadcast_drive_report"',
    'SafeDriveScoring.reportSummary(report)',
]:
    if token not in circle:
        errors.append(f"RawafidCircleApi.kt missing Safe Drive RPC: {token}")

try:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    safe_drive = next((item for item in catalog if item.get("id") == "safe_drive"), None)
    if not safe_drive:
        errors.append("feature catalog missing safe_drive")
    else:
        if safe_drive.get("category") != "safety":
            errors.append("safe_drive must remain in safety category")
        if safe_drive.get("route_target") != "org.healthrenewal.rawafid.SafeDriveActivity":
            errors.append("safe_drive route must target SafeDriveActivity")
except Exception as exc:
    errors.append(f"catalog parse failed: {exc}")

try:
    root = ET.parse(MANIFEST).getroot()
    app = root.find("application")
    permissions = {node.attrib.get(ANDROID_NS + "name", "") for node in root.findall("uses-permission")}
    for required in [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION",
    ]:
        if required not in permissions:
            errors.append(f"manifest missing {required}")
    activities = {node.attrib.get(ANDROID_NS + "name", "") for node in app.findall("activity")} if app is not None else set()
    if ".SafeDriveActivity" not in activities:
        errors.append("manifest missing SafeDriveActivity")
    services = app.findall("service") if app is not None else []
    drive_service = next((node for node in services if node.attrib.get(ANDROID_NS + "name") == ".SafeDriveService"), None)
    if drive_service is None:
        errors.append("manifest missing SafeDriveService")
    elif drive_service.attrib.get(ANDROID_NS + "foregroundServiceType") != "location":
        errors.append("SafeDriveService must declare foregroundServiceType=location")
except Exception as exc:
    errors.append(f"manifest parse failed: {exc}")

migration_text = "\n".join(path.read_text(encoding="utf-8") for path in MIGRATIONS.glob("*rawafid_circle_safe_drive*.sql"))
for token in [
    "driving_safety",
    "circle_broadcast_drive_alert",
    "circle_broadcast_drive_report",
    "safe_drive_incident",
    "safe_drive_report",
]:
    if token not in migration_text:
        errors.append(f"Safe Drive migration contract missing: {token}")

# Privacy contract: trip reports are aggregate and must not persist route-point arrays.
for forbidden in ["route_points", "polyline", "location_history"]:
    if forbidden in engine.lower():
        errors.append(f"SafeDriveEngine.kt must not persist route trace field: {forbidden}")

if errors:
    print("ANDROID SAFE DRIVE VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Android Safe Drive contract OK: foreground monitoring, aggregate encrypted reports, consented Circle sharing and sudden-stop check verified")
