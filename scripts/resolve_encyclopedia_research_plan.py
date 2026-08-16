#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def load(path: Path) -> dict[str, Any]:
    value = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(value, dict):
        raise SystemExit(f'expected JSON object: {path}')
    return value


def route_slug(draft_path: Path) -> str:
    payload = load(draft_path)
    record = payload.get('record') if isinstance(payload.get('record'), dict) else {}
    slug = str(record.get('slug') or '').strip()
    if not slug.startswith('encyclopedia-'):
        raise SystemExit(f'{draft_path}: draft record slug must start with encyclopedia-')
    route = slug.removeprefix('encyclopedia-').strip()
    if not route:
        raise SystemExit(f'{draft_path}: empty route slug')
    return route


def plan_contains(path: Path, slug: str) -> bool:
    payload = load(path)
    rows = payload.get('records')
    if not isinstance(rows, list):
        raise SystemExit(f'{path}: missing records[]')
    matches = [row for row in rows if isinstance(row, dict) and str(row.get('slug') or '').strip() == slug]
    if len(matches) > 1:
        raise SystemExit(f'{path}: duplicate research record for {slug}')
    return len(matches) == 1


def resolve(draft_path: Path, plans_dir: Path) -> Path:
    slug = route_slug(draft_path)
    candidates = sorted(plans_dir.glob('batch-*-source-plan.json'))
    if not candidates:
        raise SystemExit(f'no research plans found under {plans_dir}')
    owners = [path for path in candidates if plan_contains(path, slug)]
    if len(owners) != 1:
        listed = ', '.join(str(path) for path in owners) or 'none'
        raise SystemExit(f'{slug}: expected exactly one research-plan owner, found {len(owners)} ({listed})')
    return owners[0]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('draft', type=Path)
    parser.add_argument('--plans-dir', type=Path, default=Path('data/encyclopedia/research'))
    args = parser.parse_args()
    print(resolve(args.draft, args.plans_dir).as_posix())
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
