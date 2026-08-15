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


def strip_legacy_generated_longform(html: str) -> tuple[str, int]:
    """Remove old deterministic padding while preserving the original article."""
    return LEGACY_LONGFORM_RE.subn("", html)


def sanitized_page_record(html: str, slug: str, origin: str, source_path: str) -> dict:
    """Materialize the real legacy source as a draft, even when it is thin.

    The publication gate remains responsible for blocking thin material from going
    live. This recovery step must not re-introduce generated padding merely to pass
    a migration-time word-count threshold.
    """
    cleaned_html, removed_count = strip_legacy_generated_longform(html)

    meta = base.MetaParser()
    meta.feed(cleaned_html)
    article = base.ArticleParser()
    article.feed(cleaned_html)
    blocks = article.blocks
    faqs = base.faq_from_json_ld(meta.json_ld)
    if faqs:
        blocks.append({"type": "heading", "level": 2, "text": "أسئلة شائعة"})
        blocks.append({"type": "faq", "items": faqs})

    citation_set = base.citation_urls(meta.json_ld)
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

    body_text = "\n\n".join(base.clean(x) for x in body_parts if base.clean(x))
    word_count = len(re.findall(r"[\w\u0600-\u06FF]+", body_text, flags=re.UNICODE))

    title = meta.meta.get("og:title") or re.sub(
        r"\s*\|\s*معلومات سريعة\s*$", "", meta.title
    ).strip()
    description = meta.meta.get("description") or meta.meta.get("og:description") or ""
    canonical = meta.canonical or f"{base.SITE}/quick-info/{slug}/"
    published = meta.meta.get("article:published_time") or "2026-08-04T00:00:00+03:00"
    modified = meta.meta.get("article:modified_time") or published
    source_hash = base.hashlib.sha256(cleaned_html.encode("utf-8")).hexdigest()

    if canonical != f"{base.SITE}/quick-info/{slug}/":
        raise ValueError(f"canonical mismatch for {slug}: {canonical}")
    if not title or not description:
        raise ValueError(f"missing title/description for {slug}")
    if not body_text:
        raise ValueError(f"empty sanitized body for {slug}")
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
            "legacy_generated_longform_removed": removed_count > 0,
            "legacy_generated_longform_removed_count": removed_count,
            "legacy_sanitizer_version": 2,
            "legacy_source_thin_after_sanitization": word_count < 500,
            "publication_ready": False,
            "editorial_review_required": True,
        },
        "featured_image_url": f"{base.SITE}/assets/quick-info/cards/{slug}.png",
        "featured_image_alt": title,
        "published_at": published,
        "updated_at": modified,
        "search_aliases": [],
        "primary_keyword": title,
        "secondary_keywords": [],
        "semantic_terms": [],
        "search_intent": "informational",
        "author_display_name": "منصة روافد",
        "references_json": references[:50],
        "medical_disclaimer": base.DISCLAIMER,
    }


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
