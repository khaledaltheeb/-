#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def load(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise SystemExit(f"{path} must contain a JSON object")
    return payload


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate a library editorial-recovery batch against the foundational canonical map.")
    parser.add_argument("canonical_map", type=Path)
    parser.add_argument("batch", type=Path)
    args = parser.parse_args()

    mapping = load(args.canonical_map)
    batch = load(args.batch)
    errors: list[str] = []

    map_rows = mapping.get("records")
    batch_rows = batch.get("records")
    if not isinstance(map_rows, list) or not isinstance(batch_rows, list):
        raise SystemExit("Both files must contain records arrays")

    if batch.get("canonical_map_id") != mapping.get("map_id"):
        errors.append("canonical_map_id does not match the canonical map")

    expected = int(batch.get("expected_record_count") or 0)
    if expected <= 0 or len(batch_rows) != expected:
        errors.append(f"expected_record_count={expected}, actual={len(batch_rows)}")

    map_by_source = {
        str(row.get("source_path")): row
        for row in map_rows
        if isinstance(row, dict) and row.get("source_path")
    }
    seen_sources: set[str] = set()
    seen_targets: set[str] = set()
    contract = batch.get("release_contract") if isinstance(batch.get("release_contract"), dict) else {}
    min_words = int(contract.get("minimum_editorial_words") or 0)
    min_refs = int(contract.get("minimum_references") or 0)

    if min_words < 1500:
        errors.append("minimum_editorial_words must be at least 1500")
    if min_refs < 5:
        errors.append("minimum_references must be at least 5")
    if contract.get("required_status_before_review") != "draft":
        errors.append("required_status_before_review must be draft")
    if contract.get("required_robots_index_before_review") is not False:
        errors.append("required_robots_index_before_review must be false")
    if contract.get("activate_redirects_before_publication") is not False:
        errors.append("redirects must remain inactive before publication")
    if contract.get("legacy_theme_copied") is not False:
        errors.append("legacy_theme_copied must be false")
    if contract.get("thin_legacy_source_requires_editorial_recovery") is not True:
        errors.append("thin-source editorial recovery must be explicit")

    for index, row in enumerate(batch_rows, start=1):
        if not isinstance(row, dict):
            errors.append(f"record #{index} is not an object")
            continue
        source = str(row.get("source_path") or "").strip()
        target_slug = str(row.get("target_slug") or "").strip()
        target_path = str(row.get("target_path") or "").strip()
        title = str(row.get("title") or "").strip()
        snapshot = row.get("db_snapshot") if isinstance(row.get("db_snapshot"), dict) else {}

        if not source or source in seen_sources:
            errors.append(f"record #{index}: missing or duplicate source_path")
        seen_sources.add(source)
        if not target_slug or target_path != f"/content/{target_slug}":
            errors.append(f"{source or index}: invalid target identity")
        if target_path in seen_targets:
            errors.append(f"{source}: duplicate target_path {target_path}")
        seen_targets.add(target_path)
        if len(title) < 12:
            errors.append(f"{source}: title is missing/too short")

        canonical = map_by_source.get(source)
        if not canonical:
            errors.append(f"{source}: source is missing from foundational canonical map")
            continue
        if canonical.get("disposition") != "create_canonical":
            errors.append(f"{source}: editorial-recovery batch may contain only create_canonical topics")
        if canonical.get("target_slug") != target_slug or canonical.get("target_path") != target_path:
            errors.append(f"{source}: target does not match canonical map")

        if snapshot.get("status") != "draft":
            errors.append(f"{source}: DB snapshot status must be draft")
        if snapshot.get("robots_index") is not False:
            errors.append(f"{source}: DB snapshot robots_index must be false")
        if int(snapshot.get("word_count") or 0) < min_words:
            errors.append(f"{source}: DB snapshot below {min_words} words")
        if int(snapshot.get("reference_count") or 0) < min_refs:
            errors.append(f"{source}: DB snapshot below {min_refs} references")
        if row.get("review_state") != "draft_noindex":
            errors.append(f"{source}: review_state must be draft_noindex")

    result = {
        "status": "failed" if errors else "passed",
        "batch_id": batch.get("batch_id"),
        "record_count": len(batch_rows),
        "canonical_map_id": batch.get("canonical_map_id"),
        "minimum_editorial_words": min_words,
        "minimum_references": min_refs,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
