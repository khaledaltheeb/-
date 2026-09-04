#!/usr/bin/env python3
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "android/app/src/main/java/org/healthrenewal/rawafid"
MANIFEST = (ROOT / "android/app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")
APP_GRADLE = (ROOT / "android/app/build.gradle.kts").read_text(encoding="utf-8")
GOOGLE_SERVICES_PATH = ROOT / "android/app/google-services.json"
PUSH_ANDROID = (SRC / "CirclePushMessaging.kt").read_text(encoding="utf-8")
CIRCLE_API = (SRC / "RawafidCircleApi.kt").read_text(encoding="utf-8")
PUSH_EDGE_PATH = ROOT / "supabase/functions/rawafid-circle-push/index.ts"
PUSH_EDGE = PUSH_EDGE_PATH.read_text(encoding="utf-8") if PUSH_EDGE_PATH.exists() else ""
SUPABASE_CONFIG_PATH = ROOT / "supabase/config.toml"
SUPABASE_CONFIG = SUPABASE_CONFIG_PATH.read_text(encoding="utf-8") if SUPABASE_CONFIG_PATH.exists() else ""
GITIGNORE = (ROOT / ".gitignore").read_text(encoding="utf-8")
CIRCLE_MIGRATIONS = "\n".join(
    path.read_text(encoding="utf-8")
    for path in sorted((ROOT / "supabase/migrations").glob("*rawafid_circle*.sql"))
)

google_services = json.loads(GOOGLE_SERVICES_PATH.read_text(encoding="utf-8")) if GOOGLE_SERVICES_PATH.exists() else {}
registered_packages = {
    client.get("client_info", {}).get("android_client_info", {}).get("package_name")
    for client in google_services.get("client", [])
}
android_text = "\n".join(
    path.read_text(encoding="utf-8", errors="ignore")
    for path in (ROOT / "android").rglob("*")
    if path.is_file() and path.suffix in {".kt", ".kts", ".xml", ".json", ".properties"}
)

circle_notifications = (SRC / "CircleNotificationSystem.kt").read_text(encoding="utf-8")
treatment_notifications = (SRC / "TreatmentReminderReceiver.kt").read_text(encoding="utf-8")
vault_files = (SRC / "LifeVaultFileStore.kt").read_text(encoding="utf-8")
safety_monitor = (SRC / "SafetyMonitorActivity.kt").read_text(encoding="utf-8")
emergency_beacon = (SRC / "EmergencyBeaconActivity.kt").read_text(encoding="utf-8")

service_match = re.search(
    r'<service\b(?:(?!</service>).)*android:name="\.SafetyHotkeyAccessibilityService"(?:(?!</service>).)*?'
    r'<meta-data\b(?:(?!/>).)*android:name="android\.accessibilityservice"(?:(?!/>).)*?'
    r'android:resource="@xml/([A-Za-z0-9_]+)"(?:(?!/>).)*/>',
    MANIFEST,
    flags=re.DOTALL,
)
accessibility_resource = service_match.group(1) if service_match else ""
accessibility_config_path = ROOT / f"android/app/src/main/res/xml/{accessibility_resource}.xml" if accessibility_resource else None
accessibility_config = (
    accessibility_config_path.read_text(encoding="utf-8")
    if accessibility_config_path is not None and accessibility_config_path.exists()
    else ""
)

