#!/usr/bin/env python3
"""Materialize and fully validate a Rawafid search-demand batch against V6.

This script deliberately does not publish or mutate Supabase. It:
1) verifies source-file SHA-256 provenance declared by each page; metadata may use
   ``auto`` (or a 64-zero bootstrap sentinel) so the validator deterministically
   binds the V6 record to the exact source bytes checked out for the commit,
2) treats the research map as the canonical reference inventory and merges any
   missing research references into the materialized V6 record by stable id,
3) materializes Markdown into CMS body_json/body_text,
4) merges the parent V6 taxonomy snapshot with the validation-only overlay,
5) runs the canonical Node V6 content release contract over the whole batch,
6) preserves reports/materialized records as deterministic build artifacts.
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


def resolve_source_provenance(meta: dict, root: Path) -> list[dict]:
    versions = (meta.get("schema_json") or {}).get("source_versions_reviewed") or []
    if not versions:
        raise ValueError(f"{meta.get('slug')}: source_versions_reviewed is empty")
    resolved: list[dict] = []
    for raw in versions:
        row = dict(raw)
        rel = str(row.get("path") or "")
        expected = str(row.get("sha256") or "").lower()
        source = root / rel
        if not source.is_file():
            raise ValueError(f"{meta.get('slug')}: source version does not exist: {rel}")
        actual = sha256_file(source)
        if expected in {"auto", "sha256:auto", "0" * 64}:
            row["sha256"] = actual
        elif actual != expected:
            raise ValueError(
                f"{meta.get('slug')}: SHA-256 mismatch for {rel}: expected {expected}, actual {actual}"
            )
        resolved.append(row)
    return resolved


def research_references(meta: dict, root: Path) -> list[dict]:
    source_path = root / str(meta.get("source_path") or "")
    if not source_path.is_file():
        raise ValueError(f"{meta.get('slug')}: research source map not found: {source_path}")
    payload = json.loads(source_path.read_text(encoding="utf-8"))
    rows = payload.get("sources") or []
    if not isinstance(rows, list):
        raise ValueError(f"{meta.get('slug')}: research sources must be an array")
    references: list[dict] = []
    for raw in rows:
        if not isinstance(raw, dict):
            continue
        row = {key: raw[key] for key in (
            "id", "title", "publisher", "year", "source_type", "authority_tier", "url", "isbn"
        ) if raw.get(key) not in (None, "")}
        if row.get("id"):
            references.append(row)
    return references


def merge_reference_inventory(record: dict, research_refs: list[dict]) -> None:
    merged: dict[str, dict] = {}
    for raw in list(record.get("references_json") or []) + research_refs:
        if not isinstance(raw, dict):
            continue
        key = str(raw.get("id") or "").strip()
        if not key:
            continue
        if key in merged:
            merged[key] = {**raw, **merged[key]}
        else:
            merged[key] = dict(raw)
    record["references_json"] = list(merged.values())
    quality = dict(record.get("quality_snapshot") or {})
    quality["references"] = len(record["references_json"])
    record["quality_snapshot"] = quality


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
        resolved_versions = resolve_source_provenance(meta, root)
        body_path = root / str(meta.get("body_path") or "")
        if not body_path.is_file():
            raise ValueError(f"{meta.get('slug')}: body file not found: {body_path}")
        record = materialize(meta_path, body_path)
        schema = dict(record.get("schema_json") or {})
        schema["source_versions_reviewed"] = resolved_versions
        record["schema_json"] = schema
        merge_reference_inventory(record, research_references(meta, root))
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
