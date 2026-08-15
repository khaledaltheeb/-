#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise SystemExit('payload root must be an object')
    return value


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('payload', type=Path)
    parser.add_argument('--min-words', type=int, default=2400)
    args = parser.parse_args()

    payload = load(args.payload)
    records = payload.get('records')
    if not isinstance(records, list) or not records:
        raise SystemExit('payload records must be a non-empty array')

    errors: list[str] = []
    canonicals: set[str] = set()
    slugs: set[str] = set()
    for raw in records:
        if not isinstance(raw, dict):
            errors.append('record is not an object')
            continue
        source = str(raw.get('source_path') or '')
        canonical = str(raw.get('canonical_url') or '')
        slug = str(raw.get('slug') or '')
        body_text = str(raw.get('body_text') or '').strip()
        words = len(body_text.split())
        refs = raw.get('references_json') if isinstance(raw.get('references_json'), list) else []
        schema = raw.get('schema_json') if isinstance(raw.get('schema_json'), dict) else {}

        if not source.startswith('/special-needs/') and source != '/special-needs/':
            errors.append(f'{slug}: source outside /special-needs/')
        if canonical != source:
            errors.append(f'{slug}: canonical must preserve source path exactly')
        if raw.get('redirect') is not None:
            errors.append(f'{slug}: redirect is forbidden for native special-needs migration')
        if words < args.min_words:
            errors.append(f'{slug}: only {words} words (<{args.min_words})')
        if len(refs) < 3:
            errors.append(f'{slug}: only {len(refs)} preserved references (<3)')
        if schema.get('legacy_source_sha256') in (None, ''):
            errors.append(f'{slug}: legacy source provenance missing')
        if schema.get('references_preserved') is not True:
            errors.append(f'{slug}: references_preserved flag missing')
        if canonical in canonicals:
            errors.append(f'{slug}: duplicate canonical {canonical}')
        canonicals.add(canonical)
        if slug in slugs:
            errors.append(f'duplicate slug {slug}')
        slugs.add(slug)

    summary = {
        'status': 'failed' if errors else 'passed',
        'record_count': len(records),
        'min_words_required': args.min_words,
        'minimum_words_observed': min(len(str(r.get('body_text') or '').split()) for r in records if isinstance(r, dict)),
        'minimum_references_observed': min(len(r.get('references_json') or []) for r in records if isinstance(r, dict)),
        'same_route_count': sum(1 for r in records if isinstance(r, dict) and r.get('canonical_url') == r.get('source_path')),
        'redirect_count': sum(1 for r in records if isinstance(r, dict) and r.get('redirect') is not None),
        'errors': errors,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
