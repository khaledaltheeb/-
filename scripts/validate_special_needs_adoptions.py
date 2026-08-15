#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Any


def normalize_path(value: str) -> str:
    path = urllib.parse.urlparse(value).path if value.startswith('http') else value
    if not path.startswith('/'):
        path = '/' + path
    if path != '/' and not Path(path).suffix and not path.endswith('/'):
        path += '/'
    return path


def api_get(base: str, key: str, endpoint: str) -> list[dict[str, Any]]:
    request = urllib.request.Request(
        base.rstrip('/') + '/rest/v1/' + endpoint,
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Accept': 'application/json',
            'User-Agent': 'Rawafid-Special-Needs-Migration-Audit/1.0',
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode('utf-8'))
    if not isinstance(payload, list):
        raise RuntimeError('Unexpected Supabase response')
    return payload


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('inventory', type=Path)
    parser.add_argument('adoptions', type=Path)
    parser.add_argument('--output', type=Path, default=Path('artifacts/special-needs-adoptions-validation.json'))
    args = parser.parse_args()

    base = os.environ.get('RAWAFID_SUPABASE_URL', '').strip()
    key = os.environ.get('RAWAFID_SUPABASE_PUBLISHABLE_KEY', '').strip()
    if not base or not key:
        raise SystemExit('RAWAFID_SUPABASE_URL and RAWAFID_SUPABASE_PUBLISHABLE_KEY are required')

    inventory = json.loads(args.inventory.read_text(encoding='utf-8'))
    adoption_doc = json.loads(args.adoptions.read_text(encoding='utf-8'))
    records = adoption_doc.get('records', [])
    if not isinstance(records, list) or not records:
        raise SystemExit('adoption records are required')

    source_paths = {
        normalize_path(str(row.get('path') or ''))
        for row in inventory.get('records', [])
        if str(row.get('path') or '').startswith('/special-needs/')
    }
    duplicate_sources: set[str] = set()
    seen_sources: set[str] = set()
    target_paths: set[str] = set()
    for row in records:
        source = normalize_path(str(row.get('source_path') or ''))
        target = normalize_path(str(row.get('target_canonical') or ''))
        if source in seen_sources:
            duplicate_sources.add(source)
        seen_sources.add(source)
        target_paths.add(target)

    encoded_targets = ','.join(urllib.parse.quote(path, safe='') for path in sorted(target_paths))
    destination = api_get(
        base,
        key,
        'content?select=slug,title,canonical_url,status,robots_index,schema_json&status=eq.published&limit=5000',
    )
    by_canonical = {
        normalize_path(str(row.get('canonical_url') or '')): row
        for row in destination
        if str(row.get('canonical_url') or '').strip()
    }

    errors: list[str] = []
    validated: list[dict[str, Any]] = []
    for row in records:
        source = normalize_path(str(row.get('source_path') or ''))
        target = normalize_path(str(row.get('target_canonical') or ''))
        reason = str(row.get('reason') or '').strip()
        evidence = row.get('evidence_headings')

        if not source.startswith('/special-needs/'):
            errors.append(f'{source}: source outside special-needs')
        if source not in source_paths:
            errors.append(f'{source}: source missing from legacy inventory')
        if target == source:
            errors.append(f'{source}: target must be a stronger different canonical')
        if not reason:
            errors.append(f'{source}: reason is required')
        if not isinstance(evidence, list) or len([x for x in evidence if str(x).strip()]) < 2:
            errors.append(f'{source}: at least two evidence headings are required')

        target_row = by_canonical.get(target)
        if not target_row:
            errors.append(f'{source}: published target not found: {target}')
            continue
        validated.append({
            'source_path': source,
            'target_canonical': target,
            'target_slug': target_row.get('slug'),
            'target_title': target_row.get('title'),
            'target_robots_index': target_row.get('robots_index'),
            'reason': reason,
            'evidence_headings': evidence,
        })

    if duplicate_sources:
        errors.append('duplicate source paths: ' + ', '.join(sorted(duplicate_sources)))

    result = {
        'version': 1,
        'scope': 'special-needs',
        'adoption_count': len(records),
        'validated_count': len(validated),
        'error_count': len(errors),
        'errors': errors,
        'records': validated,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: v for k, v in result.items() if k != 'records'}, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
