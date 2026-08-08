#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path
from typing import Any

URL_RE = re.compile(r'https://[^\s\]\[()<>{}"\']+')
META_KEYS = {'slug','title','audience','search_intent','summary','seo','metadata','version','language'}
URL_KEYS = {'url','href','link','source_url','canonical_url'}
TITLE_KEYS = ('title','name','label','source','publisher','organization','citation')
LABELS = {
    'understanding': 'فهم اضطراب نقص الانتباه وفرط النشاط',
    'what_the_person_may_feel': 'ما الذي قد يشعر به الطفل أو المراهق؟',
    'do': 'ما الذي يساعد عمليًا؟',
    'avoid': 'ما الذي ينبغي تجنبه؟',
    'home': 'في المنزل',
    'home_plan': 'خطة عملية في المنزل',
    'school': 'في المدرسة',
    'school_plan': 'خطة عملية في المدرسة',
    'teacher': 'دور المعلم',
    'family': 'دور الأسرة',
    'homework': 'الواجبات والمهام اليومية',
    'routines': 'الروتين والتنظيم اليومي',
    'sleep': 'النوم',
    'emotions': 'تنظيم الانفعالات',
    'communication': 'التواصل',
    'treatment': 'العلاج والمتابعة',
    'medication': 'الأدوية والمتابعة الآمنة',
    'medication_monitoring': 'متابعة العلاج الدوائي',
    'side_effects': 'الآثار الجانبية وما يجب مراقبته',
    'professional_follow_up': 'المتابعة المهنية',
    'assessment': 'التقييم',
    'diagnosis': 'التشخيص',
    'comorbidities': 'الحالات المصاحبة',
    'executive_functions': 'الوظائف التنفيذية',
    'strengths': 'نقاط القوة',
    'goals': 'الأهداف العملية',
    'monitoring': 'المتابعة وقياس التقدم',
    'progress': 'قياس التقدم',
    'checklist': 'قائمة تحقق',
    'practical_steps': 'خطوات عملية',
    'daily_plan': 'خطة يومية',
    'transitions': 'الانتقالات والتغيرات',
    'adolescents': 'المراهقون',
    'young_adults': 'الشباب',
    'adults': 'البالغون',
    'parent_wellbeing': 'رفاه الوالدين ومقدمي الرعاية',
    'caregiver_wellbeing': 'رفاه مقدم الرعاية',
    'sibling_support': 'دعم الإخوة',
    'safety': 'السلامة',
    'red_flags': 'مؤشرات تستدعي الانتباه',
    'when_to_seek_help': 'متى نطلب مساعدة مهنية؟',
    'crisis': 'متى تصبح الحالة طارئة؟',
    'examples': 'أمثلة تطبيقية',
    'myths': 'مفاهيم شائعة تحتاج تصحيحًا',
    'misconceptions': 'مفاهيم شائعة تحتاج تصحيحًا',
    'faq': 'أسئلة شائعة',
    'questions': 'أسئلة شائعة',
    'references': 'المصادر والمراجع',
    'sources': 'المصادر والمراجع',
    'official_sources': 'المصادر الرسمية',
    'evidence': 'الأدلة العلمية',
    'resources': 'موارد إضافية',
    'rights': 'الحقوق والإسناد',
    'privacy': 'الخصوصية',
    'notes': 'ملاحظات مهمة',
    'key_points': 'نقاط أساسية',
    'school_accommodations': 'التسهيلات المدرسية',
    'accommodations': 'التسهيلات والدعم',
    'behavior_support': 'دعم السلوك',
    'reinforcement': 'التعزيز',
    'organization': 'التنظيم',
    'time_management': 'إدارة الوقت',
    'technology': 'استخدام التقنية بصورة مساعدة',
    'sports_and_activity': 'الحركة والنشاط البدني',
    'nutrition': 'التغذية',
    'social_relationships': 'العلاقات الاجتماعية',
    'self_advocacy': 'المناصرة الذاتية والاستقلال',
}


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8'))


def ordered_unique(items: list[str]) -> list[str]:
    result: list[str] = []
    for item in items:
        value = str(item).strip()
        if value and value not in result:
            result.append(value)
    return result


def label_for(key: str) -> str:
    return LABELS.get(key, 'تفاصيل إضافية')


