#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

SENTENCE_SPLIT_RE = re.compile(r"[\n.!؟?؛]+")
SPACE_RE = re.compile(r"\s+")
OLD_REPO_TOKENS = ("khaledaltheeb/healthrenewal.org", "raw.githubusercontent.com/khaledaltheeb/healthrenewal.org")


def normalize(value: str) -> str:
    return SPACE_RE.sub(" ", value).strip()


def sentences(text: str) -> set[str]:
    return {
        normalize(part)
        for part in SENTENCE_SPLIT_RE.split(text)
        if len(normalize(part)) >= 60
    }


def faq_count(body_json: Any) -> int:
    if not isinstance(body_json, dict):
        return 0
    blocks = body_json.get("blocks")
    if not isinstance(blocks, list):
        return 0
    count = 0
    for block in blocks:
        if not isinstance(block, dict) or block.get("type") != "faq":
            continue
        items = block.get("items")
        if isinstance(items, list):
            count += sum(
                1 for item in items
                if isinstance(item, dict)
                and str(item.get("question") or "").strip()
                and str(item.get("answer") or "").strip()
            )
    return count


def audit(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    records = payload.get("records")
    if not isinstance(records, list) or not records:
        raise SystemExit("Family Guide payload must contain records")

    per_page: dict[str, set[str]] = {}
    errors: list[str] = []
    canonicals: list[str] = []
    images: list[str] = []
    words: list[int] = []
    refs: list[int] = []
    faqs: list[int] = []

    for row in records:
        if not isinstance(row, dict):
            errors.append("non-object record found")
            continue
        slug = str(row.get("slug") or "unknown")
        body_text = str(row.get("body_text") or "")
        word_count = len(body_text.split())
        reference_count = len(row.get("references_json") or []) if isinstance(row.get("references_json"), list) else 0
        faq_items = faq_count(row.get("body_json"))
        canonical = str(row.get("canonical_url") or "").strip()
        image = str(row.get("featured_image_url") or "").strip()

        words.append(word_count)
        refs.append(reference_count)
        faqs.append(faq_items)
        canonicals.append(canonical)
        images.append(image)
        per_page[slug] = sentences(body_text)

        if word_count < 1500:
            errors.append(f"{slug}: final content below 1500 words ({word_count})")
        if reference_count < 4:
            errors.append(f"{slug}: fewer than 4 references ({reference_count})")
        if faq_items < 10:
            errors.append(f"{slug}: fewer than 10 FAQ items ({faq_items})")
        if not canonical.startswith("/family-guide/") and canonical != "/family-guide/":
            errors.append(f"{slug}: invalid Family Guide canonical {canonical}")
        if not image.startswith("/family-guide/images/"):
            errors.append(f"{slug}: invalid Family Guide image {image}")

        runtime_material = json.dumps({
            "body_text": row.get("body_text"),
            "body_json": row.get("body_json"),
            "references_json": row.get("references_json"),
            "canonical_url": row.get("canonical_url"),
            "featured_image_url": row.get("featured_image_url"),
        }, ensure_ascii=False).lower()
        for token in OLD_REPO_TOKENS:
            if token.lower() in runtime_material:
                errors.append(f"{slug}: runtime dependency on old repository token {token}")

    if len(set(canonicals)) != len(canonicals):
        errors.append("duplicate canonical URLs found")
    if len(set(images)) != len(images):
        errors.append("duplicate featured image URLs found")

    page_frequency: Counter[str] = Counter()
    for page_sentences in per_page.values():
        page_frequency.update(page_sentences)

    duplicate_ratios: dict[str, float] = {}
    repeated_examples: list[dict[str, Any]] = []
    for slug, page_sentences in per_page.items():
        if not page_sentences:
            duplicate_ratios[slug] = 0.0
            continue
        duplicated = {sentence for sentence in page_sentences if page_frequency[sentence] >= 3}
        ratio = (len(duplicated) / len(page_sentences)) * 100
        duplicate_ratios[slug] = ratio
        if ratio > 15.0:
            errors.append(f"{slug}: repeated-long-sentence ratio {ratio:.2f}% exceeds 15%")

    for sentence, count in page_frequency.most_common():
        if count < 3:
            break
        repeated_examples.append({"pages": count, "sentence": sentence})
        if len(repeated_examples) >= 20:
            break

    result = {
        "status": "failed" if errors else "passed",
        "records": len(records),
        "min_words": min(words) if words else 0,
        "max_words": max(words) if words else 0,
        "min_references": min(refs) if refs else 0,
        "min_faq": min(faqs) if faqs else 0,
        "unique_canonicals": len(set(canonicals)),
        "unique_images": len(set(images)),
        "max_duplicate_long_sentence_pct": round(max(duplicate_ratios.values(), default=0.0), 2),
        "pages_over_15pct": sum(1 for value in duplicate_ratios.values() if value > 15.0),
        "repeated_sentence_examples": repeated_examples,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("payload", type=Path)
    args = parser.parse_args()
    audit(args.payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
