#!/usr/bin/env python3
"""Materialize Rawafid search-demand editorial sources into CMS-ready JSON.

Input is a metadata JSON file plus a Markdown body file. The body deliberately
contains no H1; the page title is the single H1 rendered by the application.
The parser keeps H2/H3 hierarchy, lists and related-resource links, and turns
the final Arabic FAQ section into the native structured FAQ block.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

ARABIC_WORD_RE = re.compile(r"[\u0600-\u06ff]+")
RELATED_HEADING = "اقرأ أيضًا داخل منصة روافد"
FAQ_HEADING = "الأسئلة الشائعة"
RESOURCE_RE = re.compile(r"^- \[([^\]]+)\]\(([^)]+)\):\s*(.+)$")


def arabic_words(value: str) -> int:
    return len(ARABIC_WORD_RE.findall(value or ""))


def normalized(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def block_text(block: dict[str, Any]) -> str:
    kind = block.get("type")
    if kind in {"paragraph", "heading", "quote", "callout"}:
        return str(block.get("text") or "")
    if kind == "list":
        return " ".join(str(item) for item in block.get("items") or [])
    if kind == "resource":
        return f"{block.get('label') or ''} {block.get('description') or ''}".strip()
    if kind == "faq":
        return " ".join(
            f"{item.get('question') or ''} {item.get('answer') or ''}"
            for item in block.get("items") or []
        )
    return ""


def parse_markdown(markdown: str) -> list[dict[str, Any]]:
    lines = markdown.replace("\r\n", "\n").split("\n")
    blocks: list[dict[str, Any]] = []
    paragraph: list[str] = []
    list_items: list[str] = []
    faq_items: list[dict[str, str]] = []
    faq_question: str | None = None
    faq_answer: list[str] = []
    in_faq = False
    in_related = False

    def flush_paragraph() -> None:
        nonlocal paragraph
        text = normalized(" ".join(paragraph))
        if text:
            blocks.append({"type": "paragraph", "text": text})
        paragraph = []

    def flush_list() -> None:
        nonlocal list_items
        if list_items:
            blocks.append({"type": "list", "ordered": False, "items": list_items})
        list_items = []

    def flush_faq_item() -> None:
        nonlocal faq_question, faq_answer
        answer = normalized(" ".join(faq_answer))
        if faq_question and answer:
            faq_items.append({"question": faq_question, "answer": answer})
        faq_question = None
        faq_answer = []

    for raw in lines:
        line = raw.strip()

        if line.startswith("# "):
            raise ValueError("Body Markdown must not contain H1; title owns the only H1")

        if line.startswith("## "):
            flush_paragraph()
            flush_list()
            if in_faq:
                flush_faq_item()
                if faq_items:
                    blocks.append({"type": "faq", "items": faq_items})
                faq_items = []
                in_faq = False
            heading = normalized(line[3:])
            in_related = heading == RELATED_HEADING
            if heading == FAQ_HEADING:
                in_faq = True
                in_related = False
                continue
            blocks.append({"type": "heading", "level": 2, "text": heading})
            continue

        if line.startswith("### "):
            flush_paragraph()
            flush_list()
            heading = normalized(line[4:])
            if in_faq:
                flush_faq_item()
                faq_question = heading
            else:
                blocks.append({"type": "heading", "level": 3, "text": heading})
            continue

        if not line:
            if in_faq:
                continue
            flush_paragraph()
            flush_list()
            continue

        if in_faq:
            faq_answer.append(line)
            continue

        if line.startswith("- "):
            flush_paragraph()
            if in_related:
                match = RESOURCE_RE.match(line)
                if not match:
                    raise ValueError(f"Invalid related-resource line: {line}")
                label, url, description = match.groups()
                blocks.append(
                    {
                        "type": "resource",
                        "label": normalized(label),
                        "url": normalized(url),
                        "description": normalized(description),
                    }
                )
            else:
                list_items.append(normalized(line[2:]))
            continue

        flush_list()
        paragraph.append(line)

    flush_paragraph()
    flush_list()
    if in_faq:
        flush_faq_item()
        if faq_items:
            blocks.append({"type": "faq", "items": faq_items})

    return blocks


def quality_snapshot(record: dict[str, Any]) -> dict[str, Any]:
    blocks = record["body_json"]["blocks"]
    visible = "\n".join(block_text(block) for block in blocks if block_text(block))
    h2 = sum(1 for b in blocks if b.get("type") == "heading" and b.get("level") == 2)
    h3 = sum(1 for b in blocks if b.get("type") == "heading" and b.get("level") == 3)
    faq_items = [item for b in blocks if b.get("type") == "faq" for item in b.get("items") or []]
    faq_answer_min = min((arabic_words(str(item.get("answer") or "")) for item in faq_items), default=0)
    schema = record.get("schema_json") or {}
    return {
        "arabic_visible_words": arabic_words(visible),
        "h1_inside_body": sum(1 for b in blocks if b.get("type") == "heading" and b.get("level") == 1),
        "h2_sections": h2,
        "h3_subsections": h3,
        "faq_items": len(faq_items),
        "minimum_faq_answer_arabic_words": faq_answer_min,
        "explicit_search_questions": len(schema.get("search_intent_questions") or []),
        "references": len(record.get("references_json") or []),
        "mapped_claims": len(schema.get("claim_source_map") or []),
        "seo_title_characters": len(str(record.get("seo_title") or "")),
        "seo_description_characters": len(str(record.get("seo_description") or "")),
    }


def assert_key_v6_checks(record: dict[str, Any], snapshot: dict[str, Any]) -> None:
    errors: list[str] = []
    if snapshot["h1_inside_body"]:
        errors.append("body contains H1")
    if snapshot["arabic_visible_words"] < 2500:
        errors.append("fewer than 2500 visible Arabic words")
    if snapshot["h2_sections"] < 8:
        errors.append("fewer than 8 H2 sections")
    if snapshot["h3_subsections"] < 4:
        errors.append("fewer than 4 H3 subsections")
    if snapshot["faq_items"] < 6:
        errors.append("fewer than 6 FAQ items")
    if snapshot["minimum_faq_answer_arabic_words"] < 30:
        errors.append("an FAQ answer has fewer than 30 Arabic words")
    if snapshot["explicit_search_questions"] < 8:
        errors.append("fewer than 8 explicit search questions")
    if snapshot["references"] < 5:
        errors.append("fewer than 5 references")
    if snapshot["mapped_claims"] < 5:
        errors.append("fewer than 5 mapped claims")
    if not (150 <= snapshot["seo_description_characters"] <= 160):
        errors.append("SEO description must contain 150-160 characters")
    if snapshot["seo_title_characters"] > 47 or snapshot["seo_title_characters"] == 0:
        errors.append("SEO title must be present and no longer than 47 characters")
    if not record.get("primary_keyword"):
        errors.append("primary keyword missing")
    if len(record.get("secondary_keywords") or []) < 5:
        errors.append("fewer than 5 secondary keywords")
    if len(record.get("semantic_terms") or []) < 8:
        errors.append("fewer than 8 semantic terms")
    if errors:
        raise ValueError("; ".join(errors))


def materialize(meta_path: Path, body_path: Path) -> dict[str, Any]:
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    markdown = body_path.read_text(encoding="utf-8")
    blocks = parse_markdown(markdown)
    body_text = "\n".join(block_text(block) for block in blocks if block_text(block))
    record = {key: value for key, value in meta.items() if key not in {"body_path", "quality_snapshot"}}
    record["body_json"] = {"version": 3, "blocks": blocks}
    record["body_text"] = body_text
    snapshot = quality_snapshot(record)
    assert_key_v6_checks(record, snapshot)
    record["quality_snapshot"] = {**snapshot, "validation_state": "materialized-passed-key-v6-checks"}
    return record


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("meta", type=Path)
    parser.add_argument("body", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    record = materialize(args.meta, args.body)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(record, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(record["quality_snapshot"], ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
