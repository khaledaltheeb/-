#!/usr/bin/env python3
import json
import pathlib
import re
import sys
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
ASSETS = ROOT / "android" / "app" / "src" / "main" / "assets"
JAVA = ROOT / "android" / "app" / "src" / "main" / "java" / "org" / "healthrenewal" / "rawafid"

errors = []


def load_json(name):
    path = ASSETS / name
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"{name}: invalid JSON: {exc}")
        return []


def require_unique(items, label):
    seen = set()
    for item in items:
        item_id = str(item.get("id", "")).strip()
        if not item_id:
            errors.append(f"{label}: item without id")
        elif item_id in seen:
            errors.append(f"{label}: duplicate id: {item_id}")
        seen.add(item_id)


def declared_kotlin_classes():
    classes = set()
    pattern = re.compile(r"\b(?:class|object)\s+([A-Za-z_][A-Za-z0-9_]*)\b")
    for path in JAVA.glob("*.kt"):
        try:
            text = path.read_text(encoding="utf-8")
        except Exception as exc:
            errors.append(f"cannot read Kotlin source {path.name}: {exc}")
            continue
        classes.update(pattern.findall(text))
    return classes


classes = declared_kotlin_classes()
features = load_json("rawafid_feature_catalog.json")
if not isinstance(features, list) or not features:
    errors.append("feature catalog: expected non-empty array")
else:
    require_unique(features, "feature catalog")
    allowed_routes = {"web", "main", "quick", "activity"}
    for item in features:
        fid = str(item.get("id", "")).strip() or "<missing>"
        title = str(item.get("title", "")).strip()
        category = str(item.get("category", "")).strip()
        route_type = str(item.get("route_type", "")).strip()
        target = str(item.get("route_target", "")).strip()
        status = str(item.get("status", "stable")).strip()
        priority = item.get("priority")

        if not title:
            errors.append(f"{fid}: missing title")
        if not category:
            errors.append(f"{fid}: missing category")
        if route_type not in allowed_routes:
            errors.append(f"{fid}: unsupported route_type={route_type!r}")
        if not target:
            errors.append(f"{fid}: empty route_target")
        if status not in {"stable", "beta", "hidden"}:
            errors.append(f"{fid}: unsupported status={status!r}")
        if not isinstance(priority, int):
            errors.append(f"{fid}: priority must be integer")

        if route_type == "activity" and target.startswith("org.healthrenewal.rawafid."):
            class_name = target.rsplit(".", 1)[-1]
            if class_name not in classes:
                errors.append(f"{fid}: activity class not declared in Kotlin sources: {class_name}")

        if route_type == "web":
            parsed = urlparse(target)
            host = (parsed.hostname or "").lower()
            if parsed.scheme != "https":
                errors.append(f"{fid}: web route must use https")
            if host != "healthrenewal.org" and not host.endswith(".healthrenewal.org"):
                errors.append(f"{fid}: web route must stay on healthrenewal.org")

reminders = load_json("rawafid_reminder_catalog.json")
if not isinstance(reminders, list) or not reminders:
    errors.append("reminder catalog: expected non-empty array")
else:
    require_unique(reminders, "reminder catalog")
    allowed_channels = {"eye", "daily", "motivation", "treatment"}
    for item in reminders:
        rid = str(item.get("id", "")).strip() or "<missing>"
        for key in ("title", "description", "body"):
            if not str(item.get(key, "")).strip():
                errors.append(f"{rid}: missing {key}")
        channel = str(item.get("channel", "")).strip()
        if channel not in allowed_channels:
            errors.append(f"{rid}: unsupported channel={channel!r}")
        default_minutes = item.get("default_minutes")
        min_minutes = item.get("min_minutes")
        max_per_day = item.get("max_per_day")
        if not isinstance(default_minutes, int) or default_minutes <= 0:
            errors.append(f"{rid}: default_minutes must be positive integer")
        if not isinstance(min_minutes, int) or min_minutes <= 0:
            errors.append(f"{rid}: min_minutes must be positive integer")
        if isinstance(default_minutes, int) and isinstance(min_minutes, int) and default_minutes < min_minutes:
            errors.append(f"{rid}: default_minutes cannot be below min_minutes")
        if not isinstance(max_per_day, int) or not (1 <= max_per_day <= 48):
            errors.append(f"{rid}: max_per_day must be 1..48")

if errors:
    print("ANDROID CATALOG VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(f"Android catalogs OK: {len(features)} features, {len(reminders)} reminder definitions, {len(classes)} Kotlin classes/objects")
