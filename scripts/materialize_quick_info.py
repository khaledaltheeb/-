#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
import urllib.request
import xml.etree.ElementTree as ET
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import quote, urlparse

SITE = "https://healthrenewal.org"
QUICK_PREFIX = "/quick-info/"
DISCLAIMER = "هذه الصفحة للتثقيف وتنظيم الملاحظات وليست تشخيصًا فرديًا. عند استمرار الضيق أو تعطله للحياة أو وجود خطر على السلامة، اطلب تقييمًا مهنيًا أو خدمات الطوارئ المحلية بحسب الحالة."


def clean(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value or "")).strip()


def quick_info_card_url(title: str) -> str:
    context = "معلومة سريعة · قراءة عربية واضحة · منصة روافد"
    return f"{SITE}/seo-card?title={quote(title, safe='')}&context={quote(context, safe='')}"


def http_get(url: str, retries: int = 4) -> str:
    request = urllib.request.Request(url, headers={"User-Agent": "Rawafid-Quick-Info-Materializer/1.0"})
    last: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read().decode("utf-8", "replace")
        except Exception as exc:
            last = exc
            if attempt + 1 < retries:
                time.sleep(1.5 * (attempt + 1))
    assert last is not None
    raise last


class MetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title_parts: list[str] = []
        self.in_title = False
        self.meta: dict[str, str] = {}
        self.canonical = ""
        self.json_ld: list[str] = []
        self._json = False
        self._json_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = {k.lower(): (v or "") for k, v in attrs_list}
        tag = tag.lower()
        if tag == "title":
            self.in_title = True
        elif tag == "meta":
            key = clean(attrs.get("name") or attrs.get("property") or "").lower()
            if key:
                self.meta[key] = clean(attrs.get("content", ""))
        elif tag == "link" and attrs.get("rel", "").lower() == "canonical":
            self.canonical = clean(attrs.get("href", ""))
        elif tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self._json = True
            self._json_parts = []

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self._json:
            self._json_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
        elif tag == "script" and self._json:
            raw = "".join(self._json_parts).strip()
            if raw:
                self.json_ld.append(raw)
            self._json = False
            self._json_parts = []

    @property
    def title(self) -> str:
        return clean(" ".join(self.title_parts))


class ArticleParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.blocks: list[dict] = []
        self.references: list[dict] = []
        self.in_article = False
        self.article_depth = 0
        self.capture_tag: str | None = None
        self.capture_parts: list[str] = []
        self.capture_level = 2
        self.list_tag: str | None = None
        self.list_items: list[str] = []
        self.li_parts: list[str] = []
        self.in_li = False
        self.notice_depth = 0
        self.notice_parts: list[str] = []
        self.notice_title = ""
        self.in_notice_strong = False
        self.notice_strong_parts: list[str] = []
        self.table_depth = 0
        self.table_rows: list[list[str]] = []
        self.current_row: list[str] = []
        self.cell_parts: list[str] = []
        self.in_cell = False
        self.cell_is_header = False
        self.table_caption = ""
        self.in_caption = False
        self.caption_parts: list[str] = []
        self.anchor_href = ""
        self.anchor_parts: list[str] = []
        self.in_anchor = False

    @staticmethod
    def attrs(attrs_list: list[tuple[str, str | None]]) -> dict[str, str]:
        return {k.lower(): (v or "") for k, v in attrs_list}

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = self.attrs(attrs_list)
        tag = tag.lower()
        classes = set(attrs.get("class", "").split())
        if tag == "article" and ("article" in classes or not self.in_article):
            if not self.in_article:
                self.in_article = True
                self.article_depth = 1
                return
        if not self.in_article:
            return
        if tag in {"article", "section", "div"}:
            self.article_depth += 1
        if tag == "div" and "notice" in classes and self.notice_depth == 0:
            self.notice_depth = self.article_depth
            self.notice_parts = []
            self.notice_title = ""
        if self.notice_depth and tag == "strong":
            self.in_notice_strong = True
            self.notice_strong_parts = []
        if tag in {"h2", "h3", "h4", "p"} and not self.list_tag and not self.table_depth and not self.notice_depth:
            self.capture_tag = tag
            self.capture_parts = []
            self.capture_level = int(tag[1]) if tag.startswith("h") else 0
        if tag in {"ul", "ol"} and not self.list_tag and not self.table_depth:
            self.list_tag = tag
            self.list_items = []
        if tag == "li" and self.list_tag:
            self.in_li = True
            self.li_parts = []
        if tag == "table" and not self.table_depth:
            self.table_depth = 1
            self.table_rows = []
            self.table_caption = ""
        elif self.table_depth and tag in {"thead", "tbody", "tfoot"}:
            self.table_depth += 1
        if self.table_depth and tag == "tr":
            self.current_row = []
        if self.table_depth and tag in {"th", "td"}:
            self.in_cell = True
            self.cell_is_header = tag == "th"
            self.cell_parts = []
        if self.table_depth and tag == "caption":
            self.in_caption = True
            self.caption_parts = []
        if tag == "a":
            self.in_anchor = True
            self.anchor_href = clean(attrs.get("href", ""))
            self.anchor_parts = []

    def handle_data(self, data: str) -> None:
        if not self.in_article:
            return
        if self.capture_tag:
            self.capture_parts.append(data)
        if self.in_li:
            self.li_parts.append(data)
        if self.notice_depth:
            self.notice_parts.append(data)
        if self.in_notice_strong:
            self.notice_strong_parts.append(data)
        if self.in_cell:
            self.cell_parts.append(data)
        if self.in_caption:
            self.caption_parts.append(data)
        if self.in_anchor:
            self.anchor_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if not self.in_article:
            return
        if tag == "a" and self.in_anchor:
            href = self.anchor_href
            label = clean(" ".join(self.anchor_parts))
            if href.startswith("https://") and label:
                host = urlparse(href).netloc.lower()
                if host and "healthrenewal.org" not in host:
                    item = {"title": label, "url": href}
                    if item not in self.references:
                        self.references.append(item)
            self.in_anchor = False
            self.anchor_href = ""
            self.anchor_parts = []
        if self.in_notice_strong and tag == "strong":
            self.notice_title = clean(" ".join(self.notice_strong_parts))
            self.in_notice_strong = False
            self.notice_strong_parts = []
        if self.in_cell and tag in {"th", "td"}:
            self.current_row.append(clean(" ".join(self.cell_parts)))
            self.in_cell = False
            self.cell_parts = []
        if self.in_caption and tag == "caption":
            self.table_caption = clean(" ".join(self.caption_parts))
            self.in_caption = False
            self.caption_parts = []
        if self.table_depth and tag == "tr":
            if any(self.current_row):
                self.table_rows.append(self.current_row)
            self.current_row = []
        if self.table_depth and tag in {"thead", "tbody", "tfoot"}:
            self.table_depth = max(1, self.table_depth - 1)
        if self.table_depth and tag == "table":
            headers = self.table_rows[0] if self.table_rows else []
            rows = self.table_rows[1:] if len(self.table_rows) > 1 else []
            if headers or rows:
                self.blocks.append({"type": "table", "headers": headers, "rows": rows, "caption": self.table_caption})
            self.table_depth = 0
            self.table_rows = []
        if self.in_li and tag == "li":
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
                if self.capture_tag == "p":
                    self.blocks.append({"type": "paragraph", "text": value})
                else:
                    self.blocks.append({"type": "heading", "level": self.capture_level, "text": value})
            self.capture_tag = None
            self.capture_parts = []
        ending_container = tag in {"article", "section", "div"}
        if ending_container and self.notice_depth == self.article_depth:
            text = clean(" ".join(self.notice_parts))
            if self.notice_title and text.startswith(self.notice_title):
                text = clean(text[len(self.notice_title):])
            if self.notice_title or text:
                self.blocks.append({"type": "callout", "tone": "warning", "title": self.notice_title, "text": text})
            self.notice_depth = 0
            self.notice_parts = []
            self.notice_title = ""
        if ending_container:
            self.article_depth -= 1
        if tag == "article" and self.article_depth <= 0:
            self.in_article = False
            self.article_depth = 0


