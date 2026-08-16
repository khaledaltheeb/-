#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path
from typing import Any

SLUG_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
ALLOWED_CATEGORIES = {
    'neurodevelopmental-learning',
    'intellectual-developmental',
    'language-communication',
    'genetic-chromosomal',
    'metabolic-rare',
    'neurological-epileptic',
    'motor-neuromuscular',
    'hearing-deafness',
    'vision-blindness',
    'mental-behavioral-functional',
    'chronic-acquired',
    'multiple-complex',
}
ALLOWED_ENTITY_TYPES = {'condition', 'disorder', 'syndrome', 'disease', 'disability', 'functional_condition'}
ALLOWED_STATUSES = {'candidate', 'researched', 'drafted', 'scientific_review', 'editorial_review', 'seo_accessibility_review', 'approved'}
FORBIDDEN = ('معاقين', '<script', '<style', 'javascript:')
TARGET = 5000


def normalize(value: str) -> str:
    value = unicodedata.normalize('NFKC', value).strip().casefold()
    value = re.sub(r'[\u064b-\u065f\u0670]', '', value)
    value = value.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا').replace('ى', 'ي')
    value = re.sub(r'[^\w\u0600-\u06ff]+', ' ', value, flags=re.UNICODE)
    return re.sub(r'\s+', ' ', value).strip()


def fail(errors: list[str], message: str) -> None:
    errors.append(message)


def validate(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding='utf-8'))
    errors: list[str] = []

    if payload.get('version') != 1:
        fail(errors, 'registry version must be 1')
    if payload.get('target_published_pages') != TARGET:
        fail(errors, f'target_published_pages must be {TARGET}')

    categories = payload.get('categories')
    if not isinstance(categories, dict) or set(categories) != ALLOWED_CATEGORIES:
        fail(errors, 'category keys must exactly match the encyclopedia taxonomy')
        categories = {}
    capacity = sum(int(value) for value in categories.values()) if categories else 0
    if capacity != TARGET:
        fail(errors, f'category capacity must total {TARGET}, got {capacity}')

    entities = payload.get('entities')
    if not isinstance(entities, list) or not entities:
        raise SystemExit('entities must be a non-empty array')

    slugs: set[str] = set()
    canonical_ar: dict[str, str] = {}
    canonical_en: dict[str, str] = {}
    aliases_by_entity: dict[str, set[str]] = {}

    required = {
        'slug', 'title_ar', 'title_en', 'aliases_ar', 'aliases_en', 'category',
        'entity_type', 'legacy_provenance', 'evidence_priority', 'status',
    }

    for index, entity in enumerate(entities, start=1):
        if not isinstance(entity, dict):
            fail(errors, f'entity {index}: must be an object')
            continue
        missing = required - set(entity)
        if missing:
            fail(errors, f'entity {index}: missing fields {sorted(missing)}')

        slug = str(entity.get('slug') or '').strip()
        title_ar = str(entity.get('title_ar') or '').strip()
        title_en = str(entity.get('title_en') or '').strip()
        prefix = f'entity {index} ({slug or title_ar or "unknown"})'

        if not SLUG_RE.fullmatch(slug):
            fail(errors, f'{prefix}: invalid slug')
        if slug in slugs:
            fail(errors, f'{prefix}: duplicate slug')
        slugs.add(slug)

        if len(title_ar) < 3 or not re.search(r'[\u0600-\u06ff]', title_ar):
            fail(errors, f'{prefix}: Arabic canonical title is required')
        if len(title_en) < 3 or not re.search(r'[A-Za-z]', title_en):
            fail(errors, f'{prefix}: English canonical title is required')

        ar_key, en_key = normalize(title_ar), normalize(title_en)
        if ar_key in canonical_ar:
            fail(errors, f'{prefix}: Arabic canonical duplicates {canonical_ar[ar_key]}')
        else:
            canonical_ar[ar_key] = slug
        if en_key in canonical_en:
            fail(errors, f'{prefix}: English canonical duplicates {canonical_en[en_key]}')
        else:
            canonical_en[en_key] = slug

        category = str(entity.get('category') or '')
        if category not in ALLOWED_CATEGORIES:
            fail(errors, f'{prefix}: unsupported category {category!r}')
        if entity.get('entity_type') not in ALLOWED_ENTITY_TYPES:
            fail(errors, f'{prefix}: unsupported entity_type')
        if entity.get('status') not in ALLOWED_STATUSES:
            fail(errors, f'{prefix}: invalid pre-publication status')

        legacy = entity.get('legacy_provenance')
        if not isinstance(legacy, list) or not legacy or not all(isinstance(item, str) and item.strip() for item in legacy):
            fail(errors, f'{prefix}: legacy_provenance must be a non-empty string array')
        evidence = entity.get('evidence_priority')
        if not isinstance(evidence, list) or not evidence or not all(isinstance(item, str) and item.strip() for item in evidence):
            fail(errors, f'{prefix}: evidence_priority must be a non-empty string array')

        alias_values: set[str] = set()
        for field, language_re in [('aliases_ar', r'[\u0600-\u06ff]'), ('aliases_en', r'[A-Za-z]')]:
            values = entity.get(field)
            if not isinstance(values, list):
                fail(errors, f'{prefix}: {field} must be an array')
                continue
            for alias in values:
                if not isinstance(alias, str) or not alias.strip():
                    fail(errors, f'{prefix}: {field} contains an empty/non-string alias')
                    continue
                if not re.search(language_re, alias):
                    fail(errors, f'{prefix}: {field} contains a language-mismatched alias {alias!r}')
                key = normalize(alias)
                if key in alias_values:
                    fail(errors, f'{prefix}: duplicate alias after normalization: {alias!r}')
                alias_values.add(key)
        aliases_by_entity[slug] = alias_values

        searchable = json.dumps(entity, ensure_ascii=False).casefold()
        for token in FORBIDDEN:
            if token.casefold() in searchable:
                fail(errors, f'{prefix}: forbidden token {token!r}')

    for slug, aliases in aliases_by_entity.items():
        for alias in aliases:
            owner = canonical_ar.get(alias) or canonical_en.get(alias)
            if owner and owner != slug:
                fail(errors, f'{slug}: alias collides with canonical entity {owner}')

    if errors:
        print(json.dumps({'status': 'failed', 'errors': errors}, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    result = {
        'status': 'passed',
        'version': payload['version'],
        'candidate_entities': len(entities),
        'planned_capacity': capacity,
        'unique_slugs': len(slugs),
        'taxonomy_categories': len(ALLOWED_CATEGORIES),
        'published_automatically': False,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('registry', type=Path)
    args = parser.parse_args()
    validate(args.registry)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
