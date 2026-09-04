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

print("Android UI polish contract: PASS")
