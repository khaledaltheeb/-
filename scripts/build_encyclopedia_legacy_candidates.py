#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path
from typing import Any

V280 = Path('content/v280/capabilities-100-ar.json')
V281_FILES = (
    Path('content/v281/conditions/chromatin-syndromic.jsonl'),
    Path('content/v281/conditions/developmental-epileptic.jsonl'),
    Path('content/v281/conditions/metabolic-neurodegenerative.jsonl'),
)

CATEGORY_EVIDENCE: dict[str, list[str]] = {
    'neurodevelopmental-learning': ['WHO ICD-11', 'condition-specific guideline', 'systematic review'],
    'intellectual-developmental': ['WHO ICD-11', 'WHO ICF', 'AAIDD or equivalent professional guidance'],
    'language-communication': ['WHO ICD-11', 'ASHA/RCSLT or equivalent professional guidance', 'systematic review'],
    'genetic-chromosomal': ['GeneReviews/NCBI Bookshelf', 'condition-specific consensus guideline', 'MedlinePlus Genetics or equivalent official source'],
    'metabolic-rare': ['GeneReviews/NCBI Bookshelf', 'condition-specific guideline or consensus', 'current specialist review'],
    'neurological-epileptic': ['WHO/NICE or relevant neurological guideline', 'ILAE/AAN or equivalent specialist guidance', 'systematic review'],
    'motor-neuromuscular': ['WHO Rehabilitation', 'condition-specific guideline', 'systematic review'],
    'hearing-deafness': ['WHO hearing guidance', 'NIDCD or equivalent official source', 'professional audiology guidance'],
    'vision-blindness': ['WHO vision guidance', 'NEI or equivalent official source', 'professional ophthalmology/low-vision guidance'],
    'mental-behavioral-functional': ['WHO ICD-11', 'NICE/APA or equivalent guideline', 'systematic review'],
    'chronic-acquired': ['relevant national/international guideline', 'systematic review', 'official health authority'],
    'multiple-complex': ['WHO ICF', 'condition-specific multidisciplinary guidance', 'assistive/accessibility evidence'],
}

METABOLIC_TOKENS = {
    'phenylketonuria', 'congenital-hypothyroidism', 'mitochondrial-diseases',
    'menkes-disease', 'wilson-disease', 'maple-syrup-urine-disease',
    'homocystinuria-cbs-deficiency', 'mucopolysaccharidosis-type-i',
    'mucopolysaccharidosis-type-ii', 'mucopolysaccharidosis-type-iii',
    'mucopolysaccharidosis-type-iv', 'mucopolysaccharidosis-type-vi',
    'gaucher-disease', 'fabry-disease', 'pompe-disease',
    'niemann-pick-disease-type-c', 'metachromatic-leukodystrophy',
}

NEUROLOGICAL_TOKENS = (
    'epilep', 'hydrocephal', 'brain-injury', 'stroke', 'multiple-sclerosis',
    'parkinson', 'huntington', 'amyotrophic', 'ataxia', 'dystonia', 'seizure',
)

LANGUAGE_TOKENS = (
    'language', 'speech', 'stuttering', 'apraxia', 'communication',
    'auditory-processing', 'aphasia', 'dysarthria',
)

VISION_TOKENS = ('blind', 'vision', 'visual', 'retinitis', 'optic-', 'albinism')
HEARING_TOKENS = ('hearing', 'deaf')
MENTAL_TOKENS = ('schizophrenia', 'bipolar', 'psychosis', 'depression', 'anxiety', 'obsessive')


def normalize(value: str) -> str:
    value = unicodedata.normalize('NFKC', value).strip().casefold()
    value = re.sub(r'[\u064b-\u065f\u0670]', '', value)
    value = value.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا').replace('ى', 'ي')
    value = re.sub(r'[^\w\u0600-\u06ff]+', ' ', value, flags=re.UNICODE)
    return re.sub(r'\s+', ' ', value).strip()


