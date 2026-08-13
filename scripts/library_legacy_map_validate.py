#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ALLOWED_COLLECTIONS = ("branches", "therapies", "research")
ALLOWED_DISPOSITIONS = {"merge_into_canonical", "create_canonical"}
LEGACY_PATTERN = re.compile(r"^/library/(branches|therapies|research)/\1-(\d{2})/$")
TARGET_PATTERN = re.compile(r"^/content/[a-z0-9]+(?:-[a-z0-9]+)*$")


def load(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise SystemExit(f"{path} must contain a JSON object")
    return payload


def library_inventory_paths(payload: dict[str, Any]) -> set[str]:
    rows = payload.get("records")
    if not isinstance(rows, list):
        raise SystemExit("Inventory does not contain a records list")
    out: set[str] = set()
    for row in rows:
        if not isinstance(row, dict):
            continue
        path = str(row.get("path") or row.get("url") or "").strip()
        if path.startswith("https://healthrenewal.org"):
            path = path.removeprefix("https://healthrenewal.org")
        if path.startswith("/library/"):
            if not path.endswith("/"):
                path += "/"
            out.add(path)
    return out


def expected_legacy_paths() -> set[str]:
    return {
        f"/library/{collection}/{collection}-{number:02d}/"
        for collection in ALLOWED_COLLECTIONS
        for number in range(1, 21)
    }


def validate_map(mapping: dict[str, Any], inventory_paths: set[str]) -> tuple[list[str], dict[str, Any]]:
    errors: list[str] = []
    rows = mapping.get("records")
    if not isinstance(rows, list):
        return ["Canonical map does not contain a records list"], {}

    expected_count = int(mapping.get("expected_record_count") or 0)
    if expected_count != 60:
        errors.append(f"expected_record_count must be 60, found {expected_count}")
    if len(rows) != expected_count:
        errors.append(f"records length {len(rows)} does not match expected_record_count {expected_count}")

    source_paths: list[str] = []
    target_paths: list[str] = []
    collection_counts: Counter[str] = Counter()
    disposition_counts: Counter[str] = Counter()
    merge_modern_paths: list[str] = []
    create_topics: list[dict[str, Any]] = []
    merge_topics: list[dict[str, Any]] = []

    for idx, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            errors.append(f"record #{idx} is not an object")
            continue

        source_path = str(row.get("source_path") or "").strip()
        title = str(row.get("source_title") or "").strip()
        collection = str(row.get("collection") or "").strip()
        disposition = str(row.get("disposition") or "").strip()
        target_slug = str(row.get("target_slug") or "").strip()
        target_path = str(row.get("target_path") or "").strip()
        modern_source_path = row.get("modern_source_path")
        rationale = str(row.get("rationale") or "").strip()

        source_paths.append(source_path)
        target_paths.append(target_path)
        collection_counts[collection] += 1
        disposition_counts[disposition] += 1

        match = LEGACY_PATTERN.match(source_path)
        if not match:
            errors.append(f"{source_path or f'record #{idx}'} is not a valid foundational library route")
        elif match.group(1) != collection:
            errors.append(f"{source_path} collection field does not match its path")

        if not title:
            errors.append(f"{source_path}: source_title is required")
        if collection not in ALLOWED_COLLECTIONS:
            errors.append(f"{source_path}: unsupported collection {collection!r}")
        if disposition not in ALLOWED_DISPOSITIONS:
            errors.append(f"{source_path}: unsupported disposition {disposition!r}")
        if not target_slug:
            errors.append(f"{source_path}: target_slug is required")
        if target_path != f"/content/{target_slug}":
            errors.append(f"{source_path}: target_path must equal /content/{{target_slug}}")
        if not TARGET_PATTERN.match(target_path):
            errors.append(f"{source_path}: invalid destination path {target_path!r}")
        if not rationale:
            errors.append(f"{source_path}: rationale is required")
        if row.get("preserve_source_as_redirect") is not True:
            errors.append(f"{source_path}: preserve_source_as_redirect must be true")

        if disposition == "merge_into_canonical":
            modern = str(modern_source_path or "").strip()
            if not modern:
                errors.append(f"{source_path}: merge records require modern_source_path")
            else:
                merge_modern_paths.append(modern)
                if modern not in inventory_paths:
                    errors.append(f"{source_path}: modern_source_path not found in generated inventory: {modern}")
            merge_topics.append(row)
        elif disposition == "create_canonical":
            if modern_source_path not in (None, ""):
                errors.append(f"{source_path}: create records must not declare modern_source_path")
            create_topics.append(row)

    if len(source_paths) != len(set(source_paths)):
        errors.append("Duplicate source_path values exist in canonical map")
    if len(target_paths) != len(set(target_paths)):
        errors.append("Duplicate target_path values exist in canonical map")

    expected_paths = expected_legacy_paths()
    actual_paths = set(source_paths)
    missing = sorted(expected_paths - actual_paths)
    unexpected = sorted(actual_paths - expected_paths)
    if missing:
        errors.append("Missing foundational routes: " + ", ".join(missing))
    if unexpected:
        errors.append("Unexpected foundational routes: " + ", ".join(unexpected))

    expected_per_collection = mapping.get("expected_per_collection") or {}
    for collection in ALLOWED_COLLECTIONS:
        expected = int(expected_per_collection.get(collection) or 0)
        actual = collection_counts.get(collection, 0)
        if expected != 20:
            errors.append(f"expected_per_collection.{collection} must be 20, found {expected}")
        if actual != expected:
            errors.append(f"{collection}: found {actual} mapped routes, expected {expected}")

    declared = mapping.get("decision_summary") or {}
    for disposition in sorted(ALLOWED_DISPOSITIONS):
        expected = int(declared.get(disposition) or 0)
        actual = disposition_counts.get(disposition, 0)
        if actual != expected:
            errors.append(f"decision_summary.{disposition}={expected}, actual={actual}")

    if disposition_counts.get("merge_into_canonical", 0) != 32:
        errors.append(f"Expected 32 merge routes, found {disposition_counts.get('merge_into_canonical', 0)}")
    if disposition_counts.get("create_canonical", 0) != 28:
        errors.append(f"Expected 28 new canonical topics, found {disposition_counts.get('create_canonical', 0)}")

    summary = {
        "mapped_legacy_route_count": len(rows),
        "legacy_collection_counts": dict(sorted(collection_counts.items())),
        "legacy_disposition_counts": dict(sorted(disposition_counts.items())),
        "generated_modern_library_path_count": len(inventory_paths),
        "total_source_route_evidence_count": len(inventory_paths) + len(rows),
        "merge_modern_source_paths_verified": len(merge_modern_paths),
        "planned_new_canonical_topic_count": len(create_topics),
        "errors": errors,
    }
    return errors, {
        "summary": summary,
        "create_topics": create_topics,
        "merge_topics": merge_topics,
    }


def markdown_report(result: dict[str, Any]) -> str:
    summary = result["summary"]
    lines = [
        "# Library Legacy Canonical Map Validation",
        "",
        f"Status: **{result['status'].upper()}**",
        "",
        "## Coverage",
        "",
        "| Metric | Value |",
        "|---|---:|",
        f"| Generated modern library paths | {summary['generated_modern_library_path_count']} |",
        f"| Mapped foundational legacy routes | {summary['mapped_legacy_route_count']} |",
        f"| Total source-route evidence | {summary['total_source_route_evidence_count']} |",
        f"| Merge into canonical | {summary['legacy_disposition_counts'].get('merge_into_canonical', 0)} |",
        f"| New canonical topics to author | {summary['planned_new_canonical_topic_count']} |",
        "",
        "## New canonical topics to author",
        "",
        "| Legacy route | Topic | Planned destination |",
        "|---|---|---|",
    ]
    for row in result["create_topics"]:
        lines.append(f"| `{row['source_path']}` | {row['source_title']} | `{row['target_path']}` |")
    lines.extend([
        "",
        "## Foundational aliases to merge",
        "",
        "| Legacy route | Topic | Modern source | Planned destination |",
        "|---|---|---|---|",
    ])
    for row in result["merge_topics"]:
        lines.append(f"| `{row['source_path']}` | {row['source_title']} | `{row['modern_source_path']}` | `{row['target_path']}` |")
    if summary["errors"]:
        lines.extend(["", "## Validation errors", ""])
        lines.extend(f"- {error}" for error in summary["errors"])
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate the 60 foundational /library/ routes against the generated modern library inventory.")
    parser.add_argument("inventory", type=Path)
    parser.add_argument("canonical_map", type=Path)
    parser.add_argument("--output", type=Path, default=Path("artifacts/library-legacy-canonical-map-validation.json"))
    parser.add_argument("--report", type=Path, default=Path("artifacts/library-legacy-canonical-map-validation.md"))
    args = parser.parse_args()

    inventory = load(args.inventory)
    mapping = load(args.canonical_map)
    inventory_paths = library_inventory_paths(inventory)
    errors, details = validate_map(mapping, inventory_paths)
    result = {
        "status": "failed" if errors else "passed",
        "map_id": mapping.get("map_id"),
        "schema_version": mapping.get("schema_version"),
        **details,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(markdown_report(result), encoding="utf-8")

    print(json.dumps(result["summary"], ensure_ascii=False, indent=2))
    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
