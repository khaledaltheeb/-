#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

from legacy_content_extract import BASE_URL, clean, discover_urls, parse_page

HTML_SUFFIXES = {'.html', '.htm'}
TEXT_RESOURCE_SUFFIXES = {'.json', '.xml', '.csv', '.txt', '.md'}
BINARY_RESOURCE_SUFFIXES = {'.pdf'}
RESOURCE_SUFFIXES = TEXT_RESOURCE_SUFFIXES | BINARY_RESOURCE_SUFFIXES

# These paths are preserved in the ledger but are never assumed to be public pages.
INTERNAL_ROOT_PREFIXES = (
    '.git/', '.github/', '.generator', '.comparisons', '.v', '.home-', '.cache/',
    'node_modules/', 'scripts/', 'supabase/', 'docs/', 'tests/', 'test/',
)

STRONG_DEVELOPMENT_PATH_PARTS = {
    'dev', 'development', 'design', 'design-system', 'theme', 'themes', 'preview',
    'demo', 'demos', 'mock', 'mocks', 'fixture', 'fixtures', 'test', 'tests',
    'staging', 'prototype', 'prototypes', 'prompt', 'prompts', 'workflow',
    'workflows', 'migration', 'migrations', 'baseline', 'baselines', 'scaffold',
    'skeleton', 'template', 'templates', 'debug', 'admin-dev', 'qa',
}

DEVELOPMENT_PHRASES = (
    'design system', 'theme preview', 'developer note', 'development note',
    'implementation note', 'migration note', 'github actions', 'ci/cd',
    'environment variable', 'todo:', 'fixme:', 'placeholder', 'baseline',
    'scaffold', 'skeleton', 'demo page', 'test page', 'staging page',
    'prompt:', 'agent instruction', 'generated template',
    'نظام التصميم', 'معاينة التصميم', 'ملاحظة للمطور', 'ملاحظات التطوير',
    'تعليمات التطوير', 'تعليمات التنفيذ', 'صفحة تجريبية', 'نسخة تجريبية',
    'قالب تجريبي', 'قيد التطوير', 'لأغراض التطوير', 'خط أساس',
)

BASELINE_PHRASES = (
    'baseline', 'scaffold', 'skeleton', 'starter template', 'placeholder content',
    'sample content', 'demo content', 'mock content',
    'خط أساس', 'هيكل أولي', 'قالب أولي', 'محتوى تجريبي', 'محتوى مؤقت',
)

YMYL_HINTS = (
    'health', 'medical', 'psych', 'mental', 'therapy', 'treatment', 'diagnos',
    'disorder', 'condition', 'medication', 'drug', 'addiction', 'assessment',
    'symptom', 'clinical', 'wellbeing', 'care-guides',
    'صحة', 'نفسي', 'علاج', 'تشخيص', 'اضطراب', 'دواء', 'أدوية', 'إدمان',
    'تقييم', 'أعراض', 'سريري', 'طبي',
)


def sha256_bytes(payload: bytes) -> str:
    return hashlib.sha256(payload).hexdigest()


def normalized_text_hash(text: str) -> str:
    normalized = clean(text).lower()
    return hashlib.sha256(normalized.encode('utf-8')).hexdigest() if normalized else ''


def repo_file_to_public_path(rel: str) -> str | None:
    rel = rel.replace('\\', '/').lstrip('./')
    lower = rel.lower()
    if not rel or any(lower.startswith(prefix) for prefix in INTERNAL_ROOT_PREFIXES):
        return None
    if lower == 'index.html' or lower == 'index.htm':
        return '/'
    if lower.endswith('/index.html'):
        base = rel[:-len('index.html')]
        return '/' + base.strip('/') + '/'
    if lower.endswith('/index.htm'):
        base = rel[:-len('index.htm')]
        return '/' + base.strip('/') + '/'
    suffix = Path(rel).suffix.lower()
    if suffix in HTML_SUFFIXES:
        return '/' + rel[: -len(suffix)].strip('/') + '/'
    if suffix in RESOURCE_SUFFIXES:
        return '/' + rel.strip('/')
    return None


