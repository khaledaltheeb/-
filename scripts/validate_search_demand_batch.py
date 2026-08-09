#!/usr/bin/env python3
"""Materialize and fully validate a Rawafid search-demand batch against V6.

This script deliberately does not publish or mutate Supabase. It:
1) verifies source-file SHA-256 provenance declared by each page,
2) materializes Markdown into CMS body_json/body_text,
3) merges the parent V6 taxonomy snapshot with the validation-only overlay,
4) runs the canonical Node V6 content release contract over the whole batch,
5) preserves reports/materialized records as deterministic build artifacts.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

from materialize_search_demand_page import materialize


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def verify_source_provenance(meta: dict, root: Path) -> None:
    versions = (meta.get("schema_json") or {}).get("source_versions_reviewed") or []
    if not versions:
        raise ValueError(f"{meta.get('slug')}: source_versions_reviewed is empty")
    for row in versions:
        rel = str(row.get("path") or "")
        expected = str(row.get("sha256") or "").lower()
        source = root / rel
        if not source.is_file():
            raise ValueError(f"{meta.get('slug')}: source version does not exist: {rel}")
        actual = sha256_file(source)
        if actual != expected:
            raise ValueError(
                f"{meta.get('slug')}: SHA-256 mismatch for {rel}: expected {expected}, actual {actual}"
            )


def merged_taxonomy(base_path: Path, overlay_path: Path) -> dict:
    base = json.loads(base_path.read_text(encoding="utf-8"))
    overlay = json.loads(overlay_path.read_text(encoding="utf-8"))
    existing = {str(row.get("slug")): row for row in base.get("categories") or []}
    for row in overlay.get("categories") or []:
        slug = str(row.get("slug") or "")
        if not slug:
            raise ValueError("taxonomy overlay contains a category without slug")
        current = existing.get(slug)
        if current and current.get("sector_slug") != row.get("sector_slug"):
            raise ValueError(f"taxonomy overlay conflicts with base category {slug}")
        existing[slug] = row
    base["categories"] = sorted(existing.values(), key=lambda row: (str(row.get("sector_slug")), str(row.get("slug"))))
    base["search_demand_overlay_version"] = overlay.get("version")
    return base


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("batch_dir", type=Path)
    parser.add_argument("--taxonomy", type=Path, default=Path("data/migration-v6/taxonomy.v6.json"))
    parser.add_argument("--overlay", type=Path, default=Path("data/search-demand-batches/taxonomy-overlay.v1.json"))
    parser.add_argument("--output-dir", type=Path, default=Path("artifacts/search-demand-validation"))
    args = parser.parse_args()

    root = Path.cwd()
    pages_dir = args.batch_dir / "pages"
    if not pages_dir.is_dir():
        raise SystemExit(f"pages directory not found: {pages_dir}")

    args.output_dir.mkdir(parents=True, exist_ok=True)
    records = []
    snapshots = []

    for meta_path in sorted(pages_dir.glob("*.meta.json")):
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        verify_source_provenance(meta, root)
        body_path = root / str(meta.get("body_path") or "")
        if not body_path.is_file():
            raise ValueError(f"{meta.get('slug')}: body file not found: {body_path}")
        record = materialize(meta_path, body_path)
        records.append(record)
        snapshots.append({"slug": record.get("slug"), **(record.get("quality_snapshot") or {})})
        (args.output_dir / f"{record['slug']}.json").write_text(
            json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )

    taxonomy = merged_taxonomy(args.taxonomy, args.overlay)
    taxonomy_path = args.output_dir / "taxonomy.merged.json"
    taxonomy_path.write_text(json.dumps(taxonomy, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    envelope_path = args.output_dir / "batch.envelope.json"
    envelope_path.write_text(json.dumps({"records": records}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    report_path = args.output_dir / "v6-report.json"

    subprocess.run(
        [
            "node",
            "scripts/content-release-contract-v6.mjs",
            str(envelope_path),
            "--taxonomy",
            str(taxonomy_path),
            "--report",
            str(report_path),
        ],
        check=True,
    )

    print(json.dumps({"status": "passed", "records": len(records), "pages": snapshots}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, subprocess.CalledProcessError) as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
