#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

import materialize_quick_info as base
import materialize_quick_info_v2 as v2

EXPECTED_EDITORIAL_OVERLAYS = 35
MINIMUM_RECOVERED_EDITORIAL_WORDS = 1200
V6_QUICK_INFO_WORD_FLOOR = 1500
EDITORIAL_ROOT_PARTS = ("content", "quick-info-editorial")


def body_text_from_blocks(blocks: list[dict]) -> str:
    parts: list[str] = []
    for block in blocks:
        kind = block.get("type")
        if kind in {"paragraph", "heading"}:
            value = base.clean(str(block.get("text") or ""))
            if value:
                parts.append(value)
        elif kind == "callout":
            for value in (block.get("title"), block.get("text")):
                cleaned = base.clean(str(value or ""))
                if cleaned:
                    parts.append(cleaned)
        elif kind == "list":
            parts.extend(base.clean(str(value)) for value in block.get("items", []) if base.clean(str(value)))
        elif kind == "table":
            parts.extend(base.clean(str(value)) for value in block.get("headers", []) if base.clean(str(value)))
            for row in block.get("rows", []):
                parts.extend(base.clean(str(value)) for value in row if base.clean(str(value)))
        elif kind == "faq":
            for item in block.get("items", []):
                q = base.clean(str(item.get("question") or ""))
                a = base.clean(str(item.get("answer") or ""))
                if q:
                    parts.append(q)
                if a:
                    parts.append(a)
    return "\n\n".join(parts)


def editorial_fragment_blocks(fragment: str) -> tuple[list[dict], list[dict]]:
    parser = base.ArticleParser()
    parser.feed(f'<article class="article">{fragment}</article>')
    blocks: list[dict] = []
    skip_next_list = False
    for block in parser.blocks:
        if block.get("type") == "heading" and base.clean(str(block.get("text") or "")) == "مراجع التوسعة":
            skip_next_list = True
            continue
        if skip_next_list and block.get("type") == "list":
            skip_next_list = False
            continue
        skip_next_list = False
        blocks.append(block)
    return blocks, parser.references


def overlay_index(legacy_root: Path) -> dict[str, tuple[str, Path]]:
    root = legacy_root.joinpath(*EDITORIAL_ROOT_PARTS)
    found: dict[str, tuple[str, Path]] = {}
    if not root.is_dir():
        return found
    for path in sorted(root.glob("*/*.html")):
        batch = path.parent.name
        slug = path.stem
        if slug in found:
            raise ValueError(f"duplicate editorial overlay for {slug}: {found[slug][1]} and {path}")
        found[slug] = (batch, path)
    return found


def insert_before_faq(blocks: list[dict], overlay: list[dict]) -> list[dict]:
    faq_index = next((i for i, block in enumerate(blocks) if block.get("type") == "faq"), len(blocks))
    heading_index = faq_index
    if faq_index > 0:
        previous = blocks[faq_index - 1]
        if previous.get("type") == "heading" and "أسئلة" in str(previous.get("text") or ""):
            heading_index = faq_index - 1
    return blocks[:heading_index] + overlay + blocks[heading_index:]


def merge_references(base_refs: list[dict], overlay_refs: list[dict]) -> list[dict]:
    merged: list[dict] = []
    seen: set[str] = set()
    for item in [*base_refs, *overlay_refs]:
        url = str(item.get("url") or "").strip()
        if not url or url in seen:
            continue
        seen.add(url)
        merged.append({"title": base.clean(str(item.get("title") or url)), "url": url})
    return merged[:50]


