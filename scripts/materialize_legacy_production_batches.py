#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

from legacy_content_extract import BASE_URL, clean, parse_page

SCHEMA_VERSION = 1
DEFAULT_MAX_RECORDS = 200
DEFAULT_MAX_BYTES = 5_000_000

DEVELOPMENT_FAMILIES = {
    'provider-assessment-demo', 'developers', '_audit', 'validation', 'reports',
    'tests', 'test', 'artifacts', 'api',
}
SOURCE_ONLY_FAMILIES = {
    '.home-v234bundle', '.comparisons-v331', '.release-v6',
}
BASELINE_TOKENS = (
    'baseline', 'scaffold', 'skeleton', 'template', 'placeholder', 'preview',
    'demo page', 'test page', 'staging page', 'خط أساس', 'قالب تجريبي',
    'صفحة تجريبية', 'محتوى مؤقت',
)
YMYL_HINTS = (
    'health', 'medical', 'psych', 'mental', 'therapy', 'treatment', 'diagnos',
    'disorder', 'condition', 'medication', 'drug', 'addiction', 'assessment',
    'symptom', 'clinical', 'care-guides', 'special-needs', 'quick-info',
    'encyclopedia', 'psychology', 'صحة', 'نفسي', 'علاج', 'تشخيص', 'اضطراب',
    'دواء', 'أدوية', 'إدمان', 'تقييم', 'أعراض', 'سريري', 'طبي',
)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def source_url_for_path(rel: str) -> str:
    if rel == 'index.html':
        return BASE_URL.rstrip('/') + '/'
    if rel.endswith('/index.html'):
        return BASE_URL.rstrip('/') + '/' + rel[:-len('index.html')]
    return BASE_URL.rstrip('/') + '/' + rel


def extract_jsonld(html: str) -> list[object]:
    values: list[object] = []
    pattern = re.compile(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        flags=re.I | re.S,
    )
    for match in pattern.finditer(html):
        raw = match.group(1).strip()
        if not raw:
            continue
        try:
            values.append(json.loads(raw))
        except Exception:
            values.append({
                '_legacy_invalid_jsonld_sha256': hashlib.sha256(
                    raw.encode('utf-8', errors='ignore')
                ).hexdigest()
            })
    return values


def classify(rel: str, page, text: str, external_refs: list[dict], schema_items: list[object]) -> tuple[str, list[str]]:
    parts = Path(rel).parts
    family = parts[0] if parts else '(root)'
    lowered_probe = ' '.join([rel, page.title or '', page.h1 or '', text[:4000]]).lower()
    flags: list[str] = []

    if family.startswith('.') or family in SOURCE_ONLY_FAMILIES:
        return 'SOURCE_ONLY', ['historical_or_hidden_production_artifact']
    if family in DEVELOPMENT_FAMILIES:
        return 'DEVELOPMENT_ONLY', ['development_or_operational_surface']
    if any(token.lower() in lowered_probe for token in BASELINE_TOKENS):
        return 'BASELINE_ONLY', ['baseline_template_or_preview_signal']

    words = len(text.split())
    ymyl = any(hint.lower() in lowered_probe for hint in YMYL_HINTS)
    if not page.title:
        flags.append('missing_title')
    if not page.h1:
        flags.append('missing_h1')
    if not page.description:
        flags.append('missing_meta_description')
    if not page.canonical:
        flags.append('missing_canonical')
    if 'noindex' in (page.robots or '').lower():
        flags.append('legacy_noindex')
    if words < 500:
        flags.append('thin_under_500_words')
    if ymyl and not external_refs:
        flags.append('ymyl_without_external_reference')
    if not schema_items:
        flags.append('missing_jsonld')

    return ('PUBLISHABLE_AFTER_REPAIR' if flags else 'PUBLISHABLE'), flags


def normalize_reference(link: dict) -> dict:
    href = str(link.get('href') or '').strip()
    label = str(link.get('label') or '').strip()
    host = urlparse(href).netloc.lower() if href else ''
    return {'url': href, 'title': label or href, 'host': host}


def normalize_image(image: dict) -> dict:
    return {
        'src': str(image.get('src') or '').strip(),
        'alt': str(image.get('alt') or '').strip(),
    }


def make_record(root: Path, path: Path) -> dict:
    rel = path.relative_to(root).as_posix()
    raw_bytes = path.read_bytes()
    html = raw_bytes.decode('utf-8', errors='ignore')
    inferred_url = source_url_for_path(rel)
    page = parse_page(html, inferred_url)
    text = clean(' '.join(page.all_text))
    external_links = [link for link in page.links if link.get('kind') == 'external']
    internal_links = [link for link in page.links if link.get('kind') == 'internal']
    schema_items = extract_jsonld(html)
    state, flags = classify(rel, page, text, external_links, schema_items)
    family = rel.split('/', 1)[0] if '/' in rel else '(root)'
    source_url = page.canonical or inferred_url
    return {
        'source_key': f'production-baseline:{rel}',
        'source_kind': 'production-baseline',
        'source_family': family,
        'source_path': rel,
        'source_url': source_url,
        'source_sha256': sha256_bytes(raw_bytes),
        'title': page.title or None,
        'h1': page.h1 or None,
        'meta_description': page.description or None,
        'canonical_url': page.canonical or None,
        'robots': page.robots or None,
        'word_count': len(text.split()),
        'body_json': {'blocks': page.blocks},
        'body_text': text or None,
        'references_json': [normalize_reference(link) for link in external_links],
        'internal_links_json': [
            {
                'url': str(link.get('href') or '').strip(),
                'title': str(link.get('label') or '').strip(),
            }
            for link in internal_links
        ],
        'images_json': [normalize_image(image) for image in page.images],
        'legacy_schema_json': schema_items,
        'migration_state': state,
        'quality_flags': flags,
    }


