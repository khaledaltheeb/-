#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

REQUIRED_SOURCE_ROLES = {'definition', 'features', 'causes', 'assessment', 'support', 'inclusion'}
REQUIRED_SECTION_IDS = {'definition', 'features', 'causes', 'assessment', 'support', 'inclusive-education', 'safety', 'faq'}
ALLOWED_RISK_TIERS = {'A', 'B', 'C'}
ALLOWED_STATUSES = {'researched', 'drafted', 'scientific_review'}
ARABIC_RE = re.compile(r'[\u0600-\u06ff]')
SLUG_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
DATE_RE = re.compile(r'^\d{4}-\d{2}-\d{2}$')
FORBIDDEN = ('<script', '<style', 'javascript:', 'معاقين')


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise SystemExit(f'expected JSON object: {path}')
    return value


def candidate_slugs(registry_path: Path) -> set[str]:
    registry = load(registry_path)
    rows = registry.get('entities')
    if not isinstance(rows, list):
        raise SystemExit('generated encyclopedia registry is missing entities')
    return {
        str(row.get('slug') or '').strip()
        for row in rows
        if isinstance(row, dict) and str(row.get('status') or '') == 'candidate'
    }


def validate(batch_path: Path, registry_path: Path) -> dict[str, Any]:
    payload = load(batch_path)
    registry_slugs = candidate_slugs(registry_path)
    errors: list[str] = []

    def fail(message: str) -> None:
        errors.append(message)

    if payload.get('version') != 1:
        fail('batch version must be 1')
    batch_id = str(payload.get('batch_id') or '').strip()
    if not batch_id:
        fail('batch_id is required')
    cutoff = str(payload.get('research_cutoff_date') or '')
    if not DATE_RE.fullmatch(cutoff):
        fail('research_cutoff_date must use YYYY-MM-DD')
    if payload.get('status') != 'research-complete-draft-pending':
        fail('batch status must remain research-complete-draft-pending')
    policy = str(payload.get('publication_policy') or '')
    if 'لا تنشر' not in policy or 'مراجعة' not in policy:
        fail('publication policy must explicitly block direct publication and require review')

    records = payload.get('records')
    if not isinstance(records, list) or not records:
        fail('batch records must be a non-empty array')
        records = records if isinstance(records, list) else []
    expected_count = payload.get('expected_record_count', len(records))
    if not isinstance(expected_count, int) or expected_count < 1 or expected_count != len(records):
        fail(f'expected_record_count must equal actual records ({len(records)})')

    actual_slugs: set[str] = set()
    total_sources = 0
    total_queries = 0
    source_domains: set[str] = set()

    for index, row in enumerate(records, start=1):
        if not isinstance(row, dict):
            fail(f'record {index}: must be an object')
            continue
        slug = str(row.get('slug') or '').strip()
        prefix = f'record {index} ({slug or "unknown"})'
        if slug in actual_slugs:
            fail(f'{prefix}: duplicate slug within research batch')
        actual_slugs.add(slug)
        if not SLUG_RE.fullmatch(slug):
            fail(f'{prefix}: invalid slug')
        if slug not in registry_slugs:
            fail(f'{prefix}: slug is not present in generated canonical candidate registry')
        if row.get('risk_tier') not in ALLOWED_RISK_TIERS:
            fail(f'{prefix}: invalid risk_tier')
        if row.get('status') not in ALLOWED_STATUSES:
            fail(f'{prefix}: invalid pre-publication status')
        if row.get('status') in {'approved', 'published'}:
            fail(f'{prefix}: automatic approval/publication is forbidden')

        title_ar = str(row.get('title_ar') or '').strip()
        title_en = str(row.get('title_en') or '').strip()
        if len(title_ar) < 3 or not ARABIC_RE.search(title_ar):
            fail(f'{prefix}: Arabic title required')
        if len(title_en) < 3 or not re.search(r'[A-Za-z]', title_en):
            fail(f'{prefix}: English title required')
        if len(str(row.get('primary_keyword') or '').strip()) < 3:
            fail(f'{prefix}: primary_keyword required')

        secondary = row.get('secondary_keywords')
        semantic = row.get('semantic_terms')
        if not isinstance(secondary, list) or len(secondary) < 6:
            fail(f'{prefix}: at least 6 secondary keywords required')
        if not isinstance(semantic, list) or len(semantic) < 6:
            fail(f'{prefix}: at least 6 semantic terms required')

        provenance = row.get('legacy_provenance')
        if not isinstance(provenance, list) or not provenance or not all(isinstance(item, str) and item.strip() for item in provenance):
            fail(f'{prefix}: legacy_provenance must be non-empty')

        queries = row.get('search_intent_queries')
        if not isinstance(queries, list) or len(queries) < 8:
            fail(f'{prefix}: at least 8 search-intent queries required')
            queries = queries if isinstance(queries, list) else []
        normalized_queries: set[str] = set()
        for query in queries:
            text = str(query or '').strip()
            if len(text) < 8 or not ARABIC_RE.search(text):
                fail(f'{prefix}: each search query must be meaningful Arabic text')
            key = re.sub(r'\s+', ' ', text.casefold())
            if key in normalized_queries:
                fail(f'{prefix}: duplicate search query {text!r}')
            normalized_queries.add(key)
        total_queries += len(queries)

        sections = row.get('required_sections')
        if not isinstance(sections, list) or len(sections) < 10:
            fail(f'{prefix}: at least 10 planned H2/H3 sections required')
            sections = sections if isinstance(sections, list) else []
        ids: set[str] = set()
        h2_count = 0
        for section in sections:
            if not isinstance(section, dict):
                fail(f'{prefix}: section must be an object')
                continue
            section_id = str(section.get('id') or '').strip()
            heading = str(section.get('heading') or '').strip()
            level = section.get('level')
            if not section_id or section_id in ids:
                fail(f'{prefix}: section ids must be unique and non-empty')
            ids.add(section_id)
            if level not in {2, 3}:
                fail(f'{prefix}: section level must be H2 or H3')
            if level == 2:
                h2_count += 1
            if len(heading) < 6 or not ARABIC_RE.search(heading):
                fail(f'{prefix}: section heading must be meaningful Arabic text')
        coverage_ids = set(ids)
        if 'types-causes' in ids:
            coverage_ids.add('causes')
        missing_sections = REQUIRED_SECTION_IDS - coverage_ids
        if missing_sections:
            fail(f'{prefix}: missing required section ids {sorted(missing_sections)}')
        if h2_count < 8:
            fail(f'{prefix}: research plan requires at least 8 H2 sections')

        sources = row.get('sources')
        if not isinstance(sources, list) or len(sources) < 6:
            fail(f'{prefix}: at least 6 authoritative sources required')
            sources = sources if isinstance(sources, list) else []
        urls: set[str] = set()
        ids_seen: set[str] = set()
        roles_seen: set[str] = set()
        domains_for_record: set[str] = set()
        for source in sources:
            if not isinstance(source, dict):
                fail(f'{prefix}: source must be an object')
                continue
            source_id = str(source.get('id') or '').strip()
            title = str(source.get('title') or '').strip()
            publisher = str(source.get('publisher') or '').strip()
            url = str(source.get('url') or '').strip()
            verified_at = str(source.get('verified_at') or '').strip()
            roles = source.get('roles')
            if not source_id or source_id in ids_seen:
                fail(f'{prefix}: source ids must be unique and non-empty')
            ids_seen.add(source_id)
            if len(title) < 3 or len(publisher) < 3:
                fail(f'{prefix}: source title and publisher are required')
            if not url.startswith('https://') or url in urls:
                fail(f'{prefix}: source URLs must be unique HTTPS URLs')
            urls.add(url)
            domain_match = re.match(r'https://([^/]+)', url)
            if domain_match:
                domain = domain_match.group(1).lower().removeprefix('www.')
                domains_for_record.add(domain)
                source_domains.add(domain)
            if not DATE_RE.fullmatch(verified_at) or (cutoff and verified_at > cutoff):
                fail(f'{prefix}: source verified_at must be on/before research cutoff')
            if not isinstance(roles, list) or not roles:
                fail(f'{prefix}: source roles must be a non-empty array')
                roles = roles if isinstance(roles, list) else []
            roles_seen.update(str(role) for role in roles)
        missing_roles = REQUIRED_SOURCE_ROLES - roles_seen
        if missing_roles:
            fail(f'{prefix}: source coverage missing roles {sorted(missing_roles)}')
        if len(domains_for_record) < 3:
            fail(f'{prefix}: research plan requires at least 3 independent source domains')
        total_sources += len(sources)

        searchable = json.dumps(row, ensure_ascii=False).casefold()
        for token in FORBIDDEN:
            if token.casefold() in searchable:
                fail(f'{prefix}: forbidden token found: {token}')

    if errors:
        print(json.dumps({'status': 'failed', 'batch_id': batch_id, 'errors': errors}, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    result = {
        'status': 'passed',
        'batch_id': batch_id,
        'records': len(records),
        'unique_slugs': len(actual_slugs),
        'total_sources': total_sources,
        'total_search_queries': total_queries,
        'source_domains': len(source_domains),
        'direct_publication_allowed': False,
        'scientific_review_required': True,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('batch', type=Path)
    parser.add_argument('--registry', type=Path, default=Path('data/encyclopedia/generated/legacy-candidates-v1.json'))
    args = parser.parse_args()
    validate(args.batch, args.registry)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
