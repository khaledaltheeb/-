#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
JAVA = ROOT / "android/app/src/main/java/org/healthrenewal/rawafid"


def read(name: str) -> str:
    return (JAVA / name).read_text(encoding="utf-8")


def require(text: str, marker: str, message: str) -> None:
    if marker not in text:
        raise SystemExit(f"UI polish contract failed: {message}")


scaffold = read("RawafidScreenScaffold.kt")
what_now = read("WhatNowActivity.kt")
account = read("CircleAccountActivity.kt")
circle = read("MyCircleActivity.kt")

require(scaffold, "fun RawafidScreenScaffold(", "shared standalone-screen scaffold is missing")
require(scaffold, "Icons.AutoMirrored.Filled.ArrowBack", "RTL-aware back affordance is missing")
require(scaffold, ".imePadding()", "standalone screen shell must protect form actions from the IME")
require(scaffold, ".statusBarsPadding()", "screen shell must account for system status bars")
require(scaffold, "RawafidSpacing.ScreenHorizontal", "screen shell must use the shared spacing system")
require(scaffold, "RawafidSpacing.ScreenVertical", "screen shell must use shared vertical spacing")

require(what_now, "RawafidScreenScaffold(", "What Now must use the shared shell")
require(what_now, "BackHandler(enabled = selected != null)", "nested What Now navigation must handle system back")
require(what_now, "RawafidSpacing.CardContent", "What Now cards must use shared card spacing")

for banned in ("PaddingValues(20.dp)", "Modifier.padding(16.dp)", "Arrangement.spacedBy(14.dp)"):
    if banned in what_now:
        raise SystemExit(f"UI polish contract failed: legacy local spacing remains in WhatNowActivity: {banned}")

require(account, "RawafidScreenScaffold(", "Circle account must use the shared standalone-screen shell")
require(account, "WindowManager.LayoutParams.FLAG_SECURE", "Circle account must remain protected from screenshots")
require(account, 'var password by remember { mutableStateOf("") }', "account password must stay out of saved state")
require(account, 'var passwordConfirmation by remember { mutableStateOf("") }', "password confirmation must stay out of saved state")
require(account, 'var mfaCode by remember { mutableStateOf("") }', "MFA code must stay out of saved state")
require(account, 'title = "حساب روافد"', "Circle account shell title is missing")
require(account, "modifier = Modifier.fillMaxWidth()", "Circle account actions must provide large-text-safe full-width controls")

for banned in (
    'var password by rememberSaveable',
    'var passwordConfirmation by rememberSaveable',
    'var mfaCode by rememberSaveable',
    'Surface(Modifier.fillMaxSize()) { CircleAccountScreen',
):
    if banned in account:
        raise SystemExit(f"UI polish contract failed: unsafe or legacy Circle account pattern remains: {banned}")

require(circle, "RawafidScreenScaffold(", "My Circle must use the shared standalone-screen shell")
require(circle, 'title = "دائرتي — Rawafid Circle"', "My Circle shell title is missing")
require(circle, "ClipData.newPlainText(\"Rawafid ID\", identity)", "RFD copy action must remain available")
require(circle, 'putExtra(Intent.EXTRA_TEXT, "أضفني إلى دائرتك في روافد: $identity")', "RFD explicit share action must remain available")
require(circle, "CircleQrScanner.start(", "My Circle QR scan entry point is missing")
require(circle, "المسح يملأ معرّف RFD فقط ولا يرسل طلب ارتباط تلقائيًا", "QR scan must remain fill-only with explicit submit")
require(circle, "RawafidCircleApi.sendConnectionRequest(context, id, label)", "connection requests must remain explicit")
require(circle, "EncryptedLocalStore.put(context, ENCRYPTED_PEOPLE_KEY", "local safety contacts must remain encrypted")
require(circle, "Android Keystore", "local safety contact encryption disclosure is missing")

for banned in (
    "Surface(Modifier.fillMaxSize()) { MyCircleScreen() }",
    "Surface(Modifier.fillMaxSize()) { MyCircleScreen(",
):
    if banned in circle:
        raise SystemExit(f"UI polish contract failed: legacy My Circle screen shell remains: {banned}")

print("Android UI polish contract: PASS")
