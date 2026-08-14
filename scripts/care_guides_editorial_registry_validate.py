#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "data/migration-batches/care-guides-editorial-registry-v1.json"


def main() -> int:
    payload = json.loads(REGISTRY.read_text(encoding="utf-8"))
    required_top = {"version","scope","source_repository","destination_repository","quality_policy","sectors","page_types","audiences","migration_states","required_page_fields","editorial_statuses"}
    missing = required_top - set(payload)
    if missing:
        raise SystemExit(f"missing registry keys: {sorted(missing)}")
    if payload["scope"] != "/care-guides/":
        raise SystemExit("unexpected scope")
    if payload["source_repository"] != "khaledaltheeb/healthrenewal.org":
        raise SystemExit("unexpected legacy source")
    if payload["destination_repository"] != "khaledaltheeb/-":
        raise SystemExit("unexpected destination repository")
    sectors = payload["sectors"]
    if len(sectors) < 10 or len({row["id"] for row in sectors}) != len(sectors) or len({row["label"] for row in sectors}) != len(sectors):
        raise SystemExit("sector taxonomy must contain unique ids and labels")
    required_fields = set(payload["required_page_fields"])
    must_have = {"sector","section","topic_cluster","primary_intent","primary_keyword","legacy_sources","authoritative_sources","migration_state","canonical_url","robots_index","editorial_status"}
    if not must_have.issubset(required_fields):
        raise SystemExit(f"registry page contract missing fields: {sorted(must_have-required_fields)}")
    if payload["quality_policy"].get("one_canonical_per_intent") is not True or payload["quality_policy"].get("filler_forbidden") is not True:
        raise SystemExit("quality policy weakened")
    print("care guides editorial registry v1 passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
