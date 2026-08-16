#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
import tempfile
from pathlib import Path

from validate_legacy_transfer_payload import norm_records, validate


def main() -> int:
    record = {
        'content_type': 'article',
        'slug': 'thin-legacy-example',
        'source_path': '/legacy/thin-example/',
        'title': 'مثال تاريخي قصير',
        'body_json': {'blocks': [{'type': 'paragraph', 'text': 'محتوى تاريخي قصير يجب حفظه كما هو.'}]},
        'body_text': 'محتوى تاريخي قصير يجب حفظه كما هو.',
        'canonical_url': '/legacy/thin-example/',
        'status': 'draft',
        'robots_index': False,
        'seo_description': '',
        'references_json': [],
        'schema_json': {
            'legacy_source_sha256': hashlib.sha256(b'legacy-source').hexdigest(),
        },
    }
    records = [record]
    payload = {
        'record_count': 1,
        'records': records,
        'records_sha256': hashlib.sha256(norm_records(records)).hexdigest(),
    }

    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / 'payload.json'
        path.write_text(json.dumps(payload, ensure_ascii=False), encoding='utf-8')
        result = validate(path)

    assert result['status'] == 'passed'
    assert result['thin_record_count'] == 1
    assert result['missing_reference_count'] == 1
    assert result['short_seo_description_count'] == 1
    assert result['error_count'] == 0
    print('legacy transfer gate test passed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