def read_json(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise ValueError(f'Expected JSON object: {path}')
    return value


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for line_no, line in enumerate(path.read_text(encoding='utf-8').splitlines(), start=1):
        text = line.strip()
        if not text:
            continue
        value = json.loads(text)
        if not isinstance(value, dict):
            raise ValueError(f'Expected object at {path}:{line_no}')
        rows.append(value)
    return rows


def load_legacy(legacy_root: Path) -> list[dict[str, Any]]:
    v280_path = legacy_root / V280
    v280 = read_json(v280_path)
    rows280 = v280.get('conditions')
    if not isinstance(rows280, list) or len(rows280) != 100:
        raise ValueError(f'Expected exactly 100 v280 conditions, found {len(rows280) if isinstance(rows280, list) else "invalid"}')

    rows: list[dict[str, Any]] = []
    for row in rows280:
        if not isinstance(row, dict):
            raise ValueError('v280 conditions must be objects')
        rows.append({**row, '_source_path': V280.as_posix(), '_batch': 'v280'})

    rows281: list[dict[str, Any]] = []
    for rel in V281_FILES:
        path = legacy_root / rel
        current = read_jsonl(path)
        for row in current:
            rows281.append({**row, '_source_path': rel.as_posix(), '_batch': 'v281'})
    if len(rows281) != 50:
        raise ValueError(f'Expected exactly 50 v281 conditions, found {len(rows281)}')
    rows.extend(rows281)

    ranks = [int(row.get('rank') or 0) for row in rows]
    if sorted(ranks) != list(range(1, 151)):
        raise ValueError('Legacy source ranks must be exactly 1..150')
    slugs = [str(row.get('slug') or '').strip() for row in rows]
    if len(set(slugs)) != 150 or not all(slugs):
        raise ValueError('Legacy source must contain 150 unique non-empty slugs')
    return rows


def infer_category(row: dict[str, Any], manual: dict[str, str]) -> str:
    slug = str(row.get('slug') or '').strip()
    if slug in manual:
        return manual[slug]

    old = str(row.get('category') or '').strip()
    if old == 'chromatin-syndromic':
        return 'genetic-chromosomal'
    if old == 'developmental-epileptic':
        return 'neurological-epileptic'
    if old == 'metabolic-neurodegenerative':
        return 'metabolic-rare'
    if old == 'genetic-metabolic':
        return 'metabolic-rare' if slug in METABOLIC_TOKENS else 'genetic-chromosomal'
    if old == 'neurodevelopmental-learning':
        if slug in {'intellectual-developmental-disorder', 'global-developmental-delay'} or 'intellectual' in slug:
            return 'intellectual-developmental'
        if any(token in slug for token in LANGUAGE_TOKENS):
            return 'language-communication'
        return 'neurodevelopmental-learning'
    if old == 'motor-neurological':
        if any(token in slug for token in NEUROLOGICAL_TOKENS):
            return 'neurological-epileptic'
        return 'motor-neuromuscular'
    if old == 'sensory-communication':
        if any(token in slug for token in HEARING_TOKENS):
            return 'hearing-deafness'
        if any(token in slug for token in VISION_TOKENS):
            return 'vision-blindness'
        return 'language-communication'
    if old == 'chronic-health':
        return 'chronic-acquired'
    if old == 'progressive-psychosocial':
        if any(token in slug for token in MENTAL_TOKENS):
            return 'mental-behavioral-functional'
        if any(token in slug for token in NEUROLOGICAL_TOKENS):
            return 'neurological-epileptic'
        return 'chronic-acquired'
    raise ValueError(f'Unsupported legacy category {old!r} for {slug}')


def infer_entity_type(row: dict[str, Any]) -> str:
    slug = str(row.get('slug') or '').strip().lower()
    ar = str(row.get('title_ar') or '').strip()
    en = str(row.get('title_en') or '').strip().lower()
    if 'متلازم' in ar or 'syndrome' in slug or 'syndrome' in en:
        return 'syndrome'
    if 'اضطراب' in ar or 'disorder' in en or 'disorder' in slug:
        return 'disorder'
    if 'مرض' in ar or 'داء ' in ar or 'disease' in en or '-disease' in slug:
        return 'disease'
    if slug in {'cerebral-palsy', 'blindness', 'low-vision', 'deafness', 'hearing-loss', 'deafblindness'}:
        return 'disability'
    return 'condition'


def add_alias(values: list[str], candidate: str, canonical: str) -> None:
    text = str(candidate or '').strip()
    if not text or normalize(text) == normalize(canonical):
        return
    if normalize(text) not in {normalize(item) for item in values}:
        values.append(text)


def build(legacy_root: Path, curated_path: Path, overrides_path: Path) -> dict[str, Any]:
    curated = read_json(curated_path)
    overrides = read_json(overrides_path)
    if curated.get('version') != 1 or overrides.get('version') != 1:
        raise ValueError('Curated registry and overrides must use version 1')

    superseded = {str(item) for item in overrides.get('superseded_curated_slugs', [])}
    slug_overrides = {str(k): str(v) for k, v in dict(overrides.get('canonical_slug_overrides') or {}).items()}
    manual_categories = {str(k): str(v) for k, v in dict(overrides.get('manual_category_overrides') or {}).items()}

    source_rows = load_legacy(legacy_root)
    result_by_slug: dict[str, dict[str, Any]] = {}
    curated_by_slug: dict[str, dict[str, Any]] = {}
    for entity in curated.get('entities', []):
        if not isinstance(entity, dict):
            continue
        slug = str(entity.get('slug') or '').strip()
        if not slug or slug in superseded:
            continue
        curated_by_slug[slug] = json.loads(json.dumps(entity, ensure_ascii=False))

    for row in source_rows:
        legacy_slug = str(row.get('slug') or '').strip()
        canonical_slug = slug_overrides.get(legacy_slug, legacy_slug)
        title_ar = str(row.get('title_ar') or '').strip()
        title_en = str(row.get('title_en') or '').strip()
        source_path = str(row['_source_path'])
        category = infer_category(row, manual_categories)

        entity = result_by_slug.get(canonical_slug)
        if entity is None:
            curated_entity = curated_by_slug.get(canonical_slug)
            if curated_entity is not None:
                entity = curated_entity
                entity['legacy_provenance'] = list(dict.fromkeys(str(x) for x in entity.get('legacy_provenance', []) if str(x).strip()))
                entity['aliases_ar'] = [str(x) for x in entity.get('aliases_ar', []) if str(x).strip()]
                entity['aliases_en'] = [str(x) for x in entity.get('aliases_en', []) if str(x).strip()]
            else:
                entity = {
                    'slug': canonical_slug,
                    'title_ar': title_ar,
                    'title_en': title_en,
                    'aliases_ar': [],
                    'aliases_en': [],
                    'category': category,
                    'entity_type': infer_entity_type(row),
                    'legacy_provenance': [],
                    'evidence_priority': CATEGORY_EVIDENCE[category],
                    'status': 'candidate',
                }
            entity['legacy_sources'] = []
            result_by_slug[canonical_slug] = entity

        if source_path not in entity['legacy_provenance']:
            entity['legacy_provenance'].append(source_path)
        add_alias(entity['aliases_ar'], title_ar, str(entity['title_ar']))
        add_alias(entity['aliases_en'], title_en, str(entity['title_en']))

        legacy_source: dict[str, Any] = {
            'batch': str(row['_batch']),
            'rank': int(row.get('rank') or 0),
            'slug': legacy_slug,
            'source_path': source_path,
        }
        evidence_route = str(row.get('evidence_route') or '').strip()
        if evidence_route:
            legacy_source['evidence_route'] = evidence_route
        source_url = str(row.get('source_url') or '').strip()
        if source_url.startswith('https://'):
            legacy_source['legacy_reference_url'] = source_url
        entity['legacy_sources'].append(legacy_source)

    legacy_canonical_slugs = set(result_by_slug)
    curated_without_legacy = sorted(set(curated_by_slug) - legacy_canonical_slugs)
    if curated_without_legacy:
        raise ValueError(f'Curated entities are not represented in the 150-source corpus: {curated_without_legacy}')

    entities = list(result_by_slug.values())
    for entity in entities:
        sources = entity.get('legacy_sources') if isinstance(entity.get('legacy_sources'), list) else []
        entity['legacy_sources'] = sorted(sources, key=lambda item: int(item.get('rank') or 0))
        entity['legacy_rank'] = min(int(item.get('rank') or 0) for item in entity['legacy_sources'])
        entity['legacy_provenance'] = list(dict.fromkeys(entity['legacy_provenance']))
        entity['aliases_ar'] = list(dict.fromkeys(entity['aliases_ar']))
        entity['aliases_en'] = list(dict.fromkeys(entity['aliases_en']))
        category = str(entity.get('category') or '')
        if category not in CATEGORY_EVIDENCE:
            raise ValueError(f'Unsupported final category {category!r} for {entity.get("slug")}')
        if not entity.get('evidence_priority'):
            entity['evidence_priority'] = CATEGORY_EVIDENCE[category]
        entity['status'] = 'candidate'

    entities.sort(key=lambda item: (int(item.get('legacy_rank') or 9999), str(item.get('slug') or '')))
    source_count = len(source_rows)
    canonical_count = len(entities)
    merged_count = source_count - canonical_count

    return {
        'version': 1,
        'name': curated.get('name'),
        'target_published_pages': curated.get('target_published_pages'),
        'status': 'legacy-materialized-candidate-registry',
        'note': 'مادة استرداد Canonical من المستودع القديم. جميع السجلات مرشحات قبل النشر وتحتاج بحثًا حديثًا ومراجعة علمية وتحريرية وSEO.',
        'categories': curated.get('categories'),
        'source_entity_count': source_count,
        'canonical_candidate_count': canonical_count,
        'merged_source_count': merged_count,
        'legacy_batches': {'v280': 100, 'v281': 50},
        'superseded_curated_slugs': sorted(superseded),
        'entities': entities,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('legacy_root', type=Path)
    parser.add_argument('--curated', type=Path, default=Path('data/encyclopedia/entity-registry-v1.json'))
    parser.add_argument('--overrides', type=Path, default=Path('data/encyclopedia/legacy-canonical-overrides-v1.json'))
    parser.add_argument('--output', type=Path, default=Path('data/encyclopedia/generated/legacy-candidates-v1.json'))
    args = parser.parse_args()

    payload = build(args.legacy_root.resolve(), args.curated, args.overrides)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({
        'status': 'built',
        'source_entities': payload['source_entity_count'],
        'canonical_candidates': payload['canonical_candidate_count'],
        'merged_sources': payload['merged_source_count'],
        'output': args.output.as_posix(),
    }, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