def is_internal_source(rel: str) -> bool:
    lower = rel.replace('\\', '/').lower().lstrip('./')
    return any(lower.startswith(prefix) for prefix in INTERNAL_ROOT_PREFIXES)


def path_parts(rel: str) -> set[str]:
    return {part.lower() for part in Path(rel).parts}


def count_phrase_hits(text: str, phrases: tuple[str, ...]) -> list[str]:
    lowered = text.lower()
    return [phrase for phrase in phrases if phrase.lower() in lowered]


def infer_ymyl(rel: str, title: str, h1: str, text: str) -> bool:
    probe = ' '.join([rel, title, h1, text[:1500]]).lower()
    return any(hint.lower() in probe for hint in YMYL_HINTS)


def classify_html(record: dict[str, Any]) -> tuple[str, list[str], list[str]]:
    rel = str(record.get('source_file') or '')
    title = str(record.get('title') or '')
    h1 = str(record.get('h1') or '')
    body = str(record.get('body_text') or '')
    word_count = int(record.get('word_count') or 0)
    parts = path_parts(rel)
    probe = ' '.join([rel, title, h1, body[:5000]])
    dev_hits = count_phrase_hits(probe, DEVELOPMENT_PHRASES)
    baseline_hits = count_phrase_hits(probe, BASELINE_PHRASES)
    strong_dev_path = bool(parts & STRONG_DEVELOPMENT_PATH_PARTS) or is_internal_source(rel)
    reasons: list[str] = []
    warnings: list[str] = []

    if strong_dev_path and (dev_hits or is_internal_source(rel)):
        reasons.append('strong development/internal path evidence')
        if dev_hits:
            reasons.append('development phrases: ' + ', '.join(sorted(set(dev_hits))[:8]))
        return 'DEVELOPMENT_ONLY', reasons, warnings

    if baseline_hits and (word_count < 900 or parts & {'baseline', 'baselines', 'scaffold', 'skeleton', 'demo', 'preview'}):
        reasons.append('baseline/template evidence without sufficient standalone editorial depth')
        reasons.append('baseline phrases: ' + ', '.join(sorted(set(baseline_hits))[:8]))
        return 'BASELINE_ONLY', reasons, warnings

    if word_count == 0:
        reasons.append('no extractable editorial body')
        return 'SOURCE_ONLY', reasons, warnings

    if word_count < 250:
        reasons.append(f'thin editorial body: {word_count} words')
        return 'PUBLISHABLE_AFTER_REPAIR', reasons, warnings

    if not title:
        warnings.append('missing title')
    if not h1:
        warnings.append('missing H1')
    if not record.get('meta_description'):
        warnings.append('missing meta description')
    if str(record.get('robots') or '').lower().find('noindex') >= 0:
        warnings.append('legacy noindex requires explicit publication review')
    if record.get('ymyl') and not record.get('references'):
        warnings.append('YMYL candidate without extracted external references')
    if word_count < 700:
        warnings.append(f'editorial depth requires review: {word_count} words')

    if warnings:
        reasons.append('valuable editorial content retained but release gates remain')
        return 'PUBLISHABLE_AFTER_REPAIR', reasons, warnings

    reasons.append('substantive editorial content with no hard exclusion signal')
    return 'PUBLISHABLE', reasons, warnings


def read_text(path: Path) -> str:
    return path.read_text(encoding='utf-8', errors='ignore')


def sitemap_evidence(root: Path) -> tuple[set[str], dict[str, str], list[str]]:
    urls, sitemaps = discover_urls(root)
    paths: dict[str, str] = {}
    for url in urls:
        parsed = urlparse(url)
        path = parsed.path or '/'
        if path != '/' and not Path(path).suffix and not path.endswith('/'):
            path += '/'
        paths[path] = url
    return set(urls), paths, sitemaps


