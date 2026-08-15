#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
BATCH_DIR = ROOT / "data" / "encyclopedia" / "batches"
EXPECTED_BATCHES = 25
EXPECTED_RECORDS = 50
MIN_WORDS = 1100
MIN_H2 = 7
MIN_H3 = 2
MIN_FAQ = 8
MIN_REFS = 4
MIN_REF_DOMAINS = 2
MIN_SEARCH_QUESTIONS = 8
MAX_BODY_JACCARD = 0.18
MAX_REPEATED_LONG_SENTENCE_RATIO = 0.15

FILLER_PHRASES = (
    "هذه النقطة مأخوذة من المحتوى الأصلي للصفحة",
    "عند تطبيق هذه النقطة على حياتك",
    "ما الذي يريد الباحث معرفته فعلًا",
    "تمت إضافة هذا النص للوصول إلى عدد الكلمات",
    "فقرة إضافية لتحسين السيو",
)
UNSAFE_PROMISES = (
    "شفاء مضمون",
    "علاج مضمون",
    "يعالج نهائيًا",
    "يضمن الشفاء",
    "نتيجة مضمونة",
)
DOSE_RE = re.compile(r"(?:\b\d+(?:[.,]\d+)?\s*(?:mg|mcg|g)\b|\d+(?:[.,]\d+)?\s*(?:ملغ|مجم|ميكروغرام))", re.I)
ARABIC_WORD_RE = re.compile(r"[\u0600-\u06FF]+(?:[\u0600-\u06FF\u0640'-]*[\u0600-\u06FF])?")
TOKEN_RE = re.compile(r"[\u0600-\u06FFA-Za-z0-9]+")
SENTENCE_SPLIT_RE = re.compile(r"(?<=[.!؟])\s+|\n+")


