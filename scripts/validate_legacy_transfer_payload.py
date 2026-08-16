#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

ALLOWED_CONTENT_TYPES = {
    'article', 'guide', 'research', 'news', 'condition', 'protocol',
    'intervention', 'assessment', 'resource', 'glossary_term',
}
SHA256_RE = re.compile(r'^[0-9a-f]{64}$')


def norm_records(records: list[dict[str, Any]]) -> bytes:
    stable = sorted(records, key=lambda row: str(row.get('source_path') or ''))
    return json.dumps(stable, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def text_word_count(value: Any) -> int:
    return len(re.findall(r'[\w\u0600-\u06FF]+', str(value or ''), flags=re.UNICODE))


def validate(path: Path) -> dict[str, Any]:
    envelope = json.loads(path.read_text(encoding='utf-8'))
    records = envelope.get('records')
    if not isinstance(records, list) or not records:
        raise SystemExit('payload records must be a non-empty array')

    errors: list[str] = []
    warnings: list[str] = []

    expected_sha = str(envelope.get('records_sha256') or '')
    actual_sha = hashlib.sha256(norm_records(records)).hexdigest()
    if expected_sha and expected_sha != actual_sha:
        errors.append(f'checksum mismatch: expected={expected_sha} actual={actual_sha}')
    if int(envelope.get('record_count', len(records))) != len(records):
        errors.append('record_count does not match actual records')

    slugs: set[str] = set()
    sources: set[str] = set()
    canonicals: set[str] = set()
    word_counts: list[int] = []
    missing_references = 0
    short_seo_descriptions = 0
    thin_records = 0

    for index, row in enumerate(records, start=1):
        if not isinstance(row, dict):
            errors.append(f'row {index}: record must be an object')
            continue

        slug = str(row.get('slug') or '').strip()
        source = str(row.get('source_path') or '').strip()
        canonical = str(row.get('canonical_url') or '').strip()
        prefix = f'row {index} ({source or slug or "unknown"})'

        if not slug:
            errors.append(f'{prefix}: slug is required to preserve record identity')
        elif slug in slugs:
            errors.append(f'{prefix}: duplicate slug would overwrite another transferred record')
        else:
            slugs.add(slug)

        if not source.startswith('/'):
            errors.append(f'{prefix}: source_path must be an absolute legacy path')
        elif source in sources:
            errors.append(f'{prefix}: duplicate source_path would lose source identity')
        else:
            sources.add(source)

        if row.get('content_type') not in ALLOWED_CONTENT_TYPES:
            warnings.append(f'{prefix}: uncommon/unsupported release content_type={row.get("content_type")!r}')

        if not str(row.get('title') or '').strip():
            warnings.append(f'{prefix}: title missing; transfer is preserved but editorial naming is required')

        if canonical:
            if canonical in canonicals:
                errors.append(f'{prefix}: duplicate canonical would create an ownership collision')
            canonicals.add(canonical)
        else:
            warnings.append(f'{prefix}: canonical missing; preserve first, assign canonical before indexing')

        schema = row.get('schema_json') if isinstance(row.get('schema_json'), dict) else {}
        source_sha = str(schema.get('legacy_source_sha256') or schema.get('migration_source_sha256') or '')
        if source_sha and not SHA256_RE.fullmatch(source_sha):
            errors.append(f'{prefix}: malformed legacy source SHA-256')
        if not source_sha:
            warnings.append(f'{prefix}: source SHA-256 missing; provenance should be repaired after transfer')

        body_text = str(row.get('body_text') or '').strip()
        body_json = row.get('body_json') if isinstance(row.get('body_json'), dict) else {}
        blocks = body_json.get('blocks') if isinstance(body_json.get('blocks'), list) else []
        if not body_text and not blocks:
            errors.append(f'{prefix}: no transferable content found in body_text or body_json.blocks')
            continue

        words = text_word_count(body_text)
        word_counts.append(words)
        if words < 300:
            thin_records += 1
            warnings.append(f'{prefix}: thin legacy content ({words} words); transferred without padding or rejection')

        seo_description = str(row.get('seo_description') or '').strip()
        if len(seo_description) < 80:
            short_seo_descriptions += 1
            warnings.append(f'{prefix}: SEO description is short/missing ({len(seo_description)} chars); transfer remains allowed')

        refs = row.get('references_json') if isinstance(row.get('references_json'), list) else []
        if not refs:
            missing_references += 1
            warnings.append(f'{prefix}: no extracted references; evidence review is required before index/release when applicable')

        if row.get('robots_index') is True and str(row.get('status') or '').lower() != 'published':
            warnings.append(f'{prefix}: non-published transfer requests robots_index=true; release gate should force noindex')

    result = {
        'status': 'failed' if errors else 'passed',
        'transfer_policy': 'mandatory-preservation-no-length-floor',
        'record_count': len(records),
        'records_sha256': actual_sha,
        'error_count': len(errors),
        'warning_count': len(warnings),
        'thin_record_count': thin_records,
        'missing_reference_count': missing_references,
        'short_seo_description_count': short_seo_descriptions,
        'min_words': min(word_counts) if word_counts else 0,
        'max_words': max(word_counts) if word_counts else 0,
        'errors': errors,
        'warnings': warnings,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
    return result


def main() -> int:
    parser = argparse.ArgumentParser(
        description='Validate mandatory legacy transfer without editorial length floors.'
    )
    parser.add_argument('payload', type=Path)
    args = parser.parse_args()
    validate(args.payload)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
