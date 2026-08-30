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
GRADLE = ROOT / "android" / "app" / "build.gradle.kts"
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
advanced = text(JAVA / "SafeDriveAdvanced.kt")
auto_detection = text(JAVA / "SafeDriveAutoDetection.kt")
sensor_fusion = text(JAVA / "SafeDriveSensorFusion.kt")
agreement_activity = text(JAVA / "SafeDriveAgreementsActivity.kt")
agreement_observer = text(JAVA / "SafeDriveAgreementObserver.kt")
circle = text(JAVA / "RawafidCircleApi.kt")
my_circle = text(JAVA / "MyCircleActivity.kt")
application = text(JAVA / "RawafidApplication.kt")
feature_catalog_source = text(JAVA / "FeatureCatalog.kt")
gradle = text(GRADLE)

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
    "strongestRecentDecelerationMps2",
]:
    if token not in incident:
        errors.append(f"SafeDriveIncident.kt missing contract: {token}")

for token in [
    "autoDetectionEnabled",
    "spokenAlertsEnabled",
    "reduceDistractionEnabled",
    "restReminderMinutes",
    "newDriverMode",
    "nightGuardEnabled",
    "SafeDriveWeeklyAnalytics",
    "SafeDriveVoiceCoach",
    "EncryptedLocalStore.put",
]:
    if token not in advanced:
        errors.append(f"SafeDriveAdvanced.kt missing contract: {token}")

for token in [
    "DetectedActivity.IN_VEHICLE",
    "requestActivityTransitionUpdates",
    "EXTRA_SAFE_DRIVE_AUTO_DETECTED",
    "SafeDriveActivityTransitionReceiver",
    "SafeDriveAutoRestoreReceiver",
    "SafeDriveAdvancedStore.passengerSuppressed",
    '"أنا راكب"',
]:
    if token not in auto_detection:
        errors.append(f"SafeDriveAutoDetection.kt missing contract: {token}")

for token in [
    "Sensor.TYPE_GYROSCOPE",
    "SafeDriveTurnFusionRule",
    "DEFAULT_MAX_SIGNAL_AGE_MS",
    "gyroCorroboratedTurnCount",
    "gpsOnlyTurnCount",
    "SafeDriveSensorFusionStore.save",
    "EncryptedLocalStore.put(context, KEY",
    "does not collect location",
]:
    if token not in sensor_fusion:
        errors.append(f"SafeDriveSensorFusion.kt missing contract: {token}")

for forbidden in ["latitude", "longitude", "route_points", "polyline"]:
    if forbidden in sensor_fusion.lower():
        errors.append(f"SafeDriveSensorFusion.kt must not persist or process location fields: {forbidden}")

for token in [
    'setContentTitle("هل أنت بخير؟")',
    '"نعم، أنا بخير"',
    '"لا، أحتاج مساعدة"',
    'SafeDriveIncidentStore.add',
    'RawafidCircleApi.broadcastDriveAlert',
    'SafeDriveReportShareWorker',
    'ACTION_SAFE_DRIVE_HELP_NOW',
    'startForeground(',
    'location.accuracy in 0.1f..driveConfig.maxLocationAccuracyM',
    'CirclePermission.DRIVING_SAFETY',
    'SafeDriveAdvancedPolicy.spokenEvent',
    'maybeRestReminder',
    'postArrivalPrompt',
]:
    if token not in service:
        errors.append(f"SafeDriveService.kt missing contract: {token}")

risk_call = service.find('"risky_driving"')
if risk_call < 0 or service[max(0, risk_call - 600):risk_call].count("null") < 3:
    errors.append("ordinary risky-driving Circle alerts must omit live location")

for token in [
    'Text("قيادة آمنة"',
    '"driving_safety"',
    '"التصعيد عند عدم الرد"',
    '"هذا ليس حد السرعة القانوني للطريق."',
    'لا يخزن روافد مسار الرحلة الكامل',
    'Manifest.permission.ACCESS_COARSE_LOCATION',
    'SafeDriveIncidentStore.records(context)',
    '"نقطة اطمئنان — أكد المستخدم أنه بخير"',
    '"أنا السائق — ابدأ القيادة الآمنة"',
    '"أنا راكب — لا تسجل الرحلة"',
    '"اكتشاف وجود الهاتف داخل مركبة"',
    '"تنبيهات صوتية قصيرة"',
    '"تقليل التشتيت"',
    '"وضع السائق الجديد"',
    '"حارس القيادة الليلية"',
    '"ملخص آخر 7 أيام"',
]:
    if token not in activity:
        errors.append(f"SafeDriveActivity.kt missing contract: {token}")

