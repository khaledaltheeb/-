#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "android/app/src/main/java/org/healthrenewal/rawafid"
MANIFEST = (ROOT / "android/app/src/main/AndroidManifest.xml").read_text(encoding="utf-8")

checks = {
    "manifest background location": "android.permission.ACCESS_BACKGROUND_LOCATION" in MANIFEST,
    "manifest foreground location service": 'android:foregroundServiceType="location"' in MANIFEST,
    "boot receiver registered": '.BootReceiver' in MANIFEST,
    "safety monitor cloud RPC": "broadcastSafetyLocation" in (SRC / "SafetyMonitorActivity.kt").read_text(encoding="utf-8"),
    "safety monitor pre-alert cancel": "أنا بخير — لا ترسل" in (SRC / "SafetyMonitorActivity.kt").read_text(encoding="utf-8"),
    "safety monitor SMS optional policy": "requiresSmsPermission" in (SRC / "SafetyDeliveryPolicy.kt").read_text(encoding="utf-8"),
    "circle boot restore": "CircleNotificationScheduler.ensureScheduled(context)" in (SRC / "TreatmentReminderReceiver.kt").read_text(encoding="utf-8"),
    "circle lockscreen privacy": "VISIBILITY_PRIVATE" in (SRC / "CircleNotificationSystem.kt").read_text(encoding="utf-8"),
    "vault AES-GCM": "AES/GCM/NoPadding" in (SRC / "LifeVaultFileStore.kt").read_text(encoding="utf-8"),
    "vault Android Keystore": "AndroidKeyStore" in (SRC / "LifeVaultFileStore.kt").read_text(encoding="utf-8"),
    "vault encrypted import wired": "LifeVaultFileStore.importEncrypted" in (SRC / "LifeVaultActivity.kt").read_text(encoding="utf-8"),
}

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(f"[{'OK' if ok else 'FAIL'}] {name}")
if failed:
    raise SystemExit("Android safety contract failure: " + ", ".join(failed))
