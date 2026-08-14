#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import re
from itertools import combinations
from pathlib import Path
from typing import Any
from urllib.parse import urlparse

ARABIC_DIACRITICS = re.compile(r'[\u064b-\u065f\u0670]')
WORD_RE = re.compile(r'[\u0600-\u06ffA-Za-z0-9]+')
WHITESPACE_RE = re.compile(r'\s+')
SHINGLE_SIZE = 5
MAX_BODY_SHINGLE_JACCARD = 0.35
MIN_LONG_PARAGRAPH_CHARS = 120
MIN_SOURCE_DOMAINS_PER_PAGE = 3


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise SystemExit(f'expected JSON object: {path}')
    return value


def normalize_text(value: Any) -> str:
    text = str(value or '')
    text = ARABIC_DIACRITICS.sub('', text)
    text = text.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا').replace('ى', 'ي')
    return WHITESPACE_RE.sub(' ', text.casefold()).strip()


def words(value: str) -> list[str]:
    return [normalize_text(item) for item in WORD_RE.findall(value) if normalize_text(item)]


def shingles(value: str, size: int = SHINGLE_SIZE) -> set[tuple[str, ...]]:
    tokens = words(value)
    if len(tokens) < size:
        return set()
    return {tuple(tokens[i:i + size]) for i in range(len(tokens) - size + 1)}


def jaccard(left: set[tuple[str, ...]], right: set[tuple[str, ...]]) -> float:
    if not left or not right:
        return 0.0
    union = left | right
    return len(left & right) / len(union) if union else 0.0


def paragraph_texts(body_json: Any) -> list[str]:
    if not isinstance(body_json, dict):
        return []
    blocks = body_json.get('blocks')
    if not isinstance(blocks, list):
        return []
    out: list[str] = []
    for block in blocks:
        if not isinstance(block, dict) or block.get('type') != 'paragraph':
            continue
        text = WHITESPACE_RE.sub(' ', str(block.get('text') or '')).strip()
        if len(text) >= MIN_LONG_PARAGRAPH_CHARS:
            out.append(text)
    return out


def faq_questions(body_json: Any) -> list[str]:
    if not isinstance(body_json, dict):
        return []
    blocks = body_json.get('blocks')
    if not isinstance(blocks, list):
        return []
    out: list[str] = []
    for block in blocks:
        if not isinstance(block, dict) or block.get('type') != 'faq':
            continue
        items = block.get('items') if isinstance(block.get('items'), list) else []
        for item in items:
            if not isinstance(item, dict):
                continue
            question = str(item.get('question') or '').strip()
            if question:
                out.append(question)
    return out


def source_domains(references: Any) -> set[str]:
    if not isinstance(references, list):
        return set()
    domains: set[str] = set()
    for ref in references:
        if not isinstance(ref, dict):
            continue
        url = str(ref.get('url') or '').strip()
        if not url.startswith('https://'):
            continue
        host = urlparse(url).hostname or ''
        host = host.lower().removeprefix('www.')
        if host:
            domains.add(host)
    return domains


