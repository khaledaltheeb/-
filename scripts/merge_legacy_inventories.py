#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

QUICK_INFO_PREFIX = "/quick-info/"
BASE_URL = "https://healthrenewal.org"


def normalized_path(canonical: str, slug: str) -> str:
    path = urlparse(canonical).path if canonical else f"{QUICK_INFO_PREFIX}{slug}/"
    if not path.startswith(QUICK_INFO_PREFIX):
        raise ValueError(f"quick-info canonical outside expected prefix: {path}")
    if path != QUICK_INFO_PREFIX and not path.endswith("/"):
        path += "/"
    return path


def convert_quick_info_page(row: dict[str, Any]) -> dict[str, Any]:
    slug = str(row.get("slug") or "").strip()
    canonical = str(row.get("canonical") or "").strip()
    if not slug:
        raise ValueError("quick-info page missing slug")
    path = normalized_path(canonical, slug)
    return {
        "url": canonical or f"{BASE_URL}{path}",
        "path": path,
        "source_html": row.get("source_path"),
        "kind": "html",
        "html_exists": True,
        "title": row.get("title"),
        "h1": row.get("h1"),
        "meta_description": row.get("description"),
        "canonical": canonical,
        "robots": row.get("robots"),
        "word_count": row.get("word_count"),
        "sha256": row.get("sha256"),
        "structured_sources": [],
        "migration_origin": row.get("origin"),
        "quick_info_reconciled_inventory": True,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("legacy_inventory", type=Path)
    parser.add_argument("quick_info_inventory", type=Path)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("artifacts/legacy-content-inventory-complete.json"),
    )
    args = parser.parse_args()

    legacy = json.loads(args.legacy_inventory.read_text(encoding="utf-8"))
    quick_info = json.loads(args.quick_info_inventory.read_text(encoding="utf-8"))

    if quick_info.get("status") != "passed":
        raise SystemExit("quick-info inventory is not passed")

    quick_pages = quick_info.get("pages")
    if not isinstance(quick_pages, list):
        raise SystemExit("quick-info inventory pages must be a list")

    expected = int(quick_info.get("expected_articles") or 0)
    if expected and len(quick_pages) != expected:
        raise SystemExit(
            f"quick-info count mismatch: {len(quick_pages)} != {expected}"
        )

    base_records = legacy.get("records")
    if not isinstance(base_records, list):
        raise SystemExit("legacy inventory records must be a list")

    dropped = [
        row
        for row in base_records
        if str(row.get("path") or "").startswith(QUICK_INFO_PREFIX)
    ]
    kept = [
        row
        for row in base_records
        if not str(row.get("path") or "").startswith(QUICK_INFO_PREFIX)
    ]

    converted: list[dict[str, Any]] = []
    seen_paths: set[str] = set()
    for row in quick_pages:
        if not isinstance(row, dict):
            raise SystemExit("quick-info page must be an object")
        item = convert_quick_info_page(row)
        path = str(item["path"])
        if path in seen_paths:
            raise SystemExit(f"duplicate reconciled quick-info path: {path}")
        seen_paths.add(path)
        converted.append(item)

    records = kept + converted
    duplicate_paths: list[str] = []
    path_counts: dict[str, int] = {}
    for row in records:
        if row.get("kind") == "resource":
            continue
        path = str(row.get("path") or "")
        if not path:
            continue
        path_counts[path] = path_counts.get(path, 0) + 1
    duplicate_paths = sorted(path for path, count in path_counts.items() if count > 1)
    if duplicate_paths:
        raise SystemExit(
            "complete inventory contains duplicate page paths: "
            + ", ".join(duplicate_paths[:20])
        )

    quick_summary = quick_info.get("summary") if isinstance(quick_info.get("summary"), dict) else {}
    live_only = int(quick_summary.get("live_only_pages") or 0)
    summary = dict(legacy.get("summary") or {})
    summary.update(
        {
            "quick_info_repository_records_replaced": len(dropped),
            "quick_info_reconciled_records": len(converted),
            "quick_info_live_only_records": live_only,
            "complete_inventory_record_count": len(records),
            "complete_inventory_page_count": sum(
                1 for row in records if row.get("kind") != "resource"
            ),
            "inventory_composition": (
                "legacy repository inventory with quick-info replaced by "
                "reconciled repository+live inventory"
            ),
        }
    )

    reconciliation = {
        "quick_info": {
            "removed_repository_records": len(dropped),
            "inserted_reconciled_records": len(converted),
            "net_added_records": len(converted) - len(dropped),
            "live_only_records": live_only,
        }
    }
    payload = {
        "summary": summary,
        "records": records,
        "reconciliation": reconciliation,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "status": "passed",
                "record_count": len(records),
                "page_count": summary["complete_inventory_page_count"],
                "quick_info": reconciliation["quick_info"],
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
