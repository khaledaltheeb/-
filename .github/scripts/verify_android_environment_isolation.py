#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GRADLE = (ROOT / "android/app/build.gradle.kts").read_text(encoding="utf-8")
SRC = ROOT / "android/app/src/main/java/org/healthrenewal/rawafid"
CONFIG = (SRC / "RawafidBackendConfig.kt").read_text(encoding="utf-8")
CIRCLE = (SRC / "RawafidCircleApi.kt").read_text(encoding="utf-8")
DELETE = (SRC / "RawafidAccountDeletionApi.kt").read_text(encoding="utf-8")

PRODUCTION_HOST = "ghljwfwqsyfnthvlzxjy.supabase.co"

checks = {
    "debug environment explicitly isolated": 'buildConfigField("String", "RAWAFID_ENV", "\\\"debug-isolated\\\"")' in GRADLE,
    "debug backend disabled by default": 'buildConfigField("boolean", "RAWAFID_BACKEND_ENABLED", "false")' in GRADLE,
    "debug Supabase URL empty": 'buildConfigField("String", "RAWAFID_SUPABASE_URL", "\\\"\\\"")' in GRADLE,
    "debug publishable key empty": 'buildConfigField("String", "RAWAFID_SUPABASE_PUBLISHABLE_KEY", "\\\"\\\"")' in GRADLE,
    "release backend enabled": 'buildConfigField("boolean", "RAWAFID_BACKEND_ENABLED", "true")' in GRADLE,
    "release production host explicit": PRODUCTION_HOST in GRADLE,
    "central backend fail-closed gate": "fun requireConfigured()" in CONFIG and "!isEnabled || baseUrl.isBlank() || publishableKey.isBlank()" in CONFIG,
    "Circle uses central backend": "RawafidBackendConfig.requireConfigured()" in CIRCLE and "RawafidBackendConfig.baseUrl + path" in CIRCLE and "RawafidBackendConfig.publishableKey" in CIRCLE,
    "Circle hides stale session when backend disabled": "RawafidBackendConfig.isEnabled && loadSession(context) != null" in CIRCLE,
    "account deletion uses central backend": "RawafidBackendConfig.requireConfigured()" in DELETE and "RawafidBackendConfig.baseUrl" in DELETE and "RawafidBackendConfig.publishableKey" in DELETE,
    "production host removed from Circle API": PRODUCTION_HOST not in CIRCLE,
    "production host removed from delete API": PRODUCTION_HOST not in DELETE,
    "legacy beta production services label removed": "beta-production-services" not in GRADLE,
}

failed = [name for name, ok in checks.items() if not ok]
for name, ok in checks.items():
    print(f"[{'OK' if ok else 'FAIL'}] {name}")

if failed:
    raise SystemExit("Android environment isolation contract failure: " + ", ".join(failed))

print("Android environment isolation contract: PASS")