def make_page_record(legacy_root: Path, overlays: dict[str, tuple[str, Path]]):
    def page_record(html: str, slug: str, origin: str, source_path: str) -> dict:
        record = v2.sanitized_page_record(html, slug, origin, source_path)
        match = overlays.get(slug)
        if not match:
            return record

        batch, path = match
        fragment = path.read_text(encoding="utf-8")
        overlay_blocks, overlay_refs = editorial_fragment_blocks(fragment)

        if not overlay_blocks:
            record["schema_json"] = {
                **record["schema_json"],
                "legacy_editorial_overlay": True,
                "legacy_editorial_overlay_batch": batch,
                "legacy_editorial_overlay_source": str(path.relative_to(legacy_root)),
                "legacy_editorial_overlay_empty": True,
                "legacy_editorial_reference_count": len(overlay_refs),
                "legacy_editorial_reference_target_met": len(overlay_refs) >= 3,
                "legacy_editorial_recovery_ready": False,
                "publication_ready": False,
                "editorial_review_required": True,
            }
            return record

        blocks = insert_before_faq(list(record["body_json"]["blocks"]), overlay_blocks)
        body_text = body_text_from_blocks(blocks)
        word_count = len(re.findall(r"[\w\u0600-\u06FF]+", body_text, flags=re.UNICODE))

        record["body_json"] = {"version": 1, "blocks": blocks}
        record["body_text"] = body_text
        record["references_json"] = merge_references(record.get("references_json", []), overlay_refs)
        record["schema_json"] = {
            **record["schema_json"],
            "legacy_editorial_overlay": True,
            "legacy_editorial_overlay_batch": batch,
            "legacy_editorial_overlay_source": str(path.relative_to(legacy_root)),
            "legacy_editorial_overlay_empty": False,
            "legacy_editorial_overlay_word_count": word_count,
            "legacy_editorial_reference_count": len(overlay_refs),
            "legacy_editorial_reference_target_met": len(overlay_refs) >= 3,
            "legacy_editorial_recovery_ready": word_count >= MINIMUM_RECOVERED_EDITORIAL_WORDS,
            "legacy_editorial_requires_v6_expansion": word_count < V6_QUICK_INFO_WORD_FLOOR,
            "legacy_source_thin_after_sanitization": word_count < V6_QUICK_INFO_WORD_FLOOR,
            "publication_ready": False,
            "editorial_review_required": True,
        }
        return record

    return page_record


def locate_legacy_root(argv: list[str]) -> Path:
    for value in argv[1:]:
        if not value.startswith("-"):
            candidate = Path(value).resolve()
            if candidate.exists():
                return candidate
    raise SystemExit("Unable to resolve legacy repository root from CLI arguments")


def validate_output() -> None:
    path = Path("artifacts/quick-info-materialized.json")
    payload = json.loads(path.read_text(encoding="utf-8"))
    records = payload.get("records", [])
    editorial = [r for r in records if r.get("schema_json", {}).get("legacy_editorial_overlay") is True]

    below_recovery_floor = [
        r["slug"] for r in editorial
        if r.get("schema_json", {}).get("legacy_editorial_overlay_word_count", 0) < MINIMUM_RECOVERED_EDITORIAL_WORDS
    ]
    below_reference_target = [
        r["slug"] for r in editorial
        if r.get("schema_json", {}).get("legacy_editorial_reference_count", 0) < 3
    ]
    empty_overlays = [
        r["slug"] for r in editorial
        if r.get("schema_json", {}).get("legacy_editorial_overlay_empty") is True
    ]
    needs_v6_expansion = [
        r["slug"] for r in editorial
        if r.get("schema_json", {}).get("legacy_editorial_requires_v6_expansion") is True
    ]
    word_counts = [
        int(r.get("schema_json", {}).get("legacy_editorial_overlay_word_count", 0))
        for r in editorial
        if int(r.get("schema_json", {}).get("legacy_editorial_overlay_word_count", 0)) > 0
    ]
    reference_counts = [
        int(r.get("schema_json", {}).get("legacy_editorial_reference_count", 0))
        for r in editorial
    ]

    print({
        "transfer_policy": "mandatory-preservation-no-length-floor",
        "expected_editorial_overlays": EXPECTED_EDITORIAL_OVERLAYS,
        "editorial_overlay_records": len(editorial),
        "overlay_count_gap": EXPECTED_EDITORIAL_OVERLAYS - len(editorial),
        "minimum_editorial_words": min(word_counts, default=0),
        "maximum_editorial_words": max(word_counts, default=0),
        "minimum_editorial_references": min(reference_counts, default=0),
        "below_recovery_floor": len(below_recovery_floor),
        "below_reference_target": len(below_reference_target),
        "empty_overlays": len(empty_overlays),
        "v6_word_floor": V6_QUICK_INFO_WORD_FLOOR,
        "requires_v6_expansion": len(needs_v6_expansion),
        "publication_ready": 0,
        "transfer_blocked_by_length": 0,
    })


def main() -> int:
    legacy_root = locate_legacy_root(sys.argv)
    overlays = overlay_index(legacy_root)
    if len(overlays) != EXPECTED_EDITORIAL_OVERLAYS:
        print({
            "warning": "editorial overlay count differs from historical target; transfer remains mandatory",
            "expected": EXPECTED_EDITORIAL_OVERLAYS,
            "found": len(overlays),
        })

    base.page_record = make_page_record(legacy_root, overlays)
    base.live_slugs = v2.full_live_slugs
    result = base.main()
    if result == 0:
        validate_output()
    return result


if __name__ == "__main__":
    raise SystemExit(main())
