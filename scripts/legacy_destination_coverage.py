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
    url = base.rstrip('/') + '/rest/v1/' + endpoint
    request = urllib.request.Request(url, headers={
        'apikey': key,
        'Authorization': f'Bearer {key}',
        'Accept': 'application/json',
        'User-Agent': 'Rawafid-Legacy-Migration-Audit/1.0',
    })
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode('utf-8'))
    if not isinstance(payload, list):
        raise RuntimeError(f'Unexpected Supabase response from {endpoint}')
    return payload


def static_routes(root: Path) -> set[str]:
    routes = {'/'}
    app = root / 'app'
    for page in app.rglob('page.tsx'):
        rel = page.relative_to(app)
        parts = list(rel.parts[:-1])
        if any(part.startswith('[') or part.startswith('(') or part.startswith('@') for part in parts):
            continue
        route = '/' + '/'.join(parts)
        routes.add(normalize_path(route or '/'))
    return routes


def source_slug(path: str) -> str:
    stripped = path.strip('/')
    return stripped.split('/')[-1] if stripped else ''


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('inventory', type=Path)
    parser.add_argument('--v3-root', type=Path, default=Path('.'))
    parser.add_argument('--output', type=Path, default=Path('artifacts/legacy-destination-coverage.json'))
    args = parser.parse_args()

    supabase_url = os.environ.get('RAWAFID_SUPABASE_URL', '').strip()
    supabase_key = os.environ.get('RAWAFID_SUPABASE_PUBLISHABLE_KEY', '').strip()
    if not supabase_url or not supabase_key:
        raise SystemExit('RAWAFID_SUPABASE_URL and RAWAFID_SUPABASE_PUBLISHABLE_KEY are required')

    source = json.loads(args.inventory.read_text(encoding='utf-8'))
    records = source.get('records', [])
    destination_content = api_get(
        supabase_url,
        supabase_key,
        'content?select=slug,title,canonical_url,status,schema_json&status=eq.published&limit=2000',
    )
    destination_redirects = api_get(
        supabase_url,
        supabase_key,
        'redirects?select=source_path,destination_path,status_code,is_active&is_active=eq.true&limit=5000',
    )
    content_by_slug = {str(row.get('slug') or ''): row for row in destination_content if row.get('slug')}
    redirects = {normalize_path(str(row.get('source_path') or '')): row for row in destination_redirects if row.get('source_path')}
    routes = static_routes(args.v3_root.resolve())

    historical: dict[str, list[dict[str, Any]]] = {}
    for row in destination_content:
        schema = row.get('schema_json') if isinstance(row.get('schema_json'), dict) else {}
        for key in ('historical_v254_slug', 'legacy_slug', 'source_slug'):
            value = schema.get(key)
            if isinstance(value, str) and value.strip():
                historical.setdefault(value.strip(), []).append(row)

    coverage: list[dict[str, Any]] = []
    counts: Counter[str] = Counter()
    prefix_counts: dict[str, Counter[str]] = {}
    for record in records:
        kind = str(record.get('kind') or 'html')
        path = normalize_path(str(record.get('path') or '/'))
        prefix = path.strip('/').split('/', 1)[0] or '(root)'
        slug = source_slug(path)
        status = 'unmapped'
        target = None
        evidence: dict[str, Any] = {}

        if kind == 'resource':
            status = 'resource'
        elif path in routes:
            status = 'same-route'
            target = path
        elif path in redirects:
            status = 'redirect'
            target = redirects[path].get('destination_path')
            evidence['status_code'] = redirects[path].get('status_code')
        elif slug and slug in content_by_slug:
            status = 'exact-content-no-redirect'
            row = content_by_slug[slug]
            target = row.get('canonical_url') or f'/content/{slug}'
        elif slug and slug in historical:
            status = 'historical-merged-no-redirect'
            row = historical[slug][0]
            target = row.get('canonical_url') or f"/content/{row.get('slug')}"
            evidence['destination_slug'] = row.get('slug')

        counts[status] += 1
        prefix_counts.setdefault(prefix, Counter())[status] += 1
        coverage.append({
            'source_url': record.get('url'),
            'source_path': path,
            'source_slug': slug,
            'kind': kind,
            'status': status,
            'target': target,
            'evidence': evidence,
        })

    page_statuses = {'same-route', 'redirect'}
    page_records = [item for item in coverage if item['kind'] != 'resource']
    fully_routed = [item for item in page_records if item['status'] in page_statuses]
    missing_redirect = [item for item in page_records if item['status'] in {'exact-content-no-redirect', 'historical-merged-no-redirect'}]
    unmapped = [item for item in page_records if item['status'] == 'unmapped']
    summary = {
        'source_url_count': len(records),
        'source_page_count': len(page_records),
        'source_resource_count': sum(1 for item in coverage if item['kind'] == 'resource'),
        'destination_published_content_count': len(destination_content),
        'destination_active_redirect_count': len(destination_redirects),
        'destination_static_route_count': len(routes),
        'status_counts': dict(sorted(counts.items())),
        'fully_routed_page_count': len(fully_routed),
        'known_content_missing_redirect_count': len(missing_redirect),
        'unmapped_page_count': len(unmapped),
        'prefix_status_counts': {prefix: dict(sorted(counter.items())) for prefix, counter in sorted(prefix_counts.items())},
        'known_content_missing_redirect': missing_redirect,
        'unmapped_pages': unmapped,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps({'summary': summary, 'coverage': coverage}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: value for key, value in summary.items() if key not in {'known_content_missing_redirect','unmapped_pages','prefix_status_counts'}}, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
