#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


class PageParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.in_title = False
        self.meta: dict[str, str] = {}
        self.canonical = ""
        self.headings: list[dict[str, str]] = []
        self.links: list[str] = []
        self.images: list[dict[str, str]] = []
        self.json_ld: list[str] = []
        self._json_ld = False
        self._json_buf: list[str] = []
        self._heading_tag: str | None = None
        self._heading_buf: list[str] = []
        self._visible: list[str] = []
        self._hidden_depth = 0

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        attrs = {k.lower(): (v or "") for k, v in attrs_list}
        tag = tag.lower()
        if tag == "title":
            self.in_title = True
        if tag in {"script", "style", "noscript", "template"}:
            self._hidden_depth += 1
        if tag == "script" and attrs.get("type", "").lower() == "application/ld+json":
            self._json_ld = True
            self._json_buf = []
        if tag == "meta":
            key = (attrs.get("name") or attrs.get("property") or "").strip().lower()
            if key:
                self.meta[key] = attrs.get("content", "").strip()
        if tag == "link" and attrs.get("rel", "").lower() == "canonical":
            self.canonical = attrs.get("href", "").strip()
        if tag in {"h1", "h2", "h3"}:
            self._heading_tag = tag
            self._heading_buf = []
        if tag == "a":
            href = attrs.get("href", "").strip()
            if href:
                self.links.append(href)
        if tag == "img":
            src = attrs.get("src", "").strip()
            if src:
                self.images.append({"src": src, "alt": attrs.get("alt", "").strip()})

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
        if tag in {"h1", "h2", "h3"} and self._heading_tag == tag:
            text = _clean_text(" ".join(self._heading_buf))
            if text:
                self.headings.append({"level": tag, "text": text})
            self._heading_tag = None
            self._heading_buf = []
        if tag == "script" and self._json_ld:
            payload = "".join(self._json_buf).strip()
            if payload:
                self.json_ld.append(payload)
            self._json_ld = False
            self._json_buf = []
        if tag in {"script", "style", "noscript", "template"} and self._hidden_depth:
            self._hidden_depth -= 1

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title += data
        if self._json_ld:
            self._json_buf.append(data)
        if self._heading_tag:
            self._heading_buf.append(data)
        if not self._hidden_depth:
            text = _clean_text(data)
            if text:
                self._visible.append(text)

    @property
    def visible_text(self) -> str:
        return _clean_text(" ".join(self._visible))


def _clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", unescape(value or "")).strip()


def _word_count(text: str) -> int:
    return len(re.findall(r"[\w\u0600-\u06FF]+", text, flags=re.UNICODE))


def _https_sources(parser: PageParser) -> list[str]:
    urls: set[str] = set()
    for href in parser.links:
        if href.startswith("https://"):
            host = urlparse(href).netloc.lower()
            if host and "healthrenewal.org" not in host:
                urls.add(href)
    for raw in parser.json_ld:
        for url in re.findall(r'https://[^"\\\s<>]+', raw):
            host = urlparse(url).netloc.lower()
            if host and "healthrenewal.org" not in host:
                urls.add(url.rstrip('.,);]'))
    return sorted(urls)


def audit_page(index_file: Path, root: Path) -> dict[str, object]:
    source = index_file.read_text(encoding="utf-8", errors="replace")
    parser = PageParser()
    parser.feed(source)
    slug = index_file.parent.name
    rel = index_file.relative_to(root).as_posix()
    visible = parser.visible_text
    title = _clean_text(parser.title)
    h1 = next((h["text"] for h in parser.headings if h["level"] == "h1"), "")
    description = parser.meta.get("description", "")
    canonical = parser.canonical
    sources = _https_sources(parser)
    return {
        "slug": slug,
        "source_path": rel,
        "sha256": hashlib.sha256(source.encode("utf-8")).hexdigest(),
        "title": title,
        "h1": h1,
        "description": description,
        "canonical": canonical,
        "robots": parser.meta.get("robots", ""),
        "published_time": parser.meta.get("article:published_time", ""),
        "modified_time": parser.meta.get("article:modified_time", ""),
        "section": parser.meta.get("article:section", ""),
        "word_count": _word_count(visible),
        "headings": parser.headings,
        "external_sources": sources,
        "external_source_count": len(sources),
        "images": parser.images,
        "image_count": len(parser.images),
        "json_ld_blocks": len(parser.json_ld),
        "has_faq_schema": any('"FAQPage"' in block or "'FAQPage'" in block for block in parser.json_ld),
        "has_article_schema": any('"Article"' in block or '"MedicalWebPage"' in block for block in parser.json_ld),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Inventory legacy quick-info pages without mutating the source repository.")
    ap.add_argument("legacy_root", type=Path)
    ap.add_argument("--output", type=Path, default=Path("artifacts/quick-info-legacy-inventory.json"))
    ap.add_argument("--expected", type=int, default=396)
    args = ap.parse_args()

    quick_root = args.legacy_root / "quick-info"
    if not quick_root.is_dir():
        raise SystemExit(f"missing legacy quick-info directory: {quick_root}")

    files = sorted(quick_root.glob("*/index.html"))
    pages = [audit_page(path, args.legacy_root) for path in files]
    slugs = [str(page["slug"]) for page in pages]
    duplicates = sorted({slug for slug in slugs if slugs.count(slug) > 1})
    missing_metadata = [
        page["slug"] for page in pages
        if not page["title"] or not page["h1"] or not page["description"] or not page["canonical"]
    ]
    wrong_canonical = [
        page["slug"] for page in pages
        if page["canonical"] != f"https://healthrenewal.org/quick-info/{page['slug']}/"
    ]
    thin_under_500 = [page["slug"] for page in pages if int(page["word_count"]) < 500]
    no_external_sources = [page["slug"] for page in pages if int(page["external_source_count"]) == 0]

    report = {
        "version": 1,
        "source": "khaledaltheeb/healthrenewal.org:main/quick-info",
        "expected_pages": args.expected,
        "page_count": len(pages),
        "status": "passed" if len(pages) == args.expected and not duplicates and not missing_metadata and not wrong_canonical else "failed",
        "summary": {
            "duplicate_slugs": len(duplicates),
            "missing_metadata": len(missing_metadata),
            "wrong_canonical": len(wrong_canonical),
            "thin_under_500": len(thin_under_500),
            "no_external_sources": len(no_external_sources),
            "minimum_words": min((int(p["word_count"]) for p in pages), default=0),
            "maximum_words": max((int(p["word_count"]) for p in pages), default=0),
            "average_words": round(sum(int(p["word_count"]) for p in pages) / len(pages), 1) if pages else 0,
        },
        "failures": {
            "duplicate_slugs": duplicates,
            "missing_metadata": missing_metadata,
            "wrong_canonical": wrong_canonical,
        },
        "editorial_flags": {
            "thin_under_500": thin_under_500,
            "no_external_sources": no_external_sources,
        },
        "pages": pages,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"status": report["status"], "page_count": len(pages), **report["summary"]}, ensure_ascii=False))
    if len(pages) != args.expected:
        print(f"expected {args.expected} quick-info pages, found {len(pages)}")
        return 1
    return 0 if report["status"] == "passed" else 1


if __name__ == "__main__":
    raise SystemExit(main())
