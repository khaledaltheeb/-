#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
import xml.etree.ElementTree as ET
from collections import Counter
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

BASE_URL = "https://healthrenewal.org"
SPACE_RE = re.compile(r"\s+")
TAG_RE = re.compile(r"<[^>]+>")


def clean(value: str) -> str:
    return SPACE_RE.sub(" ", unescape(value or "")).strip()


def path_for_url(root: Path, url: str) -> Path:
    parsed = urlparse(url)
    path = unquote(parsed.path).lstrip("/")
    if not path:
        return root / "index.html"
    if path.endswith("/"):
        return root / path / "index.html"
    candidate = root / path
    if candidate.suffix.lower() in {".html", ".htm"}:
        return candidate
    return candidate / "index.html"


def discover_urls(root: Path) -> tuple[list[str], list[str]]:
    urls: set[str] = set()
    sitemaps: list[str] = []
    for path in sorted(root.glob("sitemap*.xml")):
        if path.name == "sitemap-index.xml":
            continue
        try:
            doc = ET.parse(path).getroot()
        except ET.ParseError:
            continue
        if doc.tag.rsplit("}", 1)[-1] != "urlset":
            continue
        locations = [clean(node.text or "") for node in doc.findall("{*}url/{*}loc")]
        locations = [url for url in locations if url.startswith(BASE_URL)]
        if not locations:
            continue
        sitemaps.append(path.name)
        urls.update(locations)
    return sorted(urls), sitemaps


