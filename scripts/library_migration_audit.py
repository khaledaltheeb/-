#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

LIBRARY_PREFIX = "/library/"
SPACE_RE = re.compile(r"\s+")
WORD_RE = re.compile(r"[\w\u0600-\u06ff]+", re.UNICODE)
NUMERIC_SLUG_RE = re.compile(r"(?:^|[-_])\d{1,4}$")
ARABIC_DIACRITICS_RE = re.compile(r"[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]")


def normalize_path(value: str) -> str:
    parsed = urlparse(value) if value.startswith(("http://", "https://")) else None
    path = parsed.path if parsed else value
    path = "/" + path.lstrip("/")
    path = re.sub(r"/{2,}", "/", path)
    if path != "/" and not Path(path).suffix and not path.endswith("/"):
        path += "/"
    return path


def is_library_path(path: str) -> bool:
    normalized = normalize_path(path)
    return normalized == LIBRARY_PREFIX or normalized.startswith(LIBRARY_PREFIX)


def collection_for(path: str) -> str:
    parts = normalize_path(path).strip("/").split("/")
    if len(parts) <= 1:
        return "(hub)"
    return parts[1] or "(hub)"


def source_slug(path: str) -> str:
    parts = normalize_path(path).strip("/").split("/")
    return parts[-1] if parts else ""


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKC", value or "")
    value = ARABIC_DIACRITICS_RE.sub("", value)
    value = value.replace("ـ", "")
    value = value.casefold()
    value = re.sub(r"[^\w\u0600-\u06ff]+", " ", value, flags=re.UNICODE)
    return SPACE_RE.sub(" ", value).strip()


def word_count(record: dict[str, Any]) -> int:
    raw = record.get("word_count")
    if isinstance(raw, int):
        return raw
    text = str(record.get("body_text") or "")
    return len(WORD_RE.findall(text))


def body_fingerprint(record: dict[str, Any]) -> str:
    text = normalize_text(str(record.get("body_text") or ""))
    if len(WORD_RE.findall(text)) < 80:
        return ""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def canonical_path(record: dict[str, Any]) -> str:
    value = str(record.get("canonical") or "").strip()
    return normalize_path(value) if value else ""


def is_foundational_numeric_route(path: str) -> bool:
    return bool(NUMERIC_SLUG_RE.search(source_slug(path)))


def dedupe_groups(records: list[dict[str, Any]], key_fn) -> dict[str, list[str]]:
    grouped: dict[str, list[str]] = defaultdict(list)
    for record in records:
        key = key_fn(record)
        if key:
            grouped[key].append(normalize_path(str(record.get("path") or record.get("url") or "/")))
    return {key: sorted(set(paths)) for key, paths in grouped.items() if len(set(paths)) > 1}


def classify_record(record: dict[str, Any], *, min_words: int, exact_duplicate_paths: set[str], title_duplicate_paths: set[str]) -> tuple[str, list[str]]:
    path = normalize_path(str(record.get("path") or record.get("url") or "/"))
    signals: list[str] = []
    kind = str(record.get("kind") or "html")
    if kind == "resource":
        return "resource_review", ["non_html_resource"]
    if kind == "recoverable-structured":
        return "recover_source", ["html_missing_structured_source_available"]
    if record.get("html_exists") is False:
        return "manual_review", ["source_missing"]
    if word_count(record) < min_words and path != LIBRARY_PREFIX:
        signals.append(f"under_{min_words}_words")
    if "noindex" in str(record.get("robots") or "").casefold():
        signals.append("legacy_noindex")
    canonical = canonical_path(record)
    if canonical and canonical != path:
        signals.append("legacy_canonical_points_elsewhere")
    if is_foundational_numeric_route(path):
        signals.append("numeric_or_foundational_slug")
    if path in exact_duplicate_paths:
        signals.append("exact_body_duplicate")
    if path in title_duplicate_paths:
        signals.append("duplicate_title_or_h1")
    if "exact_body_duplicate" in signals:
        return "merge_review", signals
    if "legacy_canonical_points_elsewhere" in signals:
        return "redirect_review", signals
    if "numeric_or_foundational_slug" in signals and "duplicate_title_or_h1" in signals:
        return "merge_review", signals
    if any(signal.startswith("under_") for signal in signals):
        return "expand_before_import", signals
    if "legacy_noindex" in signals:
        return "manual_review", signals
    if path == LIBRARY_PREFIX:
        return "hub_rebuild", signals
    return "preserve_candidate", signals


