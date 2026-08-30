#!/usr/bin/env python3
"""Fail CI unless the canonical offline Rafiqa bank is complete and coherent."""

from __future__ import annotations

import base64
import gzip
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASSET_DIR = ROOT / "android" / "app" / "src" / "main" / "assets" / "rafiqa"
CATEGORIES = [
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
]
EXPECTED_PER_CATEGORY = 1000
EXPECTED_TOTAL = len(CATEGORIES) * EXPECTED_PER_CATEGORY
PARTS_PER_CATEGORY = 2


def read_encoded(category: str) -> bytes:
    single = ASSET_DIR / f"{category}.tsv.gz.b64"
    if single.exists():
        return single.read_bytes().strip()

    parts = [ASSET_DIR / f"{category}.part{i:02d}.b64" for i in range(PARTS_PER_CATEGORY)]
    missing = [str(p.relative_to(ROOT)) for p in parts if not p.exists()]
    if missing:
        raise AssertionError(f"{category}: missing asset(s): {', '.join(missing)}")
    return b"".join(p.read_bytes().strip() for p in parts)


def decode_lines(category: str) -> list[str]:
    encoded = read_encoded(category)
    try:
        compressed = base64.b64decode(encoded, validate=True)
    except Exception as exc:
        raise AssertionError(f"{category}: invalid Base64: {exc}") from exc
    try:
        text = gzip.decompress(compressed).decode("utf-8")
    except Exception as exc:
        raise AssertionError(f"{category}: invalid gzip/UTF-8: {exc}") from exc
    return [line for line in text.splitlines() if line.strip()]


def main() -> None:
    global_ids: set[str] = set()
    total = 0

    for category in CATEGORIES:
        lines = decode_lines(category)
        if len(lines) != EXPECTED_PER_CATEGORY:
            raise AssertionError(
                f"{category}: expected {EXPECTED_PER_CATEGORY} messages, found {len(lines)}"
            )

        for index, line in enumerate(lines, start=1):
            fields = line.split("\t")
            if len(fields) < 20:
                raise AssertionError(
                    f"{category}:{index}: expected >=20 TSV fields, found {len(fields)}"
                )
            message_id, category_code, message_ar = fields[0], fields[1], fields[2]
            if not message_id:
                raise AssertionError(f"{category}:{index}: empty message_id")
            if message_id in global_ids:
                raise AssertionError(f"duplicate message_id: {message_id}")
            if category_code != category:
                raise AssertionError(
                    f"{category}:{index}: category_code={category_code!r} does not match asset"
                )
            if not message_ar.strip():
                raise AssertionError(f"{category}:{index}: empty Arabic message")
            global_ids.add(message_id)

        total += len(lines)
        print(f"OK {category}: {len(lines)}")

    if total != EXPECTED_TOTAL:
        raise AssertionError(f"expected {EXPECTED_TOTAL} total messages, found {total}")
    if len(global_ids) != EXPECTED_TOTAL:
        raise AssertionError(
            f"expected {EXPECTED_TOTAL} globally unique IDs, found {len(global_ids)}"
        )

    print(f"Rafiqa bank verified: {len(CATEGORIES)} categories / {total} unique messages")


if __name__ == "__main__":
    main()