def json_ld_objects(raw_blocks: list[str]) -> list[dict]:
    found: list[dict] = []
    for raw in raw_blocks:
        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            continue
        candidates = data.get("@graph", []) if isinstance(data, dict) else []
        if isinstance(data, dict):
            candidates = [data] + (candidates if isinstance(candidates, list) else [])
        for item in candidates:
            if isinstance(item, dict):
                found.append(item)
    return found


def faq_from_json_ld(raw_blocks: list[str]) -> list[dict]:
    faqs: list[dict] = []
    for obj in json_ld_objects(raw_blocks):
        types = obj.get("@type")
        type_values = types if isinstance(types, list) else [types]
        if "FAQPage" not in type_values:
            continue
        entities = obj.get("mainEntity", [])
        if not isinstance(entities, list):
            continue
        for entity in entities:
            if not isinstance(entity, dict):
                continue
            answer = entity.get("acceptedAnswer")
            q = clean(str(entity.get("name", "")))
            a = clean(str(answer.get("text", ""))) if isinstance(answer, dict) else ""
            if q and a:
                faqs.append({"question": q, "answer": a})
    unique: list[dict] = []
    seen: set[tuple[str, str]] = set()
    for item in faqs:
        key = (item["question"], item["answer"])
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique[:40]


def citation_urls(raw_blocks: list[str]) -> list[str]:
    urls: list[str] = []
    for obj in json_ld_objects(raw_blocks):
        raw = obj.get("citation")
        values = raw if isinstance(raw, list) else [raw] if isinstance(raw, str) else []
        for value in values:
            if isinstance(value, str) and value.startswith("https://") and value not in urls:
                urls.append(value)
    return urls


def page_record(html: str, slug: str, origin: str, source_path: str) -> dict:
    meta = MetaParser()
    meta.feed(html)
    article = ArticleParser()
    article.feed(html)
    blocks = article.blocks
    faqs = faq_from_json_ld(meta.json_ld)
    if faqs:
        blocks.append({"type": "heading", "level": 2, "text": "أسئلة شائعة"})
        blocks.append({"type": "faq", "items": faqs})

    citation_set = citation_urls(meta.json_ld)
    references = list(article.references)
    known_urls = {item["url"] for item in references}
    for url in citation_set:
        if url not in known_urls:
            references.append({"title": urlparse(url).netloc, "url": url})
            known_urls.add(url)

    if not blocks:
        raise ValueError(f"no article blocks extracted: {slug}")
    body_parts: list[str] = []
    for block in blocks:
        if block["type"] in {"paragraph", "heading", "callout"}:
            value = block.get("text") or block.get("title")
            if value:
                body_parts.append(str(value))
        elif block["type"] == "list":
            body_parts.extend(block.get("items", []))
        elif block["type"] == "table":
            body_parts.extend(block.get("headers", []))
            for row in block.get("rows", []):
                body_parts.extend(row)
        elif block["type"] == "faq":
            for item in block.get("items", []):
                body_parts.extend([item.get("question", ""), item.get("answer", "")])
    body_text = "\n\n".join(clean(x) for x in body_parts if clean(x))
    word_count = len(re.findall(r"[\w\u0600-\u06FF]+", body_text, flags=re.UNICODE))

    title = meta.meta.get("og:title") or re.sub(r"\s*\|\s*معلومات سريعة\s*$", "", meta.title).strip()
    description = meta.meta.get("description") or meta.meta.get("og:description") or ""
    canonical = meta.canonical or f"{SITE}/quick-info/{slug}/"
    published = meta.meta.get("article:published_time") or "2026-08-04T00:00:00+03:00"
    modified = meta.meta.get("article:modified_time") or published
    source_hash = hashlib.sha256(html.encode("utf-8")).hexdigest()
    if canonical != f"{SITE}/quick-info/{slug}/":
        raise ValueError(f"canonical mismatch for {slug}: {canonical}")
    if not title or not description:
        raise ValueError(f"missing title/description for {slug}")
    if word_count < 300:
        raise ValueError(f"extracted body unexpectedly thin for {slug}: {word_count}")
    if not references:
        raise ValueError(f"no references for {slug}")

    return {
        "content_type": "article",
        "slug": f"quick-info-{slug}",
        "title": title,
        "excerpt": description[:500],
        "body_json": {"version": 1, "blocks": blocks},
        "body_text": body_text,
        "audience": ["general"],
        "status": "draft",
        "seo_title": title,
        "seo_description": description[:300],
        "canonical_url": f"/quick-info/{slug}/",
        "robots_index": True,
        "robots_follow": True,
        "schema_json": {
            "page_role": "quick-info",
            "migration_program": "quick-info-legacy-v1",
            "migration_origin": origin,
            "migration_source": source_path,
            "migration_source_sha256": source_hash,
            "legacy_canonical": canonical,
            "legacy_word_count": word_count,
            "publication_ready": False,
            "editorial_review_required": True,
        },
        "featured_image_url": quick_info_card_url(title),
        "featured_image_alt": f"بطاقة معلومات سريعة: {title}",
        "published_at": published,
        "updated_at": modified,
        "search_aliases": [],
        "primary_keyword": title,
        "secondary_keywords": [],
        "semantic_terms": [],
        "search_intent": "informational",
        "author_display_name": "منصة روافد",
        "references_json": references[:50],
        "medical_disclaimer": DISCLAIMER,
    }


