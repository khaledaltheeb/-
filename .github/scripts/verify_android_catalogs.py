#!/usr/bin/env python3
import json
import pathlib
import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

ROOT = pathlib.Path(__file__).resolve().parents[2]
APP = ROOT / "android" / "app" / "src" / "main"
ASSETS = APP / "assets"
JAVA = APP / "java" / "org" / "healthrenewal" / "rawafid"
MANIFEST = APP / "AndroidManifest.xml"
PACKAGE = "org.healthrenewal.rawafid"
ANDROID_NS = "{http://schemas.android.com/apk/res/android}"

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


def parse_manifest():
    try:
        return ET.parse(MANIFEST).getroot()
    except Exception as exc:
        errors.append(f"AndroidManifest.xml: cannot parse: {exc}")
        return None


def android_attr(node, name):
    return (node.attrib.get(ANDROID_NS + name) or "").strip()


def fqcn(name):
    if name.startswith("."):
        return PACKAGE + name
    if "." not in name:
        return PACKAGE + "." + name
    return name


def component_name(node):
    return fqcn(android_attr(node, "name"))


def child_names(node, tag):
    return {android_attr(child, "name") for child in node.findall(f"./intent-filter/{tag}") if android_attr(child, "name")}


def find_component(application, tag, full_name):
    for node in application.findall(tag):
        if component_name(node) == full_name:
            return node
    return None


def manifest_activities(root):
    if root is None:
        return set()
    return {component_name(node) for node in root.findall(".//activity") if android_attr(node, "name")}


def require_source_tokens(filename, tokens, label):
    path = JAVA / filename
    if not path.exists():
        errors.append(f"{label}: missing source file {filename}")
        return
    try:
        text = path.read_text(encoding="utf-8")
    except Exception as exc:
        errors.append(f"{label}: cannot read {filename}: {exc}")
        return
    for token in tokens:
        if token not in text:
            errors.append(f"{label}: missing required token {token!r} in {filename}")


