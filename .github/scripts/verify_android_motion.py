#!/usr/bin/env python3
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
JAVA = ROOT / "android" / "app" / "src" / "main" / "java" / "org" / "healthrenewal" / "rawafid"

MOTION_PATTERNS = (
    re.compile(r"\banimate[A-Z][A-Za-z0-9_]*\s*\("),
    re.compile(r"\bAnimatedVisibility\s*\("),
    re.compile(r"\bAnimatedContent\s*\("),
    re.compile(r"\brememberInfiniteTransition\s*\("),
    re.compile(r"\bupdateTransition\s*\("),
)

MOTION_POLICY_MARKERS = (
    "MotionPolicy",
    "reduceMotion",
    "LocalMotionDurationScale",
    "MotionDurationScale",
)

errors = []
scanned = 0
motion_files = []

if not JAVA.exists():
    errors.append(f"Android motion contract: source directory missing: {JAVA}")
else:
    for path in sorted(JAVA.rglob("*.kt")):
        scanned += 1
        try:
            text = path.read_text(encoding="utf-8")
        except Exception as exc:
            errors.append(f"Android motion contract: cannot read {path.name}: {exc}")
            continue

        has_motion = any(pattern.search(text) for pattern in MOTION_PATTERNS)
        if not has_motion:
            continue

        motion_files.append(path.name)
        if not any(marker in text for marker in MOTION_POLICY_MARKERS):
            errors.append(
                f"Android motion contract: {path.name} uses Compose animation without "
                "reduceMotion/MotionPolicy awareness"
            )

required_files = {
    "AccessibilityProfile.kt": ("reduceMotion",),
    "MotionPolicy.kt": ("durationMillis", "reduceMotion"),
    "RawafidApp.kt": (
        "AccessibilityProfileStore.load(context).reduceMotion",
        "MotionPolicy.durationMillis(reduceMotion)",
        "animationSpec = if (reduceMotion) snap() else tween",
    ),
}

for filename, tokens in required_files.items():
    path = JAVA / filename
    if not path.exists():
        errors.append(f"Android motion contract: missing required file {filename}")
        continue
    try:
        text = path.read_text(encoding="utf-8")
    except Exception as exc:
        errors.append(f"Android motion contract: cannot read {filename}: {exc}")
        continue
    for token in tokens:
        if token not in text:
            errors.append(f"Android motion contract: {filename} missing required token {token!r}")

if errors:
    print("ANDROID MOTION VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(
    f"Android motion contract OK: scanned {scanned} Kotlin files; "
    f"motion-aware files: {', '.join(motion_files) if motion_files else 'none'}"
)