def normalize(text: str) -> str:
    text = text.lower().replace("ـ", "")
    text = re.sub(r"[ًٌٍَُِّْـ]", "", text)
    text = re.sub(r"[^\u0600-\u06FFA-Za-z0-9 ]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def tokens(text: str) -> list[str]:
    return TOKEN_RE.findall(normalize(text))


def ngrams(text: str, n: int = 5) -> set[tuple[str, ...]]:
    values = tokens(text)
    return {tuple(values[i : i + n]) for i in range(max(0, len(values) - n + 1))}


def jaccard(a: set[tuple[str, ...]], b: set[tuple[str, ...]]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def body_parts(body: object) -> tuple[list[str], list[str], list[str], list[dict]]:
    paragraphs: list[str] = []
    h2: list[str] = []
    h3: list[str] = []
    faqs: list[dict] = []
    if not isinstance(body, dict) or not isinstance(body.get("blocks"), list):
        return paragraphs, h2, h3, faqs
    for block in body["blocks"]:
        if not isinstance(block, dict):
            continue
        kind = block.get("type")
        if kind == "paragraph" and isinstance(block.get("text"), str):
            paragraphs.append(block["text"].strip())
        elif kind == "heading" and isinstance(block.get("text"), str):
            if block.get("level") == 2:
                h2.append(block["text"].strip())
            elif block.get("level") == 3:
                h3.append(block["text"].strip())
        elif kind == "list" and isinstance(block.get("items"), list):
            paragraphs.extend(str(x).strip() for x in block["items"] if str(x).strip())
        elif kind == "faq" and isinstance(block.get("items"), list):
            faqs.extend(x for x in block["items"] if isinstance(x, dict))
    return paragraphs, h2, h3, faqs


def body_text(body: object) -> str:
    paragraphs, h2, h3, faqs = body_parts(body)
    faq_text = [f"{x.get('question', '')} {x.get('answer', '')}" for x in faqs]
    return "\n".join([*h2, *h3, *paragraphs, *faq_text])


def has_heading(headings: list[str], needles: tuple[str, ...]) -> bool:
    joined = " | ".join(normalize(h) for h in headings)
    return any(normalize(n) in joined for n in needles)


def long_sentences(text: str) -> list[str]:
    result: list[str] = []
    for sentence in SENTENCE_SPLIT_RE.split(text):
        n = normalize(sentence)
        if len(tokens(n)) >= 18:
            result.append(n)
    return result


def main() -> int:
    files = sorted(BATCH_DIR.glob("*.json"))
    errors: list[str] = []
    if len(files) != EXPECTED_BATCHES:
        errors.append(f"expected {EXPECTED_BATCHES} batch files, found {len(files)}")

    records: list[dict] = []
    for file in files:
        payload = json.loads(file.read_text(encoding="utf-8"))
        rows = payload.get("records") if isinstance(payload, dict) else None
        if not isinstance(rows, list):
            errors.append(f"{file.name}: missing records[]")
            continue
        for row in rows:
            if isinstance(row, dict):
                row = dict(row)
                row["_file"] = file.name
                records.append(row)
            else:
                errors.append(f"{file.name}: non-object record")

    if len(records) != EXPECTED_RECORDS:
        errors.append(f"expected {EXPECTED_RECORDS} records, found {len(records)}")

    slug_seen: set[str] = set()
    primary_seen: dict[str, str] = {}
    long_sentence_owners: defaultdict[str, set[str]] = defaultdict(set)
    paragraph_owners: defaultdict[str, set[str]] = defaultdict(set)
    body_grams: dict[str, set[tuple[str, ...]]] = {}
    body_words: dict[str, int] = {}
    faq_counts: dict[str, int] = {}
    ref_counts: dict[str, int] = {}

    for row in records:
        slug = str(row.get("slug") or "").strip()
        prefix = f"{row.get('_file')}:{slug or '<missing>'}"
        if slug in slug_seen:
            errors.append(f"{prefix}: duplicate slug")
        slug_seen.add(slug)

        primary = normalize(str(row.get("primary_keyword") or ""))
        if not primary:
            errors.append(f"{prefix}: missing primary_keyword")
        elif primary in primary_seen:
            errors.append(f"{prefix}: primary keyword duplicates {primary_seen[primary]}")
        else:
            primary_seen[primary] = slug

        body = row.get("body_json")
        paragraphs, h2, h3, faqs = body_parts(body)
        text = body_text(body)
        body_grams[slug] = ngrams(text)
        words = len(ARABIC_WORD_RE.findall(text))
        body_words[slug] = words
        faq_counts[slug] = len(faqs)

        if words < MIN_WORDS:
            errors.append(f"{prefix}: only {words} Arabic words (<{MIN_WORDS})")
        if len(h2) < MIN_H2:
            errors.append(f"{prefix}: only {len(h2)} H2 headings (<{MIN_H2})")
        if len(h3) < MIN_H3:
            errors.append(f"{prefix}: only {len(h3)} H3 headings (<{MIN_H3})")
        if len(faqs) < MIN_FAQ:
            errors.append(f"{prefix}: only {len(faqs)} FAQs (<{MIN_FAQ})")

        required_heading_groups = {
            "definition": ("ما هو", "ما هي", "التعريف"),
            "symptoms": ("الأعراض", "العلامات", "كيف يظهر"),
            "causes": ("الأسباب", "عوامل الخطورة", "العوامل المرتبطة"),
            "assessment": ("التقييم", "التشخيص"),
            "differential": ("التشخيص التفريقي", "الفرق بين", "ما الحالات التي قد تشبه", "ما الذي قد يشبه"),
            "treatment": ("العلاج", "الدعم", "التدخلات"),
            "help": ("طلب المساعدة", "متى أطلب", "متى نطلب", "الرعاية العاجلة", "الطوارئ"),
        }
        all_headings = [*h2, *h3]
        for label, needles in required_heading_groups.items():
            if not has_heading(all_headings, needles):
                errors.append(f"{prefix}: missing topic-specific {label} heading")

        references = row.get("references_json") if isinstance(row.get("references_json"), list) else []
        ref_counts[slug] = len(references)
        if len(references) < MIN_REFS:
            errors.append(f"{prefix}: only {len(references)} references (<{MIN_REFS})")
        domains = set()
        for ref in references:
            if isinstance(ref, dict):
                url = str(ref.get("url") or "")
                if url.startswith("https://"):
                    domains.add((urlparse(url).hostname or "").lower().removeprefix("www."))
        if len(domains) < MIN_REF_DOMAINS:
            errors.append(f"{prefix}: only {len(domains)} independent reference domains (<{MIN_REF_DOMAINS})")

        schema = row.get("schema_json") if isinstance(row.get("schema_json"), dict) else {}
        questions = schema.get("search_intent_questions") if isinstance(schema.get("search_intent_questions"), list) else []
        if len(questions) < MIN_SEARCH_QUESTIONS:
            errors.append(f"{prefix}: only {len(questions)} search-intent questions (<{MIN_SEARCH_QUESTIONS})")

        intro = " ".join(paragraphs[:2] + h2[:2])
        if primary and primary not in normalize(intro):
            errors.append(f"{prefix}: primary keyword is not established in the opening definition context")

        lower_text = normalize(text)
        for phrase in FILLER_PHRASES:
            if normalize(phrase) in lower_text:
                errors.append(f"{prefix}: forbidden filler phrase detected: {phrase}")
        for phrase in UNSAFE_PROMISES:
            if normalize(phrase) in lower_text:
                errors.append(f"{prefix}: unsafe treatment promise detected: {phrase}")
        if DOSE_RE.search(text):
            errors.append(f"{prefix}: numeric medication dosing detected")

        for paragraph in paragraphs:
            p = normalize(paragraph)
            if len(tokens(p)) >= 35:
                paragraph_owners[p].add(slug)
        for sentence in long_sentences(text):
            long_sentence_owners[sentence].add(slug)

    duplicate_paragraphs = [(text, owners) for text, owners in paragraph_owners.items() if len(owners) > 1]
    for text, owners in duplicate_paragraphs[:20]:
        errors.append(f"exact long paragraph reused by {sorted(owners)}: {text[:120]}...")

    repeated_sentence_set = {text for text, owners in long_sentence_owners.items() if len(owners) > 1}
    sentence_ratios: dict[str, float] = {}
    for row in records:
        slug = str(row.get("slug") or "")
        sentences = long_sentences(body_text(row.get("body_json")))
        ratio = (sum(1 for s in sentences if s in repeated_sentence_set) / len(sentences)) if sentences else 0.0
        sentence_ratios[slug] = ratio
        if ratio > MAX_REPEATED_LONG_SENTENCE_RATIO:
            errors.append(f"{slug}: repeated long-sentence ratio {ratio:.3f} exceeds {MAX_REPEATED_LONG_SENTENCE_RATIO:.2f}")

    max_pair = ("", "", 0.0)
    slugs = sorted(body_grams)
    for i, left in enumerate(slugs):
        for right in slugs[i + 1 :]:
            score = jaccard(body_grams[left], body_grams[right])
            if score > max_pair[2]:
                max_pair = (left, right, score)
            if score > MAX_BODY_JACCARD:
                errors.append(f"semantic overlap too high: {left} vs {right} = {score:.3f} > {MAX_BODY_JACCARD:.2f}")

    report = {
        "status": "failed" if errors else "passed",
        "batches": len(files),
        "records": len(records),
        "minimum_arabic_words": min(body_words.values()) if body_words else 0,
        "maximum_arabic_words": max(body_words.values()) if body_words else 0,
        "average_arabic_words": round(sum(body_words.values()) / len(body_words), 2) if body_words else 0,
        "faq_total": sum(faq_counts.values()),
        "reference_total": sum(ref_counts.values()),
        "duplicate_long_paragraphs": len(duplicate_paragraphs),
        "max_repeated_long_sentence_ratio": round(max(sentence_ratios.values(), default=0.0), 4),
        "max_pairwise_5gram_jaccard": {
            "left": max_pair[0], "right": max_pair[1], "score": round(max_pair[2], 5)
        },
        "error_count": len(errors),
        "errors": errors[:100],
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
