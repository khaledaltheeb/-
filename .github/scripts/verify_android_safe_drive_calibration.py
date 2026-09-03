#!/usr/bin/env python3
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
APP = ROOT / "android" / "app" / "src" / "main"
JAVA = APP / "java" / "org" / "healthrenewal" / "rawafid"
TEST = ROOT / "android" / "app" / "src" / "test" / "java" / "org" / "healthrenewal" / "rawafid"
MANIFEST = APP / "AndroidManifest.xml"
ANDROID_NS = "{http://schemas.android.com/apk/res/android}"
errors = []


def read(path: Path) -> str:
    if not path.exists():
        errors.append(f"missing {path.relative_to(ROOT)}")
        return ""
    return path.read_text(encoding="utf-8")


confidence = read(JAVA / "SafeDriveSensorConfidence.kt")
activity = read(JAVA / "SafeDriveCalibrationActivity.kt")
fusion = read(JAVA / "SafeDriveSensorFusion.kt")
features = read(JAVA / "FeatureCatalog.kt")
test = read(TEST / "SafeDriveSensorConfidenceTest.kt")

for token in [
    "SafeDriveSensorConfidenceResult",
    "SafeDriveSensorConfidence",
    "canInfluenceScore: Boolean = false",
    '"لا توجد بيانات معايرة"',
    '"GPS دون Gyroscope"',
    '"عينة معايرة صغيرة"',
    '"توافق حساسات مرتفع"',
    '"تحتاج معايرة ميدانية"',
]:
    if token not in confidence:
        errors.append(f"SafeDriveSensorConfidence.kt missing contract: {token}")

for token in [
    'Text("جودة قياس القيادة"',
    "SafeDriveSensorFusionRuntime.state.collectAsState()",
    "SafeDriveSensorFusionStore.summaries(context)",
    "SafeDriveSensorConfidence.evaluate(summary)",
    "لا تغيّر درجة القيادة",
    "لا تُخزن هذه الطبقة الموقع أو المسار",
    'Text("لا يؤثر هذا المؤشر في درجة ${report.score}/100."',
]:
    if token not in activity:
        errors.append(f"SafeDriveCalibrationActivity.kt missing transparency contract: {token}")

for token in [
    "Sensor.TYPE_GYROSCOPE",
    "SafeDriveTurnFusionRule",
    "SafeDriveSensorFusionStore.save",
    "does not collect location",
]:
    if token not in fusion:
        errors.append(f"SafeDriveSensorFusion.kt missing fusion contract: {token}")

for forbidden in ["latitude", "longitude", "route_points", "polyline"]:
    if forbidden in fusion.lower():
        errors.append(f"SafeDriveSensorFusion.kt must remain location-free: {forbidden}")

for token in [
    'id = "safe_drive_calibration"',
    'routeTarget = "org.healthrenewal.rawafid.SafeDriveCalibrationActivity"',
]:
    if token not in features:
        errors.append(f"FeatureCatalog.kt missing calibration route: {token}")

for token in [
    "noFusionDataNeverChangesDrivingScore",
    "missingGyroscopeIsNotPenalized",
    "strongCorroborationIsReportedButStillCalibrationOnly",
    "tinySampleDoesNotPretendToBeHighConfidence",
]:
    if token not in test:
        errors.append(f"SafeDriveSensorConfidenceTest.kt missing coverage: {token}")

try:
    root = ET.parse(MANIFEST).getroot()
    app = root.find("application")
    activities = {node.attrib.get(ANDROID_NS + "name", "") for node in app.findall("activity")} if app is not None else set()
    if ".SafeDriveCalibrationActivity" not in activities:
        errors.append("manifest missing SafeDriveCalibrationActivity")
except Exception as exc:
    errors.append(f"manifest parse failed: {exc}")

if errors:
    print("ANDROID SAFE DRIVE CALIBRATION VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print("Android Safe Drive calibration contract OK: location-free gyro corroboration is visible, explainable, non-penalizing and covered by tests")
