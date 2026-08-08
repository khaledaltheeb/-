#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8'))


def stable_bytes(records: list[dict[str, Any]]) -> bytes:
    ordered = sorted(records, key=lambda row: str(row.get('source_path') or ''))
    return json.dumps(ordered, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('payload', type=Path)
    parser.add_argument('config', type=Path)
    args = parser.parse_args()

    payload = load(args.payload)
    config = load(args.config)
    records = payload.get('records')
    specs = config.get('records')
    if not isinstance(records, list) or not isinstance(specs, list):
        raise SystemExit('payload/config records must be arrays')

    by_slug = {str(spec.get('target_slug') or ''): spec for spec in specs if isinstance(spec, dict)}
    errors: list[str] = []
    for row in records:
        slug = str(row.get('slug') or '')
        spec = by_slug.get(slug) or {}
        title = str(spec.get('seo_title') or '').strip()
        description = str(spec.get('seo_description') or '').strip()
        if not title:
            errors.append(f'{slug}: seo_title override missing')
        elif len(title) > 47:
            errors.append(f'{slug}: seo_title={len(title)} chars (>47)')
        if not description:
            errors.append(f'{slug}: seo_description override missing')
        elif not 150 <= len(description) <= 160:
            errors.append(f'{slug}: seo_description={len(description)} chars (must be 150-160)')
        row['seo_title'] = title
        row['seo_description'] = description

    if errors:
        print(json.dumps({'status':'failed','errors':errors}, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    payload['records_sha256'] = hashlib.sha256(stable_bytes(records)).hexdigest()
    payload.setdefault('contract', {})['v3_release_seo_contract'] = {
        'seo_title_max_chars': 47,
        'seo_description_min_chars': 150,
        'seo_description_max_chars': 160,
    }
    args.payload.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'status':'passed',
        'record_count':len(records),
        'records_sha256':payload['records_sha256'],
        'seo_title_max':max(len(str(row.get('seo_title') or '')) for row in records),
        'seo_description_min':min(len(str(row.get('seo_description') or '')) for row in records),
        'seo_description_max':max(len(str(row.get('seo_description') or '')) for row in records),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
