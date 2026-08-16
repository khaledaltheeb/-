#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise SystemExit(f'expected JSON object: {path}')
    return value


def clean(value: Any) -> str:
    return ' '.join(str(value or '').split()).strip()


def body_text_from_blocks(body_json: Any) -> str:
    if not isinstance(body_json, dict):
        return ''
    blocks = body_json.get('blocks')
    if not isinstance(blocks, list):
        return ''
    parts: list[str] = []
    for block in blocks:
        if not isinstance(block, dict):
            continue
        block_type = str(block.get('type') or '')
        if block_type in {'paragraph', 'heading'}:
            text = clean(block.get('text'))
            if text:
                parts.append(text)
        elif block_type == 'list':
            for item in block.get('items', []) if isinstance(block.get('items'), list) else []:
                text = clean(item)
                if text:
                    parts.append(text)
        elif block_type == 'quote':
            for key in ('text', 'cite'):
                text = clean(block.get(key))
                if text:
                    parts.append(text)
        elif block_type == 'callout':
            for key in ('title', 'text'):
                text = clean(block.get(key))
                if text:
                    parts.append(text)
        elif block_type == 'table':
            caption = clean(block.get('caption'))
            if caption:
                parts.append(caption)
            headers = block.get('headers') if isinstance(block.get('headers'), list) else []
            rows = block.get('rows') if isinstance(block.get('rows'), list) else []
            for item in headers:
                text = clean(item)
                if text:
                    parts.append(text)
            for row in rows:
                if not isinstance(row, list):
                    continue
                for item in row:
                    text = clean(item)
                    if text:
                        parts.append(text)
        elif block_type == 'resource':
            for key in ('label', 'description'):
                text = clean(block.get(key))
                if text:
                    parts.append(text)
        elif block_type == 'image':
            for key in ('alt', 'caption'):
                text = clean(block.get(key))
                if text:
                    parts.append(text)
        elif block_type == 'faq':
            items = block.get('items') if isinstance(block.get('items'), list) else []
            for item in items:
                if not isinstance(item, dict):
                    continue
                for key in ('question', 'answer'):
                    text = clean(item.get(key))
                    if text:
                        parts.append(text)
    return '\n\n'.join(parts).strip()


def normalized_records(records: list[dict[str, Any]]) -> bytes:
    stable = sorted(records, key=lambda row: str(row.get('slug') or ''))
    return json.dumps(stable, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def source_route_slug(source: dict[str, Any]) -> str:
    source_slug = clean(source.get('slug'))
    if not source_slug.startswith('encyclopedia-'):
        raise SystemExit('source review draft slug must use encyclopedia- prefix')
    route_slug = source_slug.removeprefix('encyclopedia-')
    if not route_slug or clean(source.get('canonical_url')) != f'/encyclopedia/{route_slug}/':
        raise SystemExit('source review draft slug/canonical mismatch')
    return route_slug


def materialize(draft_path: Path) -> dict[str, Any]:
    raw = draft_path.read_bytes()
    draft = json.loads(raw.decode('utf-8'))
    if not isinstance(draft, dict):
        raise SystemExit('draft root must be an object')
    source = draft.get('record')
    if not isinstance(source, dict):
        raise SystemExit('draft record must be an object')
    if draft.get('publication_ready') is not False:
        raise SystemExit('refusing to materialize a draft marked publication_ready')
    status = str(draft.get('status') or '')
    if status not in {'draft', 'scientific_review'}:
        raise SystemExit(f'unsupported draft status: {status!r}')
    if source.get('robots_index') is not False or source.get('robots_follow') is not False:
        raise SystemExit('draft materialization requires noindex,nofollow')

    route_slug = source_route_slug(source)
    body_json = source.get('body_json') if isinstance(source.get('body_json'), dict) else {}
    body_text = body_text_from_blocks(body_json)
    if not body_text:
        raise SystemExit('visible body_text could not be materialized')

    schema = json.loads(json.dumps(source.get('schema_json') if isinstance(source.get('schema_json'), dict) else {}, ensure_ascii=False))
    evidence = schema.get('evidence') if isinstance(schema.get('evidence'), dict) else {}
    evidence['claim_source_map'] = draft.get('claim_source_map') if isinstance(draft.get('claim_source_map'), list) else []
    evidence['source_draft_sha256'] = hashlib.sha256(raw).hexdigest()
    evidence['materializer_version'] = 2
    evidence['materialized_from'] = draft_path.as_posix()
    evidence['source_review_slug'] = clean(source.get('slug'))
    schema['evidence'] = evidence
    schema['publication_ready'] = False

    record = {
        'content_type': source.get('content_type'),
        'slug': route_slug,
        'title': source.get('title'),
        'excerpt': source.get('excerpt'),
        'body_json': body_json,
        'body_text': body_text,
        'audience': source.get('audience') if isinstance(source.get('audience'), list) else [],
        'seo_title': source.get('seo_title'),
        'seo_description': source.get('seo_description'),
        'canonical_url': f'/encyclopedia/{route_slug}/',
        'robots_index': False,
        'robots_follow': False,
        'primary_keyword': source.get('primary_keyword'),
        'secondary_keywords': source.get('secondary_keywords') if isinstance(source.get('secondary_keywords'), list) else [],
        'semantic_terms': source.get('semantic_terms') if isinstance(source.get('semantic_terms'), list) else [],
        'search_intent': source.get('search_intent'),
        'author_display_name': source.get('author_display_name'),
        'reviewer_display_name': source.get('reviewer_display_name'),
        'reviewer_credentials': source.get('reviewer_credentials'),
        'last_reviewed_at': source.get('last_reviewed_at'),
        'references_json': source.get('references_json') if isinstance(source.get('references_json'), list) else [],
        'medical_disclaimer': source.get('medical_disclaimer'),
        'schema_json': schema,
        'status': status,
        'published_at': None,
    }

    records = [record]
    return {
        'version': 2,
        'batch_id': f"materialized-{draft.get('draft_id')}",
        'source_draft': draft_path.as_posix(),
        'source_draft_sha256': hashlib.sha256(raw).hexdigest(),
        'record_count': 1,
        'records_sha256': hashlib.sha256(normalized_records(records)).hexdigest(),
        'publication_ready': False,
        'records': records,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('draft', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()

    payload = materialize(args.draft)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    record = payload['records'][0]
    print(json.dumps({
        'status': 'materialized',
        'batch_id': payload['batch_id'],
        'slug': record['slug'],
        'content_status': record['status'],
        'robots_index': record['robots_index'],
        'body_words': len(record['body_text'].split()),
        'references': len(record['references_json']),
        'records_sha256': payload['records_sha256'],
        'output': args.output.as_posix(),
    }, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
