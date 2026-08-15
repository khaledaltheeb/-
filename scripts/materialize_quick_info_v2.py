#!/usr/bin/env python3
from __future__ import annotations

import collections
import xml.etree.ElementTree as ET
from urllib.parse import urlparse

import materialize_quick_info as base


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


base.live_slugs = full_live_slugs

if __name__ == "__main__":
    raise SystemExit(base.main())