def main() -> int:
    parser = argparse.ArgumentParser(description='Build a full-repository Rawafid legacy migration ledger.')
    parser.add_argument('legacy_root', type=Path)
    parser.add_argument('--output', type=Path, default=Path('artifacts/full-legacy-migration-ledger.json'))
    parser.add_argument('--summary', type=Path, default=Path('artifacts/full-legacy-migration-summary.json'))
    parser.add_argument('--review-queue', type=Path, default=Path('artifacts/full-legacy-review-queue.json'))
    parser.add_argument('--publishable', type=Path, default=Path('artifacts/full-legacy-publishable.json'))
    args = parser.parse_args()

    root = args.legacy_root.resolve()
    if not root.is_dir():
        raise SystemExit(f'legacy root not found: {root}')

    sitemap_urls, sitemap_paths, sitemaps = sitemap_evidence(root)
    records: list[dict[str, Any]] = []
    html_records: list[dict[str, Any]] = []
    resource_records: list[dict[str, Any]] = []

    candidates = [
        path for path in root.rglob('*')
        if path.is_file() and path.suffix.lower() in (HTML_SUFFIXES | RESOURCE_SUFFIXES)
    ]

    for path in sorted(candidates):
        rel = path.relative_to(root).as_posix()
        suffix = path.suffix.lower()
        public_path = repo_file_to_public_path(rel)
        sitemap_url = sitemap_paths.get(public_path or '') if public_path else None
        base: dict[str, Any] = {
            'source_repo': 'khaledaltheeb/healthrenewal.org',
            'source_file': rel,
            'source_size_bytes': path.stat().st_size,
            'source_sha256': sha256_bytes(path.read_bytes()),
            'derived_public_path': public_path,
            'sitemap_url': sitemap_url,
            'in_sitemap': bool(sitemap_url),
            'internal_source_path': is_internal_source(rel),
        }

        if suffix in RESOURCE_SUFFIXES:
            record = {
                **base,
                'kind': 'resource',
                'resource_type': suffix.lstrip('.'),
                'migration_state': 'SOURCE_ONLY',
                'decision_reasons': ['non-HTML source/resource preserved for provenance and content recovery'],
                'review_warnings': [],
            }
            resource_records.append(record)
            records.append(record)
            continue

        html = read_text(path)
        page_url = sitemap_url or (BASE_URL.rstrip('/') + (public_path or '/'))
        page = parse_page(html, page_url)
        text = clean(' '.join(page.all_text))
        external_links = [link for link in page.links if link.get('kind') == 'external']
        internal_links = [link for link in page.links if link.get('kind') == 'internal']
        word_count = len(text.split())
        ymyl = infer_ymyl(rel, page.title, page.h1, text)
        record = {
            **base,
            'kind': 'html',
            'title': page.title,
            'h1': page.h1,
            'meta_description': page.description,
            'canonical': page.canonical,
            'robots': page.robots,
            'word_count': word_count,
            'body_text_hash': normalized_text_hash(text),
            'body_text': text,
            'body_json': {'blocks': page.blocks},
            'references': external_links,
            'internal_links': internal_links,
            'images': page.images,
            'ymyl': ymyl,
            'legacy_asset_refs': {
                'stylesheets': len(re.findall(r'<link[^>]+stylesheet', html, re.I)),
                'scripts': len(re.findall(r'<script\b', html, re.I)),
                'inline_styles': len(re.findall(r'<style\b', html, re.I)),
            },
        }
        state, reasons, warnings = classify_html(record)
        record['migration_state'] = state
        record['decision_reasons'] = reasons
        record['review_warnings'] = warnings
        html_records.append(record)
        records.append(record)

    # Exact semantic duplicates are safe to identify automatically, but not to delete.
    by_body_hash: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for record in html_records:
        body_hash = str(record.get('body_text_hash') or '')
        if body_hash and int(record.get('word_count') or 0) >= 120:
            by_body_hash[body_hash].append(record)

    duplicate_clusters: list[dict[str, Any]] = []
    for body_hash, cluster in sorted(by_body_hash.items()):
        if len(cluster) < 2:
            continue
        ranked = sorted(
            cluster,
            key=lambda row: (
                not bool(row.get('in_sitemap')),
                bool(row.get('internal_source_path')),
                -int(row.get('word_count') or 0),
                str(row.get('source_file') or ''),
            ),
        )
        representative = ranked[0]
        cluster_item = {
            'body_text_hash': body_hash,
            'representative_source_file': representative.get('source_file'),
            'members': [row.get('source_file') for row in ranked],
        }
        duplicate_clusters.append(cluster_item)
        for duplicate in ranked[1:]:
            if duplicate.get('migration_state') in {'PUBLISHABLE', 'PUBLISHABLE_AFTER_REPAIR'}:
                duplicate['migration_state'] = 'DUPLICATE_NO_UNIQUE_VALUE'
                duplicate['decision_reasons'] = [
                    'exact normalized editorial body duplicate',
                    f"representative: {representative.get('source_file')}",
                ]
                duplicate['review_warnings'] = []

    state_counts = Counter(str(record.get('migration_state')) for record in records)
    public_html = [row for row in html_records if row.get('in_sitemap')]
    orphan_html = [row for row in html_records if not row.get('in_sitemap') and not row.get('internal_source_path')]
    internal_html = [row for row in html_records if row.get('internal_source_path')]
    publishable = [row for row in html_records if row.get('migration_state') == 'PUBLISHABLE']
    review_queue = [
        row for row in html_records
        if row.get('migration_state') in {'PUBLISHABLE_AFTER_REPAIR', 'MERGE_SOURCE'}
    ]

    sitemap_source_paths = {str(row.get('derived_public_path')) for row in html_records if row.get('in_sitemap')}
    missing_sitemap_urls = sorted(
        url for url in sitemap_urls
        if (urlparse(url).path or '/') not in sitemap_source_paths
        and ((urlparse(url).path or '/') + ('/' if not (urlparse(url).path or '/').endswith('/') and not Path(urlparse(url).path or '/').suffix else '')) not in sitemap_source_paths
    )

    summary = {
        'source_repo': 'khaledaltheeb/healthrenewal.org',
        'source_read_only': True,
        'sitemaps': sitemaps,
        'sitemap_url_count': len(sitemap_urls),
        'scanned_artifact_count': len(records),
        'html_artifact_count': len(html_records),
        'resource_artifact_count': len(resource_records),
        'sitemap_html_count': len(public_html),
        'non_sitemap_public_path_html_count': len(orphan_html),
        'internal_or_historical_html_count': len(internal_html),
        'exact_duplicate_cluster_count': len(duplicate_clusters),
        'migration_state_counts': dict(sorted(state_counts.items())),
        'publishable_count': len(publishable),
        'review_queue_count': len(review_queue),
        'sitemap_urls_without_scanned_html_count': len(missing_sitemap_urls),
        'sitemap_urls_without_scanned_html': missing_sitemap_urls,
        'completion_contract': {
            'every_scanned_artifact_has_state': all(bool(row.get('migration_state')) for row in records),
            'development_and_baseline_not_publishable': all(
                row.get('migration_state') not in {'PUBLISHABLE'}
                for row in html_records
                if row.get('migration_state') in {'DEVELOPMENT_ONLY', 'BASELINE_ONLY'}
            ),
            'publication_is_separate_from_preservation': True,
            'legacy_css_js_layout_are_not_destination_payload': True,
            'automatic_classifier_never_publishes_to_supabase': True,
        },
    }

    payload = {
        'summary': summary,
        'duplicate_clusters': duplicate_clusters,
        'records': records,
    }
    for target in (args.output, args.summary, args.review_queue, args.publishable):
        target.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    args.summary.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    args.review_queue.write_text(json.dumps({'records': review_queue}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    args.publishable.write_text(json.dumps({'records': publishable}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(summary, ensure_ascii=False, indent=2))

    if not records:
        raise SystemExit('full legacy inventory is empty')
    if any(not row.get('migration_state') for row in records):
        raise SystemExit('one or more legacy artifacts have no migration state')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
