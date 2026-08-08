#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

EXPECTED_TOTAL = 101
EXPECTED_INSTITUTIONAL = 87
JSON_GLOB = "content/v18/care-guides*.json"
TOPIC_GLOB = "scripts/care_guides_topics_v246_*.py"
RAW_RE = re.compile(r'_RAW\s*=\s*"""(.*?)"""', re.S)
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def walk_json(value: Any, source: str, out: list[dict[str, Any]]) -> None:
    if isinstance(value, dict):
        slug = clean(value.get("slug"))
        title = clean(value.get("title"))
        if slug and title and SLUG_RE.fullmatch(slug):
            out.append({
                "slug": slug,
                "title": title,
                "category": clean(value.get("category_label") or value.get("category")),
                "kind": "legacy-json",
                "source": source,
                "reviewed_at": clean(value.get("reviewed_at")),
                "search_intent": value.get("search_intent") if isinstance(value.get("search_intent"), list) else [],
            })
        for child in value.values():
            walk_json(child, source, out)
    elif isinstance(value, list):
        for child in value:
            walk_json(child, source, out)


def parse_json_sources(root: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(root.glob(JSON_GLOB)):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"cannot parse {path}: {exc}") from exc
        walk_json(payload, path.relative_to(root).as_posix(), rows)
    return rows


def parse_topic_sources(root: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for path in sorted(root.glob(TOPIC_GLOB)):
        text = path.read_text(encoding="utf-8", errors="strict")
        match = RAW_RE.search(text)
        if not match:
            raise RuntimeError(f"missing _RAW block in {path}")
        source = path.relative_to(root).as_posix()
        for line_number, raw_line in enumerate(match.group(1).splitlines(), start=1):
            line = raw_line.strip()
            if not line:
                continue
            fields = [clean(item) for item in line.split("\t")]
            if len(fields) < 3:
                raise RuntimeError(f"malformed topic row {source}:{line_number}")
            slug, title, category = fields[:3]
            if not SLUG_RE.fullmatch(slug):
                raise RuntimeError(f"invalid slug {slug!r} in {source}:{line_number}")
            rows.append({
                "slug": slug,
                "title": title,
                "category": category,
                "kind": "institutional-topic",
                "source": source,
                "topic_fields": fields[3:],
            })
    return rows


def merge_rows(rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: dict[str, dict[str, Any]] = {}
    for row in rows:
        slug = row["slug"]
        item = merged.setdefault(slug, {
            "slug": slug,
            "titles": [],
            "categories": [],
            "kinds": [],
            "sources": [],
            "search_intent": [],
            "topic_fields": [],
            "reviewed_at": [],
        })
        title = clean(row.get("title"))
        category = clean(row.get("category"))
        if title and title not in item["titles"]:
            item["titles"].append(title)
        if category and category not in item["categories"]:
            item["categories"].append(category)
        if row.get("kind") and row["kind"] not in item["kinds"]:
            item["kinds"].append(row["kind"])
        if row.get("source") and row["source"] not in item["sources"]:
            item["sources"].append(row["source"])
        for value in row.get("search_intent") or []:
            value = clean(value)
            if value and value not in item["search_intent"]:
                item["search_intent"].append(value)
        if row.get("topic_fields"):
            item["topic_fields"].append(row["topic_fields"])
        reviewed = clean(row.get("reviewed_at"))
        if reviewed and reviewed not in item["reviewed_at"]:
            item["reviewed_at"].append(reviewed)
    return sorted(merged.values(), key=lambda item: item["slug"])


def main() -> int:
    parser = argparse.ArgumentParser(description="Inventory legacy care-guides source records without importing legacy runtime code.")
    parser.add_argument("legacy_root", type=Path)
    parser.add_argument("--output", type=Path, default=Path("artifacts/care-guides-legacy-inventory.json"))
    args = parser.parse_args()

    root = args.legacy_root.resolve()
    if not (root / "content").is_dir() or not (root / "scripts").is_dir():
        raise RuntimeError(f"legacy repository layout not found: {root}")

    json_rows = parse_json_sources(root)
    topic_rows = parse_topic_sources(root)
    merged = merge_rows([*json_rows, *topic_rows])
    kind_counts = Counter(kind for row in merged for kind in row["kinds"])
    topic_unique = {row["slug"] for row in topic_rows}
    json_unique = {row["slug"] for row in json_rows}

    overlap = sorted(topic_unique & json_unique)
    payload = {
        "source_repository": "khaledaltheeb/healthrenewal.org",
        "scope": "/care-guides/",
        "expected_total": EXPECTED_TOTAL,
        "expected_institutional_topics": EXPECTED_INSTITUTIONAL,
        "counts": {
            "raw_json_rows": len(json_rows),
            "raw_topic_rows": len(topic_rows),
            "unique_json_slugs": len(json_unique),
            "unique_topic_slugs": len(topic_unique),
            "unique_total_slugs": len(merged),
            "overlap_between_json_and_topics": len(overlap),
            "by_kind": dict(sorted(kind_counts.items())),
        },
        "overlap_slugs": overlap,
        "records": merged,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(payload["counts"], ensure_ascii=False, indent=2))

    failures: list[str] = []
    if len(topic_unique) != EXPECTED_INSTITUTIONAL:
        failures.append(f"institutional topics: expected {EXPECTED_INSTITUTIONAL}, got {len(topic_unique)}")
    if len(merged) != EXPECTED_TOTAL:
        failures.append(f"total source guides: expected {EXPECTED_TOTAL}, got {len(merged)}")
    if failures:
        print("care-guides legacy inventory gate failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(f"care-guides legacy inventory gate passed: {len(merged)} unique guides")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