checks = {
    "manifest background location": "android.permission.ACCESS_BACKGROUND_LOCATION" in MANIFEST,
    "manifest foreground location service": 'android:foregroundServiceType="location"' in MANIFEST,
    "boot receiver registered": '.BootReceiver' in MANIFEST,
    "safety monitor cloud RPC": "broadcastSafetyLocation" in safety_monitor,
    "safety monitor pre-alert cancel": "أنا بخير — لا ترسل" in safety_monitor,
    "safety monitor SMS optional policy": "requiresSmsPermission" in (SRC / "SafetyDeliveryPolicy.kt").read_text(encoding="utf-8"),
    "safety monitor background location disclosure": (
        "عرض إفصاح الموقع في الخلفية" in safety_monitor
        and "لا يستخدم روافد الموقع للإعلانات" in safety_monitor
        and "عندما لا يكون التطبيق قيد الاستخدام" in safety_monitor
        and "requestBackgroundLocationAfterDisclosure" in safety_monitor
    ),
    "background location never requested before disclosure": (
        "requestBackgroundLocationIfNeeded()" not in safety_monitor
        and "backgroundDisclosureAcknowledged" in safety_monitor
        and "requestBackgroundLocationAfterDisclosure()" in safety_monitor
    ),
    "accessibility service config referenced by manifest": (
        bool(accessibility_resource)
        and accessibility_config_path is not None
        and accessibility_config_path.exists()
    ),
    "accessibility shortcut prominent disclosure": (
        "إفصاح خدمة الوصولية" in emergency_beacon
        and "لا تقرأ محتوى الشاشة أو النصوص" in emergency_beacon
        and "اختياري بالكامل" in emergency_beacon
        and "showAccessibilityDisclosure = true" in emergency_beacon
    ),
    "accessibility settings only after disclosure confirmation": (
        "مراجعة خدمة الوصولية وتفعيل الاختصار" in emergency_beacon
        and "أفهم — فتح إعدادات الوصولية" in emergency_beacon
        and "context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))" in emergency_beacon
        and "onClick = { context.startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }" not in emergency_beacon
    ),
    "accessibility service cannot retrieve window content": (
        'android:canRetrieveWindowContent="false"' in accessibility_config
        and 'android:canRequestFilterKeyEvents="true"' in accessibility_config
        and "override fun onAccessibilityEvent(event: AccessibilityEvent?) = Unit" in emergency_beacon
    ),
    "circle boot restore": "CircleNotificationScheduler.ensureScheduled(context)" in treatment_notifications,
    "circle lockscreen privacy": "VISIBILITY_PRIVATE" in circle_notifications and "setPublicVersion" in circle_notifications,
    "circle notification actions require unlock": "setAuthenticationRequired(true)" in circle_notifications,
    "treatment lockscreen privacy": "VISIBILITY_PRIVATE" in treatment_notifications and "setPublicVersion" in treatment_notifications,
    "Firebase config package": "org.healthrenewal.rawafid" in registered_packages,
    "Firebase Messaging dependency": 'implementation("com.google.firebase:firebase-messaging")' in APP_GRADLE,
    "Google Services Gradle plugin": 'id("com.google.gms.google-services")' in APP_GRADLE,
    "Firebase messaging service registered": ".RawafidFirebaseMessagingService" in MANIFEST and "com.google.firebase.MESSAGING_EVENT" in MANIFEST,
    "Circle push token lifecycle": "FirebaseMessaging.getInstance().token" in PUSH_ANDROID and "onNewToken" in PUSH_ANDROID,
    "Circle push wake receiver contract": 'message.data["scope"] != "circle"' in PUSH_ANDROID and 'message.data["type"] != "circle_wake"' in PUSH_ANDROID,
    "Circle push registration RPC": "circle_register_push_device" in CIRCLE_API and "circle_unregister_push_device" in CIRCLE_API,
    "Circle FCM sender present": "fcm.googleapis.com/v1/projects/" in PUSH_EDGE and "firebase.messaging" in PUSH_EDGE,
    "Circle FCM sender contract": 'scope: "circle"' in PUSH_EDGE and 'type: "circle_wake"' in PUSH_EDGE,
    "Circle push nonce gate": "circle_push_claim" in PUSH_EDGE and "p_nonce" in PUSH_EDGE and "invalid_or_expired_nonce" in PUSH_EDGE,
    "Circle push async database dispatch": "notifications_circle_push_dispatch" in CIRCLE_MIGRATIONS and "net.http_post" in CIRCLE_MIGRATIONS,
    "Circle push retry scheduler": "rawafid-circle-push-retry" in CIRCLE_MIGRATIONS and "retry_pending_circle_pushes" in CIRCLE_MIGRATIONS,
    "Circle webhook auth mode persisted": "[functions.rawafid-circle-push]" in SUPABASE_CONFIG and "verify_jwt = false" in SUPABASE_CONFIG,
    "Firebase Admin key downloads ignored": "firebase-adminsdk*.json" in GITIGNORE and "*serviceAccountKey*.json" in GITIGNORE,
    "no Firebase private key in Android": "BEGIN PRIVATE KEY" not in android_text and "FIREBASE_PRIVATE_KEY" not in android_text,
    "no Supabase service role secret in Android": "SUPABASE_SERVICE_ROLE_KEY" not in android_text,
    "vault AES-GCM": "AES/GCM/NoPadding" in vault_files,
    "vault Android Keystore": "AndroidKeyStore" in vault_files,
    "vault keystore initialization serialized": "@Synchronized" in vault_files,
    "vault encrypted import wired": "LifeVaultFileStore.importEncrypted" in (SRC / "LifeVaultActivity.kt").read_text(encoding="utf-8"),
}

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(f"[{'OK' if ok else 'FAIL'}] {name}")
if accessibility_resource:
    print(f"[INFO] Accessibility service config: @xml/{accessibility_resource}")
if failed:
    raise SystemExit("Android safety contract failure: " + ", ".join(failed))
