#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("manifest", type=Path)
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    records = manifest.get("records")
    if not isinstance(records, list) or not records:
        raise SystemExit("preservation manifest requires records")

    errors: list[str] = []
    seen_sources: set[str] = set()
    seen_canonicals: set[str] = set()
    checked: list[dict[str, object]] = []

    for index, row in enumerate(records, start=1):
        source = str(row.get("source_path") or "").strip()
        canonical = str(row.get("legacy_canonical") or "").strip()
        preserved = Path(str(row.get("preserved_path") or ""))
        expected_sha = str(row.get("source_blob_sha1") or "").strip()
        prefix = f"row {index} ({source or canonical or 'unknown'})"

        if not source or source in seen_sources:
            errors.append(f"{prefix}: source_path missing or duplicated")
        seen_sources.add(source)
        if not canonical.startswith("/") or canonical in seen_canonicals:
            errors.append(f"{prefix}: canonical missing/invalid/duplicated")
        seen_canonicals.add(canonical)
        if row.get("length_floor", "missing") is not None:
            errors.append(f"{prefix}: length_floor must be null for mandatory preservation")
        if row.get("preservation_status") != "source_snapshot_preserved":
            errors.append(f"{prefix}: preservation_status must confirm source snapshot")
        if not preserved.is_file():
            errors.append(f"{prefix}: preserved artifact missing: {preserved}")
            continue

        data = preserved.read_bytes()
        actual_sha = git_blob_sha1(data)
        if actual_sha != expected_sha:
            errors.append(f"{prefix}: verbatim blob mismatch expected={expected_sha} actual={actual_sha}")

        text = data.decode("utf-8", errors="strict")
        if not text.strip():
            errors.append(f"{prefix}: preserved artifact is empty")
        if canonical.strip("/") not in text and str(row.get("legacy_page_path") or "").strip("/") not in text:
            # JSON editorial sources do not always carry their rendered canonical; key/title are the identity fallback.
            title = str(row.get("title") or "").strip()
            if not title or title not in text:
                errors.append(f"{prefix}: preserved content does not expose canonical/page identity or title")

        checked.append({
            "source_path": source,
            "legacy_canonical": canonical,
            "preserved_path": str(preserved),
            "bytes": len(data),
            "git_blob_sha1": actual_sha,
            "verbatim": actual_sha == expected_sha,
        })

    result = {
        "status": "failed" if errors else "passed",
        "policy": "mandatory-repository-preservation-no-length-floor",
        "record_count": len(records),
        "checked_count": len(checked),
        "error_count": len(errors),
        "errors": errors,
        "records": checked,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