def source_sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def generated_record(path: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    payload = load(path)
    records = payload.get('records')
    if not isinstance(records, list) or len(records) != 1 or not isinstance(records[0], dict):
        raise SystemExit(f'generated payload must contain one record: {path}')
    return payload, records[0]


def draft_route_slug(draft_record: dict[str, Any]) -> str:
    source_slug = str(draft_record.get('slug') or '').strip()
    if not source_slug.startswith('encyclopedia-'):
        return ''
    return source_slug.removeprefix('encyclopedia-')


def validate(drafts_dir: Path, generated_dir: Path, manifest_path: Path | None = None) -> dict[str, Any]:
    draft_paths = sorted(drafts_dir.glob('*-v1.json'))
    generated_paths = sorted(generated_dir.glob('*-v1.json'))
    errors: list[str] = []

    def fail(message: str) -> None:
        errors.append(message)

    if not draft_paths:
        fail('portfolio must contain at least one source draft')
    draft_names = {path.name for path in draft_paths}
    generated_names = {path.name for path in generated_paths}
    if draft_names != generated_names:
        missing = sorted(draft_names - generated_names)
        orphan = sorted(generated_names - draft_names)
        fail(f'source/generated portfolio mismatch; missing_generated={missing} orphan_generated={orphan}')

    pages: list[dict[str, Any]] = []
    seen_slugs: set[str] = set()
    seen_canonicals: set[str] = set()
    seen_titles: set[str] = set()
    seen_seo_titles: set[str] = set()
    seen_seo_descriptions: set[str] = set()
    seen_primary_keywords: set[str] = set()
    faq_owner: dict[str, str] = {}
    paragraph_owner: dict[str, str] = {}
    aggregate_domains: set[str] = set()

    for draft_path in draft_paths:
        generated_path = generated_dir / draft_path.name
        draft_payload = load(draft_path)
        draft_record = draft_payload.get('record') if isinstance(draft_payload.get('record'), dict) else {}
        if not generated_path.exists():
            continue
        generated_payload, generated = generated_record(generated_path)
        source_slug = str(draft_record.get('slug') or '').strip()
        route_slug = draft_route_slug(draft_record)
        label = route_slug or source_slug or draft_path.name

        if not route_slug:
            fail(f'{label}: source draft must map from encyclopedia-<route-slug>')
        if route_slug in seen_slugs:
            fail(f'{label}: duplicate route slug')
        seen_slugs.add(route_slug)
        if generated.get('slug') != route_slug:
            fail(f'{label}: generated record slug must equal bare route slug')
        canonical = str(draft_record.get('canonical_url') or '').strip()
        if canonical != f'/encyclopedia/{route_slug}/':
            fail(f'{label}: source canonical does not match unified encyclopedia route')
        if generated.get('canonical_url') != canonical:
            fail(f'{label}: generated canonical mismatch')
        if canonical in seen_canonicals:
            fail(f'{label}: duplicate canonical URL {canonical}')
        seen_canonicals.add(canonical)
        title = normalize_text(draft_record.get('title'))
        if title in seen_titles:
            fail(f'{label}: duplicate visible title')
        seen_titles.add(title)
        seo_title = normalize_text(draft_record.get('seo_title'))
        if seo_title in seen_seo_titles:
            fail(f'{label}: duplicate SEO title')
        seen_seo_titles.add(seo_title)
        seo_description = normalize_text(draft_record.get('seo_description'))
        if seo_description in seen_seo_descriptions:
            fail(f'{label}: duplicate SEO description')
        seen_seo_descriptions.add(seo_description)
        primary = normalize_text(draft_record.get('primary_keyword'))
        if primary in seen_primary_keywords:
            fail(f'{label}: duplicate primary keyword')
        seen_primary_keywords.add(primary)

        if draft_payload.get('status') != 'scientific_review' or draft_payload.get('publication_ready') is not False:
            fail(f'{label}: source draft must remain scientific_review and publication_ready=false')
        if generated.get('status') != 'scientific_review':
            fail(f'{label}: generated status must remain scientific_review')
        if generated.get('robots_index') is not False or generated.get('robots_follow') is not False:
            fail(f'{label}: generated review payload must remain noindex,nofollow')
        if generated.get('published_at') is not None:
            fail(f'{label}: generated review payload must not have published_at')
        if generated_payload.get('version') != 2:
            fail(f'{label}: generated payload must use unified materializer version 2')

        expected_sha = source_sha(draft_path)
        actual_sha = str(generated_payload.get('source_draft_sha256') or '')
        if expected_sha != actual_sha:
            fail(f'{label}: generated payload does not match current source draft SHA-256')
        schema = generated.get('schema_json') if isinstance(generated.get('schema_json'), dict) else {}
        evidence = schema.get('evidence') if isinstance(schema.get('evidence'), dict) else {}
        if evidence.get('source_draft_sha256') != expected_sha:
            fail(f'{label}: embedded evidence SHA-256 does not match current source draft')
        if evidence.get('source_review_slug') != source_slug:
            fail(f'{label}: generated evidence lost source review slug mapping')
        if schema.get('publication_ready') is not False:
            fail(f'{label}: schema must remain publication_ready=false')
        if evidence.get('review_status') != 'scientific-review-required':
            fail(f'{label}: scientific review requirement missing')
        if evidence.get('external_review_completed') is not False:
            fail(f'{label}: external review must not be claimed')

        body_text = str(generated.get('body_text') or '').strip()
        body_words = len(WORD_RE.findall(body_text))
        if body_words < 1500:
            fail(f'{label}: body content below 1500 words/tokens')
        body_shingles = shingles(body_text)

        refs = generated.get('references_json') if isinstance(generated.get('references_json'), list) else []
        domains = source_domains(refs)
        aggregate_domains.update(domains)
        if len(refs) < 6:
            fail(f'{label}: fewer than 6 references')
        if len(domains) < MIN_SOURCE_DOMAINS_PER_PAGE:
            fail(f'{label}: fewer than {MIN_SOURCE_DOMAINS_PER_PAGE} independent source domains')

        body_json = generated.get('body_json') if isinstance(generated.get('body_json'), dict) else {}
        faqs = faq_questions(body_json)
        if len(faqs) < 8:
            fail(f'{label}: fewer than 8 FAQ questions')
        for question in faqs:
            norm = normalize_text(question)
            owner = faq_owner.get(norm)
            if owner and owner != label:
                fail(f'{label}: exact FAQ question duplicates {owner}: {question}')
            faq_owner[norm] = label

        for paragraph in paragraph_texts(body_json):
            norm = normalize_text(paragraph)
            owner = paragraph_owner.get(norm)
            if owner and owner != label:
                fail(f'{label}: long paragraph duplicates {owner}')
            paragraph_owner[norm] = label

        pages.append({
            'slug': route_slug,
            'source_review_slug': source_slug,
            'route_slug': route_slug,
            'title': draft_record.get('title'),
            'canonical_url': canonical,
            'primary_keyword': draft_record.get('primary_keyword'),
            'status': generated.get('status'),
            'robots_index': generated.get('robots_index'),
            'body_words': body_words,
            'body_shingles': body_shingles,
            'faq_count': len(faqs),
            'reference_count': len(refs),
            'source_domains': sorted(domains),
            'source_domain_count': len(domains),
            'source_draft_sha256': expected_sha,
            'generated_records_sha256': generated_payload.get('records_sha256'),
        })

    pairwise: list[dict[str, Any]] = []
    max_similarity = 0.0
    for left, right in combinations(pages, 2):
        similarity = jaccard(left['body_shingles'], right['body_shingles'])
        max_similarity = max(max_similarity, similarity)
        pairwise.append({
            'left': left['route_slug'],
            'right': right['route_slug'],
            'body_5gram_jaccard': round(similarity, 5),
        })
        if similarity > MAX_BODY_SHINGLE_JACCARD:
            fail(
                f"content similarity too high: {left['route_slug']} vs {right['route_slug']} "
                f'5-gram Jaccard={similarity:.3f} > {MAX_BODY_SHINGLE_JACCARD:.2f}'
            )

    if len(pages) >= 5 and len(aggregate_domains) < 6:
        fail('portfolio source diversity is too narrow: fewer than 6 unique source domains across five or more pages')

    for page in pages:
        page.pop('body_shingles', None)

    result = {
        'version': 2,
        'status': 'failed' if errors else 'passed',
        'source_draft_count': len(draft_paths),
        'generated_review_count': len(generated_paths),
        'unique_canonical_count': len(seen_canonicals),
        'aggregate_source_domain_count': len(aggregate_domains),
        'aggregate_source_domains': sorted(aggregate_domains),
        'max_pairwise_body_5gram_jaccard': round(max_similarity, 5),
        'similarity_threshold': MAX_BODY_SHINGLE_JACCARD,
        'publication_ready': False,
        'scientific_review_required': True,
        'unified_encyclopedia_route_slugs': True,
        'pages': pages,
        'pairwise_similarity': pairwise,
        'errors': errors,
    }

    if manifest_path is not None:
        manifest_path.parent.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit(1)
    return result


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--drafts-dir', type=Path, default=Path('data/encyclopedia/drafts'))
    parser.add_argument('--generated-dir', type=Path, default=Path('data/encyclopedia/generated/review-drafts'))
    parser.add_argument('--manifest', type=Path)
    args = parser.parse_args()
    validate(args.drafts_dir, args.generated_dir, args.manifest)
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