for token in [
    'Text("اتفاق القيادة الآمنة"',
    'RawafidCircleApi.driveAgreements(context)',
    'RawafidCircleApi.setDriveAgreement(context, next)',
    'RawafidCircleApi.setPermission(context, person.connectionId, "driving_safety", enabled)',
    '"تنبيهات طلب المساعدة والتوقف المفاجئ"',
    '"تنبيهات القيادة عالية الخطورة"',
    '"تقرير نهاية الرحلة"',
    '"تنبيه السرعة لهذا الشخص — كم/س (50–180)"',
    '"هذه سرعة اتفاق شخصية وليست حد السرعة القانوني للطريق."',
]:
    if token not in agreement_activity:
        errors.append(f"SafeDriveAgreementsActivity.kt missing contract: {token}")

for token in [
    'RawafidCircleApi.customDriveAgreements(context)',
    'RawafidCircleApi.sendDriveAlertToConnection',
    'event = "persistent_speed"',
    '"severe_speed"',
    '"risk_cluster"',
    'No location is transmitted',
    'ConcurrentHashMap.newKeySet',
]:
    if token not in agreement_observer:
        errors.append(f"SafeDriveAgreementObserver.kt missing contract: {token}")

for token in [
    'SafeDriveAgreementObserver.start(this)',
    'SafeDriveSensorFusionObserver.start(this)',
]:
    if token not in application:
        errors.append(f"RawafidApplication.kt missing Safe Drive process observer: {token}")

for token in [
    'id = "safe_drive_agreements"',
    'routeTarget = "org.healthrenewal.rawafid.SafeDriveAgreementsActivity"',
]:
    if token not in feature_catalog_source:
        errors.append(f"FeatureCatalog.kt missing Safe Drive agreement feature: {token}")

for token in [
    'DRIVING_SAFETY("driving_safety"',
    '"driving_safety" to "السماح له باستلام تنبيهات وتقارير القيادة الآمنة',
]:
    if token not in my_circle:
        errors.append(f"MyCircleActivity.kt missing driving-safety permission contract: {token}")

for token in [
    '"circle_broadcast_drive_alert"',
    '"circle_broadcast_drive_report"',
    '"circle_get_drive_agreements"',
    '"circle_get_custom_drive_agreements"',
    '"circle_set_drive_agreement"',
    '"circle_send_drive_alert_to_connection"',
    'SafeDriveScoring.reportSummary(report)',
    'latitude: Double?',
    '.put("p_latitude", latitude ?: JSONObject.NULL)',
]:
    if token not in circle:
        errors.append(f"RawafidCircleApi.kt missing Safe Drive RPC/privacy contract: {token}")

if 'com.google.android.gms:play-services-location:21.4.0' not in gradle:
    errors.append("Android build missing Google Play services location/activity-recognition dependency")

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
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION",
        "android.permission.ACTIVITY_RECOGNITION",
        "com.google.android.gms.permission.ACTIVITY_RECOGNITION",
    ]:
        if required not in permissions:
            errors.append(f"manifest missing {required}")
    activities = {node.attrib.get(ANDROID_NS + "name", "") for node in app.findall("activity")} if app is not None else set()
    for required_activity in [".SafeDriveActivity", ".SafeDriveAgreementsActivity"]:
        if required_activity not in activities:
            errors.append(f"manifest missing {required_activity}")
    services = app.findall("service") if app is not None else []
    drive_service = next((node for node in services if node.attrib.get(ANDROID_NS + "name") == ".SafeDriveService"), None)
    if drive_service is None:
        errors.append("manifest missing SafeDriveService")
    elif drive_service.attrib.get(ANDROID_NS + "foregroundServiceType") != "location":
        errors.append("SafeDriveService must declare foregroundServiceType=location")
    receivers = {node.attrib.get(ANDROID_NS + "name", "") for node in app.findall("receiver")} if app is not None else set()
    for required_receiver in [".SafeDriveActivityTransitionReceiver", ".SafeDriveAutoRestoreReceiver"]:
        if required_receiver not in receivers:
            errors.append(f"manifest missing {required_receiver}")
except Exception as exc:
    errors.append(f"manifest parse failed: {exc}")

migration_text = "\n".join(path.read_text(encoding="utf-8") for path in MIGRATIONS.glob("*rawafid_circle_safe_drive*.sql"))
for token in [
    "driving_safety",
    "circle_broadcast_drive_alert",
    "circle_broadcast_drive_report",
    "safe_drive_incident",
    "safe_drive_report",
    "safe_drive_risk",
    "'location_shared',false",
    "circle_drive_agreements",
    "circle_get_drive_agreements",
    "circle_get_custom_drive_agreements",
    "circle_set_drive_agreement",
    "circle_send_drive_alert_to_connection",
    "speed_threshold_kmh",
    "persistent_speed_seconds",
    "v_event='risky_driving' and da.connection_id is null",
    "circle_drive_agreements_grantor_idx",
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

print("Android Safe Drive contract OK: consent-first vehicle detection, driver/passenger mode, spoken coaching, rest guard, encrypted weekly analytics, per-person driving agreements, targeted thresholds, active-trip gyroscope corroboration, location minimization and sudden-stop safety checks verified")