def markdown_report(plan: dict[str, Any]) -> str:
    summary = plan["summary"]
    lines = ["# Library Migration Audit", "", "Generated from the legacy semantic inventory. This report is read-only and does not publish legacy content.", "", "## Summary", "", "| Metric | Value |", "|---|---:|"]
    for key in ("library_record_count", "library_page_count", "library_resource_count", "missing_or_recoverable_count", "under_quality_floor_count", "noindex_count", "numeric_foundational_route_count", "exact_duplicate_group_count", "title_duplicate_group_count", "canonical_mismatch_count"):
        lines.append(f"| `{key}` | {summary.get(key, 0)} |")
    lines.extend(["", "## Collections", "", "| Collection | Pages |", "|---|---:|"])
    for name, count in summary["collection_counts"].items():
        lines.append(f"| `{name}` | {count} |")
    lines.extend(["", "## Recommended actions", "", "| Action | Count |", "|---|---:|"])
    for action, count in summary["action_counts"].items():
        lines.append(f"| `{action}` | {count} |")
    lines.extend(["", "## Quality contract", "", f"- Minimum content depth flag: **{plan['contract']['quality_min_words']} words** for individual knowledge pages. This is a review threshold, not a license to add filler.", "- Legacy HTML, CSS, JavaScript, layout, header and footer are not migration inputs.", "- Exact duplicates and title collisions are review candidates, not automatic merges.", "- Historical URLs remain migration evidence and must be mapped to a canonical destination before release.", "- No page in this report is automatically published.", "", "## Duplicate clusters", ""])
    exact = plan.get("duplicates", {}).get("exact_body", {})
    if exact:
        lines.append("### Exact body duplicates")
        for digest, paths in exact.items():
            lines.append(f"- `{digest[:12]}`: " + ", ".join(f"`{path}`" for path in paths))
    else:
        lines.append("No exact body duplicates were detected.")
    titles = plan.get("duplicates", {}).get("title_or_h1", {})
    if titles:
        lines.extend(["", "### Title/H1 collisions"])
        for title_key, paths in titles.items():
            lines.append(f"- `{title_key[:100]}`: " + ", ".join(f"`{path}`" for path in paths))
    lines.extend(["", "## Pages requiring attention", ""])
    attention = [item for item in plan["records"] if item["recommended_action"] not in {"preserve_candidate", "resource_review"}]
    if not attention:
        lines.append("No pages require special attention under the current rules.")
    else:
        lines.extend(["| Source path | Collection | Words | Action | Signals |", "|---|---|---:|---|---|"])
        for item in attention:
            signals = ", ".join(item["signals"]) or "—"
            lines.append(f"| `{item['source_path']}` | `{item['collection']}` | {item['word_count']} | `{item['recommended_action']}` | {signals} |")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Build a deterministic, read-only migration audit for legacy /library/ content.")
    parser.add_argument("inventory", type=Path)
    parser.add_argument("--output", type=Path, default=Path("artifacts/library-migration-plan.json"))
    parser.add_argument("--report", type=Path, default=Path("artifacts/library-migration-report.md"))
    parser.add_argument("--quality-min-words", type=int, default=1500)
    args = parser.parse_args()
    if args.quality_min_words < 300:
        raise SystemExit("--quality-min-words must be at least 300")
    payload = json.loads(args.inventory.read_text(encoding="utf-8"))
    source_records = payload.get("records")
    if not isinstance(source_records, list):
        raise SystemExit("Inventory does not contain a records list")
    records: list[dict[str, Any]] = [item for item in source_records if isinstance(item, dict) and is_library_path(str(item.get("path") or item.get("url") or ""))]
    if not records:
        raise SystemExit("No /library/ records were found; refusing to produce a false PASS")
    page_records = [item for item in records if str(item.get("kind") or "html") != "resource"]
    exact_groups = dedupe_groups(page_records, body_fingerprint)
    title_groups = dedupe_groups(page_records, lambda item: normalize_text(str(item.get("h1") or item.get("title") or "")))
    exact_paths = {path for paths in exact_groups.values() for path in paths}
    title_paths = {path for paths in title_groups.values() for path in paths}
    output_records: list[dict[str, Any]] = []
    collections: Counter[str] = Counter()
    actions: Counter[str] = Counter()
    for record in sorted(records, key=lambda item: normalize_path(str(item.get("path") or item.get("url") or "/"))):
        path = normalize_path(str(record.get("path") or record.get("url") or "/"))
        collection = collection_for(path)
        collections[collection] += 1
        action, signals = classify_record(record, min_words=args.quality_min_words, exact_duplicate_paths=exact_paths, title_duplicate_paths=title_paths)
        actions[action] += 1
        output_records.append({"source_url": record.get("url"), "source_path": path, "source_slug": source_slug(path), "collection": collection, "kind": record.get("kind") or "html", "source_file": record.get("source_html") or record.get("source_file"), "title": record.get("title") or "", "h1": record.get("h1") or "", "canonical": canonical_path(record), "robots": record.get("robots") or "", "word_count": word_count(record), "structured_sources": record.get("structured_sources") or [], "recommended_action": action, "signals": signals})
    summary = {
        "library_record_count": len(records),
        "library_page_count": len(page_records),
        "library_resource_count": sum(1 for item in records if str(item.get("kind")) == "resource"),
        "missing_or_recoverable_count": sum(1 for item in output_records if item["kind"] == "recoverable-structured" or "source_missing" in item["signals"]),
        "under_quality_floor_count": sum(1 for item in output_records if any(signal.startswith("under_") for signal in item["signals"])),
        "noindex_count": sum(1 for item in output_records if "legacy_noindex" in item["signals"]),
        "numeric_foundational_route_count": sum(1 for item in output_records if "numeric_or_foundational_slug" in item["signals"]),
        "exact_duplicate_group_count": len(exact_groups),
        "title_duplicate_group_count": len(title_groups),
        "canonical_mismatch_count": sum(1 for item in output_records if "legacy_canonical_points_elsewhere" in item["signals"]),
        "collection_counts": dict(sorted(collections.items())),
        "action_counts": dict(sorted(actions.items())),
    }
    plan = {"scope": LIBRARY_PREFIX, "summary": summary, "duplicates": {"exact_body": exact_groups, "title_or_h1": title_groups}, "contract": {"source_read_only": True, "auto_publish": False, "legacy_theme_copied": False, "quality_min_words": args.quality_min_words, "dedupe_is_review_only": True, "canonical_mapping_required_before_release": True}, "records": output_records}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(markdown_report(plan), encoding="utf-8")
    print(json.dumps({"scope": plan["scope"], "summary": summary, "output": str(args.output), "report": str(args.report)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
