#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ANDROID = ROOT / "android" / "app" / "src"


def read(path: Path) -> str:
    if not path.is_file():
        raise SystemExit(f"[FAIL] missing required file: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")


def require(text: str, tokens: list[str], label: str) -> None:
    missing = [token for token in tokens if token not in text]
    if missing:
        raise SystemExit(f"[FAIL] {label}: missing {missing}")


life = read(ANDROID / "main/java/org/healthrenewal/rawafid/LifeInbox.kt")
main = read(ANDROID / "main/java/org/healthrenewal/rawafid/MainActivity.kt")
catalog = read(ANDROID / "main/java/org/healthrenewal/rawafid/FeatureCatalog.kt")
shortcuts = read(ANDROID / "main/res/xml/shortcuts.xml")
unit_test = read(ANDROID / "test/java/org/healthrenewal/rawafid/LifeInboxClassifierTest.kt")

require(
    life,
    [
        "enum class LifeCaptureKind",
        "object LifeInboxClassifier",
        "object LifeInboxStore",
        "SensitiveLocalPayload.read",
        "SensitiveLocalPayload.write",
        "take(800)",
        "fun LifeInboxScreen",
        "لا يُرسل النص إلى خدمة ذكاء اصطناعي خارجية",
    ],
    "Life Inbox encrypted/local contract",
)

for forbidden in ("HttpURLConnection", "java.net.URL", "FirebaseMessaging", "RawafidCircleApi"):
    if forbidden in life:
        raise SystemExit(f"[FAIL] Life Inbox classifier/store must remain local-only; found {forbidden}")

require(main, ['destination == "life_inbox"', "LifeInboxScreen"], "Life Inbox main route")
require(
    catalog,
    ['id = "life_inbox"', 'routeType = "main"', 'routeTarget = "life_inbox"', 'status = "beta"'],
    "Life Inbox catalog route",
)
require(shortcuts, ['android:shortcutId="life_inbox"', 'android:value="life_inbox"'], "Life Inbox launcher shortcut")
require(
    unit_test,
    [
        "classifiesMedicationCapture",
        "classifiesAppointmentCapture",
        "classifiesItemLocationCapture",
        "classifiesSafetyBeforeOtherCategories",
        "fallsBackToNoteWithoutGuessing",
    ],
    "Life Inbox classifier regression tests",
)

print("Android Life Inbox contract OK: encrypted local capture, fail-safe classification, routing and launcher entry verified")