def all_strings(value: Any, *, skip_keys: set[str] | None = None) -> list[str]:
    skip = skip_keys or set()
    out: list[str] = []
    if isinstance(value, str):
        text = value.strip()
        if text and not text.startswith('https://'):
            out.append(text)
    elif isinstance(value, list):
        for item in value:
            out.extend(all_strings(item, skip_keys=skip))
    elif isinstance(value, dict):
        for key, item in value.items():
            if str(key) in skip or str(key) in URL_KEYS:
                continue
            out.extend(all_strings(item, skip_keys=skip))
    return out


def find_structured_record(payload: Any, collection: str, slug: str) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise SystemExit('Structured source root must be an object')
    rows = payload.get(collection)
    if not isinstance(rows, list):
        raise SystemExit(f'Structured collection not found: {collection}')
    matches = [row for row in rows if isinstance(row, dict) and str(row.get('slug') or '') == slug]
    if len(matches) != 1:
        raise SystemExit(f'Expected one structured record for {slug}, found {len(matches)}')
    return matches[0]


def extract_references(value: Any) -> list[dict[str, str]]:
    refs: list[dict[str, str]] = []

    def add(url: str, title: str = '') -> None:
        clean_url = url.strip().rstrip('.,;')
        if not clean_url.startswith('https://'):
            return
        clean_title = title.strip() or clean_url
        item = {'title': clean_title[:400], 'url': clean_url}
        if item not in refs:
            refs.append(item)

    def walk(node: Any) -> None:
        if isinstance(node, str):
            for url in URL_RE.findall(node):
                add(url)
            return
        if isinstance(node, list):
            for item in node:
                walk(item)
            return
        if not isinstance(node, dict):
            return
        title = ''
        for key in TITLE_KEYS:
            if isinstance(node.get(key), str) and node[key].strip():
                title = node[key].strip()
                break
        for key in URL_KEYS:
            if isinstance(node.get(key), str):
                add(node[key], title)
        for item in node.values():
            walk(item)

    walk(value)
    return refs


def structured_blocks(record: dict[str, Any]) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    summary = str(record.get('summary') or '').strip()
    if summary:
        blocks.append({'type': 'paragraph', 'text': summary})

    def render_value(key: str, value: Any, level: int = 2) -> None:
        if value is None or value == '' or value == [] or value == {}:
            return
        heading = label_for(key)
        if isinstance(value, str):
            if value.strip().startswith('https://'):
                return
            blocks.append({'type': 'heading', 'level': min(max(level, 2), 4), 'text': heading})
            blocks.append({'type': 'paragraph', 'text': value.strip()})
            return
        if isinstance(value, list):
            if all(isinstance(item, str) for item in value):
                texts = [str(item).strip() for item in value if str(item).strip() and not str(item).strip().startswith('https://')]
                if texts:
                    blocks.append({'type': 'heading', 'level': min(max(level, 2), 4), 'text': heading})
                    blocks.append({'type': 'list', 'ordered': False, 'items': texts})
                return
            faq_items: list[dict[str, str]] = []
            dict_items = [x for x in value if isinstance(x, dict)]
            for item in dict_items:
                question = str(item.get('question') or item.get('q') or '').strip()
                answer = str(item.get('answer') or item.get('a') or '').strip()
                if question and answer:
                    faq_items.append({'question': question, 'answer': answer})
            if dict_items and faq_items and len(faq_items) == len(dict_items):
                blocks.append({'type': 'faq', 'items': faq_items})
                return
            blocks.append({'type': 'heading', 'level': min(max(level, 2), 4), 'text': heading})
            for item in value:
                if isinstance(item, dict):
                    item_title = str(item.get('title') or item.get('name') or item.get('label') or '').strip()
                    if item_title:
                        blocks.append({'type': 'heading', 'level': min(level + 1, 4), 'text': item_title})
                    for child_key, child_value in item.items():
                        if child_key in META_KEYS or child_key in URL_KEYS or child_key in TITLE_KEYS:
                            continue
                        if isinstance(child_value, str) and child_value.strip() and not child_value.strip().startswith('https://'):
                            blocks.append({'type': 'paragraph', 'text': child_value.strip()})
                        elif isinstance(child_value, list) and all(isinstance(x, str) for x in child_value):
                            texts = [str(x).strip() for x in child_value if str(x).strip() and not str(x).strip().startswith('https://')]
                            if texts:
                                blocks.append({'type': 'list', 'ordered': False, 'items': texts})
                        elif isinstance(child_value, (dict, list)):
                            render_value(str(child_key), child_value, min(level + 1, 4))
                elif isinstance(item, str) and item.strip() and not item.strip().startswith('https://'):
                    blocks.append({'type': 'paragraph', 'text': item.strip()})
            return
        if isinstance(value, dict):
            blocks.append({'type': 'heading', 'level': min(max(level, 2), 4), 'text': heading})
            for child_key, child_value in value.items():
                if child_key in URL_KEYS:
                    continue
                if isinstance(child_value, str) and child_key in TITLE_KEYS:
                    continue
                render_value(str(child_key), child_value, min(level + 1, 4))

    for key, value in record.items():
        if key in META_KEYS or key in URL_KEYS:
            continue
        render_value(str(key), value, 2)
    return blocks


