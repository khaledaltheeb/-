#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('payload', type=Path)
    args = parser.parse_args()

    payload = json.loads(args.payload.read_text(encoding='utf-8'))
    records = payload.get('records')
    if not isinstance(records, list) or not records:
        raise SystemExit('payload records must be a non-empty array')

    errors: list[str] = []
    title_lengths: list[int] = []
    description_lengths: list[int] = []
    for row in records:
        slug = str(row.get('slug') or 'unknown')
        title = str(row.get('seo_title') or '').strip()
        description = str(row.get('seo_description') or '').strip()
        title_lengths.append(len(title))
        description_lengths.append(len(description))
        if not title or len(title) > 47:
            errors.append(f'{slug}: seo_title length={len(title)}; required 1-47')
        if not 150 <= len(description) <= 160:
            errors.append(f'{slug}: seo_description length={len(description)}; required 150-160')
        if not str(row.get('primary_keyword') or '').strip():
            errors.append(f'{slug}: primary_keyword is required')
        if not str(row.get('author_display_name') or '').strip():
            errors.append(f'{slug}: author_display_name is required')
        if row.get('content_type') in {'condition','protocol','intervention','assessment','research','guide'}:
            refs = row.get('references_json')
            if not isinstance(refs, list) or len(refs) < 1:
                errors.append(f'{slug}: evidence-heavy content requires at least one reference')

    if errors:
        print(json.dumps({'status':'failed','errors':errors}, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    print(json.dumps({
        'status':'passed',
        'record_count':len(records),
        'seo_title_max':max(title_lengths),
        'seo_description_min':min(description_lengths),
        'seo_description_max':max(description_lengths),
        'database_release_gate_compatible':True,
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
