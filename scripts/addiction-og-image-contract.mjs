#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const component = await readFile('components/addiction-og-image.tsx', 'utf8');
const route = await readFile('app/addiction/images/[slug]/route.tsx', 'utf8');
const sharedLayout = await readFile('lib/seo-card-layout.ts', 'utf8');
const errors = [];

const requireMatch = (name, text, pattern, message) => {
  if (!pattern.test(text)) errors.push(`${name}: ${message}`);
};
const forbid = (name, text, pattern, message) => {
  if (pattern.test(text)) errors.push(`${name}: ${message}`);
};

forbid('Addiction OG component', component, /maxChars|candidate\.length\s*<=|safeTitle\.length\s*>|title\.length\s*>/, 'character-count image layout heuristics must stay removed.');
requireMatch('Addiction OG component', component, /fitSeoCardText/, 'shared runtime-safe text auto-fit helper must be used.');
requireMatch('Addiction OG component', component, /assertSeoCardLayout/, 'hard safe-area assertion must remain active.');
requireMatch('Addiction OG component', component, /const TITLE_MAX_WIDTH = 980/, 'explicit 980px title width contract missing.');
requireMatch('Addiction OG component', component, /const TITLE_SAFE_TOP = 205/, 'title top safe boundary missing.');
requireMatch('Addiction OG component', component, /const TITLE_SAFE_BOTTOM = 470/, 'title bottom safe boundary missing.');
requireMatch('Addiction OG component', component, /maxLines:\s*3/, 'addiction image title must remain capped at three rendered lines.');
requireMatch('Addiction OG component', component, /maxFontSize:\s*50/, 'maximum title size contract missing.');
requireMatch('Addiction OG component', component, /minFontSize:\s*34/, 'minimum title size contract missing.');
requireMatch('Addiction OG component', component, /clipPath id="addiction-title-safe"/, 'final SVG clipping guard missing.');
requireMatch('Addiction OG component', component, /width="1200" height="675" viewBox="0 0 1200 675"/, 'addiction social image must remain native 1200x675 16:9.');
requireMatch('Addiction OG component', component, /Noto Sans Arabic,Tahoma,Arial,sans-serif/, 'Arabic-first font stack is required.');
requireMatch('Addiction OG component', component, /text-anchor="start" direction="rtl" unicode-bidi="plaintext"/, 'RTL text must anchor from the RTL start edge so its x coordinate remains the right boundary.');
forbid('Addiction OG component', component, /text-anchor="end" direction="rtl"/, 'RTL text must never use end anchoring because it can extend beyond the right safe edge.');
requireMatch('Addiction OG component', component, /text-anchor="start" direction="ltr" unicode-bidi="plaintext"/, 'LTR titles must anchor from their left start edge.');
requireMatch('Addiction OG component', component, /escapeXml\(line\)/, 'dynamic title lines must remain XML escaped.');
requireMatch('Addiction OG component', component, /Content-Type': 'image\/svg\+xml; charset=utf-8'/, 'SVG MIME contract missing.');
requireMatch('Addiction OG component', component, /X-Content-Type-Options': 'nosniff'/, 'MIME hardening header missing.');

requireMatch('Shared layout', sharedLayout, /splitOversizedToken/, 'shared layout must retain oversized-token handling.');
requireMatch('Shared layout', sharedLayout, /ellipsizeLine/, 'shared layout must retain last-resort ellipsis.');
requireMatch('Shared layout', sharedLayout, /widest > maxWidth/, 'shared horizontal overflow assertion missing.');
requireMatch('Shared layout', sharedLayout, /bottom > safeBottom/, 'shared vertical overflow assertion missing.');

requireMatch('Addiction image route', route, /import \{ addictionOgImage \}/, 'published addiction image route must keep using the hardened component.');
requireMatch('Addiction image route', route, /\.eq\('status', 'published'\)/, 'image route must remain restricted to published records.');
requireMatch('Addiction image route', route, /return addictionOgImage\(record\?\.title \|\| 'الإدمان والتعافي'\)/, 'safe fallback title contract missing.');

if (errors.length) {
  console.error('Addiction OG image contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Addiction OG image contract passed: the 1200x675 image route uses shared Arabic/Latin auto-fit, correct RTL/LTR anchoring, oversized-token protection, XML escaping, hard safe-area assertions, and clipping without changing published content routes.');
