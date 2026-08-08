#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

SLUG_RE = re.compile(r'[^a-z0-9-]+')


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8'))


def stable_bytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def target_slug(prefix: str, source_path: str) -> str:
    clean_path = source_path.strip('/')
    if clean_path == prefix:
        return f'{prefix}-hub'
    leaf = clean_path.split('/')[-1].removesuffix('.html').removesuffix('.htm')
    leaf = SLUG_RE.sub('-', leaf.lower()).strip('-')
    return f'{prefix}-{leaf}'


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('inventory', type=Path)
    parser.add_argument('coverage', type=Path)
    parser.add_argument('config', type=Path)
    parser.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args()

    inventory = load(args.inventory)
    coverage = load(args.coverage)
    config = load(args.config)
    by_path = {str(item.get('path') or ''): item for item in inventory.get('records', [])}
    wanted_prefix = str(config['source_prefix']).strip('/')
    expected = int(config['expected_record_count'])
    chunk_size = int(config.get('chunk_size', 20))
    batch_id = str(config['batch_id'])

    selected_paths = sorted(
        item['source_path']
        for item in coverage.get('coverage', [])
        if item.get('kind') != 'resource'
        and item.get('status') == 'unmapped'
        and (item.get('source_path') == f'/{wanted_prefix}/' or str(item.get('source_path') or '').startswith(f'/{wanted_prefix}/'))
    )
    if len(selected_paths) != expected:
        raise SystemExit(f'Expected {expected} unmapped {wanted_prefix} pages, found {len(selected_paths)}')

    records: list[dict[str, Any]] = []
    seen_slugs: set[str] = set()
    seen_sources: set[str] = set()
    for source_path in selected_paths:
        source = by_path.get(source_path)
        if not source or source.get('kind') != 'html' or not source.get('html_exists'):
            raise SystemExit(f'Missing extracted HTML source for {source_path}')
        slug = target_slug(wanted_prefix, source_path)
        if slug in seen_slugs:
            raise SystemExit(f'Duplicate target slug: {slug}')
        if source_path in seen_sources:
            raise SystemExit(f'Duplicate source path: {source_path}')
        seen_slugs.add(slug)
        seen_sources.add(source_path)
        title = str(source.get('h1') or source.get('title') or '').strip()
        if not title:
            raise SystemExit(f'Missing title for {source_path}')
        refs = [
            {
                'title': str(item.get('label') or item.get('href') or '').strip()[:400],
                'url': str(item.get('href') or '').strip(),
            }
            for item in source.get('references', [])
            if str(item.get('href') or '').startswith('https://')
        ]
        record = {
            'source_path': source_path,
            'status': 'draft',
            'content_type': 'article',
            'slug': slug,
            'title': title,
            'excerpt': source.get('meta_description'),
            'body_json': source.get('body_json') or {'blocks': []},
            'body_text': source.get('body_text'),
            'sector_slug': config['sector_slug'],
            'category_slug': config['category_slug'],
            'audience': config.get('audience', []),
            'author_display_name': config.get('author_display_name', 'فريق تحرير منصة روافد'),
            'seo_title': source.get('title') or title,
            'seo_description': source.get('meta_description'),
            'canonical_url': f'/content/{slug}',
            'robots_index': False,
            'robots_follow': False,
            'primary_keyword': title.split('|', 1)[0].strip(),
            'secondary_keywords': [],
            'semantic_terms': [],
            'search_aliases': [title, source_path.strip('/').split('/')[-1]],
            'search_intent': 'informational',
            'references_json': refs,
            'medical_disclaimer': config.get('medical_disclaimer'),
            'schema_json': {
                'migration_source_repo': 'khaledaltheeb/healthrenewal.org',
                'legacy_source_url': source.get('url'),
                'legacy_source_path': source_path,
                'legacy_source_sha256': source.get('sha256'),
                'legacy_source_word_count': source.get('word_count'),
                'legacy_source_html': source.get('source_html'),
                'legacy_canonical': source.get('canonical'),
                'legacy_internal_links': source.get('internal_links', []),
                'legacy_image_inventory': (source.get('legacy_asset_refs') or {}).get('images', []),
                'structured_sources': source.get('structured_sources', []),
                'batch_id': batch_id,
                'migration_stage': 'staging-draft',
                'publication_guard': 'requires-final-taxonomy-seo-editorial-review',
                'content_only': True,
                'legacy_theme_copied': False,
                'legacy_css_copied': False,
                'legacy_js_copied': False,
                'references_preserved': True,
            },
        }
        records.append(record)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    for old in args.output_dir.glob('chunk-*.json'):
        old.unlink()
    chunks: list[dict[str, Any]] = []
    for offset in range(0, len(records), chunk_size):
        chunk_records = records[offset:offset + chunk_size]
        chunk_no = offset // chunk_size + 1
        filename = f'chunk-{chunk_no:03d}.json'
        payload = {
            'batch_id': batch_id,
            'chunk': chunk_no,
            'record_count': len(chunk_records),
            'records': chunk_records,
        }
        payload['records_sha256'] = hashlib.sha256(stable_bytes(chunk_records)).hexdigest()
        (args.output_dir / filename).write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        chunks.append({
            'file': filename,
            'chunk': chunk_no,
            'record_count': len(chunk_records),
            'records_sha256': payload['records_sha256'],
        })

    all_sha = hashlib.sha256(stable_bytes(records)).hexdigest()
    manifest = {
        'batch_id': batch_id,
        'source_prefix': wanted_prefix,
        'source_repo': 'khaledaltheeb/healthrenewal.org',
        'destination_repo': 'khaledaltheeb/-',
        'record_count': len(records),
        'chunk_size': chunk_size,
        'chunk_count': len(chunks),
        'records_sha256': all_sha,
        'contract': {
            'draft_only': True,
            'redirects_created': False,
            'robots_index': False,
            'legacy_theme_copied': False,
            'legacy_css_copied': False,
            'legacy_js_copied': False,
            'references_preserved': True,
            'final_taxonomy_required_before_publish': True,
            'release_seo_review_required_before_publish': True,
        },
        'chunks': chunks,
    }
    (args.output_dir / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'batch_id': batch_id,
        'record_count': len(records),
        'chunk_count': len(chunks),
        'records_sha256': all_sha,
        'min_source_words': min(int(row['schema_json'].get('legacy_source_word_count') or 0) for row in records),
        'max_source_words': max(int(row['schema_json'].get('legacy_source_word_count') or 0) for row in records),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
