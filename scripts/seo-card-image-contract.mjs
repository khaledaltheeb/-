#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const route = await readFile('app/seo-card/route.tsx', 'utf8');
const layout = await readFile('lib/seo-card-layout.ts', 'utf8');
const seo = await readFile('lib/seo.ts', 'utf8');
const errors = [];

const requireMatch = (name, text, pattern, message) => {
  if (!pattern.test(text)) errors.push(`${name}: ${message}`);
};
const forbid = (name, text, pattern, message) => {
  if (pattern.test(text)) errors.push(`${name}: ${message}`);
};

forbid('SEO card route', route, /maxChars|candidate\.length\s*<=|title\.length\s*>/, 'character-count Arabic layout heuristics must not return.');
requireMatch('SEO card route', route, /fitSeoCardText/, 'runtime-safe auto-fit helper must be used.');
requireMatch('SEO card route', route, /assertSeoCardLayout/, 'safe-area assertion must remain active.');
requireMatch('SEO card route', route, /clipPath id="safe-text"/, 'final SVG clipping guard is required.');
requireMatch('SEO card route', route, /width="1200" height="630" viewBox="0 0 1200 630"/, 'fallback social image must stay 1200x630.');
requireMatch('SEO card route', route, /direction="rtl"/, 'Arabic RTL direction is required.');
requireMatch('SEO card route', route, /unicode-bidi="plaintext"/, 'Arabic bidi isolation is required.');
requireMatch('SEO card route', route, /Noto Sans Arabic,Tahoma,Arial,sans-serif/, 'Arabic-first font stack is required.');
requireMatch('SEO card route', route, /https:\/\/healthrenewal\.org/, 'canonical HTTPS site label must be present.');
requireMatch('SEO card route', route, /function rtlText\([\s\S]*escapeXml\(text\)/, 'all dynamic rendered text must pass through the shared XML-escaping renderer.');
requireMatch('SEO card route', route, /const titleSvg = titleFit\.lines[\s\S]*rtlText\(/, 'title lines must use the shared escaped renderer.');
requireMatch('SEO card route', route, /const contextSvg = contextFit\.lines[\s\S]*rtlText\(/, 'context lines must use the shared escaped renderer.');
requireMatch('SEO card route', route, /Cache-Control/, 'cache contract is required.');
requireMatch('SEO card route', route, /X-Content-Type-Options/, 'MIME hardening header is required.');

requireMatch('SEO card layout', layout, /estimateSeoCardTextWidth/, 'width estimation helper missing.');
requireMatch('SEO card layout', layout, /splitOversizedToken/, 'oversized single-token protection missing.');
requireMatch('SEO card layout', layout, /ellipsizeLine/, 'last-resort visual truncation missing.');
requireMatch('SEO card layout', layout, /for \(let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1\)/, 'font size must auto-fit progressively.');
requireMatch('SEO card layout', layout, /widest > maxWidth/, 'horizontal safe-bound assertion missing.');
requireMatch('SEO card layout', layout, /top < safeTop/, 'upper safe-bound assertion missing.');
requireMatch('SEO card layout', layout, /bottom > safeBottom/, 'lower safe-bound assertion missing.');
requireMatch('SEO card layout', layout, /ARABIC_MARKS/, 'Arabic combining marks must not inflate width estimates.');
requireMatch('SEO card layout', layout, /ARABIC_LETTER/, 'Arabic glyph weighting is required.');

requireMatch('SEO metadata', seo, /fallbackSocialImagePath/, 'central fallback image resolver must remain present.');
requireMatch('SEO metadata', seo, /\/seo-card\?title=/, 'pages without curated images must retain the safe central fallback.');
requireMatch('SEO metadata', seo, /usesDefaultImage \? 1200/, 'fallback metadata width must remain explicit.');
requireMatch('SEO metadata', seo, /usesDefaultImage \? 630/, 'fallback metadata height must remain explicit.');
requireMatch('SEO metadata', seo, /'max-image-preview': 'large'/, 'large image previews must remain enabled for indexable pages.');

if (errors.length) {
  console.error('SEO card image contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('SEO card image contract passed: the global 1200x630 fallback uses conservative Arabic auto-fit, oversized-token handling, XML escaping, and hard safe-area clipping without changing page routes or content.');
