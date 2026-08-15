#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import urllib.parse
import urllib.request
from collections import Counter
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
            'User-Agent': 'Rawafid-Legacy-Adoption-Audit/1.0',
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode('utf-8'))
    if not isinstance(payload, list):
        raise RuntimeError('Unexpected Supabase response')
    return payload


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('coverage', type=Path)
    ap.add_argument('adoptions', type=Path)
    ap.add_argument('--output', type=Path, default=None)
    args = ap.parse_args()

    base = os.environ.get('RAWAFID_SUPABASE_URL', '').strip()
    key = os.environ.get('RAWAFID_SUPABASE_PUBLISHABLE_KEY', '').strip()
    if not base or not key:
        raise SystemExit('RAWAFID_SUPABASE_URL and RAWAFID_SUPABASE_PUBLISHABLE_KEY are required')

    payload = json.loads(args.coverage.read_text(encoding='utf-8'))
    coverage = payload.get('coverage', [])
    adoption_payload = json.loads(args.adoptions.read_text(encoding='utf-8'))
    entries = adoption_payload.get('adoptions', [])
    if not isinstance(entries, list) or not entries:
        raise SystemExit('adoptions list is required')

    published = api_get(base, key, 'content?select=slug,title,canonical_url,status&status=eq.published&limit=5000')
    published_by_canonical = {
        normalize_path(str(row.get('canonical_url') or '')): row
        for row in published
        if str(row.get('canonical_url') or '').strip()
    }
    by_source = {normalize_path(str(item.get('source_path') or '/')): item for item in coverage}

    seen_sources: set[str] = set()
    applied: list[dict[str, Any]] = []
    for entry in entries:
        source = normalize_path(str(entry.get('source_path') or ''))
        target = normalize_path(str(entry.get('target_canonical') or ''))
        if source in seen_sources:
            raise SystemExit(f'duplicate adoption source: {source}')
        seen_sources.add(source)
        item = by_source.get(source)
        if not item:
            raise SystemExit(f'adoption source missing from inventory: {source}')
        row = published_by_canonical.get(target)
        if not row:
            raise SystemExit(f'adoption target is not published: {target}')
        prior = str(item.get('status') or '')
        if prior in {'same-route', 'same-route-content'}:
            raise SystemExit(f'adoption source already has direct coverage: {source}')
        item['status'] = 'verified-content-adoption'
        item['target'] = str(row.get('canonical_url') or target)
        evidence = item.setdefault('evidence', {})
        evidence.update({
            'destination_slug': row.get('slug'),
            'mapping_kind': 'editorially-verified-content-adoption',
            'adoption_batch': adoption_payload.get('batch'),
            'verified_on': adoption_payload.get('verified_on'),
            'prior_status': prior,
            'rationale': entry.get('rationale'),
            'coverage_evidence': entry.get('coverage_evidence', []),
            'redirects_count_as_coverage': False,
        })
        applied.append({'source_path': source, 'target': item['target'], 'prior_status': prior})

    counts = Counter(str(item.get('status') or '') for item in coverage)
    page_records = [item for item in coverage if item.get('kind') != 'resource']
    direct_statuses = {'same-route', 'same-route-content'}
    preserved_statuses = direct_statuses | {
        'content-present-different-route',
        'historical-content-present-different-route',
        'verified-content-adoption',
    }
    different_route_statuses = preserved_statuses - direct_statuses
    direct = [item for item in page_records if item.get('status') in direct_statuses]
    preserved = [item for item in page_records if item.get('status') in preserved_statuses]
    different = [item for item in page_records if item.get('status') in different_route_statuses]
    redirects = [item for item in page_records if item.get('status') == 'redirect-only']
    unmapped = [item for item in page_records if item.get('status') == 'unmapped']
    gaps = redirects + unmapped

    prefix_counts: dict[str, Counter[str]] = {}
    for item in coverage:
        path = str(item.get('source_path') or '/').strip('/')
        prefix = path.split('/', 1)[0] or '(root)'
        prefix_counts.setdefault(prefix, Counter())[str(item.get('status') or '')] += 1

    summary = payload.setdefault('summary', {})
    summary.update({
        'status_counts': dict(sorted(counts.items())),
        'direct_route_page_count': len(direct),
        'content_preserved_page_count': len(preserved),
        'legacy_route_missing_but_content_present_count': len(different),
        'verified_content_adoption_count': counts.get('verified-content-adoption', 0),
        'redirect_only_page_count': len(redirects),
        'unmapped_page_count': len(unmapped),
        'migration_gap_page_count': len(gaps),
        'no_redirect_policy_passed': len(redirects) == 0,
        'fully_routed_page_count': len(direct),
        'known_content_missing_redirect_count': len(different),
        'prefix_status_counts': {
            prefix: dict(sorted(counter.items()))
            for prefix, counter in sorted(prefix_counts.items())
        },
        'legacy_route_missing_but_content_present': different,
        'redirect_only_pages': redirects,
        'migration_gap_pages': gaps,
        'known_content_missing_redirect': different,
        'unmapped_pages': unmapped,
        'content_adoption_contract': {
            'version': 1,
            'adoptions_file': args.adoptions.as_posix(),
            'applied_count': len(applied),
            'redirects_count_as_coverage': False,
        },
    })
    payload['adoptions_applied'] = applied
    out = args.output or args.coverage
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'status': 'passed',
        'applied': len(applied),
        'verified_content_adoption_count': counts.get('verified-content-adoption', 0),
        'migration_gap_page_count': len(gaps),
        'redirect_only_page_count': len(redirects),
    }, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
