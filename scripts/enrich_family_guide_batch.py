#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
from typing import Any


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8'))


def stable_sha(records: list[dict[str, Any]]) -> str:
    stable = sorted(records, key=lambda row: str(row.get('source_path') or ''))
    material = json.dumps(stable, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')
    return hashlib.sha256(material).hexdigest()


def body_text(blocks: list[dict[str, Any]]) -> str:
    out: list[str] = []
    for block in blocks:
        kind = block.get('type')
        if kind in {'paragraph','heading','quote','callout'}:
            for key in ('title','text','cite'):
                value = block.get(key)
                if isinstance(value, str) and value.strip():
                    out.append(value.strip())
        elif kind == 'list':
            out.extend(str(x).strip() for x in block.get('items', []) if str(x).strip())
        elif kind == 'table':
            out.extend(str(x).strip() for x in block.get('headers', []) if str(x).strip())
            for row in block.get('rows', []):
                if isinstance(row, list):
                    out.extend(str(x).strip() for x in row if str(x).strip())
        elif kind == 'faq':
            for item in block.get('items', []):
                if not isinstance(item, dict):
                    continue
                for key in ('question','answer'):
                    value = item.get(key)
                    if isinstance(value, str) and value.strip():
                        out.append(value.strip())
    return '\n\n'.join(out)


def section_blocks(section: dict[str, Any]) -> list[dict[str, Any]]:
    blocks: list[dict[str, Any]] = []
    heading = str(section.get('heading') or '').strip()
    if heading:
        blocks.append({'type':'heading','level':2,'text':heading})
    for paragraph in section.get('paragraphs', []):
        text = str(paragraph).strip()
        if text:
            blocks.append({'type':'paragraph','text':text})
    items = [str(x).strip() for x in section.get('items', []) if str(x).strip()]
    if items:
        blocks.append({'type':'list','ordered':False,'items':items})
    return blocks


def merge_refs(existing: list[Any], additional: list[Any]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw in [*existing, *additional]:
        if not isinstance(raw, dict):
            continue
        url = str(raw.get('url') or '').strip()
        title = str(raw.get('title') or '').strip()
        if not url.startswith('https://') or not title:
            continue
        if url in seen:
            continue
        seen.add(url)
        item: dict[str, Any] = {'title':title[:400], 'url':url}
        publisher = str(raw.get('publisher') or '').strip()
        if publisher:
            item['publisher'] = publisher[:200]
        year = raw.get('year')
        if isinstance(year, (str, int)) and str(year).strip():
            item['year'] = year
        result.append(item)
    return result


def enrich(payload_path: Path, enrichment_path: Path) -> dict[str, Any]:
    envelope = load(payload_path)
    enrichment = load(enrichment_path)
    profiles = enrichment.get('profiles') if isinstance(enrichment, dict) else None
    if not isinstance(profiles, dict):
        raise SystemExit('enrichment profiles must be an object keyed by target slug')
    records = envelope.get('records')
    if not isinstance(records, list) or not records:
        raise SystemExit('payload records must be a non-empty array')

    changed = 0
    for row in records:
        if not isinstance(row, dict):
            continue
        slug = str(row.get('slug') or '')
        profile = profiles.get(slug)
        if not isinstance(profile, dict):
            raise SystemExit(f'missing enrichment profile for {slug}')
        root = row.get('body_json') if isinstance(row.get('body_json'), dict) else {}
        original = root.get('blocks') if isinstance(root.get('blocks'), list) else []
        original = [block for block in original if isinstance(block, dict)]
        if original and original[0].get('type') == 'paragraph':
            original = original[1:]

        blocks: list[dict[str, Any]] = []
        definition = str(profile.get('definition') or '').strip()
        if definition:
            blocks.extend([
                {'type':'heading','level':2,'text':'التعريف العلمي الذي تنطلق منه الخطة'},
                {'type':'paragraph','text':definition},
            ])
        for section in profile.get('pre_sections', []):
            if isinstance(section, dict):
                blocks.extend(section_blocks(section))
        blocks.extend(original)
        for section in profile.get('sections', []):
            if isinstance(section, dict):
                blocks.extend(section_blocks(section))
        faq = profile.get('faq') if isinstance(profile.get('faq'), list) else []
        faq_items = []
        for item in faq:
            if not isinstance(item, dict):
                continue
            q = str(item.get('question') or '').strip()
            a = str(item.get('answer') or '').strip()
            if q and a:
                faq_items.append({'question':q, 'answer':a})
        if faq_items:
            blocks.append({'type':'heading','level':2,'text':'أسئلة الأسرة الشائعة'})
            blocks.append({'type':'faq','items':faq_items})

        text = body_text(blocks)
        row['body_json'] = {'blocks':blocks}
        row['body_text'] = text
        summary = str(profile.get('excerpt') or definition).strip()
        if summary:
            row['excerpt'] = summary[:1000]
        image_slug = str(profile.get('image_slug') or slug.removeprefix('family-guide-')).strip()
        row['featured_image_url'] = f'/family-guide/images/{image_slug}'
        row['featured_image_alt'] = str(profile.get('featured_image_alt') or row.get('title') or '').strip()
        existing_refs = row.get('references_json') if isinstance(row.get('references_json'), list) else []
        additional_refs = profile.get('references') if isinstance(profile.get('references'), list) else []
        row['references_json'] = merge_refs(existing_refs, additional_refs)
        schema = row.get('schema_json') if isinstance(row.get('schema_json'), dict) else {}
        schema['family_guide_enriched'] = True
        schema['family_guide_evidence_reviewed_at'] = enrichment.get('reviewed_at')
        schema['family_guide_final_word_count'] = len(text.split())
        schema['family_guide_reference_count'] = len(row['references_json'])
        schema['family_guide_enrichment_version'] = enrichment.get('version')
        row['schema_json'] = schema
        changed += 1

    envelope['records_sha256'] = stable_sha(records)
    envelope['family_guide_enrichment'] = {
        'version': enrichment.get('version'),
        'reviewed_at': enrichment.get('reviewed_at'),
        'records_enriched': changed,
    }
    payload_path.write_text(json.dumps(envelope, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    result = {
        'status':'passed',
        'records_enriched':changed,
        'records_sha256':envelope['records_sha256'],
        'min_words':min(len(str(row.get('body_text') or '').split()) for row in records),
        'max_words':max(len(str(row.get('body_text') or '').split()) for row in records),
        'min_references':min(len(row.get('references_json') or []) for row in records),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('payload', type=Path)
    parser.add_argument('enrichment', type=Path)
    args = parser.parse_args()
    enrich(args.payload, args.enrichment)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
