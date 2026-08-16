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
    parser.add_argument('--target-words', type=int, default=2400)
    parser.add_argument('--target-references', type=int, default=3)
    args = parser.parse_args()

    payload = load(args.payload)
    records = payload.get('records')
    if not isinstance(records, list) or not records:
        raise SystemExit('payload records must be a non-empty array')

    errors: list[str] = []
    warnings: list[str] = []
    canonicals: set[str] = set()
    slugs: set[str] = set()
    word_counts: list[int] = []
    reference_counts: list[int] = []

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
        word_counts.append(words)
        reference_counts.append(len(refs))

        if not source.startswith('/special-needs/') and source != '/special-needs/':
            errors.append(f'{slug}: source outside /special-needs/')
        if canonical != source:
            errors.append(f'{slug}: canonical must preserve source path exactly')
        if raw.get('redirect') is not None:
            errors.append(f'{slug}: redirect is forbidden for native special-needs migration')
        if not body_text and not (isinstance(raw.get('body_json'), dict) and raw['body_json'].get('blocks')):
            errors.append(f'{slug}: no transferable body content')

        if words < args.target_words:
            warnings.append(f'{slug}: {words} words below editorial target {args.target_words}; transfer is still accepted')
        if len(refs) < args.target_references:
            warnings.append(f'{slug}: {len(refs)} references below editorial target {args.target_references}; evidence review remains pending')
        if schema.get('legacy_source_sha256') in (None, ''):
            warnings.append(f'{slug}: legacy source provenance hash missing; repair before indexed release')
        if schema.get('references_preserved') is not True:
            warnings.append(f'{slug}: references_preserved flag missing; verify before indexed release')

        if canonical in canonicals:
            errors.append(f'{slug}: duplicate canonical {canonical}')
        canonicals.add(canonical)
        if slug in slugs:
            errors.append(f'duplicate slug {slug}')
        slugs.add(slug)

    summary = {
        'status': 'failed' if errors else 'passed',
        'transfer_policy': 'mandatory-preservation-no-length-floor',
        'record_count': len(records),
        'editorial_word_target': args.target_words,
        'editorial_reference_target': args.target_references,
        'minimum_words_observed': min(word_counts, default=0),
        'minimum_references_observed': min(reference_counts, default=0),
        'below_word_target': sum(1 for value in word_counts if value < args.target_words),
        'below_reference_target': sum(1 for value in reference_counts if value < args.target_references),
        'same_route_count': sum(1 for r in records if isinstance(r, dict) and r.get('canonical_url') == r.get('source_path')),
        'redirect_count': sum(1 for r in records if isinstance(r, dict) and r.get('redirect') is not None),
        'transfer_blocked_by_length': 0,
        'error_count': len(errors),
        'warning_count': len(warnings),
        'errors': errors,
        'warnings': warnings,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
