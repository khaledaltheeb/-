#!/usr/bin/env python3
from __future__ import annotations

import argparse
import collections
import hashlib
import json
import re
import time
import urllib.request
import xml.etree.ElementTree as ET
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


def audit_html(source: str, slug: str, source_path: str, origin: str) -> dict[str, object]:
    parser = PageParser()
    parser.feed(source)
    visible = parser.visible_text
    sources = _https_sources(parser)
    return {
        "slug": slug,
        "origin": origin,
        "source_path": source_path,
        "sha256": hashlib.sha256(source.encode("utf-8")).hexdigest(),
        "title": _clean_text(parser.title),
        "h1": next((h["text"] for h in parser.headings if h["level"] == "h1"), ""),
        "description": parser.meta.get("description", ""),
        "canonical": parser.canonical,
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


def _get(url: str, retries: int = 4) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "Rawafid-Quick-Info-Audit/1.0"})
    last: Exception | None = None
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(request, timeout=30) as response:
                return response.read()
        except Exception as exc:
            last = exc
            if attempt + 1 < retries:
                time.sleep(1.5 * (attempt + 1))
    assert last is not None
    raise last


def live_quick_info_slugs(base: str) -> list[str]:
    sitemap_seeds = {base.rstrip("/") + "/sitemap.xml"}
    try:
        robots = _get(base.rstrip("/") + "/robots.txt").decode("utf-8", "ignore")
        sitemap_seeds.update(
            line.split(":", 1)[1].strip()
            for line in robots.splitlines()
            if line.lower().startswith("sitemap:")
        )
    except Exception:
        pass

    queue = collections.deque(sorted(sitemap_seeds))
    seen: set[str] = set()
    urls: set[str] = set()
    while queue and len(seen) < 500:
        sitemap = queue.popleft()
        if sitemap in seen:
            continue
        seen.add(sitemap)
        root = ET.fromstring(_get(sitemap))
        locs = [node.text.strip() for node in root.iter() if node.tag.endswith("loc") and node.text]
        if root.tag.endswith("sitemapindex"):
            queue.extend(loc for loc in locs if loc.startswith(base))
        else:
            urls.update(loc for loc in locs if loc.startswith(base))

    prefix = "/quick-info/"
    slugs: set[str] = set()
    for url in urls:
        path = urlparse(url).path
        if not path.startswith(prefix):
            continue
        rest = path[len(prefix):].strip("/")
        if rest and "/" not in rest and re.fullmatch(r"[a-z0-9][a-z0-9-]*", rest):
            slugs.add(rest)
    return sorted(slugs)


def main() -> int:
    ap = argparse.ArgumentParser(description="Inventory and reconcile legacy quick-info pages without mutating the source repository.")
    ap.add_argument("legacy_root", type=Path)
    ap.add_argument("--output", type=Path, default=Path("artifacts/quick-info-legacy-inventory.json"))
    ap.add_argument("--expected", type=int, default=395, help="Expected article count; the /quick-info/ hub is counted separately.")
    ap.add_argument("--live-base", default="https://healthrenewal.org")
    args = ap.parse_args()

    quick_root = args.legacy_root / "quick-info"
    if not quick_root.is_dir():
        raise SystemExit(f"missing legacy quick-info directory: {quick_root}")

    source_pages: dict[str, dict[str, object]] = {}
    for index_file in sorted(quick_root.glob("*/index.html")):
        slug = index_file.parent.name
        html = index_file.read_text(encoding="utf-8", errors="replace")
        source_pages[slug] = audit_html(html, slug, index_file.relative_to(args.legacy_root).as_posix(), "repository")

    live_slugs = live_quick_info_slugs(args.live_base.rstrip("/"))
    source_slugs = sorted(source_pages)
    live_only = sorted(set(live_slugs) - set(source_slugs))
    source_only = sorted(set(source_slugs) - set(live_slugs))

    pages = dict(source_pages)
    live_fetch_errors: dict[str, str] = {}
    for i, slug in enumerate(live_only, start=1):
        url = f"{args.live_base.rstrip('/')}/quick-info/{slug}/"
        try:
            html = _get(url).decode("utf-8", "replace")
            pages[slug] = audit_html(html, slug, url, "live-production")
        except Exception as exc:
            live_fetch_errors[slug] = repr(exc)
        if i % 25 == 0:
            print(f"fetched live-only pages: {i}/{len(live_only)}")
        time.sleep(0.05)

    ordered = [pages[slug] for slug in sorted(pages)]
    slugs = [str(page["slug"]) for page in ordered]
    duplicates = sorted({slug for slug in slugs if slugs.count(slug) > 1})
    missing_metadata = [page["slug"] for page in ordered if not page["title"] or not page["h1"] or not page["description"] or not page["canonical"]]
    wrong_canonical = [page["slug"] for page in ordered if page["canonical"] != f"https://healthrenewal.org/quick-info/{page['slug']}/"]
    thin_under_500 = [page["slug"] for page in ordered if int(page["word_count"]) < 500]
    no_external_sources = [page["slug"] for page in ordered if int(page["external_source_count"]) == 0]

    complete_count = len(ordered)
    family_url_count = complete_count + 1
    passed = (
        len(live_slugs) == args.expected
        and complete_count == args.expected
        and not source_only
        and not live_fetch_errors
        and not duplicates
        and not missing_metadata
        and not wrong_canonical
    )
    report = {
        "version": 3,
        "repository_source": "khaledaltheeb/healthrenewal.org:main/quick-info",
        "live_source": args.live_base.rstrip("/") + "/quick-info/",
        "expected_articles": args.expected,
        "expected_family_urls_including_hub": args.expected + 1,
        "repository_page_count": len(source_pages),
        "live_sitemap_article_count": len(live_slugs),
        "reconciled_article_count": complete_count,
        "family_url_count_including_hub": family_url_count,
        "status": "passed" if passed else "failed",
        "summary": {
            "live_only_pages": len(live_only),
            "source_only_pages": len(source_only),
            "live_fetch_errors": len(live_fetch_errors),
            "duplicate_slugs": len(duplicates),
            "missing_metadata": len(missing_metadata),
            "wrong_canonical": len(wrong_canonical),
            "thin_under_500": len(thin_under_500),
            "no_external_sources": len(no_external_sources),
            "minimum_words": min((int(p["word_count"]) for p in ordered), default=0),
            "maximum_words": max((int(p["word_count"]) for p in ordered), default=0),
            "average_words": round(sum(int(p["word_count"]) for p in ordered) / len(ordered), 1) if ordered else 0,
        },
        "reconciliation": {
            "live_only_slugs": live_only,
            "source_only_slugs": source_only,
            "live_fetch_errors": live_fetch_errors,
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
        "pages": ordered,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "status": report["status"],
        "repository_page_count": len(source_pages),
        "live_sitemap_article_count": len(live_slugs),
        "reconciled_article_count": complete_count,
        "family_url_count_including_hub": family_url_count,
        **report["summary"],
    }, ensure_ascii=False))
    if live_only:
        print("LIVE_ONLY_SLUGS=" + ",".join(live_only))
    if source_only:
        print("SOURCE_ONLY_SLUGS=" + ",".join(source_only))
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
