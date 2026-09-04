import { spawnSync } from 'node:child_process';

const widthCache = new Map();
let resolvedFontFile = '';

function run(cmd, args) {
  const result = spawnSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error || result.status !== 0) {
    throw new Error(`${cmd} failed: ${result.stderr || result.error?.message || 'unknown error'}`);
  }
  return result.stdout.trim();
}

export function resolveArabicFontFile() {
  if (resolvedFontFile) return resolvedFontFile;
  resolvedFontFile = run('fc-match', ['-f', '%{file}', 'Noto Sans Arabic']);
  if (!resolvedFontFile) throw new Error('Unable to resolve Noto Sans Arabic font file.');
  return resolvedFontFile;
}

export function measureArabicTextWidth(value, fontSize) {
  const text = String(value || '').replace(/\s+/gu, ' ').trim();
  if (!text) return 0;
  const key = `${fontSize}\u0000${text}`;
  const cached = widthCache.get(key);
  if (cached !== undefined) return cached;

  const fontFile = resolveArabicFontFile();
  const output = run('convert', [
    '-background', 'none',
    '-font', fontFile,
    '-pointsize', String(fontSize),
    `label:${text}`,
    '-format', '%w',
    'info:',
  ]);
  const width = Number.parseInt(output, 10);
  if (!Number.isFinite(width) || width < 0) throw new Error(`Unable to measure Arabic text width: ${text}`);
  widthCache.set(key, width);
  return width;
}

function words(value) {
  return String(value || '').trim().split(/\s+/u).filter(Boolean);
}

export function splitOversizedTokenByPixels(token, { maxWidth, fontSize }) {
  const clean = String(token || '').trim();
  if (!clean || measureArabicTextWidth(clean, fontSize) <= maxWidth) return clean ? [clean] : [];

  const chunks = [];
  let current = '';
  for (const char of Array.from(clean)) {
    const candidate = `${current}${char}`;
    if (current && measureArabicTextWidth(candidate, fontSize) > maxWidth) {
      chunks.push(current);
      current = char;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function wrapTextByPixels(value, { maxWidth, fontSize }) {
  const lines = [];
  let line = '';
  const tokens = words(value).flatMap((word) => splitOversizedTokenByPixels(word, { maxWidth, fontSize }));

  for (const word of tokens) {
    const candidate = line ? `${line} ${word}` : word;
    if (!line || measureArabicTextWidth(candidate, fontSize) <= maxWidth) {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = word;
  }
  if (line) lines.push(line);
  return lines;
}

function ellipsizeToWidth(value, maxWidth, fontSize) {
  const ellipsis = '…';
  let text = String(value || '').replace(/[.…]+$/u, '').trim();
  if (!text) return ellipsis;
  while (text && measureArabicTextWidth(`${text}${ellipsis}`, fontSize) > maxWidth) {
    const parts = words(text);
    if (parts.length > 1) {
      parts.pop();
      text = parts.join(' ');
    } else {
      text = Array.from(text).slice(0, -1).join('').trim();
    }
  }
  return `${text}${ellipsis}`;
}

export function fitArabicTextBlock(value, {
  maxWidth,
  maxLines,
  maxFontSize,
  minFontSize,
  maxHeight = Number.POSITIVE_INFINITY,
  lineHeightRatio = 1.22,
}) {
  const clean = String(value || '').replace(/\s+/gu, ' ').trim();
  if (!clean) return { lines: [], fontSize: maxFontSize, lineHeight: Math.ceil(maxFontSize * lineHeightRatio), truncated: false };

  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
    const lines = wrapTextByPixels(clean, { maxWidth, fontSize });
    const lineHeight = Math.ceil(fontSize * lineHeightRatio);
    const blockHeight = lines.length ? fontSize + (lines.length - 1) * lineHeight : 0;
    const widest = lines.reduce((max, line) => Math.max(max, measureArabicTextWidth(line, fontSize)), 0);
    if (lines.length <= maxLines && blockHeight <= maxHeight && widest <= maxWidth) {
      return { lines, fontSize, lineHeight, truncated: false };
    }
  }

  const fontSize = minFontSize;
  const lineHeight = Math.ceil(fontSize * lineHeightRatio);
  const wrapped = wrapTextByPixels(clean, { maxWidth, fontSize });
  const lines = wrapped.slice(0, maxLines);
  if (!lines.length) return { lines: [], fontSize, lineHeight, truncated: false };
  if (wrapped.length > maxLines || measureArabicTextWidth(lines.at(-1), fontSize) > maxWidth) {
    lines[lines.length - 1] = ellipsizeToWidth(lines.at(-1), maxWidth, fontSize);
  }
  return { lines, fontSize, lineHeight, truncated: wrapped.length > maxLines };
}

export function assertTextBlockBounds(surface, {
  lines,
  fontSize,
  lineHeight,
  startY,
  safeTop,
  safeBottom,
  maxWidth,
}) {
  if (!lines.length) return;
  const top = startY - fontSize;
  const bottom = startY + (lines.length - 1) * lineHeight + Math.ceil(fontSize * 0.35);
  const widest = lines.reduce((max, line) => Math.max(max, measureArabicTextWidth(line, fontSize)), 0);
  if (top < safeTop) throw new Error(`${surface} text crosses the safe top boundary (${top} < ${safeTop}).`);
  if (bottom > safeBottom) throw new Error(`${surface} text crosses the safe bottom boundary (${bottom} > ${safeBottom}).`);
  if (widest > maxWidth) throw new Error(`${surface} text crosses the safe horizontal boundary (${widest} > ${maxWidth}).`);
}

export function clearArabicTextMeasureCache() {
  widthCache.clear();
}
