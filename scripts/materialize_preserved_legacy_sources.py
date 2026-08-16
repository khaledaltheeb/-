#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from validate_legacy_transfer_payload import norm_records


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value or "")).strip()


class LegacyHtmlParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.in_main = False
        self.main_depth = 0
        self.in_title = False
        self.title_parts: list[str] = []
        self.description = ""
        self.canonical = ""
        self.h1 = ""
        self.blocks: list[dict[str, Any]] = []
        self.capture_tag: str | None = None
        self.capture_parts: list[str] = []
        self.list_tag: str | None = None
        self.list_items: list[str] = []
        self.in_li = False
        self.li_parts: list[str] = []
        self.anchor_href = ""
        self.anchor_parts: list[str] = []
        self.in_anchor = False
        self.references: list[dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = {k.lower(): (v or "") for k, v in attrs_list}
        tag = tag.lower()
        if tag == "title":
            self.in_title = True
        elif tag == "meta" and attrs.get("name", "").lower() == "description":
            self.description = clean(attrs.get("content", ""))
        elif tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
            self.canonical = clean(attrs.get("href", ""))
        if tag == "main" and not self.in_main:
            self.in_main = True
            self.main_depth = 1
            return
        if not self.in_main:
            return
        if tag in {"main", "section", "article", "div", "aside"}:
            self.main_depth += 1
        if tag in {"h1", "h2", "h3", "h4", "p"} and not self.list_tag:
            self.capture_tag = tag
            self.capture_parts = []
        if tag in {"ul", "ol"} and not self.list_tag:
            self.list_tag = tag
            self.list_items = []
        if tag == "li" and self.list_tag:
            self.in_li = True
            self.li_parts = []
        if tag == "a":
            self.in_anchor = True
            self.anchor_href = clean(attrs.get("href", ""))
            self.anchor_parts = []

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if not self.in_main:
            return
        if self.capture_tag:
            self.capture_parts.append(data)
        if self.in_li:
            self.li_parts.append(data)
        if self.in_anchor:
            self.anchor_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
        if not self.in_main:
            return
        if tag == "a" and self.in_anchor:
            href = self.anchor_href
            label = clean(" ".join(self.anchor_parts))
            if href.startswith("https://") and label and "healthrenewal.org" not in urlparse(href).netloc.lower():
                item = {"title": label, "url": href}
                if item not in self.references:
                    self.references.append(item)
            self.in_anchor = False
            self.anchor_href = ""
            self.anchor_parts = []
        if tag == "li" and self.in_li:
            value = clean(" ".join(self.li_parts))
            if value:
                self.list_items.append(value)
            self.in_li = False
            self.li_parts = []
        if self.list_tag and tag == self.list_tag:
            if self.list_items:
                self.blocks.append({"type": "list", "ordered": self.list_tag == "ol", "items": self.list_items})
            self.list_tag = None
            self.list_items = []
        if self.capture_tag and tag == self.capture_tag:
            value = clean(" ".join(self.capture_parts))
            if value:
                if self.capture_tag == "h1":
                    self.h1 = value
                elif self.capture_tag.startswith("h"):
                    self.blocks.append({"type": "heading", "level": int(self.capture_tag[1]), "text": value})
                else:
                    self.blocks.append({"type": "paragraph", "text": value})
            self.capture_tag = None
            self.capture_parts = []
        if tag in {"main", "section", "article", "div", "aside"}:
            self.main_depth -= 1
        if tag == "main" and self.main_depth <= 0:
            self.in_main = False
            self.main_depth = 0

    @property
    def document_title(self) -> str:
        return clean(" ".join(self.title_parts))


def blocks_text(blocks: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for block in blocks:
        kind = block.get("type")
        if kind in {"heading", "paragraph"}:
            text = clean(str(block.get("text") or ""))
            if text:
                parts.append(text)
        elif kind == "list":
            parts.extend(clean(str(item)) for item in block.get("items", []) if clean(str(item)))
        elif kind == "callout":
            for key in ("title", "text"):
                text = clean(str(block.get(key) or ""))
                if text:
                    parts.append(text)
    return "\n\n".join(parts)


def json_source_record(path: Path) -> tuple[str, str, list[dict[str, Any]], list[dict[str, str]]]:
    source = json.loads(path.read_text(encoding="utf-8"))
    title = clean(str(source.get("title") or ""))
    subtitle = clean(str(source.get("subtitle") or ""))
    blocks: list[dict[str, Any]] = []
    if subtitle:
        blocks.append({"type": "paragraph", "text": subtitle})
    for article in source.get("articles", []):
        if not isinstance(article, dict):
            continue
        article_title = clean(str(article.get("title") or ""))
        summary = clean(str(article.get("summary") or ""))
        if article_title:
            blocks.append({"type": "heading", "level": 2, "text": article_title})
        if summary:
            blocks.append({"type": "paragraph", "text": summary})
        for key, heading in (
            ("signals", "علامات أو مواقف تستحق الانتباه"),
            ("steps", "خطوات عملية منخفضة المخاطر"),
            ("phrases", "صياغات عملية مقترحة"),
        ):
            values = [clean(str(value)) for value in article.get(key, []) if clean(str(value))]
            if values:
                blocks.append({"type": "heading", "level": 3, "text": heading})
                blocks.append({"type": "list", "ordered": key == "steps", "items": values})
        avoid = clean(str(article.get("avoid") or ""))
        if avoid:
            blocks.append({"type": "callout", "tone": "warning", "title": "ما يجب تجنبه", "text": avoid})
    references = []
    for item in source.get("sources", []):
        if not isinstance(item, dict):
            continue
        url = clean(str(item.get("url") or ""))
        name = clean(str(item.get("name") or url))
        if url.startswith("https://"):
            references.append({"title": name, "url": url})
    return title, subtitle, blocks, references


def html_source_record(path: Path) -> tuple[str, str, list[dict[str, Any]], list[dict[str, str]], str]:
    parser = LegacyHtmlParser()
    parser.feed(path.read_text(encoding="utf-8"))
    title = parser.h1 or re.sub(r"\s*\|.*$", "", parser.document_title).strip()
    return title, parser.description, parser.blocks, parser.references, parser.canonical


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("manifest", type=Path)
    ap.add_argument("config", type=Path)
    ap.add_argument("--output", type=Path, required=True)
    args = ap.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    config = json.loads(args.config.read_text(encoding="utf-8"))
    manifest_by_canonical = {str(row.get("legacy_canonical")): row for row in manifest.get("records", [])}
    config_records = config.get("records", [])
    records: list[dict[str, Any]] = []

    for spec in config_records:
        canonical = str(spec.get("target_canonical") or spec.get("source_path") or "").strip()
        source_route = str(spec.get("source_path") or "").strip()
        source_manifest = manifest_by_canonical.get(canonical)
        if not source_manifest:
            raise SystemExit(f"No preserved source registered for {canonical}")
        preserved_path = Path(str(source_manifest.get("preserved_path") or ""))
        if not preserved_path.is_file():
            raise SystemExit(f"Preserved source missing: {preserved_path}")
        raw = preserved_path.read_bytes()
        source_sha256 = hashlib.sha256(raw).hexdigest()

        if preserved_path.suffix.lower() == ".json":
            title, excerpt, blocks, references = json_source_record(preserved_path)
            source_canonical = canonical
        else:
            title, excerpt, blocks, references, source_canonical = html_source_record(preserved_path)
            if source_canonical:
                parsed_path = urlparse(source_canonical).path
                if parsed_path != canonical:
                    raise SystemExit(f"Canonical mismatch for {canonical}: {parsed_path}")

        body_text = blocks_text(blocks)
        if not title or not body_text:
            raise SystemExit(f"Preserved source did not materialize meaningful content: {canonical}")

        schema = {
            "migration_program": "mandatory-legacy-source-preservation-v1",
            "legacy_source_repository": manifest.get("source_repository"),
            "legacy_source_path": source_manifest.get("source_path"),
            "legacy_source_sha256": source_sha256,
            "legacy_source_git_blob_sha1": source_manifest.get("source_blob_sha1"),
            "legacy_source_snapshot_path": str(preserved_path),
            "legacy_canonical": canonical,
            "mandatory_transfer": True,
            "publication_ready": False,
            "editorial_review_required": True,
            "migration_claim_issue": source_manifest.get("issue_number"),
            "references_preserved": True,
        }
        if isinstance(spec.get("schema_json"), dict):
            schema.update(spec["schema_json"])

        records.append({
            "source_path": source_route,
            "content_type": spec.get("content_type", "article"),
            "slug": str(spec.get("target_slug") or "").strip(),
            "title": title,
            "excerpt": excerpt or None,
            "body_json": {"version": 1, "blocks": blocks},
            "body_text": body_text,
            "audience": spec.get("audience", []),
            "status": "draft",
            "seo_title": title,
            "seo_description": excerpt or title,
            "canonical_url": canonical,
            "robots_index": False,
            "robots_follow": True,
            "schema_json": schema,
            "featured_image_url": None,
            "featured_image_alt": None,
            "published_at": None,
            "updated_at": None,
            "search_aliases": [],
            "primary_keyword": spec.get("primary_keyword") or title,
            "secondary_keywords": spec.get("secondary_keywords", []),
            "semantic_terms": spec.get("semantic_terms", []),
            "search_intent": spec.get("search_intent") or config.get("defaults", {}).get("search_intent", "informational"),
            "author_display_name": spec.get("author_display_name") or config.get("defaults", {}).get("author_display_name"),
            "references_json": references,
            "medical_disclaimer": None,
        })

    record_bytes = norm_records(records)
    payload = {
        "version": 1,
        "batch_id": config.get("batch_id"),
        "record_count": len(records),
        "records_sha256": hashlib.sha256(record_bytes).hexdigest(),
        "transfer_policy": "mandatory-preservation-no-length-floor",
        "records": records,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "status": "passed",
        "batch_id": payload["batch_id"],
        "record_count": payload["record_count"],
        "records_sha256": payload["records_sha256"],
        "canonicals": [row["canonical_url"] for row in records],
        "word_counts": {row["slug"]: len(row["body_text"].split()) for row in records},
        "reference_counts": {row["slug"]: len(row["references_json"]) for row in records},
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
