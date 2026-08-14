#!/usr/bin/env python3

import argparse
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BATCH_DIR = ROOT / "data" / "encyclopedia" / "batches"
ARABIC_WORD_RE = re.compile(r"[\u0600-\u06FF]+")

# Editorial coverage families, not diagnostic codes. They collapse historical
# spelling variants so the report remains useful as the encyclopedia grows.
CLASSIFICATION_ALIASES = {
    "anxiety-disorder": "anxiety-disorders",
    "anxiety-disorders": "anxiety-disorders",
    "bipolar-and-related-disorder": "mood-and-depressive-disorders",
    "depressive-disorder": "mood-and-depressive-disorders",
    "mood-disorders": "mood-and-depressive-disorders",
    "premenstrual-dysphoric-disorder": "mood-and-depressive-disorders",
    "disorders-specifically-associated-with-stress": "disorders-specifically-associated-with-stress",
    "dissociative-disorder": "dissociative-disorders",
    "dissociative-disorders": "dissociative-disorders",
    "feeding-and-eating-disorder": "feeding-or-eating-disorders",
    "feeding-or-eating-disorders": "feeding-or-eating-disorders",
    "impulse-control-disorders": "impulse-control-disorders",
    "neurodevelopmental-disorder": "neurodevelopmental-disorders",
    "neurodevelopmental-disorders": "neurodevelopmental-disorders",
    "obsessive-compulsive-and-related-disorder": "obsessive-compulsive-and-related-disorders",
    "obsessive-compulsive-or-related-disorders": "obsessive-compulsive-and-related-disorders",
    "personality-disorder": "personality-disorders",
    "personality-disorders": "personality-disorders",
    "schizophrenia-or-other-primary-psychotic-disorders": "schizophrenia-spectrum-and-other-psychotic-disorders",
    "schizophrenia-spectrum-and-other-psychotic-disorder": "schizophrenia-spectrum-and-other-psychotic-disorders",
    "schizophrenia-spectrum-and-other-psychotic-disorders": "schizophrenia-spectrum-and-other-psychotic-disorders",
    "somatic-symptom-and-bodily-distress": "somatic-symptom-and-bodily-distress",
}

# The first two historical batches predate the classification field. Keep the
# original clinical copy immutable and map their four known slugs explicitly.
SLUG_CLASSIFICATION_FALLBACKS = {
    "generalized-anxiety-disorder": "anxiety-disorders",
    "panic-disorder": "anxiety-disorders",
    "obsessive-compulsive-disorder": "obsessive-compulsive-and-related-disorders",
    "post-traumatic-stress-disorder": "disorders-specifically-associated-with-stress",
}

PUBLISHER_ALIASES = {
    "National Institute for Health and Care Excellence (NICE)": "NICE",
    "U.S. National Library of Medicine - MedlinePlus": "MedlinePlus",
    "MedlinePlus / U.S. National Library of Medicine": "MedlinePlus",
}

AUTHORITY_TIER_ALIASES = {
    "primary": "primary",
    "secondary": "secondary",
    "scholarly": "secondary",
}


def text(value):
    return value.strip() if isinstance(value, str) else ""


def blocks(record):
    body = record.get("body_json") if isinstance(record, dict) else None
    return body.get("blocks", []) if isinstance(body, dict) and isinstance(body.get("blocks"), list) else []


def word_count(record):
    values = []
    for block in blocks(record):
        if not isinstance(block, dict):
            continue
        values.append(text(block.get("text")))
        if isinstance(block.get("items"), list):
            for item in block["items"]:
                if isinstance(item, str):
                    values.append(item)
                elif isinstance(item, dict):
                    values.extend([text(item.get("question")), text(item.get("answer"))])
    return len(ARABIC_WORD_RE.findall(" ".join(values)))


def faq_count(record):
    total = 0
    for block in blocks(record):
        if isinstance(block, dict) and block.get("type") == "faq" and isinstance(block.get("items"), list):
            total += len(block["items"])
    return total


def classification(record):
    schema = record.get("schema_json") if isinstance(record, dict) else None
    raw = text(schema.get("classification")) if isinstance(schema, dict) else ""
    if raw:
        return CLASSIFICATION_ALIASES.get(raw, raw)
    slug = text(record.get("slug")) if isinstance(record, dict) else ""
    return SLUG_CLASSIFICATION_FALLBACKS.get(slug, "unclassified")


def source_tier(reference):
    if not isinstance(reference, dict):
        return "unknown"
    raw = text(reference.get("authority_tier")) or "unknown"
    return AUTHORITY_TIER_ALIASES.get(raw, raw)


def publisher_name(reference):
    if not isinstance(reference, dict):
        return "unknown"
    raw = text(reference.get("publisher")) or "unknown"
    return PUBLISHER_ALIASES.get(raw, raw)


def load_records():
    files = sorted(BATCH_DIR.glob("*.json"))
    records = []
    for file in files:
        payload = json.loads(file.read_text(encoding="utf-8"))
        for record in payload.get("records", []):
            records.append((file.name, record))
    return files, records


