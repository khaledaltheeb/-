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
        'User-Agent': 'Rawafid-Legacy-Migration-Audit/2.0',
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


def destination_canonical(row: dict[str, Any], fallback_slug: str) -> str:
    return normalize_path(str(row.get('canonical_url') or f'/content/{fallback_slug}'))


def classify_record(
    record: dict[str, Any],
    *,
    routes: set[str],
    content_by_slug: dict[str, dict[str, Any]],
    content_by_canonical: dict[str, dict[str, Any]],
    historical: dict[str, list[dict[str, Any]]],
    redirects: dict[str, dict[str, Any]],
) -> dict[str, Any]:
    kind = str(record.get('kind') or 'html')
    path = normalize_path(str(record.get('path') or '/'))
    slug = source_slug(path)
    status = 'unmapped'
    target: str | None = None
    evidence: dict[str, Any] = {}

    if kind == 'resource':
        status = 'resource'
    elif path in routes:
        status = 'same-route'
        target = path
        evidence['route_kind'] = 'static'
    elif path in content_by_canonical:
        status = 'same-route-content'
        row = content_by_canonical[path]
        target = str(row.get('canonical_url') or path)
        evidence['destination_slug'] = row.get('slug')
        evidence['route_kind'] = 'dynamic-content'
    elif slug and slug in content_by_slug:
        row = content_by_slug[slug]
        canonical = destination_canonical(row, slug)
        target = str(row.get('canonical_url') or canonical)
        evidence['destination_slug'] = row.get('slug')
        evidence['mapping_kind'] = 'exact-slug'
        if canonical == path:
            status = 'same-route-content'
            evidence['route_kind'] = 'dynamic-content'
        else:
            status = 'content-present-different-route'
            evidence['route_kind'] = 'dynamic-content'
    elif slug and slug in historical:
        candidates = historical[slug]
        row = next(
            (candidate for candidate in candidates if destination_canonical(candidate, str(candidate.get('slug') or slug)) == path),
            candidates[0],
        )
        row_slug = str(row.get('slug') or slug)
        canonical = destination_canonical(row, row_slug)
        target = str(row.get('canonical_url') or canonical)
        evidence['destination_slug'] = row.get('slug')
        evidence['mapping_kind'] = 'historical-slug'
        if canonical == path:
            status = 'same-route-content'
            evidence['route_kind'] = 'historical-canonical'
        else:
            status = 'historical-content-present-different-route'
            evidence['route_kind'] = 'historical-canonical'
    elif path in redirects:
        # A redirect is diagnostic evidence only. It is intentionally not counted
        # as migrated content or as direct route coverage.
        status = 'redirect-only'
        target = str(redirects[path].get('destination_path') or '') or None
        evidence['status_code'] = redirects[path].get('status_code')
        evidence['policy'] = 'redirects-do-not-satisfy-legacy-content-coverage'

    return {
        'source_url': record.get('url'),
        'source_path': path,
        'source_slug': slug,
        'kind': kind,
        'status': status,
        'target': target,
        'evidence': evidence,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('inventory', type=Path)
    parser.add_argument('--v3-root', type=Path, default=Path('.'))
    parser.add_argument('--output', type=Path, default=Path('artifacts/legacy-destination-coverage.json'))
    parser.add_argument(
        '--fail-on-redirect-only',
        action='store_true',
        help='Fail when a legacy page is covered only by a redirect. Intended for the final no-redirect migration closeout.',
    )
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
        'content?select=slug,title,canonical_url,status,schema_json&status=eq.published&limit=5000',
    )
    destination_redirects = api_get(
        supabase_url,
        supabase_key,
        'redirects?select=source_path,destination_path,status_code,is_active&is_active=eq.true&limit=5000',
    )
    content_by_slug = {str(row.get('slug') or ''): row for row in destination_content if row.get('slug')}
    content_by_canonical = {
        normalize_path(str(row.get('canonical_url') or '')): row
        for row in destination_content
        if str(row.get('canonical_url') or '').strip()
    }
    redirects = {
        normalize_path(str(row.get('source_path') or '')): row
        for row in destination_redirects
        if row.get('source_path')
    }
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
        item = classify_record(
            record,
            routes=routes,
            content_by_slug=content_by_slug,
            content_by_canonical=content_by_canonical,
            historical=historical,
            redirects=redirects,
        )
        path = str(item['source_path'])
        prefix = path.strip('/').split('/', 1)[0] or '(root)'
        counts[str(item['status'])] += 1
        prefix_counts.setdefault(prefix, Counter())[str(item['status'])] += 1
        coverage.append(item)

    page_records = [item for item in coverage if item['kind'] != 'resource']
    direct_statuses = {'same-route', 'same-route-content'}
    preserved_statuses = direct_statuses | {
        'content-present-different-route',
        'historical-content-present-different-route',
    }
    different_route_statuses = {
        'content-present-different-route',
        'historical-content-present-different-route',
    }

    direct_route = [item for item in page_records if item['status'] in direct_statuses]
    content_preserved = [item for item in page_records if item['status'] in preserved_statuses]
    content_different_route = [item for item in page_records if item['status'] in different_route_statuses]
    redirect_only = [item for item in page_records if item['status'] == 'redirect-only']
    unmapped = [item for item in page_records if item['status'] == 'unmapped']
    migration_gaps = redirect_only + unmapped

    summary = {
        'source_url_count': len(records),
        'source_page_count': len(page_records),
        'source_resource_count': sum(1 for item in coverage if item['kind'] == 'resource'),
        'destination_published_content_count': len(destination_content),
        'destination_active_redirect_count': len(destination_redirects),
        'destination_static_route_count': len(routes),
        'status_counts': dict(sorted(counts.items())),
        'direct_route_page_count': len(direct_route),
        'content_preserved_page_count': len(content_preserved),
        'legacy_route_missing_but_content_present_count': len(content_different_route),
        'redirect_only_page_count': len(redirect_only),
        'unmapped_page_count': len(unmapped),
        'migration_gap_page_count': len(migration_gaps),
        'no_redirect_policy_passed': len(redirect_only) == 0,
        # Backward-compatible aliases. Redirects are intentionally excluded from
        # fully_routed_page_count in v2 of this audit.
        'fully_routed_page_count': len(direct_route),
        'known_content_missing_redirect_count': len(content_different_route),
        'summary_contract': {
            'version': 2,
            'redirects_count_as_coverage': False,
            'content_present_on_different_route_counts_as_preserved': True,
            'fully_routed_page_count_means': 'direct route coverage only',
        },
        'prefix_status_counts': {
            prefix: dict(sorted(counter.items()))
            for prefix, counter in sorted(prefix_counts.items())
        },
        'legacy_route_missing_but_content_present': content_different_route,
        'redirect_only_pages': redirect_only,
        'migration_gap_pages': migration_gaps,
        'known_content_missing_redirect': content_different_route,
        'unmapped_pages': unmapped,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps({'summary': summary, 'coverage': coverage}, ensure_ascii=False, indent=2) + '\n',
        encoding='utf-8',
    )
    bulky = {
        'prefix_status_counts',
        'legacy_route_missing_but_content_present',
        'redirect_only_pages',
        'migration_gap_pages',
        'known_content_missing_redirect',
        'unmapped_pages',
    }
    print(json.dumps({key: value for key, value in summary.items() if key not in bulky}, ensure_ascii=False, indent=2))

    if args.fail_on_redirect_only and redirect_only:
        raise SystemExit(f'legacy pages covered only by redirects: {len(redirect_only)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
