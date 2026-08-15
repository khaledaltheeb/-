#!/usr/bin/env python3
from __future__ import annotations

import collections
import re
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

import materialize_quick_info as base

LEGACY_LONGFORM_START = "<!-- QUICK_INFO_LONGFORM_V1_START -->"
LEGACY_LONGFORM_END = "<!-- QUICK_INFO_LONGFORM_V1_END -->"
LEGACY_LONGFORM_RE = re.compile(
    re.escape(LEGACY_LONGFORM_START) + r".*?" + re.escape(LEGACY_LONGFORM_END),
    flags=re.DOTALL,
)
_original_page_record = base.page_record


def strip_legacy_generated_longform(html: str) -> tuple[str, int]:
    """Remove the old deterministic padding block while preserving the original article."""
    return LEGACY_LONGFORM_RE.subn("", html)


def sanitized_page_record(html: str, slug: str, origin: str, source_path: str) -> dict:
    cleaned_html, removed_count = strip_legacy_generated_longform(html)
    record = _original_page_record(cleaned_html, slug, origin, source_path)
    schema = record.setdefault("schema_json", {})
    schema["legacy_generated_longform_removed"] = removed_count > 0
    schema["legacy_generated_longform_removed_count"] = removed_count
    schema["legacy_sanitizer_version"] = 1
    return record


def full_live_slugs() -> list[str]:
    seeds = {base.SITE + "/sitemap.xml"}
    try:
        robots = base.http_get(base.SITE + "/robots.txt")
        seeds.update(
            line.split(":", 1)[1].strip()
            for line in robots.splitlines()
            if line.lower().startswith("sitemap:")
        )
    except Exception:
        pass

    queue = collections.deque(sorted(seeds))
    seen: set[str] = set()
    urls: set[str] = set()
    while queue and len(seen) < 500:
        sitemap = queue.popleft()
        if sitemap in seen:
            continue
        seen.add(sitemap)
        root = ET.fromstring(base.http_get(sitemap))
        locs = [node.text.strip() for node in root.iter() if node.tag.endswith("loc") and node.text]
        if root.tag.endswith("sitemapindex"):
            queue.extend(loc for loc in locs if loc.startswith(base.SITE))
        else:
            urls.update(loc for loc in locs if loc.startswith(base.SITE))

    slugs: set[str] = set()
    for url in urls:
        path = urlparse(url).path
        if not path.startswith(base.QUICK_PREFIX):
            continue
        rest = path[len(base.QUICK_PREFIX):].strip("/")
        if rest and "/" not in rest:
            slugs.add(rest)
    return sorted(slugs)


base.page_record = sanitized_page_record
base.live_slugs = full_live_slugs

if __name__ == "__main__":
    raise SystemExit(base.main())
