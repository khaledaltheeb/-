#!/usr/bin/env python3
from __future__ import annotations

import base64
import gzip
from pathlib import Path
import sys

ASSET_DIR = Path(__file__).parent / "app" / "src" / "main" / "assets" / "rafiqa"
CATEGORIES = (
    "confidence",
    "hard_day",
    "personal_checkin",
    "self_care",
    "morning",
    "midday",
    "evening",
    "boundaries",
    "setback",
    "achievement",
    "cycle",
    "low_confidence",
)
PARTS = 2
EXPECTED_PER_CATEGORY = 1000
EXPECTED_TOTAL = len(CATEGORIES) * EXPECTED_PER_CATEGORY
EXPECTED_COLUMNS = 20


def fail(message: str) -> None:
    print(f"RAFIQA BANK ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def decode_category(category: str) -> list[str]:
    chunks: list[str] = []
    for index in range(PARTS):
        path = ASSET_DIR / f"{category}.part{index:02d}.b64"
        if not path.is_file():
            fail(f"missing asset {path.relative_to(Path(__file__).parent)}")
        text = "".join(path.read_text(encoding="ascii").split())
        if not text:
            fail(f"empty asset {path.name}")
        chunks.append(text)

    try:
        packed = base64.b64decode("".join(chunks), validate=True)
        raw = gzip.decompress(packed).decode("utf-8")
    except Exception as exc:
        fail(f"{category}: cannot decode base64/gzip: {exc}")

    lines = raw.splitlines()
    if len(lines) != EXPECTED_PER_CATEGORY:
        fail(f"{category}: expected {EXPECTED_PER_CATEGORY} rows, got {len(lines)}")
    return lines


def main() -> None:
    all_ids: set[str] = set()
    total = 0

    for category in CATEGORIES:
        rows = decode_category(category)
        for row_no, row in enumerate(rows, start=1):
            cols = row.split("\t")
            if len(cols) != EXPECTED_COLUMNS:
                fail(f"{category} row {row_no}: expected {EXPECTED_COLUMNS} columns, got {len(cols)}")
            message_id, category_code, message_ar = cols[0], cols[1], cols[2]
            if not message_id:
                fail(f"{category} row {row_no}: blank message_id")
            if message_id in all_ids:
                fail(f"duplicate message_id: {message_id}")
            if category_code != category:
                fail(f"{category} row {row_no}: category_code={category_code!r}")
            if not message_ar.strip():
                fail(f"{category} row {row_no}: blank Arabic message")
            all_ids.add(message_id)
        total += len(rows)
        print(f"OK {category}: {len(rows)}")

    if total != EXPECTED_TOTAL:
        fail(f"expected {EXPECTED_TOTAL} total rows, got {total}")
    if len(all_ids) != EXPECTED_TOTAL:
        fail(f"expected {EXPECTED_TOTAL} unique IDs, got {len(all_ids)}")

    print(f"RAFIQA BANK VERIFIED: {total} messages, {len(CATEGORIES)} categories, {len(all_ids)} unique IDs")


if __name__ == "__main__":
    main()
