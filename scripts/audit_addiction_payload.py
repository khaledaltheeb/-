#!/usr/bin/env python3
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

SENTENCE_SPLIT = re.compile(r'[.!؟]+\s*')
DOSE_PATTERN = re.compile(r'(?<!\w)\d+(?:[.,]\d+)?\s*(?:mg|mcg|ملغ|ملغم|ميكروغرام)(?!\w)', re.I)
FORBIDDEN_PHRASES = (
    'خطة ديتوكس منزلية',
    'ديتوكس منزلي آمن',
    'أوقف البنزوديازيبين فجأة',
    'إيقاف البنزوديازيبين فجأة آمن',
    'نتيجة مضمونة',
    'شفاء مضمون',
)


def words(text: str) -> int:
    return len([part for part in re.split(r'\s+', text.strip()) if part])


def faq_count(body_json: object) -> int:
    if not isinstance(body_json, dict): return 0
    blocks = body_json.get('blocks')
    if not isinstance(blocks, list): return 0
    total = 0
    for block in blocks:
        if isinstance(block, dict) and block.get('type') == 'faq' and isinstance(block.get('items'), list):
            total += len([item for item in block['items'] if isinstance(item, dict) and str(item.get('question') or '').strip() and str(item.get('answer') or '').strip()])
    return total


def long_sentences(text: str) -> set[str]:
    return {s.strip() for s in SENTENCE_SPLIT.split(text) if len(s.strip()) >= 60}


def main() -> int:
    if len(sys.argv) != 2:
        raise SystemExit('usage: audit_addiction_payload.py <payload.json>')
    path = Path(sys.argv[1])
    payload = json.loads(path.read_text(encoding='utf-8'))
    records = payload.get('records') if isinstance(payload, dict) else None
    if not isinstance(records, list):
        raise SystemExit('records array is required')
    if len(records) != 16:
        raise SystemExit(f'expected 16 addiction core records, found {len(records)}')

    sentence_sets = {str(r.get('slug')): long_sentences(str(r.get('body_text') or '')) for r in records if isinstance(r, dict)}
    failures: list[str] = []
    print('slug\twords\trefs\tfaq\tdup%\tseo/meta')
    for row in records:
        if not isinstance(row, dict):
            failures.append('non-object record'); continue
        slug = str(row.get('slug') or '')
        text = str(row.get('body_text') or '')
        wc = words(text)
        refs = row.get('references_json') if isinstance(row.get('references_json'), list) else []
        faq = faq_count(row.get('body_json'))
        own = sentence_sets.get(slug, set())
        repeated = sum(1 for sentence in own if sum(1 for other_slug, other in sentence_sets.items() if other_slug != slug and sentence in other) >= 4)
        dup_pct = (repeated / len(own) * 100) if own else 0.0
        seo_title = str(row.get('seo_title') or '')
        meta = str(row.get('seo_description') or '')
        canonical = str(row.get('canonical_url') or '')
        image = str(row.get('featured_image_url') or '')
        alt = str(row.get('featured_image_alt') or '')
        disclaimer = str(row.get('medical_disclaimer') or '')
        print(f'{slug}\t{wc}\t{len(refs)}\t{faq}\t{dup_pct:.2f}\t{len(seo_title)}/{len(meta)}')
        if wc < 1500: failures.append(f'{slug}: {wc} words < 1500')
        if len(refs) < 4: failures.append(f'{slug}: references < 4')
        if faq < 6: failures.append(f'{slug}: FAQ < 6')
        if len(seo_title) > 47: failures.append(f'{slug}: SEO title > 47 chars')
        if not 150 <= len(meta) <= 160: failures.append(f'{slug}: meta length {len(meta)} not 150..160')
        if not canonical.startswith('/addiction/'): failures.append(f'{slug}: invalid canonical')
        if not image.startswith('/addiction/images/'): failures.append(f'{slug}: missing addiction image')
        if len(alt) < 20: failures.append(f'{slug}: image alt too short')
        if not disclaimer: failures.append(f'{slug}: medical disclaimer missing')
        if dup_pct > 15.0: failures.append(f'{slug}: duplicate long sentence ratio {dup_pct:.2f}% > 15%')
        if DOSE_PATTERN.search(text): failures.append(f'{slug}: individualized dose-like expression detected')
        lowered = text.casefold()
        for phrase in FORBIDDEN_PHRASES:
            if phrase.casefold() in lowered: failures.append(f'{slug}: forbidden unsafe claim: {phrase}')

    if failures:
        print('\nADDICTION QUALITY GATE FAILED', file=sys.stderr)
        for failure in failures: print(f'- {failure}', file=sys.stderr)
        return 1
    print('\nADDICTION QUALITY GATE PASSED')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
