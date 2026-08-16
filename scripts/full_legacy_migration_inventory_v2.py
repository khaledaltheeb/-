#!/usr/bin/env python3
from __future__ import annotations

from pathlib import Path
import full_legacy_migration_inventory as base

DEVELOPMENT_TOP_LEVEL = {
    'developers', 'developer', 'provider-assessment-demo', '_audit', 'validation',
    'github', 'reports', 'tests', 'test', 'demo', 'demos', 'staging', 'preview',
}

STRICT_DEVELOPMENT_PREFIXES = (
    '.github/', 'scripts/', 'docs/', 'tests/', 'test/', 'node_modules/',
    'supabase/', '.cache/',
)


def _normalize_rel(rel: str) -> str:
    value = rel.replace('\\', '/')
    while value.startswith('./'):
        value = value[2:]
    return value.lstrip('/')


def fixed_is_internal_source(rel: str) -> bool:
    lower = _normalize_rel(rel).lower()
    return any(lower.startswith(prefix) for prefix in base.INTERNAL_ROOT_PREFIXES)


def fixed_repo_file_to_public_path(rel: str) -> str | None:
    rel = _normalize_rel(rel)
    lower = rel.lower()
    if not rel or fixed_is_internal_source(rel):
        return None
    if lower in {'index.html', 'index.htm'}:
        return '/'
    if lower.endswith('/index.html'):
        return '/' + rel[:-len('index.html')].strip('/') + '/'
    if lower.endswith('/index.htm'):
        return '/' + rel[:-len('index.htm')].strip('/') + '/'
    suffix = Path(rel).suffix.lower()
    if suffix in base.HTML_SUFFIXES:
        # Historical .html routes are real URLs and must keep the extension.
        return '/' + rel.strip('/')
    if suffix in base.RESOURCE_SUFFIXES:
        return '/' + rel.strip('/')
    return None


_original_classify_html = base.classify_html


def hardened_classify_html(record):
    rel = _normalize_rel(str(record.get('source_file') or ''))
    lower = rel.lower()
    first = rel.split('/', 1)[0].lower() if rel else ''

    # True engineering/development trees are never publication candidates.
    if any(lower.startswith(prefix) for prefix in STRICT_DEVELOPMENT_PREFIXES):
        return (
            'DEVELOPMENT_ONLY',
            ['engineering/development source tree; preserve for provenance only'],
            [],
        )

    if first in DEVELOPMENT_TOP_LEVEL:
        return (
            'DEVELOPMENT_ONLY',
            [f'development/demo/report route family: {first}'],
            [],
        )

    # Hidden/versioned release bundles may contain knowledge that disappeared from
    # the latest public surface. Preserve their extracted text as historical source
    # material so later semantic comparison can recover unique facts, but never
    # auto-publish the old wrapper/layout itself.
    if fixed_is_internal_source(rel):
        return (
            'SOURCE_ONLY',
            ['historical/versioned source tree; compare unique knowledge before closeout'],
            ['not eligible for automatic publication'],
        )

    state, reasons, warnings = _original_classify_html(record)

    # User-facing development pages can be substantial but still must never be
    # auto-published as knowledge content.
    title_probe = ' '.join([
        str(record.get('title') or ''),
        str(record.get('h1') or ''),
        rel,
    ]).lower()
    if any(token in title_probe for token in (
        'design system', 'theme preview', 'developer', 'development page',
        'صفحة تطوير', 'نظام التصميم', 'معاينة التصميم',
    )):
        return 'DEVELOPMENT_ONLY', ['development/design page identity'], []

    return state, reasons, warnings


base.is_internal_source = fixed_is_internal_source
base.repo_file_to_public_path = fixed_repo_file_to_public_path
base.classify_html = hardened_classify_html

if __name__ == '__main__':
    raise SystemExit(base.main())
