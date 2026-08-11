#!/usr/bin/env python3
"""Validate Rawafid's reviewable editorial-demand manifest.

This gate validates the committed, human-reviewable control-plane files. The full
4,000-intent payload remains a generated artifact whose digest is recorded in
artifact-manifest.v1.json; ordinary PR review uses a deterministic 100-topic
crosswalk split into small CSV parts plus a signed index.
"""
from __future__ import annotations

import argparse
import csv
import hashlib
import json
from pathlib import Path
from urllib.parse import urlparse


def load_json(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8-sig"))
    if not isinstance(data, dict):
        raise ValueError(f"{path}: expected a JSON object")
    return data


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def check(condition: bool, message: str, errors: list[str]) -> None:
    if not condition:
        errors.append(message)


def valid_http_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def load_crosswalk(index_path: Path, errors: list[str]) -> tuple[list[dict[str, str]], list[Path]]:
    index = load_json(index_path)
    parts = index.get("parts") or []
    check(index.get("version") == 1, "Expected crosswalk index version=1", errors)
    check(index.get("row_count") == 100, "Crosswalk index must declare 100 rows", errors)
    check(index.get("part_count") == 5, "Crosswalk index must declare 5 parts", errors)
    check(len(parts) == 5, f"Expected 5 crosswalk parts, found {len(parts)}", errors)

    rows: list[dict[str, str]] = []
    part_paths: list[Path] = []
    expected_columns = [str(value) for value in (index.get("columns") or [])]
    for position, item in enumerate(parts, start=1):
        rel = str(item.get("path") or "")
        part_path = Path(rel)
        part_paths.append(part_path)
        check(part_path.is_file(), f"Missing crosswalk part {position}: {rel}", errors)
        if not part_path.is_file():
            continue
        check(item.get("sha256") == sha256(part_path), f"Crosswalk index SHA mismatch for {rel}", errors)
        check(item.get("bytes") == part_path.stat().st_size, f"Crosswalk index byte mismatch for {rel}", errors)
        with part_path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            part_rows = list(reader)
            check((reader.fieldnames or []) == expected_columns, f"Column contract mismatch in {rel}", errors)
        check(item.get("rows") == len(part_rows) == 20, f"Expected 20 rows in {rel}", errors)
        rows.extend(part_rows)
    return rows, part_paths


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--summary", type=Path, required=True)
    parser.add_argument("--crosswalk-index", type=Path, required=True)
    parser.add_argument("--batch-plan", type=Path, required=True)
    parser.add_argument("--reconciliation", type=Path, required=True)
    parser.add_argument("--artifact-manifest", type=Path, required=True)
    parser.add_argument("--require-reconciled", action="store_true")
    args = parser.parse_args()

    errors: list[str] = []
    for path in (args.summary, args.crosswalk_index, args.batch_plan, args.reconciliation, args.artifact_manifest):
        check(path.is_file(), f"Missing required file: {path}", errors)
    if errors:
        raise SystemExit("\n".join(errors))

    summary_doc = load_json(args.summary)
    summary = summary_doc.get("summary") or {}
    contract = summary_doc.get("contract") or {}
    batch = load_json(args.batch_plan)
    reconciliation = load_json(args.reconciliation)
    artifact_manifest = load_json(args.artifact_manifest)
    rows, part_paths = load_crosswalk(args.crosswalk_index, errors)

    check(summary.get("contract_version") == 1, "Expected contract_version=1", errors)
    check(summary.get("input_rows") == 4000, "Expected 4,000 demand intents", errors)
    check(summary.get("unique_normalized_intents") == 4000, "Expected 4,000 unique normalized intents", errors)
    check(summary.get("duplicate_normalized_intent_groups") == 0, "Duplicate normalized intent groups must be zero", errors)
    check(summary.get("source_topic_count") == 100, "Expected 100 source topics", errors)
    check(summary.get("canonical_target_count") == 88, "Expected 88 canonical targets", errors)
    check(summary.get("candidate_route_count") == 88, "Expected 88 candidate routes", errors)
    check(summary.get("invalid_source_url_count") == 0, "Invalid source URL count must be zero", errors)
    check((summary.get("by_source_file") or {}).get("verified") == 2000, "Verified workbook must contribute 2,000 rows", errors)
    check((summary.get("by_source_file") or {}).get("baseline") == 2000, "Baseline workbook must contribute 2,000 rows", errors)
    check((summary.get("by_kind") or {}).get("عبارة بحث") == 2000, "Expected 2,000 keyword rows", errors)
    check((summary.get("by_kind") or {}).get("سؤال") == 2000, "Expected 2,000 question rows", errors)

    check(contract.get("one_url_per_spreadsheet_row_forbidden") is True, "One URL per spreadsheet row must remain forbidden", errors)
    check(contract.get("publication_requires_human_review") is True, "Human review must remain mandatory", errors)
    check(contract.get("production_write_allowed") is False, "Production writes must remain disabled", errors)
    check(contract.get("supabase_content_dml_allowed") is False, "Supabase content DML must remain disabled", errors)
    check(contract.get("cloudflare_production_publish_allowed") is False, "Cloudflare production publishing must remain disabled", errors)

    check(len(rows) == 100, f"Expected 100 crosswalk rows, found {len(rows)}", errors)
    topic_keys = [(row.get("source_file", "").strip(), row.get("topic", "").strip()) for row in rows]
    check(len(topic_keys) == len(set(topic_keys)), "Duplicate source-file/topic pairs in crosswalk", errors)
    canonical_ids = {row.get("canonical_id", "").strip() for row in rows if row.get("canonical_id", "").strip()}
    check(len(canonical_ids) == 88, f"Expected 88 canonical IDs, found {len(canonical_ids)}", errors)
    routes = {row.get("route_candidate", "").strip() for row in rows if row.get("route_candidate", "").strip()}
    check(len(routes) == 88, f"Expected 88 route candidates, found {len(routes)}", errors)

    invalid_urls: list[str] = []
    for row in rows:
        raw = row.get("source_urls", "")
        for value in [item.strip() for item in raw.split("|") if item.strip()]:
            if not valid_http_url(value):
                invalid_urls.append(value)
    check(not invalid_urls, f"Invalid source URLs in crosswalk: {invalid_urls[:5]}", errors)

    records = batch.get("records") or []
    check(batch.get("batch_id") == "special-needs-inclusive-demand-001", "Unexpected first-batch ID", errors)
    check(len(records) == 10, f"Expected 10 first-batch records, found {len(records)}", errors)
    batch_ids = [str(record.get("canonical_id") or "") for record in records]
    check(len(batch_ids) == len(set(batch_ids)), "Duplicate canonical IDs in first batch", errors)
    check(set(batch_ids).issubset(canonical_ids), "First batch includes IDs absent from crosswalk", errors)
    allowed_states = {"research-and-canonical-audit-required", "canonical-audit-required"}
    check(all(record.get("state") in allowed_states for record in records), "First-batch records must remain gated for research/canonical audit", errors)
    coordination = batch.get("coordination") or {}
    check(coordination.get("no_supabase_content_dml") is True, "Batch must prohibit Supabase content DML", errors)
    check(coordination.get("no_cloudflare_production_publish") is True, "Batch must prohibit Cloudflare production publish", errors)

    current_count = int((reconciliation.get("current_audit") or {}).get("published_url_count") or 0)
    queue_count = int((reconciliation.get("v6_queue") or {}).get("record_count") or 0)
    delta = int(reconciliation.get("delta") or 0)
    check(current_count == 902, f"Expected current inventory 902, found {current_count}", errors)
    check(queue_count == 852, f"Expected V6 queue 852, found {queue_count}", errors)
    check(delta == current_count - queue_count == 50, "Reconciliation delta must equal 50", errors)
    check(reconciliation.get("publication_blocked") is True, "Publication must remain blocked while delta is unresolved", errors)
    if args.require_reconciled:
        check(delta == 0 and reconciliation.get("status") == "reconciled", "Release gate requires zero inventory delta", errors)

    manifest_files = artifact_manifest.get("files") or []
    manifest_by_path = {str(item.get("path")): item for item in manifest_files}
    required_paths = [args.summary, args.crosswalk_index, *part_paths, args.batch_plan, args.reconciliation]
    for path in required_paths:
        rel = str(path).replace("\\", "/")
        item = manifest_by_path.get(rel)
        check(item is not None, f"Artifact manifest lacks {rel}", errors)
        if item:
            check(item.get("sha256") == sha256(path), f"SHA-256 mismatch for {rel}", errors)
            check(item.get("bytes") == path.stat().st_size, f"Byte-size mismatch for {rel}", errors)

    result = {
        "status": "passed" if not errors else "failed",
        "topics": len(rows),
        "canonical_targets": len(canonical_ids),
        "first_batch": len(records),
        "inventory_delta": delta,
        "release_gate": "blocked" if delta else "eligible-for-review",
        "crosswalk_parts": len(part_paths),
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
