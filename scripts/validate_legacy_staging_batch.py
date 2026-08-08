#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

SHA_RE = re.compile(r'^[0-9a-f]{64}$')
FORBIDDEN = ('معاقين', '<script', '<style', 'javascript:', 'stylesheet')


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8'))


def stable_bytes(value: Any) -> bytes:
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('directory', type=Path)
    parser.add_argument('--expected-records', type=int, required=True)
    parser.add_argument('--source-prefix', required=True)
    args = parser.parse_args()

    manifest = load(args.directory / 'manifest.json')
    errors: list[str] = []
    records: list[dict[str, Any]] = []
    for chunk in manifest.get('chunks', []):
        path = args.directory / str(chunk['file'])
        payload = load(path)
        chunk_records = payload.get('records')
        if not isinstance(chunk_records, list):
            errors.append(f'{path.name}: records must be an array')
            continue
        expected_sha = str(payload.get('records_sha256') or '')
        actual_sha = hashlib.sha256(stable_bytes(chunk_records)).hexdigest()
        if expected_sha != actual_sha or chunk.get('records_sha256') != actual_sha:
            errors.append(f'{path.name}: checksum mismatch')
        if int(payload.get('record_count', -1)) != len(chunk_records) or int(chunk.get('record_count', -1)) != len(chunk_records):
            errors.append(f'{path.name}: record_count mismatch')
        records.extend(chunk_records)

    if len(records) != args.expected_records or int(manifest.get('record_count', -1)) != len(records):
        errors.append(f'record count mismatch: got {len(records)}, expected {args.expected_records}')
    all_sha = hashlib.sha256(stable_bytes(records)).hexdigest()
    if manifest.get('records_sha256') != all_sha:
        errors.append('manifest records_sha256 mismatch')

    slugs: set[str] = set()
    sources: set[str] = set()
    total_words = 0
    total_blocks = 0
    total_refs = 0
    for row in records:
        source = str(row.get('source_path') or '')
        slug = str(row.get('slug') or '')
        prefix = f'{source or slug}: '
        if not (source == f'/{args.source_prefix}/' or source.startswith(f'/{args.source_prefix}/')):
            errors.append(prefix + 'source path outside requested prefix')
        if source in sources:
            errors.append(prefix + 'duplicate source path')
        sources.add(source)
        if not slug or slug in slugs:
            errors.append(prefix + 'missing or duplicate target slug')
        slugs.add(slug)
        if row.get('status') != 'draft':
            errors.append(prefix + 'staging record must remain draft')
        if row.get('robots_index') is not False or row.get('robots_follow') is not False:
            errors.append(prefix + 'staging record must remain noindex/nofollow')
        if row.get('canonical_url') != f'/content/{slug}':
            errors.append(prefix + 'canonical must use V3 content renderer')
        if row.get('sector_slug') != 'knowledge' or row.get('category_slug') != 'legacy-migration-staging':
            errors.append(prefix + 'staging taxonomy contract mismatch')
        schema = row.get('schema_json') if isinstance(row.get('schema_json'), dict) else {}
        source_sha = str(schema.get('legacy_source_sha256') or '')
        if not SHA_RE.fullmatch(source_sha):
            errors.append(prefix + 'legacy source checksum missing')
        source_words = int(schema.get('legacy_source_word_count') or 0)
        total_words += source_words
        if source_words < 1000:
            errors.append(prefix + f'long-form staging requires >=1000 source words; got {source_words}')
        if schema.get('migration_stage') != 'staging-draft' or schema.get('content_only') is not True:
            errors.append(prefix + 'migration staging provenance missing')
        if any(schema.get(key) is not False for key in ('legacy_theme_copied','legacy_css_copied','legacy_js_copied')):
            errors.append(prefix + 'legacy runtime/theme copy flag is not false')
        blocks = ((row.get('body_json') or {}).get('blocks') if isinstance(row.get('body_json'), dict) else None)
        if not isinstance(blocks, list) or len(blocks) < 10:
            errors.append(prefix + 'structured body is unexpectedly small')
        else:
            total_blocks += len(blocks)
        refs = row.get('references_json') if isinstance(row.get('references_json'), list) else []
        total_refs += len(refs)
        searchable = json.dumps(row, ensure_ascii=False).lower()
        for token in FORBIDDEN:
            if token.lower() in searchable:
                errors.append(prefix + f'forbidden token found: {token}')
                break

    if errors:
        print(json.dumps({'status':'failed','error_count':len(errors),'errors':errors[:100]}, ensure_ascii=False, indent=2))
        raise SystemExit(1)
    print(json.dumps({
        'status':'passed',
        'batch_id':manifest.get('batch_id'),
        'records':len(records),
        'chunks':len(manifest.get('chunks', [])),
        'records_sha256':all_sha,
        'total_source_words':total_words,
        'total_body_blocks':total_blocks,
        'total_external_references':total_refs,
        'draft_only':True,
        'noindex_nofollow':True,
        'legacy_theme_copied':False,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