def live_slugs() -> list[str]:
    raw = http_get(SITE + "/sitemap-quick-info.xml")
    root = ET.fromstring(raw)
    slugs: set[str] = set()
    for node in root.iter():
        if not node.tag.endswith("loc") or not node.text:
            continue
        path = urlparse(node.text.strip()).path
        if path.startswith(QUICK_PREFIX):
            rest = path[len(QUICK_PREFIX):].strip("/")
            if rest and "/" not in rest:
                slugs.add(rest)
    return sorted(slugs)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("legacy_root", type=Path)
    ap.add_argument("--output", type=Path, default=Path("artifacts/quick-info-materialized.json"))
    ap.add_argument("--expected", type=int, default=395)
    args = ap.parse_args()

    source_dir = args.legacy_root / "quick-info"
    records: list[dict] = []
    errors: dict[str, str] = {}
    origins = {"repository": 0, "live-production": 0}
    for slug in live_slugs():
        local = source_dir / slug / "index.html"
        if local.is_file():
            origin = "repository"
            source_path = local.relative_to(args.legacy_root).as_posix()
            html = local.read_text(encoding="utf-8", errors="replace")
        else:
            origin = "live-production"
            source_path = f"{SITE}/quick-info/{slug}/"
            html = http_get(source_path)
            time.sleep(0.04)
        try:
            records.append(page_record(html, slug, origin, source_path))
            origins[origin] += 1
        except Exception as exc:
            errors[slug] = repr(exc)

    slugs = [record["slug"] for record in records]
    duplicate_slugs = sorted({slug for slug in slugs if slugs.count(slug) > 1})
    block_counts = [len(record["body_json"]["blocks"]) for record in records]
    word_counts = [int(record["schema_json"]["legacy_word_count"]) for record in records]
    reference_counts = [len(record["references_json"]) for record in records]
    passed = len(records) == args.expected and not errors and not duplicate_slugs
    report = {
        "version": 1,
        "status": "passed" if passed else "failed",
        "expected": args.expected,
        "record_count": len(records),
        "origins": origins,
        "error_count": len(errors),
        "errors": errors,
        "duplicate_slugs": duplicate_slugs,
        "quality": {
            "min_blocks": min(block_counts, default=0),
            "max_blocks": max(block_counts, default=0),
            "avg_blocks": round(sum(block_counts) / len(block_counts), 1) if block_counts else 0,
            "min_words": min(word_counts, default=0),
            "max_words": max(word_counts, default=0),
            "avg_words": round(sum(word_counts) / len(word_counts), 1) if word_counts else 0,
            "min_references": min(reference_counts, default=0),
            "max_references": max(reference_counts, default=0),
        },
        "records": records,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({key: value for key, value in report.items() if key != "records" and key != "errors"}, ensure_ascii=False))
    if errors:
        for slug, error in list(errors.items())[:30]:
            print("ERROR", slug, error)
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
