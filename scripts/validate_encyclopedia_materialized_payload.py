#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

from materialize_encyclopedia_draft import body_text_from_blocks, normalized_records

SHA256_RE = re.compile(r'^[0-9a-f]{64}$')
SLUG_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
WORD_RE = re.compile(r'[\u0600-\u06ffA-Za-z0-9]+')


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise SystemExit(f'expected JSON object: {path}')
    return value


def validate(payload_path: Path) -> dict[str, Any]:
    payload = load(payload_path)
    errors: list[str] = []

    def fail(message: str) -> None:
        errors.append(message)

    if payload.get('version') != 2:
        fail('payload version must be 2 for unified encyclopedia route slugs')
    if payload.get('publication_ready') is not False:
        fail('materialized payload must remain publication_ready=false')
    source_sha = str(payload.get('source_draft_sha256') or '')
    if not SHA256_RE.fullmatch(source_sha):
        fail('source_draft_sha256 missing or invalid')

    records = payload.get('records')
    if not isinstance(records, list) or len(records) != 1:
        fail('materialized first-wave payload must contain exactly one record')
        records = records if isinstance(records, list) else []

    expected_sha = str(payload.get('records_sha256') or '')
    actual_sha = hashlib.sha256(normalized_records(records)).hexdigest()
    if expected_sha != actual_sha:
        fail(f'records checksum mismatch: expected={expected_sha} actual={actual_sha}')
    if payload.get('record_count') != len(records):
        fail('record_count does not match records')

    for row in records:
        if not isinstance(row, dict):
            fail('record must be an object')
            continue
        slug = str(row.get('slug') or '').strip()
        if row.get('content_type') != 'condition':
            fail(f'{slug}: content_type must be condition')
        if not SLUG_RE.fullmatch(slug) or slug.startswith('encyclopedia-'):
            fail(f'{slug}: record slug must be the bare encyclopedia route slug')
        if row.get('canonical_url') != f'/encyclopedia/{slug}/':
            fail(f'{slug}: canonical route mismatch')
        if row.get('status') not in {'draft', 'scientific_review'}:
            fail(f'{slug}: only pre-publication status is allowed')
        if row.get('published_at') is not None:
            fail(f'{slug}: published_at must remain null')
        if row.get('robots_index') is not False or row.get('robots_follow') is not False:
            fail(f'{slug}: materialized review payload must remain noindex,nofollow')

        body_json = row.get('body_json') if isinstance(row.get('body_json'), dict) else {}
        materialized_body = body_text_from_blocks(body_json)
        body_text = str(row.get('body_text') or '')
        if body_text != materialized_body:
            fail(f'{slug}: body_text must be deterministic visible text from body_json')
        if len(WORD_RE.findall(body_text)) < 1500:
            fail(f'{slug}: materialized visible body must contain >=1500 words/tokens')

        refs = row.get('references_json') if isinstance(row.get('references_json'), list) else []
        if len(refs) < 6:
            fail(f'{slug}: at least 6 references required')
        schema = row.get('schema_json') if isinstance(row.get('schema_json'), dict) else {}
        evidence = schema.get('evidence') if isinstance(schema.get('evidence'), dict) else {}
        if schema.get('publication_ready') is not False:
            fail(f'{slug}: schema publication_ready must be false')
        if evidence.get('review_status') != 'scientific-review-required':
            fail(f'{slug}: scientific review must remain required')
        if evidence.get('source_draft_sha256') != source_sha:
            fail(f'{slug}: evidence source_draft_sha256 mismatch')
        if evidence.get('materializer_version') != 2:
            fail(f'{slug}: materializer version must be 2')
        source_review_slug = str(evidence.get('source_review_slug') or '')
        if source_review_slug != f'encyclopedia-{slug}':
            fail(f'{slug}: source review slug mapping mismatch')
        claim_map = evidence.get('claim_source_map') if isinstance(evidence.get('claim_source_map'), list) else []
        if len(claim_map) < 8:
            fail(f'{slug}: materialized claim-source map is incomplete')

    if errors:
        print(json.dumps({'status': 'failed', 'errors': errors}, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    row = records[0]
    result = {
        'status': 'passed',
        'batch_id': payload.get('batch_id'),
        'record_count': len(records),
        'slug': row.get('slug'),
        'content_status': row.get('status'),
        'body_words': len(WORD_RE.findall(str(row.get('body_text') or ''))),
        'references': len(row.get('references_json') or []),
        'published': False,
        'indexable': False,
        'records_sha256': actual_sha,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('payload', type=Path)
    args = parser.parse_args()
    validate(args.payload)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