def validate_manifest_contract(root):
    if root is None:
        return

    permissions = {android_attr(node, "name") for node in root.findall("uses-permission")}
    required_permissions = {
        "android.permission.INTERNET",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.RECEIVE_BOOT_COMPLETED",
        "android.permission.health.READ_STEPS",
        "android.permission.health.READ_SLEEP",
    }
    for permission in sorted(required_permissions - permissions):
        errors.append(f"AndroidManifest.xml: missing required permission {permission}")

    application = root.find("application")
    if application is None:
        errors.append("AndroidManifest.xml: missing <application>")
        return

    if android_attr(application, "name") != ".RawafidApplication":
        errors.append("AndroidManifest.xml: application must use .RawafidApplication")
    if android_attr(application, "allowBackup").lower() != "false":
        errors.append("AndroidManifest.xml: android:allowBackup must remain false")
    if android_attr(application, "usesCleartextTraffic").lower() != "false":
        errors.append("AndroidManifest.xml: android:usesCleartextTraffic must remain false")

    rationale_name = PACKAGE + ".HealthPermissionsRationaleActivity"
    rationale = find_component(application, "activity", rationale_name)
    if rationale is None:
        errors.append("Health Connect: missing HealthPermissionsRationaleActivity")
    else:
        if android_attr(rationale, "exported").lower() != "true":
            errors.append("Health Connect: rationale activity must be exported=true")
        if "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE" not in child_names(rationale, "action"):
            errors.append("Health Connect: rationale activity missing ACTION_SHOW_PERMISSIONS_RATIONALE")

    usage_alias = None
    for node in application.findall("activity-alias"):
        if fqcn(android_attr(node, "targetActivity")) == rationale_name:
            usage_alias = node
            break
    if usage_alias is None:
        errors.append("Health Connect: missing Android 14+ VIEW_PERMISSION_USAGE activity-alias")
    else:
        if android_attr(usage_alias, "exported").lower() != "true":
            errors.append("Health Connect: VIEW_PERMISSION_USAGE alias must be exported=true")
        if android_attr(usage_alias, "permission") != "android.permission.START_VIEW_PERMISSION_USAGE":
            errors.append("Health Connect: VIEW_PERMISSION_USAGE alias missing START_VIEW_PERMISSION_USAGE")
        if "android.intent.action.VIEW_PERMISSION_USAGE" not in child_names(usage_alias, "action"):
            errors.append("Health Connect: alias missing android.intent.action.VIEW_PERMISSION_USAGE")
        if "android.intent.category.HEALTH_PERMISSIONS" not in child_names(usage_alias, "category"):
            errors.append("Health Connect: alias missing android.intent.category.HEALTH_PERMISSIONS")

    widget = find_component(application, "receiver", PACKAGE + ".RawafidWidgetProvider")
    if widget is None:
        errors.append("Widget: RawafidWidgetProvider is not registered")
    else:
        if android_attr(widget, "exported").lower() != "false":
            errors.append("Widget: RawafidWidgetProvider must remain exported=false")
        if "android.appwidget.action.APPWIDGET_UPDATE" not in child_names(widget, "action"):
            errors.append("Widget: RawafidWidgetProvider missing APPWIDGET_UPDATE action")

    private_receivers = {
        "TreatmentReminderReceiver",
        "MedicationReminderReceiver",
        "FutureNoteReceiver",
        "WomenCareReminderReceiver",
        "SafeArrivalReceiver",
    }
    for short_name in sorted(private_receivers):
        receiver = find_component(application, "receiver", PACKAGE + "." + short_name)
        if receiver is None:
            errors.append(f"Manifest: missing receiver {short_name}")
        elif android_attr(receiver, "exported").lower() != "false":
            errors.append(f"Manifest: sensitive receiver {short_name} must remain exported=false")

    boot = find_component(application, "receiver", PACKAGE + ".BootReceiver")
    if boot is None:
        errors.append("Boot restore: BootReceiver is not registered")
    else:
        if android_attr(boot, "enabled").lower() != "true":
            errors.append("Boot restore: BootReceiver must remain enabled=true")
        if android_attr(boot, "exported").lower() != "true":
            errors.append("Boot restore: BootReceiver must remain exported=true for system broadcasts")
        boot_actions = child_names(boot, "action")
        for action in {"android.intent.action.BOOT_COMPLETED", "android.intent.action.MY_PACKAGE_REPLACED"}:
            if action not in boot_actions:
                errors.append(f"Boot restore: BootReceiver missing {action}")

    allowed_exported_activities = {
        PACKAGE + ".MainActivity",
        PACKAGE + ".HealthPermissionsRationaleActivity",
        PACKAGE + ".WomenPrivacySettingsActivity",
        PACKAGE + ".WomenActivity",
    }
    for activity in application.findall("activity"):
        if android_attr(activity, "exported").lower() == "true" and component_name(activity) not in allowed_exported_activities:
            errors.append(f"Manifest: unexpected exported activity {component_name(activity)}")

    for receiver in application.findall("receiver"):
        if android_attr(receiver, "exported").lower() == "true" and component_name(receiver) != PACKAGE + ".BootReceiver":
            errors.append(f"Manifest: unexpected exported receiver {component_name(receiver)}")


manifest_root = parse_manifest()
classes = declared_kotlin_classes()
registered_activities = manifest_activities(manifest_root)
validate_manifest_contract(manifest_root)

require_source_tokens(
    "NotificationPermissionSupport.kt",
    ["Manifest.permission.POST_NOTIFICATIONS", "ActivityResultContracts.RequestPermission()", "rememberLauncherForActivityResult"],
    "Notification permission support",
)
for reminder_surface in ("SafeArrivalActivity.kt", "MedicationCompanionActivity.kt", "FutureNoteActivity.kt"):
    require_source_tokens(
        reminder_surface,
        ["rememberNotificationPermissionRequester()", "requestNotifications()"],
        "Notification permission wiring",
    )
require_source_tokens(
    "HealthPermissionsRationaleActivity.kt",
    ["https://healthrenewal.org/privacy", "WebActivity.EXTRA_URL"],
    "Health Connect privacy rationale",
)

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

        if route_type == "activity" and target.startswith(PACKAGE + "."):
            class_name = target.rsplit(".", 1)[-1]
            if class_name not in classes:
                errors.append(f"{fid}: activity class not declared in Kotlin sources: {class_name}")
            if target not in registered_activities:
                errors.append(f"{fid}: activity not registered in AndroidManifest.xml: {target}")

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
    print("ANDROID VALIDATION FAILED")
    for error in errors:
        print(f"- {error}")
    sys.exit(1)

print(
    f"Android contracts OK: {len(features)} features, {len(reminders)} reminder definitions, "
    f"{len(classes)} Kotlin classes/objects, {len(registered_activities)} manifest activities; "
    "privacy, Health Connect, notification, widget and boot contracts verified"
)
