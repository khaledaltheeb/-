#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


def load(path: Path) -> Any:
    return json.loads(path.read_text(encoding='utf-8'))


def stable_bytes(records: list[dict[str, Any]]) -> bytes:
    ordered = sorted(records, key=lambda row: str(row.get('source_path') or ''))
    return json.dumps(ordered, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def clean(value: str) -> str:
    return ' '.join(unescape(value or '').split()).strip()


def ordered_refs(refs: list[dict[str, Any]]) -> list[dict[str, str]]:
    seen: set[str] = set()
    result: list[dict[str, str]] = []
    for ref in refs:
        if not isinstance(ref, dict):
            continue
        url = str(ref.get('url') or '').strip()
        title = str(ref.get('title') or ref.get('label') or url).strip()
        if not url.startswith('https://') or not title or url in seen:
            continue
        seen.add(url)
        result.append({'title': title[:400], 'url': url})
    return result


class DefinitionListExtractor(HTMLParser):
    ignored = {'script', 'style', 'svg', 'noscript', 'template', 'form', 'nav', 'header', 'footer'}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip = 0
        self._main_seen = False
        self._main_depth = 0
        self._body_depth = 0
        self._heading_buffer: list[str] | None = None
        self._last_h3 = ''
        self._dl_active = False
        self._term_buffer: list[str] | None = None
        self._desc_buffer: list[str] | None = None
        self._current_term = ''
        self._rows: list[list[str]] = []
        self.protocol_tables: list[tuple[str, dict[str, Any]]] = []

    def active(self) -> bool:
        if self._skip:
            return False
        return self._main_depth > 0 if self._main_seen else self._body_depth > 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in self.ignored:
            self._skip += 1
            return
        if self._skip:
            return
        if tag == 'body':
            self._body_depth += 1
        if tag == 'main':
            self._main_seen = True
            self._main_depth += 1
        elif self._main_depth and tag == 'section':
            self._main_depth += 1
        if not self.active():
            return
        if tag == 'h3':
            self._heading_buffer = []
        elif tag == 'dl':
            self._dl_active = True
            self._current_term = ''
            self._rows = []
        elif self._dl_active and tag == 'dt':
            self._term_buffer = []
        elif self._dl_active and tag == 'dd':
            self._desc_buffer = []

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag in self.ignored:
            if self._skip:
                self._skip -= 1
            return
        if self._skip:
            return
        if tag == 'h3' and self._heading_buffer is not None:
            self._last_h3 = clean(' '.join(self._heading_buffer))
            self._heading_buffer = None
        elif tag == 'dt' and self._term_buffer is not None:
            self._current_term = clean(' '.join(self._term_buffer))
            self._term_buffer = None
        elif tag == 'dd' and self._desc_buffer is not None:
            desc = clean(' '.join(self._desc_buffer))
            if self._current_term or desc:
                self._rows.append([self._current_term or 'تفصيل', desc])
            self._desc_buffer = None
        elif tag == 'dl' and self._dl_active:
            if self._rows:
                self.protocol_tables.append((
                    self._last_h3,
                    {'type': 'table', 'headers': ['البند', 'التفاصيل'], 'rows': self._rows[:]},
                ))
            self._dl_active = False
            self._current_term = ''
            self._rows = []
        if tag == 'main' and self._main_depth:
            self._main_depth -= 1
        elif self._main_depth and tag == 'section':
            self._main_depth -= 1
        if tag == 'body' and self._body_depth:
            self._body_depth -= 1

    def handle_data(self, data: str) -> None:
        value = clean(data)
        if not value or not self.active():
            return
        if self._heading_buffer is not None:
            self._heading_buffer.append(value)
        if self._term_buffer is not None:
            self._term_buffer.append(value)
        if self._desc_buffer is not None:
            self._desc_buffer.append(value)


def recover_protocol_tables(legacy_root: Path, source_html: str) -> list[tuple[str, dict[str, Any]]]:
    path = (legacy_root / source_html).resolve()
    try:
        path.relative_to(legacy_root.resolve())
    except ValueError as exc:
        raise SystemExit(f'legacy source escapes root: {source_html}') from exc
    if not path.is_file():
        raise SystemExit(f'legacy source file not found: {source_html}')
    parser = DefinitionListExtractor()
    parser.feed(path.read_text(encoding='utf-8', errors='ignore'))
    parser.close()
    return parser.protocol_tables


def merge_protocol_tables(blocks: list[dict[str, Any]], tables: list[tuple[str, dict[str, Any]]]) -> list[dict[str, Any]]:
    by_heading: dict[str, list[dict[str, Any]]] = {}
    for heading, table in tables:
        key = clean(heading)
        if key:
            by_heading.setdefault(key, []).append(table)
    merged: list[dict[str, Any]] = []
    inserted = 0
    for block in blocks:
        merged.append(block)
        if isinstance(block, dict) and block.get('type') == 'heading' and int(block.get('level') or 0) == 3:
            key = clean(str(block.get('text') or ''))
            for table in by_heading.pop(key, []):
                merged.append(table)
                inserted += 1
    if by_heading:
        missing = ', '.join(sorted(by_heading))
        raise SystemExit(f'unmatched legacy protocol definition lists: {missing}')
    if tables and inserted != len(tables):
        raise SystemExit(f'protocol table merge mismatch: inserted={inserted} extracted={len(tables)}')
    return merged


def block_text(block: dict[str, Any]) -> list[str]:
    kind = str(block.get('type') or '')
    if kind in {'paragraph', 'heading', 'quote', 'callout', 'resource'}:
        text = str(block.get('text') or block.get('title') or '').strip()
        return [text] if text else []
    if kind == 'list':
        return [str(item).strip() for item in block.get('items', []) if str(item).strip()]
    if kind == 'table':
        out = [str(item).strip() for item in block.get('headers', []) if str(item).strip()]
        for row in block.get('rows', []):
            if isinstance(row, list):
                out.extend(str(item).strip() for item in row if str(item).strip())
        return out
    if kind == 'faq':
        out: list[str] = []
        for item in block.get('items', []):
            if isinstance(item, dict):
                out.extend([str(item.get('question') or '').strip(), str(item.get('answer') or '').strip()])
        return [item for item in out if item]
    return []


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('payload', type=Path)
    parser.add_argument('config', type=Path)
    parser.add_argument('--legacy-root', type=Path, required=True)
    args = parser.parse_args()

    payload = load(args.payload)
    config = load(args.config)
    records = payload.get('records')
    specs = config.get('records')
    if not isinstance(records, list) or not isinstance(specs, list):
        raise SystemExit('payload/config records must be arrays')

    by_slug = {str(spec.get('target_slug') or ''): spec for spec in specs if isinstance(spec, dict)}
    safety = config.get('safety_contract') if isinstance(config.get('safety_contract'), dict) else {}
    evidence_registries = [str(item) for item in config.get('evidence_registries', []) if str(item).strip()]
    historical_commits = config.get('historical_commits') if isinstance(config.get('historical_commits'), list) else []
    errors: list[str] = []
    final_word_counts: dict[str, int] = {}
    reference_counts: dict[str, int] = {}
    recovered_protocol_tables: dict[str, int] = {}

    if len(records) != 10:
        errors.append(f'expected 10 condition records, got {len(records)}')

    for row in records:
        slug = str(row.get('slug') or '').strip()
        spec = by_slug.get(slug)
        if not isinstance(spec, dict):
            errors.append(f'{slug}: config record missing')
            continue
        if row.get('content_type') != 'condition':
            errors.append(f'{slug}: content_type must be condition')
        if row.get('sector_slug') != 'addiction-recovery' or row.get('category_slug') != 'addiction-conditions':
            errors.append(f'{slug}: wrong V3 sector/category')
        if not str(row.get('source_path') or '').startswith('/addiction/'):
            errors.append(f'{slug}: source must be under /addiction/')

        refs = row.get('references_json') if isinstance(row.get('references_json'), list) else []
        additions = spec.get('additional_references') if isinstance(spec.get('additional_references'), list) else []
        row['references_json'] = ordered_refs([*refs, *additions])
        reference_counts[slug] = len(row['references_json'])
        if reference_counts[slug] < 3:
            errors.append(f'{slug}: requires at least 3 authoritative references, got {reference_counts[slug]}')

        body = row.get('body_json') if isinstance(row.get('body_json'), dict) else {'blocks': []}
        blocks = body.get('blocks') if isinstance(body.get('blocks'), list) else []
        schema = row.get('schema_json') if isinstance(row.get('schema_json'), dict) else {}
        source_html = str(schema.get('legacy_source_html') or '').strip()
        tables = recover_protocol_tables(args.legacy_root, source_html)
        if len(tables) != 10:
            errors.append(f'{slug}: expected 10 historical protocol definition lists, got {len(tables)}')
        else:
            try:
                blocks = merge_protocol_tables(blocks, tables)
            except SystemExit as exc:
                errors.append(f'{slug}: {exc}')
        recovered_protocol_tables[slug] = len(tables)

        enrichment = spec.get('enrichment_blocks') if isinstance(spec.get('enrichment_blocks'), list) else []
        if enrichment:
            blocks.extend(enrichment)
        body['blocks'] = blocks
        row['body_json'] = body
        rendered: list[str] = []
        for block in blocks:
            if isinstance(block, dict):
                rendered.extend(block_text(block))
        row['body_text'] = ' '.join(rendered).strip()
        final_word_counts[slug] = len(row['body_text'].split())
        if final_word_counts[slug] < 1500:
            errors.append(f'{slug}: final content must be >=1500 words, got {final_word_counts[slug]}')

        headings = [str(block.get('text') or '') for block in blocks if isinstance(block, dict) and block.get('type') == 'heading']
        if not any(('طوارئ' in heading or 'طارئة' in heading or 'الطوارئ' in heading) for heading in headings):
            errors.append(f'{slug}: emergency/safety heading missing')

        schema.update({
            'addiction_evidence_registries': evidence_registries,
            'addiction_historical_commits': historical_commits,
            'addiction_safety_contract': safety,
            'minimum_authoritative_sources': 3,
            'final_word_count': final_word_counts[slug],
            'references_count': reference_counts[slug],
            'recovered_protocol_definition_lists': recovered_protocol_tables[slug],
            'dedupe_decision': 'retain-condition-canonical',
        })
        row['schema_json'] = schema

    if errors:
        print(json.dumps({'status': 'failed', 'errors': errors}, ensure_ascii=False, indent=2))
        raise SystemExit(1)

    payload['records_sha256'] = hashlib.sha256(stable_bytes(records)).hexdigest()
    payload.setdefault('contract', {}).update({
        'addiction_condition_contract': True,
        'minimum_final_words': 1500,
        'minimum_authoritative_references': 3,
        'historical_versions_merged': True,
        'historical_protocol_details_recovered': True,
        'individual_dosing': False,
        'home_detox_plan': False,
        'abrupt_benzodiazepine_discontinuation': False,
        'guaranteed_outcomes': False,
    })
    args.payload.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    result = {
        'status': 'passed',
        'records': len(records),
        'records_sha256': payload['records_sha256'],
        'min_final_words': min(final_word_counts.values()),
        'max_final_words': max(final_word_counts.values()),
        'min_references': min(reference_counts.values()),
        'max_references': max(reference_counts.values()),
        'protocol_definition_lists_recovered': sum(recovered_protocol_tables.values()),
        'legacy_theme_copied': False,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
