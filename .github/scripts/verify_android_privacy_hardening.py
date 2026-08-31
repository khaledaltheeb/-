#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]


def text(path: str) -> str:
    target = ROOT / path
    if not target.is_file():
        raise AssertionError(f"missing required file: {path}")
    return target.read_text(encoding="utf-8")


def require(path: str, *markers: str) -> None:
    content = text(path)
    missing = [marker for marker in markers if marker not in content]
    if missing:
        raise AssertionError(f"{path}: missing privacy contract markers: {missing}")


def forbid(path: str, *markers: str) -> None:
    content = text(path)
    present = [marker for marker in markers if marker in content]
    if present:
        raise AssertionError(f"{path}: forbidden privacy regression markers present: {present}")


# Keystore-backed encrypted-at-rest foundation and migration ordering.
helper = "android/app/src/main/java/org/healthrenewal/rawafid/SensitiveLocalPayload.kt"
require(
    helper,
    "EncryptedLocalStore.get(context, encryptedKey)",
    "EncryptedLocalStore.put(context, encryptedKey, legacy)",
    "legacyPrefs.edit().remove(legacyKey).apply()",
)
helper_content = text(helper)
if helper_content.index("EncryptedLocalStore.put(context, encryptedKey, legacy)") > helper_content.index("legacyPrefs.edit().remove(legacyKey).apply()"):
    raise AssertionError("SensitiveLocalPayload must encrypt before removing the legacy plaintext copy")

# Sensitive local domains must remain on the encrypted storage path.
encrypted_contracts = {
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenProfile.kt": ["rawafid_women_profile_v2", "EncryptedLocalStore.put"],
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenActivity.kt": ["rawafid_women_companion_entries_v2", "SensitiveLocalPayload"],
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenCalendarActivity.kt": ["rawafid_women_calendar_entries_v2", "rawafid_women_calendar_settings_v2"],
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenCarePlannerActivity.kt": ["rawafid_women_care_planner_items_v2", "SensitiveLocalPayload"],
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenVisitPrepActivity.kt": ["rawafid_women_calendar_entries_v2", "SensitiveLocalPayload"],
    "android/app/src/main/java/org/healthrenewal/rawafid/MedicationCompanionActivity.kt": ["rawafid_medication_items_v2", "rawafid_medication_logs_v2"],
    "android/app/src/main/java/org/healthrenewal/rawafid/HealthTimelineActivity.kt": ["rawafid_health_timeline_entries_v2", "SensitiveLocalPayload"],
    "android/app/src/main/java/org/healthrenewal/rawafid/AppointmentCompanionActivity.kt": ["rawafid_appointment_companion_notes_v2", "SensitiveLocalPayload"],
    "android/app/src/main/java/org/healthrenewal/rawafid/FamilyHubActivity.kt": ["rawafid_family_hub_members_v2", "rawafid_family_hub_tasks_v2"],
    "android/app/src/main/java/org/healthrenewal/rawafid/CareModeActivity.kt": ["rawafid_care_mode_profiles_v2", "SensitiveLocalPayload"],
    "android/app/src/main/java/org/healthrenewal/rawafid/LifeCardStore.kt": ["rawafid_life_card_profile_v2", "SensitiveLocalPayload"],
    "android/app/src/main/java/org/healthrenewal/rawafid/SupportPassportActivity.kt": ["rawafid_support_passport_profile_v2", "SensitiveLocalPayload"],
    "android/app/src/main/java/org/healthrenewal/rawafid/EmergencyBeaconActivity.kt": ["rawafid_emergency_beacon_profile_v2", "EncryptedLocalStore.put"],
    "android/app/src/main/java/org/healthrenewal/rawafid/LifeUtilityActivity.kt": ["rawafid_life_utilities_v2_", "SensitiveLocalPayload"],
    "android/app/src/main/java/org/healthrenewal/rawafid/LocalStore.kt": ["rawafid_local_treatments_v2", "rawafid_local_emergency_card_v2"],
}
for path, markers in encrypted_contracts.items():
    require(path, *markers)

