#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ALLOWED_HOSTS = {'healthrenewal.org', 'www.healthrenewal.org'}
IMAGE_SUFFIXES = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif'}


class MediaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.images: list[dict[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): (value or '').strip() for key, value in attrs}
        if tag.lower() == 'img':
            src = values.get('src', '')
            if src:
                self.images.append({'src': src, 'alt': values.get('alt', '')})
            srcset = values.get('srcset', '')
            for candidate in srcset.split(','):
                url = candidate.strip().split(' ', 1)[0].strip()
                if url:
                    self.images.append({'src': url, 'alt': values.get('alt', '')})
        elif tag.lower() == 'source':
            srcset = values.get('srcset', '')
            for candidate in srcset.split(','):
                url = candidate.strip().split(' ', 1)[0].strip()
                if url:
                    self.images.append({'src': url, 'alt': ''})


def normalize_source(value: str) -> str | None:
    raw = value.strip()
    if not raw or raw.startswith(('data:', 'blob:')):
        return None
    parsed = urlparse(raw)
    if parsed.scheme in {'http', 'https'}:
        if parsed.netloc.lower() not in ALLOWED_HOSTS:
            return None
        path = parsed.path
    elif parsed.scheme:
        return None
    else:
        path = raw.split('?', 1)[0].split('#', 1)[0]
    path = unquote(path)
    if not path.startswith('/') or '..' in Path(path).parts:
        return None
    if Path(path).suffix.lower() not in IMAGE_SUFFIXES:
        return None
    return path


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('production_root', type=Path)
    parser.add_argument('--public-root', type=Path, default=Path('public'))
    parser.add_argument('--manifest', type=Path, default=Path('artifacts/legacy-media-manifest.json'))
    args = parser.parse_args()

    root = args.production_root.resolve()
    public_root = args.public_root.resolve()
    if not root.is_dir():
        raise SystemExit(f'production root not found: {root}')
    public_root.mkdir(parents=True, exist_ok=True)

    refs: dict[str, dict[str, object]] = {}
    for page in sorted(root.rglob('*.html')):
        html = page.read_text(encoding='utf-8', errors='ignore')
        p = MediaParser()
        p.feed(html)
        for item in p.images:
            path = normalize_source(item['src'])
            if not path:
                continue
            row = refs.setdefault(path, {'references': 0, 'alts': set(), 'source_pages': set()})
            row['references'] = int(row['references']) + 1
            alt = item.get('alt', '').strip()
            if alt:
                cast_alts = row['alts']
                assert isinstance(cast_alts, set)
                cast_alts.add(alt)
            pages = row['source_pages']
            assert isinstance(pages, set)
            pages.add(page.relative_to(root).as_posix())

    copied: list[dict[str, object]] = []
    missing: list[str] = []
    for web_path, meta in sorted(refs.items()):
        source = root / web_path.lstrip('/')
        if not source.is_file():
            missing.append(web_path)
            continue
        target = public_root / web_path.lstrip('/')
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        alts = sorted(meta['alts']) if isinstance(meta['alts'], set) else []
        pages = sorted(meta['source_pages']) if isinstance(meta['source_pages'], set) else []
        copied.append({
            'path': web_path,
            'bytes': source.stat().st_size,
            'sha256': sha256(source),
            'reference_count': meta['references'],
            'alt_values': alts,
            'missing_alt': not bool(alts),
            'source_pages': pages,
        })

    summary = {
        'unique_image_references': len(refs),
        'copied_images': len(copied),
        'missing_images': len(missing),
        'total_bytes': sum(int(row['bytes']) for row in copied),
        'missing_alt_images': sum(1 for row in copied if row['missing_alt']),
        'missing_paths': missing,
    }
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    args.manifest.write_text(json.dumps({'summary': summary, 'images': copied}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(summary, ensure_ascii=False, indent=2))

    if len(refs) < 390:
        raise SystemExit(f'legacy production media inventory unexpectedly small: {len(refs)}')
    if missing:
        raise SystemExit(f'legacy production image files missing: {len(missing)}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