def serialized_size(value: object) -> int:
    return len(json.dumps(value, ensure_ascii=False, separators=(',', ':')).encode('utf-8'))


def write_batches(records: list[dict], out_dir: Path, max_records: int, max_bytes: int, source_meta: dict) -> list[dict]:
    by_family: dict[str, list[dict]] = defaultdict(list)
    for record in records:
        by_family[str(record['source_family'])].append(record)

    manifest_batches: list[dict] = []
    for family in sorted(by_family):
        family_records = sorted(by_family[family], key=lambda row: str(row['source_path']))
        chunk: list[dict] = []
        chunk_bytes = 0
        part = 1
        safe_family = re.sub(r'[^A-Za-z0-9._-]+', '-', family).strip('-') or 'root'
        family_dir = out_dir / safe_family
        family_dir.mkdir(parents=True, exist_ok=True)

        def flush() -> None:
            nonlocal chunk, chunk_bytes, part
            if not chunk:
                return
            payload = {
                'schema_version': SCHEMA_VERSION,
                'source': source_meta,
                'family': family,
                'records': chunk,
            }
            filename = f'{part:03d}.json'
            path = family_dir / filename
            raw = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
            path.write_bytes(raw + b'\n')
            manifest_batches.append({
                'family': family,
                'path': path.relative_to(out_dir.parent).as_posix(),
                'records': len(chunk),
                'bytes': len(raw) + 1,
                'sha256': sha256_bytes(raw + b'\n'),
            })
            chunk = []
            chunk_bytes = 0
            part += 1

        for record in family_records:
            record_bytes = serialized_size(record)
            if chunk and (len(chunk) >= max_records or chunk_bytes + record_bytes > max_bytes):
                flush()
            chunk.append(record)
            chunk_bytes += record_bytes
        flush()
    return manifest_batches


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('production_root', type=Path)
    parser.add_argument('--output-dir', type=Path, default=Path('data/legacy-production-batches'))
    parser.add_argument('--max-records', type=int, default=DEFAULT_MAX_RECORDS)
    parser.add_argument('--max-bytes', type=int, default=DEFAULT_MAX_BYTES)
    args = parser.parse_args()

    root = args.production_root.resolve()
    if not root.is_dir():
        raise SystemExit(f'production root not found: {root}')
    output_dir = args.output_dir.resolve()
    if output_dir.exists():
        for old in sorted(output_dir.rglob('*'), reverse=True):
            if old.is_file() or old.is_symlink():
                old.unlink()
            elif old.is_dir():
                old.rmdir()
    output_dir.mkdir(parents=True, exist_ok=True)

    html_paths = sorted(root.rglob('*.html'))
    records = [make_record(root, path) for path in html_paths]

    encyclopedia_details = sum(
        1 for row in records
        if re.fullmatch(r'encyclopedia/concept-\d{4}/index\.html', str(row['source_path']))
    )
    quick_info_details = sum(
        1 for row in records
        if str(row['source_path']).startswith('quick-info/')
        and str(row['source_path']) != 'quick-info/index.html'
    )
    if len(records) < 5600:
        raise SystemExit(f'production baseline unexpectedly small: {len(records)} HTML pages')
    if encyclopedia_details != 2000:
        raise SystemExit(f'expected 2000 encyclopedia detail pages, found {encyclopedia_details}')
    if quick_info_details < 390:
        raise SystemExit(f'quick-info detail inventory unexpectedly small: {quick_info_details}')

    source_meta = {
        'kind': 'validated-production-site',
        'artifact_id': os.environ.get('LEGACY_BASELINE_ARTIFACT_ID') or None,
        'artifact_digest': os.environ.get('LEGACY_BASELINE_DIGEST') or None,
        'head_sha': os.environ.get('LEGACY_BASELINE_HEAD_SHA') or None,
    }
    batches = write_batches(records, output_dir, args.max_records, args.max_bytes, source_meta)
    state_counts = Counter(str(row['migration_state']) for row in records)
    family_counts = Counter(str(row['source_family']) for row in records)
    summary = {
        'schema_version': SCHEMA_VERSION,
        'source': source_meta,
        'total_html': len(records),
        'encyclopedia_detail_pages': encyclopedia_details,
        'quick_info_detail_pages': quick_info_details,
        'migration_state_counts': dict(sorted(state_counts.items())),
        'family_counts': dict(sorted(family_counts.items(), key=lambda item: (-item[1], item[0]))),
        'batch_count': len(batches),
        'total_batch_bytes': sum(int(item['bytes']) for item in batches),
    }
    manifest = {'summary': summary, 'batches': batches}
    (output_dir / 'manifest.json').write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
    )
    (output_dir / 'summary.json').write_text(
        json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8'
    )
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