# Prevent re-introduction of known plaintext payload writes in the sensitive stores.
plaintext_regressions = {
    "android/app/src/main/java/org/healthrenewal/rawafid/MedicationCompanionActivity.kt": ["putString(MEDICATIONS", "putString(LOGS"],
    "android/app/src/main/java/org/healthrenewal/rawafid/HealthTimelineActivity.kt": ["putString(KEY"],
    "android/app/src/main/java/org/healthrenewal/rawafid/AppointmentCompanionActivity.kt": ["putString(LEGACY_KEY"],
    "android/app/src/main/java/org/healthrenewal/rawafid/FamilyHubActivity.kt": ["putString(MEMBERS", "putString(TASKS"],
    "android/app/src/main/java/org/healthrenewal/rawafid/CareModeActivity.kt": ["putString(LEGACY_KEY"],
    "android/app/src/main/java/org/healthrenewal/rawafid/LifeCardStore.kt": ["putString(PROFILE_JSON"],
    "android/app/src/main/java/org/healthrenewal/rawafid/SupportPassportActivity.kt": ["putString(PROFILE_JSON"],
    "android/app/src/main/java/org/healthrenewal/rawafid/LifeUtilityActivity.kt": ["prefs(context).edit().putString(key"],
}
for path, markers in plaintext_regressions.items():
    forbid(path, *markers)

# Every women-sector screen with private health data/settings must enforce the gate even on direct launch.
women_targets = {
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenActivity.kt": "TARGET_COMPANION",
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenCalendarActivity.kt": "TARGET_CALENDAR",
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenCarePlannerActivity.kt": "TARGET_PLANNER",
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenVisitPrepActivity.kt": "TARGET_VISIT_PREP",
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenPrivacySettingsActivity.kt": "TARGET_SETTINGS",
}
for path, target in women_targets.items():
    require(path, f"WomenPrivacyGate.requireUnlocked(this, WomenPrivacyGate.{target})")
require(
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenPrivacyGateActivity.kt",
    "WindowManager.LayoutParams.FLAG_SECURE",
    "fun requireUnlocked",
)

# Health/women reminders are private on lockscreen and expose only a neutral public version.
for path in [
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenActivity.kt",
    "android/app/src/main/java/org/healthrenewal/rawafid/WomenCarePlannerActivity.kt",
    "android/app/src/main/java/org/healthrenewal/rawafid/MedicationCompanionActivity.kt",
]:
    require(path, "VISIBILITY_PRIVATE", "setPublicVersion")

# Emergency Beacon is the explicit exception: the user turns it on specifically to show assistance data publicly.
require(
    "android/app/src/main/java/org/healthrenewal/rawafid/EmergencyBeaconActivity.kt",
    "VISIBILITY_PUBLIC",
    "buildPublicText",
    "showActivateConfirm",
)

# Embedded web surface: HTTPS allowlist, no mixed content, no file/content access, no third-party cookies.
require(
    "android/app/src/main/java/org/healthrenewal/rawafid/WebActivity.kt",
    "MIXED_CONTENT_NEVER_ALLOW",
    "allowFileAccess = false",
    "allowContentAccess = false",
    "setAcceptThirdPartyCookies(this, false)",
    "safeBrowsingEnabled = true",
    "onRenderProcessGone",
)
forbid("android/app/src/main/java/org/healthrenewal/rawafid/WebActivity.kt", "addJavascriptInterface")

# Circle transport must always disconnect, bound network waits, and never surface arbitrary backend text.
require(
    "android/app/src/main/java/org/healthrenewal/rawafid/RawafidCircleApi.kt",
    "connectTimeout = 15_000",
    "readTimeout = 20_000",
    "Cache-Control",
    "catch (_: SocketTimeoutException)",
    "catch (_: IOException)",
    "finally {",
    "connection.disconnect()",
)
forbid(
    "android/app/src/main/java/org/healthrenewal/rawafid/RawafidCircleApi.kt",
    "message.isNotBlank() -> message",
)

# Push endpoint is nonce-authorized; guard payload size/type and keep response diagnostics generic.
require(
    "supabase/functions/rawafid-circle-push/index.ts",
    "MAX_REQUEST_BYTES",
    "OUTBOUND_TIMEOUT_MS",
    "unsupported_media_type",
    "payload_too_large",
    "invalid_or_expired_nonce",
    'return json({ error: "push_failed" }, 500)',
)

# QR linking must not request direct camera permission from the app or auto-send a connection request.
manifest = text("android/app/src/main/AndroidManifest.xml")
if "android.permission.CAMERA" in manifest:
    raise AssertionError("Google Code Scanner flow must remain camera-permissionless in the app manifest")

print("Android privacy hardening contract: OK")