def structured_source(legacy_root: Path, spec: dict[str, Any], source_path: str) -> dict[str, Any]:
    rel = Path(str(spec['structured_source']))
    file_path = (legacy_root / rel).resolve()
    try:
        file_path.relative_to(legacy_root.resolve())
    except ValueError as exc:
        raise SystemExit(f'Structured source escapes legacy root: {rel}') from exc
    raw = file_path.read_bytes()
    payload = json.loads(raw.decode('utf-8'))
    collection = str(spec.get('structured_collection') or 'guides')
    selector_slug = str(spec.get('structured_selector_slug') or spec.get('target_slug') or '')
    record = find_structured_record(payload, collection, selector_slug)
    strings = all_strings(record, skip_keys=META_KEYS)
    body_text = ' '.join(strings).strip()
    words = len(body_text.split())
    return {
        'url': f'https://healthrenewal.org{source_path}',
        'path': source_path,
        'source_html': None,
        'structured_source_file': rel.as_posix(),
        'kind': 'structured-json',
        'title': str(record.get('title') or '').strip(),
        'h1': str(record.get('title') or '').strip(),
        'meta_description': str(record.get('summary') or '').strip(),
        'canonical': f'https://healthrenewal.org{source_path}',
        'word_count': words,
        'sha256': hashlib.sha256(raw).hexdigest(),
        'legacy_asset_refs': {'images': []},
        'references': extract_references(record),
        'internal_links': [],
        'structured_sources': [rel.as_posix()],
        'structured_top_level_keys': list(record.keys()),
        'body_json': {'blocks': structured_blocks(record)},
        'body_text': body_text,
        'source_audience': record.get('audience') if isinstance(record.get('audience'), list) else [],
        'source_search_intent': record.get('search_intent'),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('inventory', type=Path)
    parser.add_argument('config', type=Path)
    parser.add_argument('--legacy-root', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()

    inventory = load(args.inventory)
    config = load(args.config)
    by_path = {str(item.get('path') or ''): item for item in inventory.get('records', [])}
    output_records: list[dict[str, Any]] = []
    legacy_root = args.legacy_root.resolve() if args.legacy_root else None

    defaults = config.get('defaults', {}) if isinstance(config.get('defaults'), dict) else {}
    for spec in config.get('records', []):
        source_path = str(spec['source_path'])
        if spec.get('source_kind') == 'structured_json':
            if legacy_root is None:
                raise SystemExit('--legacy-root is required for structured_json records')
            source = structured_source(legacy_root, spec, source_path)
        else:
            source = by_path.get(source_path)
            if not source or source.get('kind') != 'html' or not source.get('html_exists'):
                raise SystemExit(f'No extracted HTML record for {source_path}')

        target_slug = str(spec['target_slug']).strip()
        title = str(source.get('h1') or source.get('title') or '').strip()
        if not target_slug or not title:
            raise SystemExit(f'Incomplete target identity for {source_path}')
        target_canonical = str(spec.get('target_canonical') or f'/content/{target_slug}').strip()
        if not target_canonical.startswith('/'):
            raise SystemExit(f'Target canonical must be root-relative for {source_path}')

        references = [
            {'title': str(item.get('label') or item.get('title') or item.get('href') or item.get('url') or '').strip(), 'url': str(item.get('href') or item.get('url') or '').strip()}
            for item in source.get('references', [])
            if str(item.get('href') or item.get('url') or '').startswith('https://')
        ]
        primary = str(spec.get('primary_keyword') or title).strip()
        secondary = ordered_unique([str(x) for x in spec.get('secondary_keywords', [])])
        semantic = ordered_unique([str(x) for x in spec.get('semantic_terms', [])])
        source_audience = source.get('source_audience') if isinstance(source.get('source_audience'), list) else []
        audience = ordered_unique([str(x) for x in spec.get('audience', source_audience or defaults.get('audience', []))])
        aliases = ordered_unique([title, primary, *secondary[:3]])
        search_intent = spec.get('search_intent', defaults.get('search_intent', 'informational'))
        if isinstance(search_intent, list):
            search_intent = 'informational'
        schema_json = {
            'migration_source_repo': 'khaledaltheeb/healthrenewal.org',
            'legacy_source_url': source.get('url'),
            'legacy_source_sha256': source.get('sha256'),
            'legacy_source_word_count': source.get('word_count'),
            'legacy_source_html': source.get('source_html'),
            'legacy_structured_source': source.get('structured_source_file'),
            'legacy_structured_top_level_keys': source.get('structured_top_level_keys', []),
            'legacy_canonical': source.get('canonical'),
            'migration_verified_at': config.get('migration_date'),
            'primary_capability': spec.get('primary_capability'),
            'references_preserved': True,
            'internal_links_preserved': True,
            'legacy_internal_links': source.get('internal_links', []),
            'legacy_image_inventory': (source.get('legacy_asset_refs') or {}).get('images', []),
            'structured_sources': source.get('structured_sources', []),
            'batch_id': config.get('batch_id'),
        }
        schema_extras = spec.get('schema_json')
        if isinstance(schema_extras, dict):
            schema_json.update(schema_extras)
        redirect = None if source_path == target_canonical else {
            'source_path': source_path,
            'destination_path': target_canonical,
            'status_code': 301,
        }
        output_records.append({
            'source_path': source_path,
            'content_type': spec.get('content_type', defaults.get('content_type', 'guide')),
            'slug': target_slug,
            'title': title,
            'excerpt': source.get('meta_description'),
            'body_json': source.get('body_json') or {'blocks': []},
            'body_text': source.get('body_text'),
            'sector_slug': spec.get('sector_slug', defaults.get('sector_slug')),
            'category_slug': spec.get('category_slug', defaults.get('category_slug')),
            'audience': audience,
            'seo_title': source.get('title') or title,
            'seo_description': source.get('meta_description'),
            'canonical_url': target_canonical,
            'robots_index': True,
            'robots_follow': True,
            'schema_json': schema_json,
            'search_aliases': aliases,
            'primary_keyword': primary,
            'secondary_keywords': secondary,
            'semantic_terms': semantic,
            'search_intent': search_intent,
            'author_display_name': defaults.get('author_display_name', 'فريق تحرير منصة روافد'),
            'references_json': references,
            'medical_disclaimer': spec.get('medical_disclaimer', defaults.get('medical_disclaimer')),
            'redirect': redirect,
        })

    stable_records = sorted(output_records, key=lambda row: row['source_path'])
    material = json.dumps(stable_records, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')
    envelope = {
        'batch_id': config.get('batch_id'),
        'migration_date': config.get('migration_date'),
        'source_repo': 'khaledaltheeb/healthrenewal.org',
        'destination_repo': 'khaledaltheeb/-',
        'record_count': len(stable_records),
        'records_sha256': hashlib.sha256(material).hexdigest(),
        'contract': {
            'content_only': True,
            'legacy_theme_copied': False,
            'legacy_css_copied': False,
            'legacy_js_copied': False,
            'references_preserved': True,
            'structured_json_supported': True,
            'v3_native_canonical_routes_supported': True,
            'same_route_preserved_without_redirect': True,
            'legacy_images_inventory_only': True,
            'canonical_redirects_required_when_route_changes': True,
        },
        'records': stable_records,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(envelope, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: envelope[k] for k in ('batch_id','record_count','records_sha256','contract')}, ensure_ascii=False, indent=2))
    if len(stable_records) != int(config.get('expected_record_count', len(stable_records))):
        raise SystemExit('Materialized record count differs from expected_record_count')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
