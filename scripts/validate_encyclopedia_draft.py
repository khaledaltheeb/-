#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

ALLOWED_BLOCKS = {'paragraph', 'heading', 'list', 'quote', 'callout', 'table', 'resource', 'image', 'faq', 'divider'}
FORBIDDEN = ('<script', '<style', 'javascript:', 'معاقين')
WORD_RE = re.compile(r'[\u0600-\u06ffA-Za-z0-9]+')
ARABIC_RE = re.compile(r'[\u0600-\u06ff]')


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise SystemExit(f'expected JSON object: {path}')
    return value


def research_record(plan: dict[str, Any], slug: str) -> dict[str, Any]:
    matches = [row for row in plan.get('records', []) if isinstance(row, dict) and row.get('slug') == slug]
    if len(matches) != 1:
        raise SystemExit(f'expected one research record for {slug}, found {len(matches)}')
    return matches[0]


def text_fragments(value: Any) -> list[str]:
    out: list[str] = []
    if isinstance(value, str):
        if not value.startswith('https://'):
            out.append(value)
    elif isinstance(value, list):
        for item in value:
            out.extend(text_fragments(item))
    elif isinstance(value, dict):
        for key, item in value.items():
            if key in {'url', 'src', 'id', 'section_id'}:
                continue
            out.extend(text_fragments(item))
    return out


