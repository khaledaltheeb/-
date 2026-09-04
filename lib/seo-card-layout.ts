const ARABIC_MARKS = /[\u064B-\u065F\u0670]/u;
const ARABIC_LETTER = /[\u0600-\u06FF]/u;
const LATIN_UPPER = /[A-Z]/u;
const LATIN_LOWER = /[a-z]/u;
const DIGIT = /[0-9٠-٩]/u;
const PUNCT = /[.,،:؛;!?؟()\[\]{}'"“”«»_\-–—/\\|]/u;
const GRAPHEME_SEGMENTER = new Intl.Segmenter('ar', { granularity: 'grapheme' });

function cleanText(value: string) {
  return String(value || '').replace(/\s+/gu, ' ').trim();
}

function graphemes(value: string) {
  return [...GRAPHEME_SEGMENTER.segment(String(value || ''))].map((part) => part.segment);
}

function glyphUnits(char: string) {
  if (!char) return 0;
  if (ARABIC_MARKS.test(char)) return 0;
  if (/\s/u.test(char)) return 0.32;
  if (ARABIC_LETTER.test(char)) return 0.64;
  if (LATIN_UPPER.test(char)) return 0.68;
  if (LATIN_LOWER.test(char)) return 0.54;
  if (DIGIT.test(char)) return 0.56;
  if (PUNCT.test(char)) return 0.34;
  return 0.72;
}

export function estimateSeoCardTextWidth(value: string, fontSize: number) {
  const text = cleanText(value);
  return Array.from(text).reduce((sum, char) => sum + glyphUnits(char), 0) * fontSize;
}

function ellipsizeLine(value: string, maxWidth: number, fontSize: number) {
  const ellipsis = '…';
  let units = graphemes(cleanText(value).replace(/[،,:؛;.!؟?\-–—]+$/u, '').trim());
  while (units.length && estimateSeoCardTextWidth(`${units.join('')}${ellipsis}`, fontSize) > maxWidth) units = units.slice(0, -1);
  return units.length ? `${units.join('').trim()}${ellipsis}` : ellipsis;
}

function splitOversizedToken(token: string, maxWidth: number, fontSize: number) {
  if (estimateSeoCardTextWidth(token, fontSize) <= maxWidth) return [token];
  const chunks: string[] = [];
  let current = '';
  for (const grapheme of graphemes(token)) {
    const candidate = `${current}${grapheme}`;
    if (current && estimateSeoCardTextWidth(candidate, fontSize) > maxWidth) {
      chunks.push(current);
      current = grapheme;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

function wrapAtWidth(value: string, maxWidth: number, fontSize: number, maxLines: number) {
  const text = cleanText(value);
  if (!text) return { lines: [] as string[], truncated: false };

  const tokens = text
    .split(/\s+/u)
    .filter(Boolean)
    .flatMap((token) => splitOversizedToken(token, maxWidth, fontSize));
  const lines: string[] = [];
  let current = '';
  let consumed = 0;

  for (const token of tokens) {
    const candidate = current ? `${current} ${token}` : token;
    if (!current || estimateSeoCardTextWidth(candidate, fontSize) <= maxWidth) {
      current = candidate;
      consumed += 1;
      continue;
    }

    lines.push(current);
    if (lines.length >= maxLines) break;
    current = token;
    consumed += 1;
  }

  if (lines.length < maxLines && current) lines.push(current);
  const truncated = consumed < tokens.length || lines.length > maxLines;
  const visible = lines.slice(0, maxLines);
  if (truncated && visible.length) visible[visible.length - 1] = ellipsizeLine(visible[visible.length - 1], maxWidth, fontSize);
  return { lines: visible, truncated };
}

export type SeoCardTextLayout = {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  truncated: boolean;
};

export function fitSeoCardText(value: string, options: {
  maxWidth: number;
  maxLines: number;
  maxFontSize: number;
  minFontSize: number;
  lineHeightRatio?: number;
}) : SeoCardTextLayout {
  const { maxWidth, maxLines, maxFontSize, minFontSize, lineHeightRatio = 1.32 } = options;
  const text = cleanText(value);

  for (let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1) {
    const wrapped = wrapAtWidth(text, maxWidth, fontSize, maxLines);
    if (!wrapped.truncated) {
      return {
        lines: wrapped.lines,
        fontSize,
        lineHeight: Math.ceil(fontSize * lineHeightRatio),
        truncated: false,
      };
    }
  }

  const wrapped = wrapAtWidth(text, maxWidth, minFontSize, maxLines);
  return {
    lines: wrapped.lines,
    fontSize: minFontSize,
    lineHeight: Math.ceil(minFontSize * lineHeightRatio),
    truncated: wrapped.truncated,
  };
}

export function assertSeoCardLayout(label: string, layout: SeoCardTextLayout, options: {
  maxWidth: number;
  startY: number;
  safeTop: number;
  safeBottom: number;
}) {
  const { maxWidth, startY, safeTop, safeBottom } = options;
  const top = startY - Math.ceil(layout.fontSize * 0.82);
  const bottom = layout.lines.length
    ? startY + ((layout.lines.length - 1) * layout.lineHeight) + Math.ceil(layout.fontSize * 0.28)
    : startY;
  const widest = Math.max(0, ...layout.lines.map((line) => estimateSeoCardTextWidth(line, layout.fontSize)));

  if (widest > maxWidth) throw new Error(`${label} exceeds horizontal safe width (${Math.ceil(widest)} > ${maxWidth}).`);
  if (top < safeTop) throw new Error(`${label} crosses safe top boundary (${top} < ${safeTop}).`);
  if (bottom > safeBottom) throw new Error(`${label} crosses safe bottom boundary (${bottom} > ${safeBottom}).`);
}
