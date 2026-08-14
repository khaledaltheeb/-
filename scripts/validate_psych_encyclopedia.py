#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
BATCH_ROOT = ROOT / "data" / "encyclopedia" / "batches"
ARABIC_WORD = re.compile(r"[\u0600-\u06FF]+")
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
HTTPS = re.compile(r"^https://", re.I)

REQUIRED_SECTION_GROUPS = {
    "definition": ("ما هو", "ما هي", "المقصود", "تعريف"),
    "symptoms": ("الأعراض", "العلامات"),
    "causes": ("الأسباب", "عوامل الخطورة", "لماذا يحدث"),
    "assessment": ("التقييم", "التشخيص", "كيف يتم تشخيص"),
    "treatment": ("العلاج", "الدعم", "ما الذي يساعد", "خيارات العلاج"),
    "faq": ("أسئلة شائعة", "الأسئلة الشائعة"),
}


def text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def block_text(block: Any) -> str:
    if not isinstance(block, dict):
        return ""
    if block.get("type") == "faq":
        items = block.get("items") if isinstance(block.get("items"), list) else []
        return " ".join(
            f"{text(item.get('question'))} {text(item.get('answer'))}"
            for item in items if isinstance(item, dict)
        )
    parts = [text(block.get("text")), text(block.get("title")), text(block.get("description"))]
    raw_items = block.get("items") if isinstance(block.get("items"), list) else []
    parts.extend(text(item) for item in raw_items if isinstance(item, str))
    return " ".join(part for part in parts if part)


def validate_record(record: dict[str, Any], source: Path, index: int) -> list[str]:
    prefix = f"{source.relative_to(ROOT)} records[{index}]"
    errors: list[str] = []
    slug = text(record.get("slug"))
    title = text(record.get("title"))
    canonical = text(record.get("canonical_url"))
    seo_title = text(record.get("seo_title"))
    seo_description = text(record.get("seo_description"))
    primary_keyword = text(record.get("primary_keyword"))

    if record.get("content_type") != "condition":
        errors.append(f"{prefix}: content_type must be condition")
    if not SLUG.fullmatch(slug):
        errors.append(f"{prefix}: invalid slug {slug!r}")
    if canonical != f"/encyclopedia/{slug}/":
        errors.append(f"{prefix}: canonical_url must be /encyclopedia/{slug}/")
    if len(title) < 4:
        errors.append(f"{prefix}: title is too short")
    if not primary_keyword:
        errors.append(f"{prefix}: primary_keyword is required")
    if not (20 <= len(seo_title) <= 65):
        errors.append(f"{prefix}: seo_title must be 20..65 characters")
    if not (110 <= len(seo_description) <= 180):
        errors.append(f"{prefix}: seo_description must be 110..180 characters")
    if record.get("search_intent") != "informational":
        errors.append(f"{prefix}: condition pages must use informational intent")
    if record.get("robots_index") is not False and record.get("status") != "published":
        errors.append(f"{prefix}: non-published drafts must not be indexable")

    body = record.get("body_json") if isinstance(record.get("body_json"), dict) else {}
    blocks = body.get("blocks") if isinstance(body.get("blocks"), list) else []
    headings = [
        text(block.get("text"))
        for block in blocks
        if isinstance(block, dict) and block.get("type") == "heading" and block.get("level") == 2
    ]
    normalized_headings = " | ".join(headings)
    for group, variants in REQUIRED_SECTION_GROUPS.items():
        if not any(variant in normalized_headings for variant in variants):
            errors.append(f"{prefix}: missing required H2 section group {group}")

    faq_blocks = [block for block in blocks if isinstance(block, dict) and block.get("type") == "faq"]
    faq_items = []
    for block in faq_blocks:
        if isinstance(block.get("items"), list):
            faq_items.extend(item for item in block["items"] if isinstance(item, dict))
    if len(faq_items) < 6:
        errors.append(f"{prefix}: at least 6 visible FAQ items are required")
    for faq_index, item in enumerate(faq_items):
        if len(text(item.get("question"))) < 8 or len(text(item.get("answer"))) < 35:
            errors.append(f"{prefix}: FAQ item {faq_index} is too thin")

    full_text = " ".join(block_text(block) for block in blocks)
    arabic_words = ARABIC_WORD.findall(full_text)
    if len(arabic_words) < 700:
        errors.append(f"{prefix}: body has only {len(arabic_words)} Arabic words; minimum is 700")

    refs = record.get("references_json") if isinstance(record.get("references_json"), list) else []
    if len(refs) < 4:
        errors.append(f"{prefix}: at least 4 references are required")
    official_or_guideline = 0
    for ref_index, ref in enumerate(refs):
        if not isinstance(ref, dict):
            errors.append(f"{prefix}: reference {ref_index} must be an object")
            continue
        if not HTTPS.match(text(ref.get("url"))):
            errors.append(f"{prefix}: reference {ref_index} must have an https URL")
        if len(text(ref.get("title"))) < 4 or len(text(ref.get("publisher"))) < 2:
            errors.append(f"{prefix}: reference {ref_index} needs title and publisher")
        source_type = text(ref.get("source_type")).lower()
        authority = text(ref.get("authority_tier")).lower()
        if source_type in {"official-definition", "official-guidance", "guideline", "clinical-guideline"} or authority == "primary":
            official_or_guideline += 1
    if official_or_guideline < 2:
        errors.append(f"{prefix}: at least 2 official/guideline references are required")

    disclaimer = text(record.get("medical_disclaimer"))
    if len(disclaimer) < 35:
        errors.append(f"{prefix}: medical_disclaimer is required")

    schema = record.get("schema_json") if isinstance(record.get("schema_json"), dict) else {}
    if schema.get("encyclopedia_entry") is not True:
        errors.append(f"{prefix}: schema_json.encyclopedia_entry must be true")
    questions = schema.get("search_intent_questions") if isinstance(schema.get("search_intent_questions"), list) else []
    if len(questions) < 6:
        errors.append(f"{prefix}: at least 6 search intent questions are required")
    return errors


def main() -> int:
    files = sorted(BATCH_ROOT.glob("*.json")) if BATCH_ROOT.exists() else []
    if not files:
        print("No encyclopedia batch files found", file=sys.stderr)
        return 1
    errors: list[str] = []
    records_count = 0
    seen_slugs: set[str] = set()
    for source in files:
        try:
            payload = json.loads(source.read_text(encoding="utf-8"))
        except Exception as exc:
            errors.append(f"{source.relative_to(ROOT)}: invalid JSON: {exc}")
            continue
        records = payload.get("records") if isinstance(payload, dict) else None
        if not isinstance(records, list):
            errors.append(f"{source.relative_to(ROOT)}: records must be an array")
            continue
        for index, raw in enumerate(records):
            if not isinstance(raw, dict):
                errors.append(f"{source.relative_to(ROOT)} records[{index}]: must be an object")
                continue
            slug = text(raw.get("slug"))
            if slug in seen_slugs:
                errors.append(f"{source.relative_to(ROOT)} records[{index}]: duplicate slug {slug}")
            seen_slugs.add(slug)
            errors.extend(validate_record(raw, source, index))
            records_count += 1
    if errors:
        print("Psychological encyclopedia validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(f"Psychological encyclopedia validation passed: {records_count} records across {len(files)} batches")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
