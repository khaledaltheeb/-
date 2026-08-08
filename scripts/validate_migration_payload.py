#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

ALLOWED_BLOCKS = {'paragraph','heading','list','quote','callout','table','resource','image','faq','divider'}
ALLOWED_CONTENT_TYPES = {'article','guide','research','news','condition','protocol','intervention','assessment','resource','glossary_term'}
SHA256_RE = re.compile(r'^[0-9a-f]{64}$')
CARE_GUIDE_RE = re.compile(r'^/care-guides/[a-z0-9][a-z0-9/-]*/$')
FAMILY_GUIDE_RE = re.compile(r'^/family-guide(?:/[a-z0-9][a-z0-9/-]*)?/$')
FORBIDDEN_TEXT = ('معاقين', '<script', '<style', 'javascript:')


def norm_records(records: list[dict[str, Any]]) -> bytes:
    stable = sorted(records, key=lambda row: str(row.get('source_path') or ''))
    return json.dumps(stable, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def fail(message: str, errors: list[str]) -> None:
    errors.append(message)


def validate(path: Path) -> dict[str, Any]:
    envelope = json.loads(path.read_text(encoding='utf-8'))
    records = envelope.get('records')
    errors: list[str] = []
    if not isinstance(records, list) or not records:
        raise SystemExit('payload records must be a non-empty array')

    expected_sha = str(envelope.get('records_sha256') or '')
    actual_sha = hashlib.sha256(norm_records(records)).hexdigest()
    if expected_sha != actual_sha:
        fail(f'checksum mismatch: expected={expected_sha} actual={actual_sha}', errors)
    if int(envelope.get('record_count', -1)) != len(records):
        fail('record_count does not match actual records', errors)

    slugs: set[str] = set()
    sources: set[str] = set()
    canonicals: set[str] = set()
    total_blocks = 0
    total_references = 0
    total_source_words = 0
    final_word_counts: list[int] = []
    redirect_count = 0
    same_route_count = 0
    for index, row in enumerate(records, start=1):
        slug = str(row.get('slug') or '').strip()
        source = str(row.get('source_path') or '').strip()
        prefix = f'row {index} ({source or slug or "unknown"})'
        if not slug or slug in slugs:
            fail(f'{prefix}: missing or duplicate slug', errors)
        slugs.add(slug)
        if not source.startswith('/') or source in sources:
            fail(f'{prefix}: invalid or duplicate source_path', errors)
        sources.add(source)
        if row.get('content_type') not in ALLOWED_CONTENT_TYPES:
            fail(f'{prefix}: unsupported content_type', errors)
        if not str(row.get('title') or '').strip():
            fail(f'{prefix}: title is required', errors)
        if len(str(row.get('seo_description') or '').strip()) < 80:
            fail(f'{prefix}: seo_description is too short', errors)

        canonical = str(row.get('canonical_url') or '').strip()
        if not canonical or canonical in canonicals:
            fail(f'{prefix}: canonical is missing or duplicated', errors)
        canonicals.add(canonical)
        schema = row.get('schema_json') if isinstance(row.get('schema_json'), dict) else {}
        is_content_route = canonical == f'/content/{slug}'
        is_care_guide = bool(CARE_GUIDE_RE.fullmatch(canonical)) and row.get('content_type') == 'guide'
        is_family_guide = bool(FAMILY_GUIDE_RE.fullmatch(canonical)) and row.get('content_type') == 'guide'
        if not (is_content_route or is_care_guide or is_family_guide):
            fail(f'{prefix}: canonical is not an approved V3 content route', errors)
        if is_care_guide and schema.get('page_role') != 'care-guide':
            fail(f'{prefix}: care-guide canonical requires schema_json.page_role=care-guide', errors)
        if is_family_guide and schema.get('page_role') not in {'hub','family_condition','family_tool','family_guide'}:
            fail(f'{prefix}: family-guide canonical requires an approved family schema_json.page_role', errors)

        redirect = row.get('redirect') if isinstance(row.get('redirect'), dict) else None
        if source == canonical:
            same_route_count += 1
            if redirect:
                fail(f'{prefix}: preserved same-route page must not create a redirect', errors)
        else:
            redirect_count += 1
            if not redirect:
                fail(f'{prefix}: changed route requires a 301 redirect', errors)
            elif redirect.get('source_path') != source or redirect.get('destination_path') != canonical or redirect.get('status_code') != 301:
                fail(f'{prefix}: 301 redirect contract mismatch', errors)

        source_sha = str(schema.get('legacy_source_sha256') or '')
        if not SHA256_RE.fullmatch(source_sha):
            fail(f'{prefix}: legacy source SHA-256 missing/invalid', errors)
        source_words = int(schema.get('legacy_source_word_count') or 0)
        total_source_words += source_words
        final_words = len(str(row.get('body_text') or '').split())
        final_word_counts.append(final_words)
        if is_family_guide:
            if schema.get('family_guide_enriched') is not True:
                fail(f'{prefix}: family-guide page must pass the enrichment stage before release', errors)
            if final_words < 1500:
                fail(f'{prefix}: family-guide final content must be >=1500 words, got {final_words}', errors)
        elif source_words < 1000:
            fail(f'{prefix}: expected a long-form source (>=1000 words), got {source_words}', errors)
        if schema.get('references_preserved') is not True:
            fail(f'{prefix}: references_preserved provenance flag missing', errors)
        if not is_family_guide and schema.get('legacy_image_inventory') and row.get('featured_image_url'):
            fail(f'{prefix}: legacy image must not be auto-rendered before asset verification', errors)

        body = row.get('body_json') if isinstance(row.get('body_json'), dict) else {}
        blocks = body.get('blocks') if isinstance(body.get('blocks'), list) else []
        if not blocks:
            fail(f'{prefix}: body blocks are empty', errors)
        total_blocks += len(blocks)
        for block in blocks:
            if not isinstance(block, dict) or block.get('type') not in ALLOWED_BLOCKS:
                fail(f'{prefix}: unsupported body block', errors)
                continue
            if block.get('type') == 'heading':
                level = int(block.get('level') or 0)
                if level not in {2,3,4}:
                    fail(f'{prefix}: heading level must be H2-H4', errors)

        refs = row.get('references_json') if isinstance(row.get('references_json'), list) else []
        if not refs:
            fail(f'{prefix}: references_json is empty', errors)
        if is_family_guide and len(refs) < 4:
            fail(f'{prefix}: family-guide page requires at least 4 authoritative references, got {len(refs)}', errors)
        total_references += len(refs)
        for ref in refs:
            url = str(ref.get('url') or '') if isinstance(ref, dict) else ''
            title = str(ref.get('title') or '') if isinstance(ref, dict) else ''
            if not url.startswith('https://') or not title.strip():
                fail(f'{prefix}: every reference needs an HTTPS URL and title', errors)

        searchable = json.dumps(row, ensure_ascii=False).lower()
        for forbidden in FORBIDDEN_TEXT:
            if forbidden.lower() in searchable:
                fail(f'{prefix}: forbidden legacy/terminology token found: {forbidden}', errors)

    if errors:
        print(json.dumps({'status':'failed','errors':errors}, ensure_ascii=False, indent=2))
        raise SystemExit(1)
    result = {
        'status':'passed',
        'batch_id':envelope.get('batch_id'),
        'records':len(records),
        'records_sha256':actual_sha,
        'total_body_blocks':total_blocks,
        'total_external_references':total_references,
        'total_source_words':total_source_words,
        'min_final_words':min(final_word_counts) if final_word_counts else 0,
        'max_final_words':max(final_word_counts) if final_word_counts else 0,
        'redirect_count':redirect_count,
        'same_route_count':same_route_count,
        'legacy_theme_copied':False,
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