def validate(draft_path: Path, plan_path: Path) -> dict[str, Any]:
    payload = load(draft_path)
    plan = load(plan_path)
    errors: list[str] = []

    def fail(message: str) -> None:
        errors.append(message)

    if payload.get('version') != 1:
        fail('draft version must be 1')
    if payload.get('status') not in {'draft', 'scientific_review'}:
        fail('draft status must be draft or scientific_review')
    if payload.get('publication_ready') is not False:
        fail('publication_ready must remain false before external/scientific review')
    if payload.get('research_cutoff_date') != plan.get('research_cutoff_date'):
        fail('draft research_cutoff_date must match research plan')

    record = payload.get('record') if isinstance(payload.get('record'), dict) else {}
    content_slug = str(record.get('slug') or '')
    if not content_slug.startswith('encyclopedia-'):
        fail('content slug must use encyclopedia- prefix')
    route_slug = content_slug.replace('encyclopedia-', '', 1)
    plan_record = research_record(plan, route_slug)

    if record.get('content_type') != 'condition':
        fail('content_type must be condition')
    if record.get('canonical_url') != f'/encyclopedia/{route_slug}/':
        fail('canonical_url does not match encyclopedia route')
    if record.get('robots_index') is not False or record.get('robots_follow') is not False:
        fail('draft must remain noindex,nofollow')
    if record.get('primary_keyword') != plan_record.get('primary_keyword'):
        fail('primary keyword must match research plan')
    if len(str(record.get('seo_description') or '').strip()) < 100:
        fail('seo_description must be at least 100 characters')
    if len(str(record.get('medical_disclaimer') or '').strip()) < 120:
        fail('medical_disclaimer is missing or too short')

    schema = record.get('schema_json') if isinstance(record.get('schema_json'), dict) else {}
    evidence = schema.get('evidence') if isinstance(schema.get('evidence'), dict) else {}
    if schema.get('page_role') != 'encyclopedia-condition':
        fail('schema page_role must be encyclopedia-condition')
    if schema.get('publication_ready') is not False:
        fail('schema publication_ready must remain false')
    if evidence.get('risk_tier') != plan_record.get('risk_tier'):
        fail('evidence risk_tier must match research plan')
    if evidence.get('research_cutoff_date') != plan.get('research_cutoff_date'):
        fail('schema evidence cutoff must match research plan')
    if evidence.get('review_status') != 'scientific-review-required':
        fail('scientific review must remain required')
    if evidence.get('external_review_completed') is not False:
        fail('external review must not be claimed')

    body = record.get('body_json') if isinstance(record.get('body_json'), dict) else {}
    blocks = body.get('blocks') if isinstance(body.get('blocks'), list) else []
    if len(blocks) < 30:
        fail(f'draft requires substantial structured content; found {len(blocks)} blocks')

    heading_ids: set[str] = set()
    h2_count = 0
    h3_count = 0
    faq_count = 0
    for index, block in enumerate(blocks, start=1):
        if not isinstance(block, dict):
            fail(f'block {index}: must be an object')
            continue
        block_type = block.get('type')
        if block_type not in ALLOWED_BLOCKS:
            fail(f'block {index}: unsupported type {block_type!r}')
            continue
        if block_type == 'heading':
            level = block.get('level')
            if level not in {2, 3}:
                fail(f'block {index}: encyclopedia body headings must be H2 or H3')
            if level == 2:
                h2_count += 1
            if level == 3:
                h3_count += 1
            section_id = str(block.get('section_id') or '').strip()
            if not section_id or section_id in heading_ids:
                fail(f'block {index}: heading section_id must be unique and non-empty')
            heading_ids.add(section_id)
        if block_type == 'faq':
            items = block.get('items') if isinstance(block.get('items'), list) else []
            faq_count += len(items)
            for item in items:
                if not isinstance(item, dict):
                    fail(f'block {index}: FAQ item must be an object')
                    continue
                question = str(item.get('question') or '').strip()
                answer = str(item.get('answer') or '').strip()
                if len(question) < 10 or len(answer) < 60 or not ARABIC_RE.search(question + answer):
                    fail(f'block {index}: FAQ question/answer is too shallow')

    planned_sections = {
        str(section.get('id') or '')
        for section in plan_record.get('required_sections', [])
        if isinstance(section, dict)
    }
    missing_planned = planned_sections - heading_ids
    if missing_planned:
        fail(f'draft is missing planned section ids: {sorted(missing_planned)}')
    if h2_count < 10:
        fail(f'draft requires at least 10 H2 headings, found {h2_count}')
    if h3_count < 2:
        fail(f'draft requires at least 2 H3 headings, found {h3_count}')
    if faq_count < 8:
        fail(f'draft requires at least 8 FAQs, found {faq_count}')

    body_strings = text_fragments(body)
    body_words = WORD_RE.findall(' '.join(body_strings))
    if len(body_words) < 1500:
        fail(f'draft body must contain at least 1500 words/tokens, found {len(body_words)}')

    refs = record.get('references_json') if isinstance(record.get('references_json'), list) else []
    plan_sources = plan_record.get('sources') if isinstance(plan_record.get('sources'), list) else []
    plan_source_ids = {str(source.get('id') or '') for source in plan_sources if isinstance(source, dict)}
    ref_ids = {str(ref.get('id') or '') for ref in refs if isinstance(ref, dict)}
    if len(refs) < 6:
        fail('at least 6 references required')
    if ref_ids != plan_source_ids:
        fail('draft references must exactly match the reviewed source plan for this first draft')
    for ref in refs:
        if not isinstance(ref, dict):
            fail('reference must be an object')
            continue
        if not str(ref.get('url') or '').startswith('https://') or len(str(ref.get('title') or '').strip()) < 3:
            fail('each reference requires title and HTTPS URL')

    claim_map = payload.get('claim_source_map') if isinstance(payload.get('claim_source_map'), list) else []
    if len(claim_map) < 8:
        fail('claim_source_map requires at least 8 material claims')
    claim_ids: set[str] = set()
    for item in claim_map:
        if not isinstance(item, dict):
            fail('claim-source item must be an object')
            continue
        claim_id = str(item.get('claim_id') or '').strip()
        claim = str(item.get('claim') or '').strip()
        source_ids = item.get('source_ids') if isinstance(item.get('source_ids'), list) else []
        if not claim_id or claim_id in claim_ids:
            fail('claim ids must be unique and non-empty')
        claim_ids.add(claim_id)
        if len(claim) < 30:
            fail(f'claim {claim_id}: statement is too shallow')
        if not source_ids or any(str(source_id) not in ref_ids for source_id in source_ids):
            fail(f'claim {claim_id}: source_ids must resolve to reviewed references')

    searchable = json.dumps(payload, ensure_ascii=False).casefold()
    for token in FORBIDDEN:
        if token.casefold() in searchable:
            fail(f'forbidden token found: {token}')

    if errors:
        print(json.dumps({'status': 'failed', 'errors': errors}, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    result = {
        'status': 'passed',
        'draft_id': payload.get('draft_id'),
        'route_slug': route_slug,
        'body_blocks': len(blocks),
        'body_words': len(body_words),
        'h2': h2_count,
        'h3': h3_count,
        'faqs': faq_count,
        'references': len(refs),
        'claim_source_links': len(claim_map),
        'publication_ready': False,
        'scientific_review_required': True,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('draft', type=Path)
    parser.add_argument('--plan', type=Path, default=Path('data/encyclopedia/research/batch-01-source-plan.json'))
    args = parser.parse_args()
    validate(args.draft, args.plan)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