class Extractor(HTMLParser):
    ignored = {"script", "style", "svg", "noscript", "template", "form", "nav", "header", "footer"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.h1 = ""
        self.canonical = ""
        self.description = ""
        self.robots = ""
        self._skip = 0
        self._in_title = False
        self._main_depth = 0
        self._main_seen = False
        self._body_depth = 0
        self._capture_tag: str | None = None
        self._capture_level = 0
        self._buffer: list[str] = []
        self._list_kind: str | None = None
        self._list_items: list[str] = []
        self._li_buffer: list[str] | None = None
        self.blocks: list[dict] = []
        self.all_text: list[str] = []

    def active(self) -> bool:
        if self._skip:
            return False
        return self._main_depth > 0 if self._main_seen else self._body_depth > 0

    def handle_starttag(self, tag: str, attrs_list: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attrs = {str(k).lower(): (v or "") for k, v in attrs_list}
        if tag in self.ignored:
            self._skip += 1
            return
        if self._skip:
            return
        if tag == "body":
            self._body_depth += 1
        if tag == "main":
            self._main_seen = True
            self._main_depth += 1
        elif self._main_depth and tag == "section":
            self._main_depth += 1
        if tag == "title":
            self._in_title = True
        if tag == "meta":
            key = attrs.get("name", "").lower()
            if key == "description" and not self.description:
                self.description = clean(attrs.get("content", ""))
            elif key == "robots" and not self.robots:
                self.robots = clean(attrs.get("content", "")).lower()
        if tag == "link" and "canonical" in attrs.get("rel", "").lower().split():
            self.canonical = clean(attrs.get("href", ""))
        if not self.active():
            return
        if tag in {"h1", "h2", "h3", "h4", "p", "blockquote"}:
            self._capture_tag = tag
            self._capture_level = int(tag[1]) if tag.startswith("h") else 0
            self._buffer = []
        elif tag in {"ul", "ol"} and self._list_kind is None:
            self._list_kind = tag
            self._list_items = []
        elif tag == "li" and self._list_kind:
            self._li_buffer = []

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in self.ignored:
            if self._skip:
                self._skip -= 1
            return
        if self._skip:
            return
        if tag == "title":
            self._in_title = False
        if self._capture_tag == tag:
            value = clean(" ".join(self._buffer))
            if value:
                if tag == "h1":
                    if not self.h1:
                        self.h1 = value
                elif tag in {"h2", "h3", "h4"}:
                    self.blocks.append({"type": "heading", "level": self._capture_level, "text": value})
                elif tag == "blockquote":
                    self.blocks.append({"type": "quote", "text": value})
                else:
                    self.blocks.append({"type": "paragraph", "text": value})
            self._capture_tag = None
            self._buffer = []
        if tag == "li" and self._li_buffer is not None:
            value = clean(" ".join(self._li_buffer))
            if value:
                self._list_items.append(value)
            self._li_buffer = None
        elif tag in {"ul", "ol"} and self._list_kind == tag:
            if self._list_items:
                self.blocks.append({"type": "list", "ordered": tag == "ol", "items": self._list_items[:]})
            self._list_kind = None
            self._list_items = []
        if tag == "main" and self._main_depth:
            self._main_depth -= 1
        elif self._main_depth and tag == "section":
            self._main_depth -= 1
        if tag == "body" and self._body_depth:
            self._body_depth -= 1

    def handle_data(self, data: str) -> None:
        value = clean(data)
        if not value:
            return
        if self._in_title and not self.title:
            self.title = value
        if not self.active():
            return
        self.all_text.append(value)
        if self._capture_tag:
            self._buffer.append(value)
        if self._li_buffer is not None:
            self._li_buffer.append(value)


def parse_page(html: str) -> Extractor:
    parser = Extractor()
    parser.feed(html)
    parser.close()
    return parser


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("legacy_root", type=Path)
    ap.add_argument("--output", type=Path, default=Path("artifacts/legacy-content-inventory.json"))
    ap.add_argument("--summary", type=Path, default=Path("artifacts/legacy-content-summary.json"))
    args = ap.parse_args()
    root = args.legacy_root.resolve()
    urls, sitemaps = discover_urls(root)
    records: list[dict] = []
    prefixes: Counter[str] = Counter()
    missing: list[str] = []
    noindex: list[str] = []
    weak: list[str] = []

    for url in urls:
        parsed_url = urlparse(url)
        prefix = parsed_url.path.strip("/").split("/", 1)[0] or "(root)"
        prefixes[prefix] += 1
        file_path = path_for_url(root, url)
        rel = file_path.relative_to(root).as_posix()
        if not file_path.is_file():
            missing.append(url)
            records.append({"url": url, "path": parsed_url.path, "source_html": rel, "html_exists": False})
            continue
        html = file_path.read_text(encoding="utf-8", errors="ignore")
        page = parse_page(html)
        text = clean(" ".join(page.all_text))
        words = len(text.split())
        is_noindex = "noindex" in page.robots
        if is_noindex:
            noindex.append(url)
        if words < 300:
            weak.append(url)
        records.append({
            "url": url,
            "path": parsed_url.path,
            "source_html": rel,
            "html_exists": True,
            "title": page.title,
            "h1": page.h1,
            "meta_description": page.description,
            "canonical": page.canonical,
            "robots": page.robots,
            "word_count": words,
            "sha256": hashlib.sha256(html.encode("utf-8", errors="ignore")).hexdigest(),
            "legacy_asset_refs": {
                "stylesheets": len(re.findall(r"<link[^>]+stylesheet", html, re.I)),
                "scripts": len(re.findall(r"<script\b", html, re.I)),
                "inline_styles": len(re.findall(r"<style\b", html, re.I)),
            },
            "body_json": {"blocks": page.blocks},
            "body_text": text,
        })

    summary = {
        "source_repo": "khaledaltheeb/healthrenewal.org",
        "base_url": BASE_URL,
        "sitemaps": sitemaps,
        "sitemap_count": len(sitemaps),
        "published_url_count": len(urls),
        "html_found": sum(1 for item in records if item.get("html_exists")),
        "html_missing": len(missing),
        "noindex_count": len(noindex),
        "under_300_words": len(weak),
        "top_level_counts": dict(sorted(prefixes.items(), key=lambda item: (-item[1], item[0]))),
        "missing_urls": missing,
        "noindex_urls": noindex,
        "under_300_word_urls": weak,
        "contract": {
            "source_read_only": True,
            "legacy_theme_copied": False,
            "legacy_css_copied": False,
            "legacy_js_copied": False,
            "extracted_payload": "semantic text/blocks + metadata only",
        },
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({"summary": summary, "records": records}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    args.summary.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if len(urls) < 800:
        raise SystemExit(f"legacy inventory unexpectedly small: {len(urls)}")
    if missing:
        raise SystemExit(f"published URLs without matching HTML: {len(missing)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
