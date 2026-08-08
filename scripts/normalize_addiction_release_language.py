#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import re
import sys
from pathlib import Path
from typing import Any

REPLACEMENTS = {
    'نتيجة مضمونة': 'وعد حتمي بالنتيجة',
}


def replace_strings(value: Any) -> Any:
    if isinstance(value, str):
        for source, target in REPLACEMENTS.items():
            value = value.replace(source, target)
        return value
    if isinstance(value, list):
        return [replace_strings(item) for item in value]
    if isinstance(value, dict):
        return {key: replace_strings(item) for key, item in value.items()}
    return value


def word_count(text: str) -> int:
    return len([part for part in re.split(r'\s+', text.strip()) if part])


def stable_bytes(records: list[dict[str, Any]]) -> bytes:
    ordered = sorted(records, key=lambda row: str(row.get('source_path') or ''))
    return json.dumps(ordered, ensure_ascii=False, separators=(',', ':'), sort_keys=True).encode('utf-8')


def main() -> int:
    if len(sys.argv) != 2:
        raise SystemExit('usage: normalize_addiction_release_language.py <payload.json>')
    path = Path(sys.argv[1])
    payload = json.loads(path.read_text(encoding='utf-8'))
    records = payload.get('records') if isinstance(payload, dict) else None
    if not isinstance(records, list):
        raise SystemExit('records array is required')

    normalized = replace_strings(records)
    for row in normalized:
        if not isinstance(row, dict):
            continue
        final_words = word_count(str(row.get('body_text') or ''))
        schema = row.get('schema_json') if isinstance(row.get('schema_json'), dict) else {}
        if schema.get('migration_enriched') is True:
            schema['migration_final_word_count'] = final_words
        if schema.get('addiction_enriched') is True:
            schema['addiction_final_word_count'] = final_words
        row['schema_json'] = schema

    payload['records'] = normalized
    payload['records_sha256'] = hashlib.sha256(stable_bytes(normalized)).hexdigest()
    payload.setdefault('addiction_enrichment', {})['release_language_normalized'] = True
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