def build_report():
    files, rows = load_records()
    slugs = [text(record.get("slug")) for _, record in rows]
    duplicate_slugs = sorted(slug for slug, count in Counter(slugs).items() if slug and count > 1)

    classifications = Counter()
    publishers = Counter()
    authority_tiers = Counter()
    reference_counts = []
    faq_counts = []
    word_counts = []
    unclassified_slugs = []
    draft_count = 0
    noindex_count = 0
    canonical_ok = 0

    for _, record in rows:
        family = classification(record)
        classifications[family] += 1
        if family == "unclassified":
            unclassified_slugs.append(text(record.get("slug")) or "<missing-slug>")

        references = record.get("references_json") if isinstance(record.get("references_json"), list) else []
        reference_counts.append(len(references))
        for reference in references:
            if not isinstance(reference, dict):
                continue
            publishers[publisher_name(reference)] += 1
            authority_tiers[source_tier(reference)] += 1

        faq_counts.append(faq_count(record))
        word_counts.append(word_count(record))
        if record.get("status") == "draft":
            draft_count += 1
        if record.get("robots_index") is False:
            noindex_count += 1
        slug = text(record.get("slug"))
        if text(record.get("canonical_url")) == f"/encyclopedia/{slug}/":
            canonical_ok += 1

    total = len(rows)
    return {
        "batch_files": len(files),
        "draft_records": total,
        "draft_status_count": draft_count,
        "noindex_count": noindex_count,
        "canonical_ok_count": canonical_ok,
        "duplicate_slugs": duplicate_slugs,
        "unclassified_slugs": sorted(unclassified_slugs),
        "classification_counts": dict(sorted(classifications.items())),
        "reference_total": sum(reference_counts),
        "reference_average": round(sum(reference_counts) / total, 2) if total else 0,
        "faq_total": sum(faq_counts),
        "faq_average": round(sum(faq_counts) / total, 2) if total else 0,
        "arabic_word_total": sum(word_counts),
        "arabic_word_average": round(sum(word_counts) / total, 2) if total else 0,
        "arabic_word_min": min(word_counts) if word_counts else 0,
        "arabic_word_max": max(word_counts) if word_counts else 0,
        "authority_tiers": dict(sorted(authority_tiers.items())),
        "top_publishers": publishers.most_common(20),
    }


def markdown(report):
    lines = [
        "# Psychological Encyclopedia Coverage Report",
        "",
        f"- Batch files: **{report['batch_files']}**",
        f"- Draft records: **{report['draft_records']}**",
        f"- Draft/noindex/canonical-safe: **{report['draft_status_count']} / {report['noindex_count']} / {report['canonical_ok_count']}**",
        f"- Arabic words: **{report['arabic_word_total']} total**, **{report['arabic_word_average']} average**, range **{report['arabic_word_min']}–{report['arabic_word_max']}**",
        f"- FAQs: **{report['faq_total']} total**, **{report['faq_average']} average/page**",
        f"- References: **{report['reference_total']} total**, **{report['reference_average']} average/page**",
        f"- Duplicate slugs: **{len(report['duplicate_slugs'])}**",
        f"- Unclassified slugs: **{len(report['unclassified_slugs'])}**",
        "",
        "## Classification coverage",
        "",
    ]
    for key, value in report["classification_counts"].items():
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Evidence authority tiers", ""])
    for key, value in report["authority_tiers"].items():
        lines.append(f"- `{key}`: {value}")
    lines.extend(["", "## Most-used publishers", ""])
    for publisher, count in report["top_publishers"]:
        lines.append(f"- {publisher}: {count}")
    if report["duplicate_slugs"]:
        lines.extend(["", "## Duplicate slugs", ""])
        lines.extend(f"- `{slug}`" for slug in report["duplicate_slugs"])
    if report["unclassified_slugs"]:
        lines.extend(["", "## Unclassified slugs", ""])
        lines.extend(f"- `{slug}`" for slug in report["unclassified_slugs"])
    return "\n".join(lines) + "\n"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true", help="Print machine-readable JSON")
    parser.add_argument("--write", help="Write markdown report to a repository-relative path")
    args = parser.parse_args()

    report = build_report()
    if report["duplicate_slugs"]:
        raise SystemExit(f"Duplicate encyclopedia slugs: {', '.join(report['duplicate_slugs'])}")
    if report["unclassified_slugs"]:
        raise SystemExit(f"Unclassified encyclopedia slugs: {', '.join(report['unclassified_slugs'])}")
    if report["draft_records"] != report["draft_status_count"] or report["draft_records"] != report["noindex_count"]:
        raise SystemExit("Coverage report found a non-draft or indexable batch record")
    if report["draft_records"] != report["canonical_ok_count"]:
        raise SystemExit("Coverage report found a canonical mismatch")

    output = json.dumps(report, ensure_ascii=False, indent=2) if args.json else markdown(report)
    if args.write:
        target = (ROOT / args.write).resolve()
        if ROOT not in target.parents:
            raise SystemExit("--write target must stay inside the repository")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(output, encoding="utf-8")
        print(f"Wrote {target.relative_to(ROOT)}")
    else:
        print(output)


if __name__ == "__main__":
    main()
