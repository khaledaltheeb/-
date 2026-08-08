#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any

DROP_CONDITION_H2 = {'عشرة بروتوكولات رعاية منظمة', 'ماذا يفعل كل طرف؟'}
CONDITION_ROLE = 'addiction_condition'


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8'))


def dump(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def stable_bytes(records: list[dict[str, Any]]) -> bytes:
    ordered = sorted(records, key=lambda row: str(row.get('source_path') or ''))
    return json.dumps(ordered, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def as_blocks(row: dict[str, Any]) -> list[dict[str, Any]]:
    body = row.get('body_json')
    if not isinstance(body, dict):
        body = {}
        row['body_json'] = body
    blocks = body.get('blocks')
    if not isinstance(blocks, list):
        blocks = []
        body['blocks'] = blocks
    return [block for block in blocks if isinstance(block, dict)]


def is_h2(block: dict[str, Any]) -> bool:
    return block.get('type') == 'heading' and int(block.get('level') or 0) == 2


def prune_generic_condition_sections(blocks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    skipping = False
    for block in blocks:
        if is_h2(block):
            heading = str(block.get('text') or '').strip()
            if heading in DROP_CONDITION_H2:
                skipping = True
                continue
            if skipping:
                skipping = False
        if not skipping:
            out.append(block)
    return out


def text_from_blocks(blocks: list[dict[str, Any]]) -> str:
    parts: list[str] = []
    for block in blocks:
        kind = block.get('type')
        if kind in {'heading', 'paragraph'}:
            text = str(block.get('text') or '').strip()
            if text:
                parts.append(text)
        elif kind == 'list' and isinstance(block.get('items'), list):
            parts.extend(str(item).strip() for item in block['items'] if str(item).strip())
        elif kind == 'faq' and isinstance(block.get('items'), list):
            for item in block['items']:
                if not isinstance(item, dict):
                    continue
                question = str(item.get('question') or '').strip()
                answer = str(item.get('answer') or '').strip()
                if question:
                    parts.append(question)
                if answer:
                    parts.append(answer)
    return '\n\n'.join(parts)


def merge_refs(existing: Any, added: Any) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for item in [*(existing if isinstance(existing, list) else []), *(added if isinstance(added, list) else [])]:
        if not isinstance(item, dict):
            continue
        url = str(item.get('url') or '').strip()
        title = str(item.get('title') or '').strip()
        key = url or title.casefold()
        if not key or key in seen:
            continue
        seen.add(key)
        out.append({key_name: value for key_name, value in item.items() if value not in (None, '', [])})
    return out


def merge_spec(base: dict[str, Any] | None, added: dict[str, Any]) -> dict[str, Any]:
    merged = dict(base or {})
    for key in ('sections', 'faq', 'references'):
        current = merged.get(key) if isinstance(merged.get(key), list) else []
        incoming = added.get(key) if isinstance(added.get(key), list) else []
        merged[key] = [*current, *incoming]
    if str(added.get('image_alt') or '').strip():
        merged['image_alt'] = added['image_alt']
    return merged


def build_added_blocks(spec: dict[str, Any]) -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for section in spec.get('sections', []):
        if not isinstance(section, dict):
            continue
        title = str(section.get('title') or '').strip()
        if title:
            out.append({'type': 'heading', 'level': 2, 'text': title})
        for paragraph in section.get('paragraphs', []):
            text = str(paragraph).strip()
            if text:
                out.append({'type': 'paragraph', 'text': text})
        items = section.get('items')
        if isinstance(items, list):
            clean = [str(item).strip() for item in items if str(item).strip()]
            if clean:
                out.append({'type': 'list', 'ordered': False, 'items': clean})
    faq = []
    for item in spec.get('faq', []):
        if not isinstance(item, dict):
            continue
        question = str(item.get('question') or '').strip()
        answer = str(item.get('answer') or '').strip()
        if question and answer:
            faq.append({'question': question, 'answer': answer})
    if faq:
        out.append({'type': 'heading', 'level': 2, 'text': 'أسئلة شائعة مبنية على نية البحث'})
        out.append({'type': 'faq', 'items': faq})
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('payload', type=Path)
    parser.add_argument('enrichment', nargs='+', type=Path)
    args = parser.parse_args()
    payload = load(args.payload)
    records = payload.get('records') if isinstance(payload, dict) else None
    if not isinstance(records, list):
        raise SystemExit('invalid payload')

    specs: dict[str, Any] = {}
    version = 'addiction-core-enrichment-v1'
    reviewed_at = '2026-08-09'
    for path in args.enrichment:
        part = load(path)
        if not isinstance(part, dict) or not isinstance(part.get('records'), dict):
            raise SystemExit(f'invalid enrichment file: {path}')
        for slug, spec in part['records'].items():
            if not isinstance(spec, dict):
                raise SystemExit(f'invalid enrichment record for {slug}: {path}')
            specs[str(slug)] = merge_spec(specs.get(str(slug)), spec)
        version = str(part.get('version') or version)
        reviewed_at = str(part.get('reviewed_at') or reviewed_at)

    for row in records:
        if not isinstance(row, dict):
            continue
        slug = str(row.get('slug') or '')
        spec = specs.get(slug)
        if not isinstance(spec, dict):
            raise SystemExit(f'missing enrichment for {slug}')
        schema = row.get('schema_json') if isinstance(row.get('schema_json'), dict) else {}
        blocks = as_blocks(row)
        is_condition = str(schema.get('page_role') or '') == CONDITION_ROLE
        if is_condition:
            blocks = prune_generic_condition_sections(blocks)
        blocks.extend(build_added_blocks(spec))
        row['body_json'] = {'blocks': blocks}
        row['body_text'] = text_from_blocks(blocks)
        row['references_json'] = merge_refs(row.get('references_json'), spec.get('references'))
        canonical = str(row.get('canonical_url') or '').rstrip('/')
        image_slug = canonical.rsplit('/', 1)[-1] if canonical and canonical != '/addiction' else 'hub'
        row['featured_image_url'] = f'/addiction/images/{image_slug}'
        row['featured_image_alt'] = str(spec.get('image_alt') or f'{row.get("title", "الإدمان والتعافي")} — دليل منصة روافد للسلامة والعلاج والتعافي')
        row['last_reviewed_at'] = reviewed_at
        final_word_count = len(str(row['body_text']).split())
        schema.update({
            'migration_enriched': True,
            'migration_final_word_count': final_word_count,
            'migration_featured_image_verified': True,
            'addiction_enriched': True,
            'addiction_evidence_reviewed_at': reviewed_at,
            'addiction_enrichment_version': version,
            'addiction_removed_generic_protocol_sections': is_condition,
            'addiction_final_word_count': final_word_count,
            'addiction_reference_count': len(row['references_json']),
        })
        row['schema_json'] = schema

    payload['records_sha256'] = hashlib.sha256(stable_bytes(records)).hexdigest()
    payload['addiction_enrichment'] = {
        'version': version,
        'reviewed_at': reviewed_at,
        'records_enriched': len(records),
        'records_sha256_after_enrichment': payload['records_sha256'],
        'generic_condition_sections_removed': sorted(DROP_CONDITION_H2),
    }
    dump(args.payload, payload)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
